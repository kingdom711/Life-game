import React, { useState, useEffect } from 'react';
import { triggerQuestAction } from '../utils/questManager';
import { storage } from '../utils/storage';

const STORAGE_KEY = 'safety_quest_checklists';
const REVIEW_STORAGE_KEY = 'safety_quest_reviews';

// 데모용 목업 체크리스트 (제출된 체크리스트가 없을 경우)
const MOCK_CHECKLISTS = [
    {
        id: 'mock_cl_1',
        submittedAt: new Date(Date.now() - 3600000).toISOString(),
        submittedBy: '김작업',
        role: 'technician',
        siteName: '현장 A - 2구역',
        status: 'SUBMITTED',
        items: [
            { id: 'ppe_helmet', label: '안전모 착용 상태 확인', answer: true, comment: '', riskFlag: false },
            { id: 'ppe_vest', label: '안전조끼 착용 상태 확인', answer: true, comment: '', riskFlag: false },
            { id: 'ppe_shoes', label: '안전화 착용 상태 확인', answer: true, comment: '', riskFlag: false },
            { id: 'ppe_harness', label: '안전대(고소작업 시) 착용 확인', answer: false, comment: '고소작업 없음', riskFlag: false },
            { id: 'equip_condition', label: '장비/공구 이상 유무 확인', answer: true, comment: '', riskFlag: false },
            { id: 'equip_power', label: '전동 공구 절연 상태 확인', answer: true, comment: '이상 없음', riskFlag: false },
            { id: 'area_clean', label: '작업 구역 정리정돈 확인', answer: true, comment: '', riskFlag: false },
            { id: 'area_sign', label: '안전 표지판 설치 확인', answer: true, comment: '', riskFlag: false },
            { id: 'area_fire', label: '소화기 비치 및 접근성 확인', answer: true, comment: '', riskFlag: true },
            { id: 'comm_tbm', label: 'TBM(작업 전 안전회의) 참석 확인', answer: true, comment: '', riskFlag: false },
        ]
    },
    {
        id: 'mock_cl_2',
        submittedAt: new Date(Date.now() - 7200000).toISOString(),
        submittedBy: '이안전',
        role: 'technician',
        siteName: '현장 A - 5구역',
        status: 'SUBMITTED',
        items: [
            { id: 'ppe_helmet', label: '안전모 착용 상태 확인', answer: true, comment: '', riskFlag: false },
            { id: 'ppe_vest', label: '안전조끼 착용 상태 확인', answer: true, comment: '', riskFlag: false },
            { id: 'ppe_shoes', label: '안전화 착용 상태 확인', answer: false, comment: '안전화 교체 필요', riskFlag: true },
            { id: 'ppe_harness', label: '안전대(고소작업 시) 착용 확인', answer: true, comment: '', riskFlag: false },
            { id: 'equip_condition', label: '장비/공구 이상 유무 확인', answer: true, comment: '', riskFlag: false },
            { id: 'equip_power', label: '전동 공구 절연 상태 확인', answer: false, comment: '절연 테이프 교체 필요', riskFlag: true },
            { id: 'area_clean', label: '작업 구역 정리정돈 확인', answer: true, comment: '', riskFlag: false },
            { id: 'area_sign', label: '안전 표지판 설치 확인', answer: true, comment: '', riskFlag: false },
            { id: 'area_fire', label: '소화기 비치 및 접근성 확인', answer: true, comment: '', riskFlag: false },
            { id: 'comm_tbm', label: 'TBM(작업 전 안전회의) 참석 확인', answer: true, comment: '', riskFlag: false },
        ]
    },
    {
        id: 'mock_cl_3',
        submittedAt: new Date(Date.now() - 1800000).toISOString(),
        submittedBy: '박현장',
        role: 'technician',
        siteName: '현장 B - 1구역',
        status: 'SUBMITTED',
        items: [
            { id: 'ppe_helmet', label: '안전모 착용 상태 확인', answer: true, comment: '', riskFlag: false },
            { id: 'ppe_vest', label: '안전조끼 착용 상태 확인', answer: true, comment: '', riskFlag: false },
            { id: 'ppe_shoes', label: '안전화 착용 상태 확인', answer: true, comment: '', riskFlag: false },
            { id: 'ppe_harness', label: '안전대(고소작업 시) 착용 확인', answer: true, comment: '안전대 점검 완료', riskFlag: false },
            { id: 'equip_condition', label: '장비/공구 이상 유무 확인', answer: true, comment: '', riskFlag: false },
            { id: 'equip_power', label: '전동 공구 절연 상태 확인', answer: true, comment: '', riskFlag: false },
            { id: 'area_clean', label: '작업 구역 정리정돈 확인', answer: false, comment: '자재 정리 필요', riskFlag: true },
            { id: 'area_sign', label: '안전 표지판 설치 확인', answer: true, comment: '', riskFlag: false },
            { id: 'area_fire', label: '소화기 비치 및 접근성 확인', answer: true, comment: '', riskFlag: false },
            { id: 'comm_tbm', label: 'TBM(작업 전 안전회의) 참석 확인', answer: true, comment: '', riskFlag: false },
        ]
    }
];

