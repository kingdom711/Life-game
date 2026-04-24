import React from 'react';

const RISK_LEVEL_STYLE = {
    CRITICAL: { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.2)', label: '🔴 심각' },
    HIGH: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', label: '🟠 높음' },
    MEDIUM: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', label: '🟡 보통' },
    LOW: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)', label: '🟢 낮음' },
};

const CONTROL_LABEL = {
    immediate: '즉시 조치',
    engineering: '공학적 대책',
    administrative: '관리적 대책',
    ppe: '개인보호구',
};

const getRiskLevelInfo = (level) =>
    RISK_LEVEL_STYLE[(level || '').toUpperCase()] || { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', label: '🚨 위험' };

const Section = ({ title, children }) => (
    <div className="section">
        <div className="section-title">{title}</div>
        {children}
        <style jsx>{`
            .section {
                margin-bottom: 1.25rem;
                padding: 0.9rem;
                background: rgba(30, 41, 59, 0.6);
                border: 1px solid rgba(59, 130, 246, 0.15);
                border-radius: 10px;
            }
            .section-title {
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                color: #94a3b8;
                text-transform: uppercase;
                margin-bottom: 0.6rem;
            }
        `}</style>
    </div>
);

const GEMSResultCard = ({ result, isLoading }) => {
    if (isLoading) {
        return (
            <div className="gems-card loading">
                <div className="gems-loader"><div className="scanner" /></div>
                <div className="loading-text">안전 지능 시스템이 분석 중입니다...</div>
                <style jsx>{`
                    .gems-card { background: rgba(15,23,42,0.95); border:1px solid #3b82f6; border-radius:12px; padding:2rem; text-align:center; color:#fff; min-height:300px; display:flex; flex-direction:column; justify-content:center; align-items:center; }
                    .gems-loader { width:80px; height:80px; border:2px solid #1e293b; border-radius:50%; position:relative; margin-bottom:1.5rem; overflow:hidden; }
                    .scanner { width:100%; height:2px; background:#3b82f6; position:absolute; top:0; animation:scan 1.5s infinite linear; box-shadow:0 0 10px #3b82f6; }
                    @keyframes scan { 0% { top:0; opacity:0; } 20% { opacity:1; } 80% { opacity:1; } 100% { top:100%; opacity:0; } }
                    .loading-text { font-family:'Courier New',monospace; color:#94a3b8; animation:pulse 2s infinite; }
                    @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
                `}</style>
            </div>
        );
    }

    if (!result) return null;

    const riskLevelInfo = getRiskLevelInfo(result.riskLevel);
    const sev = result.severity?.score ?? '-';
    const lik = result.likelihood?.score ?? '-';
    const rScore = result.riskScore ?? (result.severity?.score && result.likelihood?.score
        ? result.severity.score * result.likelihood.score : '-');
    const kosha = result.koshaGuide || result.referenceCode;

    const controls = result.controlMeasures
        ? Object.entries(result.controlMeasures).filter(([, v]) => Array.isArray(v) && v.length > 0)
        : [];

    return (
        <div className="gems-card">
            {/* 상단 헤더 */}
            <div className="header">
                <div
                    className="badge"
                    style={{ background: riskLevelInfo.bg, color: riskLevelInfo.color, borderColor: riskLevelInfo.color }}
                >
                    {riskLevelInfo.label} 위험 감지됨
                </div>
                <div className="top-right">
                    {result.hazardClassification && <span className="chip">{result.hazardClassification}</span>}
                    {kosha && <span className="ref-code">KOSHA {kosha}</span>}
                </div>
            </div>

            {result.fallback && (
                <div className="alert warning">
                    ⚠️ 서버 연결 실패로 임시 응답을 표시합니다. (Mock 데이터)
                </div>
            )}
            {result.isMock && !result.fallback && (
                <div className="alert info">🧪 Mock 모드</div>
            )}

            {/* 핵심 위험 요인 */}
            <Section title="식별된 위험 요인">
                <div className="risk-content" style={{ borderLeftColor: riskLevelInfo.color }}>
                    {result.riskFactor}
                </div>
                {(result.unsafeCondition || result.unsafeAct || result.possibleAccident) && (
                    <dl className="detail">
                        {result.unsafeCondition && (
                            <div><dt>불안전 상태</dt><dd>{result.unsafeCondition}</dd></div>
                        )}
                        {result.unsafeAct && (
                            <div><dt>불안전 행동</dt><dd>{result.unsafeAct}</dd></div>
                        )}
                        {result.possibleAccident && (
                            <div><dt>예상 재해</dt><dd className="accident">{result.possibleAccident}</dd></div>
                        )}
                    </dl>
                )}
            </Section>

            {/* 위험성 매트릭스 */}
            {(result.severity || result.likelihood || result.riskScore != null) && (
                <Section title="위험성 추정 (L × S = R)">
                    <div className="matrix">
                        <div className="cell">
                            <div className="cell-label">빈도 L</div>
                            <div className="cell-value">{lik}</div>
                        </div>
                        <div className="cell">
                            <div className="cell-label">강도 S</div>
                            <div className="cell-value">{sev}</div>
                        </div>
                        <div className="cell cell-score">
                            <div className="cell-label" style={{ color: '#93c5fd' }}>위험성 R</div>
                            <div className="cell-value" style={{ color: '#dbeafe' }}>{rScore}</div>
                        </div>
                    </div>
                    {(result.severity?.rationale || result.likelihood?.rationale) && (
                        <div className="rationale">
                            {result.severity?.rationale && <div>· 강도: {result.severity.rationale}</div>}
                            {result.likelihood?.rationale && <div>· 빈도: {result.likelihood.rationale}</div>}
                        </div>
                    )}
                </Section>
            )}

            {/* 통제 위계 */}
            {controls.length > 0 && (
                <Section title="통제 위계 (Hierarchy of Controls)">
                    {controls.map(([key, steps]) => (
                        <div key={key} className="control-group">
                            <div className="control-label">▸ {CONTROL_LABEL[key] || key}</div>
                            <ul>
                                {steps.map((s, i) => <li key={`${key}-${i}`}>· {s}</li>)}
                            </ul>
                        </div>
                    ))}
                </Section>
            )}

            {/* 법적 근거 */}
            {Array.isArray(result.legalBasis) && result.legalBasis.length > 0 && (
                <Section title="법적 근거">
                    <ul className="legal">
                        {result.legalBasis.map((ref, i) => (
                            <li key={i}>
                                <span className="legal-article">{ref.law} {ref.article}</span>
                                {ref.content && <span className="legal-content"> — {ref.content}</span>}
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* 레거시 단순 조치 (확장 필드 없을 때 fallback) */}
            {controls.length === 0 && result.remediationSteps?.length > 0 && (
                <Section title="AI 표준 조치 방안">
                    <div className="steps">
                        {result.remediationSteps.map((step, index) => (
                            <div key={index} className="step-item">
                                <span className="step-num">{index + 1}</span>
                                <span className="step-text">{step}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* 하단 메타 */}
            <div className="meta-row">
                {result.responsibleRole && <span className="chip">책임: {result.responsibleRole}</span>}
                {result.dueDays != null && <span className="chip chip-warn">조치 기한 D+{result.dueDays}</span>}
                {result.confidence != null && (
                    <span className="confidence">신뢰도 {Math.round(result.confidence * 100)}%</span>
                )}
            </div>

            <div className="footer">
                <span>🤖 Generated by Safety Intelligence System</span>
                {result.analysisId && <span className="analysis-id"> | ID: {String(result.analysisId).slice(0, 8)}...</span>}
            </div>

            <style jsx>{`
                .gems-card { background:linear-gradient(145deg,#0f172a,#1e293b); border:1px solid #3b82f6; border-radius:12px; padding:1.5rem; color:#fff; box-shadow:0 0 20px rgba(59,130,246,0.2); animation:slideUp 0.5s ease-out; }
                @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.9rem; border-bottom:1px solid rgba(59,130,246,0.3); gap:0.5rem; flex-wrap:wrap; }
                .badge { padding:0.3rem 0.8rem; border-radius:999px; font-weight:bold; border:1px solid; animation:blink 2s infinite; font-size:0.85rem; }
                @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
                .top-right { display:flex; gap:0.5rem; align-items:center; }
                .chip { padding:0.2rem 0.65rem; border-radius:8px; font-size:0.72rem; background:rgba(71,85,105,0.4); color:#cbd5e1; border:1px solid rgba(148,163,184,0.3); }
                .chip-warn { background:rgba(245,158,11,0.1); color:#fbbf24; border-color:rgba(245,158,11,0.3); }
                .ref-code { font-family:'Courier New',monospace; color:#93c5fd; font-size:0.75rem; padding:0.2rem 0.55rem; border:1px solid rgba(59,130,246,0.3); border-radius:6px; background:rgba(59,130,246,0.08); }
                .alert { padding:0.65rem 0.8rem; border-radius:8px; font-size:0.8rem; margin-bottom:0.9rem; }
                .alert.warning { background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.3); color:#fbbf24; }
                .alert.info { background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3); color:#c4b5fd; }
                .risk-content { font-size:1rem; font-weight:600; color:#f8fafc; padding:0.85rem; background:rgba(255,255,255,0.05); border-radius:8px; border-left:4px solid #ef4444; }
                .detail { margin-top:0.7rem; display:flex; flex-direction:column; gap:0.3rem; font-size:0.85rem; color:#cbd5e1; }
                .detail dt { display:inline; color:#64748b; margin-right:0.4rem; }
                .detail dd { display:inline; margin:0; }
                .detail .accident { color:#fca5a5; font-weight:600; }
                .matrix { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; text-align:center; }
                .cell { padding:0.7rem; background:rgba(15,23,42,0.6); border-radius:8px; }
                .cell-score { background:rgba(37,99,235,0.15); }
                .cell-label { font-size:0.65rem; color:#64748b; letter-spacing:0.05em; text-transform:uppercase; }
                .cell-value { font-size:1.4rem; font-weight:bold; color:#f1f5f9; margin-top:0.2rem; }
                .rationale { margin-top:0.6rem; font-size:0.75rem; color:#94a3b8; display:flex; flex-direction:column; gap:0.2rem; }
                .control-group { margin-bottom:0.55rem; }
                .control-label { font-weight:600; color:#93c5fd; font-size:0.85rem; margin-bottom:0.25rem; }
                .control-group ul { list-style:none; margin:0; padding:0 0 0 0.8rem; color:#e2e8f0; font-size:0.85rem; }
                .control-group li { padding:0.15rem 0; }
                .legal { list-style:none; margin:0; padding:0; font-size:0.82rem; color:#e2e8f0; }
                .legal li { padding:0.35rem 0.55rem; background:rgba(15,23,42,0.6); border-radius:6px; margin-bottom:0.3rem; }
                .legal-article { color:#93c5fd; font-weight:600; }
                .legal-content { color:#94a3b8; }
                .steps { display:flex; flex-direction:column; gap:0.55rem; }
                .step-item { display:flex; gap:0.75rem; padding:0.7rem; background:rgba(59,130,246,0.05); border-radius:8px; align-items:flex-start; }
                .step-num { background:#3b82f6; color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:bold; flex-shrink:0; }
                .step-text { color:#e2e8f0; line-height:1.5; font-size:0.88rem; }
                .meta-row { display:flex; gap:0.45rem; align-items:center; flex-wrap:wrap; margin:0.3rem 0 0.75rem; }
                .confidence { margin-left:auto; font-size:0.72rem; color:#64748b; }
                .footer { text-align:right; font-size:0.7rem; color:#64748b; border-top:1px solid rgba(255,255,255,0.1); padding-top:0.8rem; }
                .analysis-id { opacity:0.6; }
            `}</style>
        </div>
    );
};

export default GEMSResultCard;
