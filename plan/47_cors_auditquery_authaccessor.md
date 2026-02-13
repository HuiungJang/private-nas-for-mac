# #80 #81 #82 통합 계획

## Security (#80)
- CORS allowed-origins에 wildcard 위험 패턴 차단 검증 추가

## Performance (#81)
- audit logs를 offset/limit 직접 DB 쿼리로 조회해 불필요 fetch 제거

## Architecture (#82)
- 인증 사용자 ID 추출을 공통 accessor로 통합해 컨트롤러 중복 제거

## 테스트
- backend test
- smoke_e2e
