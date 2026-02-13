# #62 구현 계획 - smoke_e2e health check 오탐 수정

## 수정 목적
- smoke script가 보안 정책과 맞지 않는 endpoint를 검사해 실패하는 문제를 제거한다.

## 수정할 부분
1. `scripts/smoke_e2e.sh` health check를 컨테이너 내부 `/actuator/health` 호출로 변경
2. README 설명을 endpoint 정책과 일치하게 수정

## 테스트 계획
- `bash -n scripts/smoke_e2e.sh`
- `bash scripts/smoke_e2e.sh` 재실행
