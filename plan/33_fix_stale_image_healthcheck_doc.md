# #48 구현 계획 - stale image로 인한 healthcheck 불일치 방지

## 수정 목적
- Dockerfile 변경 후 재빌드 없이 실행해서 발생하는 헬스체크 불일치를 줄인다.

## 수정할 부분
1. README의 수동 실행 커맨드를 `docker-compose up -d --build`로 변경
2. 운영 가이드에 "이미지/헬스체크 변경 시 재빌드 필수" 명시

## 테스트 계획
- 문서 변경 검토
