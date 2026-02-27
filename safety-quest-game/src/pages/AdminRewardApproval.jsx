import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import rewardApi from '../api/rewardApi';
import { LoadingState, EmptyState, ResultNotice } from '../components/PageState';

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

const STATUS_CONFIG = {
    PENDING: { text: '처리 대기', icon: '⏳', color: COLOR.warning, bg: 'rgba(245,158,11,0.15)' },
    DELIVERED: { text: '발송 완료', icon: '✅', color: COLOR.safe, bg: 'rgba(34,197,94,0.15)' },
    CANCELLED: { text: '취소됨', icon: '❌', color: COLOR.danger, bg: 'rgba(239,68,68,0.15)' }
};

const TABS = [
    { key: 'all', label: '전체' },
    { key: 'PENDING', label: '처리 대기' },
    { key: 'DELIVERED', label: '발송 완료' },
    { key: 'CANCELLED', label: '취소됨' }
];

function AdminRewardApproval() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isProjectAdmin = user?.username === 'admin';

    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PENDING');
    const [actionTarget, setActionTarget] = useState(null); // { id, type: 'approve'|'reject' }
    const [couponCode, setCouponCode] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        if (!isProjectAdmin) navigate('/');
    }, [isProjectAdmin, navigate]);

    const loadExchanges = useCallback(async () => {
        try {
            setLoading(true);
            const data = await rewardApi.getAllExchanges();
            setExchanges(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('교환 목록 로드 실패:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isProjectAdmin) loadExchanges();
    }, [isProjectAdmin, loadExchanges]);

    const filtered = activeTab === 'all'
        ? exchanges
        : exchanges.filter(e => e.status === activeTab);

    const pendingCount = exchanges.filter(e => e.status === 'PENDING').length;

    const handleApprove = async (id) => {
        if (!couponCode.trim()) {
            setNotice({ type: 'error', message: '쿠폰번호를 입력해주세요.' });
            setTimeout(() => setNotice(null), 3000);
            return;
        }
        setProcessing(true);
        try {
            await rewardApi.approveExchange(id, couponCode.trim());
            setNotice({ type: 'success', message: '승인 완료! 쿠폰이 발급되었습니다.' });
            setActionTarget(null);
            setCouponCode('');
            await loadExchanges();
        } catch (err) {
            setNotice({ type: 'error', message: err.message || '승인 처리에 실패했습니다.' });
        } finally {
            setProcessing(false);
            setTimeout(() => setNotice(null), 3000);
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            setNotice({ type: 'error', message: '거절 사유를 입력해주세요.' });
            setTimeout(() => setNotice(null), 3000);
            return;
        }
        setProcessing(true);
        try {
            await rewardApi.rejectExchange(id, rejectReason.trim());
            setNotice({ type: 'success', message: '거절 완료. 골드가 환불되었습니다.' });
            setActionTarget(null);
            setRejectReason('');
            await loadExchanges();
        } catch (err) {
            setNotice({ type: 'error', message: err.message || '거절 처리에 실패했습니다.' });
        } finally {
            setProcessing(false);
            setTimeout(() => setNotice(null), 3000);
        }
    };

    if (!isProjectAdmin) return null;

    if (loading) {
        return (
            <div className="page">
                <div className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
                    <LoadingState title="교환 요청을 불러오는 중..." description="보상 승인 데이터를 로드하고 있습니다." />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem' }}>
                {/* 헤더 */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 className="gradient-text-secondary" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
                        보상 승인 관리
                    </h1>
                    <p style={{ color: COLOR.textMuted, fontSize: '0.9rem' }}>
                        교환 요청을 확인하고 쿠폰을 발급하세요
                    </p>
                    {pendingCount > 0 && (
                        <div style={{
                            display: 'inline-block', marginTop: 8,
                            background: 'rgba(245,158,11,0.15)', color: COLOR.warningLight,
                            padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600
                        }}>
                            {pendingCount}건 대기 중
                        </div>
                    )}
                </div>

                {/* 알림 */}
                {notice && (
                    <ResultNotice
                        type={notice.type}
                        icon={notice.type === 'success' ? '✅' : '⚠️'}
                        title={notice.message}
                    />
                )}

                {/* 탭 */}
                <div style={{
                    display: 'flex', gap: 4, marginBottom: '1.5rem',
                    background: 'rgba(30,41,59,0.6)', borderRadius: 12, padding: 4
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="ui-btn-chip"
                            style={{
                                flex: 1, border: 'none',
                                background: activeTab === tab.key
                                    ? 'linear-gradient(135deg, var(--color-secondary-light), var(--color-secondary))'
                                    : 'transparent',
                                color: activeTab === tab.key ? COLOR.text : COLOR.textMuted,
                                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 목록 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '5rem' }}>
                    {filtered.length === 0 ? (
                        <EmptyState
                            icon="📋"
                            title={activeTab === 'PENDING' ? '대기 중인 요청이 없습니다.' : '해당 상태의 요청이 없습니다.'}
                            description="교환 요청이 들어오면 여기에 표시됩니다."
                        />
                    ) : (
                        filtered.map(item => {
                            const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
                            const isExpanded = actionTarget?.id === item.id;

                            return (
                                <div key={item.id} className="glass-panel" style={{
                                    border: `1px solid ${item.status === 'PENDING' ? 'rgba(245,158,11,0.3)' : 'rgba(51,65,85,0.4)'}`,
                                    borderRadius: 16, padding: '1.2rem',
                                    transition: 'all 0.3s'
                                }}>
                                    {/* 요청 정보 */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div>
                                            <div style={{ color: COLOR.text, fontWeight: 700, fontSize: '1rem' }}>
                                                {item.rewardName}
                                            </div>
                                            <div style={{ color: COLOR.secondaryLight, fontSize: '0.8rem', marginTop: 4, fontWeight: 600 }}>
                                                👤 {item.requestedByName || item.requestedBy || '알 수 없음'}
                                                {item.requestedBy && item.requestedBy !== item.requestedByName && (
                                                    <span style={{ color: COLOR.textMuted, fontWeight: 400 }}> (@{item.requestedBy})</span>
                                                )}
                                            </div>
                                            <div style={{ color: COLOR.textMuted, fontSize: '0.75rem', marginTop: 2 }}>
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR', {
                                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                }) : ''}
                                            </div>
                                        </div>
                                        <span style={{
                                            background: status.bg, color: status.color,
                                            padding: '3px 10px', borderRadius: 8,
                                            fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap'
                                        }}>
                                            {status.icon} {status.text}
                                        </span>
                                    </div>

                                    <div style={{ color: COLOR.warningLight, fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>
                                        🪙 {item.goldPaid}G 사용
                                    </div>

                                    {/* 쿠폰번호 (승인된 경우) */}
                                    {item.couponCode && (
                                        <div style={{
                                            background: 'rgba(34,197,94,0.1)', padding: '6px 10px',
                                            borderRadius: 8, marginBottom: 8, fontSize: '0.85rem'
                                        }}>
                                            <span style={{ color: COLOR.textMuted }}>쿠폰: </span>
                                            <span style={{ color: COLOR.safe, fontFamily: 'monospace', fontWeight: 600 }}>
                                                {item.couponCode}
                                            </span>
                                        </div>
                                    )}

                                    {/* 거절 사유 (거절된 경우) */}
                                    {item.rejectReason && (
                                        <div style={{
                                            background: 'rgba(239,68,68,0.1)', padding: '6px 10px',
                                            borderRadius: 8, marginBottom: 8, fontSize: '0.85rem'
                                        }}>
                                            <span style={{ color: COLOR.textMuted }}>사유: </span>
                                            <span style={{ color: COLOR.danger }}>{item.rejectReason}</span>
                                        </div>
                                    )}

                                    {/* 처리일 */}
                                    {item.processedAt && (
                                        <div style={{ color: COLOR.textMuted, fontSize: '0.7rem', marginBottom: 8 }}>
                                            처리일: {new Date(item.processedAt).toLocaleDateString('ko-KR', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </div>
                                    )}

                                    {/* PENDING 액션 버튼 */}
                                    {item.status === 'PENDING' && !isExpanded && (
                                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                            <button
                                                onClick={() => { setActionTarget({ id: item.id, type: 'approve' }); setCouponCode(''); }}
                                                className="ui-btn-core"
                                                style={{
                                                    flex: 1, border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff'
                                                }}
                                            >
                                                승인
                                            </button>
                                            <button
                                                onClick={() => { setActionTarget({ id: item.id, type: 'reject' }); setRejectReason(''); }}
                                                className="ui-btn-core"
                                                style={{
                                                    flex: 1, border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                                                    background: 'rgba(239,68,68,0.2)', color: COLOR.danger
                                                }}
                                            >
                                                거절
                                            </button>
                                        </div>
                                    )}

                                    {/* 승인 폼 */}
                                    {isExpanded && actionTarget.type === 'approve' && (
                                        <div style={{ marginTop: 10, padding: '12px', background: 'rgba(34,197,94,0.08)', borderRadius: 12 }}>
                                            <label style={{ color: COLOR.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                                                쿠폰번호 입력
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="쿠폰번호를 입력하세요"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                style={{
                                                    width: '100%', padding: '0.7rem', marginBottom: 8,
                                                    borderRadius: 8, border: '1px solid rgba(34,197,94,0.3)',
                                                    background: '#0f172a', color: '#fff', fontSize: '0.9rem'
                                                }}
                                            />
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => handleApprove(item.id)}
                                                    disabled={processing}
                                                    className="ui-btn-core"
                                                    style={{
                                                        flex: 1, border: 'none', fontWeight: 700, cursor: 'pointer',
                                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                                                        opacity: processing ? 0.7 : 1
                                                    }}
                                                >
                                                    {processing ? '처리 중...' : '승인 확정'}
                                                </button>
                                                <button
                                                    onClick={() => setActionTarget(null)}
                                                    style={{
                                                        flex: 1, background: 'transparent', border: 'none',
                                                        color: COLOR.textMuted, cursor: 'pointer', fontWeight: 600
                                                    }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 거절 폼 */}
                                    {isExpanded && actionTarget.type === 'reject' && (
                                        <div style={{ marginTop: 10, padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: 12 }}>
                                            <label style={{ color: COLOR.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                                                거절 사유
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="거절 사유를 입력하세요"
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                style={{
                                                    width: '100%', padding: '0.7rem', marginBottom: 8,
                                                    borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                                                    background: '#0f172a', color: '#fff', fontSize: '0.9rem'
                                                }}
                                            />
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => handleReject(item.id)}
                                                    disabled={processing}
                                                    className="ui-btn-core"
                                                    style={{
                                                        flex: 1, border: 'none', fontWeight: 700, cursor: 'pointer',
                                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
                                                        opacity: processing ? 0.7 : 1
                                                    }}
                                                >
                                                    {processing ? '처리 중...' : '거절 확정'}
                                                </button>
                                                <button
                                                    onClick={() => setActionTarget(null)}
                                                    style={{
                                                        flex: 1, background: 'transparent', border: 'none',
                                                        color: COLOR.textMuted, cursor: 'pointer', fontWeight: 600
                                                    }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminRewardApproval;
