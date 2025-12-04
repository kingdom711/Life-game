import { useState, useEffect } from 'react';
import { items, ITEM_CATEGORY, ITEM_RARITY, CATEGORY_NAMES, RARITY_NAMES, getRarityColor } from '../data/itemsData';
import { purchaseItem } from '../utils/inventoryManager';
import { points as pointsStorage, inventory as inventoryStorage } from '../utils/storage';

function Shop() {
    const [currentPoints, setCurrentPoints] = useState(0);
    const [filter, setFilter] = useState('all');
    const [ownedItems, setOwnedItems] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setCurrentPoints(pointsStorage.get());
        setOwnedItems(inventoryStorage.get());
    };

    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => item.category === filter);

    const handlePurchase = (item) => {
        const result = purchaseItem(item.id);
        if (result.success) {
            // alert(result.message); // 제거됨
            loadData(); // 새로고침
        } else {
            // alert(result.message); // 제거됨
            console.log(result.message);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <h1>🛒 아이템 상점</h1>
                    <p className="text-muted">포인트로 안전용품을 구매하세요</p>
                    <div className="mt-md">
                        <div className="badge badge-primary" style={{ fontSize: '1.25rem', padding: '0.5rem 1rem' }}>
                            💰 보유 포인트: {currentPoints.toLocaleString()}P
                        </div>
                    </div>
                </div>

                {/* 필터 */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    >
                        전체
                    </button>
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`btn ${filter === key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {/* 아이템 목록 */}
                <div className="grid grid-3">
                    {filteredItems.map(item => {
                        const owned = ownedItems.includes(item.id);
                        const canAfford = currentPoints >= item.price;

                        return (
                            <div key={item.id} className="card">
                                <div className="card-header">
                                    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{
                                            height: '140px',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(240,249,255,0.5) 100%)',
                                            borderRadius: 'var(--radius-lg)',
                                            padding: '1rem'
                                        }}>
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                    style={{
                                                        maxHeight: '100%',
                                                        maxWidth: '100%',
                                                        objectFit: 'contain',
                                                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
                                                        transition: 'transform 0.3s ease'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                                />
                                            ) : null}
                                            <div style={{ display: item.image ? 'none' : 'block', fontSize: '4rem' }}>
                                                {item.category === 'helmet' && '⛑️'}
                                                {item.category === 'vest' && '🦺'}
                                                {item.category === 'gloves' && '🧤'}
                                                {item.category === 'shoes' && '👞'}
                                                {item.category === 'glasses' && '🥽'}
                                                {item.category === 'belt' && '🔒'}
                                                {item.category === 'mask' && '😷'}
                                            </div>
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

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                            효과
                                        </div>
                                        <div className="badge badge-success">
                                            +{item.effect.bonus}% 보너스
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span className="font-bold" style={{ fontSize: '1.25rem' }}>
                                            💰 {item.price.toLocaleString()}P
                                        </span>
                                    </div>

                                    {owned ? (
                                        <button className="btn btn-secondary" disabled style={{ width: '100%' }}>
                                            ✓ 보유 중
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(item)}
                                            className="btn btn-primary"
                                            disabled={!canAfford}
                                            style={{ width: '100%' }}
                                        >
                                            {canAfford ? '구매하기' : '포인트 부족'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Shop;
