import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    initMockData,
    getHazardReports,
    getZoneStats,
    getHeatmapData,
    getHazardTypes,
    getZones,
    getTimelineTrend,
    SEVERITY_LABELS,
    SEVERITY_COLORS,
} from '../utils/heatmapManager';

// ── 인텐시티 → 색상 변환 (green → yellow → orange → red) ────
function intensityToColor(intensity, alpha = 1) {
    // 0.0 = 안전(녹색)  →  1.0 = 위험(빨간색)
    const clamped = Math.max(0, Math.min(1, intensity));
    let r, g, b;

    if (clamped < 0.33) {
        // green → yellow
        const t = clamped / 0.33;
        r = Math.round(34 + (234 - 34) * t);
        g = Math.round(197 + (179 - 197) * t);
        b = Math.round(94 + (8 - 94) * t);
    } else if (clamped < 0.66) {
        // yellow → orange
        const t = (clamped - 0.33) / 0.33;
        r = Math.round(234 + (249 - 234) * t);
        g = Math.round(179 + (115 - 179) * t);
        b = Math.round(8 + (22 - 8) * t);
    } else {
        // orange → red
        const t = (clamped - 0.66) / 0.34;
        r = Math.round(249 + (239 - 249) * t);
        g = Math.round(115 + (68 - 115) * t);
        b = Math.round(22 + (68 - 22) * t);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function intensityLabel(intensity) {
    if (intensity === 0) return '안전';
    if (intensity < 0.33) return '양호';
    if (intensity < 0.66) return '주의';
    return '위험';
}

// ── 스타일 상수 ──────────────────────────────────────────────
const S = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#e2e8f0',
        paddingBottom: '3rem',
    },
    container: {
        maxWidth: '960px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.4rem 0.85rem',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#94a3b8',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: 500,
        marginBottom: '1.25rem',
    },
    header: {
        marginBottom: '1.5rem',
    },
    title: {
        margin: 0,
        fontSize: '1.6rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #f87171 0%, #fb923c 50%, #fbbf24 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    subtitle: {
        margin: '0.3rem 0 0',
        color: '#64748b',
        fontSize: '0.85rem',
    },
    filterBar: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1.5rem',
    },
    select: {
        padding: '0.45rem 0.8rem',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: '#e2e8f0',
        fontSize: '0.82rem',
        fontWeight: 500,
        outline: 'none',
        cursor: 'pointer',
        minWidth: '100px',
    },
    card: {
        borderRadius: '14px',
        padding: '1.25rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '1rem',
    },
    sectionTitle: {
        margin: '0 0 0.75rem',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#e2e8f0',
    },
};

// ── 서브 컴포넌트 ────────────────────────────────────────────

