## 목적
backend 모듈 개선을 위한 선행 작업으로 구조/리스크를 분석하고 우선순위 기반 실행 계획을 추가합니다.

## 수정 내용
- `plan/11_backend_audit_improvement_plan.md` 추가
  - backend 역할/아키텍처 요약
  - 보안/설계/성능/가독성/중복 이슈 식별
  - P0/P1/P2 단계별 개선 계획 제시
- 이슈/PR 작성용 템플릿 초안 추가
  - `plan/11_backend_audit_issue_template.md`
  - `plan/11_backend_audit_pr_template.md`

## 예상 결과
- 구현 전에 위험요소와 범위를 명확히 정의
- 추후 수정 PR의 품질/일정 예측성 향상
- 리뷰어가 변경 목적과 기대 효과를 빠르게 파악 가능

## 테스트
- 문서 변경만 있어 코드 실행 테스트 없음
