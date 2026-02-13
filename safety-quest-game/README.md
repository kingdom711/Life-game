# 안전의 길 (Safety Quest) Frontend

React + Vite 기반의 안전관리 게이미피케이션 프론트엔드입니다.
현재 백엔드(`safert-road-inclass`)와 API 연동을 전제로 동작하며, 인증/퀘스트/포인트/재화/알림/AI 분석 흐름을 UI에서 제공합니다.

## 개요

- 프레임워크: React 18, React Router DOM 6
- 빌드 도구: Vite 5
- 스타일: Tailwind CSS 4 + Custom CSS
- 상태 관리: Context(Auth) + LocalStorage 기반 게임 상태 유틸
- API 연동: `src/api/*` 모듈 (JWT, 자동 토큰 갱신, 공통 에러 처리)

## 주요 화면

- 인증/진입: `Signup`, `Login`, `LaunchScreen`, `LandingPage`
- 메인: `Dashboard`, `Profile`, `Navigation`
- 퀘스트: `DailyQuests`, `WeeklyQuests`, `MonthlyQuests`
- 게임 시스템: `Shop`, `Inventory`, `SpecializationPage`, `SpecializationTrainingPage`
- 운영 기능: `AlertManagement`, `Exchange`, `RewardCenter`
- 안전 분석: `RiskSolutionPage`, `EducationPage` (YouTube 기반 교육 포함)

라우트 정의는 `src/App.jsx`를 기준으로 관리됩니다.

## 디렉토리 구조

```text
Life-game/safety-quest-game/
├─ public/
├─ src/
│  ├─ api/              # 백엔드 API 클라이언트
│  ├─ components/       # UI 컴포넌트
│  ├─ config/           # 환경설정 (environment.js)
│  ├─ context/          # AuthContext
│  ├─ data/             # 정적 데이터
│  ├─ pages/            # 페이지 컴포넌트
│  ├─ styles/           # 전역/페이지 스타일
│  └─ utils/            # storage, quest, points 등 게임 로직
├─ Docs/
├─ vite.config.js
└─ package.json
```

## 실행 방법

### 요구사항

- Node.js 18 이상
- npm

### 설치 및 실행

```bash
cd Life-game/safety-quest-game
npm install
npm run dev
```

- 기본 개발 서버: `http://localhost:3000`
- Vite 프록시: `/api` 요청을 `VITE_API_BASE_URL`(기본 `http://localhost:8080`)로 전달

## 환경변수

`src/config/environment.js` 기준 주요 변수:

- `VITE_API_BASE_URL`: 백엔드 주소 (기본 `http://localhost:8080`)
- `VITE_USE_MOCK`: 목 모드 여부 (`true`/`false`)
- `VITE_API_TIMEOUT`: API 타임아웃(ms)
- `VITE_DEV_MODE`: 개발 로그 활성화 여부
- `VITE_GA_MEASUREMENT_ID`: GA4 측정 ID

## API 연동 포인트

- 공통 클라이언트: `src/api/apiClient.js`
- 인증 토큰: LocalStorage의 `accessToken`, `refreshToken`
- 401 발생 시 `POST /api/v1/auth/refresh` 자동 재시도
- 백엔드 응답 포맷(`success`, `data`, `error`) 기준 파싱

## 관련 문서

- `Life-game/safety-quest-game/Docs/프론트엔드 진행현황.md`
- `Life-game/safety-quest-game/Docs/BACKEND_INTEGRATION_GUIDE.md`
- `Life-game/safety-quest-game/Docs/API_STRUCTURE.md`
- `Life-game/safety-quest-game/Docs/ENV_SETUP_GUIDE.md`

## 최신 반영 사항 요약

- 포인트/경험치 동기화 및 게임 프로필 연동 강화
- 교환소(`Exchange`) / 보상센터(`RewardCenter`) API 연동
- 알림 시스템 API 포맷 정합성 수정
- YouTube 교육 재생 + 시청시간 추적 로직 반영
- KST 기준 퀘스트/출석 리셋 로직 적용

---

최종 업데이트: 2026-02-13
