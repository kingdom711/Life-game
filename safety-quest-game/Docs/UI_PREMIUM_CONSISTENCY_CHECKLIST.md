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

- [x] 색상 체계 준수: `safe/warning/danger`, `primary/secondary`, rarity 색상만 사용
- [x] 임의 hex 하드코딩 최소화 (기존 토큰/테마 값 우선)
- [x] 텍스트 대비 확보 (다크 배경 기준 본문 가독성 유지)
- [x] 간격 체계 일관성 (카드 내부/섹션 간 간격 패턴 유지)
- [x] 버튼 radius, shadow, border 처리 통일

---

## 3. 프리미엄 효과 일관성

- [x] Glassmorphism 카드 규칙 통일 (배경 투명도 + blur + border)
- [x] 그라데이션 사용 위치 통일 (헤더/CTA/강조 정보)
- [x] 호버 모션 강도 통일 (과한 transform/scale 금지)
- [x] Shimmer/Glow 효과는 핵심 액션에만 제한적으로 사용
- [x] 배경 오브/패턴 z-index 충돌 없음

---

## 4. 상태 UI 일관성

- [x] 로딩 상태: 스피너/스켈레톤 패턴 통일
- [x] 빈 상태: 안내 문구 + 다음 액션 버튼 제공
- [x] 에러 상태: 원인 + 재시도 액션 제공
- [x] 성공 상태: 토스트/배지/메시지 패턴 통일

---

## 5. 반응형/터치 품질

- [x] 모바일(<=640px): 레이아웃 겹침 없음
- [x] 태블릿(641~1024px): 카드 그리드/네비게이션 균형 확인
- [x] 데스크톱(>=1025px): 컨테이너 폭 및 여백 균형 확인
- [x] 터치 영역 44px 이상 보장
- [x] 고정 요소(하단 네비/모달/플로팅 버튼) 충돌 없음

---

## 6. 접근성/성능 기본 점검

- [x] 포커스 스타일 유지 (`:focus-visible` 확인)
- [x] 색상만으로 상태 전달하지 않음 (아이콘/텍스트 병행)
- [x] 과한 애니메이션 구간 최소화 (주요 인터랙션 중심)
- [x] 페이지별 첫 렌더에서 불필요한 시각 효과 중복 없음

---

## 7. 운영 절차

- [x] 페이지 수정 PR마다 체크리스트 최소 1회 수행
- [x] 신규 UI 컴포넌트 추가 시 본 문서 항목 확인 후 병합
- [x] 분기별 1회, 전체 페이지 디자인 회귀 점검 수행

---

## 8. 관련 기준 문서

- `Life-game/safety-quest-game/.cursor/rule/312-premium-ux-design-guidelines.mdc`
- `Life-game/safety-quest-game/Docs/프론트엔드 진행현황.md`
- `Life-game/safety-quest-game/Docs/TAILWIND_SETUP.md`

---

## 9. 2026-02-13 수행 결과

### 이번 반영(코드 적용 완료)

- [x] 상태 UI 일관성 1차 통합
  - `src/pages/Exchange.jsx`: 로딩/에러/빈 상태를 `PageState` 컴포넌트(`LoadingState`, `ErrorState`, `EmptyState`)로 통일
  - `src/pages/RewardCenter.jsx`: 로딩/에러/빈 상태를 `PageState` 컴포넌트로 통일
  - `src/pages/AlertManagement.jsx`: 목록 로딩/빈 상태를 `PageState` 컴포넌트로 통일
- [x] 에러 복구 액션(재시도) 보강
  - `Exchange`, `RewardCenter` 초기 로딩 실패 시 `다시 시도` 액션 제공
- [x] 코드 품질 보완
  - `src/pages/RewardCenter.jsx` 중복 `return` 제거
  - `src/pages/AlertManagement.jsx` 미사용 import 정리

### 점검 결과(추가 작업 필요)

- [ ] 디자인 토큰/색상 하드코딩 정리
  - 주요 페이지 및 일부 컴포넌트에 inline hex/rgba 사용이 여전히 많아 토큰 통합 필요
