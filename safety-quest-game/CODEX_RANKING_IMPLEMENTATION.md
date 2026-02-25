# 랭킹 시스템 구현 지시서 (Codex용)

> 이 문서는 Safety Quest Game의 대시보드 랭킹 기능을 실제 사용자 데이터 기반으로 실체화하는 전체 구현 가이드입니다.

---

## 프로젝트 개요

- **프로젝트**: Safety Quest Game (안전의 길) — 산업안전 교육 게임화 B2B SaaS
- **기술 스택**: React 18 + Vite 5 + Tailwind CSS 4 (다크 테마)
- **백엔드**: Spring Boot + JWT 인증 (백엔드가 없을 수 있으므로 폴백 필수)
- **상태 관리**: Context API + localStorage (서버 sync)
- **루트 디렉토리**: `Life-game/safety-quest-game/`

---

## 현재 상태 (AS-IS)

`TeamRankingSidebar.jsx`가 하드코딩된 목 데이터 3건만 표시 중:

```jsx
// src/components/dashboard/TeamRankingSidebar.jsx (현재 - 전체 코드)
const MOCK_RANKINGS = [
    { rank: 1, name: '이건설', role: 'Worker', points: 2450 },
    { rank: 2, name: '박안전', role: 'Worker', points: 2100 },
    { rank: 3, name: '최기술', role: 'Worker', points: 1980 }
];
```

`userApi.js`에 API 함수 정의되어 있으나 미호출:

```js
getRankings: async (type = 'points', limit = 10) => {
    return apiClient.get(`/users/rankings?type=${type}&limit=${limit}`);
}
```

Dashboard.jsx에서 props 없이 렌더링 중:

```jsx
// src/pages/Dashboard.jsx 493행
<TeamRankingSidebar />
```

---

## 목표 (TO-BE)

1. 실제 사용자 계정 데이터 기반 랭킹 (API → 캐시 → 폴백 3단계)
2. 랭킹 타입 탭 (포인트/레벨/스트릭)
3. 주간/월간 시즌 랭킹
4. 역할별 랭킹 필터
5. 팀/부서 랭킹
6. 순위 변동 표시 (▲▼, NEW)
7. 랭킹 마일스톤 업적 시스템
8. 전체 리더보드 모달 (Top 20)

---

## 기존 코드 참조 (반드시 재사용할 것)

### 1. 인증 시스템 — `src/context/AuthContext.jsx`

```js
// useAuth() 훅 반환값
{ user, loading, error, login, logout, isAuthenticated }

// user 객체 구조
{ id: 'user-123', username: 'user@email.com', name: '홍길동', email: '...' }

// DEV 모드 바이패스 상수
const AUTH_BYPASS_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DISABLE_AUTH !== 'false';
```

### 2. 포인트/레벨 시스템 — `src/utils/pointsCalculator.js`

```js
// 반드시 이 함수로 레벨 계산 (직접 계산 금지)
import { calculateLevel, TIERS, LEVELS } from '../utils/pointsCalculator';

// calculateLevel(포인트값) 반환 구조
{
    level: 'BRONZE_3',     // 레벨 키
    name: 'Bronze III',    // 표시 이름
    color: '#cd7f32',      // 티어 색상
    tier: 'bronze',        // 티어 키
    tierIcon: '🥉',        // 티어 아이콘
    rank: 1,               // 1~15 순위
    progress: 45,          // 레벨 내 진행률 %
    points: 4500,          // 현재 포인트
    min: 0, max: 10000     // 레벨 범위
}

// TIERS 구조
{ bronze: { name: 'Bronze', color: '#cd7f32', icon: '🥉' }, silver: {...}, gold: {...}, platinum: {...}, diamond: {...} }

// LEVELS: 15단계 — BRONZE_3(0P) ~ DIAMOND_1(1,900,000P+)
```

### 3. 스토리지 — `src/utils/storage.js`

```js
import { points, streak, userProfile, storage } from '../utils/storage';

points.get()           // 현재 포인트 잔액 (number)
streak.get()           // { current: 5, longest: 12, lastLoginDate: '2025-01-15' }
userProfile.getName()  // 사용자 이름 (string)
userProfile.getRole()  // 'technician' | 'supervisor' | 'safety_manager'
storage.set(key, value) // localStorage에 JSON 저장 (사용자 스코프 자동 적용)
storage.get(key, defaultValue) // localStorage에서 JSON 읽기
```

