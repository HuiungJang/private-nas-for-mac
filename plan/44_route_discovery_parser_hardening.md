# #72 구현 계획 - route discovery 파서 정밀도 고도화

## 수정 목적
- annotation 표기 변형(value/path/배열)에서도 API route discovery 누락을 방지한다.

## 수정할 부분
1. `discover_api_routes.py` 파싱 로직 개선
2. value/path/직접 문자열 패턴을 모두 지원
3. 다중 path는 전부 route 후보로 반영

## 테스트 계획
- discovery 결과 route 수/경로 출력 검증
- smoke_e2e 전체 경로 체크 통과 확인
