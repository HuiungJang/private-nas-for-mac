# OPS Wiki

## 목적
운영자 관점에서 배포/점검/장애 대응 절차를 빠르게 수행하기 위한 가이드.

## 1) 배포
```bash
cd ~/Documents/private/nas
git pull
docker-compose up -d --build
```

## 2) 상태 점검
```bash
docker-compose ps
docker-compose logs --tail=100 nas-db nas-backend nas-frontend
```

체크 기준:
- nas-db: healthy
- nas-backend: healthy
- nas-frontend: healthy

## 3) 운영 핵심 확인
- backend health: `/actuator/health`
- audit logs API: `offset/limit` 사용
- smoke: `bash scripts/smoke_e2e.sh`

## 4) 장애 대응 빠른 루틴
1. `docker-compose ps`로 unhealthy 컨테이너 확인
2. 해당 컨테이너 logs 200줄 확인
3. `.env` 필수값(JWT/DB/WG) 확인
4. stale image 의심 시 `--build` 재기동

## 5) DB 자격증명 주의
`config/db-data` 존재 시 `NAS_USER/NAS_PASSWORD/NAS_DB` 변경은 인증 불일치 유발 가능.

## 6) 정기 운영 체크리스트
- [ ] dependency audit
- [ ] smoke e2e
- [ ] trusted proxy/subnet 검토
- [ ] release traceability 문서 업데이트
