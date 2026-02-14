# Plan 54 - DnD Feedback & Safety Hardening

## Goal
드래그 앤 드랍 파일 관리 UX를 강화해 실수 이동을 줄이고 현재 드래그 상태를 명확히 보여준다.

## Scope
1. 드래그 중 선택 항목 개수 표시(배지/안내)
2. 폴더 드랍 시 이동 확인 모달 추가
3. 확인 후에만 실제 move API 호출

## Non-Goal
- 백엔드 API 변경
- 대규모 상태관리 리팩토링

## Review
- 과도 설계 방지: 기존 DnD 로직 위에 최소 상태만 추가
- 기존 코드 재사용: moveFile mutation 그대로 사용
- 사이드이펙트: 업로드 DnD/기존 선택/컨텍스트 메뉴 영향 확인

## Tests
- frontend build
- 수동:
  - drag 시작 시 카운트 안내 노출
  - folder drop 시 확인 모달 노출
  - 취소 시 이동 미발생
  - 확인 시 이동 성공
