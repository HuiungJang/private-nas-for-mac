# #85 #86 #87 구현 계획

## Security (#85)
- auth store persist storage를 localStorage -> sessionStorage 전환

## Performance (#86)
- audit API/hook에 offset/limit 파라미터 기본 적용(0,100)

## Architecture (#87)
- query key factory(shared/model/queryKeys.ts) 도입
- files/audit/users/system hooks + file actions invalidate 일괄 사용

## 테스트
- frontend build
- smoke_e2e
