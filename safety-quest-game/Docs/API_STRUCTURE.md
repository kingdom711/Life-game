# 🔌 API 구조 가이드

> 📚 **관련 문서**
> - [🔗 통합 가이드 (BACKEND_INTEGRATION_GUIDE.md)](./BACKEND_INTEGRATION_GUIDE.md) - 모든 백엔드 정보 통합
> - [🗄️ 백엔드 가이드 (Backend.md)](./Backend.md) - DB 스키마, 프로젝트 구조, 체크리스트
> - [🤖 AI API 명세 (AI_GENERATION_API_SUBMIT.md)](./AI_GENERATION_API_SUBMIT.md) - GEMS AI 분석 API 상세 명세

---

## 개요

안전의 길 프로젝트의 프론트엔드 API 호출 구조입니다.

---

## 📁 폴더 구조

```
src/
├── api/                      # API 모듈
│   ├── apiClient.js          # 공통 API 클라이언트 (fetch 래퍼)
│   ├── authApi.js            # 인증 API
│   ├── userApi.js            # 사용자 API
│   ├── questApi.js           # 퀘스트 API
│   ├── inventoryApi.js       # 인벤토리 API
│   ├── shopApi.js            # 상점 API
│   ├── gemsApi.js            # AI 분석 API
│   └── index.js              # 통합 export
├── config/
│   └── environment.js        # 환경변수 설정
└── utils/
    └── geminiService.js      # 레거시 호환 래퍼
```

---

## ⚙️ 환경변수 설정

### 프로젝트 루트에 `.env` 파일 생성

```env
# API 서버 URL
VITE_API_BASE_URL=http://localhost:8080

# Mock 모드 (백엔드 서버 없을 때 true)
VITE_USE_MOCK=false

# API 타임아웃 (밀리초)
VITE_API_TIMEOUT=30000

# 개발 모드
VITE_DEV_MODE=true
```

### 환경변수 사용법

```javascript
import config from '../config/environment';

console.log(config.API_BASE_URL);  // http://localhost:8080
console.log(config.USE_MOCK);       // false
```

---

## 🔧 API 클라이언트 사용법

### 기본 사용법

```javascript
import api from '../api';

// GET 요청
const users = await api.client.get('/users');

// POST 요청
const result = await api.client.post('/auth/login', {
    email: 'user@example.com',
    password: 'password123'
});
```

### 도메인별 API 사용법

```javascript
import { authApi, userApi, questApi, gemsApi } from '../api';

// 인증
await authApi.login({ email, password });
await authApi.logout();

// 사용자
const user = await userApi.getMe();
await userApi.addPoints(100, '퀘스트 완료');

// 퀘스트
const quests = await questApi.getDailyQuests('technician');
await questApi.completeQuest('quest_001');

// AI 분석
const analysis = await gemsApi.analyzeRisk({
    inputText: '위험 상황 설명...'
});
```

---

## 📡 API 엔드포인트 목록

### 인증 (authApi)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/v1/auth/signup` | 회원가입 |
| POST | `/api/v1/auth/login` | 로그인 |
| POST | `/api/v1/auth/logout` | 로그아웃 |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 |

### 사용자 (userApi)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/v1/users/me` | 내 정보 조회 |
| PUT | `/api/v1/users/me` | 내 정보 수정 |
| GET | `/api/v1/users/me/points` | 포인트 조회 |
| POST | `/api/v1/users/me/points/add` | 포인트 추가 |
| GET | `/api/v1/users/me/level` | 레벨 조회 |
| PUT | `/api/v1/users/me/role` | 역할 설정 |

### 퀘스트 (questApi)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/v1/quests/daily` | 일일 퀘스트 목록 |
| GET | `/api/v1/quests/weekly` | 주간 퀘스트 목록 |
| GET | `/api/v1/quests/monthly` | 월간 퀘스트 목록 |
| GET | `/api/v1/quests/progress` | 진행도 조회 |
| POST | `/api/v1/quests/:id/complete` | 퀘스트 완료 |
| POST | `/api/v1/quests/attendance/check-in` | 출석 체크 |

### 인벤토리 (inventoryApi)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/v1/inventory` | 인벤토리 조회 |
| POST | `/api/v1/inventory/add` | 아이템 추가 |
| POST | `/api/v1/inventory/:id/equip` | 아이템 장착 |
| POST | `/api/v1/inventory/:id/unequip` | 아이템 해제 |
| GET | `/api/v1/inventory/equipped` | 장착 아이템 조회 |

### 상점 (shopApi)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/v1/shop/items` | 상점 아이템 목록 |
| GET | `/api/v1/shop/items/:id` | 아이템 상세 |
| POST | `/api/v1/shop/items/:id/purchase` | 아이템 구매 |

### AI 분석 (gemsApi)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/v1/business-plan/generate` | 위험 분석 요청 |
| GET | `/api/v1/gems/history` | 분석 기록 조회 |
| POST | `/api/v1/gems/action-records` | 조치 기록 저장 |

---

## 🛡️ 에러 처리

### ApiError 클래스

```javascript
import { ApiError } from '../api';

try {
    await api.client.get('/some-endpoint');
} catch (error) {
    if (error instanceof ApiError) {
        console.log('상태 코드:', error.status);
        console.log('에러 메시지:', error.message);
        console.log('에러 데이터:', error.data);
    }
}
```

### 공통 에러 코드

| 상태 코드 | 설명 |
|----------|------|
| 0 | 네트워크 연결 실패 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 408 | 요청 시간 초과 |
| 500 | 서버 에러 |

---

## 🔄 Mock 모드

백엔드 서버 없이 개발할 때 Mock 모드를 사용합니다.

### 활성화 방법

1. `.env` 파일에서 설정:
```env
VITE_USE_MOCK=true
```

2. 또는 `environment.js`에서 직접 설정:
```javascript
USE_MOCK: true,
```

### Mock 동작

- `gemsApi.analyzeRisk()`: 랜덤 Mock 응답 반환
- API 서버 연결 실패 시 자동으로 Mock 폴백

---

## 🔐 인증 토큰 관리

### 토큰 저장/조회

```javascript
import api from '../api';

// 토큰 설정
api.client.token.setTokens('access_token', 'refresh_token');

// 토큰 조회
const accessToken = api.client.token.getAccessToken();

// 토큰 삭제 (로그아웃)
api.client.token.clearTokens();
```

### 자동 인증 헤더

`apiClient`는 저장된 토큰이 있으면 자동으로 `Authorization` 헤더를 추가합니다:

```
Authorization: Bearer {accessToken}
```

---

## 📋 CORS 프록시 설정

`vite.config.js`에서 개발 환경용 프록시가 설정되어 있습니다:

```javascript
server: {
    proxy: {
        '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
        }
    }
}
```

---

*문서 작성일: 2024-12-17*

