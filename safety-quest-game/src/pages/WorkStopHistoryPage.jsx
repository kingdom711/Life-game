/**
 * 작업중지 이력 페이지
 *
 * 계획서 2-3, 2-6:
 * - 작업중지 신고 이력 목록
 * - 상태별 필터 (신고→접수확인→조사중→해결→작업재개)
 * - 보복 방지 모니터링 현황
 * - 관리감독자/안전관리자의 상태 업데이트 기능
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getWorkStopReports,
    getWorkStopStats,
    getActiveProtections,
    updateReportStatus,
    REPORT_STATUS,
    REPORT_STATUS_INFO,
    HAZARD_TYPES
} from '../utils/workStopManager';
import { userProfile } from '../utils/storage';

function WorkStopHistoryPage() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('all');
    const [protections, setProtections] = useState([]);
    const role = userProfile.getRole();
    const isAdmin = role === 'supervisor' || role === 'safetyManager';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setReports(getWorkStopReports());
        setStats(getWorkStopStats());
        setProtections(getActiveProtections());
    };

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.status === filter);

    const handleStatusUpdate = (reportId, newStatus) => {
        const updaterName = userProfile.getName() || '관리자';
        updateReportStatus(reportId, newStatus, updaterName);
        loadData();
    };

    const getNextStatus = (currentStatus) => {
        const flow = [REPORT_STATUS.REPORTED, REPORT_STATUS.CONFIRMED, REPORT_STATUS.INVESTIGATING, REPORT_STATUS.RESOLVED, REPORT_STATUS.RESUMED];
        const idx = flow.indexOf(currentStatus);
        return idx < flow.length - 1 ? flow[idx + 1] : null;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('ko-KR', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="page" style={{ paddingBottom: '120px' }}>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* 헤더 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    paddingTop: '1rem'
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'rgba(203,213,225,0.8)',
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        ←
                    </button>
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ✋ 작업중지 이력
                    </h1>
                </div>

                {/* 통계 카드 */}
                {stats && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        {[
                            { label: '총 신고', value: stats.totalReports, icon: '🚨', color: '#ef4444' },
                            { label: '해결률', value: `${stats.resolutionRate}%`, icon: '✅', color: '#22c55e' },
                            { label: '평균 대응', value: `${stats.avgResponseTime}분`, icon: '⏱️', color: '#3b82f6' }
                        ].map((stat, i) => (
                            <div key={i} style={{
                                background: 'rgba(30, 27, 46, 0.8)',
                                border: `1px solid ${stat.color}33`,
                                borderRadius: '12px',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.25rem' }}>{stat.icon}</div>
                                <div style={{ color: stat.color, fontSize: '1.25rem', fontWeight: 800 }}>
                                    {stat.value}
                                </div>
                                <div style={{ color: 'rgba(203,213,225,0.6)', fontSize: '0.7rem' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 보호 기간 안내 */}
                {protections.length > 0 && (
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            color: '#818cf8',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            🛡️ 보호 기간 활성 ({protections.length}건)
                        </div>
                        <div style={{ color: 'rgba(203,213,225,0.7)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                            작업중지 행사 후 30일간 보복 방지 모니터링이 진행 중입니다.
                            불이익 발생 시 앱 내에서 즉시 보복 신고가 가능합니다.
                        </div>
                    </div>
                )}

                {/* 필터 */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    overflowX: 'auto',
                    paddingBottom: '0.25rem'
                }}>
                    {[
                        { key: 'all', label: '전체' },
                        ...Object.entries(REPORT_STATUS_INFO).map(([key, info]) => ({
                            key, label: `${info.icon} ${info.label}`
                        }))
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            style={{
                                padding: '0.5rem 0.875rem',
                                borderRadius: '20px',
                                border: filter === f.key ? '1px solid rgba(220,38,38,0.5)' : '1px solid rgba(148,163,184,0.2)',
                                background: filter === f.key ? 'rgba(220,38,38,0.15)' : 'rgba(30,27,46,0.5)',
                                color: filter === f.key ? '#f87171' : 'rgba(203,213,225,0.7)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* 신고 목록 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredReports.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem 1rem',
                            color: 'rgba(203,213,225,0.5)',
                            fontSize: '0.9rem'
                        }}>
                            {filter === 'all' ? '작업중지 신고 이력이 없습니다.' : '해당 상태의 신고가 없습니다.'}
                        </div>
                    ) : (
                        filteredReports.map(report => {
                            const statusInfo = REPORT_STATUS_INFO[report.status];
                            const hazardInfo = HAZARD_TYPES.find(h => h.id === report.hazardType);
                            const nextStatus = getNextStatus(report.status);

                            return (
                                <div
                                    key={report.id}
                                    style={{
                                        background: 'rgba(30, 27, 46, 0.8)',
                                        border: `1px solid ${statusInfo.color}33`,
                                        borderRadius: '14px',
                                        padding: '1.25rem',
                                        borderLeft: `4px solid ${statusInfo.color}`
                                    }}
                                >
                                    {/* 상단: 유형 + 상태 */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{ fontSize: '1.25rem' }}>
                                                {hazardInfo?.icon || '🔶'}
                                            </span>
                                            <span style={{
                                                color: 'rgba(203,213,225,0.9)',
                                                fontWeight: 700,
                                                fontSize: '1rem'
                                            }}>
                                                {report.hazardLabel}
                                            </span>
                                            {report.zone && (
                                                <span style={{
                                                    color: 'rgba(203,213,225,0.5)',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    · {report.zone}
                                                </span>
                                            )}
                                        </div>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            background: `${statusInfo.color}22`,
                                            color: statusInfo.color,
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}>
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* 설명 */}
                                    {report.description && (
                                        <p style={{
                                            margin: '0 0 0.75rem 0',
                                            color: 'rgba(203,213,225,0.7)',
                                            fontSize: '0.85rem',
                                            lineHeight: 1.5
                                        }}>
                                            {report.description}
                                        </p>
                                    )}

                                    {/* 하단: 시간 + 신고자 */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{
                                            color: 'rgba(203,213,225,0.4)',
                                            fontSize: '0.75rem'
                                        }}>
                                            {formatDate(report.createdAt)} · {report.reporterName}
                                        </span>

                                        {/* 관리자: 다음 상태로 이동 버튼 */}
                                        {isAdmin && nextStatus && (
                                            <button
                                                onClick={() => handleStatusUpdate(report.id, nextStatus)}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: `${REPORT_STATUS_INFO[nextStatus].color}22`,
                                                    color: REPORT_STATUS_INFO[nextStatus].color,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                → {REPORT_STATUS_INFO[nextStatus].label}
                                            </button>
                                        )}
                                    </div>

                                    {/* 해결 정보 */}
                                    {report.resolverName && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            background: 'rgba(34, 197, 94, 0.08)',
                                            border: '1px solid rgba(34, 197, 94, 0.2)'
                                        }}>
                                            <div style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>
                                                ✅ 해결: {report.resolverName}
                                            </div>
                                            {report.resolutionNote && (
                                                <div style={{ color: 'rgba(203,213,225,0.6)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                    {report.resolutionNote}
                                                </div>
                                            )}
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

export default WorkStopHistoryPage;
