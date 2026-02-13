# UI Premium Consistency Checklist

> 작성일: 2026-02-13  
> 목적: 페이지별 프리미엄 UI 품질을 같은 기준으로 점검하기 위한 운영 체크리스트

---

## 1. 점검 범위

- 핵심 페이지: `src/pages/Dashboard.jsx`, `src/pages/Shop.jsx`, `src/pages/Inventory.jsx`, `src/pages/Profile.jsx`, `src/pages/DailyQuests.jsx`, `src/pages/WeeklyQuests.jsx`, `src/pages/MonthlyQuests.jsx`
- 보조 페이지: `src/pages/EducationPage.jsx`, `src/pages/RiskSolutionPage.jsx`, `src/pages/AlertManagement.jsx`, `src/pages/RewardCenter.jsx`, `src/pages/Exchange.jsx`
- 공통 컴포넌트: `src/components/Navigation.jsx`, `src/components/QuestCard.jsx`, `src/components/ProgressBar.jsx`, `src/components/StatsHUD.jsx`, `src/components/CalibrationModal.jsx`

---

## 2. 디자인 토큰 일관성

- [ ] 색상 체계 준수: `safe/warning/danger`, `primary/secondary`, rarity 색상만 사용
- [ ] 임의 hex 하드코딩 최소화 (기존 토큰/테마 값 우선)
- [ ] 텍스트 대비 확보 (다크 배경 기준 본문 가독성 유지)
- [ ] 간격 체계 일관성 (카드 내부/섹션 간 간격 패턴 유지)
- [ ] 버튼 radius, shadow, border 처리 통일

---

## 3. 프리미엄 효과 일관성

- [ ] Glassmorphism 카드 규칙 통일 (배경 투명도 + blur + border)
- [ ] 그라데이션 사용 위치 통일 (헤더/CTA/강조 정보)
- [ ] 호버 모션 강도 통일 (과한 transform/scale 금지)
- [ ] Shimmer/Glow 효과는 핵심 액션에만 제한적으로 사용
- [ ] 배경 오브/패턴 z-index 충돌 없음

---

## 4. 상태 UI 일관성

- [ ] 로딩 상태: 스피너/스켈레톤 패턴 통일
- [ ] 빈 상태: 안내 문구 + 다음 액션 버튼 제공
- [ ] 에러 상태: 원인 + 재시도 액션 제공
- [ ] 성공 상태: 토스트/배지/메시지 패턴 통일

---

## 5. 반응형/터치 품질

- [ ] 모바일(<=640px): 레이아웃 겹침 없음
- [ ] 태블릿(641~1024px): 카드 그리드/네비게이션 균형 확인
- [ ] 데스크톱(>=1025px): 컨테이너 폭 및 여백 균형 확인
- [ ] 터치 영역 44px 이상 보장
- [ ] 고정 요소(하단 네비/모달/플로팅 버튼) 충돌 없음

---

## 6. 접근성/성능 기본 점검

- [ ] 포커스 스타일 유지 (`:focus-visible` 확인)
- [ ] 색상만으로 상태 전달하지 않음 (아이콘/텍스트 병행)
- [ ] 과한 애니메이션 구간 최소화 (주요 인터랙션 중심)
- [ ] 페이지별 첫 렌더에서 불필요한 시각 효과 중복 없음

---

## 7. 운영 절차

- [ ] 페이지 수정 PR마다 체크리스트 최소 1회 수행
- [ ] 신규 UI 컴포넌트 추가 시 본 문서 항목 확인 후 병합
- [ ] 분기별 1회, 전체 페이지 디자인 회귀 점검 수행

---

## 8. 관련 기준 문서

- `Life-game/safety-quest-game/.cursor/rule/312-premium-ux-design-guidelines.mdc`
- `Life-game/safety-quest-game/Docs/프론트엔드 진행현황.md`
- `Life-game/safety-quest-game/Docs/TAILWIND_SETUP.md`
