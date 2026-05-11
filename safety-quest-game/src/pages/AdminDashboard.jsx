import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Bell,
    ClipboardCheck,
    FileSpreadsheet,
    Gift,
    HardHat,
    RefreshCw,
    ShieldCheck,
    Users,
} from 'lucide-react';
import adminApi from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { EmptyState, LoadingState, ResultNotice } from '../components/PageState';

const canUseAdminDashboard = (user) => {
    const role = user?.role;
    return role === 'ROLE_PROJECT_ADMIN';
};

const numberFormat = new Intl.NumberFormat('ko-KR');

const metricConfig = [
    { key: 'openWorkStopReports', label: '미해결 작업중지', Icon: AlertTriangle, tone: '#ef4444' },
    { key: 'pendingRewardRequests', label: '보상 승인 대기', Icon: Gift, tone: '#f59e0b' },
    { key: 'openHazardCycles', label: '조치 필요 위험', Icon: HardHat, tone: '#38bdf8' },
    { key: 'todayEducationCompletions', label: '오늘 교육 완료', Icon: ShieldCheck, tone: '#22c55e' },
    { key: 'todayChecklistSubmissions', label: '오늘 체크리스트', Icon: ClipboardCheck, tone: '#a78bfa' },
    { key: 'totalUsers', label: '전체 사용자', Icon: Users, tone: '#60a5fa' },
];

const quickLinks = [
    { href: '/alert-management', label: '알림 작성', Icon: Bell },
    { href: '/admin/reward-approval', label: '보상 승인', Icon: Gift },
    { href: '/work-stop-history', label: '작업중지 관리', Icon: AlertTriangle },
    { href: '/compliance-report', label: '월간 리포트', Icon: FileSpreadsheet },
];

function formatDateTime(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const allowed = canUseAdminDashboard(user);

    useEffect(() => {
        if (!allowed) {
            navigate('/', { replace: true });
        }
    }, [allowed, navigate]);

    const loadSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminApi.getDashboardSummary();
            setSummary(data);
        } catch (err) {
            setError(err.message || '관리자 대시보드를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (allowed) {
            loadSummary();
        }
    }, [allowed]);

    const metrics = useMemo(() => summary?.metrics || {}, [summary]);
    const topActions = summary?.actionItems || [];
    const recentActivities = summary?.recentActivities || [];

    if (!allowed) return null;

    return (
        <div className="page" style={{ padding: '2rem 1rem 6rem' }}>
            <div className="container" style={{ maxWidth: 1180, margin: '0 auto' }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    <div>
                        <p style={{ color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>BETA OPERATIONS</p>
                        <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                            관리자 운영 콘솔
                        </h1>
                        <p style={{ color: '#cbd5e1', marginTop: 8 }}>
                            오늘 처리할 안전 이슈와 운영 요청을 한 화면에서 확인합니다.
                        </p>
                    </div>
                    <button
                        onClick={loadSummary}
                        disabled={loading}
                        className="ui-btn-core"
                        style={{
                            border: '1px solid rgba(148, 163, 184, 0.35)',
                            background: 'rgba(15, 23, 42, 0.72)',
                            color: '#e2e8f0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: loading ? 'wait' : 'pointer',
                        }}
                    >
                        <RefreshCw size={16} />
                        새로고침
                    </button>
                </header>

                {error && (
                    <ResultNotice type="error" icon="!" title={error} />
                )}

                {loading ? (
                    <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
                        <LoadingState title="운영 현황을 불러오는 중입니다." description="관리자 지표와 처리 대기 목록을 모으고 있습니다." />
                    </div>
                ) : (
                    <>
                        <section style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: 12,
                            marginBottom: 18,
                        }}>
                            {metricConfig.map(({ key, label, Icon, tone }) => (
                                <div key={key} className="glass-panel" style={{
                                    borderRadius: 8,
                                    padding: '1rem',
                                    border: '1px solid rgba(148, 163, 184, 0.18)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700 }}>{label}</span>
                                        <Icon size={18} color={tone} />
                                    </div>
                                    <div style={{ color: '#f8fafc', fontSize: '1.9rem', fontWeight: 900, marginTop: 10 }}>
                                        {numberFormat.format(metrics[key] || 0)}
                                    </div>
                                </div>
                            ))}
                        </section>

                        <section style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}>
                            <div className="glass-panel" style={{ borderRadius: 8, padding: '1rem', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <h2 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>처리 대기 큐</h2>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                        {formatDateTime(summary?.generatedAt)} 기준
                                    </span>
                                </div>

                                {topActions.length === 0 ? (
                                    <EmptyState icon="✓" title="처리 대기 항목이 없습니다." description="현재 베타 운영 큐가 비어 있습니다." />
                                ) : (
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        {topActions.map((item, index) => (
                                            <Link
                                                key={`${item.type}-${item.createdAt}-${index}`}
                                                to={item.href}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                                                    gap: 12,
                                                    textDecoration: 'none',
                                                    padding: '0.9rem',
                                                    borderRadius: 8,
                                                    background: 'rgba(15, 23, 42, 0.5)',
                                                    border: '1px solid rgba(148, 163, 184, 0.16)',
                                                }}
                                            >
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ color: '#f8fafc', fontWeight: 800 }}>{item.title}</div>
                                                    <div style={{ color: '#cbd5e1', fontSize: '0.86rem', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {item.detail || '상세 정보 없음'}
                                                    </div>
                                                </div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.78rem', textAlign: 'right' }}>
                                                    <div>{item.status}</div>
                                                    <div style={{ marginTop: 4 }}>{formatDateTime(item.createdAt)}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <aside style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
                                <div className="glass-panel" style={{ borderRadius: 8, padding: '1rem', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
                                    <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 12px' }}>빠른 작업</h2>
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        {quickLinks.map(({ href, label, Icon }) => (
                                            <Link
                                                key={href}
                                                to={href}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    color: '#e2e8f0',
                                                    textDecoration: 'none',
                                                    padding: '0.75rem',
                                                    borderRadius: 8,
                                                    background: 'rgba(15, 23, 42, 0.5)',
                                                }}
                                            >
                                                <Icon size={17} />
                                                <span style={{ fontWeight: 800 }}>{label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-panel" style={{ borderRadius: 8, padding: '1rem', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
                                    <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 12px' }}>최근 활동</h2>
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        {recentActivities.length === 0 ? (
                                            <p style={{ color: '#94a3b8', margin: 0 }}>최근 활동이 없습니다.</p>
                                        ) : recentActivities.map((item, index) => (
                                            <div key={`${item.type}-${item.occurredAt}-${index}`} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.14)', paddingBottom: 8 }}>
                                                <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.9rem' }}>{item.title}</div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 3 }}>
                                                    {formatDateTime(item.occurredAt)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </aside>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
