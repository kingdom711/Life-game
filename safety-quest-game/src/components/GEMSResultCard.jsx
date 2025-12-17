import React from 'react';

const GEMSResultCard = ({ result, isLoading }) => {
    if (isLoading) {
        return (
            <div className="gems-card loading">
                <div className="gems-loader">
                    <div className="scanner"></div>
                </div>
                <div className="loading-text">
                    안전 지능 시스템이 분석 중입니다...
                </div>
                <style jsx>{`
                    .gems-card {
                        background: rgba(15, 23, 42, 0.95);
                        border: 1px solid #3b82f6;
                        border-radius: 12px;
                        padding: 2rem;
                        text-align: center;
                        color: #fff;
                        box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
                        min-height: 300px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    .gems-loader {
                        width: 80px;
                        height: 80px;
                        border: 2px solid #1e293b;
                        border-radius: 50%;
                        position: relative;
                        margin-bottom: 1.5rem;
                        overflow: hidden;
                    }
                    .scanner {
                        width: 100%;
                        height: 2px;
                        background: #3b82f6;
                        position: absolute;
                        top: 0;
                        animation: scan 1.5s infinite linear;
                        box-shadow: 0 0 10px #3b82f6;
                    }
                    @keyframes scan {
                        0% { top: 0; opacity: 0; }
                        20% { opacity: 1; }
                        80% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                    .loading-text {
                        font-family: 'Courier New', monospace;
                        color: #94a3b8;
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 0.6; }
                        50% { opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    if (!result) return null;

    // 위험 수준에 따른 색상 및 라벨
    const getRiskLevelInfo = (level) => {
        switch (level?.toUpperCase()) {
            case 'CRITICAL':
                return { color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.2)', label: '🔴 심각', borderColor: '#dc2626' };
            case 'HIGH':
                return { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)', label: '🟠 높음', borderColor: '#ef4444' };
            case 'MEDIUM':
                return { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)', label: '🟡 보통', borderColor: '#f59e0b' };
            case 'LOW':
                return { color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.2)', label: '🟢 낮음', borderColor: '#22c55e' };
            default:
                return { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)', label: '🚨 위험', borderColor: '#ef4444' };
        }
    };

    const riskLevelInfo = getRiskLevelInfo(result.riskLevel);

    return (
        <div className="gems-card result">
            <div className="header">
                <div className="badge-danger" style={{ 
                    background: riskLevelInfo.bgColor, 
                    color: riskLevelInfo.color,
                    borderColor: riskLevelInfo.color 
                }}>
                    {riskLevelInfo.label} 위험 감지됨
                </div>
                <div className="ref-code">REF: {result.referenceCode}</div>
            </div>

            {/* Fallback 경고 표시 */}
            {result.fallback && (
                <div style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    color: '#fbbf24'
                }}>
                    ⚠️ 서버 연결 실패로 임시 응답을 표시합니다. (Mock 데이터)
                </div>
            )}

            <div className="risk-section">
                <h3>식별된 위험 요인</h3>
                <div className="risk-content" style={{ borderLeftColor: riskLevelInfo.borderColor }}>
                    {result.riskFactor}
                </div>
            </div>

            <div className="remediation-section">
                <h3>AI 표준 조치 방안</h3>
                <div className="steps">
                    {result.remediationSteps.map((step, index) => (
                        <div key={index} className="step-item">
                            <span className="step-num">{index + 1}</span>
                            <span className="step-text">{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="footer">
                <div className="ai-tag">
                    <span className="icon">🤖</span>
                    Generated by Safety Intelligence System
                    {result.analysisId && (
                        <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>
                            | ID: {result.analysisId.slice(0, 8)}...
                        </span>
                    )}
                </div>
            </div>

            <style jsx>{`
                .gems-card {
                    background: linear-gradient(145deg, #0f172a, #1e293b);
                    border: 1px solid #3b82f6;
                    border-radius: 12px;
                    padding: 1.5rem;
                    color: #fff;
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
                    animation: slideUp 0.5s ease-out;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.3);
                }
                .badge-danger {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-weight: bold;
                    border: 1px solid rgba(239, 68, 68, 0.5);
                    animation: blink 2s infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .ref-code {
                    font-family: 'Courier New', monospace;
                    color: #64748b;
                    font-size: 0.875rem;
                }
                h3 {
                    color: #94a3b8;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.75rem;
                }
                .risk-section {
                    margin-bottom: 1.5rem;
                }
                .risk-content {
                    font-size: 1.125rem;
                    font-weight: bold;
                    color: #f8fafc;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    border-left: 4px solid #ef4444;
                }
                .remediation-section {
                    margin-bottom: 1.5rem;
                }
                .step-item {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(59, 130, 246, 0.05);
                    border-radius: 8px;
                    align-items: flex-start;
                }
                .step-num {
                    background: #3b82f6;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                .step-text {
                    color: #e2e8f0;
                    line-height: 1.5;
                }
                .footer {
                    text-align: right;
                    font-size: 0.75rem;
                    color: #64748b;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 1rem;
                }
                .ai-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default GEMSResultCard;
