# #94 #95 #96 구현 계획

## 목적
최근 머지된 구현의 정합성 리스크(optimistic update, 알림 중복, pagination/smoke 안전성)를 보강한다.

## 변경
1. FileNode path 모델 정합화 + delete partial-failure 응답 반영 (#94)
2. retry 대상 오류의 중간 시도 global toast suppression (#95)
3. audit 정렬 tie-break(id) 적용 + smoke safe method 원칙화 (#96)

## 테스트
- backend ./gradlew test
- frontend npm run build
- smoke_e2e 실행
