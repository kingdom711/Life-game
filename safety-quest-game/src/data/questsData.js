// 퀘스트 타입
export const QUEST_TYPE = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
};

// 퀘스트 카테고리
export const QUEST_CATEGORY = {
    CHECKLIST: 'checklist',
    PHOTO: 'photo',
    REVIEW: 'review',
    SAFETY: 'safety',
    LOGIN: 'login'
};

// 일간 퀘스트
export const dailyQuests = [
    {
        id: 'daily_checklist_1',
        type: QUEST_TYPE.DAILY,
        category: QUEST_CATEGORY.CHECKLIST,
        role: 'technician',
        title: '체크리스트 1건 작성하기',
        description: '오늘 체크리스트를 1건 작성하고 제출하세요',
        icon: '📝',
        requirement: {
            type: 'count',
            target: 1,
            action: 'submit_checklist'
        },
        reward: {
            points: 50,
            exp: 10
        }
    },
    {
        id: 'daily_photo_1',
        type: QUEST_TYPE.DAILY,
        category: QUEST_CATEGORY.PHOTO,
        role: 'technician',
        title: '작업 사진 3장 업로드하기',
        description: '작업 현장 사진을 3장 업로드하세요',
        icon: '📷',
        requirement: {
            type: 'count',
            target: 3,
            action: 'upload_photo'
        },
        reward: {
            points: 30,
            exp: 5
        }
    },
    {
        id: 'daily_review_1',
        type: QUEST_TYPE.DAILY,
        category: QUEST_CATEGORY.REVIEW,
        role: 'supervisor',
        title: '체크리스트 2건 검토하기',
        description: '제출된 체크리스트를 2건 검토하세요',
        icon: '🔍',
        requirement: {
            type: 'count',
            target: 2,
            action: 'review_checklist'
        },
        reward: {
            points: 60,
            exp: 12
        }
    },
    {
        id: 'daily_safety_1',
        type: QUEST_TYPE.DAILY,
        category: QUEST_CATEGORY.SAFETY,
        role: 'safetyManager',
        title: '위험 항목 1건 확인하기',
        description: '위험도가 높은 항목을 1건 확인하고 조치하세요',
        icon: '⚠️',
        requirement: {
            type: 'count',
            target: 1,
            action: 'check_risk'
        },
        reward: {
            points: 70,
            exp: 15
        }
    },
    {
        id: 'daily_login_1',
        type: QUEST_TYPE.DAILY,
        category: QUEST_CATEGORY.LOGIN,
        role: 'all',
        title: '로그인 스트릭 유지하기',
        description: '매일 접속하여 연속 로그인 기록을 유지하세요',
        icon: '🔥',
        requirement: {
            type: 'action',
            action: 'daily_login'
        },
        reward: {
            points: 20,
            exp: 5
        }
    }
];

// 주간 퀘스트
export const weeklyQuests = [
    {
        id: 'weekly_checklist_1',
        type: QUEST_TYPE.WEEKLY,
        category: QUEST_CATEGORY.CHECKLIST,
        role: 'technician',
        title: '체크리스트 10건 제출하기',
        description: '이번 주에 체크리스트를 10건 제출하세요',
        icon: '📋',
        requirement: {
            type: 'count',
            target: 10,
            action: 'submit_checklist'
        },
        reward: {
            points: 300,
            exp: 50
        }
    },
    {
        id: 'weekly_complete_daily',
        type: QUEST_TYPE.WEEKLY,
        category: QUEST_CATEGORY.LOGIN,
        role: 'all',
        title: '모든 일간 퀘스트 달성하기',
        description: '일주일 동안 매일 모든 일간 퀘스트를 완료하세요',
        icon: '🎯',
        requirement: {
            type: 'streak',
            target: 7,
            action: 'complete_daily_quests'
        },
        reward: {
            points: 400,
            exp: 80
        }
    },
    {
        id: 'weekly_safety_1',
        type: QUEST_TYPE.WEEKLY,
        category: QUEST_CATEGORY.SAFETY,
        role: 'safetyManager',
        title: '위험도 높음 항목 5건 조치하기',
        description: '위험도가 높은 항목을 5건 조치하고 완료하세요',
        icon: '🛡️',
        requirement: {
            type: 'count',
            target: 5,
            action: 'resolve_high_risk'
        },
        reward: {
            points: 500,
            exp: 100
        }
    },
    {
        id: 'weekly_approval_rate',
        type: QUEST_TYPE.WEEKLY,
        category: QUEST_CATEGORY.REVIEW,
        role: 'supervisor',
        title: '승인율 90% 이상 달성하기',
        description: '체크리스트 검토 승인율 90% 이상을 달성하세요',
        icon: '✅',
        requirement: {
            type: 'rate',
            target: 90,
            action: 'approval_rate'
        },
        reward: {
            points: 350,
            exp: 70
        }
    },
    {
        id: 'weekly_photo_collection',
        type: QUEST_TYPE.WEEKLY,
        category: QUEST_CATEGORY.PHOTO,
        role: 'technician',
        title: '작업 사진 20장 수집하기',
        description: '다양한 작업 현장 사진을 20장 업로드하세요',
        icon: '📸',
        requirement: {
            type: 'count',
            target: 20,
            action: 'upload_photo'
        },
        reward: {
            points: 250,
            exp: 40
        }
    }
];