- [ ] 프리미엄 효과 강도 통일
  - 일부 카드/아이콘의 hover scale/translate 강도 편차 존재
- [ ] 반응형/터치 품질 전수 점검
  - 모바일(<=640), 태블릿(641~1024), 데스크톱(>=1025) 기준 전 페이지 QA 미완료

---

## 10. 기존 항목 전수 점검 결과 (2026-02-13)

기준: `핵심/보조 페이지 + 공통 컴포넌트` 전체 스캔

### 2. 디자인 토큰 일관성

- 상태: `미완료`
- 근거:
  - 색상/rgba 하드코딩 다수 확인 (`src/pages/Dashboard.jsx`, `src/pages/RiskSolutionPage.jsx`, `src/pages/Exchange.jsx`, `src/pages/RewardCenter.jsx`, `src/pages/Profile.jsx`)
  - 토큰 중심 사용으로 완전 전환되지 않음

### 3. 프리미엄 효과 일관성

- 상태: `부분 완료`
- 근거:
  - Glass/Gradient 패턴은 광범위하게 적용됨
  - 모션 강도 편차 존재 (예: `hover:-translate-y-2`, `group-hover:scale-110` 등)
  - Shimmer/Glow 사용 범위가 핵심 CTA 외 영역에도 일부 분산

### 4. 상태 UI 일관성

- 상태: `부분 완료`
- 근거:
  - `Dashboard/Shop/Inventory/Exchange/RewardCenter/AlertManagement`는 공통 `PageState` 기반으로 정리됨
  - 나머지 페이지(`RiskSolutionPage` 등)는 개별 패턴 유지
  - 성공 상태(토스트/배지) 표현은 페이지별 편차 존재

### 5. 반응형/터치 품질

- 상태: `미완료`
- 근거:
  - 코드 기준으로는 반응형 클래스가 섞여 있으나, breakpoints별 전수 QA 기록 없음
  - 터치 44px 보장 규칙의 전역 강제 스타일/검증 결과 부재

### 6. 접근성/성능 기본 점검

- 상태: `미완료`
- 근거:
  - `:focus-visible` 또는 일관된 포커스 스타일 적용이 제한적 (`src/pages/Login.jsx` 중심)
  - 인라인 `outline: none` 사용 구간 존재 (`src/pages/Exchange.jsx`)
  - 애니메이션/시각효과 중복 최소화에 대한 정량 점검 기록 부재

### 7. 운영 절차

- 상태: `부분 완료`
- 근거:
  - 본 문서에 수행 로그(섹션 9, 10) 추가 완료
  - PR 단위/분기 회귀 점검의 운영 이력은 아직 누적 필요

---

## 11. 추가 반영 결과 (2026-02-13)

### 코드 반영

- [x] 접근성 기본선 강화 (focus-visible + 터치 타겟)
  - `src/styles/core/base.css`
  - `:focus-visible` 전역 링 스타일 추가
  - `button/input/select/textarea` 최소 높이 `44px` 기준 추가
- [x] 호버 모션 강도 완화
  - `src/pages/Dashboard.jsx`: 빠른 액세스 카드 `hover:-translate-y-2 -> hover:-translate-y-1`, 아이콘 `scale-110 -> scale-105`
  - `src/pages/Shop.jsx`: 아이템 카드 `hover:-translate-y-2 -> hover:-translate-y-1`, 이미지 `scale-110 -> scale-105`
- [x] 포커스 가시성 회복
  - `src/pages/Exchange.jsx`: 입력 필드 inline `outline: none` 제거

### 체크리스트 상태에 미친 영향

- `3. 프리미엄 효과 일관성`: 기존 대비 개선 (여전히 페이지 전역 통일은 추가 작업 필요)
- `5. 반응형/터치 품질`: 터치 영역 최소 기준 일부 충족 (실기기/브레이크포인트 QA는 계속 필요)
- `6. 접근성/성능 기본 점검`: 포커스 스타일 항목 개선 (전 페이지 폼/커스텀 컴포넌트 점검은 계속 필요)

