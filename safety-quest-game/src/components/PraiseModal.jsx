import { useState } from 'react';
import { PRAISE_TYPES, sendPraise, getRemainingPraises } from '../utils/praiseManager';
import { trackPraiseSent } from '../utils/achievementManager';

function PraiseModal({ isOpen, onClose, targetUser }) {
    const [selectedType, setSelectedType] = useState(null);
    const [message, setMessage] = useState('');
    const [result, setResult] = useState(null);
    const [sending, setSending] = useState(false);

    if (!isOpen || !targetUser) return null;

    const remaining = getRemainingPraises();

    const handleSend = () => {
        if (!selectedType) return;
        setSending(true);

        const res = sendPraise(
            targetUser.id || targetUser.name,
            targetUser.name,
            selectedType,
            message
        );

        setResult(res);
        setSending(false);

        if (res.success) {
            trackPraiseSent();
            setTimeout(() => {
                setSelectedType(null);
                setMessage('');
                setResult(null);
                onClose();
            }, 1500);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2000, padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))',
                    borderRadius: '20px',
                    width: '100%', maxWidth: '440px',
                    border: '2px solid rgba(251, 191, 36, 0.3)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>
                            👏 칭찬하기
                        </h3>
                        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                            {targetUser.name}님에게 칭찬을 보내세요
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)', border: 'none',
                            borderRadius: '50%', width: '32px', height: '32px',
                            color: '#94a3b8', fontSize: '1rem', cursor: 'pointer'
                        }}
                    >✕</button>
                </div>

                {/* 결과 메시지 */}
                {result && (
                    <div style={{
                        margin: '1rem 1.5rem 0',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: result.success
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        border: `1px solid ${result.success
                            ? 'rgba(34, 197, 94, 0.3)'
                            : 'rgba(239, 68, 68, 0.3)'}`,
                        color: result.success ? '#4ade80' : '#f87171',
                        fontSize: '0.85rem', fontWeight: 600, textAlign: 'center'
                    }}>
                        {result.message}
                    </div>
                )}

                {/* 칭찬 유형 선택 */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{
                        fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem',
                        display: 'flex', justifyContent: 'space-between'
                    }}>
                        <span>칭찬 유형을 선택하세요</span>
                        <span>남은 횟수: {remaining}/5</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {PRAISE_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    border: selectedType === type.id
                                        ? '2px solid #fbbf24'
                                        : '2px solid rgba(255,255,255,0.1)',
                                    background: selectedType === type.id
                                        ? 'rgba(251, 191, 36, 0.15)'
                                        : 'rgba(255,255,255,0.05)',
                                    color: selectedType === type.id ? '#fbbf24' : '#cbd5e1',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{type.icon}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{type.label}</div>
                            </button>
                        ))}
                    </div>

                    {/* 한줄 메시지 */}
                    <div style={{ marginTop: '1rem' }}>
                        <input
                            type="text"
                            placeholder="한줄 메시지 (선택사항)"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            maxLength={50}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#f1f5f9',
                                fontSize: '0.85rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                {/* 전송 버튼 */}
                <div style={{
                    padding: '0 1.5rem 1.5rem',
                    display: 'flex', gap: '0.75rem'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '0.75rem',
                            borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}
                    >취소</button>
                    <button
                        onClick={handleSend}
                        disabled={!selectedType || remaining <= 0 || sending}
                        style={{
                            flex: 1, padding: '0.75rem',
                            borderRadius: '10px', border: 'none',
                            background: selectedType && remaining > 0
                                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                                : 'rgba(255,255,255,0.1)',
                            color: selectedType && remaining > 0 ? '#0f172a' : '#64748b',
                            fontWeight: 700, fontSize: '0.9rem',
                            cursor: selectedType && remaining > 0 ? 'pointer' : 'not-allowed',
                            opacity: sending ? 0.7 : 1
                        }}
                    >
                        {sending ? '전송 중...' : '칭찬 보내기 👏'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PraiseModal;
