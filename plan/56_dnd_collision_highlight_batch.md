# Plan 56 - DnD Collision Guard + Highlight + Batch Summary

## Goal
드래그 앤 드랍 이동 UX를 다음 단계로 개선한다.

## Scope
1. 이동 충돌 사전 감지
   - drop 대상 디렉토리에 같은 이름이 이미 있으면 사전 감지
   - 충돌 파일은 건너뛰고 사용자에게 요약 안내
2. 대상 폴더 하이라이트 강화
   - drag-over 폴더에 더 명확한 시각 피드백 제공
3. 대량 이동 요약 Task 처리
   - 다건 이동을 단일 Task로 집계
   - 성공/실패 요약 알림 제공

## Non-Goal
- 백엔드 API 변경
- 새 인프라 도입

## Complexity / Maintenance Review
- 과도성 방지: 기존 move/list API 재사용
- 유지보수성: 배치 이동 로직을 useFileActions로 모아 재사용 가능성 확보
- 성능: 대상 디렉토리 목록 1회 조회로 충돌 검사
- 보안: 기존 인증/인가 경계 유지 (클라이언트는 UX 사전가드)

## Tests
- frontend build
- 수동:
  - 충돌 있는 파일 drag-drop 시 충돌 안내 + non-conflict만 이동
  - drag-over 하이라이트 강화 확인
  - 다건 이동 시 단일 Task/요약 메시지 확인
