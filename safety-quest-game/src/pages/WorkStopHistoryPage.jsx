/**
 * 작업중지 이력 페이지
 *
 * - 작업중지 신고 이력 목록
 * - 상태별 필터 (신고→접수확인→조사중→해결→작업재개)
 * - 보복 방지 모니터링 현황
 * - 모든 역할(기술인/관리감독자/안전관리자)이 상태 업데이트 가능
 * - 누구든 먼저 해결하면 완료 처리
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getWorkStopReports,
    getWorkStopReportsAsync,
    getWorkStopStats,
    getWorkStopStatsAsync,
    getActiveProtections,
    getActiveProtectionsAsync,
    updateReportStatusAsync,
    createRetaliationReport,
    REPORT_STATUS,
    REPORT_STATUS_INFO,
    HAZARD_TYPES
} from '../utils/workStopManager';
import { userProfile } from '../utils/storage';

const ROLE_LABELS = {
    technician: '기술인',
    supervisor: '관리감독자',
    safetyManager: '안전관리자'
};

function WorkStopHistoryPage() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('all');
    const [protections, setProtections] = useState([]);
    const [isUpdating, setIsUpdating] = useState(null);
    // 조치 작성 폼 상태
    const [actionForm, setActionForm] = useState(null); // { reportId, nextStatus }
    const [actionPlan, setActionPlan] = useState('');
    const [actionMethod, setActionMethod] = useState('');
    const [resumeVerification, setResumeVerification] = useState('');
    const [resumeActionNote, setResumeActionNote] = useState('');
    // 보복 신고 상태
    const [showRetaliationForm, setShowRetaliationForm] = useState(null); // protectionId
    const [retaliationType, setRetaliationType] = useState('');
    const [retaliationDesc, setRetaliationDesc] = useState('');
    const [retaliationSubmitting, setRetaliationSubmitting] = useState(false);
    const role = userProfile.getRole();
    const userName = userProfile.getName() || '사용자';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // localStorage로 즉시 렌더링 (빠른 응답)
        setReports(getWorkStopReports());
        setStats(getWorkStopStats());
        setProtections(getActiveProtections());

        // API에서 최신 데이터 가져오기 (비동기)
        try {
            const [apiReports, apiStats, apiProtections] = await Promise.all([
                getWorkStopReportsAsync(),
                getWorkStopStatsAsync(),
                getActiveProtectionsAsync()
            ]);
            setReports(apiReports);
            setStats(apiStats);
            setProtections(apiProtections);
        } catch {
            // API 실패 시 localStorage 데이터 유지
        }
    };

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.status === filter);

    // 조치 작성이 필요한 상태 전환인지 확인
    const needsActionForm = (nextStatus) => {
        return nextStatus === REPORT_STATUS.RESOLVED || nextStatus === REPORT_STATUS.RESUMED;
    };

    // 상태 전환 버튼 클릭 핸들러
    const handleStatusButtonClick = (reportId, nextStatus) => {
        if (needsActionForm(nextStatus)) {
            // 조치 작성 폼 표시
            setActionForm({ reportId, nextStatus });
            setActionPlan('');
            setActionMethod('');
            setResumeVerification('');
            setResumeActionNote('');
        } else {
            // 조치 작성 불필요 - 바로 상태 업데이트
            handleStatusUpdate(reportId, nextStatus);
        }
    };

    // 조치 작성 폼 제출 (위험 해결)
    const handleActionFormSubmit = async () => {
        if (!actionForm) return;
        const { reportId, nextStatus } = actionForm;

        if (nextStatus === REPORT_STATUS.RESOLVED) {
            if (!actionPlan.trim() || !actionMethod.trim()) return;
            setIsUpdating(reportId);
            await updateReportStatusAsync(reportId, nextStatus, userName, actionPlan.trim(), {
                actionPlan: actionPlan.trim(),
                actionMethod: actionMethod.trim()
            });
        } else if (nextStatus === REPORT_STATUS.RESUMED) {
            if (!resumeVerification.trim() || !resumeActionNote.trim()) return;
            setIsUpdating(reportId);
            await updateReportStatusAsync(reportId, nextStatus, userName, resumeActionNote.trim(), {
                resumeVerification: resumeVerification.trim(),
                resumeActionNote: resumeActionNote.trim()
            });
        }

        setActionForm(null);
        await loadData();
        setIsUpdating(null);
    };

    const handleStatusUpdate = async (reportId, newStatus) => {
        setIsUpdating(reportId);
        await updateReportStatusAsync(reportId, newStatus, userName);
        await loadData();
        setIsUpdating(null);
    };

    const RETALIATION_TYPES = [
        { id: 'dismissal', label: '해고/계약 해지' },
        { id: 'demotion', label: '보직 변경/강등' },
        { id: 'pay_cut', label: '임금 삭감/수당 제외' },
        { id: 'exclusion', label: '업무 배제/따돌림' },
        { id: 'verbal', label: '폭언/위협' },
        { id: 'other', label: '기타 불이익' },
    ];

    const handleRetaliationSubmit = () => {
        if (!retaliationType || !retaliationDesc.trim()) return;
        setRetaliationSubmitting(true);
        createRetaliationReport({
            workerName: userName,
            protectionId: showRetaliationForm,
            retaliationType,
            description: retaliationDesc.trim(),
        });
        setRetaliationSubmitting(false);
        setShowRetaliationForm(null);
        setRetaliationType('');
        setRetaliationDesc('');
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
                    <span style={{
                        marginLeft: 'auto',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '12px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        {ROLE_LABELS[role] || '기술인'}
                    </span>
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

                {/* 보호 기간 안내 + 보복 신고 */}
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
                        <div style={{ color: 'rgba(203,213,225,0.7)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                            작업중지 행사 후 30일간 보복 방지 모니터링이 진행 중입니다.
                        </div>

                        {/* 보호 기간 목록 + 보복 신고 버튼 */}
                        {protections.map((p, idx) => {
                            const daysLeft = Math.max(0, Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
                            return (
                                <div key={p.reportId || idx} style={{
                                    background: 'rgba(99, 102, 241, 0.08)',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    marginBottom: idx < protections.length - 1 ? '0.5rem' : 0
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <span style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {p.workerName || userName}
                                            </span>
                                            <span style={{ color: 'rgba(203,213,225,0.5)', fontSize: '0.7rem', marginLeft: '0.5rem' }}>
                                                잔여 {daysLeft}일
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setShowRetaliationForm(
                                                showRetaliationForm === p.reportId ? null : p.reportId
                                            )}
                                            style={{
                                                padding: '0.3rem 0.625rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                                background: showRetaliationForm === p.reportId
                                                    ? 'rgba(239, 68, 68, 0.2)'
                                                    : 'rgba(239, 68, 68, 0.08)',
                                                color: '#f87171',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            🚨 보복 신고
                                        </button>
                                    </div>

                                    {/* 보복 신고 인라인 폼 */}
                                    {showRetaliationForm === p.reportId && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            padding: '0.75rem',
                                            background: 'rgba(239, 68, 68, 0.06)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(239, 68, 68, 0.2)'
                                        }}>
                                            <div style={{
                                                color: '#f87171',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                marginBottom: '0.625rem'
                                            }}>
                                                보복 유형 선택
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '0.375rem',
                                                marginBottom: '0.625rem'
                                            }}>
                                                {RETALIATION_TYPES.map(rt => (
                                                    <button
                                                        key={rt.id}
                                                        onClick={() => setRetaliationType(rt.id)}
                                                        style={{
                                                            padding: '0.3rem 0.6rem',
                                                            borderRadius: '16px',
                                                            border: retaliationType === rt.id
                                                                ? '1px solid rgba(239, 68, 68, 0.6)'
                                                                : '1px solid rgba(148,163,184,0.2)',
                                                            background: retaliationType === rt.id
                                                                ? 'rgba(239, 68, 68, 0.15)'
                                                                : 'rgba(30,27,46,0.5)',
                                                            color: retaliationType === rt.id
                                                                ? '#f87171'
                                                                : 'rgba(203,213,225,0.7)',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {rt.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={retaliationDesc}
                                                onChange={(e) => setRetaliationDesc(e.target.value)}
                                                placeholder="구체적인 상황을 설명해 주세요..."
                                                style={{
                                                    width: '100%',
                                                    minHeight: '60px',
                                                    padding: '0.5rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(148,163,184,0.2)',
                                                    background: 'rgba(15, 23, 42, 0.6)',
                                                    color: '#e2e8f0',
                                                    fontSize: '0.8rem',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                    marginBottom: '0.5rem'
                                                }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => {
                                                        setShowRetaliationForm(null);
                                                        setRetaliationType('');
                                                        setRetaliationDesc('');
                                                    }}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(148,163,184,0.2)',
                                                        background: 'transparent',
                                                        color: 'rgba(203,213,225,0.7)',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={handleRetaliationSubmit}
                                                    disabled={!retaliationType || !retaliationDesc.trim() || retaliationSubmitting}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        background: (!retaliationType || !retaliationDesc.trim())
                                                            ? 'rgba(148,163,184,0.15)'
                                                            : 'rgba(239, 68, 68, 0.2)',
                                                        color: (!retaliationType || !retaliationDesc.trim())
                                                            ? 'rgba(148,163,184,0.4)'
                                                            : '#f87171',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: (!retaliationType || !retaliationDesc.trim())
                                                            ? 'not-allowed'
                                                            : 'pointer'
                                                    }}
                                                >
                                                    {retaliationSubmitting ? '접수중...' : '🚨 보복 신고 접수'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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

                                    {/* 하단: 시간 + 신고자 + 조치 버튼 */}
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

                                        {/* 모든 역할: 다음 상태로 이동 버튼 (누구든 먼저 해결하면 완료) */}
                                        {nextStatus && (
                                            <button
                                                onClick={() => handleStatusButtonClick(report.id, nextStatus)}
                                                disabled={isUpdating === report.id}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: `${REPORT_STATUS_INFO[nextStatus].color}22`,
                                                    color: REPORT_STATUS_INFO[nextStatus].color,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    cursor: isUpdating === report.id ? 'wait' : 'pointer',
                                                    opacity: isUpdating === report.id ? 0.6 : 1
                                                }}
                                            >
                                                {isUpdating === report.id
                                                    ? '처리중...'
                                                    : `→ ${REPORT_STATUS_INFO[nextStatus].label}`
                                                }
                                            </button>
                                        )}
                                    </div>

                                    {/* 해결 정보 + 조치 내역 */}
                                    {report.resolverName && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            background: 'rgba(34, 197, 94, 0.08)',
                                            border: '1px solid rgba(34, 197, 94, 0.2)'
                                        }}>
                                            <div style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                ✅ 해결: {report.resolverName}
                                            </div>
                                            {report.actionPlan && (
                                                <div style={{ marginBottom: '0.375rem' }}>
                                                    <span style={{ color: '#86efac', fontSize: '0.7rem', fontWeight: 700 }}>조치 내용</span>
                                                    <div style={{ color: 'rgba(203,213,225,0.7)', fontSize: '0.8rem', marginTop: '0.125rem', lineHeight: 1.5 }}>
                                                        {report.actionPlan}
                                                    </div>
                                                </div>
                                            )}
                                            {report.actionMethod && (
                                                <div style={{ marginBottom: '0.375rem' }}>
                                                    <span style={{ color: '#86efac', fontSize: '0.7rem', fontWeight: 700 }}>조치 방법</span>
                                                    <div style={{ color: 'rgba(203,213,225,0.7)', fontSize: '0.8rem', marginTop: '0.125rem', lineHeight: 1.5 }}>
                                                        {report.actionMethod}
                                                    </div>
                                                </div>
                                            )}
                                            {report.resolutionNote && !report.actionPlan && (
                                                <div style={{ color: 'rgba(203,213,225,0.6)', fontSize: '0.8rem' }}>
                                                    {report.resolutionNote}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 작업 재개 확인 내역 */}
                                    {report.resumeVerification && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            background: 'rgba(20, 184, 166, 0.08)',
                                            border: '1px solid rgba(20, 184, 166, 0.2)'
                                        }}>
                                            <div style={{ color: '#2dd4bf', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                🔄 작업 재개 확인
                                            </div>
                                            <div style={{ marginBottom: '0.375rem' }}>
                                                <span style={{ color: '#5eead4', fontSize: '0.7rem', fontWeight: 700 }}>확인 사항</span>
                                                <div style={{ color: 'rgba(203,213,225,0.7)', fontSize: '0.8rem', marginTop: '0.125rem', lineHeight: 1.5 }}>
                                                    {report.resumeVerification}
                                                </div>
                                            </div>
                                            {report.resumeActionNote && (
                                                <div>
                                                    <span style={{ color: '#5eead4', fontSize: '0.7rem', fontWeight: 700 }}>조치 완료 확인</span>
                                                    <div style={{ color: 'rgba(203,213,225,0.7)', fontSize: '0.8rem', marginTop: '0.125rem', lineHeight: 1.5 }}>
                                                        {report.resumeActionNote}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 상태 이력 (최근 변경자 표시) */}
                                    {report.statusHistory && report.statusHistory.length > 1 && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            paddingTop: '0.5rem',
                                            borderTop: '1px solid rgba(148,163,184,0.1)'
                                        }}>
                                            <div style={{
                                                color: 'rgba(203,213,225,0.35)',
                                                fontSize: '0.7rem'
                                            }}>
                                                최근 조치: {report.statusHistory[report.statusHistory.length - 1].by || '시스템'}
                                                {' · '}
                                                {formatDate(report.statusHistory[report.statusHistory.length - 1].timestamp)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 조치 작성 모달 */}
            {actionForm && (
                <div
                    onClick={() => setActionForm(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '1rem'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'linear-gradient(135deg, #1e1b2e 0%, #0f172a 100%)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            width: '100%',
                            maxWidth: '420px',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            border: actionForm.nextStatus === REPORT_STATUS.RESOLVED
                                ? '1px solid rgba(34, 197, 94, 0.3)'
                                : '1px solid rgba(20, 184, 166, 0.3)'
                        }}
                    >
                        {/* 모달 헤더 */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.25rem'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.15rem',
                                fontWeight: 800,
                                color: actionForm.nextStatus === REPORT_STATUS.RESOLVED ? '#4ade80' : '#2dd4bf'
                            }}>
                                {actionForm.nextStatus === REPORT_STATUS.RESOLVED
                                    ? '✅ 위험 해결 - 조치 내용 작성'
                                    : '🔄 작업 재개 - 확인 및 조치 작성'
                                }
                            </h2>
                            <button
                                onClick={() => setActionForm(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'rgba(203,213,225,0.6)',
                                    padding: '0.375rem 0.625rem',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* 안내 문구 */}
                        <div style={{
                            background: actionForm.nextStatus === REPORT_STATUS.RESOLVED
                                ? 'rgba(34, 197, 94, 0.08)'
                                : 'rgba(20, 184, 166, 0.08)',
                            border: actionForm.nextStatus === REPORT_STATUS.RESOLVED
                                ? '1px solid rgba(34, 197, 94, 0.15)'
                                : '1px solid rgba(20, 184, 166, 0.15)',
                            borderRadius: '10px',
                            padding: '0.75rem',
                            marginBottom: '1.25rem'
                        }}>
                            <div style={{
                                color: 'rgba(203,213,225,0.8)',
                                fontSize: '0.8rem',
                                lineHeight: 1.6
                            }}>
                                {actionForm.nextStatus === REPORT_STATUS.RESOLVED
                                    ? '⚠️ 작업중지권 행사 후 위험을 해결하려면, 어떤 조치를 했는지와 어떻게 조치했는지를 반드시 작성해야 합니다.'
                                    : '⚠️ 작업을 재개하려면, 조치 사항을 확인하고 안전하게 조치가 완료되었는지 반드시 작성해야 합니다.'
                                }
                            </div>
                        </div>

                        {/* 위험 해결 폼 */}
                        {actionForm.nextStatus === REPORT_STATUS.RESOLVED && (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{
                                        display: 'block',
                                        color: '#86efac',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        marginBottom: '0.5rem'
                                    }}>
                                        📋 어떤 조치를 했는지 <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <textarea
                                        value={actionPlan}
                                        onChange={(e) => setActionPlan(e.target.value)}
                                        placeholder="예: 추락 방지 안전망 설치, 위험 구역 바리케이드 설치, 불량 자재 교체 등"
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: actionPlan.trim()
                                                ? '1px solid rgba(34, 197, 94, 0.3)'
                                                : '1px solid rgba(239, 68, 68, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            color: '#e2e8f0',
                                            fontSize: '0.85rem',
                                            resize: 'vertical',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            lineHeight: 1.5
                                        }}
                                    />
                                    {!actionPlan.trim() && (
                                        <div style={{ color: '#f87171', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                            조치 내용을 반드시 입력해 주세요
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{
                                        display: 'block',
                                        color: '#86efac',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        marginBottom: '0.5rem'
                                    }}>
                                        🔧 어떻게 조치했는지 <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <textarea
                                        value={actionMethod}
                                        onChange={(e) => setActionMethod(e.target.value)}
                                        placeholder="예: 안전관리자 입회 하에 안전망 3개소 설치 완료, 위험 구역 출입 통제 후 바리케이드 설치, 자재 검수 후 교체 완료 등"
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: actionMethod.trim()
                                                ? '1px solid rgba(34, 197, 94, 0.3)'
                                                : '1px solid rgba(239, 68, 68, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            color: '#e2e8f0',
                                            fontSize: '0.85rem',
                                            resize: 'vertical',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            lineHeight: 1.5
                                        }}
                                    />
                                    {!actionMethod.trim() && (
                                        <div style={{ color: '#f87171', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                            조치 방법을 반드시 입력해 주세요
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* 작업 재개 폼 */}
                        {actionForm.nextStatus === REPORT_STATUS.RESUMED && (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{
                                        display: 'block',
                                        color: '#5eead4',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        marginBottom: '0.5rem'
                                    }}>
                                        🔍 확인 사항 <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <textarea
                                        value={resumeVerification}
                                        onChange={(e) => setResumeVerification(e.target.value)}
                                        placeholder="예: 안전망 설치 상태 확인, 바리케이드 견고성 확인, 전기 차단기 복구 확인, 작업자 안전교육 재실시 등"
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: resumeVerification.trim()
                                                ? '1px solid rgba(20, 184, 166, 0.3)'
                                                : '1px solid rgba(239, 68, 68, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            color: '#e2e8f0',
                                            fontSize: '0.85rem',
                                            resize: 'vertical',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            lineHeight: 1.5
                                        }}
                                    />
                                    {!resumeVerification.trim() && (
                                        <div style={{ color: '#f87171', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                            확인 사항을 반드시 입력해 주세요
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{
                                        display: 'block',
                                        color: '#5eead4',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        marginBottom: '0.5rem'
                                    }}>
                                        ✅ 조치 완료 확인 내용 <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <textarea
                                        value={resumeActionNote}
                                        onChange={(e) => setResumeActionNote(e.target.value)}
                                        placeholder="예: 상기 조치 사항 모두 이행 확인 완료, 안전관리자 현장 점검 완료, 작업자 전원 안전 브리핑 완료 후 재개 승인 등"
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: resumeActionNote.trim()
                                                ? '1px solid rgba(20, 184, 166, 0.3)'
                                                : '1px solid rgba(239, 68, 68, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            color: '#e2e8f0',
                                            fontSize: '0.85rem',
                                            resize: 'vertical',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            lineHeight: 1.5
                                        }}
                                    />
                                    {!resumeActionNote.trim() && (
                                        <div style={{ color: '#f87171', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                            조치 완료 확인 내용을 반드시 입력해 주세요
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* 버튼 영역 */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setActionForm(null)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(148,163,184,0.2)',
                                    background: 'transparent',
                                    color: 'rgba(203,213,225,0.7)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleActionFormSubmit}
                                disabled={
                                    isUpdating === actionForm.reportId ||
                                    (actionForm.nextStatus === REPORT_STATUS.RESOLVED && (!actionPlan.trim() || !actionMethod.trim())) ||
                                    (actionForm.nextStatus === REPORT_STATUS.RESUMED && (!resumeVerification.trim() || !resumeActionNote.trim()))
                                }
                                style={{
                                    flex: 2,
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: (
                                        (actionForm.nextStatus === REPORT_STATUS.RESOLVED && actionPlan.trim() && actionMethod.trim()) ||
                                        (actionForm.nextStatus === REPORT_STATUS.RESUMED && resumeVerification.trim() && resumeActionNote.trim())
                                    )
                                        ? actionForm.nextStatus === REPORT_STATUS.RESOLVED
                                            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                            : 'linear-gradient(135deg, #14b8a6, #0d9488)'
                                        : 'rgba(148,163,184,0.15)',
                                    color: (
                                        (actionForm.nextStatus === REPORT_STATUS.RESOLVED && actionPlan.trim() && actionMethod.trim()) ||
                                        (actionForm.nextStatus === REPORT_STATUS.RESUMED && resumeVerification.trim() && resumeActionNote.trim())
                                    )
                                        ? '#ffffff'
                                        : 'rgba(148,163,184,0.4)',
                                    fontSize: '0.9rem',
                                    fontWeight: 800,
                                    cursor: (
                                        (actionForm.nextStatus === REPORT_STATUS.RESOLVED && actionPlan.trim() && actionMethod.trim()) ||
                                        (actionForm.nextStatus === REPORT_STATUS.RESUMED && resumeVerification.trim() && resumeActionNote.trim())
                                    )
                                        ? 'pointer'
                                        : 'not-allowed',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {isUpdating === actionForm.reportId
                                    ? '처리중...'
                                    : actionForm.nextStatus === REPORT_STATUS.RESOLVED
                                        ? '✅ 조치 완료 및 위험 해결'
                                        : '🔄 확인 완료 및 작업 재개'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkStopHistoryPage;
