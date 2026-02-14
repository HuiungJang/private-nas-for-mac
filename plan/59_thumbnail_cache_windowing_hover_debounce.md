# Plan 59 - Thumbnail Cache + Large List Windowing + Hover Debounce

## Goal
썸네일/대용량 목록 성능을 3차로 개선한다.

## Scope
1. Thumbnail memory cache
   - 동일 미디어 path 재요청 시 fetch 중복 억제
2. Large list render windowing-lite
   - 파일 수가 많을 때 초기 렌더를 제한하고 스크롤로 점진 렌더
3. Video hover debounce
   - hover 즉시 재생 대신 짧은 지연 후 재생

## Design
- `thumbnailCache` 유틸(Map 기반 promise cache + TTL)
- `FileThumbnail`에서 cache 경유 fetch
- `FileTable`에서 초기 렌더 개수 제한 + scroll-bottom 배치 확장
- video hover 120~180ms debounce

## Review
- 과도 설계 방지: 외부 라이브러리 없이 최소 구조
- 유지보수: 기존 컴포넌트 내부 책임 유지
- 성능: 중복 fetch/대량 DOM 렌더 비용 완화
- 사이드이펙트: 파일 선택/컨텍스트/drag-drop 동작 유지

## Tests
- frontend build
- 수동:
  - 동일 폴더 재진입 시 썸네일 로드 체감 개선
  - 대량 파일 폴더에서 스크롤 시 점진 로드
  - video hover 시 지연 재생 확인
