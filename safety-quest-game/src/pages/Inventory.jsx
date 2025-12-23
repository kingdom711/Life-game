import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInventoryItems, equipItem, unequipItem, isItemEquipped, getInventoryStats } from '../utils/inventoryManager';
import { CATEGORY_NAMES, getRarityColor, RARITY_NAMES } from '../data/itemsData';
import { userInventoryInstances } from '../utils/storage';
import { ensureItemInstance, getCalibrationInfo } from '../utils/calibrationService';
import CalibrationModal from '../components/CalibrationModal';
import StatsHUD from '../components/StatsHUD';

function Inventory() {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [stats, setStats] = useState({});
    const [calibrationModal, setCalibrationModal] = useState({ isOpen: false, itemId: null });
    const [itemInstances, setItemInstances] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const items = getInventoryItems();
        const inventoryStats = getInventoryStats();
        setInventoryItems(items);
        setStats(inventoryStats);

        // 각 아이템의 인스턴스 정보 로드
        const instances = {};
        items.forEach(item => {
            const instance = userInventoryInstances.getByItemId(item.id);
            if (instance) {
                instances[item.id] = instance;
            }
        });
        setItemInstances(instances);

        // StatsHUD 갱신
        if (window.refreshStatsHUD) {
            window.refreshStatsHUD();
        }
    };

    const handleEquip = (item) => {
        // 아이템 인스턴스가 없으면 생성
        ensureItemInstance(item.id);
        
        const result = equipItem(item.id);
        if (result.success) {
            loadData();
        }
    };

    const handleUnequip = (item) => {
        const result = unequipItem(item.category);
        if (result.success) {
            loadData();
        }
    };

    const openCalibrationModal = (itemId) => {
        setCalibrationModal({ isOpen: true, itemId });
    };

    const closeCalibrationModal = () => {
        setCalibrationModal({ isOpen: false, itemId: null });
    };

    const handleCalibrationComplete = (result) => {
        loadData();
        // 성공 시 약간의 딜레이 후 모달 닫기
        if (result.success) {
            setTimeout(() => {
                closeCalibrationModal();
            }, 2000);
        }
    };

    const getItemCalibrationLevel = (itemId) => {
        return itemInstances[itemId]?.currentCalibrationLevel || 0;
    };

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">
                        ← 대시보드로 돌아가기
                    </Link>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <h1>🎒 인벤토리</h1>
                    <p className="text-muted">보유 중인 안전용품을 관리하세요</p>
                </div>

                {/* 활성 스탯 HUD */}
                <div className="mb-xl">
                    <StatsHUD showSetBonuses={true} />
                </div>

                {/* 통계 */}
                <div className="grid grid-3 mb-xl">
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="text-muted mb-sm">보유 아이템</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalItems}</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="text-muted mb-sm">착용 중</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.equippedCount}</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="text-muted mb-sm">총 가치</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalValue?.toLocaleString()}P</div>
                        </div>
                    </div>
                </div>

                {/* 아이템 목록 */}
                {inventoryItems.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center">
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                            <p className="text-muted">보유 중인 아이템이 없습니다.</p>
                            <Link to="/shop">
                                <button className="btn btn-primary mt-md">상점으로 이동</button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-3">
                        {inventoryItems.map(item => {
                            const equipped = isItemEquipped(item.id);
                            const calibrationLevel = getItemCalibrationLevel(item.id);
                            const instance = itemInstances[item.id];

                            return (
                                <div key={item.id} className="card inventory-item-card">
                                    {/* 착용 표시 */}
                                    {equipped && (
                                        <div className="equipped-badge">
                                            ✓ 착용중
                                        </div>
                                    )}

                                    {/* 검교정 레벨 표시 */}
                                    {calibrationLevel > 0 && (
                                        <div 
                                            className="calibration-level-badge"
                                            style={{ 
                                                '--rarity-color': getRarityColor(item.rarity) 
                                            }}
                                        >
                                            +{calibrationLevel}
                                        </div>
                                    )}

                                    <div className="card-header">
                                        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ height: '120px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        style={{
                                                            maxHeight: '100%',
                                                            maxWidth: '100%',
                                                            objectFit: 'contain',
                                                            filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.3)) ${calibrationLevel > 0 ? `drop-shadow(0 0 ${calibrationLevel * 2}px ${getRarityColor(item.rarity)})` : ''}`
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{ fontSize: '4rem' }}>
                                                        {item.category === 'helmet' && '⛑️'}
                                                        {item.category === 'vest' && '🦺'}
                                                        {item.category === 'gloves' && '🧤'}
                                                        {item.category === 'shoes' && '👞'}
                                                        {item.category === 'glasses' && '🥽'}
                                                        {item.category === 'belt' && '🔒'}
                                                        {item.category === 'mask' && '😷'}
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className="badge"
                                                style={{
                                                    background: getRarityColor(item.rarity),
                                                    color: 'white'
                                                }}
                                            >
                                                {RARITY_NAMES[item.rarity]}
                                            </div>
                                        </div>
                                        <h4 className="card-title text-center">
                                            {item.name}
                                            {calibrationLevel > 0 && (
                                                <span className="calibration-level-inline"> +{calibrationLevel}</span>
                                            )}
                                        </h4>
                                        <p className="card-subtitle text-center">{CATEGORY_NAMES[item.category]}</p>
                                    </div>

                                    <div className="card-body">
                                        <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                            {item.description}
                                        </p>

                                        {/* 스탯 표시 (기본 또는 검교정된 스탯) */}
                                        <div className="item-stats-display">
                                            {instance?.activeStats ? (
                                                <>
                                                    <div className="stat-mini">
                                                        <span className="stat-icon">💰</span>
                                                        <span className="stat-value">+{instance.activeStats.pointBoost}%</span>
                                                    </div>
                                                    {instance.activeStats.xpAccelerator > 0 && (
                                                        <div className="stat-mini">
                                                            <span className="stat-icon">⚡</span>
                                                            <span className="stat-value">+{instance.activeStats.xpAccelerator}%</span>
                                                        </div>
                                                    )}
                                                    {instance.activeStats.streakSaver > 0 && (
                                                        <div className="stat-mini">
                                                            <span className="stat-icon">🛡️</span>
                                                            <span className="stat-value">{instance.activeStats.streakSaver}%</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="badge badge-success">
                                                    +{item.effect?.bonus || item.baseStats?.pointBoost || 0}% 보너스
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between mb-md mt-sm">
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                {item.setId && (
                                                    <span className="set-indicator">세트 아이템</span>
                                                )}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                💰 {item.price.toLocaleString()}P
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <div className="inventory-actions">
                                            {equipped ? (
                                                <button
                                                    onClick={() => handleUnequip(item)}
                                                    className="btn btn-secondary"
                                                    style={{ flex: 1 }}
                                                >
                                                    해제하기
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEquip(item)}
                                                    className="btn btn-primary"
                                                    style={{ flex: 1 }}
                                                >
                                                    착용하기
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openCalibrationModal(item.id)}
                                                className="btn btn-calibrate"
                                                title="검교정 (강화)"
                                            >
                                                🔧
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 검교정 모달 */}
            <CalibrationModal
                isOpen={calibrationModal.isOpen}
                onClose={closeCalibrationModal}
                itemId={calibrationModal.itemId}
                onCalibrationComplete={handleCalibrationComplete}
            />
        </div>
    );
}

export default Inventory;
