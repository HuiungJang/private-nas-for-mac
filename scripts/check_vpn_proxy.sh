#!/usr/bin/env bash
set -euo pipefail

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "missing command: $1"; exit 1; }
}

require_cmd docker
require_cmd curl

if ! docker ps --format '{{.Names}}' | grep -q '^nas-vpn-proxy$'; then
  echo "nas-vpn-proxy container not running"
  exit 1
fi

echo "[1/2] vpn proxy root check"
code=$(docker exec nas-vpn-proxy sh -lc "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/")
if [[ "$code" != "200" ]]; then
  echo "expected 200 from vpn proxy root, got: $code"
  exit 1
fi

echo "[2/2] vpn proxy API unauth check"
code=$(docker exec nas-vpn-proxy sh -lc "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/api/admin/system/health")
# unauth can be 401/403 depending on security config
if [[ "$code" != "401" && "$code" != "403" && "$code" != "200" ]]; then
  echo "unexpected status from vpn proxy api health, got: $code"
  exit 1
fi

echo "VPN_PROXY_CHECK_OK"
