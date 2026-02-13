# #56 구현 계획 - IPv6 loopback 허용 누락 수정

## 수정 목적
- 내부 헬스체크가 IPv6 loopback(::1) 경로로 들어와도 IpEnforcementFilter에서 차단되지 않게 한다.

## 수정할 부분
1. `application.yml`의 `security.vpn.allowed-subnets` 기본값에 `::1/128` 추가
2. `README`의 허용 대역 예시에 IPv6 loopback 반영

## 테스트 계획
- backend `./gradlew test`
- compose 기동 후 backend health 상태 확인
