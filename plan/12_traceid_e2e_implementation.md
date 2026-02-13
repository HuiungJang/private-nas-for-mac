# Trace ID E2E 일관성 보장 구현 계획

## 수정 목적
- 요청 단위 Trace ID가 Frontend → Backend → AuditLog까지 일관되게 전달되는지 검증 가능 상태로 만든다.

## 수정할 부분
1. Backend 테스트 강화
   - `TraceIdFilterTest`: 요청 헤더 trace id가 응답/체인 내부로 전달되는지 검증
   - `AuditLogServiceTest`: MDC의 traceId가 audit log로 저장되는지 검증
2. Frontend 관측성 보강
   - API 에러 로그에서 서버 응답 `x-trace-id` 우선 사용
   - 에러 메시지 추출 우선순위 정리(detail/message)
3. 문서/계획 반영
   - 구현 계획 파일 기록

## 테스트 계획
- backend: `./gradlew test`
- frontend: `npx vitest run`
- frontend build: `npm run build`
- 수동 확인: 브라우저 네트워크 탭에서 요청 `X-Trace-ID`와 응답 `x-trace-id` 확인
