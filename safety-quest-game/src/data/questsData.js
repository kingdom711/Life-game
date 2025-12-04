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
        title: '오늘의 안전 점검',
        description: '작업 시작 전 필수 체크리스트를 1건 작성하여 안전을 확보하세요!',
        icon: '📝',
        requirement: {
            type: 'count',
            target: 1,
            action: 'submit_checklist'
        },
        reward: {
            points: 100,
            exp: 20
        }
    },
    {
        id: 'daily_photo_1',
        type: QUEST_TYPE.DAILY,
        category: QUEST_CATEGORY.PHOTO,
        role: 'technician',
        title: '현장 포착: 위험을 찾아라',
        description: '작업 현장의 안전/위험 요소를 촬영하여 3장 업로드하세요.',
        icon: '📸',
        requirement: {
            type: 'count',
            target: 3,
            action: 'upload_photo'
        },
        reward: {
            points: 150,
            exp: 30
        }
    },
    {
        id: 'daily_review_1',
        type: QUEST_TYPE.DAILY,
        category: QUEST_CATEGORY.REVIEW,
        role: 'supervisor',
        title: '꼼꼼한 관리자',
        description: '팀원들이 제출한 체크리스트 2건을 검토하고 피드백을 남기세요.',
        icon: '🧐',
        requirement: {
            type: 'count',
            target: 2,
            action: 'review_checklist'
        },
        reward: {
            points: 200,
            exp: 40
        }
    },
    {
        id: 'daily_safety_1',
        type: QUEST_TYPE.DAILY,
        category: QUEST_CATEGORY.SAFETY,
        role: 'safetyManager',
        title: '일일 위험 요소 제거',
        description: '현장에서 발견된 고위험 항목 1건을 확인하고 조치 완료하세요.',
        icon: '🛡️',
        requirement: {
            type: 'count',
            target: 1,
            action: 'check_risk'
        },
        reward: {
            points: 250,
            exp: 50
        }
    },
    {
        id: 'daily_login_1',
        type: QUEST_TYPE.DAILY,
        category: QUEST_CATEGORY.LOGIN,
        role: 'all',
        title: '출근 도장 쾅!',
        description: '오늘도 안전한 하루! 게임에 접속하여 출석 체크를 완료하세요.',
        icon: '📅',
        requirement: {
            type: 'action',
            action: 'daily_login'
        },
        reward: {
            points: 50,
            exp: 10
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
        title: '성실한 안전 지킴이',
        description: '이번 주 동안 체크리스트 10건을 작성하여 꾸준함을 증명하세요.',
        icon: '📋',
        requirement: {
            type: 'count',
            target: 10,
            action: 'submit_checklist'
        },
        reward: {
            points: 1000,
            exp: 200
        }
    },
    {
        id: 'weekly_complete_daily',
        type: QUEST_TYPE.WEEKLY,
        category: QUEST_CATEGORY.LOGIN,
        role: 'all',
        title: '7일의 기적',
        description: '일주일 동안 하루도 빠짐없이 모든 일간 퀘스트를 완료하세요!',
        icon: '🔥',
        requirement: {
            type: 'streak',
            target: 7,
            action: 'complete_daily_quests'
        },
        reward: {
            points: 1500,
            exp: 300
        }
    },
    {
        id: 'weekly_safety_1',
        type: QUEST_TYPE.WEEKLY,
        category: QUEST_CATEGORY.SAFETY,
        role: 'safetyManager',
        title: '위험 제로 챌린지',
        description: '이번 주 고위험 항목 5건을 완벽하게 조치하여 사고를 예방하세요.',
        icon: '👷',
        requirement: {
            type: 'count',
            target: 5,
            action: 'resolve_high_risk'
        },
        reward: {
            points: 2000,
            exp: 400
        }
    },
    {
        id: 'weekly_approval_rate',
        type: QUEST_TYPE.WEEKLY,
        category: QUEST_CATEGORY.REVIEW,
        role: 'supervisor',
        title: '완벽한 관리 감독',
        description: '체크리스트 검토 승인율 90% 이상을 달성하여 신뢰받는 관리자가 되세요.',
        icon: '👑',
        requirement: {
            type: 'rate',
            target: 90,
            action: 'approval_rate'
        },
        reward: {
            points: 1200,
            exp: 250
        }
    },
    {
        id: 'weekly_photo_collection',
        type: QUEST_TYPE.WEEKLY,
        category: QUEST_CATEGORY.PHOTO,
        role: 'technician',
        title: '현장 기록 전문가',
        description: '현장의 생생한 모습을 담은 사진 20장을 수집하여 데이터베이스를 구축하세요.',
        icon: '📂',
        requirement: {
            type: 'count',
            target: 20,
            action: 'upload_photo'
        },
        reward: {
            points: 800,
            exp: 150
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
        title: '전설의 체크리스트 마스터',
        description: '한 달 동안 체크리스트 50건을 작성하여 안전 관리의 달인이 되세요!',
        icon: '🏆',
        requirement: {
            type: 'count',
            target: 50,
            action: 'submit_checklist'
        },
        reward: {
            points: 5000,
            exp: 1000
        }
    },
    {
        id: 'monthly_perfect_weeks',
        type: QUEST_TYPE.MONTHLY,
        category: QUEST_CATEGORY.LOGIN,
        role: 'all',
        title: '4주 연속 퍼펙트 클리어',
        description: '4주 연속으로 주간 퀘스트를 모두 완료하여 끈기와 열정을 보여주세요.',
        icon: '💎',
        requirement: {
            type: 'streak',
            target: 4,
            action: 'complete_weekly_quests'
        },
        reward: {
            points: 10000,
            exp: 2000
        }
    },
    {
        id: 'monthly_ai_accuracy',
        type: QUEST_TYPE.MONTHLY,
        category: QUEST_CATEGORY.SAFETY,
        role: 'safetyManager',
        title: 'AI 안전 분석가',
        description: 'AI 위험도 분석 결과 30건을 검증하여 시스템의 정확도를 높이세요.',
        icon: '🧠',
        requirement: {
            type: 'count',
            target: 30,
            action: 'verify_ai_analysis'
        },
        reward: {
            points: 8000,
            exp: 1500
        }
    },
    {
        id: 'monthly_zero_accident',
        type: QUEST_TYPE.MONTHLY,
        category: QUEST_CATEGORY.SAFETY,
        role: 'all',
        title: '무재해 30일 달성',
        description: '우리 현장의 안전을 지켜 이번 달 안전 사고 0건을 달성하세요!',
        icon: '🌟',
        requirement: {
            type: 'maintain',
            target: 0,
            action: 'accident_count'
        },
        reward: {
            points: 15000,
            exp: 3000
        }
    },
    {
        id: 'monthly_mentor',
        type: QUEST_TYPE.MONTHLY,
        category: QUEST_CATEGORY.REVIEW,
        role: 'supervisor',
        title: '최고의 멘토',
        description: '한 달 동안 100건 이상의 체크리스트를 검토하고 팀원들을 이끄세요.',
        icon: '🎖️',
        requirement: {
            type: 'count',
            target: 100,
            action: 'review_checklist'
        },
        reward: {
            points: 7000,
            exp: 1200
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
