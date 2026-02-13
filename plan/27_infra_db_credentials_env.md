# #36 구현 계획 - DB 자격증명 하드코딩 제거

## 수정 목적
- DB 계정/비밀번호 하드코딩을 제거하고 `.env` 기반 시크릿 주입으로 전환한다.

## 수정할 부분
1. `docker-compose.yml`
   - Postgres/Backend DB 설정을 `${NAS_USER}`, `${NAS_PASSWORD}`, `${NAS_DB}`로 치환
2. `.env.example`
   - DB 관련 변수 추가
3. `start.sh`
   - `.env` 생성 시 DB 변수 추가
   - preflight에서 DB 시크릿 누락 검증
4. `README`
   - DB 환경변수 필수 안내

## 테스트 계획
- `docker-compose config` 렌더 확인
