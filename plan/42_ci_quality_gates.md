# #68 구현 계획 - CI 품질 게이트 자동화

## 수정 목적
- 수동 품질 점검(빌드/테스트/감사/스모크)을 CI로 자동화한다.

## 수정할 부분
1. `.github/workflows/ci.yml` 추가
   - PR/push: backend test, frontend build, frontend audit
   - main push: smoke_e2e
2. README에 CI 검증 항목/트리거 설명 추가

## 테스트 계획
- workflow YAML 문법 검토
- 로컬에서 backend/frontend/smoke 명령 재검증
