import React, { useState, useEffect } from 'react';
import { triggerQuestAction } from '../utils/questManager';
import { userProfile, storage } from '../utils/storage';
import checklistApi from '../api/checklistApi';

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

        try {
            await checklistApi.submitChecklist({ siteName: checklist.siteName, items: checklist.items });
        } catch (submitError) {
            setError(submitError.message || '체크리스트 제출에 실패했습니다.');
            setIsSubmitting(false);
            return;
        }

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
            backgroundColor: 'rgb(36 38 54 / 48%)',
            zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'none'
        }}>
            {showSuccess ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text)', background: 'var(--color-surface)', borderRadius: 16, padding: '2rem', margin: '1rem' }}>
                    <div style={{
                        width: '150px', height: '150px',
                        border: '4px solid var(--color-safe)', borderRadius: '50%',
                        margin: '0 auto 2rem',
                        boxShadow: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '4rem',
                        animation: 'pulse 1.5s infinite'
                    }}>✓</div>
                    <h1 style={{ fontSize: '2.5rem', textShadow: 'none', marginBottom: '1rem' }}>
                        체크리스트 제출 완료!
                    </h1>
                    <div style={{ fontSize: '1.2rem', color: 'var(--color-safe)' }}>
                        안전 점검을 완료했습니다 (+100P)
                    </div>
                </div>
            ) : (
                <div className="checklist-modal-panel" role="dialog" aria-modal="true" aria-label="안전 체크리스트" style={{
                    position: 'relative',
                    width: '95%', maxWidth: '700px', maxHeight: '90vh',
                    backgroundColor: 'var(--color-surface)', color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    {/* Header */}
                    <div className="checklist-modal-header" style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--color-surface-subtle)',
                        flexShrink: 0
                    }}>
                        <div>
                            <h2 style={{ color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📋 안전 체크리스트
                                <span style={{ fontSize: '0.8rem', background: 'var(--color-surface-subtle)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                                    Daily Quest
                                </span>
                            </h2>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                                작업 전 안전 점검 항목을 확인하세요. (체크: {checkedCount}/{CHECKLIST_ITEMS.length}, 최소 {MIN_CHECKED}개)
                            </p>
                        </div>
                        <button type="button" aria-label="체크리스트 닫기" onClick={onClose} style={{
                            background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '2rem', cursor: 'pointer'
                        }}>×</button>
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                        {categories.map(category => (
                            <div key={category} style={{ marginBottom: '1.5rem' }}>
                                <div style={{
                                    color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem',
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
                                            background: item.checked ? 'var(--color-safe-bg)' : 'var(--color-surface)',
                                            border: `1px solid ${item.riskFlag ? 'var(--color-danger-border)' : item.checked ? 'var(--color-safe-border)' : 'var(--color-border)'}`,
                                            borderRadius: '8px',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            {/* 체크박스 */}
                                            <button
                                                type="button"
                                                role="checkbox"
                                                aria-checked={item.checked}
                                                aria-label={item.label}
                                                onClick={() => toggleCheck(index)}
                                                style={{
                                                    width: '28px', height: '28px', flexShrink: 0,
                                                    border: `2px solid ${item.checked ? 'var(--color-safe)' : 'var(--color-text-muted)'}`,
                                                    borderRadius: '6px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: item.checked ? 'var(--color-safe-bg)' : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    marginTop: '2px'
                                                }}
                                            >
                                                {item.checked && <span style={{ color: 'var(--color-safe)', fontWeight: 'bold', fontSize: '1.1rem' }}>✓</span>}
                                            </button>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    onClick={() => toggleCheck(index)}
                                                    style={{
                                                        color: item.checked ? 'var(--color-text)' : 'var(--color-text-muted)',
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
                                                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                                        borderRadius: '4px', color: 'var(--color-text-secondary)',
                                                        fontSize: '0.8rem'
                                                    }}
                                                />
                                            </div>

                                            {/* 위험 플래그 */}
                                            <button
                                                type="button"
                                                aria-pressed={item.riskFlag}
                                                aria-label={`${item.label} 위험 요인 표시`}
                                                onClick={() => toggleRisk(index)}
                                                title="위험 요인 플래그"
                                                style={{
                                                    width: '32px', height: '32px', flexShrink: 0,
                                                    borderRadius: '6px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: item.riskFlag ? 'var(--color-danger-bg)' : 'transparent',
                                                    border: `1px solid ${item.riskFlag ? 'var(--color-danger)' : 'var(--color-text-muted)'}`,
                                                    transition: 'all 0.2s ease',
                                                    marginTop: '2px'
                                                }}
                                            >
                                                <span style={{ fontSize: '1rem' }}>{item.riskFlag ? '🚨' : '⚑'}</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="checklist-modal-footer" style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--color-surface-subtle)',
                        flexShrink: 0
                    }}>
                        <div style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '0.85rem', height: '1.5rem' }}>
                            {error}
                            {!error && checkedCount < MIN_CHECKED && (
                                <span style={{ color: 'var(--color-text-muted)' }}>
                                    {MIN_CHECKED - checkedCount}개 항목을 더 체크해주세요
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            style={{
                                padding: '0.8rem 2rem',
                                background: canSubmit ? 'var(--color-safe)' : 'var(--color-surface-subtle)',
                                color: canSubmit ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                border: 'none', borderRadius: '30px',
                                fontWeight: 'bold', fontSize: '1rem',
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                boxShadow: canSubmit ? 'none' : 'none',
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