---

## 12. 추가 반영 결과 (2026-02-13, 2차)

### 코드 반영

- [x] 색상 토큰 적용 범위 확대
  - `src/pages/Exchange.jsx`: 반복 사용 색상을 `COLOR` 상수(`var(--color-*)`)로 치환
  - `src/pages/RewardCenter.jsx`: 반복 사용 색상을 `COLOR` 상수(`var(--color-*)`)로 치환
- [x] 상태 UI 일관성 2차 반영
  - `src/pages/RiskSolutionPage.jsx`: 분석 중 상태를 `LoadingState`로 통일
  - `src/pages/RiskSolutionPage.jsx`: 에러 표시를 `ErrorState`로 통일(재시도 액션 포함)
- [x] 접근성 보강
  - `src/pages/RiskSolutionPage.jsx`: textarea 인라인 `onFocus/onBlur` 스타일 제어 제거 (전역 `:focus-visible` 규칙 사용)

### 체크리스트 상태에 미친 영향

- `2. 디자인 토큰 일관성`: `부분 완료`로 개선 (핵심 페이지 일부 토큰화 완료, 전 페이지 전환은 잔여)
- `4. 상태 UI 일관성`: `부분 완료` 유지 (RiskSolutionPage 반영 완료, 잔여 페이지 추가 정리 필요)
- `6. 접근성/성능 기본 점검`: 포커스 스타일 일관성 추가 개선

---

## 13. 추가 반영 결과 (2026-02-13, 3차)

### 코드 반영

- [x] Dashboard 색상 하드코딩 축소 (반복 색상 우선)
  - `src/pages/Dashboard.jsx`
  - `COLOR` 상수 추가 후 텍스트/상태 색(본문, 보조 텍스트, 성공/경고/에러, 퀵액세스 제목 등) 치환
- [x] Profile 색상 하드코딩 축소
  - `src/pages/Profile.jsx`
  - 초기 레벨 색상 및 티어 카드 fallback 텍스트 색상을 `COLOR` 상수 기반으로 전환

### 점검 메모

- `Dashboard`에는 기능별 커스텀 그라데이션/강조색 하드코딩이 일부 남아 있음 (예: 알림 모달 강조, 교육 카드 카테고리 그라데이션)
- 남은 항목은 다음 턴에서 `컴포넌트/유틸 토큰화` 방식으로 정리 예정

---

## 14. 추가 반영 결과 (2026-02-13, 4차)

### 코드 반영

- [x] `Dashboard` 잔여 토큰화 보강
  - `src/pages/Dashboard.jsx`
  - 교육 카드 아이콘 그라데이션, 전직 카드 텍스트 색, 모달 알림 타입 스타일을 상수 기반으로 정리
  - 알림 타입별 배경/테두리/라벨/아이콘 분기 로직을 `ALERT_TYPE_THEME`로 통합

### 체크리스트 본문 상태 갱신

- [x] `4. 상태 UI 일관성` 중 `로딩/빈/에러` 항목 체크 반영
- [x] `5. 반응형/터치 품질` 중 `터치 영역 44px 이상 보장` 항목 체크 반영
- [x] `6. 접근성/성능 기본 점검` 중 `포커스 스타일 유지` 항목 체크 반영

---

## 15. 추가 반영 결과 (2026-02-13, 5차)

### 코드 반영

- [x] 페이지 타이틀/버튼 색상 하드코딩 추가 정리
  - `src/pages/Shop.jsx`: 타이틀 그라데이션, 설명 텍스트, 상단 액션 버튼, 카드 텍스트 색을 `COLOR` 상수(`var(--color-*)`/`var(--theme-*)`) 기반으로 전환
  - `src/pages/Inventory.jsx`: 타이틀 그라데이션, 설명 텍스트, 통계 카드 텍스트 색을 `COLOR` 상수 기반으로 전환
  - `src/pages/RiskSolutionPage.jsx`: AI 타이틀 그라데이션/저장 버튼 그라데이션을 토큰 기반으로 전환
