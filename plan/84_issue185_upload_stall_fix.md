# Plan 84 - Issue #185 Upload stalls after selection

## Goal
UI 업로드가 파일 선택 후 멈추는 문제를 해결한다.

## Hypothesis
Axios multipart 요청에서 `Content-Type: multipart/form-data`를 수동 설정하면 boundary 처리 문제가 생길 수 있음.

## Changes
- `fileApi.uploadFile`: Content-Type 헤더 수동 설정 제거
- 업로드 시작 시 task center가 running으로 표시되는지 확인

## Tests
- `frontend npm run build`
- 수동: Upload -> 파일 선택 -> task running -> 업로드 완료 후 리스트에 나타남
