# Plan 57 - Thumbnail UX/Performance Round 2

## Goal
썸네일 기능 2차 고도화: 로딩 skeleton, 지연 로딩(뷰포트 진입 시 fetch), 동영상 hover 미리보기.

## Scope
1. FileThumbnail 로딩 skeleton 표시
2. IntersectionObserver 기반 lazy fetch
3. video 썸네일 hover 시 자동 재생(무음/loop), leave 시 정지

## Non-Goal
- 가상 스크롤 도입
- 백엔드 API 변경

## Review
- 구현 복잡도: 컴포넌트 내부 상태로 제한
- 유지보수: 기존 FileThumbnail 단일 책임 유지
- 성능: 화면 밖 썸네일 fetch 억제
- 보안: 기존 Bearer 인증/endpoint 재사용

## Tests
- frontend build
- 수동: 최초 로딩 skeleton, 스크롤 시 점진 로딩, 영상 hover play 확인
