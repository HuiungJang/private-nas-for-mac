# Plan 62 - Backend Performance Round 3

## Goal
다음 백엔드 성능 라운드 진행:
1) modified sort 경로 최적화 확장
2) preview cache hit ratio 대시보드 노출
3) audit 로그 API p95 계측

## Scope
- LocalFileSystemAdapter: MODIFIED_* 정렬용 lightweight entry 도입
- AuditLogService: query timer 계측 추가
- SystemMonitoringService/DTO: preview cache hit/miss/hitRatio + audit query p95(ms) 노출

## Design
- 파일 목록 정렬 시 name/modified 각각 전략 분리
- preview counters(`app.preview.cache.hit/miss`)를 system health 응답에 포함
- `app.audit.logs.query` timer p95 값을 system health 응답에 포함

## Review
- 과도성 방지: 기존 API shape 유지 + health 필드 확장만 수행
- 유지보수: sort 전략 메서드 분리
- 성능: large directory에서 modified sort 불필요 metadata 로드 완화
- 보안/사이드이펙트: 권한/경로 검증 로직 불변

## Tests
- backend test
- CI checks
