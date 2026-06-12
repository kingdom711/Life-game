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
    Search,
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
    { key: 'totalUsers', label: '전체 참여자', Icon: Users, tone: '#60a5fa' },
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

const sortOptions = [
    { value: 'score', label: '참여점수순' },
    { value: 'last', label: '최근활동순' },
    { value: 'attendance', label: '출석순' },
    { value: 'education', label: '교육순' },
    { value: 'hazard', label: '위험제보순' },
    { value: 'points', label: '포인트순' },
    { value: 'name', label: '이름순' },
];

const pointSortOptions = [
    { value: 'balance', label: '포인트 잔액순' },
    { value: 'earned', label: '기간 획득순' },
    { value: 'spent', label: '기간 사용순' },
    { value: 'gold', label: '골드 잔액순' },
    { value: 'pending', label: '보상 대기순' },
    { value: 'last', label: '최근 활동순' },
    { value: 'name', label: '이름순' },
];

const chartPanelStyle = {
    borderRadius: 8,
    padding: '1rem',
    border: '1px solid rgba(148, 163, 184, 0.18)',
};

const inputStyle = {
    minHeight: 42,
    borderRadius: 8,
    border: '1px solid rgba(148, 163, 184, 0.28)',
    background: 'rgba(15, 23, 42, 0.72)',
    color: '#e2e8f0',
    padding: '0 0.75rem',
};

function isoDate(daysAgo = 0) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().slice(0, 10);
}

