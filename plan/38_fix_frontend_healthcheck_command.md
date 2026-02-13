# #60 구현 계획 - nas-frontend healthcheck 명령 수정

## 수정 목적
- frontend 컨테이너가 healthcheck 도구 부재로 unhealthy 상태가 되지 않도록 보강한다.

## 수정할 부분
1. `frontend/Dockerfile` runtime 이미지에 curl 설치
2. `docker-compose.yml` frontend healthcheck를 curl 기반으로 변경
3. README healthcheck 설명 유지/정합성 확인

## 테스트 계획
- docker-compose config 확인
- compose up 후 nas-frontend health status 확인
