/**
 * 세트 효과 정의
 * 동일 세트 아이템을 여러 개 착용 시 추가 보너스 부여
 */

// 세트 정의
export const ITEM_SETS = {
    // ===== 기본 작업자 세트 (COMMON) =====
    set_standard_worker: {
        id: 'set_standard_worker',
        name: '표준 작업자 세트',
        description: '기본적인 안전 장비 세트',
        rarity: 'common',
        pieces: ['helmet', 'vest', 'gloves', 'shoes', 'glasses', 'belt', 'mask'],
        bonuses: {
            2: {
                name: '기본 보호',
                stats: { pointBoost: 3, xpAccelerator: 0, streakSaver: 0 },
                description: '포인트 획득량 +3%'
            },
            4: {
                name: '안전 의식',
                stats: { pointBoost: 6, xpAccelerator: 2, streakSaver: 0 },
                description: '포인트 +6%, 경험치 +2%'
            },
            7: {
                name: '완벽한 보호',
                stats: { pointBoost: 10, xpAccelerator: 5, streakSaver: 5 },
                description: '포인트 +10%, 경험치 +5%, 스트릭 보호 5%'
            }
        },
        visualAura: null
    },

    // ===== 통풍 프로 세트 (RARE) =====
    set_ventilation_pro: {
        id: 'set_ventilation_pro',
        name: '통풍 프로 세트',
        description: '쾌적한 작업 환경을 위한 고급 장비 세트',
        rarity: 'rare',
        pieces: ['helmet', 'vest', 'gloves', 'shoes', 'glasses', 'belt', 'mask'],
        bonuses: {
            2: {
                name: '쾌적함',
                stats: { pointBoost: 5, xpAccelerator: 2, streakSaver: 0 },
                description: '포인트 +5%, 경험치 +2%'
            },
            4: {
                name: '집중력 향상',
                stats: { pointBoost: 10, xpAccelerator: 5, streakSaver: 3 },
                description: '포인트 +10%, 경험치 +5%, 스트릭 보호 3%'
            },
            7: {
                name: '프로페셔널',
                stats: { pointBoost: 18, xpAccelerator: 10, streakSaver: 8 },
                description: '포인트 +18%, 경험치 +10%, 스트릭 보호 8%'
            }
        },
        visualAura: 'AURA_BLUE_GLOW'
    },

    // ===== 윈터 가디언 세트 (EPIC) =====
    set_winter_guardian: {
        id: 'set_winter_guardian',
        name: '윈터 가디언 세트',
        description: '혹한기 작업을 위한 프리미엄 보온 장비 세트',
        rarity: 'epic',
        pieces: ['helmet', 'gloves', 'shoes', 'mask'],
        bonuses: {
            2: {
                name: '보온 효과',
                stats: { pointBoost: 8, xpAccelerator: 4, streakSaver: 2 },
                description: '포인트 +8%, 경험치 +4%, 스트릭 보호 2%'
            },
            4: {
                name: '동계 전문가',
                stats: { pointBoost: 20, xpAccelerator: 10, streakSaver: 10 },
                description: '포인트 +20%, 경험치 +10%, 스트릭 보호 10%'
            }
        },
        visualAura: 'AURA_FROST_SHIELD'
    },

    // ===== 네온 가디언 세트 (LEGENDARY) =====
    set_neon_guardian: {
        id: 'set_neon_guardian',
        name: '네온 가디언 세트',
        description: '최첨단 스마트 안전 장비 세트',
        rarity: 'legendary',
        pieces: ['helmet', 'vest', 'shoes', 'glasses', 'belt'],
        bonuses: {
            2: {
                name: '디지털 연결',
                stats: { pointBoost: 12, xpAccelerator: 6, streakSaver: 5 },
                description: '포인트 +12%, 경험치 +6%, 스트릭 보호 5%'
            },
            4: {
                name: '스마트 시너지',
                stats: { pointBoost: 25, xpAccelerator: 15, streakSaver: 12 },
                description: '포인트 +25%, 경험치 +15%, 스트릭 보호 12%'
            },
            5: {
                name: '네온 오버드라이브',
                stats: { pointBoost: 40, xpAccelerator: 25, streakSaver: 20 },
                description: '포인트 +40%, 경험치 +25%, 스트릭 보호 20%'
            }
        },
        visualAura: 'HOLOGRAM_SHIELD_V2'
    }
};

// 아우라 시각 효과 정의
export const VISUAL_AURAS = {
    AURA_BLUE_GLOW: {
        id: 'AURA_BLUE_GLOW',
        name: '푸른 광채',
        cssClass: 'aura-blue-glow',
        color: '#38bdf8',
        animation: 'pulse'
    },
    AURA_FROST_SHIELD: {
        id: 'AURA_FROST_SHIELD',
        name: '서리 방패',
        cssClass: 'aura-frost-shield',
        color: '#a5f3fc',
        animation: 'shimmer'
    },
    HOLOGRAM_SHIELD_V2: {
        id: 'HOLOGRAM_SHIELD_V2',
        name: '홀로그램 쉴드',
        cssClass: 'aura-hologram-shield',
        color: '#c084fc',
        secondaryColor: '#22d3ee',
        animation: 'hologram'
    }
};

