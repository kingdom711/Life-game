# EducationQuizModal — 듀오링고 스타일 리디자인

**작업일**: 2026-04-18
**대상**: `src/components/EducationQuizModal.jsx` 및 부속 컴포넌트
**배경**: 교육 퀴즈의 UX를 듀오링고 스타일로 개편. 단일 파일(417줄)을 역할별로 분리하고, 레이아웃·상태 흐름·시각 자산·마이크로 인터랙션을 단계적으로 교체.

---

## 변경 사항 요약

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 컴포넌트 분리 (단일 파일 → 5개 컴포넌트) | ✅ |
| 2 | 상태 흐름 2단계 채점 전환 + `timeSpentSec` 측정 시점 조정 | ✅ |
| 3 | 레이아웃 풀스크린화 + 하단 고정 피드백 영역 | ✅ |
| 4 | 시각 자산 교체 (이모지 → lucide, 그라디언트 → 솔리드 토큰) | ✅ |
| 5 | 마이크로 인터랙션 (하트 펄스, 진행바 채워짐, 선택지 흔들림/펄스, 패널 슬라이드업, 문항 페이드인) | ✅ |

---

## 파일 변경 목록

### 신규

- `src/components/quiz/QuizHeader.jsx` — 상단 HUD (닫기 · 진행바 · 하트)
- `src/components/quiz/QuestionView.jsx` — 문항 번호 pill + 질문 타이포
- `src/components/quiz/OptionList.jsx` — 선택지 카드 (idle / selected / graded-correct / graded-wrong / graded-idle)
- `src/components/quiz/FeedbackFooter.jsx` — 하단 고정 영역 (pre-grade "확인" / post-grade 피드백 패널 + "계속하기")
- `src/components/quiz/QuizResultScreen.jsx` — 결과 화면 (합격/불합격 · 점수 · 보상 · 문제별 결과 · CTA)
- `src/styles/features/quiz.css` — 퀴즈 전용 애니메이션 키프레임

### 수정

- `src/components/EducationQuizModal.jsx` — 오케스트레이션만 담당하도록 축소 (state · 이벤트 핸들러 · 레이아웃 골격)
- `src/styles/index.css` — `quiz.css` import 추가

---

## 단계별 상세

### 1. 컴포넌트 분리

**Before**: `EducationQuizModal.jsx` 단일 파일 417줄에 레이아웃·상태·결과 화면이 모두 섞여 있었음.
**After**: 5개 컴포넌트로 역할 분리. 모달 본체는 상태 오케스트레이션 + 레이아웃 골격만 담당.

```
EducationQuizModal.jsx (오케스트레이션)
├─ QuizHeader         ← 상단 HUD
├─ QuestionView       ← 질문 표시
├─ OptionList         ← 선택지 인터랙션
├─ FeedbackFooter     ← 하단 CTA + 피드백
└─ QuizResultScreen   ← 결과 화면 (별도 전체 화면)
```

**유지된 계약** (EducationPage.jsx와의 연동):
- Props: `isOpen / onClose / quiz / educationId / educationTitle / requiredScore / remainingAttempts / onSubmit` — 변경 없음
- 퀴즈 데이터 스키마: `{ id, question, options, correctAnswer, explanation }` — 변경 없음

### 2. 상태 흐름 2단계 채점

**Before**: 선택지 클릭 즉시 채점 (`isAnswered=true`, 정답 공개, `timeSpentSec` 기록).
**After**: 선택 → 확인 → 채점의 2단계.

- `selectedAnswer` — 채점 전 임시 선택 (파란 테두리)
- `isGraded` — 채점 완료 여부 (이전 `isAnswered` 역할 분리)
- `handleSelectAnswer(idx)` — 임시 선택만 업데이트
- `handleConfirm()` — 채점 수행, `timeSpentSec` 기록, 오답 시 `wrongCount` 증가

**교육 수료 증거 수집 로직** (`detailedAnswers`, `submitQuizAnswers`) — 로직 유지, 측정 시점만 "선택 → 확인" 으로 이동. 백엔드 payload 구조(`questionId / selectedOption / timeSpentSec`) 동일.

### 3. 레이아웃 풀스크린 + 하단 고정 피드백

**Before**: 중앙 카드 모달 (`max-w-2xl rounded-2xl border`), 해설·다음 버튼이 콘텐츠 영역 인라인.
**After**: 3단 flex 풀스크린 레이아웃.

```
┌─────────────────────────────────┐
│ QuizHeader (sticky top-0)       │ ← 닫기 · 진행바 · 하트
├─────────────────────────────────┤
│                                 │
│   QuestionView (scrollable)     │ ← flex-1 overflow-y-auto
│   OptionList                    │
│                                 │
├─────────────────────────────────┤
│ FeedbackFooter (sticky bottom-0)│ ← "확인" or 피드백 패널
└─────────────────────────────────┘
```

