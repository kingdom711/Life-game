import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import GearSlot from './GearSlot';
import { ITEM_CATEGORY, CATEGORY_NAMES, getRarityColor } from '../data/itemsData';
import { getAllEquippedItems, unequipItem } from '../utils/inventoryManager';
import { calculateSetBonuses, getVisualAura, getActiveStatsForHUD } from '../utils/pointsCalculator';
import { userInventoryInstances } from '../utils/storage';
import { VISUAL_AURAS, ITEM_SETS } from '../data/setsData';

const AvatarWindow = ({ isOpen, onClose, onEquipRequest, roleId }) => {
    const navigate = useNavigate();
    const [equippedItems, setEquippedItems] = useState({});
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [activeAura, setActiveAura] = useState(null);
    const [setInfo, setSetInfo] = useState([]);
    const [totalStats, setTotalStats] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadEquippedItems();
        }
    }, [isOpen]);

    const loadEquippedItems = () => {
        const items = getAllEquippedItems();
        setEquippedItems(items);

        // 세트 보너스 및 아우라 계산
        const bonuses = calculateSetBonuses();
        setSetInfo(bonuses);

        const aura = getVisualAura();
        setActiveAura(aura);

        // 총 스탯 가져오기
        const stats = getActiveStatsForHUD();
        setTotalStats(stats);
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

    const handleImageClick = (category, item) => {
        // 아이템 이미지 클릭 시 인벤토리로 이동
        onClose();
        navigate('/inventory');
    };

    const getItemCalibrationLevel = (item) => {
        if (!item) return 0;
        const instance = userInventoryInstances.getByItemId(item.id);
        return instance?.currentCalibrationLevel || 0;
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

    // 아우라 색상 결정
    const getAuraStyles = () => {
        if (!activeAura) return {};

        const auraColors = {
            'AURA_BLUE_GLOW': {
                gradient: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.3) 0%, transparent 70%)',
                shadow: '0 0 60px rgba(56, 189, 248, 0.5)'
            },
            'AURA_FROST_SHIELD': {
                gradient: 'radial-gradient(circle at center, rgba(165, 243, 252, 0.3) 0%, transparent 70%)',
                shadow: '0 0 80px rgba(165, 243, 252, 0.6)'
            },
            'HOLOGRAM_SHIELD_V2': {
                gradient: 'radial-gradient(circle at center, rgba(192, 132, 252, 0.3) 0%, rgba(34, 211, 238, 0.2) 50%, transparent 70%)',
                shadow: '0 0 100px rgba(192, 132, 252, 0.7), 0 0 60px rgba(34, 211, 238, 0.5)'
            }
        };

        return auraColors[activeAura.id] || {};
    };

    const auraStyles = getAuraStyles();

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
                maxWidth: '900px',
                position: 'relative',
                border: '1px solid #334155',
                boxShadow: activeAura ? auraStyles.shadow : '0 0 30px rgba(56, 189, 248, 0.2)'
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
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    ×
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#f8fafc' }}>
                    장비 관리
                </h2>

                {/* 총 스탯 요약 */}
                {totalStats && (totalStats.totalPointBoost > 0 || totalStats.totalXpAccelerator > 0) && (
                    <div className="avatar-stats-summary" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        marginBottom: '1.5rem',
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '12px'
                    }}>
                        {totalStats.totalPointBoost > 0 && (
                            <div className="stat-chip" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(16, 185, 129, 0.2)',
                                borderRadius: '8px',
                                color: '#10b981'
                            }}>
                                <span>💰</span>
                                <span style={{ fontWeight: 600 }}>+{totalStats.totalPointBoost}%</span>
                            </div>
                        )}
                        {totalStats.totalXpAccelerator > 0 && (
                            <div className="stat-chip" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(245, 158, 11, 0.2)',
                                borderRadius: '8px',
                                color: '#f59e0b'
                            }}>
                                <span>⚡</span>
                                <span style={{ fontWeight: 600 }}>+{totalStats.totalXpAccelerator}%</span>
                            </div>
                        )}
                        {totalStats.totalStreakSaver > 0 && (
                            <div className="stat-chip" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(99, 102, 241, 0.2)',
                                borderRadius: '8px',
                                color: '#6366f1'
                            }}>
                                <span>🛡️</span>
                                <span style={{ fontWeight: 600 }}>{totalStats.totalStreakSaver}%</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="gear-layout" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '2rem',
                    flexWrap: 'wrap'
                }}>
                    {/* 왼쪽 슬롯 */}
                    <div className="slots-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {leftSlots.map(category => {
                            const item = equippedItems[category];
                            const calibLevel = getItemCalibrationLevel(item);

                            return (
                                <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', width: '60px', textAlign: 'right' }}>
                                        {CATEGORY_NAMES[category]}
                                    </span>
                                    <div style={{ position: 'relative' }}>
                                        <GearSlot
                                            category={category}
                                            item={item}
                                            isEquipped={!!item}
                                            onClick={() => handleSlotClick(category)}
                                            onImageClick={handleImageClick}
                                        />
                                        {calibLevel > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-4px',
                                                right: '-4px',
                                                background: getRarityColor(item?.rarity),
                                                color: 'white',
                                                fontSize: '0.65rem',
                                                padding: '2px 5px',
                                                borderRadius: '4px',
                                                fontWeight: 'bold'
                                            }}>
                                                +{calibLevel}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 중앙 아바타 */}
                    <div className={`avatar-center ${activeAura?.cssClass || ''}`} style={{
                        position: 'relative',
                        background: auraStyles.gradient || 'radial-gradient(circle at center, rgba(56, 189, 248, 0.1) 0%, transparent 70%)'
                    }}>
                        {/* 아우라 이펙트 레이어 */}
                        {activeAura && (
                            <>
                                <div className="aura-effect-layer" style={{
                                    position: 'absolute',
                                    inset: '-20px',
                                    background: auraStyles.gradient,
                                    borderRadius: '50%',
                                    opacity: 0.6,
                                    pointerEvents: 'none'
                                }} />
                                <div className="aura-ring" style={{
                                    position: 'absolute',
                                    inset: '10%',
                                    border: `2px solid ${activeAura.color || '#38bdf8'}`,
                                    borderRadius: '50%',
                                    opacity: 0.4,
                                }} />
                            </>
                        )}

                        <Avatar equippedItems={equippedItems} size={300} roleId={roleId} />

                        {/* 아우라 이름 표시 */}
                        {activeAura && (
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0, 0, 0, 0.7)',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                color: activeAura.color || '#38bdf8',
                                whiteSpace: 'nowrap'
                            }}>
                                ✨ {activeAura.name}
                            </div>
                        )}

                        {/* 바닥 효과 */}
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '200px',
                            height: '20px',
                            background: activeAura
                                ? `radial-gradient(ellipse at center, ${activeAura.color || 'rgba(56, 189, 248, 0.4)'}80 0%, transparent 70%)`
                                : 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
                            borderRadius: '50%',
                            filter: 'blur(5px)'
                        }} />
                    </div>

                    {/* 오른쪽 슬롯 */}
                    <div className="slots-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {rightSlots.map(category => {
                            const item = equippedItems[category];
                            const calibLevel = getItemCalibrationLevel(item);

                            return (
                                <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <GearSlot
                                            category={category}
                                            item={item}
                                            isEquipped={!!item}
                                            onClick={() => handleSlotClick(category)}
                                            onImageClick={handleImageClick}
                                        />
                                        {calibLevel > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-4px',
                                                right: '-4px',
                                                background: getRarityColor(item?.rarity),
                                                color: 'white',
                                                fontSize: '0.65rem',
                                                padding: '2px 5px',
                                                borderRadius: '4px',
                                                fontWeight: 'bold'
                                            }}>
                                                +{calibLevel}
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', width: '60px' }}>
                                        {CATEGORY_NAMES[category]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 세트 효과 표시 */}
                {setInfo.length > 0 && (
                    <div className="set-bonuses-display" style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '12px'
                    }}>
                        <h4 style={{ color: '#94a3b8', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                            ✨ 활성 세트 효과
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {setInfo.map((bonus, index) => {
                                const setData = ITEM_SETS[bonus.setId];
                                const rarityColors = {
                                    common: '#94a3b8',
                                    rare: '#3b82f6',
                                    epic: '#a855f7',
                                    legendary: '#eab308'
                                };
                                const color = rarityColors[setData?.rarity] || '#94a3b8';

                                return (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: `${color}20`,
                                            border: `1px solid ${color}50`,
                                            borderRadius: '8px',
                                            color: color
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                            {bonus.setName} ({bonus.pieceCount}/{bonus.maxPieces})
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                            {bonus.bonus.name}: {bonus.bonus.description}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    * 슬롯을 클릭하여 장비를 해제하거나 교체할 수 있습니다.
                </div>
            </div>
        </div>
    );
};

export default AvatarWindow;
