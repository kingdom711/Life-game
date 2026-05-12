import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPathsWithProgress, completeStep, claimPathReward, startPath } from '../utils/learningPathManager';
import { userProfile } from '../utils/storage';

function LearningPathPage() {
    const [paths, setPaths] = useState([]);
    const [selectedPath, setSelectedPath] = useState(null);
    const [message, setMessage] = useState(null);

    const role = userProfile.getRole() || 'technician';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setPaths(getPathsWithProgress(role));
    };

    const handleStartPath = (pathId) => {
        const result = startPath(pathId);
        if (!result.success) {
            setMessage({ type: 'error', text: result.message });
            return;
        }
        loadData();
        setSelectedPath(pathId);
    };

    const handleCompleteStep = (pathId, stepId) => {
        const result = completeStep(pathId, stepId);
        if (result.success) {
            setMessage({
                type: 'success',
                text: `단계 완료! +${result.stepReward?.points || 0}P +${result.stepReward?.exp || 0}EXP`
            });
            if (result.isPathCompleted) {
                setTimeout(() => setMessage({
                    type: 'success', text: '🎉 학습 경로를 모두 완료했습니다! 보상을 수령하세요.'
                }), 1500);
            }
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        loadData();
    };

    const handleClaimReward = (pathId) => {
        const result = claimPathReward(pathId);
        if (result.success) {
            setMessage({
                type: 'success',
                text: `🎉 경로 완료 보상: ${result.reward.points}P +${result.reward.exp}EXP "${result.reward.title}"`
            });
        }
        loadData();
    };

    const selectedPathData = selectedPath ? paths.find(p => p.id === selectedPath) : null;

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">← 대시보드</Link>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 className="text-4xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        📚 학습 경로
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        체계적인 커리큘럼으로 안전 전문가가 되세요
                    </p>
                </div>

                {/* 메시지 */}
                {message && (
                    <div style={{
                        padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
                        background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        color: message.type === 'success' ? '#4ade80' : '#f87171',
                        fontSize: '0.85rem', fontWeight: 600
                    }}>
                        {message.text}
                    </div>
                )}

                {/* 경로 선택 뷰 */}
                {!selectedPath ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {paths.map(path => (
                            <div key={path.id}
                                onClick={() => !path.progress.isLocked && setSelectedPath(path.id)}
                                style={{
                                    padding: '1.25rem', borderRadius: '14px',
                                    background: path.progress.isLocked
                                        ? 'rgba(255,255,255,0.02)'
                                        : `linear-gradient(135deg, ${path.color}15, ${path.color}08)`,
                                    border: `2px solid ${path.progress.isLocked ? 'rgba(255,255,255,0.05)' : path.color + '30'}`,
                                    cursor: path.progress.isLocked ? 'not-allowed' : 'pointer',
                                    opacity: path.progress.isLocked ? 0.5 : 1
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ fontSize: '2rem' }}>{path.icon}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1rem' }}>
                                                {path.progress.isLocked && '🔒 '}{path.title}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {path.description}
                                            </div>
                                        </div>
                                    </div>
                                    {path.progress.isCompleted && (
                                        <div style={{ fontSize: '1.5rem' }}>✅</div>
                                    )}
                                </div>

                                {/* 진행 바 */}
                                {!path.progress.isLocked && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            fontSize: '0.7rem', color: '#64748b', marginBottom: '0.3rem'
                                        }}>
                                            <span>{path.progress.completedCount}/{path.progress.totalSteps} 단계</span>
                                            <span>{path.progress.progressPercent}%</span>
                                        </div>
                                        <div style={{
                                            background: 'rgba(0,0,0,0.3)', borderRadius: '4px',
                                            height: '6px', overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                background: path.color, height: '100%', borderRadius: '4px',
                                                width: `${path.progress.progressPercent}%`
                                            }} />
                                        </div>
                                    </div>
                                )}

                                {/* 보상 미리보기 */}
                                <div style={{
                                    marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8'
                                }}>
                                    완료 보상: {path.reward.points}P + {path.reward.exp}EXP
                                    {path.reward.title && <span style={{ color: path.color }}> + "{path.reward.title}"</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 경로 상세 뷰 */
                    <div>
                        <button onClick={() => setSelectedPath(null)} style={{
                            background: 'none', border: 'none', color: '#94a3b8',
                            cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem'
                        }}>
                            ← 경로 목록으로
                        </button>

                        {selectedPathData && (
                            <>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'
                                }}>
                                    <div style={{ fontSize: '2.5rem' }}>{selectedPathData.icon}</div>
                                    <div>
                                        <h2 style={{ margin: 0, color: '#e2e8f0', fontWeight: 800 }}>
                                            {selectedPathData.title}
                                        </h2>
                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {selectedPathData.progress.completedCount}/{selectedPathData.progress.totalSteps} 완료
                                        </div>
                                    </div>
                                </div>

                                {/* 스텝 타임라인 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {selectedPathData.steps.map((step, idx) => (
                                        <div key={step.id}>
                                            {/* 연결선 */}
                                            {idx > 0 && (
                                                <div style={{
                                                    width: '3px', height: '24px', marginLeft: '18px',
                                                    background: step.isCompleted
                                                        ? selectedPathData.color
                                                        : 'rgba(255,255,255,0.1)'
                                                }} />
                                            )}

                                            <div style={{
                                                display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
                                            }}>
                                                {/* 원형 인디케이터 */}
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0, fontSize: '1rem', fontWeight: 800,
                                                    background: step.isCompleted
                                                        ? selectedPathData.color
                                                        : step.isUnlocked
                                                            ? `${selectedPathData.color}33`
                                                            : 'rgba(255,255,255,0.05)',
                                                    color: step.isCompleted ? '#fff' : step.isUnlocked ? selectedPathData.color : '#4a5568',
                                                    border: `2px solid ${step.isCompleted ? selectedPathData.color : step.isUnlocked ? selectedPathData.color + '50' : 'rgba(255,255,255,0.1)'}`
                                                }}>
                                                    {step.isCompleted ? '✓' : idx + 1}
                                                </div>

                                                {/* 스텝 카드 */}
                                                <div style={{
                                                    flex: 1, padding: '1rem', borderRadius: '12px',
                                                    background: step.isCompleted
                                                        ? `${selectedPathData.color}10`
                                                        : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${step.isCompleted ? selectedPathData.color + '30' : 'rgba(255,255,255,0.06)'}`,
                                                    opacity: step.isUnlocked || step.isCompleted ? 1 : 0.5
                                                }}>
                                                    <div style={{
                                                        fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        {step.title}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                                        {step.description}
                                                    </div>

                                                    {/* 콘텐츠 목록 */}
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                                                        {step.content.map((c, ci) => (
                                                            <span key={ci} style={{
                                                                padding: '0.2rem 0.5rem', borderRadius: '6px',
                                                                fontSize: '0.7rem', fontWeight: 600,
                                                                background: 'rgba(255,255,255,0.05)',
                                                                color: '#94a3b8'
                                                            }}>
                                                                {c.type === 'video' && '🎬'}
                                                                {c.type === 'quiz' && '📝'}
                                                                {c.type === 'scenario' && '🎯'}
                                                                {c.type === 'task' && '✅'}
                                                                {' '}{c.title}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* 보상 */}
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        보상: +{step.reward.points}P +{step.reward.exp}EXP
                                                    </div>

                                                    {/* 액션 버튼 */}
                                                    {step.isUnlocked && !step.isCompleted && (
                                                        <button
                                                            onClick={() => handleCompleteStep(selectedPathData.id, step.id)}
                                                            style={{
                                                                marginTop: '0.5rem', padding: '0.5rem 1rem',
                                                                borderRadius: '8px', border: 'none',
                                                                background: `linear-gradient(135deg, ${selectedPathData.color}, ${selectedPathData.color}cc)`,
                                                                color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            단계 완료하기
                                                        </button>
                                                    )}

                                                    {step.isCompleted && (
                                                        <div style={{
                                                            marginTop: '0.5rem', fontSize: '0.8rem',
                                                            color: '#4ade80', fontWeight: 600
                                                        }}>
                                                            ✅ 완료됨
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 경로 완료 보상 */}
                                {selectedPathData.progress.isCompleted && !selectedPathData.progress.rewardClaimed && (
                                    <div style={{
                                        marginTop: '1.5rem', padding: '1.25rem', borderRadius: '14px',
                                        background: 'rgba(234,179,8,0.1)', border: '2px solid rgba(234,179,8,0.3)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                                        <div style={{ fontWeight: 800, color: '#fbbf24', marginBottom: '0.5rem' }}>
                                            학습 경로 완료!
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                                            {selectedPathData.reward.points}P + {selectedPathData.reward.exp}EXP
                                            {selectedPathData.reward.title && ` + "${selectedPathData.reward.title}"`}
                                        </div>
                                        <button
                                            onClick={() => handleClaimReward(selectedPathData.id)}
                                            style={{
                                                padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none',
                                                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                                color: '#0f172a', fontWeight: 700, cursor: 'pointer'
                                            }}
                                        >
                                            보상 수령하기
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LearningPathPage;