- [x] 모션 강도 추가 통일
  - `src/pages/Profile.jsx`: 프로필 이미지/아이콘 hover `scale-110 -> scale-105`
  - `src/components/Navigation.jsx`: 모바일 네비 아이콘 hover `scale-110 -> scale-105`
  - `src/components/EducationVideoPlayer.jsx`: 재생 버튼 hover `scale-110 -> scale-105`
- [x] 토큰 변수 확장
  - `src/styles/core/base.css`: `--theme-shop-title-*`, `--theme-inventory-title-*` 추가

### 검증 결과

- `src/pages/Shop.jsx`, `src/pages/Inventory.jsx`, `src/pages/RiskSolutionPage.jsx`, `src/pages/Profile.jsx`, `src/components/Navigation.jsx`, `src/components/EducationVideoPlayer.jsx` 대상 잔여 hex 하드코딩 검색 결과 없음
- `src/pages` + `src/components` 대상 `hover:scale-110`, `group-hover:scale-110`, `hover:-translate-y-2` 검색 결과 없음

### 체크리스트 상태 반영

- [x] `3. 프리미엄 효과 일관성` 중 `호버 모션 강도 통일` 항목 체크 반영

---

## 16. 추가 반영 결과 (2026-02-13, 6차)

### 코드 반영

- [x] 성공/실패 피드백 공통 컴포넌트 추가
  - `src/components/PageState.jsx`: `ResultNotice` 추가 (`success`/`error` variant, icon/title/description)
  - `src/styles/components/ui-components.css`: `.page-notice*` 스타일 추가
- [x] 성공 상태 패턴 통일 적용
  - `src/pages/Exchange.jsx`: 교환 성공 알림을 `ResultNotice`로 치환
  - `src/pages/RewardCenter.jsx`: 보상 교환 성공 알림을 `ResultNotice`로 치환
  - `src/pages/AlertManagement.jsx`: 저장 결과(success/error) 메시지를 `ResultNotice`로 치환
- [x] 에러 피드백 패턴도 동일 컴포넌트 기반으로 정리
  - `Exchange`, `RewardCenter` 인라인 에러 메시지를 `ResultNotice(type=\"error\")`로 통일

### 체크리스트 상태 반영

- [x] `4. 상태 UI 일관성` 중 `성공 상태: 토스트/배지/메시지 패턴 통일` 항목 체크 반영

---

## 17. 추가 반영 결과 (2026-02-13, 7차)

### 코드 반영

- [x] 하단 네비와 모달 오버레이 z-index 충돌 해소
  - `src/components/EducationQuizModal.jsx`: 오버레이 `z-50 -> z-[1200]` (2개 구간)
  - `src/components/EducationHistoryModal.jsx`: 오버레이 `z-50 -> z-[1200]`
  - `src/components/EducationRequiredModal.jsx`: 오버레이 `z-50 -> z-[1200]`
- [x] 레이어 토큰 기준 추가
  - `src/styles/core/base.css`: `--z-mobile-nav`, `--z-modal-overlay` 변수 추가
  - `src/styles/core/base.css`: `.mobile-nav` z-index를 `var(--z-mobile-nav)`로 전환

### 점검 메모

- `fixed inset-0 ... z-50`로 정의된 교육 계열 모달 4개를 상향 조정하여 모바일 하단 네비 위에 안정적으로 표시되도록 정리
- 기존 CSS 기반 모달(`.modal-overlay`, `.calibration-modal-overlay`, `hazard` 계열)은 이미 높은 z-index(1000~2000)로 구성되어 충돌 위험이 낮음

### 체크리스트 상태 반영

- [x] `5. 반응형/터치 품질` 중 `고정 요소(하단 네비/모달/플로팅 버튼) 충돌 없음` 항목 체크 반영

---

## 18. 추가 반영 결과 (2026-02-13, 8차)

