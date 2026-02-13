# #58 구현 계획 - backend healthcheck loopback 주소 고정

## 수정 목적
- localhost의 IPv6 해석 차이로 인한 healthcheck 403 실패를 제거한다.

## 수정할 부분
1. `docker-compose.yml` backend healthcheck URL을 `127.0.0.1`로 고정
2. README에 loopback 주소 고정 이유 명시

## 테스트 계획
- docker-compose config 확인
- backend 테스트
