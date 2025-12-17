# 🗄️ 안전의 길 - 백엔드 & 데이터베이스 도입 가이드

## 📊 현재 데이터 구조 분석

현재 프로젝트는 **localStorage**를 사용하는 순수 프론트엔드 앱입니다.

`storage.js`에 정의된 주요 데이터 모델:

| 모델 | 설명 |
|------|------|
| `userProfile` | 사용자 정보 (역할, 이름, 가입일) |
| `questProgress` | 퀘스트 진행도 |
| `inventory` | 보유 아이템 목록 |
| `equippedItems` | 장착 아이템 (강화 레벨 포함) |
| `points` | 포인트 |
| `level` | 레벨, 경험치 |
| `streak` | 연속 출석 |
| `hazardLogs` | 위험 발굴 로그 |
| `dailyQuestInstances` | 일일 퀘스트 인스턴스 |
| `hazardIdentificationLogs` | 위험 요인 식별 로그 |
| `actionRecords` | 조치 기록 |
| `gemsAnalysisLogs` | GEMS AI 분석 로그 |
| `attendanceLogs` | 출석 기록 |
| `weeklyQuestProgress` | 주간 퀘스트 진행도 |

---

## 🛠️ 데이터베이스 도입 방법 (3가지 옵션)

### **옵션 1: 서버리스 BaaS (가장 빠른 구현)**

| 서비스 | 특징 | 추천 상황 |
|--------|------|----------|
| **Firebase** | Google 제공, 실시간 DB | 빠른 프로토타이핑 |
| **Supabase** | PostgreSQL 기반, 오픈소스 | SQL 선호 시 |
| **Neon** | 서버리스 PostgreSQL | 무료 티어 좋음 |

```
React App ──────► Supabase/Firebase API ──────► Cloud DB
```

**장점:** 백엔드 서버 불필요, 빠른 구현  
**단점:** 벤더 종속성, 비용 증가 가능

---

### **옵션 2: Node.js 백엔드 추가 (풀스택)**

```
React App ──► Express API ──► MySQL/PostgreSQL
   (3000)        (4000)            (DB)
```

**필요 작업:**

```
safety-quest-game/
├── client/          # 현재 React 앱 이동
│   ├── src/
│   └── package.json
├── server/          # 새로 생성
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── index.js
│   └── package.json
└── package.json     # 루트 (모노레포)
```

**백엔드 기술 스택:**
- Express.js + Sequelize (ORM) + MySQL/PostgreSQL
- 또는 Prisma ORM (더 현대적)

---

### **옵션 3: Spring Boot 백엔드 (Java/기업용)**

```
React App ──► Spring Boot API ──► MySQL/H2
   (3000)        (8080)            (DB)
```

**H2 데이터베이스** (개발/테스트용 인메모리 DB)

---

## 📋 구현 단계별 작업 목록

### **Phase 1: 백엔드 설정**

| 단계 | 작업 | 예상 시간 |
|------|------|----------|
| 1-1 | 백엔드 프로젝트 생성 | 30분 |
| 1-2 | DB 연결 설정 (MySQL/PostgreSQL/H2) | 1시간 |
| 1-3 | ORM 설정 (Sequelize/Prisma/JPA) | 1시간 |

### **Phase 2: 데이터베이스 스키마 설계**

```sql
-- 예시: 사용자 테이블
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50),
    points INT DEFAULT 0,
    level INT DEFAULT 1,
    exp INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 예시: 인벤토리 테이블
CREATE TABLE inventory (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    item_id VARCHAR(50) NOT NULL,
    is_equipped BOOLEAN DEFAULT FALSE,
    enhancement_level INT DEFAULT 0
);

-- 예시: 퀘스트 진행도
CREATE TABLE quest_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    quest_id VARCHAR(50) NOT NULL,
    current_count INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP
);

-- 예시: 출석 기록
CREATE TABLE attendance_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    check_in_date DATE NOT NULL,
    streak_count INT DEFAULT 1,
    reward_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 예시: 위험 발굴 로그
CREATE TABLE hazard_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    quest_date DATE NOT NULL,
    photo_url VARCHAR(500),
    identified_hazards JSON,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 예시: GEMS AI 분석 로그
CREATE TABLE gems_analysis_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    input_text TEXT NOT NULL,
    analysis_result JSON,
    risk_level VARCHAR(20),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 예시: 조치 기록
CREATE TABLE action_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    hazard_log_id VARCHAR(36) REFERENCES hazard_logs(id),
    action_description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Phase 3: API 엔드포인트 개발**

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/auth/signup` | POST | 회원가입 |
| `/api/auth/login` | POST | 로그인 |
| `/api/users/:id` | GET | 사용자 정보 |
| `/api/users/:id/inventory` | GET/POST | 인벤토리 |
| `/api/users/:id/quests` | GET/PUT | 퀘스트 진행도 |
| `/api/users/:id/streak` | POST | 출석 체크 |
| `/api/hazards` | POST | 위험 발굴 기록 |
| `/api/gems/analyze` | POST | AI 위험 분석 |

### **Phase 4: 프론트엔드 수정**

