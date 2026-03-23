import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInventoryItems, equipItem, unequipItem, isItemEquipped, getInventoryStats } from '../utils/inventoryManager';
import { CATEGORY_NAMES, getRarityColor, RARITY_NAMES } from '../data/itemsData';
import { userInventoryInstances } from '../utils/storage';
import { ensureItemInstance, getCalibrationInfo } from '../utils/calibrationService';
import CalibrationModal from '../components/CalibrationModal';
import ForgeModal from '../components/ForgeModal';
import StatsHUD from '../components/StatsHUD';
import { LoadingState, ErrorState, EmptyState } from '../components/PageState';

const COLOR = {
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    pageTitleStart: 'var(--theme-inventory-title-start)',
    pageTitleMid: 'var(--theme-inventory-title-mid)',
    pageTitleEnd: 'var(--theme-inventory-title-end)'
};

function Inventory() {
    const navigate = useNavigate();
    const [inventoryItems, setInventoryItems] = useState([]);
    const [stats, setStats] = useState({});
    const [calibrationModal, setCalibrationModal] = useState({ isOpen: false, itemId: null });
    const [isForgeOpen, setIsForgeOpen] = useState(false);
    const [itemInstances, setItemInstances] = useState({});
    const [imageErrors, setImageErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        initializeInventory();
    }, []);

    const initializeInventory = async () => {
        setIsLoading(true);
        setLoadError('');
        try {
            loadData();
        } catch (error) {
            console.error('인벤토리 데이터 로드 실패:', error);
            setLoadError('인벤토리 데이터를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

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
        // 강화 후 이미지 에러 상태 초기화 (이미지 재로드를 위해)
        if (result.success && calibrationModal.itemId) {
            setImageErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[calibrationModal.itemId];
                return newErrors;
            });
        }
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

    if (isLoading) {
        return (
            <div className="page">
                <div className="container">
                    <LoadingState title="인벤토리를 불러오는 중입니다..." description="아이템과 장착 상태를 동기화하고 있습니다." />
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="page">
                <div className="container">
                    <ErrorState title="인벤토리 로드에 실패했습니다." description={loadError} onRetry={initializeInventory} />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">
                        ← 대시보드로 돌아가기
                    </Link>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{
                        background: `linear-gradient(135deg, ${COLOR.pageTitleStart} 0%, ${COLOR.pageTitleMid} 50%, ${COLOR.pageTitleEnd} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        🎒 인벤토리
                    </h1>
                    <p className="text-lg" style={{ color: COLOR.textMuted }}>보유 중인 안전용품을 관리하세요</p>
                </div>

                {/* 장비 합성 버튼 */}
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={() => setIsForgeOpen(true)}
                        style={{
                            width: '100%', padding: '0.85rem 1.25rem',
                            borderRadius: '12px', border: '2px solid rgba(168, 85, 247, 0.3)',
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.15))',
                            color: '#c084fc', fontWeight: 700, fontSize: '0.95rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        ⚒️ 장비 합성소
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>
                            같은 등급 장비 2개 → 상위 등급
                        </span>
                    </button>
                </div>

                {/* 활성 스탯 HUD */}
                <div className="mb-xl">
                    <StatsHUD showSetBonuses={true} />
                </div>

                {/* 통계 */}
                <div className="grid grid-3 mb-xl">
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="mb-sm" style={{ color: COLOR.textMuted }}>보유 아이템</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: COLOR.text }}>{stats.totalItems}</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="mb-sm" style={{ color: COLOR.textMuted }}>착용 중</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: COLOR.text }}>{stats.equippedCount}</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="mb-sm" style={{ color: COLOR.textMuted }}>총 가치</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: COLOR.text }}>{stats.totalValue?.toLocaleString()}P</div>
                        </div>
                    </div>
                </div>

                {/* 아이템 목록 */}
                {inventoryItems.length === 0 ? (
                    <EmptyState
                        icon="📦"
                        title="보유 중인 아이템이 없습니다."
                        description="상점에서 장비를 구매한 뒤 다시 확인해 주세요."
                        actionLabel="상점으로 이동"
                        onAction={() => navigate('/shop')}
                    />
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

                                    <div className="card-header">
                                        <div style={{ textAlign: 'center', marginBottom: '0.5rem', position: 'relative' }}>
                                            <div style={{ height: '120px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                {item.image && !imageErrors[item.id] ? (
                                                    <img
                                                        key={`${item.id}-${calibrationLevel}`}
                                                        src={item.image}
                                                        alt={item.name}
                                                        style={{
                                                            maxHeight: '100%',
                                                            maxWidth: '100%',
                                                            width: 'auto',
                                                            height: 'auto',
                                                            objectFit: 'contain',
                                                            filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.3)) ${calibrationLevel > 0 ? `drop-shadow(0 0 ${calibrationLevel * 2}px ${getRarityColor(item.rarity)})` : ''}`
                                                        }}
                                                        onError={() => {
                                                            setImageErrors(prev => ({ ...prev, [item.id]: true }));
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
                                                    color: 'var(--color-text)'
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
                                                    className="btn btn-equip"
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

            {/* 장비 합성 모달 */}
            <ForgeModal
                isOpen={isForgeOpen}
                onClose={() => setIsForgeOpen(false)}
                onComplete={() => loadData()}
            />
        </div>
    );
}

export default Inventory;
