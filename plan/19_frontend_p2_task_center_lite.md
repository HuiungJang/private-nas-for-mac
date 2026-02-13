# #18 구현 계획 - Task Center Lite

## 수정 목적
- 업로드/삭제/이동 작업의 진행/성공/실패 상태를 토스트 외에도 지속 추적 가능하게 만든다.

## 수정할 부분
1. 작업 상태 전역 스토어 신설
2. `useFileActions`에서 onMutate/onSuccess/onError로 작업 상태 기록
3. AppShell TopBar에 Task Center 버튼/패널 추가

## 테스트 계획
- frontend: `npx vitest run`
- frontend: `npm run build`
- 수동: 파일 작업 실행 시 Task Center에 상태 반영 확인
