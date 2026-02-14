# Plan 63 - System Health UI: Performance Metrics Exposure

## Goal
백엔드에서 추가한 성능 지표(preview cache/audit p95)를 Admin System Health 화면에 표시한다.

## Scope
1. `SystemHealth` frontend 타입 확장
2. `SystemHealthWidget`에 성능 지표 카드 2개 추가
   - Preview Cache Hit Ratio
   - Audit Logs Query P95

## Non-Goal
- 백엔드 API 변경
- 새로운 차트 라이브러리 도입

## Review
- 과도성 방지: 기존 카드 UI 재사용
- 유지보수: 타입/표시 로직만 최소 변경
- 가독성: 퍼센트/건수/ms 단위 명확히 표기
- 사이드이펙트: 기존 System Health 카드 동작 불변

## Tests
- frontend build
- 수동 확인: Admin > System Health에서 신규 지표 카드 노출
