# 안전의 길 — UI 디자인 시스템

> 모든 화면에 동일한 디자인 언어를 적용하기 위한 가이드 문서

---

## 1. 디자인 컨셉

| 항목 | 값 |
|------|-----|
| 테마 | 다크 게이밍 (Sci-Fi / Cyberpunk) |
| 분위기 | 어두운 네이비 기반 + 네온 액센트 |
| 레이아웃 | 단일 컬럼, 최대 너비 600px, 가운데 정렬 |
| 타겟 디바이스 | 모바일 우선 (모든 해상도 동일 레이아웃) |

---

## 2. 컬러 팔레트

### 2.1 배경색

```
기본 배경    : #0f172a  (Slate 900)
카드 배경    : linear-gradient(140deg, rgba(15,23,42,0.92), rgba(20,30,55,0.88))
서피스       : rgba(30, 41, 59, 0.85)
서피스 호버  : rgba(30, 41, 59, 0.95)
```

### 2.2 액센트 컬러

| 용도 | 메인 | 라이트 | 다크 | 용례 |
|------|------|--------|------|------|
| **시안 (Primary)** | `#06b6d4` | `#22d3ee` | `#0891b2` | XP바, CTA 버튼, 퀘스트 테두리 |
| **골드 (Accent)** | `#f59e0b` | `#fbbf24` | `#d97706` | Lv 뱃지, 헤더 장식, 힌트 배너 |
| **그린 (Safe)** | `#059669` | `#34d399` | `#047857` | 교육 완료, 진행바(교육) |
| **블루 (Info)** | `#0ea5e9` | `#38bdf8` | `#0284c7` | 퀘스트 카테고리, 활성 상태 |
| **퍼플 (Secondary)** | `#7c3aed` | `#a78bfa` | `#6d28d9` | 업적 카테고리, 특수 효과 |
| **레드 (Danger)** | `#dc2626` | `#f87171` | `#991b1b` | 작업중지 버튼, 위험 알림 |

### 2.3 텍스트 컬러

```
메인 텍스트      : #f8fafc  (Slate 50)
보조 텍스트      : #cbd5e1  (Slate 300)
비활성 텍스트    : #94a3b8  (Slate 400)
XP 강조 텍스트   : #22d3ee  (Cyan 300)
골드 강조        : #fbbf24  (Amber 400)
```

### 2.4 테두리 컬러

```
기본 테두리      : rgba(148, 163, 184, 0.2)    — 카드 기본
시안 테두리      : rgba(56, 189, 248, 0.25~0.35) — 강조 카드
골드 테두리      : rgba(251, 191, 36, 0.35)     — 힌트/경고
그린 테두리      : rgba(34, 197, 94, 0.35)      — 교육 카테고리
퍼플 테두리      : rgba(168, 85, 247, 0.35)     — 업적 카테고리
```

---

## 3. 레이아웃

### 3.1 페이지 구조

```
┌─────────────────────────────┐
│        [페이지 콘텐츠]         │  ← max-width: 600px
│         margin: 0 auto       │     단일 컬럼
│                              │
│  ┌───────────────────────┐   │
│  │   섹션 카드 1           │   │  ← border-radius: 20px
│  └───────────────────────┘   │
│  ┌───────────────────────┐   │
│  │   섹션 카드 2           │   │  ← gap: 1rem
│  └───────────────────────┘   │
│  ┌───────────────────────┐   │
│  │   섹션 카드 3           │   │
│  └───────────────────────┘   │
│                              │
├─────────────────────────────┤
│  [하단 네비게이션 바]          │  ← position: fixed
└─────────────────────────────┘
         [플로팅 버튼]           ← position: fixed, 우하단
```

### 3.2 CSS 레이아웃 코드

```css
/* 페이지 래퍼 */
.page-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem 0;
}
```

---

## 4. 컴포넌트 패턴

### 4.1 카드 (Card)

모든 섹션의 기본 컨테이너.

