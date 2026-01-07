import React from 'react';
import Avatar from './Avatar';
import GearSlot from './GearSlot';
import { ITEM_CATEGORY } from '../data/itemsData';

const AvatarGearDisplay = ({ equippedItems, size = 200, slotSize = 50, onSlotClick, onImageClick, roleId }) => {
    // 슬롯 배치 정의 (좌우 대칭을 위해 3개씩)
    const leftSlots = [
        ITEM_CATEGORY.VEST,
        ITEM_CATEGORY.GLASSES,
        ITEM_CATEGORY.MASK
    ];

    const rightSlots = [
        ITEM_CATEGORY.GLOVES,
        ITEM_CATEGORY.BELT,
        ITEM_CATEGORY.SHOES
    ];

    // HELMET은 중앙 상단에 배치
    const centerTopSlot = ITEM_CATEGORY.HELMET;

    return (
        <div className="avatar-gear-display" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
        }}>
            {/* 상단 HELMET 슬롯 */}
            <div style={{ marginBottom: '0.5rem' }}>
                <GearSlot
                    category={centerTopSlot}
                    item={equippedItems[centerTopSlot]}
                    isEquipped={!!equippedItems[centerTopSlot]}
                    size={slotSize}
                    onClick={() => onSlotClick && onSlotClick(centerTopSlot)}
                    onImageClick={onImageClick}
                    showEnhancement={true}
                />
            </div>

            {/* 중앙 레이아웃 (아바타 + 좌우 슬롯) */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'nowrap',
                width: '100%',
                maxWidth: '100%'
            }}>
                {/* 왼쪽 슬롯 컬럼 */}
                <div className="slots-column" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    {leftSlots.map(category => (
                        <GearSlot
                            key={category}
                            category={category}
                            item={equippedItems[category]}
                            isEquipped={!!equippedItems[category]}
                            size={slotSize}
                            onClick={() => onSlotClick && onSlotClick(category)}
                            onImageClick={onImageClick}
                            showEnhancement={true}
                        />
                    ))}
                </div>

                {/* 중앙 아바타 */}
                <div className="avatar-center" style={{
                    position: 'relative',
                    width: `${size}px`,
                    height: `${size}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Avatar equippedItems={equippedItems} size={size} roleId={roleId} />

                    {/* 바닥 효과 */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: `${size * 0.7}px`,
                        height: '15px',
                        background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(5px)'
                    }} />
                </div>

                {/* 오른쪽 슬롯 컬럼 */}
                <div className="slots-column" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    {rightSlots.map(category => (
                        <GearSlot
                            key={category}
                            category={category}
                            item={equippedItems[category]}
                            isEquipped={!!equippedItems[category]}
                            size={slotSize}
                            onClick={() => onSlotClick && onSlotClick(category)}
                            onImageClick={onImageClick}
                            showEnhancement={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AvatarGearDisplay;