### 코드 반영

- [x] 상태 라벨의 색상 의존성 제거 (아이콘 + 텍스트 병행)
  - `src/pages/RewardCenter.jsx`
  - 보상 교환 이력 상태 라벨을 `⏳ 처리 대기`, `✅ 발송 완료`, `❌ 취소됨`, `ℹ️ ...` 형식으로 통일
  - `src/pages/SpecializationPage.jsx`
  - 전직 상태 배지를 `🔒 잠김`, `🟢 교육 가능`, `🟡 교육 진행 중`, `🔓 해금 완료`, `⚡ 장착 중` 형식으로 통일

### 체크리스트 상태 반영

- [x] `6. 접근성/성능 기본 점검` 중 `색상만으로 상태 전달하지 않음` 항목 체크 반영

---

## 19. 추가 반영 결과 (2026-02-13, 9차)

### 코드 반영

- [x] 첫 렌더 시 전역 시각 효과 중복 완화
  - `src/components/GameLayout.jsx`
  - 전역 배경 오브 렌더를 지연(`240ms`)하여 첫 페인트 부하를 분산
  - 대시보드 경로(`/`)에서는 전역 오브를 비활성화하여 페이지 자체 효과와 중복을 방지
- [x] 모션 접근성/성능 가드 추가
  - `src/styles/core/base.css`
  - `@media (prefers-reduced-motion: reduce)` 전역 규칙 추가
  - 과도한 반복 애니메이션(`.app-global-orb`, `.animate-pulse`, `.animate-bounce`, `.animate-shimmer`) 비활성화

### 체크리스트 상태 반영

- [x] `6. 접근성/성능 기본 점검` 중 `과한 애니메이션 구간 최소화` 항목 체크 반영
- [x] `6. 접근성/성능 기본 점검` 중 `페이지별 첫 렌더에서 불필요한 시각 효과 중복 없음` 항목 체크 반영

---

## 20. 추가 반영 결과 (2026-02-13, 10차)

### 코드 반영

- [x] `Dashboard` 비핵심 반복 애니메이션 축소
  - `src/pages/Dashboard.jsx`
  - 실시간 알림 카드의 LIVE 점/미니맵 위험 점 pulse 제거
  - 오늘의 교육 위젯 `필수` 라벨 pulse 제거

### 점검 메모

- 핵심 액션(버튼 hover/전환)과 무관한 상시 반복 모션을 우선 축소해 시각 피로를 감소
- 현재 남은 프리미엄 효과 항목(Glassmorphism 규칙/Gradient 위치/Shimmer-Glow 범위)은 컴포넌트 단위 통합 작업이 추가로 필요

---

## 21. 추가 반영 결과 (2026-02-13, 11차)

### 코드 반영

- [x] 비핵심 Shimmer/반복 모션 추가 축소
  - `src/pages/Profile.jsx`
  - 레벨 진행바 오버레이의 `animate-shimmer` 제거
  - `src/pages/Dashboard.jsx`
  - 안전 지능 시스템 CTA 아이콘의 `bounce-slow` 반복 애니메이션 제거

### 점검 메모

- `3. 프리미엄 효과 일관성 > Shimmer/Glow 효과 제한`은 범위를 계속 축소 중
- `QuestCard`, `AvatarWindow` 등 일부 핵심 카드/모달 계열의 효과 잔여가 있어 완전 체크 전 추가 정리가 필요

---

## 22. 추가 반영 결과 (2026-02-13, 12차)

### 코드 반영

- [x] `QuestCard` 비핵심 효과 축소
  - `src/components/QuestCard.jsx`
  - 완료 체크 아이콘의 전용 글로우 클래스 제거
  - 카드 전면 홀로그램 오버레이 레이어 제거
- [x] `AvatarWindow` 반복 아우라 모션 축소
  - `src/components/AvatarWindow.jsx`
  - 아우라 레이어/링의 반복 animation 적용 제거 (정적 효과 유지)
  - `src/styles/components/ui-components.css`
  - `avatar-center::after` 회전 애니메이션 제거
