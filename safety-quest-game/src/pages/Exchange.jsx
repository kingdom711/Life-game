import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import goldApi from '../api/goldApi';
import exchangeApi from '../api/exchangeApi';
import { points as pointsStorage } from '../utils/storage';
import useParticipantLockdown from '../hooks/useParticipantLockdown';
import { LoadingState, ErrorState, EmptyState, ResultNotice } from '../components/PageState';

const COLOR = {
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    primaryLight: 'var(--color-primary-light)',
    warning: 'var(--color-warning)',
    warningLight: 'var(--color-warning-light)',
    warningDark: 'var(--color-warning-dark)',
    safe: 'var(--color-safe)',
    danger: 'var(--color-danger)',
    border: 'var(--color-border)',
    bg: 'var(--color-bg)',
    bgLight: 'var(--color-bg-light)'
};

function Exchange() {
    const participantLockdown = useParticipantLockdown();
    const [currentPoints, setCurrentPoints] = useState(0);
    const [goldBalance, setGoldBalance] = useState(0);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [exchangeAmount, setExchangeAmount] = useState(1000);
    const [loading, setLoading] = useState(true);
    const [exchanging, setExchanging] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [goldHistory, setGoldHistory] = useState([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const [goldData, rateData, historyData] = await Promise.allSettled([
                goldApi.getBalance(),
                exchangeApi.getExchangeRate(),
                goldApi.getHistory(0, 10)
            ]);

            if (goldData.status === 'fulfilled') {
                setGoldBalance(goldData.value?.balance || 0);
            }
            if (rateData.status === 'fulfilled') {
                setExchangeRate(rateData.value);
            }
            if (historyData.status === 'fulfilled') {
                setGoldHistory(historyData.value?.content || []);
            }
            if (
                goldData.status === 'rejected' &&
                rateData.status === 'rejected' &&
                historyData.status === 'rejected'
            ) {
                setLoadError('교환소 데이터를 불러오지 못했습니다.');
            }

            setCurrentPoints(pointsStorage.get());
        } catch (err) {
            console.error('데이터 로딩 실패:', err);
            setLoadError(err?.message || '교환소 데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const pointsPerGold = exchangeRate?.pointsPerGold || 1000;
    const goldPreview = Math.floor(exchangeAmount / pointsPerGold);
    const maxExchangeable = Math.floor(currentPoints / pointsPerGold) * pointsPerGold;

    const handleExchange = async () => {
        if (exchangeAmount < pointsPerGold || exchangeAmount > currentPoints) return;
        if (exchangeAmount % pointsPerGold !== 0) return;

        try {
            setExchanging(true);
            setError(null);
            const result = await exchangeApi.exchangePointsToGold(exchangeAmount);
            setSuccessData(result);
            setShowSuccess(true);

            // 로컬 포인트 차감
            const newPoints = currentPoints - exchangeAmount;
            pointsStorage.set(newPoints);
            setCurrentPoints(newPoints);
            setGoldBalance(prev => prev + (result?.goldEarned || goldPreview));

            // 히스토리 갱신
            await goldApi.getHistory(0, 10).then(data => {
                setGoldHistory(data?.content || []);
            }).catch(() => { });

            setTimeout(() => setShowSuccess(false), 4000);
        } catch (err) {
            setError(err.message || '교환에 실패했습니다.');
        } finally {
            setExchanging(false);
        }
    };

    const quickAmounts = [1000, 5000, 10000, 50000];

    if (loading) {
        return (
            <div className="page">
                <div className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
                    <LoadingState
                        title="교환소를 불러오는 중입니다..."
                        description="골드 잔액과 교환 비율을 확인하고 있습니다."
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
                        title="교환소 로드에 실패했습니다."
                        description={loadError}
                        onRetry={loadData}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem' }}>
                {/* 뒤로가기 */}
                <div style={{ marginBottom: '1rem' }}>
                    {!participantLockdown && (
                        <Link to="/shop" className="btn btn-secondary btn-sm" style={{ marginRight: 8 }}>← 상점으로</Link>
                    )}
                    <Link to="/reward-center" className="btn btn-secondary btn-sm">🎁 보상센터</Link>
                </div>

                {/* 헤더 */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="gradient-text-warning" style={{
                        fontSize: '2rem', fontWeight: 800, marginBottom: 8
                    }}>
                        💱 포인트 → 골드 교환소
                    </h1>
                    <p style={{ color: COLOR.textMuted, fontSize: '0.95rem' }}>포인트를 골드로 교환하여 실제 기프티콘을 받으세요!</p>
                </div>

                {/* 잔액 표시 카드 */}
                <div className="responsive-dual-grid ui-section-gap">
                    {/* 포인트 */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))',
                        border: '1px solid rgba(59,130,246,0.25)', borderRadius: 16, padding: '1.2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>💎</div>
                        <div style={{ color: COLOR.textMuted, fontSize: '0.75rem', marginBottom: 4 }}>보유 포인트</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: COLOR.primaryLight }}>
                            {currentPoints.toLocaleString()}P
                        </div>
                    </div>
                    {/* 골드 */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(245,158,11,0.1))',
                        border: '1px solid rgba(234,179,8,0.25)', borderRadius: 16, padding: '1.2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🪙</div>
                        <div style={{ color: COLOR.textMuted, fontSize: '0.75rem', marginBottom: 4 }}>보유 골드</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: COLOR.warningLight }}>
                            {goldBalance.toLocaleString()}G
                        </div>
                    </div>
                </div>

                {/* 교환 비율 안내 */}
                <div className="ui-section-gap" style={{
                    background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
                    borderRadius: 12, padding: '0.8rem 1rem',
                    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>📊</span>
                    <div>
                        <span style={{ color: COLOR.warningLight, fontWeight: 600 }}>교환 비율: </span>
                        <span style={{ color: COLOR.textSecondary }}>{pointsPerGold.toLocaleString()}P = 1G</span>
                    </div>
                </div>

                {/* 교환 입력 카드 */}
                <div className="glass-panel ui-section-gap" style={{
                    border: '1px solid rgba(234,179,8,0.2)', borderRadius: 20,
                    padding: '1.5rem'
                }}>
                    {/* 포인트 입력 */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: COLOR.textMuted, fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>교환할 포인트</label>
                        <input
                            type="number"
                            value={exchangeAmount}
                            onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setExchangeAmount(Math.floor(val / pointsPerGold) * pointsPerGold);
                            }}
                            style={{
                                width: '100%', background: 'rgba(15,23,42,0.8)',
                                border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12,
                                padding: '0.8rem 1rem', color: COLOR.text, fontSize: '1.2rem',
                                fontWeight: 700, boxSizing: 'border-box'
                            }}
                            min={pointsPerGold}
                            step={pointsPerGold}
                            max={maxExchangeable}
                        />
                    </div>

                    {/* 빠른 선택 */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                        {quickAmounts.filter(a => a <= currentPoints).map(amount => (
                            <button
                                key={amount}
                                onClick={() => setExchangeAmount(amount)}
                                className="ui-btn-chip"
                                style={{
                                    background: exchangeAmount === amount
                                        ? 'linear-gradient(135deg, var(--color-warning-light), var(--color-warning))'
                                        : 'rgba(51,65,85,0.6)',
                                    color: exchangeAmount === amount ? COLOR.bg : COLOR.textMuted,
                                    border: exchangeAmount === amount ? 'none' : '1px solid rgba(71, 85, 105, 0.5)',
                                    cursor: 'pointer'
                                }}
                            >
                                {amount.toLocaleString()}P
                            </button>
                        ))}
                        {maxExchangeable > 0 && (
                            <button
                                onClick={() => setExchangeAmount(maxExchangeable)}
                                className="ui-btn-chip"
                                style={{
                                    background: exchangeAmount === maxExchangeable
                                        ? 'linear-gradient(135deg, var(--color-warning-light), var(--color-warning))'
                                        : 'rgba(234,179,8,0.15)',
                                    color: exchangeAmount === maxExchangeable ? COLOR.bg : COLOR.warningLight,
                                    border: '1px solid rgba(234,179,8,0.3)',
                                    cursor: 'pointer'
                                }}
                            >
                                최대
                            </button>
                        )}
                    </div>

                    {/* 변환 미리보기 */}
                    <div style={{
                        background: 'rgba(234,179,8,0.06)', border: '1px dashed rgba(234,179,8,0.2)',
                        borderRadius: 12, padding: '1rem', textAlign: 'center', marginBottom: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                            <div>
                                <div style={{ color: COLOR.primaryLight, fontSize: '1.3rem', fontWeight: 700 }}>
                                    {exchangeAmount.toLocaleString()}P
                                </div>
                                <div style={{ color: COLOR.textMuted, fontSize: '0.7rem' }}>포인트 차감</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', color: COLOR.warningLight }}>→</div>
                            <div>
                                <div style={{ color: COLOR.warningLight, fontSize: '1.3rem', fontWeight: 700 }}>
                                    {goldPreview.toLocaleString()}G
                                </div>
                                <div style={{ color: COLOR.textMuted, fontSize: '0.7rem' }}>골드 획득</div>
                            </div>
                        </div>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <ResultNotice
                            type="error"
                            title="교환 요청에 실패했습니다."
                            description={error}
                        />
                    )}

                    {/* 교환 버튼 */}
                    <button
                        onClick={handleExchange}
                        disabled={exchanging || exchangeAmount < pointsPerGold || exchangeAmount > currentPoints || goldPreview <= 0}
                        className="ui-btn-core"
                        style={{
                            width: '100%',
                            background: (exchanging || exchangeAmount > currentPoints || goldPreview <= 0)
                                ? 'rgba(71,85,105,0.5)'
                                : 'linear-gradient(135deg, var(--color-warning-light), var(--color-warning), var(--color-warning-dark))',
                            color: (exchanging || exchangeAmount > currentPoints || goldPreview <= 0) ? COLOR.textMuted : COLOR.bg,
                            border: 'none',
                            fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(234,179,8,0.25)',
                            opacity: (exchangeAmount > currentPoints || goldPreview <= 0) ? 0.5 : 1
                        }}
                    >
                        {exchanging ? '교환 중...' : `🪙 ${goldPreview.toLocaleString()}G 교환하기`}
                    </button>
                </div>

                {/* 성공 알림 */}
                {showSuccess && successData && (
                    <ResultNotice
                        type="success"
                        icon="✅"
                        title="교환 완료!"
                        description={`${successData.pointsSpent?.toLocaleString()}P → ${successData.goldEarned?.toLocaleString()}G`}
                    />
                )}

                {/* 거래 내역 */}
                <div style={{ marginBottom: '5rem' }}>
                    {goldHistory.length > 0 ? (
                        <>
                        <h3 style={{ color: COLOR.textSecondary, fontSize: '1rem', fontWeight: 700, marginBottom: '0.8rem' }}>
                            📜 최근 골드 내역
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {goldHistory.map((tx, i) => (
                                <div key={tx.id || i} style={{
                                    background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.4)',
                                    borderRadius: 12, padding: '0.8rem 1rem',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ color: COLOR.textSecondary, fontSize: '0.85rem', fontWeight: 600 }}>
                                            {tx.description || tx.reason || '교환'}
                                        </div>
                                        <div style={{ color: COLOR.textMuted, fontSize: '0.7rem', marginTop: 2 }}>
                                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('ko-KR') : ''}
                                        </div>
                                    </div>
                                    <div style={{
                                        color: tx.type === 'EARN' ? COLOR.safe : COLOR.danger,
                                        fontWeight: 700, fontSize: '0.95rem'
                                    }}>
                                        {tx.type === 'EARN' ? '+' : '-'}{tx.amount}G
                                    </div>
                                </div>
                            ))}
                        </div>
                        </>
                    ) : (
                        <EmptyState
                            icon="📜"
                            title="최근 골드 내역이 없습니다."
                            description="포인트를 골드로 교환하면 거래 내역이 여기에 표시됩니다."
                            actionLabel="새로고침"
                            onAction={loadData}
                        />
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

export default Exchange;
