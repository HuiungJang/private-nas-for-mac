# #46 구현 계획 - preview cache-dir 기본값 로컬 실행 호환성 개선

## 수정 목적
- 비컨테이너 로컬 실행에서 `/app/cache` 경로 문제로 backend 기동 실패가 나지 않도록 기본값을 안전하게 변경한다.

## 수정할 부분
1. `application.yml`
   - `app.storage.cache-dir`를 env 우선 + 안전 기본값으로 변경
2. `README`
   - 로컬 실행 시 cache-dir override 가이드 추가

## 테스트 계획
- backend: `./gradlew test`
- 로컬 실행 스모크: backend jar 기동 확인
