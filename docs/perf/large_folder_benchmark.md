# Large Folder Benchmark Guide

## Purpose
파일 브라우저 대용량 폴더 렌더링 성능을 반복 측정하기 위한 가이드.

## Environment
- Frontend: production build + nginx container
- Browser: Chrome (Incognito 권장)
- Dataset: 1,000 / 5,000 / 10,000 files 단계별 폴더

## Steps
1. 테스트 데이터 준비
2. `frontend npm run build` 후 앱 기동
3. Chrome DevTools > Performance 열기
4. 파일 브라우저 진입 후 대상 폴더 열기
5. 다음 시나리오 각각 3회 측정
   - 최초 진입 렌더
   - 스크롤 하단 이동
   - 같은 폴더 재진입(썸네일 캐시 효과)

## Metrics to Record
- Time to first rows visible
- Main thread long task count (>50ms)
- Memory peak (JS heap)
- Thumbnail request count (Network)

## Pass Criteria (example)
- 5,000 files: initial render no freeze (>2s UI freeze 없음)
- same-folder revisit: thumbnail fetch count significantly reduced

## Notes
- 브라우저 확장/백그라운드 탭 최소화
- 테스트 중 네트워크 변동이 크면 재측정
