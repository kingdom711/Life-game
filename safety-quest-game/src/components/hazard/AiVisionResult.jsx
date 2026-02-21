const LEVEL_STYLE = {
    CRITICAL: 'bg-red-500/20 text-red-200 border-red-400/40',
    HIGH: 'bg-orange-500/20 text-orange-200 border-orange-400/40',
    MEDIUM: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40',
    LOW: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
};

function AiVisionResult({ analysis }) {
    if (!analysis) return null;

    const levelClass = LEVEL_STYLE[analysis.riskLevel] || 'bg-slate-700/50 text-slate-200 border-slate-600';

    return (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">AI Vision 분석 결과</h3>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${levelClass}`}>
                    {analysis.riskLevel}
                </span>
            </div>

            <p className="text-sm text-slate-200">{analysis.riskFactor}</p>

            <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {(analysis.remediationSteps || []).map((step, index) => (
                    <li key={`${step}-${index}`} className="rounded-lg bg-slate-800/80 px-3 py-2">
                        {index + 1}. {step}
                    </li>
                ))}
            </ul>

            {analysis.referenceCode && (
                <div className="mt-4 inline-flex rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
                    {analysis.referenceCode}
                </div>
            )}
        </div>
    );
}

export default AiVisionResult;