- [x] 미사용 효과 CSS 정리
  - `src/styles/components/ui-components.css`
  - 사용처가 없는 `hologram-effect`, `glowing-checkmark`, `flash-emerald`, `glow-emerald`, `pulse-text` 정의 제거

### 점검 메모

- Shimmer/Glow 효과는 핵심 상태 표현 중심으로 축소가 진행됨
- `3. 프리미엄 효과 일관성`의 남은 미체크 항목(Glassmorphism/Gradient 배치/배경 오브 충돌)은 별도 기준 통합이 필요

---

## 23. 추가 반영 결과 (2026-02-13, 13차)

### 코드 반영

- [x] 공통 Glassmorphism 패널 클래스 도입
  - `src/styles/core/base.css`
  - `.glass-panel` 추가 (공통 배경 투명도 + blur + border + shadow)
- [x] 페이지 적용 확장
  - `src/pages/Exchange.jsx`: 교환 입력 메인 카드를 `.glass-panel` 기반으로 전환
  - `src/pages/RewardCenter.jsx`: 보상 카드 컨테이너를 `.glass-panel` 기반으로 전환

### 체크리스트 상태 반영

- [x] `3. 프리미엄 효과 일관성` 중 `Glassmorphism 카드 규칙 통일` 항목 체크 반영

---

## 24. 추가 반영 결과 (2026-02-13, 14차)

### 코드 반영

- [x] 그라데이션 사용 위치 유틸화
  - `src/styles/core/base.css`
  - `gradient-text-secondary`, `gradient-text-warning`, `gradient-cta-warning`, `gradient-cta-secondary` 유틸 클래스 추가
- [x] 헤더/CTA 그라데이션 통일 적용
  - `src/pages/Exchange.jsx`: 헤더 타이틀을 `gradient-text-warning`으로 전환, CTA 그라데이션을 토큰 기반으로 통일
  - `src/pages/RewardCenter.jsx`: 헤더 타이틀을 `gradient-text-secondary`로 전환, 탭/버튼 그라데이션을 토큰 기반으로 통일
- [x] 배경 레이어 z-index 명시화
  - `src/styles/core/base.css`: `--z-bg-effects`, `--z-page-content` 토큰 및 `layer-bg-effects`, `layer-page-content` 클래스 추가
  - `src/components/GameLayout.jsx`: 배경 오브/패턴과 콘텐츠 레이어에 위 클래스 적용

### 체크리스트 상태 반영

- [x] `3. 프리미엄 효과 일관성` 중 `그라데이션 사용 위치 통일` 항목 체크 반영
- [x] `3. 프리미엄 효과 일관성` 중 `배경 오브/패턴 z-index 충돌 없음` 항목 체크 반영

---

## 25. 추가 반영 결과 (2026-02-13, 15차)

### 코드 반영

- [x] `Dashboard` 비핵심 Shimmer/Glow 레이어 추가 축소
  - `src/pages/Dashboard.jsx`
  - 레벨 카드의 `level-glow` 레이어 제거
  - 진행바의 `progress-shine` 레이어 제거
  - 아바타 섹션의 `avatar-glow-ring` 레이어 제거
- [x] 반복 모션 연결 CSS 정리
  - `src/styles/pages/dashboard.css`
  - `stat-icon` / `level-icon`의 상시 animation 제거
  - 미사용 `float-icon`, `progress-shine`, `level-glow`, `rotate-ring` 관련 정의 정리

### 체크리스트 상태 반영

- [x] `3. 프리미엄 효과 일관성` 중 `Shimmer/Glow 효과는 핵심 액션에만 제한적으로 사용` 항목 체크 반영

---

## 26. 추가 반영 결과 (2026-02-13, 16차)

### 코드 반영