### 4. API 클라이언트 — `src/api/apiClient.js`

```js
import apiClient from './apiClient';
// apiClient.get(path), apiClient.post(path, body), apiClient.put(path, body)
// 자동으로 Bearer 토큰 포함, 401시 리프레시 시도
```

### 5. 역할(Role) 한국어 매핑

```js
const ROLE_LABELS = {
    technician: '기술자',
    supervisor: '관리감독자',
    safety_manager: '안전관리자'
};
```

---

## 파일별 구현 지시

---

### 파일 1: `src/api/userApi.js` (수정)

기존 `getRankings`에 `period`, `role` 파라미터 추가 + `getMyRank`, `getTeamRankings` 함수 추가.

**변경 사항:**

```js
// 기존 getRankings 교체
getRankings: async (type = 'points', limit = 10, { period = 'all', role = '' } = {}) => {
    let url = `/users/rankings?type=${type}&limit=${limit}&period=${period}`;
    if (role) url += `&role=${role}`;
    return apiClient.get(url);
},

// 신규 추가
getMyRank: async (type = 'points') => {
    return apiClient.get(`/users/me/rank?type=${type}`);
},

getTeamRankings: async (type = 'points', limit = 10) => {
    return apiClient.get(`/teams/rankings?type=${type}&limit=${limit}`);
}
```

나머지 기존 함수들은 수정하지 말 것.

---

### 파일 2: `src/utils/rankingManager.js` (신규 생성)

랭킹 데이터의 fetching, 캐싱, 폴백 생성, 정규화, 순위 변동 계산을 담당하는 유틸리티.

**정규화된 개인 랭킹 엔트리 구조:**

```js
{
    rank: 1,                    // 순위
    userId: 'user-123',        // 사용자 ID
    name: '이건설',             // 표시 이름
    role: 'technician',        // 역할 키
    points: 2450,              // 총 포인트
    level: {                   // calculateLevel() 반환값
        name: 'Silver I',
        tier: 'silver',
        tierIcon: '🥈',
        rank: 6
    },
    streak: 14,                // 연속 출석 일수
    isCurrentUser: false,      // 현재 로그인 유저 여부
    rankChange: null           // null=NEW, 0=변동없음, +2=2단계 상승, -1=1단계 하락
}
```

**팀 랭킹 엔트리 구조:**

```js
{
    rank: 1,
    teamName: '1공구 안전팀',
    memberCount: 8,
    totalPoints: 19600,
    avgPoints: 2450,
    topMember: '이건설',
    rankChange: null
}
```

**구현해야 할 함수들:**

