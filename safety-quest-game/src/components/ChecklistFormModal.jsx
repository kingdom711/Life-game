import React, { useState, useEffect } from 'react';
import { triggerQuestAction } from '../utils/questManager';
import { userProfile, storage } from '../utils/storage';

const CHECKLIST_ITEMS = [
    { id: 'ppe_helmet', label: '안전모 착용 상태 확인', category: '개인보호구(PPE)' },
    { id: 'ppe_vest', label: '안전조끼 착용 상태 확인', category: '개인보호구(PPE)' },
    { id: 'ppe_shoes', label: '안전화 착용 상태 확인', category: '개인보호구(PPE)' },
    { id: 'ppe_harness', label: '안전대(고소작업 시) 착용 확인', category: '개인보호구(PPE)' },
    { id: 'equip_condition', label: '장비/공구 이상 유무 확인', category: '장비 점검' },
    { id: 'equip_power', label: '전동 공구 절연 상태 확인', category: '장비 점검' },
    { id: 'area_clean', label: '작업 구역 정리정돈 확인', category: '작업환경' },
    { id: 'area_sign', label: '안전 표지판 설치 확인', category: '작업환경' },
    { id: 'area_fire', label: '소화기 비치 및 접근성 확인', category: '작업환경' },
    { id: 'comm_tbm', label: 'TBM(작업 전 안전회의) 참석 확인', category: '소통' },
];

const MIN_CHECKED = 8;

const STORAGE_KEY = 'safety_quest_checklists';

const getStoredChecklists = () => {
    return storage.get(STORAGE_KEY, []);
};

const saveChecklist = (checklist) => {
    const existing = getStoredChecklists();
    existing.push(checklist);
    storage.set(STORAGE_KEY, existing);
};