```css
.ui-card {
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(140deg, rgba(15,23,42,0.92) 0%, rgba(20,30,55,0.88) 100%);
  backdrop-filter: blur(16px);
  padding: 1.2rem ~ 1.4rem;
  position: relative;
}
```

**변형:**
- **강조 카드** — `border: 2px solid rgba(56, 189, 248, 0.25)` + 상단 그라디언트 라인
- **컬러 카드** — 카테고리별 테두리 색상 + 배경 미세 틴트 (`rgba(색상, 0.06)`)

### 4.2 프로필 카드 (Profile Card)

```
┌──────────────────────────────────────────┐
│                                      [⋮] │  ← 케밥 메뉴 (우상단)
│  ┌──────┐                                │
│  │      │  타이틀 (1.25rem, 800, #f8fafc) │
│  │ 아바타 │  서브타이틀 (0.85rem, #94a3b8)  │
│  │ 100px │                                │
│  │      │                                │
│  └──────┘                                │
│  [Lv.N]     ← 좌하단 골드 뱃지 (44px)      │
│                                          │
│  ████████████░░░░░░░░░░  ← XP바 (12px)    │
│                 16,390 / 40,000 XP        │
└──────────────────────────────────────────┘
```

**XP 프로그레스 바:**
```css
/* 트랙 */
height: 12px;
border-radius: 999px;
background: rgba(15, 23, 42, 0.7);
border: 1px solid rgba(56, 189, 248, 0.15);

/* 채움 */
background: linear-gradient(90deg, #06b6d4, #22d3ee);
box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
```

**레벨 뱃지:**
```css
width: 44px; height: 44px;
border-radius: 50%;
background: linear-gradient(135deg, #fbbf24, #f59e0b);
color: #0f172a;
font-weight: 900;
border: 3px solid rgba(15, 23, 42, 0.95);
box-shadow: 0 2px 10px rgba(251, 191, 36, 0.4);
```

### 4.3 힌트/알림 배너 (Hint Banner)

```css
.hint-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08));
  border: 1px solid rgba(251, 191, 36, 0.35);
  font-size: 0.82rem;
  font-weight: 600;
  color: #fbbf24;
}
```

### 4.4 Quest of the Day (특수 카드)