```js
import userApi from '../api/userApi';
import { calculateLevel } from './pointsCalculator';
import { points, streak, userProfile, storage } from './storage';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

// ---- 캐시 관리 ----

// 캐시 키 생성: safety_quest_rankings_cache_{type}_{period}_{role}
function buildCacheKey(type, period = 'all', role = '') { ... }

// 이전 랭킹 키: safety_quest_rankings_previous_{type}_{period}_{role}
function buildPreviousCacheKey(type, period = 'all', role = '') { ... }

function getCachedRankings(type, period, role) { ... }
function setCachedRankings(type, period, role, data) { ... }
function isCacheValid(cacheEntry) { ... } // timestamp + TTL 비교

// ---- 정규화 ----

// 백엔드 API 응답 → 정규화된 엔트리로 변환
function normalizeApiRankingEntry(apiEntry, currentUserId) {
    // apiEntry에 points가 있으면 calculateLevel(apiEntry.points)로 레벨 계산
    // apiEntry.userId === currentUserId이면 isCurrentUser = true
    // rankChange는 이전 캐시와 비교하여 계산
}

// ---- 순위 변동 계산 ----

function calculateRankChanges(currentRankings, previousRankings) {
    // previousRankings가 없으면 전부 rankChange: null (NEW)
    // 이전에 있었으면: previousRank - currentRank (양수 = 상승)
    // 이전에 없었으면: null (NEW)
}

// ---- 폴백 생성 ----

// 시뮬레이션 유저 이름 (한국식, 건설/안전 관련)
const SIMULATED_USERS = [
    { name: '이건설', role: 'technician' },
    { name: '박안전', role: 'technician' },
    { name: '최기술', role: 'supervisor' },
    { name: '정현장', role: 'supervisor' },
    { name: '김감독', role: 'safety_manager' },
    { name: '한공사', role: 'technician' },
    { name: '오점검', role: 'technician' },
    { name: '송관리', role: 'safety_manager' },
    { name: '윤작업', role: 'technician' }
];

function generateFallbackRankings(type = 'points', limit = 10) {
    // 1. 현재 유저의 실제 데이터 가져오기
    //    - points.get(), streak.get(), userProfile.getName(), userProfile.getRole()
    //    - calculateLevel(currentPoints)
    // 2. 시뮬레이션 유저 9명의 점수를 현재 유저 점수 기준 ±40% 범위로 랜덤 생성
    //    - Math.round(currentPoints * (0.6 + Math.random() * 0.8))
    //    - streak도 비슷하게 current ± 범위로 생성
    // 3. type에 따라 정렬 (points: 포인트 내림차순, level: 레벨 rank 내림차순, streak: 스트릭 내림차순)
    // 4. rank 1~N 할당
    // 5. 현재 유저에 isCurrentUser: true 표시
    // 6. 모든 엔트리의 level은 calculateLevel(해당포인트)로 계산
    // 7. limit개로 자르기
}

// 시뮬레이션 팀 데이터 생성
const SIMULATED_TEAMS = [
    { teamName: '1공구 안전팀', memberCount: 8 },
    { teamName: '2공구 시공팀', memberCount: 12 },
    { teamName: '3공구 전기팀', memberCount: 6 },
    { teamName: '품질관리팀', memberCount: 5 },
    { teamName: '현장관리팀', memberCount: 10 }
];

function generateFallbackTeamRankings(type = 'points', limit = 5) {
    // 1. 현재 유저 포인트 기반으로 팀 점수 시뮬레이션
    // 2. totalPoints = avgPoints * memberCount
    // 3. topMember는 각 팀의 시뮬레이션 이름 중 하나
    // 4. type에 따라 정렬 후 rank 할당
}

// ---- 메인 fetch 함수 ----

export async function fetchRankings(type = 'points', limit = 10, currentUserId = null, { period = 'all', role = '' } = {}) {
    // 1. 토큰 확인 — 없으면 바로 폴백
    const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            const apiData = await userApi.getRankings(type, limit, { period, role });
            const normalized = (apiData || []).map(entry => normalizeApiRankingEntry(entry, currentUserId));

            // 이전 랭킹 저장 (순위 변동 계산용)
            const prevCache = getCachedRankings(type, period, role);
            if (prevCache) {
                storage.set(buildPreviousCacheKey(type, period, role), prevCache);
            }

            // 순위 변동 계산
            const withChanges = calculateRankChanges(normalized, prevCache?.data || null);

            setCachedRankings(type, period, role, withChanges);
            return { source: 'api', data: withChanges };
        } catch (err) {
            console.warn('[RankingManager] API 실패:', err.message);
        }
    }

    // 2. 캐시 확인
    const cached = getCachedRankings(type, period, role);
    if (cached && isCacheValid(cached)) {
        return { source: 'cache', data: cached.data };
    }

    // 3. 폴백
    const fallback = generateFallbackRankings(type, limit);
    return { source: 'fallback', data: fallback };
}

export async function fetchTeamRankings(type = 'points', limit = 10) {
    const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            const apiData = await userApi.getTeamRankings(type, limit);
            if (apiData && apiData.length > 0) {
                return { source: 'api', data: apiData };
            }
        } catch (err) {
            console.warn('[RankingManager] 팀 랭킹 API 실패:', err.message);
        }
    }
    return { source: 'fallback', data: generateFallbackTeamRankings(type, limit) };
}
```

---

### 파일 3: `src/utils/rankingAchievements.js` (신규 생성)

랭킹 마일스톤 업적 관리.

