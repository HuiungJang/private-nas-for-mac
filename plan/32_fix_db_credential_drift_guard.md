# #47 구현 계획 - DB credential drift 가드 강화

## 수정 목적
- 기존 db-data 유지 상태에서 DB 자격증명 변경 시 backend 인증 실패를 사전 인지하도록 가드/문서를 추가한다.

## 수정할 부분
1. `start.sh`
   - `config/db-data/PG_VERSION` 존재 + DB creds 변경 가능성에 대한 경고 출력
2. `README`
   - DB credentials 변경 시 재초기화/동기화 절차 명시

## 테스트 계획
- 스크립트 문법 확인
- 수동: PG data 디렉터리 존재 시 경고 출력 확인
