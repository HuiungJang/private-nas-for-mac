# #26 구현 계획 - 다건 삭제 부분실패 정책/응답 모델 정립

## 수정 목적
- 다건 삭제의 부분 성공/실패를 API 응답으로 명시해 사용자 예측 가능성과 운영 분석성을 높인다.

## 수정할 부분
1. `DeleteFilesUseCase` 반환형을 결과 모델로 확장
2. `DeleteFilesService`를 best-effort 정책으로 변경
   - 성공 목록/실패 목록 수집
3. `AdminFileController` 응답 DTO 추가
4. 테스트 보강
   - 성공/실패 혼합 시 리포트 검증

## 테스트 계획
- backend: `./gradlew test`