```js
import { storage } from './storage';

const ACHIEVEMENTS_KEY = 'safety_quest_ranking_achievements';

// 업적 정의
export const RANKING_ACHIEVEMENTS = {
    FIRST_TOP_10: {
        id: 'FIRST_TOP_10',
        name: '첫 Top 10 진입',
        description: '랭킹 상위 10위 안에 처음 진입했습니다!',
        icon: '🏅',
        condition: (rank) => rank <= 10
    },
    FIRST_TOP_3: {
        id: 'FIRST_TOP_3',
        name: '첫 Top 3 달성',
        description: '랭킹 3위 안에 처음 진입했습니다!',
        icon: '🥉',
        condition: (rank) => rank <= 3
    },
    FIRST_PLACE: {
        id: 'FIRST_PLACE',
        name: '첫 1위 달성',
        description: '랭킹 1위를 처음 달성했습니다!',
        icon: '🏆',
        condition: (rank) => rank === 1
    },
    WEEKLY_TOP_3: {
        id: 'WEEKLY_TOP_3',
        name: '주간 Top 3',
        description: '주간 랭킹 3위 안에 진입했습니다!',
        icon: '⭐',
        condition: (rank, period) => rank <= 3 && period === 'weekly'
    },
    STREAK_KING: {
        id: 'STREAK_KING',
        name: '스트릭 챔피언',
        description: '스트릭 랭킹 1위를 달성했습니다!',
        icon: '🔥',
        condition: (rank, period, type) => rank === 1 && type === 'streak'
    }
};

// 달성 업적 가져오기
export function getUnlockedAchievements() {
    return storage.get(ACHIEVEMENTS_KEY, {});
}

// 업적 체크 및 업데이트
// 반환: 새로 달성된 업적 배열 (토스트 알림용)
export function checkAndUpdateAchievements(currentUserRank, { period = 'all', type = 'points' } = {}) {
    if (!currentUserRank || !currentUserRank.isCurrentUser) return [];

    const rank = currentUserRank.rank;
    const unlocked = getUnlockedAchievements();
    const newlyUnlocked = [];

    Object.values(RANKING_ACHIEVEMENTS).forEach(achievement => {
        if (unlocked[achievement.id]) return; // 이미 달성

        if (achievement.condition(rank, period, type)) {
            unlocked[achievement.id] = {
                unlockedAt: new Date().toISOString(),
                rank,
                period,
                type
            };
            newlyUnlocked.push(achievement);
        }
    });

    if (newlyUnlocked.length > 0) {
        storage.set(ACHIEVEMENTS_KEY, unlocked);
    }

    return newlyUnlocked;
}

// 특정 유저의 달성 업적 아이콘 배열 반환 (리더보드 행에 표시용)
export function getUserAchievementIcons() {
    const unlocked = getUnlockedAchievements();
    return Object.keys(unlocked)
        .map(id => RANKING_ACHIEVEMENTS[id]?.icon)
        .filter(Boolean);
}
```

---

### 파일 4: `src/hooks/useRankings.js` (신규 생성)

`src/hooks/` 디렉토리가 없으면 생성.

