# Plan 60 - Backend Performance Round 2

## Goal
백엔드 성능 2차 개선: 대용량 디렉토리 목록 처리 비용 완화 + preview 캐시 관측성 + audit 조회 인덱스 보강.

## Scope
1. Directory listing optimization (name sort 경로)
   - 전체 항목 메타데이터 읽기 대신, 페이지 구간에만 상세 속성 조회
2. Preview cache metrics
   - cache hit/miss 카운터 기록
3. Audit logs index migration
   - `(timestamp DESC, id DESC)` 조회 패턴 최적화용 인덱스 추가

## Design
- `LocalFileSystemAdapter#listDirectory`에서 sort별 분기
  - NAME_ASC/DESC: path + isDirectory만으로 정렬/페이징, 페이징된 항목만 `readAttributes`
  - MODIFIED_*: 기존 전체 메타 조회 유지
- `PreviewService`에 MeterRegistry 주입 후 counter 증가
- Flyway `V6__add_audit_logs_timestamp_id_index.sql` 추가

## Review
- 복잡도: 중간 (분기 추가)
- 유지보수: sort 전략 분리로 가독성 유지
- 성능: large directory + name sort에서 metadata IO 감소 기대
- 보안/사이드이펙트: 기존 권한/경로 검증 로직 유지

## Tests
- backend test
- smoke e2e (CI)
