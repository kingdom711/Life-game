import { useState } from 'react';
import {
    getChainQuestStatus,
    completeChainQuest,
    claimPerfectBonus,
    CHAIN_QUESTS
} from '../utils/chainQuestManager';

/**
 * 체인 퀘스트 카드 - DailyQuests 페이지 하단에 표시
 */
function ChainQuestCard({ role, onComplete }) {
    const [textInput, setTextInput] = useState('');
    const [result, setResult] = useState(null);

    const status = getChainQuestStatus(role);
    const chain = CHAIN_QUESTS[0];
    const perfectBonus = CHAIN_QUESTS[1];

    const handleComplete = () => {
        const res = completeChainQuest(textInput, role);
        setResult(res);
        if (res.success) {
            onComplete?.();
            setTimeout(() => setResult(null), 3000);
        }
    };

    const handleClaimBonus = () => {
        const res = claimPerfectBonus();
        setResult(res);
        if (res.success) {
            onComplete?.();
            setTimeout(() => setResult(null), 3000);
        }
    };

    // 해금 전 - 진행률 표시
    if (!status.unlocked) {
        return (
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '2px dashed rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'center',
                opacity: 0.6
            }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>
                    체인 퀘스트 잠김
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    일일 퀘스트 {status.dailyCompleted}/{status.threshold}개 완료 시 해금
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '999px',
                    height: '6px',
                    marginTop: '0.75rem',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                        height: '100%',
                        borderRadius: '999px',
                        width: `${Math.min(100, (status.dailyCompleted / status.threshold) * 100)}%`,
                        transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
            border: status.chainCompleted
                ? '2px solid rgba(34, 197, 94, 0.4)'
                : '2px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
        }}>
            {/* 결과 메시지 */}
            {result && (
                <div style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    background: result.success ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: result.success ? '#4ade80' : '#f87171',
                    fontSize: '0.8rem', fontWeight: 600, textAlign: 'center'
                }}>
                    {result.message}
                </div>
            )}

            {/* 체인 퀘스트 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                    fontSize: '2rem',
                    background: 'rgba(59, 130, 246, 0.2)',
                    width: '52px', height: '52px',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                }}>
                    {status.chainCompleted ? '✅' : chain.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{
                            fontSize: '0.65rem', fontWeight: 700, color: '#60a5fa',
                            background: 'rgba(59, 130, 246, 0.2)',
                            padding: '0.1rem 0.4rem', borderRadius: '4px'
                        }}>
                            CHAIN QUEST
                        </span>
                    </div>
                    <h4 style={{ margin: '0 0 0.2rem', color: '#f1f5f9', fontSize: '1rem', fontWeight: 700 }}>
                        {chain.name}
                    </h4>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
                        {chain.description}
                    </p>

                    {/* 미완료 시 입력 영역 */}
                    {!status.chainCompleted && (
                        <div style={{ marginTop: '0.75rem' }}>
                            <input
                                type="text"
                                placeholder="오늘의 안전 활동을 정리해 주세요 (5자 이상)"
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                maxLength={100}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: '#f1f5f9',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginTop: '0.5rem'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>
                                    보상: +{chain.reward.points}P +{chain.reward.exp}EXP
                                </span>
                                <button
                                    onClick={handleComplete}
                                    disabled={textInput.trim().length < 5}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '8px', border: 'none',
                                        background: textInput.trim().length >= 5
                                            ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                                            : 'rgba(255,255,255,0.1)',
                                        color: textInput.trim().length >= 5 ? '#fff' : '#64748b',
                                        fontWeight: 600, fontSize: '0.8rem',
                                        cursor: textInput.trim().length >= 5 ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    완료하기
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 완료 후 완벽한 하루 보너스 */}
                    {status.chainCompleted && !status.perfectClaimed && (
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: 'rgba(234, 179, 8, 0.1)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
                                    {perfectBonus.icon} {perfectBonus.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    +{perfectBonus.reward.points}P +{perfectBonus.reward.exp}EXP
                                </div>
                            </div>
                            <button
                                onClick={handleClaimBonus}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '8px', border: 'none',
                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                    color: '#0f172a', fontWeight: 700, fontSize: '0.8rem',
                                    cursor: 'pointer', animation: 'pulse 2s infinite'
                                }}
                            >
                                수령하기
                            </button>
                        </div>
                    )}

                    {status.perfectClaimed && (
                        <div style={{
                            marginTop: '0.5rem', fontSize: '0.8rem',
                            color: '#4ade80', fontWeight: 600
                        }}>
                            ✅ 완벽한 하루 달성! 모든 보상을 수령했습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChainQuestCard;
