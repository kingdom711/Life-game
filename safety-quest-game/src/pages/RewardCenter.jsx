import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import goldApi from '../api/goldApi';
import rewardApi from '../api/rewardApi';
import { useAuth } from '../context/AuthContext';
import useParticipantLockdown from '../hooks/useParticipantLockdown';
import IdentityVerificationModal from '../components/IdentityVerificationModal';
import { LoadingState, ErrorState, EmptyState, ResultNotice } from '../components/PageState';

const COLOR = {
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    warning: 'var(--color-warning)',
    warningLight: 'var(--color-warning-light)',
    safe: 'var(--color-safe)',
    danger: 'var(--color-danger)',
    secondary: 'var(--color-secondary)',
    secondaryLight: 'var(--color-secondary-light)',
    bg: 'var(--color-bg)'
};

const DEFAULT_REWARDS = [
    {
        id: 'default-cu-5000',
        type: 'GIFT_CARD',
        name: 'CU 편의점 금액권 5,000원',
        description: 'CU 편의점에서 사용 가능한 모바일 금액권입니다.',
        goldPrice: 50,
        cashValue: 5000,
        remainingQuantity: 10,
        image: '/gift/CU편의점.png'
    },
    {
        id: 'default-cu-10000',
        type: 'GIFT_CARD',
        name: 'CU 편의점 금액권 10,000원',
        description: 'CU 편의점에서 사용 가능한 모바일 금액권입니다.',
        goldPrice: 100,
        cashValue: 10000,
        remainingQuantity: 5,
        image: '/gift/CU편의점.png'
    },
    {
        id: 'default-starbucks-5000',
        type: 'COFFEE_COUPON',
        name: '스타벅스 아메리카노 Tall',
        description: '스타벅스 매장에서 사용 가능한 음료 기프티콘입니다.',
        goldPrice: 45,
        cashValue: 4500,
        remainingQuantity: 10,
        image: '/gift/스타벅스 기프티콘.png'
    },
    {
        id: 'default-starbucks-10000',
        type: 'COFFEE_COUPON',
        name: '스타벅스 카페라떼 Grande',
        description: '스타벅스 매장에서 사용 가능한 음료 기프티콘입니다.',
        goldPrice: 90,
        cashValue: 5500,
        remainingQuantity: 5,
        image: '/gift/스타벅스 기프티콘.png'
    }
];

