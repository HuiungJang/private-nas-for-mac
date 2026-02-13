# DEV Wiki

## 목적
개발자 관점에서 구조/개발 흐름/테스트 루틴을 정리.

## 1) 구조
- Backend: Hexagonal(Ports/Adapters)
- Frontend: React + React Query + Zustand
- Infra: Docker Compose + PostgreSQL + WireGuard

## 2) 개발 시작
```bash
cp .env.example .env
```

Backend:
```bash
cd backend
./gradlew test
```

Frontend:
```bash
cd frontend
npm ci
npm run build
```

## 3) API/프론트 정합성 규칙
- DTO 변경 시 frontend 타입 동시 갱신
- query key는 `queryKeys` factory만 사용
- 파일 액션은 TaskCenter typed event 계약 유지

## 4) 품질 게이트
- PR/main: backend test + frontend build + audit
- main push: smoke_e2e

## 5) 변경 시 필수 검증
- backend `./gradlew test`
- frontend `npm run build`
- `bash scripts/smoke_e2e.sh`

## 6) route discovery
- 스크립트: `scripts/discover_api_routes.py`
- smoke는 safe-method(GET) 경로 중심으로 점검
