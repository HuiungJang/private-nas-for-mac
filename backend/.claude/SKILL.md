# Spring Boot 보안 & 설정 점검 스킬

## 스킬 요약

- 이 스킬은 Spring Boot 애플리케이션의 **보안 설정과 운영 설정을 점검**하고, 프로덕션 배포 전에 흔히 발생하는 실수를 줄이기 위한 체크리스트와 리팩터링 제안을
  제공한다.
- 민감정보 노출, 잘못된 Security 설정, 위험한 프로파일/로깅 설정, HTTPS/CORS/Actuator 오픈 같은 항목을 집중적으로 검토한다.

## 이 스킬을 언제 사용해야 하는가

다음과 같은 상황에서 이 스킬을 적용한다.

- 새 Spring Boot 서비스 또는 주요 기능을 **배포하기 직전** 점검할 때.
- 기존 프로젝트의 보안/설정이 불안한 느낌이 들거나, **보안 진단/침투 테스트 이전에 1차 셀프 점검**이 필요할 때.
- 외부에 노출되는 API(모바일/웹/3rd-party 연동)를 새로 추가했을 때.

사용자는 대략 아래와 같이 요청하면 된다.

> "security 설정이랑 application.yml / application-*.yml을 이 스킬 기준으로 보안 점검해 줘."
> "배포 전 체크리스트 관점에서 위험한 설정이 있는지 알려줘."

## Claude가 따라야 할 전반적인 원칙

- **"최소 수정으로 위험도 크게 줄이는"** 방향의 제안을 우선한다.
- 팀/서비스의 컨텍스트(내부망 서비스인지, 퍼블릭 서비스인지, 테스트 환경인지)를 먼저 파악하고, 그에 맞게 권고 수위를 조절한다.
- 스택 버전(Spring Boot, Spring Security, JDK 등)과 배포 환경(온프렘, 클라우드, 프록시/로드밸런서 등)을 가능한 한 추론해서 설명에 포함한다.

## 점검 대상 파일/코드

가능하면 아래 항목들을 모두 스캔한다.

- `application.yml`, `application-*.yml` / `application.properties`
- `SecurityConfig` 또는 Security FilterChain 설정 클래스들 (`@EnableWebSecurity` 등)
- `logback-spring.xml`, `log4j2.xml` 같은 로깅 설정 파일
- `Dockerfile`, `docker-compose.yml`, K8s 매니페스트(있다면)
- `build.gradle` / `pom.xml` (Spring Boot, Security, DB 드라이버, Actuator 등의 의존성 버전)

## 점검 항목 1: 민감정보 & 설정 관리

### 체크리스트

- [ ] `application*.yml/properties`에 **비밀번호·토큰·API 키·시크릿**이 평문으로 들어있지 않은가.
- [ ] DB 접속 정보, 외부 API 키가 환경 변수나 Secret Manager 등으로 분리되어 있는가.
- [ ] 개발/운영 프로파일(`spring.profiles.active`) 구분이 명확한가.

### Claude가 해야 할 일

1. 설정 파일에서 다음 패턴을 찾는다.
    - `password:`, `secret:`, `accessKey`, `secretKey`, `token`, `PRIVATE_KEY` 등 키 이름.
    - 값이 `${...}` 형태가 아니라 **직접 값이 박혀 있는 경우를 "고위험"**으로 표시한다.

2. 발견된 항목마다 아래 형식으로 리포트한다.
    - 위험도: HIGH / MEDIUM / LOW
    - 항목:spring.datasource.password
        - “운영 환경에서는 환경 변수나 Secret Manager로 분리해야 합니다.”
    - 최소 수정안 예시:${DB_PASSWORD} 로 변경 후 환경 변수 설정.

## 점검 항목 2: Spring Security 설정

### 체크리스트

- [ ] 인증/인가가 필요한 URL과 허용해야 하는 URL이 명확히 분리되어 있는가.
- [ ] `/actuator/**`, `/h2-console/**`, Swagger UI 등 관리용/디버그용 엔드포인트가 인증 없이 열려 있지 않은가.
- [ ] `csrf().disable()`를 **이유 없이** 비활성화하지 않았는가.
- [ ] CORS 정책이 "모든 오리진/메서드/헤더 허용"으로 설정되어 있지 않은가.

### Claude가 해야 할 일

1. Security 설정 클래스 / DSL을 분석한다.
    - 모든 요청을 `permitAll()`로 두지 않았는지.
    - `.anyRequest().authenticated()` 앞에 과도한 `permitAll` 패턴이 있는지.
    - `http.csrf().disable()`가 왜 있는지 주석/컨텍스트를 보고 합리성을 평가한다.

