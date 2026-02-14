# Plan 52 - Create Directory UX Modal Hardening

## Goal
관리 페이지의 디렉토리 생성 UX를 `window.prompt`에서 검증 가능한 모달 기반으로 개선해 사용자 흐름/오입력 방지/일관성을 높인다.

## Scope
1. Frontend `FileActionsToolbar`에서 New Folder 액션을 모달(Dialog)로 교체
2. 폴더명 클라이언트 검증 추가
   - 빈 값 금지
   - `/`, `\\`, `.`, `..` 금지
3. 생성 중 중복 요청 방지(disabled 상태)
4. 성공/실패 알림 및 목록 refresh 유지

## Out of Scope
- 백엔드 API 스펙 변경
- 트리뷰/대량 생성/권한 정책 변경

## Review Checkpoints
- 과도 설계 여부: 단일 기능에 필요한 최소 UI/검증만 적용
- SRP/SOLID: 모달 상태/검증 로직은 툴바 범위에서 제한
- 기존 코드 재사용: 기존 `useFileActions.createDirectory`, notification, query invalidation 재사용
- 사이드이펙트: 업로드/삭제/이동 액션 영향 없는지 확인

## Tests
- `frontend npm run build`
- 수동: New Folder 클릭 → 입력/검증/생성 성공/실패 경로 확인
- API smoke: 생성 후 실제 디렉토리 반영 확인
