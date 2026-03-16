/**
 * 작업중지 신고 다이얼로그
 *
 * 계획서 2-2, 2-3:
 * - STEP 1: 확인 다이얼로그 (오터치 방지)
 * - STEP 2: 위험 유형 선택 + 상세 정보 입력
 * - STEP 3: 전파 완료 + 용기 포인트 500P 획득
 */

import { useState, useEffect, useRef } from 'react';
import {
    HAZARD_TYPES,
    createWorkStopReport
} from '../utils/workStopManager';
import { userProfile } from '../utils/storage';

const STEP = { CONFIRM: 'confirm', DETAIL: 'detail', COMPLETE: 'complete' };

function WorkStopReportModal({ isOpen, onClose, onComplete }) {
    const [step, setStep] = useState(STEP.CONFIRM);
    const [selectedHazard, setSelectedHazard] = useState(null);
    const [description, setDescription] = useState('');
    const [zone, setZone] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [createdReport, setCreatedReport] = useState(null);
    const readyRef = useRef(false);

    // 모달이 열린 직후 배경 클릭 방지 (이벤트 전파 방지)
    useEffect(() => {
        if (isOpen) {
            readyRef.current = false;
            const timer = setTimeout(() => { readyRef.current = true; }, 200);
            return () => clearTimeout(timer);
        }
        readyRef.current = false;
    }, [isOpen]);

    const resetAndClose = () => {
        setStep(STEP.CONFIRM);
        setSelectedHazard(null);
        setDescription('');
        setZone('');
        setIsAnonymous(false);
        setCreatedReport(null);
        onClose();
    };

    const handleConfirm = () => {
        setStep(STEP.DETAIL);
    };

    const handleSubmit = () => {
        if (!selectedHazard) return;

        const reporterName = userProfile.getName() || '사용자';
        const report = createWorkStopReport({
            hazardType: selectedHazard,
            description,
            zone,
            isAnonymous,
            reporterName
        });

        setCreatedReport(report);
        setStep(STEP.COMPLETE);

        if (onComplete) {
            onComplete(report);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '1rem'
            }}
            onClick={() => { if (readyRef.current) resetAndClose(); }}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #1e1b2e 0%, #1a1530 100%)',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '480px',
                    maxHeight: '85vh',
                    overflow: 'auto',
                    border: '2px solid rgba(220, 38, 38, 0.5)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 60px rgba(220, 38, 38, 0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ═══ STEP 1: 확인 다이얼로그 ═══ */}
                {step === STEP.CONFIRM && (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
                            <h2 style={{
                                color: '#fbbf24',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                margin: '0 0 0.5rem 0'
                            }}>
                                작업중지를 행사하시겠습니까?
                            </h2>
                            <p style={{
                                color: 'rgba(203, 213, 225, 0.8)',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                                margin: 0
                            }}>
                                산업안전보건법 제52조에 따라<br />
                                산업재해 발생 우려 시 작업을 중지할 수 있습니다.
                            </p>
                        </div>

                        <div style={{
                            background: 'rgba(220, 38, 38, 0.1)',
                            border: '1px solid rgba(220, 38, 38, 0.3)',
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{
                                color: 'rgba(252, 165, 165, 0.9)',
                                fontSize: '0.85rem',
                                lineHeight: 1.6,
                                margin: 0
                            }}>
                                작업중지권 행사 시 <strong style={{ color: '#fbbf24' }}>500P 용기 포인트</strong>가 지급되며,
                                행사 후 <strong>30일간 보호 기간</strong>이 적용됩니다.
                                보복 행위 발생 시 형사처벌 대상입니다.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={resetAndClose}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                    background: 'rgba(100, 116, 139, 0.2)',
                                    color: 'rgba(203, 213, 225, 0.8)',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirm}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
                                }}
                            >
                                ✋ 행사
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ STEP 2: 상세 정보 입력 ═══ */}
                {step === STEP.DETAIL && (
                    <div style={{ padding: '1.5rem' }}>
                        <h2 style={{
                            color: '#f87171',
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            margin: '0 0 1.25rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            ✋ 작업중지 신고
                        </h2>

                        {/* 위험 유형 선택 */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{
                                display: 'block',
                                color: 'rgba(203, 213, 225, 0.9)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                marginBottom: '0.5rem'
                            }}>
                                위험 유형 선택 *
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.5rem'
                            }}>
                                {HAZARD_TYPES.map(hazard => (
                                    <button
                                        key={hazard.id}
                                        onClick={() => setSelectedHazard(hazard.id)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: selectedHazard === hazard.id
                                                ? `2px solid ${hazard.color}`
                                                : '2px solid rgba(148, 163, 184, 0.2)',
                                            background: selectedHazard === hazard.id
                                                ? `${hazard.color}22`
                                                : 'rgba(30, 27, 46, 0.5)',
                                            color: selectedHazard === hazard.id ? hazard.color : 'rgba(203, 213, 225, 0.7)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span>{hazard.icon}</span>
                                        {hazard.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 구역 */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                color: 'rgba(203, 213, 225, 0.9)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                marginBottom: '0.5rem'
                            }}>
                                위치 (구역)
                            </label>
                            <input
                                type="text"
                                value={zone}
                                onChange={(e) => setZone(e.target.value)}
                                placeholder="예: B구역, 3층 화장실 옆"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    color: 'rgba(203, 213, 225, 0.9)',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* 상황 설명 */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                color: 'rgba(203, 213, 225, 0.9)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                marginBottom: '0.5rem'
                            }}>
                                상황 설명
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="위험 상황을 간단히 설명해 주세요..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    color: 'rgba(203, 213, 225, 0.9)',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* 익명 선택 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1.5rem',
                            padding: '0.75rem',
                            borderRadius: '10px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                            <input
                                type="checkbox"
                                id="anonymous"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="anonymous" style={{
                                color: 'rgba(203, 213, 225, 0.9)',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}>
                                <strong>익명 신고</strong> — 관리자에게 신고자 비공개
                            </label>
                        </div>

                        {/* 제출 */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setStep(STEP.CONFIRM)}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                    background: 'rgba(100, 116, 139, 0.2)',
                                    color: 'rgba(203, 213, 225, 0.8)',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                뒤로
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedHazard}
                                style={{
                                    flex: 2,
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: selectedHazard
                                        ? 'linear-gradient(135deg, #dc2626, #991b1b)'
                                        : 'rgba(100, 116, 139, 0.3)',
                                    color: selectedHazard ? 'white' : 'rgba(203, 213, 225, 0.4)',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: selectedHazard ? 'pointer' : 'not-allowed',
                                    boxShadow: selectedHazard ? '0 4px 15px rgba(220, 38, 38, 0.4)' : 'none'
                                }}
                            >
                                🚨 작업중지 신고
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ STEP 3: 전파 완료 ═══ */}
                {step === STEP.COMPLETE && createdReport && (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            fontSize: '2rem',
                            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
                        }}>
                            ✅
                        </div>

                        <h2 style={{
                            color: '#4ade80',
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            margin: '0 0 0.5rem 0'
                        }}>
                            작업중지가 전파되었습니다
                        </h2>

                        <div style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '1rem',
                            textAlign: 'left'
                        }}>
                            <div style={{ color: 'rgba(203, 213, 225, 0.9)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                                <div>✅ 전체 알림 발송 완료</div>
                                <div>✅ 관리감독자 통보 완료</div>
                                <div>✅ 안전관리자 통보 완료</div>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                color: '#fbbf24',
                                fontSize: '1.5rem',
                                fontWeight: 800
                            }}>
                                +500P
                            </div>
                            <div style={{
                                color: 'rgba(203, 213, 225, 0.7)',
                                fontSize: '0.8rem'
                            }}>
                                용기 포인트 획득!
                            </div>
                        </div>

                        <div style={{
                            color: 'rgba(203, 213, 225, 0.5)',
                            fontSize: '0.75rem',
                            marginBottom: '1.5rem'
                        }}>
                            타임스탬프: {new Date(createdReport.createdAt).toLocaleString('ko-KR')}
                        </div>

                        <button
                            onClick={resetAndClose}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            확인
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WorkStopReportModal;