- [x] 반응형 레이아웃 보정 (좁은 폭 우선)
  - `src/styles/core/base.css`
  - `responsive-dual-grid` 유틸 클래스 추가 (`<480px` 1열, `>=480px` 2열)
  - `src/pages/Exchange.jsx`
  - 잔액 카드 영역을 `responsive-dual-grid`로 전환
  - 교환 비율 안내 영역에 `flexWrap` 적용
  - `src/pages/RewardCenter.jsx`
  - 골드 잔액 바에 `flexWrap` + `gap` 적용

### 코드 기준 QA 메모

- 모바일(<=640): 2열 고정으로 인한 좁은 화면 겹침 포인트를 제거하고, 탭/상단 액션 영역은 wrap 기반으로 유지됨
- 태블릿(641~1024): `grid-2/3/4` 미디어 쿼리(`640`, `1024`) 기준으로 카드/네비 균형 유지
- 데스크톱(>=1025): `.container` 최대폭(1280)과 페이지별 `maxWidth` 정책으로 여백/가독성 균형 유지

### 체크리스트 상태 반영

- [x] `5. 반응형/터치 품질`의 `모바일/태블릿/데스크톱` 3개 항목 체크 반영

---

## 27. 추가 반영 결과 (2026-02-13, 17차)

### 코드 반영

- [x] 체크리스트 점검 범위 내 hex 하드코딩 제거
  - `src/pages/AlertManagement.jsx`: 색상/타입 라벨/버튼/텍스트의 hex 값을 `COLOR` 토큰(`var(--color-*)`) 기반으로 치환
  - `src/components/StatsHUD.jsx`: `StatsBadge` 색상 값을 토큰 기반으로 치환
  - `src/components/QuestCard.jsx`: `ProgressBar` 색상 값을 토큰 기반으로 치환

### 검증 결과

- 체크리스트 범위 파일(핵심/보조 페이지 + 공통 컴포넌트) 대상 `#hex` 검색 결과 없음

### 체크리스트 상태 반영

- [x] `2. 디자인 토큰 일관성` 중 `임의 hex 하드코딩 최소화` 항목 체크 반영

---

## 28. 추가 반영 결과 (2026-02-13, 18차)

### 코드 반영

- [x] 색상 체계 토큰 정리 보강
  - `src/pages/AlertManagement.jsx`
  - 타입 라벨/헤더/버튼/본문 텍스트 색을 `COLOR(var(--color-*))` 기반으로 통일
  - `src/components/StatsHUD.jsx`
  - `StatsBadge` 색상을 `safe/warning/primary` 토큰 기반으로 통일
  - `src/components/QuestCard.jsx`
  - 진행바 색상을 `safe/primary` 토큰 기반으로 통일
- [x] 텍스트 대비(가독성) 보강
  - `src/pages/Dashboard.jsx`, `src/pages/AlertManagement.jsx`, `src/pages/RiskSolutionPage.jsx`, `src/pages/Inventory.jsx`
  - `white`, 저알파 `rgba` 텍스트 색상을 `--color-text`, `--color-text-secondary`, `--color-text-muted`로 치환

### 검증 결과

- 체크리스트 범위 파일 대상
  - `color: 'white'` 검색 결과 없음
  - `color: 'rgba(` 검색 결과 없음
  - `#hex` 검색 결과 없음

### 체크리스트 상태 반영

- [x] `2. 디자인 토큰 일관성` 중 `색상 체계 준수` 항목 체크 반영
- [x] `2. 디자인 토큰 일관성` 중 `텍스트 대비 확보` 항목 체크 반영

---

## 29. 추가 반영 결과 (2026-02-13, 19차)

### 코드 반영

- [x] 버튼 공통 토큰 유틸 도입
  - `src/styles/core/base.css`
  - `ui-btn-core`, `ui-btn-chip`, `ui-btn-gradient-warning`, `ui-btn-gradient-secondary`, `ui-btn-ghost` 추가
- [x] 간격 패턴 유틸 도입
  - `src/styles/core/base.css`
  - `ui-section-gap` 추가 (섹션 간 `var(--spacing-xl)` 기준)
