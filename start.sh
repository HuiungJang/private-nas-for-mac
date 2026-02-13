#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_info() { echo -e "${BLUE}$1${NC}"; }
print_ok() { echo -e "${GREEN}$1${NC}"; }
print_err() { echo -e "${RED}$1${NC}"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    print_err "Error: required command not found: $1"
    exit 1
  fi
}

ensure_env_file() {
  if [[ -f .env ]]; then
    print_ok ".env exists, skipping interactive setup."
    return
  fi

  print_info "Creating .env file..."

  local default_host
  default_host=$(curl -s ifconfig.me || echo "localhost")

  read -r -p "Enter your Public IP/Hostname for VPN [${default_host}]: " wg_host
  wg_host=${wg_host:-$default_host}

  read -r -p "Enter VPN Admin Password [admin123]: " wg_password
  wg_password=${wg_password:-admin123}

  print_info "Generating WireGuard admin password hash..."
  raw_hash=$(docker run --rm --entrypoint node ghcr.io/wg-easy/wg-easy \
    -e 'console.log(require("bcryptjs").hashSync(process.argv[1], 10))' "$wg_password")
  wg_password_hash=$(echo "$raw_hash" | sed 's/\$/\$\$/g')

  local default_volumes
  if [[ "$OSTYPE" == darwin* ]]; then
    default_volumes="/Volumes"
  else
    default_volumes="/mnt"
  fi

  read -r -p "Enter Host Path to share [${default_volumes}]: " host_volumes_path
  host_volumes_path=${host_volumes_path:-$default_volumes}

  read -r -p "Enter bootstrap admin password [change_me_now]: " bootstrap_admin_password
  bootstrap_admin_password=${bootstrap_admin_password:-change_me_now}

  local generated_jwt_secret
  generated_jwt_secret=$(openssl rand -base64 32)
  read -r -p "Enter JWT_SECRET (Base64, >=32 decoded bytes) [auto-generated]: " jwt_secret
  jwt_secret=${jwt_secret:-$generated_jwt_secret}

  cat > .env <<EOF
WG_HOST=${wg_host}
WG_PASSWORD_HASH=${wg_password_hash}
HOST_VOLUMES_PATH=${host_volumes_path}
APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD=${bootstrap_admin_password}
JWT_SECRET=${jwt_secret}
TRUSTED_PROXY_SUBNETS=127.0.0.1/32,::1/128
EOF

  print_ok ".env created."
}

get_env_value() {
  local key="$1"
  awk -F'=' -v k="$key" '$1==k{print substr($0, index($0,"=")+1)}' .env | tail -n1
}

validate_jwt_secret() {
  local jwt_secret="$1"

  if [[ -z "$jwt_secret" ]]; then
    print_err "JWT_SECRET is missing in .env"
    return 1
  fi

  if ! printf '%s' "$jwt_secret" | openssl base64 -d -A >/tmp/nas_jwt_secret.bin 2>/dev/null; then
    print_err "JWT_SECRET must be valid Base64"
    return 1
  fi

  local decoded_len
  decoded_len=$(wc -c </tmp/nas_jwt_secret.bin | tr -d ' ')
  rm -f /tmp/nas_jwt_secret.bin

  if [[ "$decoded_len" -lt 32 ]]; then
    print_err "JWT_SECRET decode length must be at least 32 bytes (current: ${decoded_len})"
    return 1
  fi

  return 0
}

preflight_security_checks() {
  print_info "Running security preflight checks..."

  local wg_password_hash bootstrap_admin_password jwt_secret
  wg_password_hash=$(get_env_value "WG_PASSWORD_HASH")
  bootstrap_admin_password=$(get_env_value "APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD")
  jwt_secret=$(get_env_value "JWT_SECRET")

  if [[ -z "$wg_password_hash" ]]; then
    print_err "WG_PASSWORD_HASH is missing in .env"
    exit 1
  fi

  if [[ -z "$bootstrap_admin_password" ]]; then
    print_err "APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD is missing in .env"
    exit 1
  fi

  if ! validate_jwt_secret "$jwt_secret"; then
    exit 1
  fi

  print_ok "Security preflight checks passed."
}

main() {
  print_info "=== Private NAS Setup ==="

  require_cmd docker
  require_cmd docker-compose
  require_cmd openssl

  ensure_env_file
  preflight_security_checks

  print_info "Starting services..."
  docker-compose up -d --build

  print_ok "=== Setup Complete ==="
  echo "Frontend: http://localhost"
  echo "VPN Admin: http://localhost:51821"
  echo "WireGuard Port: 51820/udp"
}

main "$@"
