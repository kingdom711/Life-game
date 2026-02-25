import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SPECIALIZATIONS, SPECIALIZATION_STATUS } from '../data/specializationData';
import {
    getAllSpecializationProgress,
    getActiveSpecialization,
    switchSpecialization,
    deactivateSpecialization
} from '../utils/specializationManager';
import { getLegalHoursProgress } from '../utils/educationManager';

/**
 * 전직 센터 페이지
 * 기술인이 특수 역할로 전직할 수 있는 허브 페이지
 */
const SpecializationPage = ({ role }) => {
    const [specProgressList, setSpecProgressList] = useState([]);
    const [activeSpec, setActiveSpec] = useState(null);
    const [legalProgress, setLegalProgress] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allProgress = getAllSpecializationProgress();
        setSpecProgressList(allProgress);
        setActiveSpec(getActiveSpecialization());
        setLegalProgress(getLegalHoursProgress());
    };

    const handleSwitch = (specId) => {
        const result = switchSpecialization(specId);
        if (result.success) {
            loadData();
        }
    };

    const handleDeactivate = () => {
        deactivateSpecialization();
        loadData();
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case SPECIALIZATION_STATUS.LOCKED: return '🔒 잠김';
            case SPECIALIZATION_STATUS.AVAILABLE: return '🟢 교육 가능';
            case SPECIALIZATION_STATUS.IN_PROGRESS: return '🟡 교육 진행 중';
            case SPECIALIZATION_STATUS.UNLOCKED: return '🔓 해금 완료';
            case SPECIALIZATION_STATUS.ACTIVE: return '⚡ 장착 중';
            default: return 'ℹ️ 상태';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case SPECIALIZATION_STATUS.LOCKED: return '#64748b';
            case SPECIALIZATION_STATUS.AVAILABLE: return '#22c55e';
            case SPECIALIZATION_STATUS.IN_PROGRESS: return '#f59e0b';
            case SPECIALIZATION_STATUS.UNLOCKED: return '#3b82f6';
            case SPECIALIZATION_STATUS.ACTIVE: return '#8b5cf6';
            default: return '#64748b';
        }
    };

    // 기술인만 접근 가능
    if (role !== 'technician') {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
                    <h2>전직 센터는 기술인 전용입니다</h2>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                        기술인 역할을 선택한 사용자만 이용할 수 있습니다.
                    </p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                        대시보드로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                {/* 헤더 */}
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">
                        ← 대시보드로 돌아가기
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        ⚔️ 전직 센터
                    </h1>
                    <p className="text-muted">
                        특수 교육을 이수하고 전문 역할로 전직하세요
                    </p>
                </div>

                {/* 현재 전직 상태 */}
                {activeSpec && (
                    <div className="card" style={{
                        marginBottom: '1.5rem',
                        border: `2px solid ${activeSpec.color}`,
                        background: `linear-gradient(135deg, ${activeSpec.color}15, transparent)`
                    }}>
                        <div className="card-body" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '2rem' }}>{activeSpec.icon}</span>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>현재 전직</div>
                                    <div style={{ fontWeight: 700, color: activeSpec.color }}>{activeSpec.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                        포인트 ×{activeSpec.bonuses.pointMultiplier} 보너스 적용 중
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleDeactivate}
                                className="btn btn-secondary btn-sm"
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                기본 기술인으로 복귀
                            </button>
                        </div>
                    </div>
                )}

                {/* 법정 교육 시간 연동 현황 */}
                {legalProgress && (
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>📘 법정 교육 시간</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        전직 교육 이수 시간은 연간 법정 교육시간에 누적 반영됩니다.
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                        {legalProgress.currentYearHours}h / {legalProgress.requiredHours}h
                                    </div>
                                    <div style={{ fontWeight: 700, color: '#3b82f6' }}>
                                        {legalProgress.completionRate}%
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                marginTop: '0.75rem',
                                height: '8px',
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.08)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(100, Number(legalProgress.completionRate))}%`,
                                    background: legalProgress.hasMetRequirement
                                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                        : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                                    transition: 'width 0.4s ease'
                                }} />
                            </div>
                            <div style={{
                                marginTop: '0.4rem',
                                fontSize: '0.75rem',
                                color: legalProgress.hasMetRequirement ? '#22c55e' : 'var(--color-text-secondary)'
                            }}>
                                {legalProgress.hasMetRequirement
                                    ? '연간 법정 교육시간을 모두 충족했습니다.'
                                    : `${legalProgress.remainingHours}h 추가 이수 필요`}
                            </div>
                        </div>
                    </div>
                )}

                {/* 전직 카드 목록 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {specProgressList.map((progress) => {
                        const spec = SPECIALIZATIONS.find(s => s.id === progress.specId);
                        if (!spec) return null;

                        const isLocked = progress.status === SPECIALIZATION_STATUS.LOCKED;
                        const isAvailable = progress.status === SPECIALIZATION_STATUS.AVAILABLE;
                        const isInProgress = progress.status === SPECIALIZATION_STATUS.IN_PROGRESS;
                        const isUnlocked = progress.status === SPECIALIZATION_STATUS.UNLOCKED;
                        const isActive = progress.status === SPECIALIZATION_STATUS.ACTIVE;

                        return (
                            <div
                                key={spec.id}
                                className="card"
                                style={{
                                    opacity: isLocked ? 0.6 : 1,
                                    border: isActive ? `2px solid ${spec.color}` : undefined,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* 상태 뱃지 */}
                                <div style={{
                                    position: 'absolute',
                                    top: '0.75rem',
                                    right: '0.75rem',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    background: getStatusColor(progress.status),
                                    color: '#fff'
                                }}>
                                    {getStatusLabel(progress.status)}
                                </div>

                                {/* 카드 헤더 */}
                                <div className="card-header" style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
                                    <div style={{
                                        fontSize: '3.5rem',
                                        marginBottom: '0.75rem',
                                        filter: isLocked ? 'grayscale(1)' : 'none'
                                    }}>
                                        {isLocked ? '🔒' : spec.icon}
                                    </div>
                                    <h3 className="card-title" style={{
                                        color: isLocked ? 'var(--color-text-tertiary)' : spec.color
                                    }}>
                                        {spec.name}
                                    </h3>
                                    <p className="card-subtitle" style={{ fontSize: '0.8rem' }}>
                                        {spec.shortDescription}
                                    </p>
                                </div>

                                {/* 카드 바디 */}
                                <div className="card-body">
                                    {/* 조건 표시 */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--color-text-tertiary)',
                                            marginBottom: '0.5rem',
                                            fontWeight: 600
                                        }}>
                                            전직 조건
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.8rem'
                                        }}>
                                            <span style={{
                                                color: progress.isFullyCompleted ? '#22c55e' : '#ef4444'
                                            }}>
                                                {progress.isFullyCompleted ? '✓' : '✗'}
                                            </span>
                                            <span>교육 이수: {progress.completedCount}/{progress.totalCount}</span>
                                        </div>
                                        <div style={{
                                            marginTop: '0.3rem',
                                            fontSize: '0.72rem',
                                            color: 'var(--color-text-tertiary)'
                                        }}>
                                            교육 1개 이수 시 법정 교육시간 +0.25h 반영
                                        </div>
                                    </div>

                                    {/* 진행률 바 */}
                                    {(isInProgress || isAvailable) && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '0.75rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <span>교육 진행률</span>
                                                <span style={{ color: spec.color }}>{progress.completionRate}%</span>
                                            </div>
                                            <div style={{
                                                height: '6px',
                                                borderRadius: '3px',
                                                background: 'rgba(255,255,255,0.1)',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${progress.completionRate}%`,
                                                    background: spec.bgGradient,
                                                    borderRadius: '3px',
                                                    transition: 'width 0.5s ease'
                                                }} />
                                            </div>
                                        </div>
                                    )}

                                    {/* 보너스 정보 */}
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--color-text-tertiary)',
                                            marginBottom: '0.5rem',
                                            fontWeight: 600
                                        }}>
                                            전직 보너스
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.8rem',
                                            color: spec.color
                                        }}>
                                            <span>⚡</span>
                                            <span>포인트 ×{spec.bonuses.pointMultiplier} 획득</span>
                                        </div>
                                    </div>

                                    {/* 주요 기능 */}
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {spec.features.slice(0, 3).map((feature, idx) => (
                                            <li key={idx} style={{
                                                marginBottom: '0.35rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.8rem'
                                            }}>
                                                <span style={{ color: isLocked ? '#64748b' : spec.color }}>✦</span>
                                                <span style={{
                                                    color: isLocked ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)'
                                                }}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>


                                {/* 카드 푸터 */}
                                <div className="card-footer">
                                    {isLocked && (
                                        <button className="btn btn-secondary" style={{ width: '100%', whiteSpace: 'nowrap' }} disabled>
                                            🔒 조건 미충족
                                        </button>
                                    )}
                                    {isAvailable && (
                                        <Link
                                            to={`/specialization/training/${spec.id}`}
                                            className="btn btn-primary"
                                            style={{ width: '100%', background: spec.bgGradient, whiteSpace: 'nowrap' }}
                                        >
                                            📚 교육 시작하기
                                        </Link>
                                    )}
                                    {isInProgress && (
                                        <Link
                                            to={`/specialization/training/${spec.id}`}
                                            className="btn btn-primary"
                                            style={{ width: '100%', background: spec.bgGradient, whiteSpace: 'nowrap' }}
                                        >
                                            📚 교육 이어하기 ({progress.completionRate}%)
                                        </Link>
                                    )}
                                    {isUnlocked && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', background: spec.bgGradient, whiteSpace: 'nowrap' }}
                                            onClick={() => handleSwitch(spec.id)}
                                        >
                                            ⚔️ 전직 장착하기
                                        </button>
                                    )}
                                    {isActive && (
                                        <button className="btn btn-secondary" style={{ width: '100%', whiteSpace: 'nowrap' }} disabled>
                                            ✅ 현재 장착 중
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SpecializationPage;
