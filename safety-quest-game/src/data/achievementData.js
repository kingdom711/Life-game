/**
 * 업적(Achievement) 데이터 정의
 * 장기 목표 제시를 통한 지속적 참여 동기 부여
 */

export const ACHIEVEMENT_CATEGORY = {
    ATTENDANCE: 'attendance',
    QUEST: 'quest',
    HAZARD: 'hazard',
    EDUCATION: 'education',
    EQUIPMENT: 'equipment',
    SOCIAL: 'social',
    SPECIAL: 'special'
};

export const ACHIEVEMENT_CATEGORY_NAMES = {
    [ACHIEVEMENT_CATEGORY.ATTENDANCE]: '출석',
    [ACHIEVEMENT_CATEGORY.QUEST]: '퀘스트',
    [ACHIEVEMENT_CATEGORY.HAZARD]: '위험 신고',
    [ACHIEVEMENT_CATEGORY.EDUCATION]: '교육',
    [ACHIEVEMENT_CATEGORY.EQUIPMENT]: '장비',
    [ACHIEVEMENT_CATEGORY.SOCIAL]: '소셜',
    [ACHIEVEMENT_CATEGORY.SPECIAL]: '히든'
};

export const ACHIEVEMENT_CATEGORY_ICONS = {
    [ACHIEVEMENT_CATEGORY.ATTENDANCE]: '📅',
    [ACHIEVEMENT_CATEGORY.QUEST]: '🎯',
    [ACHIEVEMENT_CATEGORY.HAZARD]: '🔍',
    [ACHIEVEMENT_CATEGORY.EDUCATION]: '📚',
    [ACHIEVEMENT_CATEGORY.EQUIPMENT]: '⛑️',
    [ACHIEVEMENT_CATEGORY.SOCIAL]: '👥',
    [ACHIEVEMENT_CATEGORY.SPECIAL]: '✨'
};

