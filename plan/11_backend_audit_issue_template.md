# [Backend] 보안/설계/성능/가독성/중복 개선 계획 수립 및 단계적 적용

## 목적
backend 모듈의 현재 구조를 기준으로, 운영 리스크를 낮추고 유지보수성을 높이기 위한 개선 계획을 수립하고 단계적으로 적용한다.

## 수정할 내용
- 분석 문서 작성: `plan/11_backend_audit_improvement_plan.md`
- 우선순위 기반 개선 범위 정의
  - P0: 기본 admin 계정 정책 개선, JWT secret fail-fast, 로그 보안 강화, 신뢰 IP 정책 명확화
  - P1: 예외 계층 정리, 디렉토리 조회 성능 개선(limit/page), 환경별 설정 분리, 공통 IP resolver 도입
  - P2: 캐시 고도화(ETag/Last-Modified), 관측성 강화, 리팩토링 가이드 문서화

## 예상되는 결과
- 보안 리스크 즉시 감소 (초기 계정/JWT 키/로그 노출)
- 운영 환경 성능 및 안정성 개선 (불필요 SQL 로그, 대용량 목록 조회 개선)
- 코드 가독성/일관성 향상 (예외 정책, 공통 유틸, 컨벤션 정리)

## 참고 파일
- `plan/11_backend_audit_improvement_plan.md`
- `backend/src/main/resources/application.yml`
- `backend/src/main/java/com/manas/backend/context/auth/infrastructure/config/DataInitializer.java`
- `backend/src/main/java/com/manas/backend/context/auth/infrastructure/security/IpEnforcementFilter.java`
- `backend/src/main/java/com/manas/backend/context/file/infrastructure/fs/LocalFileSystemAdapter.java`
