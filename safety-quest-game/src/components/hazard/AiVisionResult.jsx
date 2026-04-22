const LEVEL_STYLE = {
    CRITICAL: 'bg-red-500/20 text-red-200 border-red-400/40',
    HIGH: 'bg-orange-500/20 text-orange-200 border-orange-400/40',
    MEDIUM: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40',
    LOW: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
};

const CONTROL_LABEL = {
    immediate: '즉시 조치',
    engineering: '공학적 대책',
    administrative: '관리적 대책',
    ppe: '개인보호구',
};

function Section({ title, children }) {
    return (
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/60 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div>
            {children}
        </div>
    );
}

function RiskMatrix({ severity, likelihood, riskScore }) {
    if (!severity && !likelihood && riskScore == null) return null;

    const sev = severity?.score ?? '-';
    const lik = likelihood?.score ?? '-';
    const score = riskScore ?? (severity?.score && likelihood?.score ? severity.score * likelihood.score : '-');

    return (
        <Section title="위험성 추정 (L × S = R)">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-md bg-slate-900/70 py-2">
                    <div className="text-[10px] text-slate-500">빈도 L</div>
                    <div className="text-lg font-bold text-slate-100">{lik}</div>
                </div>
                <div className="rounded-md bg-slate-900/70 py-2">
                    <div className="text-[10px] text-slate-500">강도 S</div>
                    <div className="text-lg font-bold text-slate-100">{sev}</div>
                </div>
                <div className="rounded-md bg-blue-900/40 py-2">
                    <div className="text-[10px] text-blue-300">위험성 R</div>
                    <div className="text-lg font-bold text-blue-100">{score}</div>
                </div>
            </div>
            {(severity?.rationale || likelihood?.rationale) && (
                <div className="mt-2 space-y-1 text-xs text-slate-400">
                    {severity?.rationale && <div>· 강도: {severity.rationale}</div>}
                    {likelihood?.rationale && <div>· 빈도: {likelihood.rationale}</div>}
                </div>
            )}
        </Section>
    );
}

function ControlMeasuresView({ measures }) {
    if (!measures) return null;
    const entries = Object.entries(measures).filter(([, v]) => Array.isArray(v) && v.length > 0);
    if (entries.length === 0) return null;

    return (
        <Section title="통제 위계 (Hierarchy of Controls)">
            <div className="space-y-2">
                {entries.map(([key, steps]) => (
                    <div key={key} className="rounded-md bg-slate-900/60 p-2">
                        <div className="mb-1 text-xs font-semibold text-blue-200">{CONTROL_LABEL[key] || key}</div>
                        <ul className="space-y-1 text-sm text-slate-300">
                            {steps.map((s, i) => (
                                <li key={`${key}-${i}`}>· {s}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Section>
    );
}

function LegalBasisView({ legalBasis }) {
    if (!legalBasis || legalBasis.length === 0) return null;
    return (
        <Section title="법적 근거">
            <ul className="space-y-1.5 text-xs text-slate-300">
                {legalBasis.map((ref, i) => (
                    <li key={i} className="rounded-md bg-slate-900/60 px-2 py-1.5">
                        <span className="font-semibold text-blue-200">{ref.law} {ref.article}</span>
                        {ref.content && <span className="ml-1 text-slate-400">— {ref.content}</span>}
                    </li>
                ))}
            </ul>
        </Section>
    );
}

function AiVisionResult({ analysis }) {
    if (!analysis) return null;

    const levelClass = LEVEL_STYLE[analysis.riskLevel] || 'bg-slate-700/50 text-slate-200 border-slate-600';

    const hasLegacyOnly = !analysis.severity && !analysis.controlMeasures && !analysis.legalBasis;

    return (
        <div className="space-y-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-slate-100">AI 위험성평가 결과</h3>
                <div className="flex items-center gap-2">
                    {analysis.cacheSourceId && (
                        <span
                            className="rounded-full border border-purple-400/40 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-200"
                            title={`동일 사진으로 이전에 분석된 결과(#${analysis.cacheSourceId})를 재사용 — API 비용 0`}
                        >
                            캐시 재사용
                        </span>
                    )}
                    {analysis.hazardClassification && (
                        <span className="rounded-full border border-slate-600 bg-slate-800/80 px-2.5 py-0.5 text-[11px] text-slate-300">
                            {analysis.hazardClassification}
                        </span>
                    )}
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${levelClass}`}>
                        {analysis.riskLevel}
                    </span>
                </div>
            </div>

            <p className="text-sm text-slate-200">{analysis.riskFactor}</p>

            {(analysis.unsafeCondition || analysis.unsafeAct || analysis.possibleAccident) && (
                <Section title="유해·위험요인 식별">
                    <dl className="space-y-1 text-sm text-slate-300">
                        {analysis.unsafeCondition && (
                            <div><dt className="inline text-slate-400">· 불안전 상태: </dt><dd className="inline">{analysis.unsafeCondition}</dd></div>
                        )}
                        {analysis.unsafeAct && (
                            <div><dt className="inline text-slate-400">· 불안전 행동: </dt><dd className="inline">{analysis.unsafeAct}</dd></div>
                        )}
                        {analysis.possibleAccident && (
                            <div><dt className="inline text-slate-400">· 예상 재해: </dt><dd className="inline font-semibold text-red-200">{analysis.possibleAccident}</dd></div>
                        )}
                    </dl>
                </Section>
            )}

            <RiskMatrix
                severity={analysis.severity}
                likelihood={analysis.likelihood}
                riskScore={analysis.riskScore}
            />

            <ControlMeasuresView measures={analysis.controlMeasures} />

            <LegalBasisView legalBasis={analysis.legalBasis} />

            {hasLegacyOnly && analysis.remediationSteps?.length > 0 && (
                <ul className="space-y-2 text-sm text-slate-300">
                    {analysis.remediationSteps.map((step, index) => (
                        <li key={`${step}-${index}`} className="rounded-lg bg-slate-800/80 px-3 py-2">
                            {index + 1}. {step}
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
                {(analysis.koshaGuide || analysis.referenceCode) && (
                    <span className="rounded-md border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-200">
                        KOSHA {analysis.koshaGuide || analysis.referenceCode}
                    </span>
                )}
                {analysis.responsibleRole && (
                    <span className="rounded-md border border-slate-600 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300">
                        책임: {analysis.responsibleRole}
                    </span>
                )}
                {analysis.dueDays != null && (
                    <span className="rounded-md border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
                        조치 기한 D+{analysis.dueDays}
                    </span>
                )}
                {analysis.confidence != null && (
                    <span className="ml-auto text-[11px] text-slate-500">
                        신뢰도 {Math.round(analysis.confidence * 100)}%
                    </span>
                )}
            </div>
        </div>
    );
}

export default AiVisionResult;
