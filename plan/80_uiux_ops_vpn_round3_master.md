# Plan 80 - OPS/VPN Round3 (3 issues)

## Goal
1) backend에서 시스템/권한제한 폴더를 기본 제외하여 경고/잡음 및 UX를 개선
2) DDNS를 통해 WG_HOST를 고정(운영 가이드 + 구성 지원)
3) 외부 직접 노출을 최소화: NAS 웹을 VPN( wg0 )을 통해서만 접근 가능하도록 프록시 경로 제공

## Execution
- 각 항목을 별도 Issue로 분리
- 각 Issue: plan -> 구현 -> build/test -> PR -> CI -> merge

## Verification
- backend list 시 `.Spotlight-V100` 등으로 인한 WARN 감소 확인
- DDNS 문서/가이드 검증(예시 제공)
- VPN 경유 접속 경로: VPN 클라이언트에서 `http://10.8.0.1` 접근 가능
- host 공개 포트 최소화: frontend host bind는 localhost로 복귀, 외부는 UDP 51820만 필요