```
┌────────────────────────────────────────┐
│ ─────── ◆ Quest of the Day ◆ ──────── │  ← 골드+시안 날개 헤더
│                                        │
│  ┌──────┐  🏅 퀘스트 제목               │
│  │ 아이콘 │  1. 체크리스트 항목 1         │
│  │ 80px  │  2. 체크리스트 항목 2         │
│  └──────┘  3. 체크리스트 항목 3         │
│                                        │
│  💡 안전 팁 메시지                       │  ← 골드 팁 바
│                                        │
│  ┌────────────────────────────────┐    │
│  │     확인했습니다 (+10P)          │    │  ← 시안 CTA 버튼
│  └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

**헤더 날개 장식:**
```css
.header-wing {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5));
}
.header-wing--right {
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.5), transparent);
}
.header-text {
  font-size: 0.82rem;
  font-weight: 800;
  color: #fbbf24;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(251, 191, 36, 0.3);
}
```

**CTA 버튼 (Primary Action):**
```css
.cta-button {
  width: 100%;
  padding: 1rem;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
}
.cta-button:hover {
  background: linear-gradient(135deg, #0891b2, #0e7490);
  box-shadow: 0 6px 25px rgba(6, 182, 212, 0.4);
  transform: translateY(-2px);
}
```

### 4.5 카테고리 카드 (Category Mission Card)

```
┌──────────────────────────────────────────┐
│  (●)  카테고리명                    상태   │
│  아이콘  ██████████░░░░░░░         완료    │
└──────────────────────────────────────────┘
```

**3가지 색상 변형:**

| 카테고리 | 테두리 | 배경 틴트 | 프로그레스바 | 상태 텍스트 |
|---------|--------|-----------|-------------|-----------|
| 교육 (그린) | `rgba(34,197,94,0.35)` | `rgba(34,197,94,0.06)` | `#22c55e → #34d399` | `#34d399` |
| 퀘스트 (시안) | `rgba(56,189,248,0.35)` | `rgba(56,189,248,0.06)` | `#0ea5e9 → #38bdf8` | `#38bdf8` |
| 업적 (퍼플) | `rgba(168,85,247,0.35)` | `rgba(168,85,247,0.06)` | `#f59e0b → #fbbf24` | `#a78bfa` |

**아이콘 원형:**
```css
.category-icon {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(카테고리색, 0.15);
  border: 1px solid rgba(카테고리색, 0.3);
  font-size: 1.3rem;
}
```

**프로그레스 바 (소형):**
```css
.progress-bar {
  height: 6px;
  border-radius: 999px;
  background: rgba(71, 85, 105, 0.35);
}
.progress-fill {
  background: linear-gradient(90deg, 카테고리색1, 카테고리색2);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**상태 뱃지:**
```css
.status-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  background: rgba(카테고리색, 0.12);
  color: 카테고리 라이트색;
}
```

### 4.6 섹션 헤더 (Section Header)

```css
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.section-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #f8fafc;
}
.section-counter {
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 700;
}
```

**접기/펼치기 토글:**
```css
.toggle-button {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  transition: transform 0.3s ease;
}
.toggle-button--collapsed {
  transform: rotate(180deg);
}
```

### 4.7 플로팅 액션 버튼 (FAB — 작업중지)

```css
.fab-stop {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 80px; height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444, #dc2626, #991b1b);
  border: 3px solid rgba(255, 255, 255, 0.25);
  color: white;
  z-index: 1500;
  box-shadow:
    0 0 20px rgba(220,38,38,0.6),
    0 0 50px rgba(220,38,38,0.35),
    0 0 80px rgba(220,38,38,0.15);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(220,38,38,0.6), 0 0 50px rgba(220,38,38,0.35), 0 0 80px rgba(220,38,38,0.15);
  }
  50% {
    box-shadow: 0 0 30px rgba(220,38,38,0.8), 0 0 70px rgba(220,38,38,0.5), 0 0 100px rgba(220,38,38,0.25);
  }
}
```

### 4.8 하단 네비게이션 (Bottom Nav)

```
┌──────┬──────┬──────┬──────┬──────┐
│  📚  │  🎯  │  🏆  │  🛒  │  👤  │
│ 교육  │퀘스트 │ 업적  │ 상점  │내프로필│
└──────┴──────┴──────┴──────┴──────┘
```

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(24px);
  border-top: 1px solid rgba(71, 85, 105, 0.5);
}
.nav-item--active {
  background: linear-gradient(to bottom right, rgba(59,130,246,0.2), rgba(99,102,241,0.2));
  color: #60a5fa;
}
.nav-item--inactive {
  color: #94a3b8;
}
```

---

## 5. 타이포그래피

| 용도 | 크기 | 굵기 | 색상 |
|------|------|------|------|
| 카드 타이틀 | `1.25rem` | `800` | `#f8fafc` |
| 섹션 타이틀 | `1.15rem` | `800` | `#f8fafc` |
| 퀘스트 제목 | `1.1rem` | `800` | `#f8fafc` |
| 카테고리명 | `0.95rem` | `700` | `#f8fafc` |
| 본문 | `0.85rem` | `600` | `#cbd5e1` |
| 보조 텍스트 | `0.78~0.82rem` | `600~700` | `#94a3b8` |
| 상태 뱃지 | `0.78rem` | `700` | 카테고리색 |
| XP 수치 | `0.78rem` | `600` | `#94a3b8` (강조: `#22d3ee`) |
| CTA 버튼 | `1.1rem` | `800` | `#fff` |

**폰트 패밀리:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

---

## 6. 간격 & 크기

