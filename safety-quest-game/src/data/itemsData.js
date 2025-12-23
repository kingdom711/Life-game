// 아이템 등급
export const ITEM_RARITY = {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

// 아이템 카테고리
export const ITEM_CATEGORY = {
    HELMET: 'helmet',
    VEST: 'vest',
    GLOVES: 'gloves',
    SHOES: 'shoes',
    GLASSES: 'glasses',
    BELT: 'belt',
    MASK: 'mask'
};

// 카테고리 표시 이름
export const CATEGORY_NAMES = {
    [ITEM_CATEGORY.HELMET]: '안전모',
    [ITEM_CATEGORY.VEST]: '안전조끼',
    [ITEM_CATEGORY.GLOVES]: '안전장갑',
    [ITEM_CATEGORY.SHOES]: '안전화',
    [ITEM_CATEGORY.GLASSES]: '보안경',
    [ITEM_CATEGORY.BELT]: '안전벨트',
    [ITEM_CATEGORY.MASK]: '방진마스크'
};

// 등급 표시 이름
export const RARITY_NAMES = {
    [ITEM_RARITY.COMMON]: '일반',
    [ITEM_RARITY.RARE]: '고급',
    [ITEM_RARITY.EPIC]: '희귀',
    [ITEM_RARITY.LEGENDARY]: '전설'
};

// 등급별 검교정(강화) 기본 설정
export const CALIBRATION_CONFIGS = {
    [ITEM_RARITY.COMMON]: {
        maxLevel: 5,
        costPerLevel: 200,
        successRateBase: 0.95,
        successRateDecay: 0.05,  // 레벨당 성공률 감소
        statIncrement: 1.0       // 레벨당 스탯 증가폭 (%)
    },
    [ITEM_RARITY.RARE]: {
        maxLevel: 7,
        costPerLevel: 400,
        successRateBase: 0.90,
        successRateDecay: 0.05,
        statIncrement: 1.5
    },
    [ITEM_RARITY.EPIC]: {
        maxLevel: 10,
        costPerLevel: 600,
        successRateBase: 0.85,
        successRateDecay: 0.05,
        statIncrement: 2.0
    },
    [ITEM_RARITY.LEGENDARY]: {
        maxLevel: 15,
        costPerLevel: 1000,
        successRateBase: 0.80,
        successRateDecay: 0.04,
        statIncrement: 2.5
    }
};

// 안전용품 아이템 데이터
export const items = [
    // ===== 안전모 (Helmet) =====
    {
        id: 'helmet_common_1',
        name: '기본 안전모',
        category: ITEM_CATEGORY.HELMET,
        rarity: ITEM_RARITY.COMMON,
        price: 150,
        description: '기본적인 머리 보호 기능을 제공하는 안전모',
        image: '/item/helmet-common.png',
        avatarLayer: '/item/helmet-common.png',
        // [Legacy] 기존 호환성 유지
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 5
        },
        // [New] 스탯 시스템 2.0
        baseStats: {
            pointBoost: 5,
            xpAccelerator: 0,
            streakSaver: 0
        },
        setId: 'set_standard_worker'
    },
    {
        id: 'helmet_rare_1',
        name: '통풍형 안전모',
        category: ITEM_CATEGORY.HELMET,
        rarity: ITEM_RARITY.RARE,
        price: 500,
        description: '통풍 기능이 있어 장시간 착용해도 쾌적한 안전모',
        image: '/item/helmet-rare.png',
        avatarLayer: '/item/helmet-rare.png',
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 10
        },
        baseStats: {
            pointBoost: 8,
            xpAccelerator: 2,
            streakSaver: 0
        },
        setId: 'set_ventilation_pro'
    },
    {
        id: 'helmet_epic_1',
        name: '방한 안전모',
        category: ITEM_CATEGORY.HELMET,
        rarity: ITEM_RARITY.EPIC,
        price: 900,
        description: '추운 날씨에도 머리를 따뜻하게 보호하는 고급 안전모',
        image: '/item/helmet_epic.png?v=1',
        avatarLayer: '/item/helmet_epic.png?v=1',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 15
        },
        baseStats: {
            pointBoost: 12,
            xpAccelerator: 5,
            streakSaver: 3
        },
        setId: 'set_winter_guardian'
    },
    {
        id: 'helmet_legendary_1',
        name: '스마트 안전모',
        category: ITEM_CATEGORY.HELMET,
        rarity: ITEM_RARITY.LEGENDARY,
        price: 2000,
        description: '센서와 통신 기능이 내장된 최첨단 안전모',
        image: '/item/helmet-legendary.png',
        avatarLayer: '/item/helmet-legendary.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 25
        },
        baseStats: {
            pointBoost: 20,
            xpAccelerator: 10,
            streakSaver: 10
        },
        setId: 'set_neon_guardian'
    },

    // ===== 안전조끼 (Vest) =====
    {
        id: 'vest_common_1',
        name: '형광 안전조끼',
        category: ITEM_CATEGORY.VEST,
        rarity: ITEM_RARITY.COMMON,
        price: 100,
        description: '시인성이 좋은 기본 형광 안전조끼',
        image: '/item/vest-common.png',
        avatarLayer: '/item/vest-common.png',
        effect: {
            type: 'quest_bonus',
            questType: 'photo',
            bonus: 5
        },
        baseStats: {
            pointBoost: 5,
            xpAccelerator: 0,
            streakSaver: 0
        },
        setId: 'set_standard_worker'
    },
    {
        id: 'vest_rare_1',
        name: '반사띠 안전조끼',
        category: ITEM_CATEGORY.VEST,
        rarity: ITEM_RARITY.RARE,
        price: 400,
        description: '야간에도 잘 보이는 반사띠가 부착된 안전조끼',
        image: '/item/vest-rare.png',
        avatarLayer: '/item/vest-rare.png',
        effect: {
            type: 'quest_bonus',
            questType: 'photo',
            bonus: 10
        },
        baseStats: {
            pointBoost: 8,
            xpAccelerator: 2,
            streakSaver: 0
        },
        setId: 'set_ventilation_pro'
    },
    {
        id: 'vest_epic_1',
        name: 'LED 안전조끼',
        category: ITEM_CATEGORY.VEST,
        rarity: ITEM_RARITY.EPIC,
        price: 800,
        description: 'LED 조명이 내장되어 어두운 곳에서도 잘 보이는 안전조끼',
        image: '/item/vest-legendary.png',
        avatarLayer: '/item/vest-legendary.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 12
        },
        baseStats: {
            pointBoost: 10,
            xpAccelerator: 4,
            streakSaver: 2
        },
        setId: 'set_neon_guardian'
    },

    // ===== 안전장갑 (Gloves) =====
    {
        id: 'gloves_common_1',
        name: '작업용 장갑',
        category: ITEM_CATEGORY.GLOVES,
        rarity: ITEM_RARITY.COMMON,
        price: 120,
        description: '손을 보호하는 기본 작업용 장갑',
        image: '/item/gloves_common.png',
        avatarLayer: '/item/gloves_common.png',
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 3
        },
        baseStats: {
            pointBoost: 3,
            xpAccelerator: 0,
            streakSaver: 0
        },
        setId: 'set_standard_worker'
    },
    {
        id: 'gloves_rare_1',
        name: '방수 안전장갑',
        category: ITEM_CATEGORY.GLOVES,
        rarity: ITEM_RARITY.RARE,
        price: 450,
        description: '물에 젖지 않는 방수 기능이 있는 안전장갑',
        image: '/item/gloves_rare.png',
        avatarLayer: '/item/gloves_rare.png',
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 8
        },
        baseStats: {
            pointBoost: 6,
            xpAccelerator: 2,
            streakSaver: 0
        },
        setId: 'set_ventilation_pro'
    },
    {
        id: 'gloves_epic_1',
        name: '절연 안전장갑',
        category: ITEM_CATEGORY.GLOVES,
        rarity: ITEM_RARITY.EPIC,
        price: 1000,
        description: '전기 작업에 안전한 절연 기능이 있는 고급 장갑',
        image: '/item/gloves-legendary.png',
        avatarLayer: '/item/gloves-legendary.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 15
        },
        baseStats: {
            pointBoost: 12,
            xpAccelerator: 5,
            streakSaver: 3
        },
        setId: 'set_winter_guardian'
    },

    // ===== 안전화 (Shoes) =====
    {
        id: 'shoes_common_1',
        name: '기본 안전화',
        category: ITEM_CATEGORY.SHOES,
        rarity: ITEM_RARITY.COMMON,
        price: 200,
        description: '발을 보호하는 기본 안전화',
        image: '/item/shoes_common.png',
        avatarLayer: '/item/shoes_common.png',
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 5
        },
        baseStats: {
            pointBoost: 5,
            xpAccelerator: 0,
            streakSaver: 0
        },
        setId: 'set_standard_worker'
    },
    {
        id: 'shoes_rare_1',
        name: '미끄럼 방지 안전화',
        category: ITEM_CATEGORY.SHOES,
        rarity: ITEM_RARITY.RARE,
        price: 600,
        description: '미끄러운 바닥에서도 안전한 특수 밑창 안전화',
        image: '/item/shoes_rare.png',
        avatarLayer: '/item/shoes_rare.png',
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 10
        },
        baseStats: {
            pointBoost: 8,
            xpAccelerator: 2,
            streakSaver: 0
        },
        setId: 'set_ventilation_pro'
    },
    {
        id: 'shoes_epic_1',
        name: '방한 안전화',
        category: ITEM_CATEGORY.SHOES,
        rarity: ITEM_RARITY.EPIC,
        price: 1100,
        description: '추운 환경에서 발을 따뜻하게 보호하는 안전화',
        image: '/item/shoes_epic.png?v=1',
        avatarLayer: '/item/shoes_epic.png?v=1',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 15
        },
        baseStats: {
            pointBoost: 12,
            xpAccelerator: 5,
            streakSaver: 3
        },
        setId: 'set_winter_guardian'
    },
    {
        id: 'shoes_legendary_1',
        name: '스마트 안전화',
        category: ITEM_CATEGORY.SHOES,
        rarity: ITEM_RARITY.LEGENDARY,
        price: 2500,
        description: '보행 데이터를 수집하고 피로도를 모니터링하는 최첨단 안전화',
        image: '/item/shoes_legendary.png',
        avatarLayer: '/item/shoes_legendary.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 30
        },
        baseStats: {
            pointBoost: 25,
            xpAccelerator: 12,
            streakSaver: 8
        },
        setId: 'set_neon_guardian'
    },

    // ===== 보안경 (Glasses) =====
    {
        id: 'glasses_common_1',
        name: '기본 보안경',
        category: ITEM_CATEGORY.GLASSES,
        rarity: ITEM_RARITY.COMMON,
        price: 150,
        description: '눈을 보호하는 기본 보안경',
        image: '/item/grass-common.png?v=1',
        avatarLayer: '/item/grass-common.png?v=1',
        effect: {
            type: 'quest_bonus',
            questType: 'photo',
            bonus: 5
        },
        baseStats: {
            pointBoost: 5,
            xpAccelerator: 0,
            streakSaver: 0
        },
        setId: 'set_standard_worker'
    },
    {
        id: 'glasses_rare_1',
        name: '김서림 방지 보안경',
        category: ITEM_CATEGORY.GLASSES,
        rarity: ITEM_RARITY.RARE,
        price: 500,
        description: '김서림 방지 코팅이 된 고급 보안경',
        image: '/item/grass-rare.png',
        avatarLayer: '/item/grass-rare.png',
        effect: {
            type: 'quest_bonus',
            questType: 'photo',
            bonus: 10
        },
        baseStats: {
            pointBoost: 8,
            xpAccelerator: 2,
            streakSaver: 0
        },
        setId: 'set_ventilation_pro'
    },
    {
        id: 'glasses_epic_1',
        name: '편광 보안경',
        category: ITEM_CATEGORY.GLASSES,
        rarity: ITEM_RARITY.EPIC,
        price: 950,
        description: '강한 빛을 차단하는 편광 기능이 있는 보안경',
        image: '/item/GRASS-legendary.png',
        avatarLayer: '/item/GRASS-legendary.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 13
        },
        baseStats: {
            pointBoost: 10,
            xpAccelerator: 4,
            streakSaver: 2
        },
        setId: 'set_neon_guardian'
    },

    // ===== 안전벨트 (Belt) =====
    {
        id: 'belt_common_1',
        name: '작업용 안전벨트',
        category: ITEM_CATEGORY.BELT,
        rarity: ITEM_RARITY.COMMON,
        price: 300,
        description: '기본적인 추락 방지 기능이 있는 안전벨트',
        image: '/item/belt_rare.png',
        avatarLayer: '/item/belt_rare.png',
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 8
        },
        baseStats: {
            pointBoost: 6,
            xpAccelerator: 2,
            streakSaver: 0
        },
        setId: 'set_standard_worker'
    },
    {
        id: 'belt_rare_1',
        name: '추락방지 안전벨트',
        category: ITEM_CATEGORY.BELT,
        rarity: ITEM_RARITY.RARE,
        price: 700,
        description: '충격 흡수 기능이 강화된 추락방지 안전벨트',
        image: '/item/belt_rare.png',
        avatarLayer: '/item/belt_rare.png',
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 12
        },
        baseStats: {
            pointBoost: 10,
            xpAccelerator: 3,
            streakSaver: 2
        },
        setId: 'set_ventilation_pro'
    },
    {
        id: 'belt_legendary_1',
        name: '스마트 안전벨트',
        category: ITEM_CATEGORY.BELT,
        rarity: ITEM_RARITY.LEGENDARY,
        price: 1800,
        description: '낙하 감지 센서와 자동 알림 기능이 있는 최첨단 안전벨트',
        image: '/item/Belt-legendary.png',
        avatarLayer: '/item/Belt-legendary.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 20
        },
        baseStats: {
            pointBoost: 18,
            xpAccelerator: 8,
            streakSaver: 10
        },
        setId: 'set_neon_guardian'
    },

    // ===== 방진마스크 (Mask) =====
    {
        id: 'mask_common_1',
        name: '일반 방진마스크',
        category: ITEM_CATEGORY.MASK,
        rarity: ITEM_RARITY.COMMON,
        price: 180,
        description: '분진으로부터 호흡기를 보호하는 기본 마스크',
        image: '/item/mask-common.png',
        avatarLayer: '/item/mask-common.png',
        effect: {
            type: 'quest_bonus',
            questType: 'photo',
            bonus: 5
        },
        baseStats: {
            pointBoost: 5,
            xpAccelerator: 0,
            streakSaver: 0
        },
        setId: 'set_standard_worker'
    },
    {
        id: 'mask_rare_1',
        name: '활성탄 방진마스크',
        category: ITEM_CATEGORY.MASK,
        rarity: ITEM_RARITY.RARE,
        price: 550,
        description: '활성탄 필터로 유해가스까지 차단하는 고급 마스크',
        image: '/item/mask-rare.png',
        avatarLayer: '/item/mask-rare.png',
        effect: {
            type: 'quest_bonus',
            questType: 'photo',
            bonus: 10
        },
        baseStats: {
            pointBoost: 8,
            xpAccelerator: 2,
            streakSaver: 0
        },
        setId: 'set_ventilation_pro'
    },
    {
        id: 'mask_epic_1',
        name: '전동 송풍 마스크',
        category: ITEM_CATEGORY.MASK,
        rarity: ITEM_RARITY.EPIC,
        price: 1200,
        description: '전동 팬이 내장되어 편하게 호흡할 수 있는 프리미엄 마스크',
        image: '/item/mask-legendary.png',
        avatarLayer: '/item/mask-legendary.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 15
        },
        baseStats: {
            pointBoost: 12,
            xpAccelerator: 5,
            streakSaver: 3
        },
        setId: 'set_winter_guardian'
    }
];

