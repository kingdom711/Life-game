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

            {/* 착용 아이템 렌더링 */}
            {Object.entries(equippedItems).map(([category, item]) => {
                if (!item || !item.image) return null;

                // 이미지가 경로인 경우 (이미지 파일)
                if (item.image.startsWith('/') || item.image.startsWith('http')) {
                    return (
                        <img
                            key={category}
                            src={item.image}
                            alt={item.name}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                zIndex: zIndexMap[category],
                                pointerEvents: 'none' // 클릭 통과
                            }}
                        />
                    );
                }

                // 이미지가 이모지인 경우 (fallback)
                return (
                    <div
                        key={category}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${size * 0.3}px`,
                            zIndex: zIndexMap[category],
                            pointerEvents: 'none'
                        }}
                    >
                        {item.image}
                    </div>
                );
            })}
        </div>
    );
};

export default Avatar;