| 요소 | 값 |
|------|-----|
| 카드 패딩 | `1.2rem ~ 1.4rem` |
| 카드 간 간격 | `1rem` |
| 카드 모서리 | `20px` (기본), `14px` (내부 카드), `12px` (작은 요소) |
| 아이콘 원형 | `44px` (카테고리), `80px` (Quest of the Day) |
| 아바타 크기 | `90~100px` (프로필), `44~48px` (리스트) |
| 레벨 뱃지 | `44px` 원형 |
| XP 바 높이 | `12px` (프로필), `6px` (카테고리) |
| 버튼 높이 | `~52px` (CTA), `32px` (아이콘 버튼) |
| FAB 크기 | `80px` 원형 |

---

## 7. 인터랙션 & 애니메이션

### 7.1 호버 효과

```css
/* 카드 호버 */
transform: translateY(-2px);
box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);

/* 버튼 호버 */
transform: translateY(-2px);
box-shadow: 0 6px 25px rgba(액센트색, 0.4);

/* 터치 피드백 */
transform: scale(0.98);
```

### 7.2 트랜지션

```css
/* 기본 */
transition: all 0.25s ease;

/* 프로그레스 바 */
transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);

/* XP 바 */
transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);

/* 토글 회전 */
transition: transform 0.3s ease;
```

### 7.3 글로우 효과

```css
/* 시안 글로우 (XP바, CTA) */
box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);

/* 골드 글로우 (레벨 뱃지) */
box-shadow: 0 2px 10px rgba(251, 191, 36, 0.4);

/* 레드 글로우 (작업중지) — 3중 레이어 */
box-shadow:
  0 0 20px rgba(220, 38, 38, 0.6),
  0 0 50px rgba(220, 38, 38, 0.35),
  0 0 80px rgba(220, 38, 38, 0.15);

/* 골드+시안 상단 라인 (특수 카드) */
background: linear-gradient(90deg, transparent, #fbbf24, #06b6d4, transparent);
```

---

## 8. 새 화면 추가 시 체크리스트

새 페이지를 이 디자인 시스템에 맞게 만들 때:

1. **배경**: `#0f172a` + 선택적 GIF/그라디언트 오버레이
2. **레이아웃**: `max-width: 600px; margin: 0 auto;` 단일 컬럼
3. **카드 컨테이너**: `border-radius: 20px` + 위 카드 CSS 패턴 사용
4. **색상**: 위 팔레트에서 선택 (시안=주요, 골드=강조, 그린/블루/퍼플=카테고리)
5. **타이포그래피**: 800 (타이틀), 700 (서브), 600 (본문)
6. **프로그레스 바**: 높이 6~12px, `border-radius: 999px`, 그라디언트 채움
7. **버튼**: 시안 그라디언트 (Primary), 투명+테두리 (Secondary)
8. **상태 표시**: 컬러 뱃지 (`rgba(색상, 0.12)` 배경 + 라이트 텍스트)
9. **하단 여백**: 네비게이션 바 높이 (~80px) 만큼 `padding-bottom` 확보
10. **글로우/그림자**: 중요 요소에 `box-shadow` 네온 효과 적용

---

## 9. 파일 참조

| 파일 | 설명 |
|------|------|
| `src/styles/core/base.css` | CSS 변수, 리셋, 기본 스타일 |
| `src/styles/pages/dashboard.css` | 대시보드 전체 CSS (카드/미션/QoD 등) |
| `src/components/dashboard/UserProfileCard.jsx` | 프로필 카드 구현 |
| `src/components/dashboard/QuestOfTheDay.jsx` | 오늘의 퀘스트 구현 |
| `src/components/dashboard/TodayMissions.jsx` | 카테고리 미션 카드 구현 |
| `src/components/WorkStopButton.jsx` | 플로팅 작업중지 버튼 |
| `src/components/Navigation.jsx` | 하단 네비게이션 바 |
