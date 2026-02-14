# Plan 58 - Backend Performance: Health Cache + Open-in-View Off

## Goal
백엔드 성능/안정성 관점에서 저위험 고효율 개선 포인트를 반영한다.

## Selected Points
1. System health endpoint short-TTL cache
   - 대상: `SystemMonitoringService#getSystemHealth`
   - 이유: meter/filesystem 조회 반복 비용 완화
2. JPA Open Session In View 비활성화
   - 설정: `spring.jpa.open-in-view=false`
   - 이유: 요청 전 구간 영속성 컨텍스트 유지 비용 제거, 계층 경계 명확화

## Design
- `app.monitoring.health-cache-ttl-ms` (default 2000ms) 추가
- 캐시가 유효하면 기존 DTO 재사용
- 캐시 만료 시 새 값 계산 후 갱신
- storage root 디렉토리 준비는 생성자에서 1회 수행(요청 시 반복 createDirectories 제거)

## Review
- 구현 복잡도: 낮음
- 유지보수: 설정 기반 튜닝 가능
- 성능: health polling 빈도가 높을수록 효과 증가
- 사이드이펙트: health 값이 TTL 동안 약간 stale 가능(운영상 허용 범위)

## Tests
- backend test
- smoke e2e
- CI checks