```js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchRankings, fetchTeamRankings } from '../utils/rankingManager';
import { checkAndUpdateAchievements } from '../utils/rankingAchievements';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5분

export function useRankings(initialType = 'points', limit = 10) {
    const { user } = useAuth();
    const [rankings, setRankings] = useState([]);
    const [teamRankings, setTeamRankings] = useState([]);
    const [rankingType, setRankingType] = useState(initialType);
    const [period, setPeriod] = useState('all');       // 'all' | 'weekly' | 'monthly'
    const [roleFilter, setRoleFilter] = useState('');  // '' | 'technician' | 'supervisor' | 'safety_manager'
    const [viewMode, setViewMode] = useState('individual'); // 'individual' | 'team'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [source, setSource] = useState(null);
    const [newAchievements, setNewAchievements] = useState([]);
    const intervalRef = useRef(null);

    const loadRankings = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            if (viewMode === 'team') {
                const result = await fetchTeamRankings(rankingType, limit);
                setTeamRankings(result.data);
                setSource(result.source);
            } else {
                const result = await fetchRankings(
                    rankingType, limit, user?.id,
                    { period, role: roleFilter }
                );
                setRankings(result.data);
                setSource(result.source);

                // 업적 체크
                const currentUserEntry = result.data.find(r => r.isCurrentUser);
                if (currentUserEntry) {
                    const newly = checkAndUpdateAchievements(currentUserEntry, { period, type: rankingType });
                    if (newly.length > 0) {
                        setNewAchievements(newly);
                    }
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [rankingType, period, roleFilter, viewMode, limit, user?.id]);

    useEffect(() => {
        loadRankings();
        intervalRef.current = setInterval(() => loadRankings(false), REFRESH_INTERVAL_MS);
        return () => clearInterval(intervalRef.current);
    }, [loadRankings]);

    const clearNewAchievements = useCallback(() => setNewAchievements([]), []);

    return {
        // 데이터
        rankings,
        teamRankings,
        top3: rankings.slice(0, 3),
        currentUserRank: rankings.find(r => r.isCurrentUser) || null,

        // 필터 상태
        rankingType,
        period,
        roleFilter,
        viewMode,

        // 필터 변경 함수
        changeType: setRankingType,
        changePeriod: setPeriod,
        changeRoleFilter: setRoleFilter,
        changeViewMode: setViewMode,

        // 상태
        loading,
        error,
        source,
        refresh: () => loadRankings(true),

        // 업적
        newAchievements,
        clearNewAchievements
    };
}
```

---

### 파일 5: `src/components/dashboard/TeamRankingSidebar.jsx` (전체 교체)

기존 53줄 전체를 아래로 교체. `MOCK_RANKINGS` 완전 제거.

**설계 원칙:**
- `useRankings` 훅 사용
- 포인트/레벨/스트릭 탭
- top3 포디움 유지 (기존 CSS 클래스 재사용)
- 현재 유저 하이라이트 (`podium-slot--current` 클래스)
- top 3 밖이면 "내 순위" 바 표시
- "더보기" 버튼으로 LeaderboardModal 열기
- 데이터 소스 배지 (오프라인/캐시/실시간)
- 로딩/에러 상태

**Props:**
```js
function TeamRankingSidebar({ onShowLeaderboard })
```

**랭킹 타입 탭 정의:**
```js
const RANKING_TYPES = [
    { key: 'points', label: '포인트', icon: '💰' },
    { key: 'level',  label: '레벨',   icon: '⭐' },
    { key: 'streak', label: '스트릭', icon: '🔥' }
];
```

**값 표시 헬퍼:**
```js
function getRankValueDisplay(entry, type) {
    switch (type) {
        case 'points': return `${entry.points.toLocaleString()}P`;
        case 'level':  return entry.level?.name || '';
        case 'streak': return `${entry.streak}일`;
        default:       return '';
    }
}
```

**기존 함수 유지:**
- `getPodiumHeight(rank)` — 1위: 132px, 2위: 106px, 3위: 94px
- `getCrown(rank)` — 1위: 👑, 2위: 🥈, 3위: 🥉
- `PODIUM_ORDER = [2, 1, 3]`

**JSX 구조:**
```
<aside className="dashboard-side-card">
  <header> "팀 랭킹" + 소스 배지 </header>
  <div className="ranking-type-tabs"> 3개 탭 버튼 </div>
  {loading && <div className="ranking-loading">...</div>}
  {error && <div className="ranking-error">데이터를 불러오지 못했습니다.</div>}
  {top3 && <div className="team-podium"> ... 기존 포디움 구조 유지 ... </div>}
  {currentUserRank.rank > 3 && <div className="ranking-my-position"> 내 순위 </div>}
  <button className="dashboard-side-action" onClick={onShowLeaderboard}>더보기</button>
</aside>
```

**포디움 슬롯에 추가:**
- `podium-slot--current` 클래스 (isCurrentUser 시)
- 아바타에 티어 아이콘 표시
- 순위 변동 표시 (▲▼ 또는 NEW)

---

### 파일 6: `src/components/LeaderboardModal.jsx` (신규 생성)

**기존 모달 패턴 따를 것:** `PointsHistoryModal.jsx` 참고 (오버레이 + 내부 컨테이너 + close 버튼 + inline style).

