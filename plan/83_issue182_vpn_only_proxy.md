# Plan 83 - Issue #182 VPN-only proxy for NAS web

## Goal
- NAS 웹 UI를 VPN(wg0) 경유로만 접근 가능하도록 구성하고, host 직접 노출을 최소화한다.

## Design
- `nas-frontend`는 host에서 `127.0.0.1:80`로만 바인딩(로컬 전용)
- `nas-vpn-proxy`(nginx) 컨테이너를 추가하여 `network_mode: service:wg-easy`로 wg-easy 네임스페이스(wg0)에서 80 리슨
- VPN 클라이언트는 `http://10.8.0.1`로 접속
- Proxy 라우팅:
  - `/api/*` -> `nas-backend:8080`
  - 그 외 -> `nas-frontend:80`

## Validation
- host에서 0.0.0.0:80 미노출 확인
- `docker exec nas-vpn curl http://127.0.0.1` (proxy) 200 확인
- 기존 로컬 개발은 `http://127.0.0.1/` 유지
