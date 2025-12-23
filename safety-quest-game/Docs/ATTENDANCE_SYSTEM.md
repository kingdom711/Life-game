# 출석 및 보상 시스템 설계 문서

## 개요

안전의 길 게임은 일일 출석 체크와 월간 보상 시스템을 통해 사용자의 지속적인 참여를 유도합니다. 한 달에 26일만 출석해도 모든 보상을 받을 수 있도록 설계되어 있습니다.

## 시스템 구성

### 1. 일일 연속 출석 (Streak)

- 매일 출석 체크 시 연속 출석 일수 증가
- 하루라도 빠지면 연속 출석 초기화
- 연속 출석 기록은 별도로 저장 (최장 연속 출석 기록)

### 2. 월간 출석 보상

- 매월 1일에 자동 리셋
- 26일 출석으로 전체 보상 수령 가능
- 캘린더 형식의 보상 현황 UI

## 월간 보상 테이블

| 출석일 | 보상 | 유형 |
|--------|------|------|
| 1일차 | 30P | 포인트 |
| 2일차 | 40P | 포인트 |
| 3일차 | 50P | 포인트 |
| 4일차 | 60P | 포인트 |
| 5일차 | 70P | 포인트 |
| 6일차 | 80P | 포인트 |
| 7일차 | 90P | 포인트 |
| 8일차 | 100P | 포인트 |
| 9일차 | 일반 아이템 상자 | 아이템 |
| 10일차 | 150P | 포인트 |
| 11일차 | 200P | 포인트 |
| 12일차 | 고급 아이템 상자 | 아이템 |
| 13일차 | 250P | 포인트 |
| 14일차 | 300P | 포인트 |
| 15일차 | 희귀 아이템 상자 | 아이템 |
| 16일차 | 350P | 포인트 |
| 17일차 | 400P | 포인트 |
| 18일차 | 450P | 포인트 |
| 19일차 | 전설 아이템 상자 | 아이템 |
| 20일차 | 500P | 포인트 |
| 21일차 | 600P | 포인트 |
| 22일차 | 700P | 포인트 |
| 23일차 | 800P | 포인트 |
| 24일차 | 1,000P | 포인트 |
| 25일차 | 특별 아이템 상자 | 아이템 |
| 26일차 | 2,000P + 전설 아이템 | 대보상 |

### 총 보상 합계
- **포인트**: 약 8,200P
- **아이템 상자**: 6개 (일반, 고급, 희귀, 전설×2, 특별)

## 관련 파일

### 핵심 파일

| 파일 경로 | 설명 |
|-----------|------|
| `src/utils/storage.js` | streak, monthlyAttendance 객체 |
| `src/components/StreakButton.jsx` | 출석 체크 버튼 |
| `src/components/MonthlyAttendanceModal.jsx` | 월간 보상 모달 |
| `src/pages/Dashboard.jsx` | 모달 통합 및 표시 로직 |

### 데이터 구조

#### streak (일일 연속 출석)

```javascript
// storage.js
export const streak = {
    get: () => storage.get('safety_quest_streak', { 
        current: 0, 
        longest: 0, 
        lastDate: null 
    }),
    
    increment: () => {
        const today = new Date().toDateString();
        const current = streak.get();
        
        if (current.lastDate === today) {
            return current; // 이미 오늘 출석함
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        let newStreak;
        if (current.lastDate === yesterday.toDateString()) {
            // 연속 출석
            newStreak = current.current + 1;
        } else {
            // 연속 끊김, 새로 시작
            newStreak = 1;
        }
        
        const updated = {
            current: newStreak,
            longest: Math.max(newStreak, current.longest),
            lastDate: today
        };
        
        storage.set('safety_quest_streak', updated);
        return updated;
    }
};
```

#### monthlyAttendance (월간 출석)

```javascript
// storage.js
export const monthlyAttendance = {
    get: () => {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const data = storage.get('safety_quest_monthly_attendance', {
            currentMonth: currentMonth,
            attendedDays: [],
            claimedRewards: [],
            totalAttendance: 0
        });
        
        // 월이 변경되면 리셋
        if (data.currentMonth !== currentMonth) {
            return {
                currentMonth: currentMonth,
                attendedDays: [],
                claimedRewards: [],
                totalAttendance: 0
            };
        }
        
        return data;
    },
    
    recordAttendance: (day) => {
        const data = monthlyAttendance.get();
        if (!data.attendedDays.includes(day)) {
            data.attendedDays.push(day);
            data.totalAttendance = data.attendedDays.length;
            storage.set('safety_quest_monthly_attendance', data);
        }
        return data;
    },
    
    claimReward: (rewardDay) => {
        const data = monthlyAttendance.get();
        if (!data.claimedRewards.includes(rewardDay)) {
            data.claimedRewards.push(rewardDay);
            storage.set('safety_quest_monthly_attendance', data);
        }
        return data;
    }
};
```

## UI 구성

### StreakButton (출석 체크 버튼)

```
┌─────────────────────────────┐
│  🔥 출석 완료! 7일 연속     │
│     [클릭 시 모달 표시]     │
└─────────────────────────────┘
```

### MonthlyAttendanceModal (월간 보상 모달)

```
┌─────────────────────────────────────┐
│         📅 12월 출석 보상           │
├─────────────────────────────────────┤
│  [1]  [2]  [3]  [4]  [5]  [6]  [7] │
│  ✅   ✅   ✅   ✅   🎁   🎁   🔒  │
│  30P  40P  50P  60P  70P  80P  90P │
│                                     │
│  ... (캘린더 형태로 26일까지)       │
│                                     │
│  📊 진행 현황: 4/26일 출석          │
│  🎁 다음 보상: 5일차 (70P)          │
└─────────────────────────────────────┘
```

## 설계 원칙

1. **여유로운 목표**: 31일 중 26일만 출석해도 전체 보상 수령
2. **점진적 보상 증가**: 출석일이 늘어날수록 보상 가치 증가
3. **아이템 배치**: 중간중간 아이템 상자로 동기 부여
4. **대보상**: 26일차에 가장 큰 보상으로 완주 유도
5. **자동 리셋**: 매월 1일 자동 초기화

## 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2024-12-23 | 월간 출석 보상 시스템 설계 |
| 2024-12-23 | MonthlyAttendanceModal 컴포넌트 생성 |

