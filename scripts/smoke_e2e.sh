#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "missing command: $1"; exit 1; }
}

require_cmd docker
require_cmd docker-compose
require_cmd curl
require_cmd python3

if [[ ! -f .env ]]; then
  echo ".env not found. copy from .env.example first."
  exit 1
fi

get_env() {
  local key="$1"
  awk -F'=' -v k="$key" '$1==k{print substr($0,index($0,"=")+1)}' .env | tail -n1
}

BOOTSTRAP_PW="$(get_env APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD)"
if [[ -z "$BOOTSTRAP_PW" ]]; then
  echo "APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD missing in .env"
  exit 1
fi

echo "[1/6] build & start services"
docker-compose up -d --build nas-db nas-backend nas-frontend

echo "[2/6] wait for healthy containers"
wait_healthy() {
  local name="$1"
  for _ in {1..60}; do
    st=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$name" 2>/dev/null || true)
    if [[ "$st" == "healthy" || "$st" == "running" ]]; then
      echo "  - $name: $st"
      return 0
    fi
    sleep 2
  done
  echo "container not healthy: $name"
  docker logs --tail 200 "$name" || true
  exit 1
}

wait_healthy nas-db
wait_healthy nas-backend
wait_healthy nas-frontend

echo "[3/6] health endpoint check"
health=$(docker exec nas-backend sh -lc "curl -fsS http://127.0.0.1:8080/actuator/health")
python3 - <<'PY' "$health"
import json,sys
obj=json.loads(sys.argv[1])
assert obj.get('status')=='UP', obj
print('  - backend /actuator/health status=UP')
PY

echo "[4/6] login failure check"
code=$(curl -s -o /tmp/login_fail.json -w "%{http_code}" -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"wrong-password"}' \
  http://127.0.0.1/api/auth/login)
if [[ "$code" == "200" ]]; then
  echo "expected login failure but got 200"
  cat /tmp/login_fail.json
  exit 1
fi

echo "[5/6] login success + protected API check"
ok=$(curl -fsS -H 'Content-Type: application/json' \
  -d "{\"username\":\"admin\",\"password\":\"$BOOTSTRAP_PW\"}" \
  http://127.0.0.1/api/auth/login)

token=$(python3 - <<'PY' "$ok"
import json,sys
obj=json.loads(sys.argv[1])
print(obj.get('token',''))
PY
)
must_change=$(python3 - <<'PY' "$ok"
import json,sys
obj=json.loads(sys.argv[1])
print(str(obj.get('mustChangePassword', False)).lower())
PY
)

if [[ -z "$token" ]]; then
  echo "login success response missing token"
  echo "$ok"
  exit 1
fi

auth_code=$(curl -s -o /tmp/admin_list.json -w "%{http_code}" -H "Authorization: Bearer $token" \
  "http://127.0.0.1/api/admin/files/list?path=/")
if [[ "$must_change" == "true" ]]; then
  # first-login password change policy can block this endpoint
  if [[ "$auth_code" != "403" && "$auth_code" != "200" ]]; then
    echo "unexpected status for protected API with mustChangePassword=true: $auth_code"
    cat /tmp/admin_list.json
    exit 1
  fi
else
  if [[ "$auth_code" != "200" ]]; then
    echo "expected 200 for protected API, got: $auth_code"
    cat /tmp/admin_list.json
    exit 1
  fi
fi

echo "[6/6] all discovered API routes reachability check"
routes_json=$(python3 scripts/discover_api_routes.py)
python3 - <<'PY' "$routes_json" "$token"
import json
import subprocess
import sys

routes = json.loads(sys.argv[1])
token = sys.argv[2]

skip_exact = {
    ("POST", "/api/auth/login"),
    ("POST", "/api/auth/change-password"),
}

allowed = {200, 201, 204, 400, 401, 403, 405, 415, 422}

for r in routes:
    method = r["method"]
    path = r["path"]
    if (method, path) in skip_exact:
        continue

    call_path = path.replace("{userId}", "1")
    url = f"http://127.0.0.1{call_path}"

    cmd = [
        "curl", "-sS", "-o", "/tmp/route_check_body.json", "-w", "%{http_code}",
        "-X", method,
        "-H", f"Authorization: Bearer {token}",
        "-H", "Content-Type: application/json",
        url,
    ]

    if method in {"POST", "PUT", "PATCH", "DELETE"}:
        cmd.extend(["-d", "{}"])

    status = subprocess.check_output(cmd, text=True).strip()
    try:
        code = int(status)
    except ValueError:
        print(f"route check non-http status: {method} {path} -> {status}")
        sys.exit(1)

    if code == 404 or code >= 500 or code not in allowed:
        body = ""
        try:
            body = subprocess.check_output(["cat", "/tmp/route_check_body.json"], text=True)
        except Exception:
            pass
        print(f"route check failed: {method} {path} -> HTTP {code}")
        if body:
            print(body)
        sys.exit(1)

print(f"  - routes checked: {len(routes)}")
print("SMOKE_E2E_OK")
PY