`max-w-2xl mx-auto` 를 각 섹션 내부에 적용해 데스크톱에서도 콘텐츠가 과도하게 넓어지지 않도록 처리.

### 4. 시각 자산 교체

**이모지 → lucide-react**:
- `📝 ✕ ♥` (헤더) → `X`, `Heart`
- `🎉 💡 ✓ ✗` (피드백·선택지) → `CheckCircle2`, `Lightbulb`, `Check`, `X`
- `🎉 😔 🏆 💰 ⚡ ⏱` (결과 화면) → `PartyPopper`, `Frown`, `Trophy`, `Coins`, `Zap`, `Clock`

**그라디언트 → 솔리드 토큰**:
- 헤더 `bg-gradient-to-r from-blue-600 to-purple-600` 제거 → sticky slim 바
- 진행바 `from-blue-500 to-purple-500` → `bg-[var(--color-safe)]` (안전 그린 토큰)
- 확인/다음 버튼 `from-blue-500 to-purple-500` → `bg-[var(--color-safe)]` (솔리드)

프로젝트 메모리(`memory/project_design_system.md`)의 "AI 티 제거" 방침과 일치.

### 5. 마이크로 인터랙션

`src/styles/features/quiz.css` 에 CSS 키프레임 추가:

| 클래스 | 동작 | 적용 대상 |
|---|---|---|
| `.quiz-shake` | 좌우 흔들림 420ms | 오답 선택지 |
| `.quiz-pop` | 스케일 1 → 1.035 → 1 (320ms) | 정답 선택지 |
| `.quiz-slide-up` | 하단에서 슬라이드업 (240ms, ease-out-expo) | 피드백 패널 |
| `.quiz-fade-in` | 우측 16px → 0 + opacity 0→1 (220ms) | 문항 전환 |
| `.quiz-heart-pulse` | 하트 스케일 1 → 1.25 → 0.95 → 1 (360ms) | 오답 시 하트 |
| `.quiz-tap` | `:active` 시 `translateY(1px)` | 모든 CTA 버튼 |

`prefers-reduced-motion: reduce` 사용자는 모든 애니메이션 비활성화 처리.

**진행바 타이밍 조정**: `(currentIndex+1)/total` → `(currentIndex + (isGraded?1:0))/total` — 확인 클릭 순간에 바가 채워지도록 변경해 피드백이 더 즉각적으로 체감됨.

---

## 유지된 것 (리팩터링 영향 없음)

- 퀴즈 데이터 스키마 및 `onSubmit` 반환 결과(`quizResult`) 구조
- `remainingAttempts` / `requiredScore` / `educationTitle` prop 계약
- `submitQuizAnswers` API 호출 규약 (fire-and-forget, payload 동일)
- `handleRetry` 재도전 흐름 (`attemptNumberRef` 증가 + 상태 초기화)

---

## 브라우저 실동작 검증 결과

실제 교육 페이지에서 `/education` → localStorage 주입으로 videoCompleted → 퀴즈 모달 오픈 후 확인.

| 시나리오 | 결과 |
|---|---|
| 선택 전 "확인" 버튼 상태 | ✅ gray/disabled |
| 선택 후 "확인" 버튼 상태 | ✅ `bg-[var(--color-safe)]` 활성화 |
| 선택 시 선택지 테두리 | ✅ 파란색 (pre-grade) |
| 오답 확인 시 | ✅ 선택지 RED + `quiz-shake`, 피드백 `quiz-slide-up` + "해설" |
| 정답 확인 시 | ✅ 선택지 GREEN + `quiz-pop`, 피드백 초록 테두리 + "정답입니다!" |
| 진행바 | ✅ 채점 시점에 채워짐 (1/5→20%, 2/5→40%) |
| "계속하기" 클릭 | ✅ 다음 문항 `quiz-fade-in`, 피드백 패널 사라지고 "확인" 복귀 |

---

## 후속 고려 사항 (이번 범위 외)

- **마스코트 일러스트** — 결과 화면의 `PartyPopper / Frown` 아이콘은 placeholder. 실제 안전모 마스코트 SVG 자산 투입 시 교체 필요.
- **콤보 카운터** — 연속 정답 표시는 구현하지 않음. Safety Quest는 법정교육 증거 수집 목적이라 도입 시 증거 기록과의 상호작용 설계 선행 필요.
- **정답 풀 큐잉(Duolingo 원형)** — 오답 문항을 큐 뒤로 재삽입하는 방식은 채택하지 않음. 증거 수집 단순화를 위해 1회 답변 후 다음 문항 고정 유지.
- **결과 화면 실동작 검증** — 5문제 전체 풀이까지 도달해야 관찰 가능. 이번 검증에서는 모달 진입 후 2문항까지만 확인.
