# 11. Backend 모듈 분석 및 개선 계획

## 1) Backend 모듈 역할

`backend` 모듈은 Private NAS의 핵심 서버로서 아래 책임을 가집니다.

- 인증/인가: 로그인(JWT), 관리자 권한 제어, VPN/IP 기반 접근 통제
- 파일 서비스: 업로드/다운로드/미리보기/목록/이동/삭제
- 운영 기능: 시스템 설정(테마, IP 허용 대역), 감사 로그, 시스템 헬스 조회
- 데이터 계층: PostgreSQL + JPA, 마이그레이션(Flyway)

아키텍처는 Hexagonal(Ports & Adapters) 스타일로 구성되어 있으며, `context/auth`, `context/file`, `context/system`로 컨텍스트 분리되어 있습니다.

---

## 2) 핵심 리스크 분석

### A. 보안 취약점

1. 기본 관리자 계정 하드코딩 생성
- 위치: `DataInitializer`
- 현재 동작: 사용자 0명일 때 `admin / admin123` 생성
- 위험: 초기 배포 환경에서 계정 탈취 위험

2. JWT 비밀키 기본값 제공
- 위치: `application.yml`
- 현재 동작: `JWT_SECRET` 미설정 시 기본 secret 사용
- 위험: 예측 가능한 키로 토큰 위조 가능

3. 과도한 내부 정보 로깅
- 위치: `DataInitializer`, `IpEnforcementFilter`, JWT 예외 로그
- 위험: 운영 로그에서 공격자에게 유용한 단서 노출 가능

4. X-Forwarded-For 신뢰 경계 불명확
- 위치: `IpEnforcementFilter`, `FileController`
- 위험: 리버스 프록시 신뢰 경계 미정의 시 IP 스푸핑 가능

### B. 설계적 부족

1. 예외 정책 일관성 부족
- 일부는 `IllegalArgumentException`, 일부는 `RuntimeException`으로 뭉뚱그림
- 도메인/애플리케이션 예외 계층이 약해 API 에러 계약이 불안정

2. 설정 검증 부족
- 보안 관련 설정(예: JWT secret 길이/형식, allowed origins)을 시작 시 강하게 검증하지 않음

3. 경계 책임 혼재
- Controller에서 IP 추출 로직 중복/분산
- 공통 관심사를 별도 유틸/컴포넌트로 분리 필요

### C. 성능 병목 가능 지점

1. 디렉토리 listing 전체 메모리 적재
- 위치: `LocalFileSystemAdapter#fetchFileNodes`
- 대용량 폴더에서 응답 지연/메모리 부담 가능

2. 운영환경 SQL 로그 활성화
- 위치: `application.yml` (`show-sql: true`)
- I/O 증가로 성능 및 로그 비용 악화 가능

3. 파일 미리보기 캐시 전략 단순
- 파일 변경/ETag 고려 없는 고정 캐시(1시간)

### D. 가독성 부족

1. 주석/예외 문구/로그 정책 혼재(영문/한글, 추상 수준 불일치)
2. 메서드별 책임은 비교적 좋으나 공통 규칙(로깅, validation, 에러 매핑) 문서화 부족

### E. 중복 코드

1. 클라이언트 IP 추출 로직 중복(`IpEnforcementFilter`, `FileController`)
2. 파일 경로/예외 처리 패턴 일부 중복(파일 서비스 계층 전반)

---

## 3) 개선 Plan (수정 전 단계)

### P0 (즉시)

1. **기본 계정 생성 정책 변경**
- 기본 비밀번호 하드코딩 제거
- `APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD` 같은 환경변수 강제
- 미설정 시 애플리케이션 기동 실패 또는 랜덤 1회성 비밀번호 출력 후 즉시 변경 유도

2. **JWT secret 기본값 제거 + 강제 검증**
- 기본값 제거
- 최소 길이/Base64 유효성 검증
- 미충족 시 기동 실패(fail fast)

3. **운영 로그 보안 강化**
- 계정/토큰/민감정보 유추 가능한 로그 제거 또는 마스킹
- 보안 이벤트는 structured logging으로 최소 정보만 기록

4. **신뢰 가능한 클라이언트 IP 정책 확정**
- trusted proxy 목록 기반으로만 `X-Forwarded-For` 사용
- 그렇지 않으면 `remoteAddr` 사용

### P1 (단기)

1. **예외 계층 정리**
- `DomainException`, `ApplicationException`, `InfrastructureException` 등 계층화
- `GlobalExceptionHandler`에서 일관된 ProblemDetail 스키마 적용

2. **디렉토리 조회 성능 개선**
- 페이지네이션/limit 옵션 도입
- 파일 속성 조회 최적화(필요 필드 우선)

3. **환경별 설정 분리**
- `application-dev.yml`, `application-prod.yml`로 분리
- prod에서 SQL 로그 비활성화

4. **공통 유틸 추출**
- `ClientIpResolver` 컴포넌트 도입
- Controller/Filter 중복 제거

### P2 (중기)

1. **파일 캐시 고도화**
- ETag/Last-Modified 기반 조건부 요청 지원

2. **관측성 강화**
- 핵심 API 응답시간/에러율 메트릭 수집
- 보안 이벤트 대시보드화

3. **리팩토링 가이드 문서화**
- 코딩 컨벤션, 예외 정책, 로깅 정책 문서 추가

---

## 4) 수정 작업 범위 제안(다음 단계)

다음 구현 단계에서는 우선 P0 + 일부 P1을 대상으로 진행 권장:

- [ ] 기본 admin bootstrap 정책 안전화
- [ ] JWT secret fail-fast 검증
- [ ] ClientIpResolver 도입 및 중복 제거
- [ ] prod 설정 분리 및 SQL 로그 비활성화
- [ ] 파일 목록 API에 `limit` 도입(기본값 포함)
- [ ] 예외 타입 정리(핵심 경로부터)

예상 결과:
- 보안 리스크(초기 계정/JWT 키) 즉시 감소
- 운영 안정성 및 성능(로그/디렉토리 조회) 개선
- 코드 유지보수성/가독성 향상
