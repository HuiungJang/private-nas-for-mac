# Trusted Proxy / Client IP 신뢰 경계 표준화 구현 계획

## 수정 목적
- X-Forwarded-For 신뢰 경계를 명확히 하고, 설정 실수(과도한 CIDR/오타)를 조기에 인지하도록 한다.

## 수정할 부분
1. ClientIpResolver 설정 파싱 안정화
   - invalid CIDR 항목은 경고 후 제외
2. 위험 설정 경고 추가
   - `0.0.0.0/0`, `::/0` 사용 시 경고 로그
   - trusted proxies 미설정 시 동작 안내 로그
3. 단위 테스트 추가
   - trusted proxy일 때만 XFF 신뢰
   - untrusted proxy는 remoteAddr 사용
   - invalid/broad CIDR 처리 검증
4. 운영 문서 보강
   - 로컬/단일/다중 프록시 예시 및 금지 패턴 안내

## 테스트 계획
- backend: `./gradlew test`
- frontend: 영향 없음