2. 위험 패턴을 찾으면 다음과 같은 형태로 제안한다.

   **문제 예:**
   ```java
   http.csrf().disable();
   http.cors().configurationSource(request -> new CorsConfiguration().applyPermitDefaultValues());
   ```
   **제안:**
    - REST API + JWT 기반이면, CSRF 비활성화 이유를 명시하고, 문서에 남기도록 안내.
    - CORS는 실제 프론트엔드 도메인(예: `https://example.com`)만 허용하도록 설정 예시 코드 제공.

3. `actuator`, `h2-console`, Swagger / API-Docs 등의 엔드포인트에 대해
    - 운영 환경에서 인증/IP 제한/네트워크 레벨 차단이 되어 있는지 확인하고,
    - 필요 시 `requestMatchers("/actuator/**").hasRole("ADMIN")` 같은 코드 예시를 제시한다.

## 점검 항목 3: HTTPS 및 네트워크 관련 설정

### 체크리스트

- [ ] 운영 환경에서 HTTP → HTTPS 리다이렉트 또는 프록시/로드밸런서 수준의 HTTPS 강제가 되어 있는가.
- [ ] `server.forward-headers-strategy`, `X-Forwarded-*` 헤더 처리 설정이 프록시 환경에 맞게 되어 있는가.
- [ ] JWT, 세션 쿠키에 **Secure**, **HttpOnly**, SameSite 옵션이 적절히 설정되어 있는가.

### Claude가 해야 할 일

- 설정 파일과 보안/인증 관련 코드를 보고,
- HTTPS를 쓰는지 (`server.ssl.*` 설정, 프록시 사용 여부) 추론하고,
- 쿠키/세션/JWT 발급 시 옵션 설정 코드를 찾아 위험성을 평가한다.

- HTTPS 강제가 없거나 쿠키 옵션이 느슨하면, 다음과 같은 코드를 예시로 제안한다.

```java
cookie.setSecure(true);
cookie.setHttpOnly(true);
```

- SameSite=None 사용 시 HTTPS 필수라는 설명을 덧붙인다.

## 점검 항목 4: 로깅 & 모니터링

### 체크리스트

- [ ] 로그에 비밀번호·주민번호·카드번호·토큰 등이 출력되지 않도록 필터링하고 있는가.
- [ ] DEBUG/TRACE 로그 레벨이 운영 환경에서 활성화되어 있지 않은가.
- [ ] 예외/보안 이벤트(로그인 실패, 권한 거부 등)가 적절히 기록되고 있는가.

### Claude가 해야 할 일

1. 로깅 설정과 코드에서 `log.debug`, `log.info` 사용 패턴을 살펴 민감정보를 직접 찍는 부분을 찾는다.
2. 운영 프로파일에서 `logging.level`이 DEBUG/TRACE로 설정된 경우, INFO 또는 WARN으로 낮추도록 권고한다.
3. 예외 처리/인증 실패 핸들러가 있다면, 보안 이벤트를 로그로 남기되, 과도한 개인정보를 포함하지 않는 패턴을 제안한다.

## 점검 항목 5: 버전 및 의존성

### 체크리스트

- [ ] Spring Boot, Spring Security, 주요 라이브러리가 최소한 보안 업데이트가 반영된 버전인지.
- [ ] 오래된/불필요한 라이브러리가 프로젝트에 남아 있지 않은지.

### Claude가 해야 할 일

- [ ] `build.gradle` / `pom.xml`에서
- [ ] Spring Boot 버전, Spring Security 버전, DB 드라이버 버전 등을 추출해,
- [ ] 알려진 심각한 CVE가 있는 “매우 오래된 버전”일 가능성이 높은지 간략히 평가한다.
- [ ] 사용되지 않는 보안 관련 의존성(예: 테스트용 in-memory 인증, 예전 OAuth 라이브러리)을 정리하는 것을 추천한다.

## 최종 리포트 출력 형식 (권장)

Claude는 점검 후 다음 형식으로 결과를 요약한다.

```markdown
1. 요약
   - HIGH 2건, MEDIUM 4건, LOW 5건의 이슈를 발견했습니다.

2. 상세 항목 (예시)
   [HIGH] application-prod.yml에 DB 비밀번호가 평문으로 설정됨
   - 설명: 운영 환경에서 비밀번호를 평문으로 저장하면 유출 시 피해가 크다.
   - 제안: ${DB_PASSWORD}로 변경 후, 인프라 레벨에서 환경 변수/Secret으로 관리.

   [MEDIUM] /actuator/health가 인증 없이 외부에 노출
   - 설명: 상태 정보 노출은 공격 표면을 넓힐 수 있다.
   - 제안: IP 제한 또는 ROLE_ADMIN 인증 필요하도록 Security 설정 변경.

3. 즉시 적용 추천 TOP 3
   - 가장 위험도가 높고 수정 난이도가 낮은 3개 항목을 선정해, 우선 적용하도록 권장한다.    
```
