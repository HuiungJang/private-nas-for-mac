# #19 구현 계획 - UI 네이밍 정리(iOS 잔재 제거)

## 수정 목적
- DSM 지향 UI 컨벤션에 맞춰 공용 UI 컴포넌트 네이밍을 중립화(`App*`)한다.

## 수정할 부분
1. `AppButton/AppInput/AppCard/AppBreadcrumbs` 컴포넌트 추가
2. 앱 전역 사용처 import/컴포넌트명을 `IOS*` -> `App*`로 전환
3. `shared/ui/index.ts`에서 `App*`를 기본 export로 노출
4. 기존 `IOS*`는 임시 호환 alias로 유지

## 테스트 계획
- frontend: `npx vitest run`
- frontend: `npm run build`
