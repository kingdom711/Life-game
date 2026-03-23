import { useState, useEffect } from 'react';
import { getTodayMicroContent, MICRO_TYPE } from '../data/microLearningData';
import { storage, getKSTDateString } from '../utils/storage';
import { addPoints, addExperience } from '../utils/pointsCalculator';

const MICRO_COMPLETE_KEY = 'safety_quest_micro_learning';

function MicroLearningCard({ onComplete }) {
    const [content, setContent] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [cardRead, setCardRead] = useState(false);

    useEffect(() => {
        const todayContent = getTodayMicroContent();
        setContent(todayContent);

        const today = getKSTDateString();
        const completed = storage.get(MICRO_COMPLETE_KEY, {});
        if (completed[today]) {
            setIsCompleted(true);
        }
    }, []);

    const markComplete = () => {
        const today = getKSTDateString();
        const completed = storage.get(MICRO_COMPLETE_KEY, {});
        completed[today] = { contentId: content.id, completedAt: new Date().toISOString() };
        storage.set(MICRO_COMPLETE_KEY, completed);
        setIsCompleted(true);

        if (content.reward) {
            addPoints(content.reward.points, '마이크로 러닝', content.title || content.question);
            addExperience(content.reward.exp);
        }
        onComplete?.();
    };

    // 퀴즈 답변 처리
    const handleQuizAnswer = (answer) => {
        setSelectedAnswer(answer);
        const correct = answer === content.answer;
        setIsCorrect(correct);
        setShowResult(true);
        if (correct) {
            setTimeout(() => markComplete(), 500);
        }
    };

    // 시나리오 답변 처리
    const handleScenarioAnswer = (choiceIndex) => {
        setSelectedAnswer(choiceIndex);
        const correct = content.choices[choiceIndex].correct;
        setIsCorrect(correct);
        setShowResult(true);
        if (correct) {
            setTimeout(() => markComplete(), 500);
        }
    };

    // 안전 카드 읽기 완료
    const handleCardRead = () => {
        setCardRead(true);
        markComplete();
    };

    if (!content || isCompleted || isDismissed) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(59, 130, 246, 0.1))',
            border: '2px solid rgba(14, 165, 233, 0.3)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.1)'
        }}>
            {/* 헤더 */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700, color: '#0ea5e9',
                        background: 'rgba(14, 165, 233, 0.2)',
                        padding: '0.15rem 0.5rem', borderRadius: '4px',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                        1분 안전 체크
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {content.category}
                    </span>
                </div>
                <button
                    onClick={() => setIsDismissed(true)}
                    style={{
                        background: 'none', border: 'none',
                        color: '#64748b', cursor: 'pointer', fontSize: '0.8rem'
                    }}
                >나중에</button>
            </div>

            {/* 퀴즈 타입 */}
            {content.type === MICRO_TYPE.QUIZ && (
                <div>
                    <p style={{
                        color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600,
                        marginBottom: '1rem', lineHeight: 1.5
                    }}>
                        Q. {content.question}
                    </p>

                    {!showResult ? (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => handleQuizAnswer(true)}
                                style={{
                                    flex: 1, padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '2px solid rgba(34, 197, 94, 0.3)',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    color: '#4ade80', fontWeight: 700,
                                    fontSize: '1.1rem', cursor: 'pointer'
                                }}
                            >O</button>
                            <button
                                onClick={() => handleQuizAnswer(false)}
                                style={{
                                    flex: 1, padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '2px solid rgba(239, 68, 68, 0.3)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#f87171', fontWeight: 700,
                                    fontSize: '1.1rem', cursor: 'pointer'
                                }}
                            >X</button>
                        </div>
                    ) : (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '10px',
                            background: isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                            <div style={{
                                fontWeight: 700,
                                color: isCorrect ? '#4ade80' : '#f87171',
                                marginBottom: '0.3rem',
                                fontSize: '0.9rem'
                            }}>
                                {isCorrect ? '정답! 🎉' : '오답!'}
                                {isCorrect && ` +${content.reward.points}P +${content.reward.exp}EXP`}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                {content.explanation}
                            </div>
                            {!isCorrect && (
                                <button
                                    onClick={() => { setShowResult(false); setSelectedAnswer(null); }}
                                    style={{
                                        marginTop: '0.5rem', padding: '0.4rem 0.8rem',
                                        borderRadius: '6px', border: 'none',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: '#94a3b8', fontSize: '0.75rem',
                                        cursor: 'pointer', fontWeight: 600
                                    }}
                                >다시 도전</button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 안전 카드 타입 */}
            {content.type === MICRO_TYPE.CARD && (
                <div>
                    <h4 style={{
                        color: '#f1f5f9', fontSize: '1rem', fontWeight: 700,
                        marginBottom: '0.5rem'
                    }}>
                        {content.title}
                    </h4>
                    <div style={{
                        color: '#cbd5e1', fontSize: '0.85rem',
                        whiteSpace: 'pre-line', lineHeight: 1.7,
                        marginBottom: '0.75rem'
                    }}>
                        {content.content}
                    </div>
                    <div style={{
                        fontSize: '0.8rem', color: '#0ea5e9',
                        fontStyle: 'italic', marginBottom: '0.75rem'
                    }}>
                        💡 {content.tip}
                    </div>
                    {!cardRead && (
                        <button
                            onClick={handleCardRead}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                                color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                                cursor: 'pointer', width: '100%'
                            }}
                        >
                            확인했습니다 (+{content.reward.points}P)
                        </button>
                    )}
                </div>
            )}

            {/* 시나리오 타입 */}
            {content.type === MICRO_TYPE.SCENARIO && (
                <div>
                    <p style={{
                        color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 600,
                        marginBottom: '0.75rem', lineHeight: 1.5
                    }}>
                        [상황] {content.situation}
                    </p>

                    {!showResult ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {content.choices.map((choice, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleScenarioAnswer(i)}
                                    style={{
                                        padding: '0.65rem 1rem',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#cbd5e1',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontWeight: 500
                                    }}
                                >
                                    {String.fromCharCode(9312 + i)} {choice.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '10px',
                            background: isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                            <div style={{
                                fontWeight: 700,
                                color: isCorrect ? '#4ade80' : '#f87171',
                                marginBottom: '0.3rem', fontSize: '0.9rem'
                            }}>
                                {isCorrect ? '정답! 🎉' : '오답!'}
                                {isCorrect && ` +${content.reward.points}P +${content.reward.exp}EXP`}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                {content.correctExplanation}
                            </div>
                            {!isCorrect && (
                                <button
                                    onClick={() => { setShowResult(false); setSelectedAnswer(null); }}
                                    style={{
                                        marginTop: '0.5rem', padding: '0.4rem 0.8rem',
                                        borderRadius: '6px', border: 'none',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: '#94a3b8', fontSize: '0.75rem',
                                        cursor: 'pointer', fontWeight: 600
                                    }}
                                >다시 도전</button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MicroLearningCard;
