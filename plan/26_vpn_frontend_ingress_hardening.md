# #35 구현 계획 - Frontend ingress 노출 정책 설정형 전환

## 수정 목적
- Frontend 공개 포트 바인딩을 환경변수 기반으로 전환해 운영 실수로 인한 외부 노출 위험을 낮춘다.

## 수정할 부분
1. `docker-compose.yml`
   - `80:80` 고정 매핑 -> `${FRONTEND_BIND_ADDRESS:-127.0.0.1}:80:80`
2. `.env.example`
   - `FRONTEND_BIND_ADDRESS` 항목 추가 및 보안 설명
3. `start.sh`
   - `.env` 생성 시 `FRONTEND_BIND_ADDRESS` 추가
   - `0.0.0.0` 설정 시 경고 출력
4. `README`
   - VPN 운영 시 포트 노출 가이드 추가

## 테스트 계획
- `docker-compose config`로 compose 유효성 확인
- `./gradlew test` 영향 없음(인프라 설정 변경)
