# #39 구현 계획 - wg-easy 이미지 버전 pinning

## 수정 목적
- VPN 컨테이너 버전 변동 리스크를 줄이고 배포 재현성을 높인다.

## 수정할 부분
1. `docker-compose.yml`
   - `image: ghcr.io/wg-easy/wg-easy` -> `ghcr.io/wg-easy/wg-easy:${WG_EASY_VERSION}`
2. `.env.example`
   - `WG_EASY_VERSION` 기본값 추가
3. `start.sh`
   - `.env` 생성 시 `WG_EASY_VERSION` 기본값 기입
4. `README`
   - 버전 고정/업그레이드 절차 안내 추가

## 테스트 계획
- `docker-compose config` 렌더링 확인
