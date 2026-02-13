# Private NAS for Mac - Wiki

이 문서는 `private-nas-for-mac` 저장소의 빠른 온보딩/운영/개발 참고용 위키입니다.

---

## 1. 프로젝트 개요

Private NAS for Mac은 macOS + 외장 스토리지를 개인 클라우드처럼 사용하기 위한 self-hosted NAS 프로젝트입니다.

핵심 목표:
- VPN 기반 접근 제어 (공개 인터넷 직접 노출 최소화)
- 파일 업로드/다운로드/미리보기/관리 기능 제공
- 운영 가시성(healthcheck, audit log, smoke/CI) 확보

---

## 2. 아키텍처 요약

### Backend
- Java 25, Spring Boot 4.x
- 구조: Hexagonal (Ports & Adapters)
- 주요 컨텍스트:
  - `auth`: 인증/권한/JWT
  - `file`: 파일 입출력/목록/이동/삭제
  - `system`: 설정/모니터링/감사로그

### Frontend
- React + TypeScript + Vite
- React Query + Zustand
- 관리자 페이지/파일 브라우저/작업(Task Center) UI

### Infra
- Docker Compose
- PostgreSQL
- WireGuard(wg-easy)

---

## 3. 주요 보안 원칙

1. JWT secret은 강한 값(32바이트 이상 decode) 필수
2. CORS는 credential 모드에서 wildcard 금지
3. trusted proxy / allowed subnet을 명시적으로 관리
4. 감사로그 주체(userId)는 클라이언트 입력이 아닌 서버 인증정보로 결정
5. 기본 노출 정책은 최소화 (`FRONTEND_BIND_ADDRESS=127.0.0.1` 권장)

---

## 4. 실행 방법

### 사전 준비
```bash
cp .env.example .env
```
`.env`에 필수 값 설정:
- `APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD`
- `JWT_SECRET`
- `WG_HOST`, `WG_PASSWORD_HASH`, `WG_EASY_VERSION`
- `NAS_USER`, `NAS_PASSWORD`, `NAS_DB`
- `TRUSTED_PROXY_SUBNETS`

### 실행
```bash
./start.sh
# 또는
# docker-compose up -d --build
```

### 상태 점검
```bash
docker-compose ps
docker-compose logs --tail=100 nas-db nas-backend nas-frontend
```

---

## 5. 테스트/품질 게이트

### 로컬
```bash
# backend
cd backend && ./gradlew test

# frontend
cd ../frontend && npm ci && npm run build

# smoke
cd .. && bash scripts/smoke_e2e.sh
```

### CI
- PR / main push:
  - backend test
  - frontend build
  - frontend production dependency audit
- main push:
  - smoke_e2e

---

## 6. 스모크 테스트 정책

`scripts/smoke_e2e.sh`는 다음을 점검합니다.
1. 컨테이너 빌드/기동
2. health 상태
3. 로그인 실패/성공
4. 보호 API 접근
5. route discovery 기반 safe-method(GET) 경로 점검

주의:
- 비파괴 원칙으로 route 전수 점검은 safe method 중심으로 유지합니다.

---

## 7. 데이터/운영 주의사항

1. `config/db-data`가 존재할 때 DB 자격증명 변경 시 기동 불일치 가능
2. Dockerfile/healthcheck 변경 후 stale image 방지를 위해 `--build` 권장
3. 감사로그 API는 pagination(`offset`, `limit`) 사용 권장
   - limit 상한: 500

예시:
```bash
curl -H "Authorization: Bearer <token>" \
  "http://127.0.0.1/api/admin/system/audit-logs?offset=0&limit=100"
```

---

## 8. 최근 하드닝/개선 추적

최근 개선 흐름은 아래 문서에서 이슈-PR 기준으로 추적합니다.
- `docs/release_traceability_2026-02.md`

---

## 9. 자주 쓰는 파일 경로

- Compose: `docker-compose.yml`
- Backend 설정: `backend/src/main/resources/application.yml`
- Frontend API 클라이언트: `frontend/src/shared/api/axios.ts`
- Smoke 스크립트: `scripts/smoke_e2e.sh`
- API route discovery: `scripts/discover_api_routes.py`

---

## 10. 유지보수 체크리스트(권장)

- [ ] 월 1회 dependency audit
- [ ] 월 1회 smoke + 핵심 시나리오 수동 점검
- [ ] 분기 1회 trusted proxy / subnet 검토
- [ ] 릴리스 시 traceability 문서 업데이트

---

## 분리 문서
- [OPS Wiki](./wiki/OPS.md)
- [DEV Wiki](./wiki/DEV.md)
- [SECURITY Wiki](./wiki/SECURITY.md)

기본 위키는 개요 허브로 유지하고, 세부 운영/개발/보안 내용은 위 분리 문서에서 관리합니다.
