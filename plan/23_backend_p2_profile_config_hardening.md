# #28 구현 계획 - 환경별 설정 분리 및 운영 기본값 하드닝

## 수정 목적
- 운영 기본값을 보수적으로 만들고 개발 편의 설정(SQL 출력 등)은 dev 프로파일로 분리한다.

## 수정할 부분
1. `application.yml`
   - `spring.jpa.show-sql=false`
   - `spring.jpa.properties.hibernate.format_sql=false`
2. `application-dev.yml` 신설
   - dev에서만 `show-sql=true`, `format_sql=true`
3. README 운영 가이드에 dev profile 사용 예시 추가

## 테스트 계획
- backend: `./gradlew test`
