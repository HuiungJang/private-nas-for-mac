# Frontend 개선 계획 - Synology DSM(OS) 레퍼런스 기반

## 1) 목표
현재 UI는 "단일 페이지 + 단순 테이블" 중심입니다. Synology DSM 스타일처럼 **데스크톱형 정보구조 + 파일 작업 중심 UX**로 재구성합니다.

핵심 목표:
- 정보구조: 상단 글로벌 바 + 좌측 사이드바 + 메인 작업영역
- 파일작업성: 툴바/컨텍스트 메뉴/상태 패널 강화
- 운영감시성: 시스템 상태/알림/작업 진행도 노출
- 일관성: iOS 네이밍(예: IOSCard) 잔재를 DSM 톤으로 정리

---

## 2) 현재 구조 진단

### 현재 강점
- React Query + Zustand 기반 상태 구조는 확장 가능
- 파일 브라우저/관리 페이지 라우팅은 이미 분리되어 있음
- 테마가 이미 "DSM-inspired"로 시작점 보유

### 현재 한계 (Synology 대비)
1. **레이아웃 계층 부족**
   - `PageLayout`이 상단바만 제공, 좌측 네비/작업 패널 부재
2. **파일 작업 흐름 단순**
   - 파일 선택/이동은 가능하지만, 컨텍스트 메뉴·우측 정보패널·작업 큐가 없음
3. **관측 UI 약함**
   - 업로드/다운로드 진행 상태를 전역에서 확인하기 어려움
4. **컴포넌트 네이밍 불일치**
   - DSM 방향인데 `IOS*` 명명 혼재

---

## 3) 변경 범위 (우선순위)

## P1. Shell 구조 전환 (가장 먼저)
### 변경
- `PageLayout`을 **AppShell**로 확장
  - TopBar: 현재 사용자, 빠른 액션, 알림 버튼
  - Left Sidebar: Files, Admin, System, Audit 네비
  - Main Content: 현재 라우트 콘텐츠

### 대상 파일
- `frontend/src/shared/ui/PageLayout.tsx` (대개편 또는 `AppShell.tsx` 신설)
- `frontend/src/pages/dashboard/DashboardPage.tsx`
- `frontend/src/pages/admin/AdminPage.tsx`
- `frontend/src/app/providers/RouterProvider.tsx` (레이아웃 라우트 적용)

### 완료 기준
- 로그인 후 모든 보호 라우트가 동일 Shell 안에서 렌더링
- 모바일에서는 사이드바가 Drawer로 축약

---

## P1. 파일 브라우저 UX 정렬 (DSM File Station 유사)
### 변경
- 파일 헤더를 "타이틀"에서 **작업 툴바 중심**으로 변경
  - 업로드/새폴더/이동/삭제/새로고침
- 선택 상태 바(선택 n개) + 대량 작업 진입점 강화
- Breadcrumb + 검색 + 정렬/필터 바 추가

### 대상 파일
- `frontend/src/features/file-browser/ui/FileBrowser.tsx`
- `frontend/src/features/file-actions/ui/FileActionsToolbar.tsx`
- `frontend/src/widgets/file-table/ui/FileTable.tsx`

### 완료 기준
- 파일 선택 후 가능한 작업이 항상 상단에서 명확히 노출
- list/grid 전환 시 선택 상태 일관 유지

---

## P2. 우측 상세 패널 + 컨텍스트 메뉴
### 변경
- 선택 파일 메타데이터(크기, 수정일, 소유자, 경로) 패널 추가
- 우클릭 컨텍스트 메뉴(열기/다운로드/이동/삭제/정보)

### 대상 파일
- `frontend/src/widgets/file-table/ui/FileTable.tsx`
- `frontend/src/features/file-browser/ui/FileBrowser.tsx`
- `frontend/src/entities/file/model/types.ts` (필요 시 상세 필드 확장)

### 완료 기준
- 마우스 우클릭으로 핵심 액션 실행 가능
- 단일/다중 선택별 메뉴 활성화 규칙 일관

---

## P2. 업로드/작업 센터 (Task Center Lite)
### 변경
- 전역 작업 상태 스토어 신설 (업로드/이동/삭제 진행도)
- TopBar에서 작업 수/실패 건수 확인
- 토스트 외에 "작업 패널" 제공

### 대상 파일
- `frontend/src/shared/model/` 하위 작업 스토어 신설
- `frontend/src/shared/ui/NotificationSnackbar.tsx` (역할 분리)
- `frontend/src/shared/ui/` 하위 TaskCenter 컴포넌트 신설

### 완료 기준
- 긴 작업이 토스트 사라진 뒤에도 추적 가능
- 실패 작업 재시도 액션 제공

---

## P3. 디자인 시스템 정리 (네이밍/토큰)
### 변경
- `IOSCard`, `IOSButton`, `IOSInput`, `IOSBreadcrumbs` → DSM 중립 네이밍으로 리팩터
  - 예: `AppCard`, `AppButton`, `AppInput`, `AppBreadcrumbs`
- 테마 토큰 정리 (간격, border, hover, selected, panel background)

### 대상 파일
- `frontend/src/shared/ui/*`
- `frontend/src/app/providers/ThemeProvider.tsx`
- 사용처 전체 import 업데이트

### 완료 기준
- 도메인/브랜드와 맞는 일관된 네이밍
- 컴포넌트 외형이 동일 토큰 기반으로 동작

---

## 4) 구현 순서 (권장)
1. Shell(AppShell) 구축 + 라우팅 통합
2. FileBrowser 상단 작업바/정렬·검색/선택 UX 개선
3. 상세 패널 + 컨텍스트 메뉴
4. Task Center Lite
5. 네이밍/디자인 토큰 리팩터

---

## 5) 테스트 계획

### 단위/컴포넌트
- FileTable 선택/우클릭/뷰전환 회귀 테스트
- FileBrowser 툴바 액션 노출 조건 테스트
- TaskCenter 상태 표시 테스트

### E2E(권장)
- 로그인 → 파일 선택 → 이동/삭제 → 알림/작업상태 확인
- 업로드 실패 후 상태 패널에서 실패 원인/재시도 확인

### 성능 체크
- 대량 파일 목록(1k+) 렌더링 시 프레임 드랍 여부 확인
- 필요 시 리스트 가상화(react-window) 도입 검토

---

## 6) 리스크 및 대응
- 리스크: 대규모 UI 변경으로 회귀 가능성 증가
- 대응: 단계별 PR 분리 (Shell / File UX / TaskCenter / 리팩터)

- 리스크: 백엔드 API 부족으로 UX 완성도 제한
- 대응: 프론트 우선 상태 모델 설계 후 필요한 API를 별도 이슈로 역제안

---

## 7) 이번 작업에서 바로 시작할 PR 단위 제안
- PR-A (P1): AppShell + 라우팅 통합
- PR-B (P1): FileBrowser 툴바/검색/정렬 개선
- PR-C (P2): 상세 패널 + 컨텍스트 메뉴
- PR-D (P2): Task Center Lite
- PR-E (P3): UI 컴포넌트 네이밍 정리
