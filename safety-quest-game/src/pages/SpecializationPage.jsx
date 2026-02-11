import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { points } from '../utils/storage';
import { calculateLevel } from '../utils/pointsCalculator';
import { SPECIALIZATIONS, SPECIALIZATION_STATUS } from '../data/specializationData';
import {
    getSpecializationStatus,
    getSpecializationProgress,
    getAllSpecializationProgress,
    getActiveSpecialization,
    switchSpecialization,
    deactivateSpecialization,
    executeClassChange
} from '../utils/specializationManager';

/**
 * 전직 센터 페이지
 * 기술인이 특수 역할로 전직할 수 있는 허브 페이지
 */
const SpecializationPage = ({ role }) => {
    const navigate = useNavigate();
    const [specProgressList, setSpecProgressList] = useState([]);
    const [activeSpec, setActiveSpec] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [showClassChangeModal, setShowClassChangeModal] = useState(false);
    const [classChangeTarget, setClassChangeTarget] = useState(null);
    const [classChangeResult, setClassChangeResult] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allProgress = getAllSpecializationProgress();
        setSpecProgressList(allProgress);
        setActiveSpec(getActiveSpecialization());
        setCurrentLevel(calculateLevel(points.get()));
    };

    const handleStartTraining = (specId) => {
        navigate(`/specialization/training/${specId}`);
    };

    const handleClassChange = (specId) => {
        setClassChangeTarget(specId);
        setShowClassChangeModal(true);
    };

    const confirmClassChange = () => {
        if (!classChangeTarget) return;

        const result = executeClassChange(classChangeTarget);
        if (result.success) {
            setClassChangeResult(result);
            loadData();
        }
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
            case SPECIALIZATION_STATUS.LOCKED: return '잠김';
            case SPECIALIZATION_STATUS.AVAILABLE: return '교육 가능';
            case SPECIALIZATION_STATUS.IN_PROGRESS: return '교육 진행 중';
            case SPECIALIZATION_STATUS.UNLOCKED: return '해금 완료';
            case SPECIALIZATION_STATUS.ACTIVE: return '장착 중';
            default: return '';
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
                    {currentLevel && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.875rem'
                        }}>
                            <span>{currentLevel.tierIcon}</span>
                            <span style={{ color: currentLevel.color }}>{currentLevel.name}</span>
                        </div>
                    )}
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

                {/* 전직 카드 목록 */}
                <div className="grid grid-3" style={{ gap: '1.5rem' }}>
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
                                            fontSize: '0.8rem',
                                            marginBottom: '0.25rem'
                                        }}>
                                            <span style={{
                                                color: currentLevel && currentLevel.rank >= spec.unlockRequirements.minLevel
                                                    ? '#22c55e' : '#ef4444'
                                            }}>
                                                {currentLevel && currentLevel.rank >= spec.unlockRequirements.minLevel ? '✓' : '✗'}
                                            </span>
                                            <span>레벨: {spec.unlockRequirements.minLevelName} 이상</span>
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
                                        <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                                            🔒 조건 미충족
                                        </button>
                                    )}
                                    {isAvailable && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', background: spec.bgGradient }}
                                            onClick={() => handleStartTraining(spec.id)}
                                        >
                                            📚 교육 시작하기
                                        </button>
                                    )}
                                    {isInProgress && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', background: spec.bgGradient }}
                                            onClick={() => handleStartTraining(spec.id)}
                                        >
                                            📚 교육 이어하기 ({progress.completionRate}%)
                                        </button>
                                    )}
                                    {isUnlocked && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', background: spec.bgGradient }}
                                            onClick={() => handleSwitch(spec.id)}
                                        >
                                            ⚔️ 전직 장착하기
                                        </button>
                                    )}
                                    {isActive && (
                                        <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                                            ✅ 현재 장착 중
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 전직 완료 축하 모달 */}
                {classChangeResult && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                        onClick={() => setClassChangeResult(null)}
                    >
                        <div
                            className="card"
                            style={{
                                maxWidth: '400px',
                                width: '90%',
                                textAlign: 'center',
                                padding: '2rem',
                                animation: 'fadeIn 0.3s ease'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                🎉
                            </div>
                            <h2 style={{ marginBottom: '0.5rem' }}>전직 완료!</h2>
                            <div style={{
                                fontSize: '2rem',
                                marginBottom: '0.5rem'
                            }}>
                                {classChangeResult.spec?.icon} {classChangeResult.spec?.name}
                            </div>
                            <p style={{
                                color: 'var(--color-text-secondary)',
                                marginBottom: '1.5rem'
                            }}>
                                축하합니다! 전문 역할로 전직되었습니다.
                            </p>
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)'
                                }}>
                                    <div style={{ fontSize: '0.7rem', color: '#22c55e' }}>보상 포인트</div>
                                    <div style={{ fontWeight: 700 }}>+{classChangeResult.reward?.points}P</div>
                                </div>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)'
                                }}>
                                    <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>보상 경험치</div>
                                    <div style={{ fontWeight: 700 }}>+{classChangeResult.reward?.exp}EXP</div>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => setClassChangeResult(null)}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpecializationPage;
