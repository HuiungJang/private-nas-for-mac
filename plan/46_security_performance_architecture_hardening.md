# #76 #77 #78 통합 구현 계획

## 1) 보안 문제(#76)
- 목적: 감사로그 userId 위변조 방지
- 변경: AdminFileController의 `userId` query param 제거, 인증 principal의 userId 강제 사용

## 2) 성능 문제(#77)
- 목적: 감사로그 조회 무제한 로드 제거
- 변경: audit-logs API에 `offset/limit` 도입(기본 0/100, 최대 500)
- 저장소 조회를 Pageable 기반으로 전환

## 3) 아키텍처 문제(#78)
- 목적: 인증 경계 명확화
- 변경: `AuthenticatedUserPrincipal` 도입, JWT filter/Controller에서 통일 사용

## 테스트 계획
- backend `./gradlew test`
- `bash scripts/smoke_e2e.sh`