function formatDateTime(value) {
    if (!value) return '-';
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
                            {numberFormat.format(row.value)}건 {row.percent ? `· ${row.percent}%` : ''}
                        </span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(15, 23, 42, 0.72)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${row.width}%`, height: '100%', borderRadius: 999, background: row.color }} />
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
                        <div style={{ height, borderRadius: 8, background: row.color, transition: 'height 180ms ease' }} />
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
                    description={hasMissingDetails ? '지표 숫자는 있지만 상세 목록 응답이 비어 있습니다.' : '표시할 데이터가 아직 없습니다.'}
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
                                        <span style={{ color: metric.tone, fontSize: '0.74rem', fontWeight: 900, padding: '0.18rem 0.45rem', borderRadius: 999, background: `${metric.tone}1f` }}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                                <div style={{ color: '#cbd5e1', fontSize: '0.84rem', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

function ParticipantEngagementSection({ engagement, filters, onFilterChange, onRefresh, loading }) {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const participants = engagement?.participants || [];
    const summary = engagement?.summary || {};
    const selected = participants.find((item) => item.userId === selectedUserId) || participants[0] || null;
    const teamOptions = useMemo(() => {
        const seen = new Map();
        participants.forEach((item) => {
            if (item.teamId && !seen.has(item.teamId)) {
                seen.set(item.teamId, item.teamName);
            }
        });
        return Array.from(seen.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
    }, [participants]);

    const updateFilter = (key, value) => onFilterChange({ ...filters, [key]: value });

    return (
        <section className="glass-panel" style={{ ...chartPanelStyle, marginTop: 18 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap' }}>
                <div>
                    <p style={{ color: '#94a3b8', margin: '0 0 5px', fontWeight: 800 }}>PARTICIPANT ENGAGEMENT</p>
                    <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', margin: 0 }}>개인별 참여 현황</h2>
                    <p style={{ color: '#cbd5e1', margin: '6px 0 0' }}>
                        {engagement?.from}부터 {engagement?.to}까지의 참여 데이터를 집계합니다.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loading}
                    className="ui-btn-core"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15, 23, 42, 0.72)', color: '#e2e8f0' }}
                >
                    <RefreshCw size={16} />
                    새로고침
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                    ['총 참여자', summary.totalParticipants || 0],
                    ['활동 참여자', summary.activeParticipants || 0],
                    ['미참여자', summary.inactiveParticipants || 0],
                    ['평균 점수', summary.averageEngagementScore || 0],
                    ['교육 수료', summary.totalEducationCompletions || 0],
                    ['위험제보', summary.totalHazardReports || 0],
                ].map(([label, value]) => (
                    <div key={label} style={{ padding: '0.9rem', borderRadius: 8, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.14)' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 800 }}>{label}</div>
                        <div style={{ color: '#f8fafc', fontSize: '1.45rem', fontWeight: 900, marginTop: 6 }}>{numberFormat.format(value)}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
                <input type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} style={inputStyle} />
                <input type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} style={inputStyle} />
                <select value={filters.teamId} onChange={(event) => updateFilter('teamId', event.target.value)} style={inputStyle}>
                    <option value="">전체 팀</option>
                    {teamOptions.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
                <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} style={inputStyle}>
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <label style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Search size={16} color="#94a3b8" />
                    <input
                        value={filters.keyword}
                        onChange={(event) => updateFilter('keyword', event.target.value)}
                        placeholder="이름, 계정, 팀 검색"
                        style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', color: '#e2e8f0' }}
                    />
                </label>
            </div>

            {participants.length === 0 ? (
                <EmptyState icon="-" title="개인별 참여 데이터가 없습니다." description="기간 또는 검색 조건을 조정해 주세요." />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(260px, 0.8fr)', gap: 16 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
                            <thead>
                                <tr style={{ color: '#94a3b8', fontSize: '0.76rem', textAlign: 'left' }}>
                                    {['이름', '팀', '출석', '교육', '퀘스트', '위험제보', '확인', '작업중지', '포인트', '최근 활동', '점수'].map((header) => (
                                        <th key={header} style={{ padding: '0.65rem 0.55rem', borderBottom: '1px solid rgba(148, 163, 184, 0.18)' }}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((row) => (
                                    <tr
                                        key={row.userId}
                                        onClick={() => setSelectedUserId(row.userId)}
                                        style={{
                                            cursor: 'pointer',
                                            background: selected?.userId === row.userId ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                                        }}
                                    >
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#f8fafc', fontWeight: 900 }}>{row.name}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#cbd5e1' }}>{row.teamName}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{row.attendanceCount}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{row.educationCompletions}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{row.questCompletions}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{row.hazardReports}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{row.hazardAcks}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{row.workStopReports}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{numberFormat.format(row.pointsEarned || 0)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#94a3b8' }}>{formatDateTime(row.lastActivityAt)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem' }}>
                                            <span style={{ color: '#22c55e', fontWeight: 900 }}>{row.engagementScore}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <aside style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.14)', padding: '1rem', alignSelf: 'start' }}>
                        {selected && (
                            <>
                                <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 800 }}>{selected.role}</div>
                                <h3 style={{ color: '#f8fafc', margin: '4px 0 2px', fontSize: '1.15rem' }}>{selected.name}</h3>
                                <div style={{ color: '#cbd5e1', fontSize: '0.86rem' }}>{selected.username} · {selected.teamName}</div>
                                <div style={{ marginTop: 14, height: 10, borderRadius: 999, background: 'rgba(30, 41, 59, 0.9)', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, selected.engagementScore || 0)}%`, height: '100%', background: '#22c55e' }} />
                                </div>
                                <dl style={{ display: 'grid', gap: 10, margin: '1rem 0 0' }}>
                                    {[
                                        ['참여 점수', selected.engagementScore],
                                        ['평균 퀴즈 점수', `${selected.averageQuizScore || 0}점`],
                                        ['진행 기록', `${selected.questProgressCount || 0}건`],
                                        ['최근 활동', formatDateTime(selected.lastActivityAt)],
                                    ].map(([label, value]) => (
                                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                            <dt style={{ color: '#94a3b8' }}>{label}</dt>
                                            <dd style={{ color: '#f8fafc', margin: 0, fontWeight: 800, textAlign: 'right' }}>{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </>
                        )}
                    </aside>
                </div>
            )}
        </section>
    );
}

