# #15 구현 계획 - DSM 스타일 AppShell 및 라우트 레이아웃 통합

## 수정 목적
- 로그인 후 보호 라우트를 하나의 AppShell(TopBar + Sidebar + Content) 안에서 일관되게 제공한다.

## 수정할 부분
1. `AppShell` 신설
   - Desktop: 고정 Sidebar + TopBar
   - Mobile: Drawer Sidebar
2. `RouterProvider` 레이아웃 라우트 적용
   - `RequireAuth` 아래 `ProtectedLayout(AppShell + Outlet)` 도입
3. 페이지 단 단순화
   - Dashboard/Admin에서 기존 `PageLayout` 래핑 제거

## 테스트 계획
- frontend: `npx vitest run`
- frontend: `npm run build`
- 수동: 로그인 후 `/`, `/admin` 이동 시 동일 Shell 유지 확인
