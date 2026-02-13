# JWT Secret 운영 가드레일 강화 구현 계획

## 수정 목적
- JWT_SECRET 오설정(누락/형식 오류/길이 부족)을 배포 전에 조기 탐지해 인증 취약 상태로 기동되는 위험을 줄인다.
- 운영자가 `.env` 작성 시 실수하기 쉬운 항목을 명확히 안내해 보안 기본값을 강화한다.

## 수정할 부분
1. `start.sh`에 preflight 검증 추가
   - `.env` 필수 키 존재 여부 확인 (`JWT_SECRET`, `APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD`)
   - `JWT_SECRET` Base64 디코드 가능 여부 및 디코드 길이(>=32 bytes) 검증
   - 실패 시 `docker-compose up` 전에 즉시 중단(fail-fast)
2. `README.md` 환경설정 가이드 보강
   - JWT_SECRET 생성 명령 예시와 주의사항 명시
   - bootstrap admin 비밀번호 설정 항목 명시
3. `backend` JWT 검증 단위 테스트 보강
   - 짧은 secret / invalid base64에 대한 예외 검증 추가
4. 스크립트/문서 가독성 개선
   - start.sh 포맷 정리(조건 분기, 메시지, 에러 출력 일관화)

## 설계/접근 방식 (6단계)
1) 현재 상태 점검
- 이유: 이미 일부 fail-fast가 백엔드에 있으므로 중복/충돌 없는 범위로 보강 필요.
- 리스크: 중복 변경으로 운영 흐름 복잡화.

2) preflight 책임 경계 정의
- 이유: 런타임 검증은 백엔드, 배포 전 검증은 start.sh로 역할 분리.
- 리스크: 검증 중복으로 false positive 가능.

3) start.sh 검증 함수화
- 이유: 읽기 쉬운 구조와 재사용성 확보.
- 리스크: 셸별 호환성 문제.

4) 문서 동기화
- 이유: 코드가 강제해도 사용자가 모르면 반복 실패 발생.
- 리스크: 문서/코드 불일치.

5) 테스트 추가
- 이유: JWT provider 실패 케이스 회귀 방지.
- 리스크: 테스트 미흡 시 보안 회귀.

6) 전체 검증
- 이유: 백엔드/프론트 영향 없는지 최종 확인.
- 리스크: 머지 직전 환경 불일치.

## 디자인 패턴 비교
1. Guard Clause 중심 절차형(선택)
- 가독성: 9/10 (실패 조건이 위에서 즉시 드러남)
- 성능: 9/10 (불필요 단계 조기 중단)
- 유지보수성: 8/10 (검증 항목 추가 용이)

2. 파이프라인 단계형(validate -> setup -> run)
- 가독성: 8/10
- 성능: 8/10
- 유지보수성: 8/10

3. 설정 객체 기반(파싱 후 일괄검증)
- 가독성: 7/10
- 성능: 7/10
- 유지보수성: 9/10

선정: **Guard Clause 중심 절차형**

## 테스트 계획
- Backend
  - `./gradlew test` 실행
  - `JwtTokenProviderTest`에 invalid base64 / too short secret 예외 케이스 추가
- Frontend
  - 영향 범위 없음 확인 차원에서 `npx vitest run` 수행
- Build
  - `npm run build` 수행
- 수동 점검
  - `.env`에서 JWT_SECRET 고의 오설정 후 `start.sh`가 preflight에서 중단되는지 확인
