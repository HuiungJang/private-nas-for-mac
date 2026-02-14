# Plan 82 - Issue #181 DDNS + WG_HOST pinning

## Goal
- 공인 IP 변동에도 원격 접속이 유지되도록 DDNS 기반으로 `WG_HOST`를 고정한다.

## Scope
- DuckDNS / Cloudflare 중 1개(또는 2개) 예시 제공
- `.env` 설정 가이드 (`WG_HOST=<ddns-domain>`)
- NEXT 공유기 기준: UDP 51820 포워딩 + DDNS 업데이트 체크
- 운영 문서(`docs/vpn_operations_runbook.md`, wiki OPS) 업데이트

## Non-Goal
- 토큰/키를 저장소에 포함
- 자동화 서비스 기본 활성화(옵션으로 안내)

## Tests
- 문서 내용 점검
