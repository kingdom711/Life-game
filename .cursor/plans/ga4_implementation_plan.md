# Google Analytics 4 통합 구현 계획

## 목표

Safety Quest 프로젝트에 Google Analytics 4를 통합하여 사용자 행동 분석 기반을 구축합니다.

---

## User Review Required

> [!IMPORTANT]
> **GA4 측정 ID 필요**: 구현 전 Google Analytics 계정에서 속성을 생성하고 측정 ID(`G-XXXXXXXXXX`)를 준비해야 합니다.

> [!CAUTION]
> **프로덕션 환경에서만 활성화**: 개발 환경에서는 GA 호출이 비활성화되며, 테스트 시 `VITE_GA_DEBUG_MODE=true`로 DebugView 확인 가능합니다.

---

## Proposed Changes

### Frontend (Life-game/safety-quest-game)

#### [NEW] [analytics.js](file:///d:/Workspace/repository/FULL/Life-game/safety-quest-game/src/utils/analytics.js)

GA4 이벤트 추적을 위한 유틸리티 모듈.
- `pageView()` - 페이지뷰 추적
- `engagement.*` - 사용자 참여 이벤트 (출석, 퀘스트)
- `aiAnalysis.*` - AI 분석 기능 이벤트
- `conversion.*` - 전환 이벤트 (가입, 플랜 선택)
- `shop.*` - 상점 이벤트

---

#### [MODIFY] [main.jsx](file:///d:/Workspace/repository/FULL/Life-game/safety-quest-game/src/main.jsx)

GA4 초기화 코드 추가:
```diff
+import ReactGA from 'react-ga4';
+import { initializeAnalytics } from './utils/analytics';
+
+// GA4 초기화
+initializeAnalytics();
```

---

#### [MODIFY] [environment.js](file:///d:/Workspace/repository/FULL/Life-game/safety-quest-game/src/config/environment.js)

GA 관련 설정 추가:
```diff
+// Google Analytics 설정
+GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
+GA_DEBUG_MODE: import.meta.env.VITE_GA_DEBUG_MODE === 'true',
```

---

#### [MODIFY] [RiskSolutionPage.jsx](file:///d:/Workspace/repository/FULL/Life-game/safety-quest-game/src/pages/RiskSolutionPage.jsx)

AI 분석 이벤트 추적 추가:
- `handleSubmit()` - AI 분석 시작/완료 이벤트
- `handleSaveAndClose()` - 조치 저장 이벤트

---

#### [MODIFY] [Dashboard.jsx](file:///d:/Workspace/repository/FULL/Life-game/safety-quest-game/src/pages/Dashboard.jsx)

출석 체크 이벤트 추적 추가:
- `onCheckIn` 콜백에 `analytics.engagement.dailyCheckIn()` 호출

---

#### [MODIFY] [LandingPage.jsx](file:///d:/Workspace/repository/FULL/Life-game/safety-quest-game/src/pages/LandingPage.jsx)

CTA 클릭 이벤트 추적 추가:
- 시작 버튼 클릭 시 `analytics.conversion.signupStart()` 호출

---

#### [NEW] [AnalyticsTestPage.jsx](file:///d:/Workspace/repository/FULL/Life-game/safety-quest-game/src/pages/AnalyticsTestPage.jsx)

개발 환경 전용 GA 테스트 페이지:
- 각 이벤트 카테고리별 테스트 버튼
- GA4 DebugView 연동 확인용

---

### Backend (safert-road-inclass)

#### [MODIFY] [LoggingFilter.java](file:///d:/Workspace/repository/FULL/safert-road-inclass/src/main/java/com/jinsung/safety_road_inclass/global/config/LoggingFilter.java)

API 메트릭 로깅 추가:
```diff
+long startTime = System.currentTimeMillis();
// ... 기존 코드 ...
+long duration = System.currentTimeMillis() - startTime;
+log.info("METRIC:API_CALL requestId={} method={} path={} status={} durationMs={}",
+         requestId, request.getMethod(), request.getRequestURI(),
+         response.getStatus(), duration);
```

---

## Verification Plan

### Automated Tests

프론트엔드 테스트 환경이 설정되어 있지 않으므로, 이 단계에서는 수동 테스트로 진행합니다.

### Manual Verification

#### 1. 프론트엔드 GA4 연동 테스트

**사전 준비:**
1. GA4 속성 생성 후 측정 ID 획득
2. `.env` 파일에 설정:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_GA_DEBUG_MODE=true
   ```

**테스트 절차:**
1. 프론트엔드 개발 서버 실행:
   ```bash
   cd d:\Workspace\repository\FULL\Life-game\safety-quest-game
   npm run dev
   ```
2. 브라우저에서 `http://localhost:5173/analytics-test` 접속
3. GA4 DebugView 열기: [analytics.google.com](https://analytics.google.com) → 관리 → DebugView
4. 테스트 페이지에서 각 버튼 클릭 후 DebugView에서 이벤트 수신 확인

**확인 항목:**
- [ ] Page View 이벤트 수신
- [ ] daily_check_in 이벤트 수신
- [ ] analysis_start / analysis_complete 이벤트 수신
- [ ] signup_start 이벤트 수신

#### 2. 백엔드 API 메트릭 로그 테스트

**테스트 절차:**
1. 백엔드 서버 실행:
   ```bash
   cd d:\Workspace\repository\FULL\safert-road-inclass
   ./gradlew bootRun
   ```
2. API 호출 (예: Swagger UI 또는 curl):
   ```bash
   curl http://localhost:8080/api/v1/ai/health
   ```
3. 로그 파일 확인:
   ```bash
   tail -f ./logs/safety-road.log | grep "METRIC:API_CALL"
   ```

**확인 항목:**
- [ ] `METRIC:API_CALL` 형식의 로그 출력
- [ ] requestId, method, path, status, durationMs 필드 포함

---

## Dependencies

### Frontend
- `react-ga4`: ^2.1.0 (npm install 필요)

### Backend
- 추가 의존성 없음 (기존 SLF4J/Logback 사용)
