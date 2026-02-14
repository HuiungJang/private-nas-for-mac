# Plan 85 - Issue #186 Delete confirmation flashes/closes

## Goal
삭제 확인 UI가 바로 닫혀 선택이 불가능한 문제를 해결한다.

## Approach
- native `confirm()` 제거
- MUI `Dialog` 기반 확인 모달로 대체
- Delete 버튼에서만 뜨게 하고, 실행 중에는 버튼/닫기 비활성화

## Tests
- `frontend npm run build`
- 수동: Delete 클릭 -> 모달 유지 -> Cancel/Confirm 모두 정상 동작