export const achievements = [
    // ===== 출석 업적 =====
    {
        id: 'attend_7',
        category: ACHIEVEMENT_CATEGORY.ATTENDANCE,
        name: '꾸준한 첫걸음',
        description: '7일 연속 출석을 달성하세요.',
        icon: '🌱',
        condition: { type: 'streak', target: 7 },
        reward: { gold: 100, badge: true },
        rarity: 'common'
    },
    {
        id: 'attend_30',
        category: ACHIEVEMENT_CATEGORY.ATTENDANCE,
        name: '철벽 출석왕',
        description: '30일 연속 출석을 달성하세요.',
        icon: '🔥',
        condition: { type: 'streak', target: 30 },
        reward: { gold: 500, badge: true },
        rarity: 'rare'
    },
    {
        id: 'attend_100',
        category: ACHIEVEMENT_CATEGORY.ATTENDANCE,
        name: '안전의 전설',
        description: '100일 연속 출석을 달성하세요.',
        icon: '👑',
        condition: { type: 'streak', target: 100 },
        reward: { gold: 2000, badge: true },
        rarity: 'legendary'
    },

    // ===== 퀘스트 업적 =====
    {
        id: 'quest_daily_10',
        category: ACHIEVEMENT_CATEGORY.QUEST,
        name: '퀘스트 수행자',
        description: '일일 퀘스트 전체 완료를 10일 달성하세요.',
        icon: '⚔️',
        condition: { type: 'daily_perfect', target: 10 },
        reward: { gold: 300, badge: true },
        rarity: 'common'
    },
    {
        id: 'quest_daily_30',
        category: ACHIEVEMENT_CATEGORY.QUEST,
        name: '퀘스트 정복자',
        description: '일일 퀘스트 전체 완료를 30일 달성하세요.',
        icon: '🏅',
        condition: { type: 'daily_perfect', target: 30 },
        reward: { gold: 1000, badge: true },
        rarity: 'epic'
    },
    {
        id: 'quest_total_100',
        category: ACHIEVEMENT_CATEGORY.QUEST,
        name: '백전백승',
        description: '퀘스트를 총 100개 완료하세요.',
        icon: '💯',
        condition: { type: 'quest_total', target: 100 },
        reward: { gold: 500, badge: true },
        rarity: 'rare'
    },
    {
        id: 'quest_total_500',
        category: ACHIEVEMENT_CATEGORY.QUEST,
        name: '전설의 모험가',
        description: '퀘스트를 총 500개 완료하세요.',
        icon: '🌟',
        condition: { type: 'quest_total', target: 500 },
        reward: { gold: 3000, badge: true },
        rarity: 'legendary'
    },

    // ===== 위험 신고 업적 =====
    {
        id: 'hazard_5',
        category: ACHIEVEMENT_CATEGORY.HAZARD,
        name: '안전 감시자',
        description: '위험 신고를 5회 완료하세요.',
        icon: '👁️',
        condition: { type: 'hazard_report', target: 5 },
        reward: { gold: 150, badge: true },
        rarity: 'common'
    },
    {
        id: 'hazard_10',
        category: ACHIEVEMENT_CATEGORY.HAZARD,
        name: '안전 파수꾼',
        description: '위험 신고를 10회 완료하세요.',
        icon: '🛡️',
        condition: { type: 'hazard_report', target: 10 },
        reward: { gold: 300, badge: true },
        rarity: 'common'
    },
    {
        id: 'hazard_50',
        category: ACHIEVEMENT_CATEGORY.HAZARD,
        name: '위험 헌터',
        description: '위험 신고를 50회 완료하세요.',
        icon: '🎯',
        condition: { type: 'hazard_report', target: 50 },
        reward: { gold: 1500, badge: true },
        rarity: 'epic'
    },

    // ===== 교육 업적 =====
    {
        id: 'edu_10',
        category: ACHIEVEMENT_CATEGORY.EDUCATION,
        name: '학습의 시작',
        description: '교육 영상을 10개 완료하세요.',
        icon: '📖',
        condition: { type: 'education_complete', target: 10 },
        reward: { gold: 200, badge: true },
        rarity: 'common'
    },
    {
        id: 'edu_50',
        category: ACHIEVEMENT_CATEGORY.EDUCATION,
        name: '학습의 달인',
        description: '교육 영상을 50개 완료하세요.',
        icon: '🎓',
        condition: { type: 'education_complete', target: 50 },
        reward: { gold: 500, badge: true },
        rarity: 'rare'
    },
    {
        id: 'quiz_perfect_5',
        category: ACHIEVEMENT_CATEGORY.EDUCATION,
        name: '퀴즈 천재',
        description: '퀴즈 100% 정답을 5회 연속 달성하세요.',
        icon: '🧠',
        condition: { type: 'quiz_perfect_streak', target: 5 },
        reward: { gold: 400, badge: true },
        rarity: 'rare'
    },
    {
        id: 'quiz_perfect_10',
        category: ACHIEVEMENT_CATEGORY.EDUCATION,
        name: '퀴즈 마스터',
        description: '퀴즈 100% 정답을 10회 연속 달성하세요.',
        icon: '💡',
        condition: { type: 'quiz_perfect_streak', target: 10 },
        reward: { gold: 800, badge: true },
        rarity: 'epic'
    },

    // ===== 장비 업적 =====
    {
        id: 'equip_first',
        category: ACHIEVEMENT_CATEGORY.EQUIPMENT,
        name: '첫 장비 착용',
        description: '장비를 처음으로 착용하세요.',
        icon: '🎽',
        condition: { type: 'equip_count', target: 1 },
        reward: { gold: 50, badge: true },
        rarity: 'common'
    },
    {
        id: 'equip_full_rare',
        category: ACHIEVEMENT_CATEGORY.EQUIPMENT,
        name: '숙련자의 품격',
        description: 'Rare 이상 장비를 5개 보유하세요.',
        icon: '💎',
        condition: { type: 'rare_items', target: 5 },
        reward: { gold: 500, badge: true },
        rarity: 'rare'
    },
    {
        id: 'equip_full_epic',
        category: ACHIEVEMENT_CATEGORY.EQUIPMENT,
        name: '전문가의 무장',
        description: 'Epic 이상 장비를 5슬롯 모두 장착하세요.',
        icon: '⚡',
        condition: { type: 'epic_full_set', target: 5 },
        reward: { gold: 1000, badge: true },
        rarity: 'epic'
    },
    {
        id: 'equip_legendary',
        category: ACHIEVEMENT_CATEGORY.EQUIPMENT,
        name: '전설의 수집가',
        description: 'Legendary 장비를 3개 이상 보유하세요.',
        icon: '🏆',
        condition: { type: 'legendary_items', target: 3 },
        reward: { gold: 2000, badge: true },
        rarity: 'legendary'
    },
    {
        id: 'calibration_10',
        category: ACHIEVEMENT_CATEGORY.EQUIPMENT,
        name: '검교정 장인',
        description: '장비 검교정(강화)을 총 10회 성공하세요.',
        icon: '🔧',
        condition: { type: 'calibration_success', target: 10 },
        reward: { gold: 300, badge: true },
        rarity: 'rare'
    },

    // ===== 소셜 업적 =====
    {
        id: 'praise_send_10',
        category: ACHIEVEMENT_CATEGORY.SOCIAL,
        name: '칭찬 전도사',
        description: '동료에게 칭찬을 10회 보내세요.',
        icon: '👏',
        condition: { type: 'praise_sent', target: 10 },
        reward: { gold: 200, badge: true },
        rarity: 'common'
    },
    {
        id: 'praise_recv_10',
        category: ACHIEVEMENT_CATEGORY.SOCIAL,
        name: '모범 안전인',
        description: '동료로부터 칭찬을 10회 받으세요.',
        icon: '🌟',
        condition: { type: 'praise_received', target: 10 },
        reward: { gold: 200, badge: true },
        rarity: 'common'
    },
    {
        id: 'praise_recv_50',
        category: ACHIEVEMENT_CATEGORY.SOCIAL,
        name: '인기 스타',
        description: '동료로부터 칭찬을 50회 받으세요.',
        icon: '⭐',
        condition: { type: 'praise_received', target: 50 },
        reward: { gold: 500, badge: true },
        rarity: 'rare'
    },

    // ===== 히든 업적 =====
    {
        id: 'hidden_early_bird',
        category: ACHIEVEMENT_CATEGORY.SPECIAL,
        name: '새벽의 파수꾼',
        description: '06:00 이전에 퀘스트를 완료한 적이 5회 있으세요.',
        icon: '🌅',
        condition: { type: 'early_bird', target: 5 },
        reward: { gold: 300, badge: true },
        rarity: 'rare',
        hidden: true
    },
    {
        id: 'hidden_first_day',
        category: ACHIEVEMENT_CATEGORY.SPECIAL,
        name: '첫 발견',
        description: '가입 첫날 위험 신고를 1건 완료하세요.',
        icon: '🔰',
        condition: { type: 'first_day_report', target: 1 },
        reward: { gold: 100, badge: true },
        rarity: 'common',
        hidden: true
    },
    {
        id: 'hidden_night_owl',
        category: ACHIEVEMENT_CATEGORY.SPECIAL,
        name: '야간 순찰대',
        description: '22:00 이후에 퀘스트를 완료한 적이 5회 있으세요.',
        icon: '🦉',
        condition: { type: 'night_owl', target: 5 },
        reward: { gold: 300, badge: true },
        rarity: 'rare',
        hidden: true
    },
    {
        id: 'hidden_speed_run',
        category: ACHIEVEMENT_CATEGORY.SPECIAL,
        name: '스피드 러너',
        description: '일일 퀘스트를 오전 9시 이전에 모두 완료하세요.',
        icon: '⚡',
        condition: { type: 'speed_run', target: 1 },
        reward: { gold: 500, badge: true },
        rarity: 'epic',
        hidden: true
    }
];

export const getAchievementById = (id) => achievements.find(a => a.id === id);

export const getAchievementsByCategory = (category) =>
    achievements.filter(a => a.category === category);

export const getVisibleAchievements = () =>
    achievements.filter(a => !a.hidden);

export const getHiddenAchievements = () =>
    achievements.filter(a => a.hidden);

export const RARITY_COLORS = {
    common: '#94a3b8',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#eab308'
};

export const RARITY_BG = {
    common: 'rgba(148, 163, 184, 0.15)',
    rare: 'rgba(59, 130, 246, 0.15)',
    epic: 'rgba(168, 85, 247, 0.15)',
    legendary: 'rgba(234, 179, 8, 0.15)'
};
