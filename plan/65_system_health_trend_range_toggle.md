# Plan 65 - System Health Trend Range Toggle

## Goal
System Health mini trend의 조회 범위를 사용자가 전환할 수 있게 확장한다.

## Scope
- Trend range toggle 추가: 2m / 10m
- polling 5초 기준으로 샘플 개수 매핑
  - 2m = 24 samples
  - 10m = 120 samples
- sparkline/표시 로직은 선택된 범위 기준으로 렌더

## Non-Goal
- backend API 변경
- 차트 라이브러리 도입

## Tests
- frontend build
- 수동: 토글 전환 시 trend 길이/표시가 즉시 바뀌는지 확인
