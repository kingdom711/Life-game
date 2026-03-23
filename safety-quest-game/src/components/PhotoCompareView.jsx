import { useState } from 'react';

/**
 * 사진 비교 체크리스트 컴포넌트
 * - 이전 점검 사진과 현재 사진을 나란히 비교
 * - 변화 메모 입력
 * - AI 변화 감지 시뮬레이션
 */
function PhotoCompareView({ isOpen, onClose, onSubmit, location = 'B동 2층 전기실' }) {
    const [currentPhoto, setCurrentPhoto] = useState(null);
    const [currentPhotoPreview, setCurrentPhotoPreview] = useState(null);
    const [changeMemo, setChangeMemo] = useState('');
    const [changeStatus, setChangeStatus] = useState(null); // 'no_change' | 'changed'
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // 이전 점검 사진 (시뮬레이션)
    const previousPhoto = {
        url: '/hazzard/1.png',
        date: '2026-03-13',
        inspector: '박점검'
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCurrentPhoto(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setCurrentPhotoPreview(ev.target.result);
            // AI 분석 시뮬레이션
            runAiAnalysis();
        };
        reader.readAsDataURL(file);
    };

    const runAiAnalysis = () => {
        setIsAnalyzing(true);
        setAiAnalysis(null);

        setTimeout(() => {
            // AI 분석 결과 시뮬레이션
            const analyses = [
                { hasChange: true, message: '전선 피복 손상 범위가 확대된 것으로 보입니다. 즉시 점검을 권장합니다.', severity: 'high' },
                { hasChange: true, message: '장비 배치에 미세한 변화가 감지되었습니다. 확인이 필요합니다.', severity: 'medium' },
                { hasChange: false, message: '이전 점검 대비 유의미한 변화가 감지되지 않았습니다.', severity: 'low' },
                { hasChange: true, message: '바닥 표시 라인이 마모된 것으로 보입니다. 재도색을 권장합니다.', severity: 'medium' },
            ];
            setAiAnalysis(analyses[Math.floor(Math.random() * analyses.length)]);
            setIsAnalyzing(false);
        }, 2000);
    };

    const handleSubmit = () => {
        onSubmit?.({
            location,
            previousDate: previousPhoto.date,
            currentDate: new Date().toISOString().split('T')[0],
            changeStatus,
            changeMemo,
            aiAnalysis,
            hasPhoto: !!currentPhoto
        });
        // 초기화
        setCurrentPhoto(null);
        setCurrentPhotoPreview(null);
        setChangeMemo('');
        setChangeStatus(null);
        setAiAnalysis(null);
        onClose?.();
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
                    width: '100%', maxWidth: '560px', maxHeight: '90vh',
                    overflow: 'hidden',
                    border: '2px solid rgba(59,130,246,0.4)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#60a5fa', fontWeight: 700, fontSize: '1.1rem' }}>
                            📸 사진 비교 점검
                        </h3>
                        <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                            {location}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none',
                        borderRadius: '50%', width: '32px', height: '32px',
                        color: '#94a3b8', cursor: 'pointer'
                    }}>✕</button>
                </div>

                <div style={{ padding: '1.25rem', overflowY: 'auto', maxHeight: 'calc(90vh - 70px)' }}>
                    {/* 사진 비교 영역 */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem', marginBottom: '1rem'
                    }}>
                        {/* 이전 점검 사진 */}
                        <div>
                            <div style={{
                                fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem',
                                fontWeight: 600
                            }}>
                                이전 점검 ({previousPhoto.date})
                            </div>
                            <div style={{
                                height: '160px', borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={previousPhoto.url}
                                    alt="이전 점검 사진"
                                    style={{
                                        maxWidth: '100%', maxHeight: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = '<div style="color:#64748b;font-size:0.8rem;text-align:center">이전 사진<br/>미리보기</div>';
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                                점검자: {previousPhoto.inspector}
                            </div>
                        </div>

                        {/* 현재 점검 사진 */}
                        <div>
                            <div style={{
                                fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem',
                                fontWeight: 600
                            }}>
                                현재 점검 (오늘)
                            </div>
                            <label style={{
                                height: '160px', borderRadius: '10px',
                                border: `2px dashed ${currentPhotoPreview ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.15)'}`,
                                background: currentPhotoPreview ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.02)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', overflow: 'hidden'
                            }}>
                                {currentPhotoPreview ? (
                                    <img src={currentPhotoPreview} alt="현재 사진"
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>📷</div>
                                        사진 촬영/선택
                                    </div>
                                )}
                                <input type="file" accept="image/*" capture="environment"
                                    onChange={handlePhotoSelect}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </div>

                    {/* AI 분석 결과 */}
                    {isAnalyzing && (
                        <div style={{
                            padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
                            background: 'rgba(59,130,246,0.1)',
                            border: '1px solid rgba(59,130,246,0.2)',
                            textAlign: 'center', fontSize: '0.85rem', color: '#60a5fa'
                        }}>
                            🤖 AI가 두 사진을 비교 분석하고 있습니다...
                        </div>
                    )}

                    {aiAnalysis && (
                        <div style={{
                            padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
                            background: aiAnalysis.hasChange
                                ? aiAnalysis.severity === 'high'
                                    ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)'
                                : 'rgba(34,197,94,0.1)',
                            border: `1px solid ${aiAnalysis.hasChange
                                ? aiAnalysis.severity === 'high'
                                    ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'
                                : 'rgba(34,197,94,0.3)'}`
                        }}>
                            <div style={{
                                fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem',
                                color: aiAnalysis.hasChange
                                    ? aiAnalysis.severity === 'high' ? '#f87171' : '#fbbf24'
                                    : '#4ade80'
                            }}>
                                {aiAnalysis.hasChange ? '⚠️ AI 변화 감지' : '✅ 변화 없음'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                                {aiAnalysis.message}
                            </div>
                        </div>
                    )}

                    {/* 변화 상태 선택 */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                            fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem'
                        }}>
                            점검 결과
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setChangeStatus('no_change')}
                                style={{
                                    flex: 1, padding: '0.6rem', borderRadius: '10px',
                                    border: changeStatus === 'no_change'
                                        ? '2px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    background: changeStatus === 'no_change'
                                        ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                                    color: changeStatus === 'no_change' ? '#4ade80' : '#94a3b8',
                                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                                }}
                            >
                                ✅ 이상 없음
                            </button>
                            <button
                                onClick={() => setChangeStatus('changed')}
                                style={{
                                    flex: 1, padding: '0.6rem', borderRadius: '10px',
                                    border: changeStatus === 'changed'
                                        ? '2px solid rgba(234,179,8,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    background: changeStatus === 'changed'
                                        ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.03)',
                                    color: changeStatus === 'changed' ? '#fbbf24' : '#94a3b8',
                                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                                }}
                            >
                                ⚠️ 변화 있음
                            </button>
                        </div>
                    </div>

                    {/* 변화 메모 */}
                    {changeStatus === 'changed' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{
                                fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem'
                            }}>
                                변화 상세 기록
                            </div>
                            <textarea
                                value={changeMemo}
                                onChange={(e) => setChangeMemo(e.target.value)}
                                placeholder="변화 내용을 기록하세요..."
                                rows={3}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)', color: '#e2e8f0',
                                    fontSize: '0.85rem', resize: 'vertical',
                                    fontFamily: 'inherit', boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    )}

                    {/* 제출 버튼 */}
                    <button
                        onClick={handleSubmit}
                        disabled={!changeStatus}
                        style={{
                            width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'none',
                            background: changeStatus
                                ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                                : 'rgba(255,255,255,0.1)',
                            color: changeStatus ? '#fff' : '#64748b',
                            fontWeight: 700, fontSize: '1rem',
                            cursor: changeStatus ? 'pointer' : 'not-allowed'
                        }}
                    >
                        점검 완료 제출
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PhotoCompareView;
