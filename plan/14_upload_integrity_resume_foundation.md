# 대용량 업로드 재개·무결성 기반 구현 계획 (#8)

## 수정 목적
- 업로드 완료 파일에 대해 SHA-256 무결성 검증을 제공한다.
- 클라이언트 재개 전략을 위한 업로드 상태 조회 기반 API를 제공한다.

## 수정할 부분
1. `FileUploadCommand`에 `checksumSha256`(optional) 추가
2. `FileUploadService`
   - 저장 후 checksum 검증
   - 불일치 시 저장 파일 롤백 삭제
3. `FileStoragePort`/`LocalFileSystemAdapter`
   - 파일 존재 여부/파일 크기 조회 API 추가
4. `FileController`
   - `checksumSha256` 업로드 파라미터 수용
   - `GET /api/files/upload/status?path=...` 추가
5. 테스트 보강
   - 체크섬 일치/불일치(롤백) 테스트
   - upload status 응답 테스트

## 테스트 계획
- backend: `./gradlew test`
- frontend: 영향 없음
