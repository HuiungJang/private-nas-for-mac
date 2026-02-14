# Plan 67 - Issue #131 Task Center Docking

## Goal
Task Center를 팝오버 중심에서 DSM 스타일 하단 도킹 패널로 개선.

## Scope
- 하단 우측 고정 dock 버튼 + running/success/failed 카운트
- 클릭 시 하단 패널 확장/축소
- 기존 TaskCenterPanel 재사용

## Tests
- frontend build
- 수동: 작업 발생 시 dock count 반영, 패널 토글 동작 확인