// 월간 퀘스트
export const monthlyQuests = [
    {
        id: 'monthly_checklist_master',
        type: QUEST_TYPE.MONTHLY,
        category: QUEST_CATEGORY.CHECKLIST,
        role: 'technician',
        title: '누적 체크리스트 50건 달성',
        description: '이번 달에 체크리스트를 총 50건 제출하세요',
        icon: '🏆',
        requirement: {
            type: 'count',
            target: 50,
            action: 'submit_checklist'
        },
        reward: {
            points: 1500,
            exp: 250
        }
    },
    {
        id: 'monthly_perfect_weeks',
        type: QUEST_TYPE.MONTHLY,
        category: QUEST_CATEGORY.LOGIN,
        role: 'all',
        title: '완벽한 주간 퀘스트 달성 (4주 연속)',
        description: '4주 연속으로 모든 주간 퀘스트를 완료하세요',
        icon: '💎',
        requirement: {
            type: 'streak',
            target: 4,
            action: 'complete_weekly_quests'
        },
        reward: {
            points: 2000,
            exp: 400
        }
    },
    {
        id: 'monthly_ai_accuracy',
        type: QUEST_TYPE.MONTHLY,
        category: QUEST_CATEGORY.SAFETY,
        role: 'safetyManager',
        title: 'AI 위험도 분석 정확도 기여',
        description: 'AI 위험도 분석 결과를 검증하고 정확도를 높이세요',
        icon: '🤖',
        requirement: {
            type: 'count',
            target: 30,
            action: 'verify_ai_analysis'
        },
        reward: {
            points: 1800,
            exp: 350
        }
    },
    {
        id: 'monthly_zero_accident',
        type: QUEST_TYPE.MONTHLY,
        category: QUEST_CATEGORY.SAFETY,
        role: 'all',
        title: '안전 사고 0건 유지',
        description: '이번 달 안전 사고를 0건으로 유지하세요',
        icon: '🌟',
        requirement: {
            type: 'maintain',
            target: 0,
            action: 'accident_count'
        },
        reward: {
            points: 2500,
            exp: 500
        }
    },
    {
        id: 'monthly_mentor',
        type: QUEST_TYPE.MONTHLY,
        category: QUEST_CATEGORY.REVIEW,
        role: 'supervisor',
        title: '검토 마스터',
        description: '이번 달 100건 이상의 체크리스트를 검토하세요',
        icon: '👨‍🏫',
        requirement: {
            type: 'count',
            target: 100,
            action: 'review_checklist'
        },
        reward: {
            points: 1600,
            exp: 300
        }
    }
];

// 모든 퀘스트
export const allQuests = [...dailyQuests, ...weeklyQuests, ...monthlyQuests];

// 유틸리티 함수들
export const getQuestById = (questId) => {
    return allQuests.find(quest => quest.id === questId);
};

export const getQuestsByType = (type) => {
    return allQuests.filter(quest => quest.type === type);
};

export const getQuestsByRole = (role) => {
    return allQuests.filter(quest => quest.role === role || quest.role === 'all');
};

export const getQuestsByTypeAndRole = (type, role) => {
    return allQuests.filter(quest =>
        quest.type === type && (quest.role === role || quest.role === 'all')
    );
};

export const calculateQuestProgress = (quest, userProgress) => {
    if (!userProgress || !userProgress[quest.id]) {
        return 0;
    }

    const progress = userProgress[quest.id];
    const target = quest.requirement.target || 1;

    return Math.min(100, Math.round((progress.current / target) * 100));
};

export const isQuestCompleted = (quest, userProgress) => {
    return calculateQuestProgress(quest, userProgress) >= 100;
};
