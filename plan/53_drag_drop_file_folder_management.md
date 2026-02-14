# Plan 53 - Drag & Drop File/Folder Management

## Goal
관리 페이지에서 폴더/파일을 드래그 앤 드랍으로 이동/업로드할 수 있게 한다.

## Scope
1. 내부 이동 DnD
   - 파일/폴더 항목을 드래그해서 디렉토리 항목 위에 드랍하면 이동
   - 다중 선택 상태에서 드래그하면 선택 항목 전체 이동
2. 외부 파일 업로드 DnD
   - OS Finder에서 파일을 브라우저 파일영역으로 드랍하면 현재 디렉토리로 업로드

## Non-Goal
- 폴더 트리 UI 신설
- 백엔드 API 신규 추가(기존 move/upload 재사용)

## Design (minimal)
- 기존 `moveFile`/`uploadFile` mutation 재사용
- `FileTable`에 DnD 이벤트 추가(리스트/그리드 공통)
- `FileBrowser`에서 DnD orchestration(경로 계산, 유효성, 업로드 루프)

## Risk Review
- 과도 설계 방지: 외부 라이브러리 미도입(HTML5 DnD)
- 사이드이펙트: 기존 클릭/더블클릭/선택 동작 유지
- 보안: 경로 생성은 기존 서버 검증을 따르고 클라이언트는 기본 guard만 수행

## Tests
- frontend build
- 수동
  - 단일 파일 drag -> 디렉토리 drop 이동
  - 다중 선택 drag -> 디렉토리 drop 이동
  - Finder 파일 drag -> 업로드
  - 잘못된 드랍(자기 자신/비-디렉토리) 무시
