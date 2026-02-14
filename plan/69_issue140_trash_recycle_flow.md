# Plan 69 - Issue #140 Trash/Recycle Bin Flow

## Goal
영구삭제 대신 휴지통 이동/복원 흐름을 도입한다.

## Scope
- `/.trash` 경로를 recycle bin으로 사용
- 일반 경로 삭제 액션: 휴지통 이동
- 휴지통 경로에서 Restore 액션: 루트(`/`)로 복원
- 휴지통 보기 버튼 + 상태 안내 추가

## Non-Goal
- 서버 측 native trash API 추가
- 원래 경로 복원(메타 저장) 구현

## Tests
- frontend build
- 수동: 일반 경로 삭제 시 `/.trash`로 이동, 휴지통에서 restore 동작 확인