/** 구역 카드 (히트맵 셀) */
function ZoneCard({ data, zone, isSelected, onClick }) {
    const bgColor = data.reportCount > 0
        ? intensityToColor(data.intensity, 0.18)
        : 'rgba(34, 197, 94, 0.08)';
    const borderColor = data.reportCount > 0
        ? intensityToColor(data.intensity, 0.4)
        : 'rgba(34, 197, 94, 0.2)';

    return (
        <div
            onClick={onClick}
            style={{
                borderRadius: '14px',
                padding: '1rem',
                background: bgColor,
                border: isSelected
                    ? `2px solid ${intensityToColor(data.intensity, 0.9)}`
                    : `1px solid ${borderColor}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            {/* 구역명 */}
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {zone.name}
            </div>

            {/* 설명 */}
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.6rem' }}>
                {zone.description}
            </div>

            {/* 하단: 건수 + 상태 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        color: data.reportCount > 0 ? intensityToColor(data.intensity, 1) : '#22c55e',
                    }}>
                        {data.reportCount}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>건</span>
                </div>

                {/* 미해결 배지 */}
                {data.unresolvedCount > 0 && (
                    <span style={{
                        background: 'rgba(239, 68, 68, 0.25)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '8px',
                    }}>
                        미해결 {data.unresolvedCount}
                    </span>
                )}
            </div>

            {/* 인텐시티 라벨 */}
            <div style={{
                position: 'absolute',
                top: '0.6rem',
                right: '0.7rem',
                fontSize: '0.6rem',
                fontWeight: 600,
                color: data.reportCount > 0 ? intensityToColor(data.intensity, 0.9) : '#22c55e',
                background: 'rgba(0,0,0,0.3)',
                padding: '0.1rem 0.35rem',
                borderRadius: '6px',
            }}>
                {intensityLabel(data.intensity)}
            </div>
        </div>
    );
}

/** 심각도 미니 바 차트 */
function SeverityBar({ breakdown }) {
    const total = Object.values(breakdown).reduce((s, v) => s + v, 0) || 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {Object.entries(breakdown).map(([level, count]) => (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                        width: '42px',
                        fontSize: '0.7rem',
                        color: SEVERITY_COLORS[level],
                        fontWeight: 600,
                        textAlign: 'right',
                    }}>
                        {SEVERITY_LABELS[level]}
                    </span>
                    <div style={{
                        flex: 1,
                        height: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '5px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${(count / total) * 100}%`,
                            height: '100%',
                            background: SEVERITY_COLORS[level],
                            borderRadius: '5px',
                            transition: 'width 0.4s ease',
                        }} />
                    </div>
                    <span style={{ width: '20px', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right' }}>
                        {count}
                    </span>
                </div>
            ))}
        </div>
    );
}

