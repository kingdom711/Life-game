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
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 5
        }
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
        }
    },
    {
        id: 'helmet_epic_1',
        name: '방한 안전모',
        category: ITEM_CATEGORY.HELMET,
        rarity: ITEM_RARITY.EPIC,
        price: 900,
        description: '추운 날씨에도 머리를 따뜻하게 보호하는 고급 안전모',
        image: '/item/helmet_epic.png',
        avatarLayer: '/item/helmet_epic.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 15
        }
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
        }
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
        }
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
        }
    },
    {
        id: 'vest_epic_1',
        name: 'LED 안전조끼',
        category: ITEM_CATEGORY.VEST,
        rarity: ITEM_RARITY.EPIC,
        price: 800,
        description: 'LED 조명이 내장되어 어두운 곳에서도 잘 보이는 안전조끼',
        image: '/item/vest-legendary.png', // epic 이미지 대체
        avatarLayer: '/item/vest-legendary.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 12
        }
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
        }
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
        }
    },
    {
        id: 'gloves_epic_1',
        name: '절연 안전장갑',
        category: ITEM_CATEGORY.GLOVES,
        rarity: ITEM_RARITY.EPIC,
        price: 1000,
        description: '전기 작업에 안전한 절연 기능이 있는 고급 장갑',
        image: '/item/gloves-legendary.png', // epic 이미지 대체
        avatarLayer: '/item/gloves-legendary.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 15
        }
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
        }
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
        }
    },
    {
        id: 'shoes_epic_1',
        name: '방한 안전화',
        category: ITEM_CATEGORY.SHOES,
        rarity: ITEM_RARITY.EPIC,
        price: 1100,
        description: '추운 환경에서 발을 따뜻하게 보호하는 안전화',
        image: '/item/shoes_epic.png',
        avatarLayer: '/item/shoes_epic.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 15
        }
    },
    {
        id: 'shoes_legendary_1',
        name: '스마트 안전화',
        category: ITEM_CATEGORY.SHOES,
        rarity: ITEM_RARITY.LEGENDARY,
        price: 2500,
        description: '보행 데이터를 수집하고 피로도를 모니터링하는 최첨단 안전화',
        image: '/item/shoes_epic.png', // legendary 이미지 부재로 대체
        avatarLayer: '/item/shoes_epic.png',
        effect: {
            type: 'quest_bonus',
            questType: 'all',
            bonus: 30
        }
    },

    // ===== 보안경 (Glasses) =====
    {
        id: 'glasses_common_1',
        name: '기본 보안경',
        category: ITEM_CATEGORY.GLASSES,
        rarity: ITEM_RARITY.COMMON,
        price: 150,
        description: '눈을 보호하는 기본 보안경',
        image: '/item/grass-common.png',
        avatarLayer: '/item/grass-common.png',
        effect: {
            type: 'quest_bonus',
            questType: 'photo',
            bonus: 5
        }
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
        }
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
        }
    },

    // ===== 안전벨트 (Belt) =====
    {
        id: 'belt_common_1',
        name: '작업용 안전벨트',
        category: ITEM_CATEGORY.BELT,
        rarity: ITEM_RARITY.COMMON,
        price: 300,
        description: '기본적인 추락 방지 기능이 있는 안전벨트',
        image: '/item/belt_rare.png', // common 이미지 부재로 rare 대체
        avatarLayer: '/item/belt_rare.png',
        effect: {
            type: 'quest_bonus',
            questType: 'checklist',
            bonus: 8
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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

export const getItemPrice = (itemId) => {
    const item = getItemById(itemId);
    return item ? item.price : 0;
};

export const getItemEffect = (itemId) => {
    const item = getItemById(itemId);
    return item ? item.effect : null;
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
