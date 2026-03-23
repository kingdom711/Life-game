/**
 * 장비 합성(Forge) 매니저
 * 같은 등급 장비 2개 합성 → 상위 등급 확률 업그레이드
 * 강화는 기존 calibrationService로 처리
 */

import { inventory, points, storage } from './storage';
import { getItemById, items, ITEM_RARITY } from '../data/itemsData';

const FORGE_LOG_KEY = 'safety_quest_forge_log';
const FORGE_TOKEN_KEY = 'safety_quest_forge_tokens';

// 합성 성공 확률
const FUSION_RATES = {
    common: { successRate: 0.70, resultRarity: 'rare' },
    rare: { successRate: 0.40, resultRarity: 'epic' },
    epic: { successRate: 0.15, resultRarity: 'legendary' }
};

// 합성 가능한 아이템 목록 (같은 등급 2개 이상)
export const getFusionCandidates = () => {
    const ownedIds = inventory.get();
    const ownedItems = ownedIds.map(id => getItemById(id)).filter(Boolean);

    // 등급별 그룹핑
    const byRarity = {};
    ownedItems.forEach(item => {
        if (!byRarity[item.rarity]) byRarity[item.rarity] = [];
        byRarity[item.rarity].push(item);
    });

    // 합성 가능한 조합 (같은 등급 2개 이상 + legendary 미만)
    const candidates = {};
    Object.entries(byRarity).forEach(([rarity, list]) => {
        if (rarity !== 'legendary' && list.length >= 2) {
            candidates[rarity] = list;
        }
    });

    return candidates;
};

// 합성 실행
export const fuseItems = (itemId1, itemId2) => {
    const item1 = getItemById(itemId1);
    const item2 = getItemById(itemId2);

    if (!item1 || !item2) {
        return { success: false, message: '유효하지 않은 아이템입니다.' };
    }

    if (item1.rarity !== item2.rarity) {
        return { success: false, message: '같은 등급의 장비만 합성할 수 있습니다.' };
    }

    if (item1.rarity === 'legendary') {
        return { success: false, message: 'Legendary 장비는 합성할 수 없습니다.' };
    }

    if (!inventory.hasItem(itemId1) || !inventory.hasItem(itemId2)) {
        return { success: false, message: '보유하지 않은 아이템입니다.' };
    }

    if (itemId1 === itemId2) {
        return { success: false, message: '같은 아이템을 선택할 수 없습니다.' };
    }

    const rarity = item1.rarity;
    const fusionConfig = FUSION_RATES[rarity];
    if (!fusionConfig) {
        return { success: false, message: '이 등급은 합성할 수 없습니다.' };
    }

    // 확률 판정
    const roll = Math.random();
    const isSuccess = roll < fusionConfig.successRate;

    // 합성 실행 - 재료 제거
    inventory.removeItem(itemId1);

    if (isSuccess) {
        // 성공: 재료 2개 소모, 상위 등급 아이템 랜덤 획득
        inventory.removeItem(itemId2);

        const resultRarity = fusionConfig.resultRarity;
        const possibleResults = items.filter(i =>
            i.rarity === resultRarity && !inventory.hasItem(i.id)
        );

        // 획득 가능한 상위 아이템이 없으면 같은 카테고리에서 선택
        let resultItem;
        if (possibleResults.length > 0) {
            resultItem = possibleResults[Math.floor(Math.random() * possibleResults.length)];
        } else {
            // 모든 상위 아이템 보유 시 같은 카테고리 상위 아이템
            const fallback = items.filter(i => i.rarity === resultRarity);
            resultItem = fallback[Math.floor(Math.random() * fallback.length)];
        }

        if (resultItem) {
            inventory.addItem(resultItem.id);
        }

        // 로그 기록
        logForge(itemId1, itemId2, true, resultItem?.id || null);

        return {
            success: true,
            fusionSuccess: true,
            message: `합성 성공! ${resultItem?.name || '상위 장비'}을(를) 획득했습니다!`,
            resultItem,
            consumed: [item1, item2]
        };
    } else {
        // 실패: 재료 1개만 소모 (itemId1), itemId2는 유지
        // Epic 실패 시 보상 토큰 지급
        let tokenAwarded = false;
        if (rarity === 'epic') {
            addForgeToken(1);
            tokenAwarded = true;
        }

        logForge(itemId1, itemId2, false, null);

        return {
            success: true,
            fusionSuccess: false,
            message: `합성 실패... ${item1.name}이(가) 소실되었습니다.${tokenAwarded ? ' (보상 토큰 +1)' : ''}`,
            consumed: [item1],
            returned: item2,
            tokenAwarded
        };
    }
};

// 보상 토큰 관리
export const getForgeTokens = () => {
    return storage.get(FORGE_TOKEN_KEY, 0);
};

const addForgeToken = (amount) => {
    const current = getForgeTokens();
    storage.set(FORGE_TOKEN_KEY, current + amount);
};

// 토큰으로 Legendary 확정 교환
export const exchangeTokensForLegendary = () => {
    const tokens = getForgeTokens();
    if (tokens < 5) {
        return { success: false, message: `보상 토큰이 부족합니다. (${tokens}/5)` };
    }

    const legendaryItems = items.filter(i =>
        i.rarity === 'legendary' && !inventory.hasItem(i.id)
    );

    if (legendaryItems.length === 0) {
        return { success: false, message: '획득 가능한 Legendary 장비가 없습니다.' };
    }

    const resultItem = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
    inventory.addItem(resultItem.id);
    storage.set(FORGE_TOKEN_KEY, tokens - 5);

    return {
        success: true,
        message: `${resultItem.name}을(를) 획득했습니다!`,
        resultItem
    };
};

// 합성 로그
const logForge = (itemId1, itemId2, success, resultId) => {
    const logs = storage.get(FORGE_LOG_KEY, []);
    logs.unshift({
        date: new Date().toISOString(),
        materials: [itemId1, itemId2],
        success,
        result: resultId
    });
    if (logs.length > 50) logs.splice(50);
    storage.set(FORGE_LOG_KEY, logs);
};

export const getForgeLog = (limit = 10) => {
    return storage.get(FORGE_LOG_KEY, []).slice(0, limit);
};

// 합성 확률 조회
export const getFusionRate = (rarity) => {
    return FUSION_RATES[rarity] || null;
};

export default {
    getFusionCandidates,
    fuseItems,
    getForgeTokens,
    exchangeTokensForLegendary,
    getForgeLog,
    getFusionRate
};
