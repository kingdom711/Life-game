import { useState, useEffect } from 'react';
import { getInventoryItems, equipItem, unequipItem, isItemEquipped, getInventoryStats } from '../utils/inventoryManager';
import { CATEGORY_NAMES, getRarityColor, RARITY_NAMES } from '../data/itemsData';

function Inventory() {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [stats, setStats] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const items = getInventoryItems();
        const inventoryStats = getInventoryStats();
        setInventoryItems(items);
        setStats(inventoryStats);
    };

    const handleEquip = (item) => {
        const result = equipItem(item.id);
        if (result.success) {
            // alert(result.message); // 제거됨
            loadData();
        }
    };

    const handleUnequip = (item) => {
        const result = unequipItem(item.category);
        if (result.success) {
            // alert(result.message); // 제거됨
            loadData();
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <h1>🎒 인벤토리</h1>
                    <p className="text-muted">보유 중인 안전용품을 관리하세요</p>
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
                            <a href="/shop">
                                <button className="btn btn-primary mt-md">상점으로 이동</button>
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-3">
                        {inventoryItems.map(item => {
                            const equipped = isItemEquipped(item.id);

                            return (
                                <div key={item.id} className="card">
                                    {equipped && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            fontSize: '1.5rem'
                                        }}>
                                            ✓
                                        </div>
                                    )}

                                    <div className="card-header">
                                        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ height: '120px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        style={{
                                                            maxHeight: '100%',
                                                            maxWidth: '100%',
                                                            objectFit: 'contain',
                                                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
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
                                        <h4 className="card-title text-center">{item.name}</h4>
                                        <p className="card-subtitle text-center">{CATEGORY_NAMES[item.category]}</p>
                                    </div>

                                    <div className="card-body">
                                        <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                            {item.description}
                                        </p>

                                        <div className="flex justify-between mb-md">
                                            <div className="badge badge-success">
                                                +{item.effect.bonus}% 보너스
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                💰 {item.price.toLocaleString()}P
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        {equipped ? (
                                            <button
                                                onClick={() => handleUnequip(item)}
                                                className="btn btn-secondary"
                                                style={{ width: '100%' }}
                                            >
                                                해제하기
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEquip(item)}
                                                className="btn btn-primary"
                                                style={{ width: '100%' }}
                                            >
                                                착용하기
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Inventory;
