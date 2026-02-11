import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import goldApi from '../api/goldApi';
import exchangeApi from '../api/exchangeApi';
import { points as pointsStorage } from '../utils/storage';

function Exchange() {
    const [currentPoints, setCurrentPoints] = useState(0);
    const [goldBalance, setGoldBalance] = useState(0);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [exchangeAmount, setExchangeAmount] = useState(1000);
    const [loading, setLoading] = useState(true);
    const [exchanging, setExchanging] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);
    const [goldHistory, setGoldHistory] = useState([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
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

            setCurrentPoints(pointsStorage.get());
        } catch (err) {
            console.error('데이터 로딩 실패:', err);
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
                <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div style={{
                        width: 48, height: 48, border: '3px solid rgba(234,179,8,0.3)',
                        borderTopColor: '#eab308', borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem' }}>
                {/* 뒤로가기 */}
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/shop" className="btn btn-secondary btn-sm">← 상점으로</Link>
                    <Link to="/reward-center" className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }}>🎁 보상센터</Link>
                </div>

                {/* 헤더 */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem', fontWeight: 800, marginBottom: 8,
                        background: 'linear-gradient(135deg, #eab308, #f59e0b, #fbbf24)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        💱 포인트 → 골드 교환소
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>포인트를 골드로 교환하여 실제 기프티콘을 받으세요!</p>
                </div>

                {/* 잔액 표시 카드 */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.5rem'
                }}>
                    {/* 포인트 */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))',
                        border: '1px solid rgba(59,130,246,0.25)', borderRadius: 16, padding: '1.2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>💎</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>보유 포인트</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#60a5fa' }}>
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
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>보유 골드</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#eab308' }}>
                            {goldBalance.toLocaleString()}G
                        </div>
                    </div>
                </div>

                {/* 교환 비율 안내 */}
                <div style={{
                    background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
                    borderRadius: 12, padding: '0.8rem 1rem', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: 10
                }}>
                    <span style={{ fontSize: '1.2rem' }}>📊</span>
                    <div>
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>교환 비율: </span>
                        <span style={{ color: '#e2e8f0' }}>{pointsPerGold.toLocaleString()}P = 1G</span>
                    </div>
                </div>

                {/* 교환 입력 카드 */}
                <div style={{
                    background: 'linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))',
                    border: '1px solid rgba(234,179,8,0.2)', borderRadius: 20,
                    padding: '1.5rem', marginBottom: '1.5rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                    {/* 포인트 입력 */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>교환할 포인트</label>
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
                                padding: '0.8rem 1rem', color: '#f8fafc', fontSize: '1.2rem',
                                fontWeight: 700, outline: 'none', boxSizing: 'border-box'
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
                                style={{
                                    background: exchangeAmount === amount
                                        ? 'linear-gradient(135deg, #eab308, #f59e0b)'
                                        : 'rgba(51,65,85,0.6)',
                                    color: exchangeAmount === amount ? '#0f172a' : '#94a3b8',
                                    border: 'none', borderRadius: 8, padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {amount.toLocaleString()}P
                            </button>
                        ))}
                        {maxExchangeable > 0 && (
                            <button
                                onClick={() => setExchangeAmount(maxExchangeable)}
                                style={{
                                    background: exchangeAmount === maxExchangeable
                                        ? 'linear-gradient(135deg, #eab308, #f59e0b)'
                                        : 'rgba(234,179,8,0.15)',
                                    color: exchangeAmount === maxExchangeable ? '#0f172a' : '#fbbf24',
                                    border: '1px solid rgba(234,179,8,0.3)', borderRadius: 8,
                                    padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s'
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
                                <div style={{ color: '#60a5fa', fontSize: '1.3rem', fontWeight: 700 }}>
                                    {exchangeAmount.toLocaleString()}P
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>포인트 차감</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', color: '#eab308' }}>→</div>
                            <div>
                                <div style={{ color: '#eab308', fontSize: '1.3rem', fontWeight: 700 }}>
                                    {goldPreview.toLocaleString()}G
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>골드 획득</div>
                            </div>
                        </div>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1rem',
                            color: '#ef4444', fontSize: '0.85rem'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* 교환 버튼 */}
                    <button
                        onClick={handleExchange}
                        disabled={exchanging || exchangeAmount < pointsPerGold || exchangeAmount > currentPoints || goldPreview <= 0}
                        style={{
                            width: '100%',
                            background: (exchanging || exchangeAmount > currentPoints || goldPreview <= 0)
                                ? 'rgba(71,85,105,0.5)'
                                : 'linear-gradient(135deg, #eab308, #f59e0b, #d97706)',
                            color: (exchanging || exchangeAmount > currentPoints || goldPreview <= 0) ? '#64748b' : '#0f172a',
                            border: 'none', borderRadius: 14, padding: '0.9rem',
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
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
                        border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16,
                        padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'center',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                        <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>
                            교환 완료!
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                            {successData.pointsSpent?.toLocaleString()}P → {successData.goldEarned?.toLocaleString()}G
                        </div>
                    </div>
                )}

                {/* 거래 내역 */}
                {goldHistory.length > 0 && (
                    <div style={{ marginBottom: '5rem' }}>
                        <h3 style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 700, marginBottom: '0.8rem' }}>
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
                                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {tx.description || tx.reason || '교환'}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 2 }}>
                                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('ko-KR') : ''}
                                        </div>
                                    </div>
                                    <div style={{
                                        color: tx.type === 'EARN' ? '#22c55e' : '#ef4444',
                                        fontWeight: 700, fontSize: '0.95rem'
                                    }}>
                                        {tx.type === 'EARN' ? '+' : '-'}{tx.amount}G
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

export default Exchange;
