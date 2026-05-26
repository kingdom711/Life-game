import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Bell,
    ClipboardCheck,
    ChevronRight,
    ExternalLink,
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

const canUseAdminDashboard = (user) => user?.role === 'ROLE_PROJECT_ADMIN' || user?.role === 'ROLE_ADMIN';

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

const hazardLabels = {
    FALL: '추락',
    COLLAPSE: '붕괴',
    ELECTRIC: '감전',
    FIRE: '화재',
    CHEMICAL: '화학물질',
    EQUIPMENT: '장비',
    CONFINED_SPACE: '밀폐공간',
    OTHER: '기타',
};

const chartPanelStyle = {
    borderRadius: 8,
    padding: '1rem',
    border: '1px solid rgba(148, 163, 184, 0.18)',
};

function formatDateTime(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function toChartRows(entries, colors) {
    const rows = entries
        .map(([key, value], index) => ({
            key,
            label: hazardLabels[key] || key,
            value: Number(value) || 0,
            color: colors[index % colors.length],
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value);

    const max = Math.max(...rows.map((item) => item.value), 0);
    const total = rows.reduce((sum, item) => sum + item.value, 0);

    return rows.map((item) => ({
        ...item,
        total,
        percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
        width: max > 0 ? Math.max(8, Math.round((item.value / max) * 100)) : 0,
    }));
}

function BarListChart({ rows, emptyTitle }) {
    if (rows.length === 0) {
        return <EmptyState icon="-" title={emptyTitle} description="표시할 데이터가 아직 없습니다." />;
    }

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            {rows.map((row) => (
                <div key={row.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                        <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 800 }}>{row.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700 }}>
                            {numberFormat.format(row.value)}건
                            {row.percent ? ` · ${row.percent}%` : ''}
                        </span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(15, 23, 42, 0.72)', borderRadius: 999, overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${row.width}%`,
                                height: '100%',
                                borderRadius: 999,
                                background: row.color,
                                boxShadow: `0 0 18px ${row.color}55`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function SummaryBars({ rows }) {
    const max = Math.max(...rows.map((item) => item.value), 1);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, gap: 10, minHeight: 180, alignItems: 'end' }}>
            {rows.map((row) => {
                const height = row.value > 0 ? Math.max(14, Math.round((row.value / max) * 128)) : 6;
                return (
                    <div key={row.key} style={{ display: 'grid', gap: 8, alignContent: 'end', minWidth: 0 }}>
                        <div style={{ color: '#f8fafc', textAlign: 'center', fontWeight: 900 }}>
                            {numberFormat.format(row.value)}
                        </div>
                        <div
                            title={`${row.label}: ${row.value}`}
                            style={{
                                height,
                                borderRadius: 8,
                                background: row.color,
                                boxShadow: `0 0 22px ${row.color}44`,
                                transition: 'height 180ms ease',
                            }}
                        />
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.25 }}>
                            {row.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MetricDetailPanel({ metric, items, expectedCount = 0 }) {
    const Icon = metric.Icon;
    const count = items.length;
    const hasMissingDetails = count === 0 && expectedCount > 0;

    return (
        <section className="glass-panel" style={{ ...chartPanelStyle, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <Icon size={19} color={metric.tone} />
                    <div style={{ minWidth: 0 }}>
                        <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: 0 }}>{metric.label} 상세</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' }}>
                            총 {numberFormat.format(count)}개 항목
                            {hasMissingDetails ? ` / 지표 ${numberFormat.format(expectedCount)}건` : ''}
                        </p>
                    </div>
                </div>
            </div>

            {items.length === 0 ? (
                <EmptyState
                    icon="!"
                    title={`${metric.label} 상세 항목이 없습니다.`}
                    description={hasMissingDetails
                        ? '지표 숫자는 있지만 상세 목록이 응답에 없습니다. 백엔드가 최신 버전인지 확인한 뒤 다시 새로고침해 주세요.'
                        : '표시할 데이터가 아직 없습니다.'}
                />
            ) : (
                <div style={{ display: 'grid', gap: 8, maxHeight: 360, overflow: 'auto', paddingRight: 4 }}>
                    {items.map((item, index) => (
                        <div
                            key={`${metric.key}-${item.id || index}`}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0, 1fr) auto',
                                gap: 12,
                                alignItems: 'center',
                                padding: '0.85rem',
                                borderRadius: 8,
                                background: 'rgba(15, 23, 42, 0.48)',
                                border: '1px solid rgba(148, 163, 184, 0.14)',
                            }}
                        >
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                                    <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{item.title || '제목 없음'}</strong>
                                    {item.status && (
                                        <span style={{
                                            color: metric.tone,
                                            fontSize: '0.74rem',
                                            fontWeight: 900,
                                            padding: '0.18rem 0.45rem',
                                            borderRadius: 999,
                                            background: `${metric.tone}1f`,
                                        }}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    color: '#cbd5e1',
                                    fontSize: '0.84rem',
                                    marginTop: 5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {item.detail || '상세 정보 없음'}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: 5 }}>
                                    {[item.meta, formatDateTime(item.occurredAt)].filter(Boolean).join(' · ')}
                                </div>
                            </div>
                            {item.href && (
                                <Link
                                    to={item.href}
                                    title="관련 화면 열기"
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        display: 'grid',
                                        placeItems: 'center',
                                        color: '#e2e8f0',
                                        background: 'rgba(30, 41, 59, 0.72)',
                                        border: '1px solid rgba(148, 163, 184, 0.18)',
                                    }}
                                >
                                    <ExternalLink size={16} />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeMetricKey, setActiveMetricKey] = useState('totalUsers');

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
    const metricDetails = useMemo(() => summary?.metricDetails || {}, [summary]);
    const activeMetric = metricConfig.find((metric) => metric.key === activeMetricKey) || metricConfig[0];
    const activeMetricItems = metricDetails[activeMetric.key] || [];
    const topActions = summary?.actionItems || [];
    const recentActivities = summary?.recentActivities || [];

    const hazardRows = useMemo(() => toChartRows(
        Object.entries(summary?.workStopByHazardType || {}),
        ['#ef4444', '#f59e0b', '#38bdf8', '#22c55e', '#a78bfa', '#60a5fa', '#f472b6']
    ), [summary]);

    const operationsRows = useMemo(() => [
        { key: 'openWorkStopReports', label: '작업중지', value: metrics.openWorkStopReports || 0, color: '#ef4444' },
        { key: 'pendingRewardRequests', label: '보상승인', value: metrics.pendingRewardRequests || 0, color: '#f59e0b' },
        { key: 'openHazardCycles', label: '위험조치', value: metrics.openHazardCycles || 0, color: '#38bdf8' },
    ], [metrics]);

    const activityRows = useMemo(() => [
        { key: 'todayEducationCompletions', label: '교육완료', value: metrics.todayEducationCompletions || 0, color: '#22c55e' },
        { key: 'todayChecklistSubmissions', label: '체크리스트', value: metrics.todayChecklistSubmissions || 0, color: '#a78bfa' },
        { key: 'todayHazardReports', label: '위험신고', value: metrics.todayHazardReports || 0, color: '#f97316' },
    ], [metrics]);

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
                            오늘 처리해야 할 안전 이슈와 운영 요청을 한 화면에서 확인합니다.
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
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveMetricKey(key)}
                                    className="glass-panel"
                                    style={{
                                        ...chartPanelStyle,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        background: activeMetricKey === key ? 'rgba(30, 41, 59, 0.88)' : undefined,
                                        boxShadow: activeMetricKey === key ? `0 0 0 1px ${tone}66, 0 18px 36px rgba(15, 23, 42, 0.25)` : undefined,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700 }}>{label}</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <Icon size={18} color={tone} />
                                            <ChevronRight size={15} color={activeMetricKey === key ? tone : '#64748b'} />
                                        </span>
                                    </div>
                                    <div style={{ color: '#f8fafc', fontSize: '1.9rem', fontWeight: 900, marginTop: 10 }}>
                                        {numberFormat.format(metrics[key] || 0)}
                                    </div>
                                </button>
                            ))}
                        </section>

                        <MetricDetailPanel
                            metric={activeMetric}
                            items={activeMetricItems}
                            expectedCount={metrics[activeMetric.key] || 0}
                        />

                        <section style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
                            gap: 16,
                            marginBottom: 16,
                        }}>
                            <div className="glass-panel" style={chartPanelStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                                    <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: 0 }}>최근 30일 작업중지 위험 유형</h2>
                                    <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                                        총 {numberFormat.format(hazardRows[0]?.total || 0)}건
                                    </span>
                                </div>
                                <BarListChart rows={hazardRows} emptyTitle="작업중지 위험 유형 데이터가 없습니다." />
                            </div>

                            <div className="glass-panel" style={chartPanelStyle}>
                                <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 14px' }}>운영 처리 현황</h2>
                                <SummaryBars rows={operationsRows} />
                            </div>
                        </section>

                        <section style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                            gap: 16,
                            marginBottom: 16,
                        }}>
                            <div className="glass-panel" style={chartPanelStyle}>
                                <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 14px' }}>오늘 현장 활동</h2>
                                <SummaryBars rows={activityRows} />
                            </div>

                            <aside className="glass-panel" style={chartPanelStyle}>
                                <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 12px' }}>빠른 작업</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
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
                            </aside>
                        </section>

                        <section style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 16,
                        }}>
                            <div className="glass-panel" style={chartPanelStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <h2 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>처리 대기</h2>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                        {formatDateTime(summary?.generatedAt)} 기준
                                    </span>
                                </div>

                                {topActions.length === 0 ? (
                                    <EmptyState icon="-" title="처리 대기 항목이 없습니다." description="현재 바로 처리해야 할 운영 항목이 없습니다." />
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

                            <div className="glass-panel" style={chartPanelStyle}>
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
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