function RewardCenter() {
    const { user } = useAuth();
    const participantLockdown = useParticipantLockdown();
    const [goldBalance, setGoldBalance] = useState(0);
    const [rewards, setRewards] = useState([]);
    const [myRewards, setMyRewards] = useState([]);
    const [activeTab, setActiveTab] = useState('rewards');
    const [loading, setLoading] = useState(true);
    const [exchanging, setExchanging] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successReward, setSuccessReward] = useState(null);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [pendingReward, setPendingReward] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const [goldData, rewardsData, myRewardsData] = await Promise.allSettled([
                goldApi.getBalance(),
                rewardApi.getRewards(),
                rewardApi.getMyRewards()
            ]);

            if (goldData.status === 'fulfilled') {
                const serverBalance = goldData.value?.balance || 0;
                const mockSpent = rewardApi.getMockGoldSpent();
                setGoldBalance(Math.max(0, serverBalance - mockSpent));
            }
            if (rewardsData.status === 'fulfilled' && Array.isArray(rewardsData.value) && rewardsData.value.length > 0) {
                setRewards(rewardsData.value);
            } else {
                setRewards(DEFAULT_REWARDS);
            }
            if (myRewardsData.status === 'fulfilled') {
                setMyRewards(Array.isArray(myRewardsData.value) ? myRewardsData.value : []);
            }
            if (
                goldData.status === 'rejected' &&
                myRewardsData.status === 'rejected'
            ) {
                setLoadError('보상센터 데이터를 불러오지 못했습니다.');
            }
        } catch (err) {
            console.error('데이터 로딩 실패:', err);
            setLoadError(err?.message || '보상센터 데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleExchange = async (reward) => {
        if (goldBalance < reward.goldPrice) {
            setError('골드가 부족합니다. 포인트 교환소에서 골드를 먼저 교환해주세요!');
            setTimeout(() => setError(null), 3000);
            return;
        }

        // 본인 인증 체크 (백엔드 미연동 시 mock 폴백 자동 적용)
        try {
            const { isVerified } = await rewardApi.checkVerificationStatus();
            if (!isVerified) {
                setPendingReward(reward);
                setIsVerificationModalOpen(true);
                return;
            }
            await processExchange(reward);
        } catch (err) {
            console.error('인증 상태 확인 실패:', err);
            // 폴백도 실패한 경우 인증 모달을 직접 띄움
            setPendingReward(reward);
            setIsVerificationModalOpen(true);
        }
    };

    const processExchange = async (reward) => {
        try {
            setExchanging(reward.id);
            setError(null);

            const isDefaultReward = String(reward.id).startsWith('default-');
            if (isDefaultReward) {
                // default reward: localStorage에 교환 내역 영속화
                rewardApi.addMockExchange(reward, { username: user?.username, name: user?.name });
            } else {
                await rewardApi.exchangeReward(reward.id);
            }

            setSuccessReward(reward);
            setShowSuccess(true);
            setGoldBalance(prev => prev - reward.goldPrice);

            // 내역 갱신 (백엔드 + mock 병합)
            await rewardApi.getMyRewards().then(data => {
                setMyRewards(Array.isArray(data) ? data : []);
            }).catch(() => { });

            setTimeout(() => setShowSuccess(false), 5000);
        } catch (err) {
            setError(err.message || '교환에 실패했습니다.');
            setTimeout(() => setError(null), 3000);
        } finally {
            setExchanging(null);
            setPendingReward(null);
        }
    };

    const handleVerificationSuccess = () => {
        if (pendingReward) {
            processExchange(pendingReward);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return { text: '⏳ 처리 대기', color: COLOR.warning, bg: 'rgba(245,158,11,0.15)' };
            case 'DELIVERED': return { text: '✅ 발송 완료', color: COLOR.safe, bg: 'rgba(34,197,94,0.15)' };
            case 'CANCELLED': return { text: '❌ 취소됨', color: COLOR.danger, bg: 'rgba(239,68,68,0.15)' };
            default: return { text: `ℹ️ ${status}`, color: COLOR.textMuted, bg: 'rgba(148,163,184,0.15)' };
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
                    <LoadingState
                        title="보상센터를 불러오는 중입니다..."
                        description="보상 목록과 교환 내역을 동기화하고 있습니다."
                    />
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="page">
                <div className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
                    <ErrorState
                        title="보상센터 로드에 실패했습니다."
                        description={loadError}
                        onRetry={loadData}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <IdentityVerificationModal
                isOpen={isVerificationModalOpen}
                onClose={() => setIsVerificationModalOpen(false)}
                onVerified={handleVerificationSuccess}
            />
            <div className="container" style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem' }}>
                {/* 뒤로가기 */}
                <div style={{ marginBottom: '1rem' }}>
                    {!participantLockdown && (
                        <Link to="/shop" className="btn btn-secondary btn-sm" style={{ marginRight: 8 }}>← 상점으로</Link>
                    )}
                    <Link to="/exchange" className="btn btn-secondary btn-sm">💱 교환소</Link>
                </div>

                {/* 헤더 */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 className="gradient-text-secondary" style={{
                        fontSize: '2rem', fontWeight: 800, marginBottom: 8
                    }}>
                        🎁 보상센터
                    </h1>
                    <p style={{ color: COLOR.textMuted, fontSize: '0.95rem' }}>골드로 실제 기프티콘을 교환하세요!</p>
                </div>

                {/* 골드 잔액 */}
                <div className="ui-section-gap" style={{
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(245,158,11,0.08))',
                    border: '1px solid rgba(234,179,8,0.25)', borderRadius: 16,
                    padding: '1rem 1.5rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 10
                }}>
                    <div>
                        <div style={{ color: COLOR.textMuted, fontSize: '0.75rem' }}>보유 골드</div>
                        <div style={{ color: COLOR.warningLight, fontSize: '1.5rem', fontWeight: 700 }}>
                            🪙 {goldBalance.toLocaleString()}G
                        </div>
                    </div>
                    <Link to="/exchange" className="ui-btn-core ui-btn-gradient-warning" style={{
                        background: 'linear-gradient(135deg, var(--color-warning-light), var(--color-warning))',
                        color: COLOR.bg, border: 'none', fontSize: '0.8rem', fontWeight: 700,
                        cursor: 'pointer'
                    }}>
                        + 골드 충전
                    </Link>
                </div>

                {/* 성공 알림 */}
                {showSuccess && successReward && (
                    <ResultNotice
                        type="success"
                        icon="🎉"
                        title="교환 완료!"
                        description={`${successReward.name} · 관리자 확인 후 쿠폰이 발급됩니다`}
                    />
                )}

                {/* 에러 메시지 */}
                {error && (
                    <ResultNotice
                        type="error"
                        title="보상 교환에 실패했습니다."
                        description={error}
                    />
                )}

                {/* 탭 */}
                <div style={{
                    display: 'flex', gap: 4, marginBottom: '1.5rem',
                    background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 4
                }}>
                    <button
                        onClick={() => setActiveTab('rewards')}
                        className="ui-btn-chip"
                        style={{
                            flex: 1, border: 'none',
                            background: activeTab === 'rewards'
                                ? 'linear-gradient(135deg, var(--color-secondary-light), var(--color-secondary))'
                                : 'transparent',
                            color: activeTab === 'rewards' ? COLOR.text : COLOR.textMuted,
                            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        🏪 보상 목록
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className="ui-btn-chip"
                        style={{
                            flex: 1, border: 'none',
                            background: activeTab === 'history'
                                ? 'linear-gradient(135deg, var(--color-secondary-light), var(--color-secondary))'
                                : 'transparent',
                            color: activeTab === 'history' ? COLOR.text : COLOR.textMuted,
                            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        📋 교환 내역 {myRewards.length > 0 && `(${myRewards.length})`}
                    </button>
                </div>

                {/* 보상 목록 탭 */}
                {activeTab === 'rewards' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '5rem' }}>
                        {rewards.length === 0 ? (
                            <EmptyState
                                icon="📦"
                                title="현재 교환 가능한 보상이 없습니다."
                                description="잠시 후 다시 확인하거나 교환 내역 탭을 확인해 주세요."
                                actionLabel="다시 불러오기"
                                onAction={loadData}
                            />
                        ) : (
                            rewards.map(reward => {
                                const canAfford = goldBalance >= reward.goldPrice;
                                const inStock = reward.remainingQuantity > 0;

                                return (
                                    <div key={reward.id} className="glass-panel" style={{
                                        border: `1px solid ${canAfford && inStock ? 'rgba(168,85,247,0.3)' : 'rgba(51,65,85,0.4)'}`,
                                        borderRadius: 18, padding: '1.2rem', overflow: 'hidden',
                                        position: 'relative', transition: 'all 0.3s',
                                        boxShadow: canAfford && inStock ? '0 4px 20px rgba(168,85,247,0.1)' : 'none'
                                    }}>
                                        {/* 품절 오버레이 */}
                                        {!inStock && (
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: 'rgba(0,0,0,0.5)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                zIndex: 2, borderRadius: 18
                                            }}>
                                                <span style={{
                                                    color: COLOR.danger, fontWeight: 800, fontSize: '1.3rem',
                                                    background: 'rgba(0,0,0,0.7)', padding: '0.3rem 1rem',
                                                    borderRadius: 8
                                                }}>
                                                    품절
                                                </span>
                                            </div>
                                        )}

                                        {/* 상품 정보 */}
                                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                            {/* 아이콘/이미지 */}
                                            {reward.image ? (
                                                <div style={{
                                                    width: 72, height: 72, borderRadius: 14,
                                                    overflow: 'hidden', flexShrink: 0,
                                                    border: '1px solid rgba(148,163,184,0.15)',
                                                    background: '#fff'
                                                }}>
                                                    <img
                                                        src={reward.image}
                                                        alt={reward.name}
                                                        style={{
                                                            width: '100%', height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{
                                                    width: 72, height: 72, borderRadius: 14,
                                                    background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '2rem', flexShrink: 0
                                                }}>
                                                    {reward.type === 'COFFEE_COUPON' ? '☕' :
                                                        reward.type === 'GIFT_CARD' ? '🎫' :
                                                            reward.type === 'VOUCHER' ? '🎟️' : '🎁'}
                                                </div>
                                            )}

                                            {/* 텍스트 */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: COLOR.text, fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                                                    {reward.name}
                                                </div>
                                                {reward.description && (
                                                    <div style={{ color: COLOR.textMuted, fontSize: '0.8rem', marginBottom: 6, lineHeight: 1.4 }}>
                                                        {reward.description}
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{
                                                        color: COLOR.warningLight, fontWeight: 700, fontSize: '1.05rem'
                                                    }}>
                                                        🪙 {reward.goldPrice}G
                                                    </span>
                                                    {reward.cashValue && (
                                                        <span style={{
                                                            color: COLOR.textMuted, fontSize: '0.75rem',
                                                            background: 'rgba(100,116,139,0.15)',
                                                            padding: '2px 6px', borderRadius: 6
                                                        }}>
                                                            ₩{reward.cashValue.toLocaleString()}
                                                        </span>
                                                    )}
                                                    <span style={{
                                                        color: COLOR.textMuted, fontSize: '0.7rem'
                                                    }}>
                                                        남은 수량: {reward.remainingQuantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 교환 버튼 */}
                                        <button
                                            onClick={() => handleExchange(reward)}
                                            disabled={!canAfford || !inStock || exchanging === reward.id}
                                            className="ui-btn-core"
                                            style={{
                                                width: '100%', marginTop: '1rem',
                                                background: (!canAfford || !inStock)
                                                    ? 'rgba(71,85,105,0.4)'
                                                    : 'linear-gradient(135deg, var(--color-secondary-light), var(--color-secondary))',
                                                color: (!canAfford || !inStock) ? COLOR.textMuted : COLOR.text,
                                                border: 'none', fontSize: '0.9rem', fontWeight: 700,
                                                cursor: (canAfford && inStock) ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.2s',
                                                boxShadow: (canAfford && inStock) ? '0 4px 16px rgba(168,85,247,0.3)' : 'none'
                                            }}
                                        >
                                            {exchanging === reward.id ? '교환 중...' :
                                                !inStock ? '품절' :
                                                    !canAfford ? `골드 부족 (${(reward.goldPrice - goldBalance).toLocaleString()}G 더 필요)` :
                                                        '🎁 교환하기'}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* 교환 내역 탭 */}
                {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '5rem' }}>
                        {myRewards.length === 0 ? (
                            <EmptyState
                                icon="📋"
                                title="아직 교환한 보상이 없습니다."
                                description="보상 목록에서 아이템을 교환하면 내역이 여기에 표시됩니다."
                                actionLabel="보상 목록 보기"
                                onAction={() => setActiveTab('rewards')}
                            />
                        ) : (
                            myRewards.map(item => {
                                const status = getStatusLabel(item.status);
                                return (
                                    <div key={item.id} style={{
                                        background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(51,65,85,0.4)',
                                        borderRadius: 14, padding: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div>
                                                <div style={{ color: COLOR.textSecondary, fontWeight: 700, fontSize: '0.95rem' }}>
                                                    {item.rewardName}
                                                </div>
                                                <div style={{ color: COLOR.textMuted, fontSize: '0.75rem', marginTop: 2 }}>
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    }) : ''}
                                                </div>
                                            </div>
                                            <span style={{
                                                background: status.bg, color: status.color,
                                                padding: '3px 10px', borderRadius: 8,
                                                fontSize: '0.75rem', fontWeight: 600
                                            }}>
                                                {status.text}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: COLOR.warningLight, fontSize: '0.85rem', fontWeight: 600 }}>
                                                🪙 {item.goldPaid}G 사용
                                            </span>
                                            {item.couponCode && (
                                                <span style={{
                                                    background: 'rgba(34,197,94,0.1)', color: COLOR.safe,
                                                    padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {item.couponCode}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

export default RewardCenter;