// 유틸리티 함수들

/**
 * 세트 ID로 세트 정보 가져오기
 */
export const getSetById = (setId) => {
    return ITEM_SETS[setId] || null;
};

/**
 * 착용 중인 세트 피스 수 계산
 * @param {Object} equippedItems - { category: { itemId, setId, ... } }
 * @param {string} setId - 확인할 세트 ID
 */
export const countSetPieces = (equippedItems, setId) => {
    if (!equippedItems || !setId) return 0;
    
    let count = 0;
    Object.values(equippedItems).forEach(item => {
        if (item && item.setId === setId) {
            count++;
        }
    });
    return count;
};

/**
 * 현재 활성화된 세트 보너스 계산
 * @param {Object} equippedItems - 착용 중인 아이템 객체
 * @returns {Array} 활성화된 세트 보너스 목록
 */
export const calculateActiveSetBonuses = (equippedItems) => {
    if (!equippedItems) return [];
    
    // 세트별 착용 피스 수 집계
    const setCounts = {};
    Object.values(equippedItems).forEach(item => {
        if (item && item.setId) {
            setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
        }
    });
    
    const activeBonuses = [];
    
    // 각 세트별로 활성화된 보너스 확인
    Object.entries(setCounts).forEach(([setId, pieceCount]) => {
        const setInfo = ITEM_SETS[setId];
        if (!setInfo) return;
        
        // 해당 세트의 모든 보너스 티어 확인 (2, 4, 7 등)
        const bonusTiers = Object.keys(setInfo.bonuses)
            .map(Number)
            .sort((a, b) => b - a); // 높은 순으로 정렬
        
        // 가장 높은 달성 티어 찾기
        for (const tier of bonusTiers) {
            if (pieceCount >= tier) {
                activeBonuses.push({
                    setId,
                    setName: setInfo.name,
                    tier,
                    pieceCount,
                    maxPieces: setInfo.pieces.length,
                    bonus: setInfo.bonuses[tier],
                    visualAura: setInfo.visualAura,
                    rarity: setInfo.rarity
                });
                break; // 가장 높은 티어만 추가
            }
        }
    });
    
    return activeBonuses;
};

/**
 * 모든 세트 보너스의 총 스탯 합계 계산
 * @param {Array} activeBonuses - calculateActiveSetBonuses 결과
 */
export const sumSetBonusStats = (activeBonuses) => {
    const totalStats = {
        pointBoost: 0,
        xpAccelerator: 0,
        streakSaver: 0
    };
    
    activeBonuses.forEach(bonus => {
        if (bonus.bonus && bonus.bonus.stats) {
            totalStats.pointBoost += bonus.bonus.stats.pointBoost || 0;
            totalStats.xpAccelerator += bonus.bonus.stats.xpAccelerator || 0;
            totalStats.streakSaver += bonus.bonus.stats.streakSaver || 0;
        }
    });
    
    return totalStats;
};

/**
 * 현재 착용 세트에서 가장 높은 등급의 아우라 가져오기
 */
export const getActiveVisualAura = (activeBonuses) => {
    // 우선순위: legendary > epic > rare
    const priorityOrder = ['legendary', 'epic', 'rare'];
    
    for (const rarity of priorityOrder) {
        const bonus = activeBonuses.find(b => b.rarity === rarity && b.visualAura);
        if (bonus) {
            return VISUAL_AURAS[bonus.visualAura] || null;
        }
    }
    
    return null;
};

/**
 * 다음 세트 보너스까지 필요한 피스 수 계산
 */
export const getNextSetBonusInfo = (equippedItems, setId) => {
    const setInfo = ITEM_SETS[setId];
    if (!setInfo) return null;
    
    const currentCount = countSetPieces(equippedItems, setId);
    const bonusTiers = Object.keys(setInfo.bonuses).map(Number).sort((a, b) => a - b);
    
    for (const tier of bonusTiers) {
        if (currentCount < tier) {
            return {
                currentCount,
                nextTier: tier,
                piecesNeeded: tier - currentCount,
                nextBonus: setInfo.bonuses[tier]
            };
        }
    }
    
    // 이미 모든 보너스 달성
    return {
        currentCount,
        nextTier: null,
        piecesNeeded: 0,
        nextBonus: null,
        completed: true
    };
};

export default {
    ITEM_SETS,
    VISUAL_AURAS,
    getSetById,
    countSetPieces,
    calculateActiveSetBonuses,
    sumSetBonusStats,
    getActiveVisualAura,
    getNextSetBonusInfo
};