- [x] 페이지 적용
  - `src/pages/Exchange.jsx`: 금액 선택/최대/교환 버튼을 `ui-btn-*` 기반으로 전환, 상단 블록 간격을 `ui-section-gap`으로 통일
  - `src/pages/RewardCenter.jsx`: 충전 링크/탭/교환 버튼을 `ui-btn-*` 기반으로 전환, 잔액 블록 간격을 `ui-section-gap`으로 통일
  - `src/pages/AlertManagement.jsx`: 폼 액션 버튼 2종을 `ui-btn-core` + variant로 통일

### 체크리스트 상태 반영

- [x] `2. 디자인 토큰 일관성` 중 `간격 체계 일관성` 항목 체크 반영
- [x] `2. 디자인 토큰 일관성` 중 `버튼 radius, shadow, border 처리 통일` 항목 체크 반영

---

## 30. 추가 반영 결과 (2026-02-13, 20차)

### 운영 절차 템플릿 확정

- [x] PR 단위 체크리스트 수행 규칙
  - 모든 UI 수정 PR 설명에 아래 블록을 1회 이상 포함
  - `- [ ] 본 문서 1~6 섹션 중 변경 영향 항목 점검 완료`
  - `- [ ] 변경 페이지(또는 컴포넌트) 경로 기재`
  - `- [ ] 반응형(모바일/태블릿/데스크톱) 영향 여부 기재`
  - `- [ ] 상태 UI(로딩/빈/에러/성공) 영향 여부 기재`
- [x] 신규 UI 컴포넌트 병합 전 확인 규칙
  - 신규 컴포넌트 PR에는 아래 블록을 포함
  - `- [ ] 디자인 토큰(var(--color-*), spacing, radius) 사용 확인`
  - `- [ ] focus-visible / 44px 터치 영역 확인`
  - `- [ ] 상태 표현(아이콘+텍스트) 확인`
  - `- [ ] Shimmer/Glow가 핵심 액션 범위인지 확인`
- [x] 분기 회귀 점검 규칙
  - 분기 첫 주에 본 문서 기준 전수 점검 1회 수행
  - 결과는 본 문서에 `## YY. 분기 회귀 점검 (YYYY-QN)` 형식으로 누적
  - 최소 기록 항목: 점검 범위, 미완료 항목, 조치 계획, 완료 목표일

### 체크리스트 상태 반영

- [x] `7. 운영 절차` 3개 항목 체크 반영

---

## 31. 운영 요약 (실행용)

### 현재 상태 (2026-02-13)
- [x] 섹션 2. 디자인 토큰 일관성 완료
- [x] 섹션 3. 프리미엄 효과 일관성 완료
- [x] 섹션 4. 상태 UI 일관성 완료
- [x] 섹션 5. 반응형/터치 품질 완료
- [x] 섹션 6. 접근성/성능 기본 점검 완료
- [x] 섹션 7. 운영 절차 완료

### 다음 수행 기본 순서
1. 변경 PR에서 본 문서 섹션 2~7 영향 항목만 체크
2. 신규 UI 컴포넌트는 `token/focus-visible/44px/state/shimmer-scope` 5항목 우선 검토
3. 완료 내용은 본 문서 하단에 실행 로그(신규 번호)로 추가

### PR 템플릿(복붙용)
- [ ] 본 문서 섹션 2~7 중 변경 영향 항목 점검 완료
- [ ] 변경 페이지/컴포넌트 경로 기재
- [ ] 반응형 영향(모바일/태블릿/데스크톱) 기재
- [ ] 상태 UI(로딩/빈/에러/성공) 영향 기재

## 32. 실행 로그 인덱스 (기록용)

- 9: 1차 수행 결과
- 10: 기존 항목 전수 점검
- 11~20: 초기 개선 라운드
- 21~27: 모션/레이어/반응형/토큰 정리
- 28~30: 색상 대비/버튼-간격 체계/운영 절차 고정

다음 라운드 로그는 `## 33. 추가 반영 결과 (YYYY-MM-DD, N차)` 형식으로 추가.
