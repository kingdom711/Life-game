import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { geminiService } from '../utils/geminiService';
import GEMSResultCard from '../components/GEMSResultCard';

// 디버깅용 기본 placeholder 텍스트 (완결된 문장 형태)
const DEFAULT_RISK_TEXT = '건설 현장 2층 비계 작업 중 안전난간이 심하게 흔들리고 있습니다. 작업자 3명이 해당 구역에서 철골 용접 작업을 진행 중이며, 안전대 체결 상태가 불량하여 추락 사고 위험이 매우 높은 상황입니다.';

const RiskSolutionPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('input'); // input, analyzing, result
    const [inputText, setInputText] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        // 입력이 비어있으면 placeholder 텍스트 사용 (디버깅 모드)
        const textToSubmit = inputText.trim() || DEFAULT_RISK_TEXT;

        setStep('analyzing');
        setError(null);

        try {
            const result = await geminiService.analyzeRisk(textToSubmit);
            setAnalysisResult(result);
            setStep('result');
        } catch (err) {
            setError('AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
            setStep('input');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleReset = () => {
        setStep('input');
        setInputText('');
        setAnalysisResult(null);
        setError(null);
    };

    const handleSaveAndClose = () => {
        // TODO: 조치 기록 저장 로직 추가
        console.log('GEMS Analysis Saved:', analysisResult);
        navigate('/');
    };

    return (
        <div className="page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div className="container" style={{ maxWidth: '800px', padding: '2rem' }}>
                {/* 헤더 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2rem'
                }}>
                    <button
                        onClick={handleBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '50px',
                            padding: '0.75rem 1.25rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        ← 돌아가기
                    </button>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>🤖</span>
                        <span style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            안전 지능 시스템
                        </span>
                    </div>
                </div>

                {/* 메인 카드 */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #3b82f6',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.15)'
                }}>
                    {/* 카드 헤더 */}
                    <div style={{
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                    }}>
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span style={{ fontSize: '2rem' }}>🛡️</span>
                            위험 상황 분석 & 조치 방안
                        </h1>
                        <p style={{
                            margin: '0.5rem 0 0',
                            color: '#94a3b8',
                            fontSize: '0.95rem'
                        }}>
                            AI가 위험 요인을 분석하고 즉각적인 조치 방안을 제시합니다
                        </p>
                    </div>

                    {/* 카드 바디 */}
                    <div style={{ padding: '2rem' }}>
                        {step === 'input' && (
                            <div>
                                <div style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <p style={{
                                        margin: 0,
                                        color: '#93c5fd',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.6
                                    }}>
                                        💡 <strong>사용 방법:</strong> 현장에서 발견한 위험 상황을 상세히 설명해주세요.
                                        위치, 작업 내용, 위험 요소 등을 포함하면 더 정확한 분석이 가능합니다.
                                    </p>
                                </div>

                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.75rem',
                                    color: '#e2e8f0',
                                    fontWeight: '600',
                                    fontSize: '1rem'
                                }}>
                                    위험 상황 설명
                                </label>

                                <textarea
                                    placeholder={DEFAULT_RISK_TEXT}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        marginBottom: '0.5rem',
                                        transition: 'border-color 0.2s',
                                        minHeight: '150px'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                                />
                                
                                <p style={{ 
                                    fontSize: '0.8rem', 
                                    color: '#64748b', 
                                    marginBottom: '1.5rem' 
                                }}>
                                    💡 빈 칸으로 제출하면 위 예시 문장으로 테스트됩니다.
                                </p>

                                {error && (
                                    <div style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        marginBottom: '1rem',
                                        color: '#fca5a5'
                                    }}>
                                        ⚠️ {error}
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        onClick={handleBack}
                                        style={{
                                            padding: '1rem 2rem',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        style={{
                                            padding: '1rem 2rem',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        🔍 AI 솔루션 요청
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'analyzing' && (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto 1.5rem',
                                    border: '4px solid rgba(59, 130, 246, 0.3)',
                                    borderTopColor: '#3b82f6',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                <h3 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>
                                    AI가 위험 상황을 분석하고 있습니다...
                                </h3>
                                <p style={{ color: '#94a3b8' }}>
                                    잠시만 기다려주세요
                                </p>
                                <style>{`
                                    @keyframes spin {
                                        to { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                        )}

                        {step === 'result' && (
                            <div>
                                <GEMSResultCard
                                    result={analysisResult}
                                    isLoading={false}
                                />

                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginTop: '2rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={handleReset}
                                        style={{
                                            flex: 1,
                                            minWidth: '150px',
                                            padding: '1rem',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        🔄 새로운 분석
                                    </button>
                                    <button
                                        onClick={handleSaveAndClose}
                                        style={{
                                            flex: 2,
                                            minWidth: '200px',
                                            padding: '1rem',
                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        ✅ 확인 및 조치 기록 저장
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 하단 도움말 */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h4 style={{ color: '#fbbf24', marginBottom: '1rem', fontSize: '1rem' }}>
                        🤖 안전 지능 시스템이란?
                    </h4>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1.25rem',
                        color: '#94a3b8',
                        lineHeight: 1.8,
                        fontSize: '0.9rem'
                    }}>
                        <li>현장의 위험 상황을 AI가 즉시 분석합니다</li>
                        <li>위험 수준을 자동으로 평가하고 등급을 부여합니다</li>
                        <li>구체적인 조치 방안과 예방 대책을 제시합니다</li>
                        <li>분석 결과는 자동으로 저장되어 기록으로 관리됩니다</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RiskSolutionPage;

