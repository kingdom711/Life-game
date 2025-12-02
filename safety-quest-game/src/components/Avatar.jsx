import React from 'react';
import { ITEM_CATEGORY } from '../data/itemsData';

const Avatar = ({ equippedItems, size = 300 }) => {
    // 레이어 순서 정의 (낮을수록 뒤에 배치)
    const layerOrder = [
        'base',
        ITEM_CATEGORY.SHOES,
        ITEM_CATEGORY.BELT,
        ITEM_CATEGORY.VEST,
        ITEM_CATEGORY.GLOVES,
        ITEM_CATEGORY.MASK,
        ITEM_CATEGORY.GLASSES,
        ITEM_CATEGORY.HELMET
    ];

    // 아이템 카테고리별 z-index 매핑
    const zIndexMap = {
        base: 0,
        [ITEM_CATEGORY.SHOES]: 1,
        [ITEM_CATEGORY.BELT]: 2,
        [ITEM_CATEGORY.VEST]: 3,
        [ITEM_CATEGORY.GLOVES]: 4,
        [ITEM_CATEGORY.MASK]: 5,
        [ITEM_CATEGORY.GLASSES]: 6,
        [ITEM_CATEGORY.HELMET]: 7
    };

    return (
        <div
            className="avatar-visual"
            style={{
                position: 'relative',
                width: `${size}px`,
                height: `${size}px`,
                margin: '0 auto',
                backgroundColor: '#f0f9ff',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
        >
            {/* 베이스 아바타 (이미지가 없을 경우를 대비해 텍스트/이모지 fallback) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: zIndexMap.base,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `${size * 0.5}px`
                }}
            >
                🧑‍🔧
            </div>

            {/* 착용 아이템 렌더링 로직 제거됨 */}
        </div>
    );
};

export default Avatar;
