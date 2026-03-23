import { useState, useRef, useEffect } from 'react';

/**
 * QR 코드 스캔 모달
 * - 카메라로 QR 코드 스캔
 * - QR 데이터 파싱 후 체크리스트 로드
 * - html5-qrcode 미설치 시 수동 입력 폴백
 */

// QR 데이터로 매핑되는 체크리스트 템플릿
const CHECKLIST_TEMPLATES = {
    'forklift-daily': {
        name: '지게차 일일 점검표',
        icon: '🚜',
        items: [
            { id: 'brake', label: '브레이크 상태', category: '구동계' },
            { id: 'steering', label: '조향 장치', category: '구동계' },
            { id: 'horn', label: '경적/후진경보기', category: '안전장치' },
            { id: 'fork', label: '포크 상태', category: '작업부' },
            { id: 'hydraulic', label: '유압 누유 여부', category: '유압계' },
            { id: 'tire', label: '타이어 상태', category: '구동계' },
            { id: 'light', label: '전조등/후미등', category: '안전장치' },
            { id: 'seatbelt', label: '안전벨트', category: '안전장치' },
        ]
    },
    'crane-daily': {
        name: '크레인 일일 점검표',
        icon: '🏗️',
        items: [
            { id: 'wire', label: '와이어로프 상태', category: '로프' },
            { id: 'hook', label: '훅 해지장치', category: '안전장치' },
            { id: 'brake_crane', label: '브레이크 작동', category: '구동계' },
            { id: 'limit', label: '리미트 스위치', category: '안전장치' },
            { id: 'outrigger', label: '아웃리거 상태', category: '기반' },
            { id: 'signal', label: '경고등/경보기', category: '안전장치' },
        ]
    },
    'electrical-room': {
        name: '전기실 점검표',
        icon: '⚡',
        items: [
            { id: 'panel', label: '배전반 이상 유무', category: '설비' },
            { id: 'cable', label: '케이블 피복 상태', category: '설비' },
            { id: 'ground', label: '접지 상태', category: '안전' },
            { id: 'temp', label: '이상 발열 여부', category: '안전' },
            { id: 'moisture', label: '습기/누수 여부', category: '환경' },
            { id: 'fire_ext', label: '소화기 비치', category: '안전' },
            { id: 'sign', label: '경고 표지판', category: '표시' },
        ]
    },
    'scaffold-daily': {
        name: '비계 일일 점검표',
        icon: '🪜',
        items: [
            { id: 'base', label: '기초부 침하 여부', category: '기반' },
            { id: 'connection', label: '연결부 체결 상태', category: '구조' },
            { id: 'board', label: '발판 고정 상태', category: '구조' },
            { id: 'guardrail', label: '안전 난간 설치', category: '안전' },
            { id: 'net', label: '안전망 설치', category: '안전' },
            { id: 'access', label: '승강 설비 상태', category: '접근' },
        ]
    }
};

