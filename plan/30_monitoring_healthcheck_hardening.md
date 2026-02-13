# #43 구현 계획 - 서비스 헬스체크/모니터링 기본 구성 강화

## 수정 목적
- compose 레벨 healthcheck를 추가해 운영 감시성과 기동 안정성을 개선한다.

## 수정할 부분
1. backend actuator health 노출 최소 설정 추가
2. backend runtime 이미지에 healthcheck용 curl 추가
3. docker-compose healthcheck 추가
   - nas-db: pg_isready
   - nas-backend: /actuator/health
   - nas-frontend: nginx index 응답 확인
4. depends_on 조건을 service_healthy로 강화
5. README 운영 점검 절차 추가

## 테스트 계획
- `docker-compose config` 렌더링 확인
- backend `./gradlew test`
