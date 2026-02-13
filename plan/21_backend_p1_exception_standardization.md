# #25 구현 계획 - 예외 처리 표준화 및 RuntimeException 축소

## 수정 목적
- 파일/미리보기 계층 예외를 표준화해 API 응답 일관성과 장애 분석성을 개선한다.

## 수정할 부분
1. `FileOperationException` 신설
2. `GlobalExceptionHandler`에 파일 작업 예외 핸들러 추가
3. `LocalFileSystemAdapter`, `PreviewService`, `ThumbnailatorAdapter`, `FileUploadService`에서 포괄 RuntimeException 축소
4. 서비스 계층 broad catch(`Exception`)를 `RuntimeException` 중심으로 축소

## 테스트 계획
- backend: `./gradlew test`
