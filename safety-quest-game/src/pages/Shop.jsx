import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { items, ITEM_CATEGORY, ITEM_RARITY, CATEGORY_NAMES, RARITY_NAMES, getRarityColor } from '../data/itemsData';
import { purchaseItem } from '../utils/inventoryManager';
import { points as pointsStorage, inventory as inventoryStorage } from '../utils/storage';
import { LoadingState, ErrorState, EmptyState } from '../components/PageState';
import ShareRewardModal from '../components/ShareRewardModal';
import { buildItemShareData } from '../utils/shareManager';

const COLOR = {
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    primaryLight: 'var(--color-primary-light)',
    secondary: 'var(--color-secondary)',
    secondaryLight: 'var(--color-secondary-light)',
    warning: 'var(--color-warning)',
    warningLight: 'var(--color-warning-light)',
    bg: 'var(--color-bg)',
    white: 'var(--color-text)',
    pageTitleStart: 'var(--theme-shop-title-start)',
    pageTitleMid: 'var(--theme-shop-title-mid)',
    pageTitleEnd: 'var(--theme-shop-title-end)'
};

function Shop() {
    const navigate = useNavigate();
    const [currentPoints, setCurrentPoints] = useState(0);
    const [filter, setFilter] = useState('all');
    const [ownedItems, setOwnedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [shareModal, setShareModal] = useState({ isOpen: false, type: null, data: null });

    useEffect(() => {
        initializeShop();
    }, []);

    const initializeShop = async () => {
        setIsLoading(true);
        setLoadError('');
        try {
            loadData();
        } catch (error) {
            console.error('상점 데이터 로드 실패:', error);
            setLoadError('상점 데이터를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

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
            loadData();
            // epic 이상 아이템 구매 시 공유 모달 표시
            if (item.rarity === 'epic' || item.rarity === 'legendary') {
                setShareModal({
                    isOpen: true,
                    type: 'rareItem',
                    data: buildItemShareData(item)
                });
            }
        } else {
            console.log(result.message);
        }
    };

    if (isLoading) {
        return (
            <div className="page">
                <div className="container">
                    <LoadingState title="상점을 준비하는 중입니다..." description="아이템 정보와 보유 포인트를 불러오고 있습니다." />
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="page">
                <div className="container">
                    <ErrorState title="상점 로드에 실패했습니다." description={loadError} onRetry={initializeShop} />
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
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{
                        background: `linear-gradient(135deg, ${COLOR.pageTitleStart} 0%, ${COLOR.pageTitleMid} 50%, ${COLOR.pageTitleEnd} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        🛒 아이템 상점
                    </h1>
                    <p className="text-lg mb-4" style={{ color: COLOR.textMuted }}>포인트로 안전용품을 구매하세요</p>
                    <div className="mt-4" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="points-badge">
                            💰 보유 포인트: <span className="font-bold">{currentPoints.toLocaleString()}P</span>
                        </div>
                        <Link to="/reward-center" style={{
                            background: `linear-gradient(135deg, ${COLOR.secondaryLight}, ${COLOR.secondary})`,
                            color: COLOR.white, border: 'none', borderRadius: 10,
                            padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 700,
                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4
                        }}>
                            🎁 보상안내
                        </Link>
                    </div>
                </div>

                {/* 필터 */}
                <div className="filter-buttons">
                    <button
                        onClick={() => setFilter('all')}
                        className={`filter-btn ${filter === 'all' ? 'active' : 'inactive'}`}
                    >
                        전체
                    </button>
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`filter-btn ${filter === key ? 'active' : 'inactive'}`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {/* 아이템 목록 */}
                {filteredItems.length === 0 ? (
                    <EmptyState
                        icon="🛒"
                        title="선택한 조건의 아이템이 없습니다."
                        description="필터를 변경해서 다른 카테고리 아이템을 확인해 주세요."
                        actionLabel="전체 보기"
                        onAction={() => setFilter('all')}
                    />
                ) : (
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
                            <div key={item.id} className="card backdrop-blur-xl rounded-2xl overflow-hidden 
                              shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 
                              group relative">
                                {/* 희귀도별 테두리 글로우 */}
                                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-500 pointer-events-none z-0 ${rarityGlow[item.rarity]}`} />

                                <div className="card-header p-4 relative z-10">
                                    <div className="text-center mb-2">
                                        <div className="relative w-full aspect-square bg-gradient-to-br from-slate-800 to-slate-900 
                                          rounded-xl mb-4 overflow-hidden transition-transform 
                                          duration-300 flex items-center justify-center border border-slate-700">
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
                                                    }}
                                                    className="w-4/5 h-4/5 object-contain 
                                                      drop-shadow-lg transition-transform duration-300 
                                                      group-hover:scale-105"
                                                />
                                            ) : null}
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
                                    <h4 className="card-title text-center text-lg font-bold mb-1" style={{ color: COLOR.text }}>
                                        {item.name}
                                    </h4>
                                    <p className="card-subtitle text-center text-sm" style={{ color: COLOR.textMuted }}>
                                        {CATEGORY_NAMES[item.category]}
                                    </p>
                                </div>

                                <div className="card-body px-4 pb-4 relative z-10">
                                    <p className="text-sm mb-4 leading-relaxed" style={{ color: COLOR.textSecondary }}>
                                        {item.description}
                                    </p>

                                    <div className="mb-4">
                                        <div className="text-xs mb-2 font-semibold" style={{ color: COLOR.textMuted }}>
                                            효과
                                        </div>
                                        <div className="badge badge-success bg-gradient-to-r from-emerald-500 
                                          to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/30 
                                          inline-flex items-center px-3 py-1 rounded-full">
                                            +{item.effect.bonus}% 보너스
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer p-4 pt-0 relative z-10">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold text-2xl" style={{ color: COLOR.text }}>
                                            💰 {item.price.toLocaleString()}P
                                        </span>
                                    </div>

                                    <div className="flex justify-center">
                                        {owned ? (
                                            <button
                                                className="shop-btn shop-btn-equip"
                                                onClick={() => navigate('/inventory')}
                                            >
                                                착용하기
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handlePurchase(item)}
                                                className={`shop-btn ${canAfford
                                                        ? 'shop-btn-primary'
                                                        : 'shop-btn-disabled'
                                                    }`}
                                                disabled={!canAfford}
                                            >
                                                {canAfford ? '구매하기' : '포인트 부족'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                )}
            </div>

            <ShareRewardModal
                isOpen={shareModal.isOpen}
                onClose={() => setShareModal({ isOpen: false, type: null, data: null })}
                shareType={shareModal.type}
                shareData={shareModal.data}
            />
        </div>
    );
}

export default Shop;
