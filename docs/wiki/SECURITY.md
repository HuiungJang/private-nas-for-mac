# SECURITY Wiki

## 목적
보안 설정의 의도와 점검 포인트를 명확히 유지.

## 1) 인증/권한
- JWT secret: Base64 decode >= 32 bytes
- 초기 admin 비밀번호 강제 변경 정책 유지
- principal/accessor 기반으로 인증 사용자 식별(클라이언트 입력 userId 신뢰 금지)

## 2) 네트워크 신뢰 경계
- `security.network.trusted-proxies` 최소 범위 유지
- `security.vpn.allowed-subnets` 운영망 기준 최소화
- IPv4/IPv6 loopback 고려 (`127.0.0.1/32`, `::1/128`)

## 3) CORS
- credentials=true 조건에서 wildcard origin 금지
- 오설정 시 기동 실패 가드 유지

## 4) 감사로그 무결성
- userId는 서버 인증 컨텍스트 기반
- 조회는 pagination 사용
- 정렬은 안정 정렬(`timestamp DESC, id DESC`)

## 5) 프론트 보안 수칙
- 토큰 저장소: sessionStorage
- 401 시 즉시 logout + 재로그인 유도
- retryable 오류의 중복 토스트 억제

## 6) 점검 체크리스트
- [ ] `.env`에 weak/default secret 없음
- [ ] trusted proxies 과도 설정 없음
- [ ] CORS wildcard 없음
- [ ] healthcheck 공개 범위 최소화 유지
