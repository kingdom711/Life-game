# Tailwind CSS 설정 완료 가이드

## ✅ 완료된 작업

1. **패키지 설치**
   - `tailwindcss`
   - `postcss`
   - `autoprefixer`

2. **설정 파일 생성**
   - `tailwind.config.js` - Tailwind 설정 (프로젝트 색상 포함)
   - `postcss.config.js` - PostCSS 설정

3. **CSS 통합**
   - `src/styles/index.css`에 Tailwind 지시문 추가
   - 기존 CSS 변수 및 스타일 유지 (호환성 보장)
   - (2026-02-13) 단일 스타일 파일 분리: `index.css`를 import 허브로 전환

4. **컴포넌트 예시**
   - `src/components/QuestCard.jsx`에 Tailwind 클래스 적용 예시

## 🚀 사용 방법

### 1. 개발 서버 재시작

Tailwind CSS가 적용되려면 개발 서버를 재시작해야 합니다:

```bash
npm run dev
```

### 2. Tailwind 클래스 사용 예시

이제 모든 컴포넌트에서 Tailwind 유틸리티 클래스를 사용할 수 있습니다:

```jsx
// Glassmorphism 효과
<div className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-xl p-6">

// 반응형 디자인
<div className="flex flex-col md:flex-row gap-4">

// 호버 효과
<button className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300">

// 그라데이션
<div className="bg-gradient-to-r from-blue-500 to-blue-600">
```

### 3. 기존 CSS와의 호환성

- 기존 CSS 클래스 (`.card`, `.btn-primary` 등)는 계속 사용 가능
- Tailwind 클래스와 기존 CSS 클래스를 함께 사용 가능
- 점진적으로 마이그레이션 가능

### 4. 스타일 파일 구조 (2026-02-13 업데이트)

기존 `src/styles/index.css` 단일 파일 구조를 유지보수 가능한 모듈 구조로 분리했습니다.

```text
src/styles/
├── index.css                      # Tailwind + 모듈 import 허브
├── core/
│   └── base.css                   # 변수/리셋/타이포/레이아웃/공통 유틸
├── components/
│   └── ui-components.css          # 모달/카드/버튼/퀘스트 등 컴포넌트 스타일
├── features/
│   └── item-systems.css           # 검교정/Stats HUD/인벤토리 확장 스타일
└── pages/
    └── dashboard.css              # 대시보드 전용 프리미엄 스타일
```

운영 원칙:
- 공통 토큰/유틸: `core/base.css`
- 특정 기능군 스타일: `components` 또는 `features`
- 페이지 전용 스타일: `pages`
- 새 파일은 `index.css`에서 import 순서를 유지하며 추가

## 📋 Tailwind 설정 내용

### 커스텀 색상

프로젝트의 기존 색상이 Tailwind에 통합되었습니다:

- `safe`, `safe-light`, `safe-dark`
- `warning`, `warning-light`, `warning-dark`
- `danger`, `danger-light`, `danger-dark`
- `primary`, `primary-light`, `primary-dark`
- `secondary`, `secondary-light`, `secondary-dark`
- `common`, `rare`, `epic`, `legendary` (아이템 희귀도)

### 커스텀 애니메이션

- `animate-fade-in` - 페이드 인 (0.8s)
- `animate-fade-in-fast` - 빠른 페이드 인 (0.3s)
- `animate-float` - 플로팅 애니메이션 (6s)
- `animate-float-slow` - 느린 플로팅 (8s)
- `animate-pulse-glow` - 펄스 글로우 (3s)

## 🎨 프리미엄 UX 가이드라인 적용

이제 `.cursor/rule/312-premium-ux-design-guidelines.mdc`의 가이드라인을 그대로 사용할 수 있습니다:

```jsx
// Glass Card 예시
<div className="glass-card border border-indigo-500/20 rounded-xl overflow-hidden 
  backdrop-blur-xl bg-gradient-to-br from-white/5 via-white/3 to-transparent 
  shadow-xl shadow-indigo-900/10 hover:shadow-2xl hover:shadow-indigo-900/20 
  transition-all duration-500 group relative">
  {/* 콘텐츠 */}
</div>

// 그라데이션 텍스트
<h1 className="text-4xl font-bold text-white mb-3 
  bg-gradient-to-r from-white via-indigo-100 to-white 
  bg-clip-text text-transparent leading-tight">
  제목
</h1>
```

## 📝 다음 단계

1. **개발 서버 재시작**: `npm run dev`
2. **컴포넌트 마이그레이션**: 점진적으로 기존 컴포넌트에 Tailwind 클래스 적용
3. **일관성 점검**: `Docs/UI_PREMIUM_CONSISTENCY_CHECKLIST.md` 기반 페이지별 점검
4. **가이드라인 적용**: 프리미엄 UX 가이드라인의 패턴을 프로젝트에 적용

## ⚠️ 주의사항

- 기존 CSS 클래스는 그대로 유지되므로 기존 기능은 정상 작동합니다
- Tailwind와 기존 CSS가 충돌할 경우, Tailwind가 우선순위가 높습니다
- 점진적으로 마이그레이션하는 것을 권장합니다

