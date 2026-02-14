# Plan 81 - Issue #180 Exclude macOS system folders by default

## Goal
- 파일 리스트에서 macOS 시스템 폴더/권한 제한 폴더를 기본 제외하여 경고/잡음을 줄인다.

## Scope
- `LocalFileSystemAdapter`에서 엔트리 열기/속성 조회 전에 well-known system names를 skip
- 적용 대상(초기):
  - `.Spotlight-V100`
  - `.fseventsd`
  - `.Trashes`
  - `.TemporaryItems`
  - `.DocumentRevisions-V100`
  - `.VolumeIcon.icns`

## Non-Goal
- 숨김 파일 전체 정책 변경(프론트 토글과 별개)

## Tests
- backend tests
- 로컬 docker 실행에서 list 시 warn 감소 확인