**기능 전체 목록:**
1. 개인/팀 전환 탭 (`viewMode`)
2. 랭킹 타입 필터 (포인트/레벨/스트릭)
3. 기간 필터 (전체/이번 주/이번 달)
4. 역할 필터 (전체/기술자/관리감독자/안전관리자) — 개인 모드에서만
5. Top 20 리스트 (개인) 또는 Top 5 리스트 (팀)
6. 현재 유저 행 강조 (파란 보더/배경)
7. 순위 변동 표시 (▲ 초록, ▼ 빨강, NEW 노랑)
8. Top 3에 왕관/메달 아이콘
9. 각 행에 티어 아이콘 + 이름 + 역할 + 점수
10. 현재 유저가 리스트 밖이면 하단 구분선 아래 별도 표시
11. 데이터 소스 표시 (실시간/캐시/오프라인)
12. 업적 배지 아이콘 (달성 업적 있는 유저)
13. 신규 업적 달성 시 토스트 알림

**Props:**
```js
function LeaderboardModal({ isOpen, onClose })
```

`isOpen`이 false이면 `return null`.

**내부에서 `useRankings('points', 20)` 훅 사용.**

**기간/역할 필터 정의:**
```js
const PERIODS = [
    { key: 'all', label: '전체' },
    { key: 'weekly', label: '이번 주' },
    { key: 'monthly', label: '이번 달' }
];

const ROLE_FILTERS = [
    { key: '', label: '전체' },
    { key: 'technician', label: '기술자' },
    { key: 'supervisor', label: '관리감독자' },
    { key: 'safety_manager', label: '안전관리자' }
];
```

**스타일 가이드 (인라인 style JSX):**
- 모달 오버레이: `background: rgba(0,0,0,0.85)`, `backdropFilter: blur(8px)`, `zIndex: 2000`
- 모달 컨테이너: `background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))`, `borderRadius: 20px`, `maxWidth: 700px`, `maxHeight: 85vh`
- 행 배경: `rgba(15,23,42,0.6)`, 보더: `rgba(148,163,184,0.2)`
- 현재 유저 행: `border-color: #38bdf8`, `background: rgba(56,189,248,0.1)`
- 순위 변동 색상: 상승 `#22c55e`, 하락 `#ef4444`, NEW `#fbbf24`
- 필터 탭: 기존 `ranking-tab` 스타일과 동일한 패턴

---

### 파일 7: `src/pages/Dashboard.jsx` (수정)

**최소 변경만 수행:**

1. import 추가 (상단):
```js
import LeaderboardModal from '../components/LeaderboardModal';
```

2. state 추가 (108행 근처, 다른 모달 state들 옆에):
```js
const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
```

3. 493행의 `<TeamRankingSidebar />` 교체:
```jsx
<TeamRankingSidebar onShowLeaderboard={() => setIsLeaderboardOpen(true)} />
```

4. 모달 렌더링 추가 (570행 `<PointsHistoryModal>` 아래에):
```jsx
<LeaderboardModal
    isOpen={isLeaderboardOpen}
    onClose={() => setIsLeaderboardOpen(false)}
/>
```

**Dashboard.jsx의 다른 코드는 절대 수정하지 말 것.**

---

### 파일 8: `src/styles/pages/dashboard.css` (수정 - 스타일 추가)

기존 `.podium-block span` 규칙(1210~1212행) 아래에 다음 CSS 추가. 기존 CSS는 수정하지 말 것.

