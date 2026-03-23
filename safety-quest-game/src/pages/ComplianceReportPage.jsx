import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    generateMonthlyReport,
    getAvailableMonths,
    getComplianceScore
} from '../utils/complianceReportManager';

/**
 * 컴플라이언스 리포트 페이지
 * 중대재해처벌법 대응 안전 관리 보고서
 */
const ComplianceReportPage = () => {
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
    const [report, setReport] = useState(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const months = getAvailableMonths();
        setAvailableMonths(months);
        if (months.length > 0) {
            loadReport(months[0].year, months[0].month);
        }
    }, []);

    const loadReport = (year, month) => {
        const generated = generateMonthlyReport(year, month);
        setReport(generated);
        setScore(getComplianceScore(generated));
    };

    const handleMonthChange = (e) => {
        const index = parseInt(e.target.value);
        setSelectedMonthIndex(index);
        const selected = availableMonths[index];
        if (selected) {
            loadReport(selected.year, selected.month);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    /**
     * 점수에 따른 색상
     */
    const getScoreColor = (s) => {
        if (s >= 80) return '#10b981';
        if (s >= 60) return '#fbbf24';
        return '#ef4444';
    };

    /**
     * 점수에 따른 등급 텍스트
     */
    const getScoreGrade = (s) => {
        if (s >= 90) return '매우 우수';
        if (s >= 80) return '우수';
        if (s >= 70) return '양호';
        if (s >= 60) return '보통';
        if (s >= 40) return '미흡';
        return '심각';
    };

    /**
     * 심각도 라벨 (한글)
     */
    const getSeverityLabel = (severity) => {
        const labels = {
            'high': '고위험',
            'medium': '중위험',
            'low': '저위험'
        };
        return labels[severity] || severity;
    };

    /**
     * 심각도 색상
     */
    const getSeverityColor = (severity) => {
        const colors = {
            'high': '#ef4444',
            'medium': '#f59e0b',
            'low': '#10b981'
        };
        return colors[severity] || '#64748b';
    };

    if (!report) {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
                        리포트를 불러오는 중...
                    </p>
                </div>
            </div>
        );
    }

    const scoreColor = getScoreColor(score);

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* 뒤로가기 */}
                <Link to="/" style={styles.backButton}>
                    <span>&larr;</span> 대시보드로 돌아가기
                </Link>

                {/* 헤더 */}
                <div style={styles.headerSection}>
                    <h1 style={styles.pageTitle}>
                        <span role="img" aria-label="chart">📊</span> 컴플라이언스 리포트
                    </h1>
                    <p style={styles.subtitle}>중대재해처벌법 대응 안전 관리 보고서</p>
                </div>

                {/* 월 선택 + 인쇄 */}
                <div style={styles.controlBar}>
                    <select
                        value={selectedMonthIndex}
                        onChange={handleMonthChange}
                        style={styles.monthSelect}
                    >
                        {availableMonths.map((m, index) => (
                            <option key={index} value={index}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <button
                        style={styles.printBtn}
                        onClick={handlePrint}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                        }}
                    >
                        <span role="img" aria-label="print">🖨️</span> 인쇄 / 내보내기
                    </button>
                </div>

                {/* 1. 종합 점수 */}
                <div style={{ ...styles.card, borderColor: `${scoreColor}40` }}>
                    <h3 style={styles.cardTitle}>종합 컴플라이언스 점수</h3>
                    <div style={styles.scoreContainer}>
                        <div style={{
                            ...styles.scoreCircle,
                            borderColor: scoreColor,
                            boxShadow: `0 0 30px ${scoreColor}40`
                        }}>
                            <span style={{ ...styles.scoreNumber, color: scoreColor }}>
                                {score}
                            </span>
                            <span style={styles.scoreUnit}>/ 100</span>
                        </div>
                        <div style={styles.scoreInfo}>
                            <span style={{
                                ...styles.gradeLabel,
                                color: scoreColor,
                                background: `${scoreColor}15`,
                                border: `1px solid ${scoreColor}40`
                            }}>
                                {getScoreGrade(score)}
                            </span>
                            <p style={styles.scorePeriod}>
                                {report.period.year}년 {report.period.month}월 ({report.period.startDate} ~ {report.period.endDate})
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. 안전 교육 이수 현황 */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>
                        <span role="img" aria-label="education">📚</span> 안전 교육 이수 현황
                    </h3>
                    <div style={styles.statRow}>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>이수 / 필수</span>
                            <span style={styles.statValue}>
                                {report.education.completed} / {report.education.totalRequired}
                            </span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>이수율</span>
                            <span style={{
                                ...styles.statValue,
                                color: report.education.rate >= 80 ? '#10b981' : report.education.rate >= 60 ? '#fbbf24' : '#ef4444'
                            }}>
                                {report.education.rate}%
                            </span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>누적 법정시간</span>
                            <span style={styles.statValue}>
                                {report.education.cumulativeLegalHours.toFixed(1)}h
                            </span>
                        </div>
                    </div>
                    {/* 이수율 바 */}
                    <div style={styles.progressBarContainer}>
                        <div style={{
                            ...styles.progressBar,
                            width: `${Math.min(report.education.rate, 100)}%`,
                            background: report.education.rate >= 80 ? '#10b981' : report.education.rate >= 60 ? '#fbbf24' : '#ef4444'
                        }} />
                    </div>
                </div>

                {/* 3. 위험성 평가 실시 기록 */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>
                        <span role="img" aria-label="assessment">🔍</span> 위험성 평가 실시 기록
                    </h3>
                    <div style={styles.statRow}>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>평가 실시</span>
                            <span style={styles.statValue}>{report.riskAssessment.totalConducted}건</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>발견 사항</span>
                            <span style={styles.statValue}>{report.riskAssessment.findings}건</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>해결 완료</span>
                            <span style={{
                                ...styles.statValue,
                                color: report.riskAssessment.resolvedRate >= 70 ? '#10b981' : '#f59e0b'
                            }}>
                                {report.riskAssessment.resolvedCount}건 ({report.riskAssessment.resolvedRate}%)
                            </span>
                        </div>
                    </div>
                    {/* 해결율 바 */}
                    <div style={styles.progressBarContainer}>
                        <div style={{
                            ...styles.progressBar,
                            width: `${Math.min(report.riskAssessment.resolvedRate, 100)}%`,
                            background: report.riskAssessment.resolvedRate >= 70 ? '#10b981' : '#f59e0b'
                        }} />
                    </div>
                </div>

                {/* 4. 작업중지권 행사 이력 */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>
                        <span role="img" aria-label="stop">🛑</span> 작업중지권 행사 이력
                    </h3>
                    <div style={styles.statRow}>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>행사 건수</span>
                            <span style={{ ...styles.statValue, fontSize: '1.8rem' }}>
                                {report.workStopHistory.totalExercised}건
                            </span>
                        </div>
                    </div>
                    {report.workStopHistory.details.length > 0 && (
                        <div style={styles.detailList}>
                            {report.workStopHistory.details.map((detail, idx) => (
                                <div key={detail.id || idx} style={styles.detailItem}>
                                    <span style={styles.detailBullet}>
                                        <span role="img" aria-label="warning">⚠️</span>
                                    </span>
                                    <div style={styles.detailContent}>
                                        <span style={styles.detailTitle}>
                                            [{detail.hazardType}] {detail.zone}
                                        </span>
                                        <span style={styles.detailDesc}>{detail.description}</span>
                                    </div>
                                    <span style={{
                                        ...styles.statusBadge,
                                        background: detail.status === 'resolved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                        color: detail.status === 'resolved' ? '#10b981' : '#f59e0b'
                                    }}>
                                        {detail.status === 'resolved' ? '해결' : '진행중'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 5. 안전 점검 체크리스트 수행 이력 */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>
                        <span role="img" aria-label="checklist">📋</span> 안전 점검 체크리스트 수행 이력
                    </h3>
                    <div style={styles.statRow}>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>제출 / 필수</span>
                            <span style={styles.statValue}>
                                {report.checklistCompliance.submitted} / {report.checklistCompliance.totalRequired}
                            </span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>수행률</span>
                            <span style={{
                                ...styles.statValue,
                                color: report.checklistCompliance.rate >= 80 ? '#10b981' : report.checklistCompliance.rate >= 60 ? '#fbbf24' : '#ef4444'
                            }}>
                                {report.checklistCompliance.rate}%
                            </span>
                        </div>
                    </div>
                    <div style={styles.progressBarContainer}>
                        <div style={{
                            ...styles.progressBar,
                            width: `${Math.min(report.checklistCompliance.rate, 100)}%`,
                            background: report.checklistCompliance.rate >= 80 ? '#10b981' : report.checklistCompliance.rate >= 60 ? '#fbbf24' : '#ef4444'
                        }} />
                    </div>
                </div>

                {/* 6. 사고/아차사고 통계 */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>
                        <span role="img" aria-label="incident">⚡</span> 사고 / 아차사고 통계
                    </h3>
                    <div style={styles.statRow}>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>총 건수</span>
                            <span style={{ ...styles.statValue, fontSize: '1.8rem', color: '#ef4444' }}>
                                {report.incidentStats.total}건
                            </span>
                        </div>
                    </div>

                    {/* 유형별 막대 차트 */}
                    <div style={styles.chartSection}>
                        <h4 style={styles.chartTitle}>유형별 분포</h4>
                        {Object.entries(report.incidentStats.byType).map(([type, count]) => {
                            const maxCount = Math.max(...Object.values(report.incidentStats.byType), 1);
                            const widthPercent = (count / maxCount) * 100;
                            return (
                                <div key={type} style={styles.barRow}>
                                    <span style={styles.barLabel}>{type}</span>
                                    <div style={styles.barContainer}>
                                        <div style={{
                                            ...styles.bar,
                                            width: `${widthPercent}%`,
                                            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                                        }} />
                                    </div>
                                    <span style={styles.barCount}>{count}건</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 심각도별 */}
                    <div style={styles.chartSection}>
                        <h4 style={styles.chartTitle}>심각도별 분포</h4>
                        <div style={styles.severityRow}>
                            {Object.entries(report.incidentStats.bySeverity).map(([severity, count]) => (
                                <div key={severity} style={{
                                    ...styles.severityItem,
                                    borderColor: `${getSeverityColor(severity)}40`
                                }}>
                                    <div style={{
                                        ...styles.severityDot,
                                        background: getSeverityColor(severity)
                                    }} />
                                    <span style={styles.severityLabel}>
                                        {getSeverityLabel(severity)}
                                    </span>
                                    <span style={{
                                        ...styles.severityCount,
                                        color: getSeverityColor(severity)
                                    }}>
                                        {count}건
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 7. AI 개선 권고사항 */}
                <div style={{ ...styles.card, borderColor: 'rgba(167, 139, 250, 0.3)' }}>
                    <h3 style={{ ...styles.cardTitle, color: '#a78bfa' }}>
                        <span role="img" aria-label="ai">🤖</span> AI 개선 권고사항
                    </h3>
                    <ul style={styles.recommendationList}>
                        {report.recommendations.map((rec, idx) => (
                            <li key={idx} style={styles.recommendationItem}>
                                <span style={styles.recBullet}>
                                    <span role="img" aria-label="arrow">▸</span>
                                </span>
                                <span style={styles.recText}>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 생성 시각 */}
                <p style={styles.generatedAt}>
                    리포트 생성 시각: {new Date(report.generatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
                </p>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '2rem 1rem'
    },
    container: {
        maxWidth: '900px',
        margin: '0 auto'
    },
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50px',
        padding: '0.6rem 1.2rem',
        color: 'white',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        marginBottom: '2rem',
        textDecoration: 'none',
        transition: 'all 0.3s ease'
    },
    headerSection: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    pageTitle: {
        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
        fontWeight: '800',
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '1rem',
        margin: 0
    },
    controlBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '2rem',
        flexWrap: 'wrap'
    },
    monthSelect: {
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '10px',
        padding: '10px 16px',
        color: '#f1f5f9',
        fontSize: '0.95rem',
        cursor: 'pointer',
        outline: 'none',
        minWidth: '160px'
    },
    printBtn: {
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '10px',
        padding: '10px 20px',
        color: '#60a5fa',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    card: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '1.25rem',
        transition: 'all 0.3s ease'
    },
    cardTitle: {
        fontSize: '1.15rem',
        fontWeight: '700',
        color: '#f1f5f9',
        marginTop: 0,
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    scoreContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
        flexWrap: 'wrap',
        padding: '10px 0'
    },
    scoreCircle: {
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        border: '4px solid',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.6)'
    },
    scoreNumber: {
        fontSize: '3rem',
        fontWeight: '800',
        lineHeight: 1
    },
    scoreUnit: {
        fontSize: '0.9rem',
        color: '#64748b',
        marginTop: '4px'
    },
    scoreInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
    },
    gradeLabel: {
        padding: '8px 20px',
        borderRadius: '20px',
        fontSize: '1.1rem',
        fontWeight: '700'
    },
    scorePeriod: {
        color: '#94a3b8',
        fontSize: '0.85rem',
        margin: 0
    },
    statRow: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        marginBottom: '16px'
    },
    statItem: {
        flex: '1 1 120px',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    statLabel: {
        color: '#64748b',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.3px'
    },
    statValue: {
        color: '#f1f5f9',
        fontSize: '1.4rem',
        fontWeight: '700'
    },
    progressBarContainer: {
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '6px',
        height: '8px',
        overflow: 'hidden'
    },
    progressBar: {
        height: '100%',
        borderRadius: '6px',
        transition: 'width 0.6s ease'
    },
    detailList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '12px'
    },
    detailItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    detailBullet: {
        fontSize: '1.1rem',
        flexShrink: 0
    },
    detailContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        minWidth: 0
    },
    detailTitle: {
        color: '#f1f5f9',
        fontSize: '0.9rem',
        fontWeight: '600'
    },
    detailDesc: {
        color: '#94a3b8',
        fontSize: '0.8rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    statusBadge: {
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        flexShrink: 0
    },
    chartSection: {
        marginTop: '18px'
    },
    chartTitle: {
        color: '#94a3b8',
        fontSize: '0.85rem',
        fontWeight: '600',
        margin: '0 0 12px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.3px'
    },
    barRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '8px'
    },
    barLabel: {
        width: '70px',
        color: '#cbd5e1',
        fontSize: '0.85rem',
        textAlign: 'right',
        flexShrink: 0
    },
    barContainer: {
        flex: 1,
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '4px',
        height: '20px',
        overflow: 'hidden'
    },
    bar: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.5s ease',
        minWidth: '2px'
    },
    barCount: {
        width: '40px',
        color: '#94a3b8',
        fontSize: '0.85rem',
        textAlign: 'right',
        flexShrink: 0
    },
    severityRow: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    severityItem: {
        flex: '1 1 100px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 14px',
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '10px',
        border: '1px solid'
    },
    severityDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        flexShrink: 0
    },
    severityLabel: {
        color: '#cbd5e1',
        fontSize: '0.85rem',
        flex: 1
    },
    severityCount: {
        fontSize: '1.1rem',
        fontWeight: '700'
    },
    recommendationList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    recommendationItem: {
        display: 'flex',
        gap: '10px',
        padding: '12px 14px',
        background: 'rgba(167, 139, 250, 0.05)',
        borderRadius: '10px',
        border: '1px solid rgba(167, 139, 250, 0.1)',
        alignItems: 'flex-start'
    },
    recBullet: {
        color: '#a78bfa',
        fontSize: '1rem',
        flexShrink: 0,
        marginTop: '2px'
    },
    recText: {
        color: '#cbd5e1',
        fontSize: '0.9rem',
        lineHeight: 1.6
    },
    generatedAt: {
        color: '#64748b',
        fontSize: '0.8rem',
        textAlign: 'center',
        marginTop: '2rem',
        paddingBottom: '2rem'
    }
};

export default ComplianceReportPage;
