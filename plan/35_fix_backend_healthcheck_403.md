# #54 구현 계획 - backend actuator health endpoint 인증 차단 해제

## 수정 목적
- 컨테이너 healthcheck가 정상 통과하도록 actuator health/info endpoint를 공개 허용한다.

## 수정할 부분
1. `SecurityConfig`
   - `/actuator/health`, `/actuator/info` permitAll
2. 검증
   - backend 테스트
   - compose 기동 후 backend health 상태 확인