```css
/* ====== 랭킹 타입 탭 ====== */
.ranking-type-tabs {
    display: flex;
    gap: 0.35rem;
    margin-bottom: 0.75rem;
}

.ranking-tab {
    flex: 1;
    padding: 0.35rem 0.3rem;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.5);
    color: #94a3b8;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
}

.ranking-tab:hover {
    border-color: rgba(56, 189, 248, 0.5);
    color: #e0f2fe;
}

.ranking-tab--active {
    background: rgba(56, 189, 248, 0.2);
    border-color: rgba(56, 189, 248, 0.6);
    color: #38bdf8;
}

/* ====== 현재 유저 하이라이트 ====== */
.podium-slot--current .podium-avatar {
    border-color: #38bdf8;
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
}

.podium-slot--current .podium-name {
    color: #38bdf8;
}

/* ====== 내 순위 바 (top 3 밖) ====== */
.ranking-my-position {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.6rem;
    margin-top: 0.6rem;
    border-radius: 10px;
    border: 1px solid rgba(56, 189, 248, 0.4);
    background: rgba(56, 189, 248, 0.12);
    font-size: 0.78rem;
    color: #e0f2fe;
}

.ranking-my-position strong {
    color: #38bdf8;
    font-weight: 800;
}

/* ====== 데이터 소스 배지 ====== */
.ranking-source-badge {
    font-size: 0.6rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    font-weight: 700;
}

/* ====== 로딩/에러 마이크로 상태 ====== */
.ranking-loading,
.ranking-error {
    text-align: center;
    padding: 1rem;
    color: #94a3b8;
    font-size: 0.8rem;
}

/* ====== 순위 변동 표시 ====== */
.rank-change-up {
    color: #22c55e;
    font-size: 0.65rem;
    font-weight: 700;
}

.rank-change-down {
    color: #ef4444;
    font-size: 0.65rem;
    font-weight: 700;
}

.rank-change-new {
    color: #fbbf24;
    font-size: 0.6rem;
    font-weight: 700;
    padding: 0.1rem 0.3rem;
    background: rgba(251, 191, 36, 0.15);
    border-radius: 4px;
}

/* ====== 더보기 버튼 ====== */
.dashboard-side-action {
    display: block;
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.4);
    color: #94a3b8;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
}

.dashboard-side-action:hover {
    border-color: rgba(56, 189, 248, 0.5);
    color: #e0f2fe;
    background: rgba(56, 189, 248, 0.1);
}
```

---

## 디자인 색상 팔레트 (기존 프로젝트 준수)

| 용도 | 색상 |
|------|------|
| 주요 강조 (Cyan) | `#38bdf8` |
| 텍스트 밝음 | `#f8fafc` |
| 텍스트 보조 | `#94a3b8` |
| 텍스트 어두움 | `#e2e8f0` |
| 배경 어두움 | `rgba(15, 23, 42, ...)` |
| 금색 (1위) | `rgba(250, 204, 21, ...)` |
| 은색 (2위) | `rgba(226, 232, 240, ...)` |
| 동색 (3위) | `rgba(251, 146, 60, ...)` |
| 성공/상승 | `#22c55e` |
| 위험/하락 | `#ef4444` |
| 경고/NEW | `#fbbf24` |

---

## 구현 순서 (의존성 기반 - 반드시 이 순서로)

```
1. src/api/userApi.js (수정)
2. src/utils/rankingManager.js (신규)
3. src/utils/rankingAchievements.js (신규)
4. src/hooks/useRankings.js (신규)
5. src/components/dashboard/TeamRankingSidebar.jsx (전체 교체)
6. src/styles/pages/dashboard.css (스타일 추가)
7. src/components/LeaderboardModal.jsx (신규)
8. src/pages/Dashboard.jsx (최소 수정)
```

---

## 주의사항

1. **기존 코드 보존**: Dashboard.jsx, pointsCalculator.js, storage.js, AuthContext.jsx의 기존 로직은 절대 수정하지 말 것
2. **calculateLevel 재사용**: 레벨 정보는 반드시 `calculateLevel(points)`로 계산. 직접 레벨 계산 로직 작성 금지
3. **storage 재사용**: `storage.set()` / `storage.get()`은 자동으로 사용자 스코프를 적용함. 직접 `localStorage.setItem` 사용 금지 (토큰 제외)
4. **DEV 모드 대응**: `AUTH_BYPASS_ENABLED` 상태에서는 API 호출 시도하지 않고 바로 폴백 사용
5. **빈 응답 처리**: API가 빈 배열을 반환하면 폴백으로 전환
6. **CSS 클래스 충돌 방지**: 모든 새 클래스는 `ranking-`, `leaderboard-`, `podium-slot--`, `rank-change-` 접두사 사용
7. **한국어 UI**: 모든 사용자 표시 텍스트는 한국어로 작성
8. **에러 핸들링**: API 실패는 조용히 처리 (console.warn만), 사용자에게는 폴백 데이터 표시