/** 트렌드 바 차트 */
function TrendChart({ data, period }) {
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div style={{ ...S.card }}>
            <h3 style={S.sectionTitle}>
                📈 신고 추이 ({period === '1w' ? '최근 7일' : period === '1m' ? '최근 4주' : '최근 3개월'})
            </h3>
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '0.4rem',
                height: '120px',
                padding: '0.5rem 0',
            }}>
                {data.map((item, idx) => (
                    <div key={idx} style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end',
                    }}>
                        {/* 건수 라벨 */}
                        <span style={{
                            fontSize: '0.65rem',
                            color: '#94a3b8',
                            marginBottom: '0.2rem',
                            fontWeight: 600,
                        }}>
                            {item.count}
                        </span>
                        {/* 바 */}
                        <div style={{
                            width: '100%',
                            maxWidth: '42px',
                            height: `${Math.max((item.count / maxCount) * 80, 4)}%`,
                            background: item.count > 0
                                ? `linear-gradient(180deg, ${intensityToColor(item.count / maxCount, 0.8)} 0%, ${intensityToColor(item.count / maxCount, 0.4)} 100%)`
                                : 'rgba(255,255,255,0.05)',
                            borderRadius: '6px 6px 2px 2px',
                            transition: 'height 0.4s ease',
                            minHeight: '4px',
                        }} />
                        {/* 라벨 */}
                        <span style={{
                            fontSize: '0.6rem',
                            color: '#64748b',
                            marginTop: '0.3rem',
                            whiteSpace: 'nowrap',
                        }}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** 요약 통계 카드 */
function SummaryStats({ reports, zoneStats }) {
    const totalReports = reports.length;
    const unresolvedCount = reports.filter(r => !r.resolved).length;

    // 가장 위험한 구역
    const sorted = [...zoneStats].sort((a, b) => b.totalReports - a.totalReports);
    const mostDangerous = sorted[0];

    // 최근 7일 vs 그 이전 7일 비교 → 트렌드
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentWeek = reports.filter(r => new Date(r.reportedAt) >= weekAgo).length;
    const prevWeek = reports.filter(r => {
        const d = new Date(r.reportedAt);
        return d >= twoWeeksAgo && d < weekAgo;
    }).length;

    const trendUp = recentWeek > prevWeek;
    const trendSame = recentWeek === prevWeek;

    const statItems = [
        {
            label: '전체 신고',
            value: totalReports,
            unit: '건',
            icon: '📋',
            color: '#60a5fa',
        },
        {
            label: '미해결',
            value: unresolvedCount,
            unit: '건',
            icon: '🔴',
            color: unresolvedCount > 0 ? '#f87171' : '#22c55e',
        },
        {
            label: '최다 위험 구역',
            value: mostDangerous?.zoneName || '-',
            unit: mostDangerous ? `${mostDangerous.totalReports}건` : '',
            icon: '🏗️',
            color: '#fb923c',
        },
        {
            label: '주간 추세',
            value: trendSame ? '동일' : trendUp ? '증가' : '감소',
            unit: trendSame ? '-' : `${Math.abs(recentWeek - prevWeek)}건`,
            icon: trendUp ? '📈' : trendSame ? '➡️' : '📉',
            color: trendUp ? '#f87171' : trendSame ? '#94a3b8' : '#22c55e',
        },
    ];

    return (
        <div style={{ ...S.card }}>
            <h3 style={S.sectionTitle}>📊 요약 통계</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                {statItems.map((item, idx) => (
                    <div key={idx} style={{
                        padding: '0.7rem 0.8rem',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '0.85rem' }}>{item.icon}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>{item.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: item.color }}>
                                {item.value}
                            </span>
                            {item.unit && (
                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.unit}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** 구역 상세 패널 */
function ZoneDetail({ zone, stats, reports, hazardTypes }) {
    const recentReports = reports
        .filter(r => r.zone === zone.id)
        .slice(0, 5);

    const typeMap = {};
    hazardTypes.forEach(t => { typeMap[t.id] = t; });

    return (
        <div style={{
            ...S.card,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${intensityToColor(stats.totalReports > 0 ? 0.5 : 0, 0.3)}`,
        }}>
            {/* 구역 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#e2e8f0' }}>
                        {zone.name} 상세
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{zone.description}</span>
                </div>
                {stats.mostCommonType && typeMap[stats.mostCommonType] && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.6rem', borderRadius: '8px',
                    }}>
                        <span style={{ fontSize: '0.85rem' }}>{typeMap[stats.mostCommonType].icon}</span>
                        <span style={{ fontSize: '0.7rem', color: typeMap[stats.mostCommonType].color, fontWeight: 600 }}>
                            주요: {typeMap[stats.mostCommonType].label}
                        </span>
                    </div>
                )}
            </div>

            {/* 2열 레이아웃: 심각도 바 + 최근 신고 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* 심각도 분포 */}
                <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem' }}>
                        심각도 분포
                    </div>
                    <SeverityBar breakdown={stats.severityBreakdown} />
                </div>

                {/* 최근 신고 목록 */}
                <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem' }}>
                        최근 신고 ({recentReports.length}건)
                    </div>
                    {recentReports.length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>
                            해당 기간 신고 없음
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {recentReports.map(report => {
                                const hType = typeMap[report.type];
                                const d = new Date(report.reportedAt);
                                const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;

                                return (
                                    <div key={report.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.35rem 0.5rem',
                                        borderRadius: '8px',
                                        background: 'rgba(0,0,0,0.2)',
                                        fontSize: '0.72rem',
                                    }}>
                                        <span>{hType?.icon || '⚠️'}</span>
                                        <span style={{
                                            flex: 1,
                                            color: '#cbd5e1',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {report.description}
                                        </span>
                                        <span style={{
                                            color: SEVERITY_COLORS[report.severity],
                                            fontWeight: 600,
                                            fontSize: '0.62rem',
                                            flexShrink: 0,
                                        }}>
                                            {SEVERITY_LABELS[report.severity]}
                                        </span>
                                        <span style={{ color: '#475569', flexShrink: 0, fontSize: '0.62rem' }}>
                                            {dateStr}
                                        </span>
                                        {!report.resolved && (
                                            <span style={{
                                                width: '6px', height: '6px', borderRadius: '50%',
                                                background: '#ef4444', flexShrink: 0,
                                            }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── 메인 페이지 컴포넌트 ─────────────────────────────────────
function HazardHeatmapPage() {
    const [period, setPeriod] = useState('3m');
    const [typeFilter, setTypeFilter] = useState('all');
    const [zoneFilter, setZoneFilter] = useState('all');
    const [selectedZone, setSelectedZone] = useState(null);

    const [reports, setReports] = useState([]);
    const [heatmap, setHeatmap] = useState([]);
    const [zoneStats, setZoneStats] = useState([]);
    const [trend, setTrend] = useState([]);

    const hazardTypes = getHazardTypes();
    const zones = getZones();

    // 초기 Mock 데이터 + 데이터 로드
    useEffect(() => {
        initMockData();
    }, []);

    useEffect(() => {
        const filters = { period, type: typeFilter, zone: zoneFilter };
        setReports(getHazardReports(filters));
        setHeatmap(getHeatmapData(filters));
        setZoneStats(getZoneStats(filters));
        setTrend(getTimelineTrend(period));
    }, [period, typeFilter, zoneFilter]);

    const handleZoneClick = (zoneId) => {
        setSelectedZone(prev => prev === zoneId ? null : zoneId);
    };

    const selectedZoneObj = zones.find(z => z.id === selectedZone);
    const selectedZoneStat = zoneStats.find(s => s.zoneId === selectedZone);

    return (
        <div style={S.page}>
            <div style={S.container}>
                {/* 뒤로가기 */}
                <Link to="/" style={S.backLink}>
                    ← 대시보드
                </Link>

                {/* 헤더 */}
                <div style={S.header}>
                    <h1 style={S.title}>{'🗺️ 위험 히트맵'}</h1>
                    <p style={S.subtitle}>현장 구역별 위험 신고 밀도를 한눈에 파악하세요</p>
                </div>

                {/* 필터 바 */}
                <div style={S.filterBar}>
                    <select
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                        style={S.select}
                    >
                        <option value="1w">1주</option>
                        <option value="1m">1달</option>
                        <option value="3m">3달</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        style={S.select}
                    >
                        <option value="all">전체 유형</option>
                        {hazardTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                        ))}
                    </select>

                    <select
                        value={zoneFilter}
                        onChange={e => setZoneFilter(e.target.value)}
                        style={S.select}
                    >
                        <option value="all">전체 구역</option>
                        {zones.map(z => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                    </select>
                </div>

                {/* 히트맵 그리드 (3열 × 2행) */}
                <div style={{ ...S.card, padding: '1rem' }}>
                    <h3 style={S.sectionTitle}>🏗️ 현장 구역 히트맵</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.6rem',
                    }}>
                        {zones.map(zone => {
                            const data = heatmap.find(h => h.zoneId === zone.id) || {
                                intensity: 0, reportCount: 0, unresolvedCount: 0,
                            };
                            return (
                                <ZoneCard
                                    key={zone.id}
                                    zone={zone}
                                    data={data}
                                    isSelected={selectedZone === zone.id}
                                    onClick={() => handleZoneClick(zone.id)}
                                />
                            );
                        })}
                    </div>

                    {/* 범례 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        marginTop: '0.8rem',
                        fontSize: '0.65rem',
                        color: '#64748b',
                    }}>
                        <span>안전</span>
                        <div style={{
                            width: '120px',
                            height: '8px',
                            borderRadius: '4px',
                            background: 'linear-gradient(90deg, rgba(34,197,94,0.7), rgba(234,179,8,0.7), rgba(249,115,22,0.7), rgba(239,68,68,0.7))',
                        }} />
                        <span>위험</span>
                    </div>
                </div>

                {/* 선택된 구역 상세 */}
                {selectedZoneObj && selectedZoneStat && (
                    <ZoneDetail
                        zone={selectedZoneObj}
                        stats={selectedZoneStat}
                        reports={reports}
                        hazardTypes={hazardTypes}
                    />
                )}

                {/* 요약 통계 */}
                <SummaryStats reports={reports} zoneStats={zoneStats} />

                {/* 트렌드 차트 */}
                <TrendChart data={trend} period={period} />
            </div>
        </div>
    );
}

export default HazardHeatmapPage;
