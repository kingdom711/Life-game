import React from 'react';
import { getRarityColor, ITEM_RARITY } from '../data/itemsData';

const GearSlot = ({
    item,
    category,
    isEquipped,
    onClick,
    onImageClick,
    size = 60,
    showEnhancement = true
}) => {
    // 아이템 등급에 따른 색상
    const rarityColor = item ? getRarityColor(item.rarity) : '#475569';
    const enhancementLevel = item?.enhancementLevel || 0;

    return (
        <div
            className={`gear-slot ${isEquipped ? 'equipped' : 'empty'}`}
            onClick={onClick}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                position: 'relative',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: `2px solid ${item ? rarityColor : 'rgba(71, 85, 105, 0.5)'}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: item ? `0 0 10px ${rarityColor}40` : 'none',
                overflow: 'hidden'
            }}
        >
            {/* 홀로그램 효과 배경 (아이템 있을 때) */}
            {item && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${rarityColor}10 0%, transparent 100%)`,
                    zIndex: 1
                }} />
            )}

            {/* 아이템 이미지 */}
            {item ? (
                <img
                    src={item.image}
                    alt={item.name}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onImageClick) {
                            onImageClick(category, item);
                        }
                    }}
                    style={{
                        width: '80%',
                        height: '80%',
                        objectFit: 'contain',
                        zIndex: 2,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                        cursor: onImageClick ? 'pointer' : 'default'
                    }}
                />
            ) : (
                <div style={{
                    color: 'rgba(148, 163, 184, 0.3)',
                    fontSize: `${size * 0.4}px`,
                    zIndex: 2
                }}>
                    +
                </div>
            )}

            {/* 강화 레벨 표시 */}
            {showEnhancement && enhancementLevel > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: enhancementLevel >= 9 ? '#a855f7' : '#38bdf8', // +9 이상은 보라색, 그 외는 파란색
                    textShadow: '0 0 4px rgba(0,0,0,0.8)',
                    zIndex: 3
                }}>
                    +{enhancementLevel}
                </div>
            )}

            {/* 슬롯 이름 (비어있을 때) */}
            {!item && (
                <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    fontSize: '10px',
                    color: 'rgba(148, 163, 184, 0.5)',
                    textTransform: 'uppercase'
                }}>
                    {category}
                </div>
            )}
        </div>
    );
};

export default GearSlot;
