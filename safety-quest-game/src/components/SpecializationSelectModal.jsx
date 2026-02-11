import { useState, useEffect } from 'react';
import {
    getActiveSpecialization,
    getUnlockedSpecializations,
    switchSpecialization,
    deactivateSpecialization
} from '../utils/specializationManager';

/**
 * 전직 선택 모달
 * 해금된 전직 간 전환할 때 사용하는 모달
 */
const SpecializationSelectModal = ({ isOpen, onClose, onSwitch }) => {
    const [unlockedSpecs, setUnlockedSpecs] = useState([]);
    const [activeSpec, setActiveSpec] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setUnlockedSpecs(getUnlockedSpecializations());
            setActiveSpec(getActiveSpecialization());
        }
    }, [isOpen]);

    const handleSwitch = (specId) => {
        const result = switchSpecialization(specId);
        if (result.success) {
            setActiveSpec(getActiveSpecialization());
            if (onSwitch) onSwitch(result);
        }
    };

    const handleDeactivate = () => {
        const result = deactivateSpecialization();
        if (result.success) {
            setActiveSpec(null);
            if (onSwitch) onSwitch(result);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    maxWidth: '420px',
                    width: '90%',
                    padding: '1.5rem'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                    ⚔️ 전직 전환
                </h2>
                <p style={{
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.85rem',
                    marginBottom: '1.5rem'
                }}>
                    사용할 전직을 선택하세요
                </p>

                {unlockedSpecs.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'var(--color-text-tertiary)'
                    }}>
                        해금된 전직이 없습니다
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* 기본 기술인 옵션 */}
                        <div
                            onClick={activeSpec ? handleDeactivate : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: activeSpec ? 'pointer' : 'default',
                                background: !activeSpec ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                                border: !activeSpec ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>👷</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>기본 기술인</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                    보너스 없음
                                </div>
                            </div>
                            {!activeSpec && (
                                <span style={{
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    background: '#3b82f6',
                                    color: '#fff'
                                }}>
                                    현재
                                </span>
                            )}
                        </div>

                        {/* 해금된 전직 옵션 */}
                        {unlockedSpecs.map(spec => {
                            const isActive = activeSpec?.id === spec.id;
                            return (
                                <div
                                    key={spec.id}
                                    onClick={() => !isActive && handleSwitch(spec.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        cursor: isActive ? 'default' : 'pointer',
                                        background: isActive ? `${spec.color}15` : 'rgba(255,255,255,0.03)',
                                        border: isActive ? `1px solid ${spec.color}40` : '1px solid rgba(255,255,255,0.06)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{spec.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: spec.color }}>
                                            {spec.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                            포인트 x{spec.bonuses.pointMultiplier}
                                        </div>
                                    </div>
                                    {isActive && (
                                        <span style={{
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '999px',
                                            fontSize: '0.7rem',
                                            background: spec.color,
                                            color: '#fff'
                                        }}>
                                            현재
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '1.25rem' }}
                    onClick={onClose}
                >
                    닫기
                </button>
            </div>
        </div>
    );
};

export default SpecializationSelectModal;