function QRScanModal({ isOpen, onClose, onChecklistLoad }) {
    const [scanResult, setScanResult] = useState(null);
    const [manualInput, setManualInput] = useState('');
    const [checklist, setChecklist] = useState(null);
    const [checkStates, setCheckStates] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [mode, setMode] = useState('scan'); // scan | checklist
    const videoRef = useRef(null);
    const [cameraError, setCameraError] = useState(false);

    useEffect(() => {
        if (isOpen && mode === 'scan') {
            startCamera();
        }
        return () => stopCamera();
    }, [isOpen, mode]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch {
            setCameraError(true);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
    };

    const handleDemoScan = (templateId) => {
        const demoData = {
            type: 'EQUIPMENT',
            id: templateId.replace('-daily', '-A01').replace('-room', '-B02'),
            templateId,
            name: CHECKLIST_TEMPLATES[templateId]?.name || templateId,
            location: '현장'
        };
        processQRData(demoData);
    };

    const handleManualInput = () => {
        try {
            const data = JSON.parse(manualInput);
            processQRData(data);
        } catch {
            // templateId 직접 입력 시도
            if (CHECKLIST_TEMPLATES[manualInput]) {
                processQRData({ templateId: manualInput, name: manualInput, location: '수동 입력' });
            }
        }
    };

    const processQRData = (data) => {
        stopCamera();
        setScanResult(data);
        const template = CHECKLIST_TEMPLATES[data.templateId];
        if (template) {
            setChecklist({ ...template, qrData: data });
            setCheckStates({});
            setMode('checklist');
        }
    };

    const toggleCheck = (itemId) => {
        setCheckStates(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const handleSubmitChecklist = () => {
        if (!checklist) return;
        setIsSubmitting(true);

        setTimeout(() => {
            const completed = Object.values(checkStates).filter(Boolean).length;
            const total = checklist.items.length;

            setSubmitResult({
                success: true,
                message: `점검 완료! ${completed}/${total} 항목 체크`,
                score: Math.round((completed / total) * 100)
            });
            setIsSubmitting(false);
            onChecklistLoad?.({
                template: checklist.name,
                qrData: checklist.qrData,
                checkStates,
                completedAt: new Date().toISOString()
            });
        }, 800);
    };

    const resetToScan = () => {
        setScanResult(null);
        setChecklist(null);
        setCheckStates({});
        setSubmitResult(null);
        setMode('scan');
        setCameraError(false);
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2000, padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))',
                    borderRadius: '20px',
                    width: '100%', maxWidth: '480px', maxHeight: '90vh',
                    overflow: 'hidden',
                    border: '2px solid rgba(6,182,212,0.4)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid rgba(6,182,212,0.2)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, color: '#22d3ee', fontWeight: 700, fontSize: '1.1rem' }}>
                        {mode === 'scan' ? '📱 QR 코드 스캔' : `${checklist?.icon} ${checklist?.name}`}
                    </h3>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none',
                        borderRadius: '50%', width: '32px', height: '32px',
                        color: '#94a3b8', cursor: 'pointer'
                    }}>✕</button>
                </div>

                <div style={{ padding: '1.25rem', overflowY: 'auto', maxHeight: 'calc(90vh - 70px)' }}>
                    {mode === 'scan' ? (
                        <>
                            {/* 카메라 뷰 */}
                            {!cameraError ? (
                                <div style={{
                                    width: '100%', height: '200px', borderRadius: '12px',
                                    overflow: 'hidden', marginBottom: '1rem',
                                    background: '#000', position: 'relative'
                                }}>
                                    <video ref={videoRef} autoPlay playsInline style={{
                                        width: '100%', height: '100%', objectFit: 'cover'
                                    }} />
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        border: '3px solid rgba(6,182,212,0.5)',
                                        borderRadius: '12px', pointerEvents: 'none'
                                    }} />
                                    <div style={{
                                        position: 'absolute', bottom: '0.5rem', left: 0, right: 0,
                                        textAlign: 'center', fontSize: '0.75rem', color: '#22d3ee'
                                    }}>
                                        QR 코드를 화면에 비추세요
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center', padding: '1.5rem',
                                    color: '#64748b', marginBottom: '1rem'
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
                                    카메라 접근이 불가합니다.<br />
                                    아래 데모 QR을 사용하세요.
                                </div>
                            )}

                            {/* 데모 QR 버튼 */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{
                                    fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem'
                                }}>
                                    데모 QR 코드 (장비별 체크리스트)
                                </div>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem'
                                }}>
                                    {Object.entries(CHECKLIST_TEMPLATES).map(([id, tmpl]) => (
                                        <button key={id} onClick={() => handleDemoScan(id)} style={{
                                            padding: '0.6rem', borderRadius: '10px',
                                            border: '1px solid rgba(6,182,212,0.2)',
                                            background: 'rgba(6,182,212,0.05)',
                                            color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600,
                                            cursor: 'pointer', textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>
                                                {tmpl.icon}
                                            </div>
                                            {tmpl.name.replace(' 일일 점검표', '').replace(' 점검표', '')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* 체크리스트 뷰 */
                        <>
                            {submitResult ? (
                                <div style={{
                                    textAlign: 'center', padding: '1.5rem'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                                        {submitResult.score >= 80 ? '🎉' : '📋'}
                                    </div>
                                    <div style={{
                                        fontWeight: 800, fontSize: '1.1rem',
                                        color: submitResult.score >= 80 ? '#4ade80' : '#fbbf24',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {submitResult.message}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                        점검 점수: {submitResult.score}점
                                    </div>
                                    <button onClick={resetToScan} style={{
                                        padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none',
                                        background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
                                        color: '#fff', fontWeight: 700, cursor: 'pointer'
                                    }}>
                                        다른 장비 스캔
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* QR 정보 */}
                                    {scanResult && (
                                        <div style={{
                                            padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '1rem',
                                            background: 'rgba(6,182,212,0.1)',
                                            border: '1px solid rgba(6,182,212,0.2)',
                                            fontSize: '0.8rem', color: '#94a3b8'
                                        }}>
                                            장비: <span style={{ color: '#22d3ee', fontWeight: 600 }}>
                                                {scanResult.name}
                                            </span>
                                            {scanResult.location && ` | 위치: ${scanResult.location}`}
                                        </div>
                                    )}

                                    {/* 체크 항목 */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        {checklist.items.map((item) => (
                                            <div key={item.id}
                                                onClick={() => toggleCheck(item.id)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                    padding: '0.7rem 0.75rem', marginBottom: '0.4rem',
                                                    borderRadius: '10px', cursor: 'pointer',
                                                    background: checkStates[item.id]
                                                        ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)',
                                                    border: `1px solid ${checkStates[item.id]
                                                        ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '6px',
                                                    border: `2px solid ${checkStates[item.id] ? '#4ade80' : 'rgba(255,255,255,0.2)'}`,
                                                    background: checkStates[item.id] ? '#4ade80' : 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0, fontSize: '0.7rem', color: '#0f172a', fontWeight: 800
                                                }}>
                                                    {checkStates[item.id] && '✓'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontSize: '0.9rem', fontWeight: 600,
                                                        color: checkStates[item.id] ? '#4ade80' : '#e2e8f0',
                                                        textDecoration: checkStates[item.id] ? 'line-through' : 'none'
                                                    }}>
                                                        {item.label}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '0.65rem', color: '#64748b',
                                                    padding: '0.15rem 0.4rem', borderRadius: '4px',
                                                    background: 'rgba(255,255,255,0.05)'
                                                }}>
                                                    {item.category}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 진행도 */}
                                    <div style={{
                                        fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center',
                                        marginBottom: '0.75rem'
                                    }}>
                                        {Object.values(checkStates).filter(Boolean).length}/{checklist.items.length} 항목 체크 완료
                                    </div>

                                    {/* 제출 */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={resetToScan} style={{
                                            padding: '0.7rem 1rem', borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: '#94a3b8', fontWeight: 600, cursor: 'pointer'
                                        }}>
                                            ← 다시 스캔
                                        </button>
                                        <button
                                            onClick={handleSubmitChecklist}
                                            disabled={isSubmitting}
                                            style={{
                                                flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none',
                                                background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
                                                color: '#fff', fontWeight: 700, cursor: 'pointer',
                                                opacity: isSubmitting ? 0.7 : 1
                                            }}
                                        >
                                            {isSubmitting ? '제출 중...' : '점검 완료 제출'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QRScanModal;