function PointRewardDashboardSection({ pointReward, filters, sort, onSortChange, onRefresh, loading }) {
    const users = pointReward?.users || [];
    const summary = pointReward?.summary || {};
    const pendingRewards = pointReward?.pendingRewards || [];
    const [selectedUserId, setSelectedUserId] = useState(null);
    const selected = users.find((item) => item.userId === selectedUserId) || users[0] || null;

    return (
        <section className="glass-panel" style={{ ...chartPanelStyle, marginTop: 18 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap' }}>
                <div>
                    <p style={{ color: '#94a3b8', margin: '0 0 5px', fontWeight: 800 }}>POINTS AND REWARDS</p>
                    <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', margin: 0 }}>포인트/보상 준비 현황</h2>
                    <p style={{ color: '#cbd5e1', margin: '6px 0 0' }}>
                        {pointReward?.from || filters.from}부터 {pointReward?.to || filters.to}까지의 포인트 흐름과 보상 대기 물량입니다.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <select value={sort} onChange={(event) => onSortChange(event.target.value)} style={inputStyle}>
                        {pointSortOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="ui-btn-core"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15, 23, 42, 0.72)', color: '#e2e8f0' }}
                    >
                        <RefreshCw size={16} />
                        새로고침
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                    ['총 잔여 포인트', summary.totalPointBalance || 0],
                    ['기간 획득 포인트', summary.periodPointsEarned || 0],
                    ['기간 사용 포인트', summary.periodPointsSpent || 0],
                    ['총 잔여 골드', summary.totalGoldBalance || 0],
                    ['보상 대기 건수', summary.pendingRewardRequests || 0],
                    ['대기 보상 골드', summary.pendingRewardGold || 0],
                    ['예상 현금가치', summary.pendingRewardCashValue || 0],
                ].map(([label, value]) => (
                    <div key={label} style={{ padding: '0.9rem', borderRadius: 8, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.14)' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 800 }}>{label}</div>
                        <div style={{ color: '#f8fafc', fontSize: '1.35rem', fontWeight: 900, marginTop: 6 }}>{numberFormat.format(value)}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(280px, 0.9fr)', gap: 16 }}>
                <div style={{ overflowX: 'auto' }}>
                    {users.length === 0 ? (
                        <EmptyState icon="-" title="포인트 현황 데이터가 없습니다." description="기간 또는 검색 조건을 조정해 주세요." />
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1040 }}>
                            <thead>
                                <tr style={{ color: '#94a3b8', fontSize: '0.76rem', textAlign: 'left' }}>
                                    {['이름', '팀', '포인트 잔액', '기간 획득', '기간 사용', '골드 잔액', '골드 획득', '골드 사용', '보상 대기', '대기 골드', '최근 활동'].map((header) => (
                                        <th key={header} style={{ padding: '0.65rem 0.55rem', borderBottom: '1px solid rgba(148, 163, 184, 0.18)' }}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((row) => (
                                    <tr
                                        key={row.userId}
                                        onClick={() => setSelectedUserId(row.userId)}
                                        style={{
                                            cursor: 'pointer',
                                            background: selected?.userId === row.userId ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                                        }}
                                    >
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#f8fafc', fontWeight: 900 }}>{row.name}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#cbd5e1' }}>{row.teamName}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#f8fafc', fontWeight: 900 }}>{numberFormat.format(row.pointBalance || 0)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#22c55e' }}>{numberFormat.format(row.periodPointsEarned || 0)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#f97316' }}>{numberFormat.format(row.periodPointsSpent || 0)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#fbbf24', fontWeight: 900 }}>{numberFormat.format(row.goldBalance || 0)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{numberFormat.format(row.periodGoldEarned || 0)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{numberFormat.format(row.periodGoldSpent || 0)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{numberFormat.format(row.pendingRewardRequests || 0)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#e2e8f0' }}>{numberFormat.format(row.pendingRewardGold || 0)}</td>
                                        <td style={{ padding: '0.75rem 0.55rem', color: '#94a3b8' }}>{formatDateTime(row.lastPointActivityAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <aside style={{ display: 'grid', gap: 12, alignSelf: 'start' }}>
                    <div style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.14)', padding: '1rem' }}>
                        <h3 style={{ color: '#f8fafc', margin: '0 0 10px', fontSize: '1rem' }}>선택 사용자</h3>
                        {selected ? (
                            <dl style={{ display: 'grid', gap: 10, margin: 0 }}>
                                {[
                                    ['이름', selected.name],
                                    ['포인트 잔액', numberFormat.format(selected.pointBalance || 0)],
                                    ['누적 획득/사용', `${numberFormat.format(selected.totalPointsEarned || 0)} / ${numberFormat.format(selected.totalPointsSpent || 0)}`],
                                    ['골드 잔액', numberFormat.format(selected.goldBalance || 0)],
                                    ['보상 대기', `${numberFormat.format(selected.pendingRewardRequests || 0)}건`],
                                ].map(([label, value]) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                        <dt style={{ color: '#94a3b8' }}>{label}</dt>
                                        <dd style={{ color: '#f8fafc', margin: 0, fontWeight: 800, textAlign: 'right' }}>{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : (
                            <p style={{ color: '#94a3b8', margin: 0 }}>선택된 사용자가 없습니다.</p>
                        )}
                    </div>

                    <div style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.14)', padding: '1rem' }}>
                        <h3 style={{ color: '#f8fafc', margin: '0 0 10px', fontSize: '1rem' }}>보상 준비 물량</h3>
                        {pendingRewards.length === 0 ? (
                            <p style={{ color: '#94a3b8', margin: 0 }}>대기 중인 보상 신청이 없습니다.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: 10 }}>
                                {pendingRewards.map((item) => (
                                    <div key={item.rewardId} style={{ paddingBottom: 10, borderBottom: '1px solid rgba(148, 163, 184, 0.14)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                            <strong style={{ color: '#f8fafc' }}>{item.rewardName}</strong>
                                            <span style={{ color: '#fbbf24', fontWeight: 900 }}>{numberFormat.format(item.pendingCount)}개</span>
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 4 }}>
                                            필요 {numberFormat.format(item.requiredGold || 0)}G · 현금가치 {numberFormat.format(item.cashValue || 0)}원 · 재고 {numberFormat.format(item.remainingQuantity || 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </section>
    );
}

function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [pointReward, setPointReward] = useState(null);
    const [loading, setLoading] = useState(true);
    const [engagementLoading, setEngagementLoading] = useState(false);
    const [pointRewardLoading, setPointRewardLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeMetricKey, setActiveMetricKey] = useState('totalUsers');
    const [pointRewardSort, setPointRewardSort] = useState('balance');
    const [engagementFilters, setEngagementFilters] = useState({
        from: isoDate(29),
        to: isoDate(0),
        teamId: '',
        keyword: '',
        sort: 'score',
    });

    const allowed = canUseAdminDashboard(user);

    useEffect(() => {
        if (!allowed) {
            navigate('/', { replace: true });
        }
    }, [allowed, navigate]);

    const loadDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const [summaryData, engagementData, pointRewardData] = await Promise.all([
                adminApi.getDashboardSummary(),
                adminApi.getParticipantEngagement(engagementFilters),
                adminApi.getPointRewardDashboard({ ...engagementFilters, sort: pointRewardSort }),
            ]);
            setSummary(summaryData);
            setEngagement(engagementData);
            setPointReward(pointRewardData);
        } catch (err) {
            setError(err.message || '관리자 대시보드 데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const loadEngagement = async () => {
        setEngagementLoading(true);
        setError(null);
        try {
            setEngagement(await adminApi.getParticipantEngagement(engagementFilters));
        } catch (err) {
            setError(err.message || '개인별 참여 데이터를 불러오지 못했습니다.');
        } finally {
            setEngagementLoading(false);
        }
    };

    const loadPointReward = async () => {
        setPointRewardLoading(true);
        setError(null);
        try {
            setPointReward(await adminApi.getPointRewardDashboard({ ...engagementFilters, sort: pointRewardSort }));
        } catch (err) {
            setError(err.message || '포인트/보상 데이터를 불러오지 못했습니다.');
        } finally {
            setPointRewardLoading(false);
        }
    };

    useEffect(() => {
        if (allowed) {
            loadDashboard();
        }
    }, [allowed]);

    useEffect(() => {
        if (allowed && !loading) {
            const timer = setTimeout(() => {
                loadEngagement();
                loadPointReward();
            }, 250);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [engagementFilters, pointRewardSort, allowed]);

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
        { key: 'todayHazardReports', label: '위험제보', value: metrics.todayHazardReports || 0, color: '#f97316' },
    ], [metrics]);

    if (!allowed) return null;

    return (
        <div className="page" style={{ padding: '2rem 1rem 6rem' }}>
            <div className="container" style={{ maxWidth: 1180, margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <p style={{ color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>BETA OPERATIONS</p>
                        <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 900, margin: 0 }}>관리자 운영 콘솔</h1>
                        <p style={{ color: '#cbd5e1', marginTop: 8 }}>오늘 처리할 안전 이슈와 개인별 참여 현황을 한 화면에서 확인합니다.</p>
                    </div>
                    <button
                        onClick={loadDashboard}
                        disabled={loading}
                        className="ui-btn-core"
                        style={{ border: '1px solid rgba(148, 163, 184, 0.35)', background: 'rgba(15, 23, 42, 0.72)', color: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: loading ? 'wait' : 'pointer' }}
                    >
                        <RefreshCw size={16} />
                        새로고침
                    </button>
                </header>

                {error && <ResultNotice type="error" icon="!" title={error} />}

                {loading ? (
                    <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
                        <LoadingState title="운영 현황을 불러오는 중입니다." description="관리자 지표와 참여 데이터를 모으고 있습니다." />
                    </div>
                ) : (
                    <>
                        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18 }}>
                            {metricConfig.map(({ key, label, Icon, tone }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveMetricKey(key)}
                                    className="glass-panel"
                                    style={{ ...chartPanelStyle, textAlign: 'left', cursor: 'pointer', background: activeMetricKey === key ? 'rgba(30, 41, 59, 0.88)' : undefined, boxShadow: activeMetricKey === key ? `0 0 0 1px ${tone}66, 0 18px 36px rgba(15, 23, 42, 0.25)` : undefined }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700 }}>{label}</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <Icon size={18} color={tone} />
                                            <ChevronRight size={15} color={activeMetricKey === key ? tone : '#64748b'} />
                                        </span>
                                    </div>
                                    <div style={{ color: '#f8fafc', fontSize: '1.9rem', fontWeight: 900, marginTop: 10 }}>{numberFormat.format(metrics[key] || 0)}</div>
                                </button>
                            ))}
                        </section>

                        <MetricDetailPanel metric={activeMetric} items={activeMetricItems} expectedCount={metrics[activeMetric.key] || 0} />

                        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 16, marginBottom: 16 }}>
                            <div className="glass-panel" style={chartPanelStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                                    <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: 0 }}>최근 30일 작업중지 위험 유형</h2>
                                    <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>총 {numberFormat.format(hazardRows[0]?.total || 0)}건</span>
                                </div>
                                <BarListChart rows={hazardRows} emptyTitle="작업중지 위험 유형 데이터가 없습니다." />
                            </div>

                            <div className="glass-panel" style={chartPanelStyle}>
                                <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 14px' }}>운영 처리 현황</h2>
                                <SummaryBars rows={operationsRows} />
                            </div>
                        </section>

                        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16, marginBottom: 16 }}>
                            <div className="glass-panel" style={chartPanelStyle}>
                                <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 14px' }}>오늘 현장 활동</h2>
                                <SummaryBars rows={activityRows} />
                            </div>

                            <aside className="glass-panel" style={chartPanelStyle}>
                                <h2 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 12px' }}>빠른 작업</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                                    {quickLinks.map(({ href, label, Icon }) => (
                                        <Link key={href} to={href} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#e2e8f0', textDecoration: 'none', padding: '0.75rem', borderRadius: 8, background: 'rgba(15, 23, 42, 0.5)' }}>
                                            <Icon size={17} />
                                            <span style={{ fontWeight: 800 }}>{label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </aside>
                        </section>

                        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                            <div className="glass-panel" style={chartPanelStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <h2 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0 }}>처리 대기</h2>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatDateTime(summary?.generatedAt)} 기준</span>
                                </div>

                                {topActions.length === 0 ? (
                                    <EmptyState icon="-" title="처리 대기 항목이 없습니다." description="현재 바로 처리해야 할 운영 항목이 없습니다." />
                                ) : (
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        {topActions.map((item, index) => (
                                            <Link key={`${item.type}-${item.createdAt}-${index}`} to={item.href} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, textDecoration: 'none', padding: '0.9rem', borderRadius: 8, background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ color: '#f8fafc', fontWeight: 800 }}>{item.title}</div>
                                                    <div style={{ color: '#cbd5e1', fontSize: '0.86rem', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.detail || '상세 정보 없음'}</div>
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
                                            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 3 }}>{formatDateTime(item.occurredAt)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <ParticipantEngagementSection
                            engagement={engagement}
                            filters={engagementFilters}
                            onFilterChange={setEngagementFilters}
                            onRefresh={loadEngagement}
                            loading={engagementLoading}
                        />

                        <PointRewardDashboardSection
                            pointReward={pointReward}
                            filters={engagementFilters}
                            sort={pointRewardSort}
                            onSortChange={setPointRewardSort}
                            onRefresh={loadPointReward}
                            loading={pointRewardLoading}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
