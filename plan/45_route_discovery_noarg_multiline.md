# #74 구현 계획 - no-arg/dynamic annotation 파싱 보강

## 수정 목적
- route discovery가 괄호 없는 mapping annotation과 다중라인 인자에서도 누락 없이 동작하게 한다.

## 수정할 부분
1. discover_api_routes.py의 메서드 annotation 파서 개선
2. @GetMapping/@PostMapping 등 no-arg 표기 처리
3. smoke_e2e 재실행

## 테스트 계획
- discovery 실행 결과 확인
- smoke_e2e 통과 확인
