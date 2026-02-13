# #64 구현 계획 - Frontend 번들 청크 분리

## 수정 목적
- 초기 번들 크기 경고를 완화하고 로딩/캐시 효율을 개선한다.

## 수정할 부분
1. Router에서 페이지 컴포넌트 lazy loading 적용
2. Vite build.rollupOptions.output.manualChunks로 vendor 분리
3. 빌드 결과(청크 크기/경고) 확인

## 테스트 계획
- `npm run build`
- 변경 전/후 번들 출력 비교