// 유틸리티 함수들
export const getItemById = (itemId) => {
    return items.find(item => item.id === itemId);
};

export const getItemsByCategory = (category) => {
    return items.filter(item => item.category === category);
};

export const getItemsByRarity = (rarity) => {
    return items.filter(item => item.rarity === rarity);
};

export const getItemsBySetId = (setId) => {
    return items.filter(item => item.setId === setId);
};

export const getItemPrice = (itemId) => {
    const item = getItemById(itemId);
    return item ? item.price : 0;
};

export const getItemEffect = (itemId) => {
    const item = getItemById(itemId);
    return item ? item.effect : null;
};

export const getItemBaseStats = (itemId) => {
    const item = getItemById(itemId);
    return item?.baseStats || { pointBoost: 0, xpAccelerator: 0, streakSaver: 0 };
};

export const getCalibrationConfig = (itemId) => {
    const item = getItemById(itemId);
    if (!item) return null;
    return CALIBRATION_CONFIGS[item.rarity];
};

export const getRarityColor = (rarity) => {
    const colors = {
        [ITEM_RARITY.COMMON]: '#94a3b8',
        [ITEM_RARITY.RARE]: '#3b82f6',
        [ITEM_RARITY.EPIC]: '#a855f7',
        [ITEM_RARITY.LEGENDARY]: '#eab308'
    };
    return colors[rarity] || '#64748b';
};

// 검교정 비용 계산 (현재 레벨 기준)
export const getCalibrationCost = (itemId, currentLevel) => {
    const config = getCalibrationConfig(itemId);
    if (!config) return 0;
    // 레벨이 올라갈수록 비용 증가 (레벨 * 기본비용)
    return config.costPerLevel * (currentLevel + 1);
};

// 검교정 성공 확률 계산 (현재 레벨 기준)
export const getCalibrationSuccessRate = (itemId, currentLevel) => {
    const config = getCalibrationConfig(itemId);
    if (!config) return 0;
    // 레벨이 올라갈수록 성공률 감소
    const rate = config.successRateBase - (config.successRateDecay * currentLevel);
    return Math.max(0.1, rate); // 최소 10% 보장
};