const getSubmittedChecklists = () => {
    const stored = storage.get(STORAGE_KEY, []);
    const submitted = stored.filter(c => c.status === 'SUBMITTED');
    // 제출된 체크리스트가 없으면 목업 데이터 사용
    return submitted.length > 0 ? submitted : MOCK_CHECKLISTS;
};

const updateChecklistStatus = (checklistId, status) => {
    const stored = storage.get(STORAGE_KEY, []);
    const updated = stored.map(c => c.id === checklistId ? { ...c, status } : c);
    storage.set(STORAGE_KEY, updated);
};

const saveReview = (review) => {
    const reviews = storage.get(REVIEW_STORAGE_KEY, []);
    reviews.push(review);
    storage.set(REVIEW_STORAGE_KEY, reviews);
};

const formatTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
};

const ChecklistReviewModal = ({ isOpen, onClose, onComplete }) => {
    const [checklists, setChecklists] = useState([]);
    const [selected, setSelected] = useState(null);
    const [comment, setComment] = useState('');
    const [reviewedCount, setReviewedCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setChecklists(getSubmittedChecklists());
            setSelected(null);
            setComment('');
            setReviewedCount(0);
            setShowSuccess(false);
            setError('');
        }
    }, [isOpen]);

    const handleReview = (action) => {
        if (!selected) return;
        if (action === 'REJECT' && comment.trim().length < 5) {
            setError('반려 시 사유를 5자 이상 작성해주세요.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        const review = {
            id: `review_${Date.now()}`,
            checklistId: selected.id,
            action,
            comment: comment.trim(),
            reviewedAt: new Date().toISOString()
        };

        saveReview(review);
        updateChecklistStatus(selected.id, action === 'APPROVE' ? 'APPROVED' : 'REJECTED');

        // 퀘스트 진행
        const completedQuests = triggerQuestAction('review_checklist', 'supervisor', 1);
        const newCount = reviewedCount + 1;
        setReviewedCount(newCount);

        // 목록에서 제거
        setChecklists(prev => prev.filter(c => c.id !== selected.id));
        setSelected(null);
        setComment('');

        // 2건 완료 시 성공 표시
        if (newCount >= 2) {
            setShowSuccess(true);
            setTimeout(() => {
                if (onComplete) onComplete(completedQuests);
                onClose();
            }, 2500);
        }
    };

    if (!isOpen) return null;

    const riskCount = selected ? selected.items.filter(i => i.riskFlag).length : 0;
    const checkedCount = selected ? selected.items.filter(i => i.answer).length : 0;

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
                        검토 완료!
                    </h1>
                    <div style={{ fontSize: '1.2rem', color: 'var(--color-safe)' }}>
                        체크리스트 {reviewedCount}건 검토 완료 (+200P)
                    </div>
                </div>
            ) : (
                <div className="checklist-modal-panel" role="dialog" aria-modal="true" aria-label="체크리스트 검토" style={{
                    position: 'relative',
                    width: '95%', maxWidth: '900px', maxHeight: '90vh',
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
                                🔍 체크리스트 검토
                                <span style={{ fontSize: '0.8rem', background: 'var(--color-surface-subtle)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                                    Daily Quest · {reviewedCount}/2건
                                </span>
                            </h2>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                                작업자가 제출한 체크리스트를 검토하고 피드백을 제공하세요.
                            </p>
                        </div>
                        <button type="button" aria-label="체크리스트 닫기" onClick={onClose} style={{
                            background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '2rem', cursor: 'pointer'
                        }}>×</button>
                    </div>

                    {/* Body */}
                    <div className="checklist-review-body">
                        {/* 좌측: 목록 */}
                        <div className="checklist-review-list" style={{
                            flexShrink: 0,
                            borderRight: '1px solid var(--color-border)',
                            overflowY: 'auto',
                            background: 'var(--color-surface-subtle)'
                        }}>
                            <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                                검토 대기 ({checklists.length}건)
                            </div>
                            {checklists.length === 0 ? (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    검토 대기 중인 체크리스트가 없습니다.
                                </div>
                            ) : (
                                checklists.map(cl => (
                                    <div
                                        key={cl.id}
                                        onClick={() => { setSelected(cl); setComment(''); setError(''); }}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--color-border-light)',
                                            background: selected?.id === cl.id ? 'var(--color-primary-soft)' : 'transparent',
                                            borderLeft: selected?.id === cl.id ? '3px solid #8b5cf6' : '3px solid transparent',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <span style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem' }}>
                                                {cl.submittedBy}
                                            </span>
                                            {cl.items.some(i => i.riskFlag) && (
                                                <span style={{ fontSize: '0.7rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                                                    위험
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                            {cl.siteName} · {formatTimeAgo(cl.submittedAt)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* 우측: 상세 */}
                        <div className="checklist-review-detail" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '1.5rem' }}>
                            {!selected ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                                    <div>목록에서 체크리스트를 선택하세요</div>
                                </div>
                            ) : (
                                <>
                                    {/* 체크리스트 정보 */}
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)'
                                    }}>
                                        <div>
                                            <div style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: '1.1rem' }}>
                                                {selected.submittedBy} · {selected.siteName}
                                            </div>
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                제출: {new Date(selected.submittedAt).toLocaleString('ko-KR')}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                                                background: 'var(--color-safe-bg)', color: 'var(--color-safe)'
                                            }}>
                                                체크 {checkedCount}/{selected.items.length}
                                            </span>
                                            {riskCount > 0 && (
                                                <span style={{
                                                    fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                                                    background: 'var(--color-danger-bg)', color: 'var(--color-danger)'
                                                }}>
                                                    위험 {riskCount}건
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 항목 목록 */}
                                    {selected.items.map((item, idx) => (
                                        <div key={item.id || idx} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.6rem 0.75rem', marginBottom: '0.4rem',
                                            background: item.riskFlag ? 'var(--color-danger-bg)' : 'var(--color-surface)',
                                            border: `1px solid ${item.riskFlag ? 'var(--color-danger-border)' : 'var(--color-border)'}`,
                                            borderRadius: '6px', fontSize: '0.85rem'
                                        }}>
                                            <span style={{
                                                width: '22px', height: '22px', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRadius: '4px', fontSize: '0.85rem',
                                                background: item.answer ? 'var(--color-safe-bg)' : 'var(--color-danger-bg)',
                                                color: item.answer ? 'var(--color-safe)' : 'var(--color-danger)'
                                            }}>
                                                {item.answer ? '✓' : '✗'}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                                                {item.comment && (
                                                    <span style={{ color: 'var(--color-primary)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                                                        — {item.comment}
                                                    </span>
                                                )}
                                            </div>
                                            {item.riskFlag && <span style={{ fontSize: '0.85rem' }}>🚨</span>}
                                        </div>
                                    ))}

                                    {/* 코멘트 입력 */}
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                            검토 코멘트
                                        </div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="검토 의견을 작성하세요 (반려 시 필수)"
                                            style={{
                                                width: '100%', height: '80px',
                                                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                                borderRadius: '6px', color: 'var(--color-text-secondary)',
                                                padding: '0.75rem', fontSize: '0.85rem',
                                                resize: 'none'
                                            }}
                                        />
                                    </div>

                                    {/* 승인/반려 버튼 */}
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                        <button
                                            onClick={() => handleReview('REJECT')}
                                            style={{
                                                flex: 1, padding: '0.75rem',
                                                background: 'var(--color-danger-bg)',
                                                border: '1px solid rgba(255, 68, 68, 0.4)',
                                                color: 'var(--color-danger)', borderRadius: '8px',
                                                fontWeight: 700, cursor: 'pointer',
                                                fontSize: '0.95rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            반려
                                        </button>
                                        <button
                                            onClick={() => handleReview('APPROVE')}
                                            style={{
                                                flex: 1, padding: '0.75rem',
                                                background: 'var(--color-safe)',
                                                border: 'none', color: 'var(--color-on-primary)',
                                                borderRadius: '8px', fontWeight: 700,
                                                cursor: 'pointer', fontSize: '0.95rem',
                                                boxShadow: 'none',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            승인
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="checklist-modal-footer" style={{
                        padding: '0.75rem 1.5rem',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--color-surface-subtle)',
                        flexShrink: 0
                    }}>
                        <div style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '0.85rem', height: '1.5rem' }}>
                            {error}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            검토 완료: <span style={{ color: reviewedCount >= 2 ? 'var(--color-safe)' : 'var(--color-warning)', fontWeight: 700 }}>{reviewedCount}</span> / 2건
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChecklistReviewModal;
