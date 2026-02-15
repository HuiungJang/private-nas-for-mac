# Plan 86 - Issue #190 VPN proxy healthcheck standardization

## Goal
- VPN 경유 검증을 `nas-vpn-proxy` 기준으로 표준화하고 wg-easy 컨테이너 내부 도구(curl) 의존을 제거한다.

## Scope
- `scripts/check_vpn_proxy.sh` 추가
  - nas-vpn-proxy에서 `http://127.0.0.1/` 200
  - nas-vpn-proxy에서 `http://127.0.0.1/api/admin/system/health` 403(unauth) 또는 200(auth) 허용
- `docs/vpn_operations_runbook.md`에 검증 커맨드 추가

## Tests
- `bash scripts/check_vpn_proxy.sh`
- `docker compose up -d --build`