```javascript
// 기존: localStorage 직접 사용
const points = storage.get('points');

// 변경: API 호출
const response = await fetch('/api/users/me');
const userData = await response.json();
const points = userData.points;
```

**수정 파일 목록:**
- `src/utils/storage.js` → `src/utils/api.js` (API 클라이언트로 변경)
- 모든 컴포넌트에서 storage 호출을 API 호출로 변경

---

## 🚀 추천 구현 순서

### **빠른 프로토타이핑 (1-2일)**
```
Supabase 사용 → 스키마 생성 → API 연동
```

### **풀스택 구현 (1-2주)**
```
1. Express + Prisma 백엔드 구축
2. PostgreSQL/MySQL 연결
3. API 개발
4. 프론트엔드 연동
5. 인증(JWT) 추가
```

---

## 💡 빠른 시작: Supabase 연동

### 1. 설치

```bash
npm install @supabase/supabase-js
```

### 2. Supabase 클라이언트 설정

```javascript
// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. API 래퍼 함수

```javascript
// src/utils/api.js
import { supabase } from './supabase'

export const userApi = {
  // 사용자 프로필 조회
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  // 포인트 업데이트
  updatePoints: async (userId, points) => {
    const { data, error } = await supabase
      .from('users')
      .update({ points })
      .eq('id', userId)
    if (error) throw error
    return data
  },

  // 레벨업
  levelUp: async (userId, level, exp) => {
    const { data, error } = await supabase
      .from('users')
      .update({ level, exp })
      .eq('id', userId)
    if (error) throw error
    return data
  }
}

export const inventoryApi = {
  // 인벤토리 조회
  getItems: async (userId) => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },

  // 아이템 추가
  addItem: async (userId, itemId) => {
    const { data, error } = await supabase
      .from('inventory')
      .insert({ user_id: userId, item_id: itemId })
    if (error) throw error
    return data
  },

  // 아이템 장착
  equipItem: async (inventoryId, isEquipped) => {
    const { data, error } = await supabase
      .from('inventory')
      .update({ is_equipped: isEquipped })
      .eq('id', inventoryId)
    if (error) throw error
    return data
  }
}

export const questApi = {
  // 퀘스트 진행도 조회
  getProgress: async (userId) => {
    const { data, error } = await supabase
      .from('quest_progress')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },

  // 퀘스트 진행도 업데이트
  updateProgress: async (userId, questId, currentCount, isCompleted) => {
    const { data, error } = await supabase
      .from('quest_progress')
      .upsert({
        user_id: userId,
        quest_id: questId,
        current_count: currentCount,
        is_completed: isCompleted
      })
    if (error) throw error
    return data
  }
}

export const hazardApi = {
  // 위험 발굴 로그 저장
  saveLog: async (log) => {
    const { data, error } = await supabase
      .from('hazard_logs')
      .insert(log)
    if (error) throw error
    return data
  },

  // GEMS 분석 결과 저장
  saveGemsAnalysis: async (analysis) => {
    const { data, error } = await supabase
      .from('gems_analysis_logs')
      .insert(analysis)
    if (error) throw error
    return data
  }
}
```

---

## 📁 프로젝트 구조 변경 (Node.js 백엔드 추가 시)

```
safety-quest-game/
├── client/                    # 프론트엔드 (현재 React 앱)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   │   └── api.js        # API 클라이언트
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # 백엔드 (새로 추가)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js   # DB 연결 설정
│   │   ├── models/           # 데이터 모델
│   │   │   ├── User.js
│   │   │   ├── Inventory.js
│   │   │   ├── Quest.js
│   │   │   └── ...
│   │   ├── routes/           # API 라우트
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── quests.js
│   │   │   └── ...
│   │   ├── controllers/      # 비즈니스 로직
│   │   ├── middleware/       # 인증 등 미들웨어
│   │   └── index.js          # 서버 진입점
│   ├── package.json
│   └── .env                  # 환경 변수
│
├── package.json              # 루트 (scripts for both)
└── README.md
```

---

## 🔐 인증 구현 (JWT)

```javascript
// server/src/middleware/auth.js
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = authMiddleware
```

---

## ✅ 체크리스트

### 백엔드 설정
- [ ] 백엔드 프로젝트 생성
- [ ] 데이터베이스 선택 및 설치
- [ ] ORM 설정
- [ ] 환경 변수 설정

### 데이터베이스
- [ ] 스키마 설계
- [ ] 마이그레이션 작성
- [ ] 시드 데이터 준비

### API 개발
- [ ] 인증 API (signup, login)
- [ ] 사용자 API
- [ ] 인벤토리 API
- [ ] 퀘스트 API
- [ ] 출석 API
- [ ] 위험 발굴 API

### 프론트엔드 연동
- [ ] API 클라이언트 작성
- [ ] storage.js → api.js 마이그레이션
- [ ] 에러 핸들링
- [ ] 로딩 상태 관리

### 배포
- [ ] 백엔드 배포 (Render, Railway, AWS 등)
- [ ] 데이터베이스 배포
- [ ] 환경 변수 설정
- [ ] CORS 설정

---

*문서 작성일: 2024년*

