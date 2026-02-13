# #70 구현 계획 - 모든 API 경로 스모크 자동 커버

## 수정 목적
- 스모크 테스트를 핵심 경로 중심에서 전체 API 경로 커버로 확장한다.
- PR에서 신규 API가 생기면 별도 수동 반영 없이 자동으로 스모크 대상에 포함되게 한다.

## 수정할 부분
1. Controller annotation 기반 route discovery 스크립트 추가
2. `scripts/smoke_e2e.sh`에 전체 route reachability 검증 단계 추가
3. README에 전체 경로 자동 커버 정책 명시

## 테스트 계획
- `bash scripts/smoke_e2e.sh` 실행
- discovery 결과에 신규/기존 API가 포함되는지 확인
- 404/5xx 회귀 감지 동작 확인
