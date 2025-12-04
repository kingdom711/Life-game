import React from 'react';
import Avatar from './Avatar';
import GearSlot from './GearSlot';
import { ITEM_CATEGORY } from '../data/itemsData';

const AvatarGearDisplay = ({ equippedItems, size = 200, slotSize = 50, onSlotClick, roleId }) => {
    // 슬롯 배치 정의
    const leftSlots = [
        ITEM_CATEGORY.HELMET,
        ITEM_CATEGORY.GLASSES,
        ITEM_CATEGORY.MASK,
        ITEM_CATEGORY.VEST
    ];

    const rightSlots = [
        ITEM_CATEGORY.GLOVES,
        ITEM_CATEGORY.BELT,
        ITEM_CATEGORY.SHOES
    ];

    return (
        <div className="avatar-gear-display" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
        }}>
            {/* 왼쪽 슬롯 */}
            <div className="slots-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {leftSlots.map(category => (
                    <GearSlot
                        key={category}
                        category={category}
                        item={equippedItems[category]}
                        isEquipped={!!equippedItems[category]}
                        size={slotSize}
                        onClick={() => onSlotClick && onSlotClick(category)}
                        showEnhancement={true}
                    />
                ))}
            </div>

            {/* 중앙 아바타 */}
            <div className="avatar-center" style={{
                position: 'relative',
                padding: '0.5rem',
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

            {/* 오른쪽 슬롯 */}
            <div className="slots-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {rightSlots.map(category => (
                    <GearSlot
                        key={category}
                        category={category}
                        item={equippedItems[category]}
                        isEquipped={!!equippedItems[category]}
                        size={slotSize}
                        onClick={() => onSlotClick && onSlotClick(category)}
                        showEnhancement={true}
                    />
                ))}
            </div>
        </div>
    );
};

export default AvatarGearDisplay;
