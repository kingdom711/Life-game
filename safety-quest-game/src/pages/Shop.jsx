import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">
                        ← 대시보드로 돌아가기
                    </Link>
                </div>
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-slate-800 
                      via-blue-600 to-slate-800 bg-clip-text text-transparent">
                        🛒 아이템 상점
                    </h1>
                    <p className="text-slate-600 text-lg mb-4">포인트로 안전용품을 구매하세요</p>
                    <div className="mt-4">
                        <div className="badge badge-primary bg-gradient-to-r from-blue-500 to-indigo-500 
                          text-white border-0 shadow-xl shadow-blue-500/30 text-lg px-4 py-2 rounded-full 
                          inline-flex items-center gap-2">
                            💰 보유 포인트: <span className="font-bold">{currentPoints.toLocaleString()}P</span>
                        </div>
                    </div>
                </div>

                {/* 필터 */}
                <div className="mb-8 flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
                          ${filter === 'all' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30' 
                            : 'backdrop-blur-sm bg-white/70 hover:bg-white/90 border border-slate-300/50 text-slate-700 shadow-md hover:shadow-lg'
                          }`}
                    >
                        전체
                    </button>
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
                              ${filter === key 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30' 
                                : 'backdrop-blur-sm bg-white/70 hover:bg-white/90 border border-slate-300/50 text-slate-700 shadow-md hover:shadow-lg'
                              }`}
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

                        const rarityGlow = {
                            legendary: 'shadow-[0_0_30px_rgba(217,119,6,0.5)]',
                            epic: 'shadow-[0_0_30px_rgba(147,51,234,0.5)]',
                            rare: 'shadow-[0_0_30px_rgba(37,99,235,0.5)]',
                            common: 'shadow-[0_0_20px_rgba(100,116,139,0.3)]'
                        };

                        return (
                            <div key={item.id} className="card backdrop-blur-xl bg-gradient-to-br from-white/70 
                              via-white/50 to-white/30 border border-white/40 rounded-2xl overflow-hidden 
                              shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                              group relative">
                                {/* 희귀도별 테두리 글로우 */}
                                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-500 ${rarityGlow[item.rarity]}`} />
                                
                                <div className="card-header p-4">
                                    <div className="text-center mb-2">
                                        <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-blue-50 
                                          rounded-xl mb-4 overflow-hidden group-hover:scale-105 transition-transform 
                                          duration-300 flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                                              via-white/20 to-transparent -translate-x-full group-hover:translate-x-full 
                                              transition-transform duration-1000" />
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        if (e.target.nextSibling) {
                                                            e.target.nextSibling.style.display = 'block';
                                                        }
                                                    }}
                                                    className="w-4/5 h-4/5 object-contain 
                                                      drop-shadow-lg transition-transform duration-300 
                                                      group-hover:scale-110"
                                                />
                                            ) : null}
                                            <div className={`text-6xl flex items-center justify-center absolute inset-0
                                              ${item.image ? 'hidden' : 'block'}`}>
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
                                            className="badge inline-flex items-center px-3 py-1 rounded-full text-white 
                                              font-semibold text-xs shadow-lg"
                                            style={{
                                                background: getRarityColor(item.rarity),
                                            }}
                                        >
                                            {RARITY_NAMES[item.rarity]}
                                        </div>
                                    </div>
                                    <h4 className="card-title text-center text-lg font-bold text-slate-800 mb-1">
                                        {item.name}
                                    </h4>
                                    <p className="card-subtitle text-center text-sm text-slate-600">
                                        {CATEGORY_NAMES[item.category]}
                                    </p>
                                </div>

                                <div className="card-body px-4 pb-4">
                                    <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                                        {item.description}
                                    </p>

                                    <div className="mb-4">
                                        <div className="text-slate-500 text-xs mb-2 font-semibold">
                                            효과
                                        </div>
                                        <div className="badge badge-success bg-gradient-to-r from-emerald-500 
                                          to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/30 
                                          inline-flex items-center px-3 py-1 rounded-full">
                                            +{item.effect.bonus}% 보너스
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer p-4 pt-0">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 
                                          to-indigo-600 bg-clip-text text-transparent">
                                            💰 {item.price.toLocaleString()}P
                                        </span>
                                    </div>

                                    {owned ? (
                                        <button className="w-full py-3 bg-slate-200 text-slate-500 rounded-lg 
                                          font-bold cursor-not-allowed shadow-none">
                                            ✓ 보유 중
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(item)}
                                            className={`w-full py-3 rounded-lg font-bold transition-all duration-300 relative overflow-hidden group ${
                                              canAfford
                                                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5'
                                                : 'bg-slate-400 text-slate-200 cursor-not-allowed'
                                            }`}
                                            disabled={!canAfford}
                                        >
                                            {canAfford && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                            )}
                                            <span className="relative z-10">
                                                {canAfford ? '구매하기' : '포인트 부족'}
                                            </span>
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
