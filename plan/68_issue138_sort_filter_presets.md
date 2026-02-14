# Plan 68 - Issue #138 Sort/Filter Presets

## Goal
정렬/필터 프리셋의 반복 사용성을 높인다.

## Scope
- sort/filter 상태 localStorage 유지
- 프리셋 quick chips(Recent/Large/Media/Documents)
- 현재 적용 프리셋 강조 표시

## Non-Goal
- backend API 변경
- 고급 쿼리 DSL 추가

## Tests
- frontend build
- 수동: 페이지 새로고침 후 sort/filter 유지 확인
