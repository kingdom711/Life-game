import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import GearSlot from './GearSlot';
import { ITEM_CATEGORY, CATEGORY_NAMES } from '../data/itemsData';
import { getAllEquippedItems, unequipItem } from '../utils/inventoryManager';

const AvatarWindow = ({ isOpen, onClose, onEquipRequest }) => {
    const [equippedItems, setEquippedItems] = useState({});
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadEquippedItems();
        }
    }, [isOpen]);

    const loadEquippedItems = () => {
        const items = getAllEquippedItems();
        setEquippedItems(items);
    };

    const handleSlotClick = (category) => {
        const item = equippedItems[category];
        if (item) {
            // 이미 착용 중인 경우 -> 바로 해제
            const result = unequipItem(category);
            if (result.success) {
                loadEquippedItems();
            }
        } else {
            // 비어있는 경우 -> 인벤토리 열기 요청 (부모 컴포넌트로 전달)
            if (onEquipRequest) {
                onEquipRequest(category);
            }
        }
    };

    if (!isOpen) return null;

    // 슬롯 배치 정의 (중앙 아바타 기준)
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
        <div className="avatar-window-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="avatar-window-content" style={{
                backgroundColor: '#1e293b',
                borderRadius: '20px',
                padding: '2rem',
                width: '90%',
                maxWidth: '800px',
                position: 'relative',
                border: '1px solid #334155',
                boxShadow: '0 0 30px rgba(56, 189, 248, 0.2)'
            }}>
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    ×
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#f8fafc' }}>
                    장비 관리
                </h2>

                <div className="gear-layout" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '2rem',
                    flexWrap: 'wrap'
                }}>
                    {/* 왼쪽 슬롯 */}
                    <div className="slots-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {leftSlots.map(category => (
                            <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', width: '60px', textAlign: 'right' }}>
                                    {CATEGORY_NAMES[category]}
                                </span>
                                <GearSlot
                                    category={category}
                                    item={equippedItems[category]}
                                    isEquipped={!!equippedItems[category]}
                                    onClick={() => handleSlotClick(category)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* 중앙 아바타 */}
                    <div className="avatar-center" style={{
                        position: 'relative',
                        padding: '1rem',
                        background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.1) 0%, transparent 70%)'
                    }}>
                        <Avatar equippedItems={equippedItems} size={300} />

                        {/* 바닥 효과 */}
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '200px',
                            height: '20px',
                            background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
                            borderRadius: '50%',
                            filter: 'blur(5px)'
                        }} />
                    </div>

                    {/* 오른쪽 슬롯 */}
                    <div className="slots-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {rightSlots.map(category => (
                            <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <GearSlot
                                    category={category}
                                    item={equippedItems[category]}
                                    isEquipped={!!equippedItems[category]}
                                    onClick={() => handleSlotClick(category)}
                                />
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', width: '60px' }}>
                                    {CATEGORY_NAMES[category]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                    * 슬롯을 클릭하여 장비를 해제하거나 교체할 수 있습니다.
                </div>
            </div>
        </div>
    );
};

export default AvatarWindow;
