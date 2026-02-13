# #16 구현 계획 - File Station형 툴바/검색/정렬 UX 강화

## 수정 목적
- 파일 브라우저에서 핵심 작업(업로드/이동/삭제/새로고침) 접근성과 탐색 효율(검색/정렬)을 높인다.

## 수정할 부분
1. `FileBrowser`
   - 검색 입력 + 정렬 셀렉트 + 선택 상태 배지 추가
   - 파일 목록을 검색/정렬 가공해 `FileTable`에 전달
2. `FileActionsToolbar`
   - 새로고침(Refresh) 액션 추가
3. UX 일관성
   - list/grid 전환 및 검색/정렬 시 선택 상태 유지 정책 확인

## 테스트 계획
- frontend: `npx vitest run`
- frontend: `npm run build`
- 수동: 검색/정렬/새로고침/선택 동작 확인
