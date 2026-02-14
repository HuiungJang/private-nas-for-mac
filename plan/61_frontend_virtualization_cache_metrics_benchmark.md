# Plan 61 - True Virtualization + Thumbnail Cache Metrics + Large Folder Benchmark

## Goal
파일 브라우저 대용량 성능 개선 4차 라운드.

## Scope
1. true virtualization 도입 (`@tanstack/react-virtual`)
   - 최소 1개 핵심 뷰(Desktop list/table)에 적용
2. thumbnail cache hit/miss 계측
   - frontend 메모리 캐시의 hit/miss 카운터 노출
3. 대용량 폴더 benchmark 시나리오 문서화
   - 반복 측정 가능한 실행 절차 제공

## Non-Goal
- backend API 변경
- 전 뷰(모바일/그리드/테이블) 동시 완전 전환

## Design
- `@tanstack/react-virtual` 추가
- `FileTable` desktop list에서 virtual row 렌더
- `thumbnailCache`에 hit/miss 카운터 + accessor 함수
- `docs/perf/large_folder_benchmark.md` 추가

## Review
- 과도성 점검: 우선 hotspot 뷰만 virtualization 적용
- 유지보수: 기존 DnD/selection 흐름 보존
- 성능: DOM row 수를 뷰포트 근처로 제한
- 사이드이펙트: 목록 선택/드래그 동작 회귀 점검

## Tests
- `frontend npm ci && npm run build`
- 수동: 대용량 폴더에서 스크롤 성능 및 DnD/선택 동작 확인