const ChecklistFormModal = ({ isOpen, onClose, onComplete, role }) => {
    const [items, setItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setItems(CHECKLIST_ITEMS.map(item => ({
                ...item,
                checked: false,
                comment: '',
                riskFlag: false
            })));
            setShowSuccess(false);
            setError('');
        }
    }, [isOpen]);

    const toggleCheck = (index) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, checked: !item.checked } : item
        ));
    };

    const toggleRisk = (index) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, riskFlag: !item.riskFlag } : item
        ));
    };

    const updateComment = (index, comment) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, comment } : item
        ));
    };

    const checkedCount = items.filter(i => i.checked).length;
    const canSubmit = checkedCount >= MIN_CHECKED && !isSubmitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        setError('');

        // 제출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 800));

        const checklist = {
            id: `checklist_${Date.now()}`,
            submittedAt: new Date().toISOString(),
            submittedBy: userProfile.getName() || '작업자',
            role: role || 'technician',
            siteName: '현장 A',
            status: 'SUBMITTED',
            items: items.map(({ id, label, checked, comment, riskFlag }) => ({
                id, label, answer: checked, comment, riskFlag
            }))
        };

        saveChecklist(checklist);

        // 퀘스트 진행도 업데이트
        const completedQuests = triggerQuestAction('submit_checklist', role || 'technician', 1);

        setIsSubmitting(false);
        setShowSuccess(true);

        setTimeout(() => {
            if (onComplete) onComplete(completedQuests);
            onClose();
        }, 2500);
    };

    if (!isOpen) return null;

    // 카테고리별 그룹핑
    const categories = [...new Set(CHECKLIST_ITEMS.map(i => i.category))];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            {showSuccess ? (
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <div style={{
                        width: '150px', height: '150px',
                        border: '4px solid #00ff88', borderRadius: '50%',
                        margin: '0 auto 2rem',
                        boxShadow: '0 0 30px #00ff88',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '4rem',
                        animation: 'pulse 1.5s infinite'
                    }}>✓</div>
                    <h1 style={{ fontSize: '2.5rem', textShadow: '0 0 20px #00ff88', marginBottom: '1rem' }}>
                        체크리스트 제출 완료!
                    </h1>
                    <div style={{ fontSize: '1.2rem', color: '#00ff88' }}>
                        안전 점검을 완료했습니다 (+100P)
                    </div>
                </div>
            ) : (
                <div style={{
                    position: 'relative',
                    width: '95%', maxWidth: '700px', maxHeight: '90vh',
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #4a4e69',
                    borderRadius: '10px',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid #4a4e69',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        flexShrink: 0
                    }}>
                        <div>
                            <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📋 안전 체크리스트
                                <span style={{ fontSize: '0.8rem', background: '#333', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#aaa' }}>
                                    Daily Quest
                                </span>
                            </h2>
                            <p style={{ color: '#aaa', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                                작업 전 안전 점검 항목을 확인하세요. (체크: {checkedCount}/{CHECKLIST_ITEMS.length}, 최소 {MIN_CHECKED}개)
                            </p>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer'
                        }}>×</button>
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                        {categories.map(category => (
                            <div key={category} style={{ marginBottom: '1.5rem' }}>
                                <div style={{
                                    color: '#8b5cf6', fontWeight: 700, fontSize: '0.85rem',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                    marginBottom: '0.75rem', paddingBottom: '0.5rem',
                                    borderBottom: '1px solid rgba(139, 92, 246, 0.3)'
                                }}>
                                    {category}
                                </div>
                                {items.filter(i => i.category === category).map((item) => {
                                    const index = items.findIndex(i => i.id === item.id);
                                    return (
                                        <div key={item.id} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                            padding: '0.75rem',
                                            marginBottom: '0.5rem',
                                            background: item.checked ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${item.riskFlag ? '#ff4444' : item.checked ? 'rgba(0, 255, 136, 0.2)' : '#333'}`,
                                            borderRadius: '8px',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            {/* 체크박스 */}
                                            <div
                                                onClick={() => toggleCheck(index)}
                                                style={{
                                                    width: '28px', height: '28px', flexShrink: 0,
                                                    border: `2px solid ${item.checked ? '#00ff88' : '#555'}`,
                                                    borderRadius: '6px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: item.checked ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    marginTop: '2px'
                                                }}
                                            >
                                                {item.checked && <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '1.1rem' }}>✓</span>}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div
                                                    onClick={() => toggleCheck(index)}
                                                    style={{
                                                        color: item.checked ? '#e2e8f0' : '#94a3b8',
                                                        cursor: 'pointer', fontSize: '0.95rem',
                                                        textDecoration: item.checked ? 'none' : 'none',
                                                        marginBottom: '0.4rem'
                                                    }}
                                                >
                                                    {item.label}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={item.comment}
                                                    onChange={(e) => updateComment(index, e.target.value)}
                                                    placeholder="비고 (선택사항)"
                                                    style={{
                                                        width: '100%', padding: '0.35rem 0.5rem',
                                                        background: '#0f0f23', border: '1px solid #333',
                                                        borderRadius: '4px', color: '#cbd5e1',
                                                        fontSize: '0.8rem'
                                                    }}
                                                />
                                            </div>

                                            {/* 위험 플래그 */}
                                            <div
                                                onClick={() => toggleRisk(index)}
                                                title="위험 요인 플래그"
                                                style={{
                                                    width: '32px', height: '32px', flexShrink: 0,
                                                    borderRadius: '6px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: item.riskFlag ? 'rgba(255, 68, 68, 0.2)' : 'transparent',
                                                    border: `1px solid ${item.riskFlag ? '#ff4444' : '#444'}`,
                                                    transition: 'all 0.2s ease',
                                                    marginTop: '2px'
                                                }}
                                            >
                                                <span style={{ fontSize: '1rem' }}>{item.riskFlag ? '🚨' : '⚑'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid #4a4e69',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        flexShrink: 0
                    }}>
                        <div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '0.85rem', height: '1.5rem' }}>
                            {error}
                            {!error && checkedCount < MIN_CHECKED && (
                                <span style={{ color: '#aaa' }}>
                                    {MIN_CHECKED - checkedCount}개 항목을 더 체크해주세요
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            style={{
                                padding: '0.8rem 2rem',
                                background: canSubmit ? 'linear-gradient(45deg, #00ff88, #00cc6a)' : '#333',
                                color: canSubmit ? '#000' : '#666',
                                border: 'none', borderRadius: '30px',
                                fontWeight: 'bold', fontSize: '1rem',
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                boxShadow: canSubmit ? '0 0 20px rgba(0, 255, 136, 0.4)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isSubmitting ? '제출 중...' : '체크리스트 제출'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChecklistFormModal;
