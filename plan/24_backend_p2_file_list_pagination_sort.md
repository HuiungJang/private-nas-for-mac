# #27 구현 계획 - 디렉터리 목록 조회 pagination/sort 성능 개선

## 수정 목적
- 디렉터리 목록 API에 pagination/sort를 도입해 대량 목록 조회 시 부하를 제어한다.

## 수정할 부분
1. 목록 조회 요청 모델 도입 (`offset`, `limit`, `sort`)
2. `ListDirectoryUseCase`/`FileStoragePort` 시그니처 확장
3. `LocalFileSystemAdapter`에 정렬/페이지네이션 적용
4. 응답에 `totalCount`, `offset`, `limit` 포함
5. 테스트 추가(정렬/페이지네이션)

## 테스트 계획
- backend: `./gradlew test`
