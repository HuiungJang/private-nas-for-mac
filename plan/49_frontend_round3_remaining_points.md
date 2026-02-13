# #89 #90 #91 #92 구현 계획

## 목표
- Frontend 남은 진단 포인트(성능/안정성/아키텍처)를 일괄 개선한다.

## 변경
1. MUI 관련 위젯 lazy loading으로 초기 청크 부담 완화 (#89)
2. axios 에러 표준 처리(401/403/429/5xx) + query retry 정책 명확화 (#90)
3. 파일 삭제/이동 optimistic update + rollback 적용 (#91)
4. TaskCenter 이벤트 계약 typed payload 도입 (#92)

## 테스트
- frontend build
- smoke_e2e
