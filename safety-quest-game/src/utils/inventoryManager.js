import { inventory, equippedItems, points } from './storage';
import { getItemById, getItemPrice, ITEM_CATEGORY } from '../data/itemsData';

// 아이템 구매
export const purchaseItem = (itemId) => {
    // 이미 보유 중인지 확인
    if (inventory.hasItem(itemId)) {
        return {
            success: false,
            message: '이미 보유 중인 아이템입니다.'
        };
    }

    // 아이템 정보 가져오기
    const item = getItemById(itemId);
    if (!item) {
        return {
            success: false,
            message: '존재하지 않는 아이템입니다.'
        };
    }

    // 포인트 확인
    const itemPrice = getItemPrice(itemId);
    if (!points.canAfford(itemPrice)) {
        return {
            success: false,
            message: `포인트가 부족합니다. (필요: ${itemPrice}P, 보유: ${points.get()}P)`
        };
    }

    // 구매 처리
    points.subtract(itemPrice);
    inventory.addItem(itemId);

    return {
        success: true,
        message: `${item.name}을(를) 구매했습니다!`,
        item,
        remainingPoints: points.get()
    };
};

// 아이템 착용
export const equipItem = (itemId) => {
    // 인벤토리에 있는지 확인
    if (!inventory.hasItem(itemId)) {
        return {
            success: false,
            message: '보유하지 않은 아이템입니다.'
        };
    }

    // 아이템 정보 가져오기
    const item = getItemById(itemId);
    if (!item) {
        return {
            success: false,
            message: '존재하지 않는 아이템입니다.'
        };
    }

    // 이전에 착용 중인 아이템 확인
    const previousItem = equippedItems.getEquipped(item.category);

    // 착용 처리 (기본 강화 레벨 0)
    equippedItems.equip(item.category, itemId, 0);

    return {
        success: true,
        message: `${item.name}을(를) 착용했습니다!`,
        item,
        previousItem: previousItem ? getItemById(previousItem) : null
    };
};

// 아이템 해제
export const unequipItem = (category) => {
    const equippedItemId = equippedItems.getEquipped(category);

    if (!equippedItemId) {
        return {
            success: false,
            message: '착용 중인 아이템이 없습니다.'
        };
    }

    const item = getItemById(equippedItemId);
    equippedItems.unequip(category);

    return {
        success: true,
        message: `${item.name}을(를) 해제했습니다.`,
        item
    };
};

// 착용 중인 아이템 가져오기 (아이템 객체 반환)
export const getEquippedItem = (category) => {
    const itemId = equippedItems.getEquipped(category);
    return itemId ? getItemById(itemId) : null;
};

// 착용 중인 아이템 데이터 가져오기 (강화 레벨 포함)
export const getEquippedItemData = (category) => {
    return equippedItems.getEquippedData(category);
};

// 모든 착용 중인 아이템 가져오기
export const getAllEquippedItems = () => {
    const equipped = equippedItems.get();
    const items = {};

    Object.entries(equipped).forEach(([category, data]) => {
        const itemId = typeof data === 'string' ? data : data.itemId;
        const item = getItemById(itemId);
        if (item) {
            items[category] = {
                ...item,
                enhancementLevel: typeof data === 'string' ? 0 : data.enhancementLevel
            };
        }
    });

    return items;
};

// 인벤토리의 모든 아이템 가져오기
export const getInventoryItems = () => {
    const itemIds = inventory.get();
    return itemIds.map(id => getItemById(id)).filter(item => item !== undefined);
};

// 특정 카테고리의 인벤토리 아이템 가져오기
export const getInventoryItemsByCategory = (category) => {
    const items = getInventoryItems();
    return items.filter(item => item.category === category);
};

// 아이템 착용 여부 확인
export const isItemEquipped = (itemId) => {
    const equipped = equippedItems.get();
    return Object.values(equipped).some(data => {
        // 하위 호환성: 문자열인 경우
        if (typeof data === 'string') return data === itemId;
        // 객체인 경우: itemId 속성 확인
        return data.itemId === itemId;
    });
};

// 인벤토리 통계
export const getInventoryStats = () => {
    const items = getInventoryItems();
    const totalValue = items.reduce((sum, item) => sum + item.price, 0);
    const equippedCount = Object.keys(equippedItems.get()).length;

    // 카테고리별 개수
    const categoryCounts = {};
    Object.values(ITEM_CATEGORY).forEach(category => {
        categoryCounts[category] = 0;
    });

    items.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    return {
        totalItems: items.length,
        totalValue,
        equippedCount,
        categoryCounts
    };
};

// 카테고리 이름 가져오기
export const getCategoryName = (category) => {
    const names = {
        [ITEM_CATEGORY.HELMET]: '안전모',
        [ITEM_CATEGORY.VEST]: '안전조끼',
        [ITEM_CATEGORY.GLOVES]: '안전장갑',
        [ITEM_CATEGORY.SHOES]: '안전화',
        [ITEM_CATEGORY.GLASSES]: '보안경',
        [ITEM_CATEGORY.BELT]: '안전벨트',
        [ITEM_CATEGORY.MASK]: '방진마스크'
    };
    return names[category] || category;
};

export default {
    purchaseItem,
    equipItem,
    unequipItem,
    getEquippedItem,
    getAllEquippedItems,
    getInventoryItems,
    getInventoryItemsByCategory,
    isItemEquipped,
    getInventoryStats,
    getCategoryName
};
