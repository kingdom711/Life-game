import React, { useState } from 'react';
import { geminiService } from '../utils/geminiService';
import GEMSResultCard from './GEMSResultCard';

// 디버깅용 기본 placeholder 텍스트 (완결된 문장 형태)
const DEFAULT_RISK_TEXT = '건설 현장 2층 비계 작업 중 안전난간이 심하게 흔들리고 있습니다. 작업자 3명이 해당 구역에서 철골 용접 작업을 진행 중이며, 안전대 체결 상태가 불량하여 추락 사고 위험이 매우 높은 상황입니다.';

const RiskSolutionModal = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState('input'); // input, analyzing, result
    const [inputText, setInputText] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        // 입력이 비어있으면 placeholder 텍스트 사용 (디버깅 모드)
        const textToSubmit = inputText.trim() || DEFAULT_RISK_TEXT;

        setStep('analyzing');
        setError(null);

        try {
            const result = await geminiService.analyzeRisk(textToSubmit);
            setAnalysisResult(result);
            setStep('result');
            if (onComplete) onComplete(result);
        } catch (err) {
            setError('AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
            setStep('input');
        }
    };

    const handleClose = () => {
        setStep('input');
        setInputText('');
        setAnalysisResult(null);
        setError(null);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content gems-modal">
                <div className="modal-header">
                    <h2>🤖 안전 지능 시스템</h2>
                    <button className="close-btn" onClick={handleClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {step === 'input' && (
                        <div className="input-section">
                            <p className="description">
                                현장의 위험 상황을 설명해주세요.<br />
                                안전 지능 시스템이 즉시 위험 요인을 분석하고 조치 방안을 제시합니다.
                            </p>

                            <textarea
                                className="risk-input"
                                placeholder={DEFAULT_RISK_TEXT}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                rows={5}
                            />
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                                💡 빈 칸으로 제출하면 위 예시 문장으로 테스트됩니다.
                            </p>

                            {error && <div className="error-message">{error}</div>}

                            <div className="action-buttons">
                                <button className="btn btn-secondary" onClick={handleClose}>취소</button>
                                <button className="btn btn-primary" onClick={handleSubmit}>
                                    AI 솔루션 요청
                                </button>
                            </div>
                        </div>
                    )}

                    {(step === 'analyzing' || step === 'result') && (
                        <div className="result-section">
                            <GEMSResultCard
                                result={analysisResult}
                                isLoading={step === 'analyzing'}
                            />

                            {step === 'result' && (
                                <div className="action-buttons mt-md">
                                    <button className="btn btn-primary full-width" onClick={handleClose}>
                                        확인 및 조치 기록 저장
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .gems-modal {
                    background: #0f172a;
                    border: 1px solid #3b82f6;
                    box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
                    width: 90%;
                    max-width: 500px;
                    border-radius: 16px;
                    overflow: hidden;
                    color: #fff;
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(15, 23, 42, 0.95);
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    background: linear-gradient(to right, #60a5fa, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .close-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .description {
                    color: #94a3b8;
                    margin-bottom: 1.5rem;
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
                .risk-input {
                    width: 100%;
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 8px;
                    padding: 1rem;
                    color: #fff;
                    font-size: 1rem;
                    resize: none;
                    margin-bottom: 1rem;
                    transition: border-color 0.2s;
                }
                .risk-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }
                .error-message {
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                }
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }
                .full-width {
                    width: 100%;
                }
                .mt-md {
                    margin-top: 1.5rem;
                }
            `}</style>
        </div>
    );
};

export default RiskSolutionModal;
