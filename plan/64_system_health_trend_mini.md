# Plan 64 - System Health Mini Trend

## Goal
Admin System Health 지표에 최근 추이를 표시해 운영 관측성을 높인다.

## Scope
1. Preview Cache Hit Ratio 추이
2. Audit Query P95(ms) 추이
3. 최근 N개 샘플 기반 mini trend(텍스트 sparkline)

## Non-Goal
- 백엔드 API 변경
- 외부 차트 라이브러리 도입

## Design
- `useSystemHealth` 5초 polling 데이터를 위젯 내부 history로 유지(최근 24개)
- 간단 sparkline(유니코드 블록) 렌더 함수 구현
- 현재값 + 최근 추이 + 범위(min/max) 표시

## Tests
- frontend build
- 수동: 1~2분 관찰 시 trend가 누적/갱신되는지 확인
