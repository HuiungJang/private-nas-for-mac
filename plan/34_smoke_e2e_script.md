# #52 구현 계획 - 로컬 스모크 E2E 자동화 스크립트

## 수정 목적
- 빌드/기동/핵심 API 검증을 한 번에 실행하는 스모크 스크립트를 제공한다.

## 수정할 부분
1. `scripts/smoke_e2e.sh` 추가
   - compose 빌드/기동
   - 서비스 health 대기
   - 로그인 실패/성공 검증
   - 인증 API 접근 검증
2. `README.md`에 실행 방법 추가

## 테스트 계획
- `bash scripts/smoke_e2e.sh` 실행 성공 확인
