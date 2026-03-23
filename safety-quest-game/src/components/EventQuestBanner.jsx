import { useState, useEffect } from 'react';
import { getActiveEventQuests, completeEventQuest, getEventQuestStats } from '../utils/eventQuestManager';

/**
 * 돌발 이벤트 퀘스트 배너
 * - 대시보드에 표시되는 이벤트 퀘스트 카드
 * - 날씨/시간/특별 이벤트 기반 퀘스트
 */
function EventQuestBanner({ onComplete }) {
    const [quests, setQuests] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [completedMessage, setCompletedMessage] = useState(null);

    useEffect(() => {
        loadQuests();
    }, []);

    const loadQuests = () => {
        const active = getActiveEventQuests().filter(q => q);
        setQuests(active);
    };

    const handleComplete = (questId) => {
        const result = completeEventQuest(questId);
        if (result.success) {
            setCompletedMessage(`+${result.reward.points}P +${result.reward.exp}EXP`);
            setTimeout(() => setCompletedMessage(null), 2000);
            loadQuests();
            onComplete?.();
        }
    };

    const stats = getEventQuestStats();

    if (quests.length === 0) return null;

    // 미완료 퀘스트만 표시 (최대 2개)
    const activeQuests = quests.filter(q => !q.isCompleted).slice(0, 2);
    const completedCount = quests.filter(q => q.isCompleted).length;

    if (activeQuests.length === 0 && completedCount > 0) {
        return (
            <div style={{
                padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.85rem', color: '#4ade80', fontWeight: 600
            }}>
                ✅ 오늘의 이벤트 퀘스트를 모두 완료했습니다! ({completedCount}개)
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            {/* 완료 메시지 */}
            {completedMessage && (
                <div style={{
                    padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '0.5rem',
                    background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                    color: '#4ade80', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center'
                }}>
                    🎉 이벤트 퀘스트 완료! {completedMessage}
                </div>
            )}

            {activeQuests.map(quest => (
                <div key={quest.id} style={{
                    padding: '1rem', borderRadius: '14px', marginBottom: '0.5rem',
                    background: quest.category === 'weather'
                        ? 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(59,130,246,0.08))'
                        : quest.category === 'special'
                            ? 'linear-gradient(135deg, rgba(234,179,8,0.08), rgba(249,115,22,0.08))'
                            : 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.08))',
                    border: `1px solid ${quest.category === 'weather'
                        ? 'rgba(6,182,212,0.2)'
                        : quest.category === 'special'
                            ? 'rgba(234,179,8,0.2)'
                            : 'rgba(168,85,247,0.2)'}`
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                            <span style={{ fontSize: '1.5rem' }}>{quest.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem'
                                    }}>
                                        {quest.title}
                                    </span>
                                    <span style={{
                                        padding: '0.1rem 0.4rem', borderRadius: '4px',
                                        fontSize: '0.6rem', fontWeight: 600,
                                        background: quest.category === 'weather'
                                            ? 'rgba(6,182,212,0.2)' : 'rgba(234,179,8,0.2)',
                                        color: quest.category === 'weather' ? '#22d3ee' : '#fbbf24'
                                    }}>
                                        {quest.trigger}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                    {quest.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 액션 항목 (펼치기) */}
                    {expandedId === quest.id ? (
                        <div style={{ marginTop: '0.75rem' }}>
                            {quest.actions.map((action, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.4rem 0', fontSize: '0.8rem', color: '#cbd5e1'
                                }}>
                                    <span style={{
                                        width: '18px', height: '18px', borderRadius: '4px',
                                        border: '1.5px solid rgba(255,255,255,0.2)',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.6rem', flexShrink: 0
                                    }}>
                                        {quest.completedActions?.includes(idx) ? '✓' : ''}
                                    </span>
                                    {action}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* 하단 액션 */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: '0.75rem'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            💰 +{quest.reward.points}P +{quest.reward.exp}EXP
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                                onClick={() => setExpandedId(expandedId === quest.id ? null : quest.id)}
                                style={{
                                    padding: '0.35rem 0.6rem', borderRadius: '6px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer'
                                }}
                            >
                                {expandedId === quest.id ? '접기' : '상세'}
                            </button>
                            <button
                                onClick={() => handleComplete(quest.id)}
                                style={{
                                    padding: '0.35rem 0.8rem', borderRadius: '6px', border: 'none',
                                    background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
                                    color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                완료
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default EventQuestBanner;
