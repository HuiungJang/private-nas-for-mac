# Plan 55 - Photo/Video Thumbnail Preview

## Goal
파일 브라우저에서 사진/동영상 파일에 대해 썸네일 미리보기를 제공한다.

## Scope
1. 이미지 파일: `/api/files/preview` 기반 썸네일 표시
2. 동영상 파일: `/api/files/download` blob URL 기반 `<video>` 미리보기(무음/controls 없음)
3. 리스트/그리드 공통 적용

## Non-Goal
- 백엔드 ffmpeg 기반 영상 썸네일 생성
- 썸네일 캐시 서버 구조 변경

## Design
- 프론트에서 파일 확장자로 미리보기 가능 타입 판별
- 인증은 fetch + Bearer 토큰으로 수행(기존 axios 글로벌 에러 토스트 오염 방지)
- 실패 시 기존 FileIcon fallback

## Risk Review
- 과도성 방지: 최소 구현(기존 API 재사용)
- 보안: 기존 인증 토큰 헤더 방식 유지
- 사이드이펙트: preview fetch 실패해도 UI는 아이콘 fallback으로 안전

## Tests
- frontend build
- 수동:
  - jpg/png/webp 썸네일 노출
  - mp4/mov 썸네일(첫 프레임) 노출
  - 미지원 포맷은 기존 아이콘 유지
