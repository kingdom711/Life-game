import { useEffect, useMemo, useState } from 'react';
import {
    Activity,
    Award,
    BarChart3,
    CheckCircle2,
    ChevronUp,
    ClipboardCheck,
    Flame,
    Lightbulb,
    RefreshCw,
    ShieldCheck,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import reportApi from '../api/reportApi';
import { ErrorState, LoadingState } from '../components/PageState';

const PERIOD_OPTIONS = [
    { id: 'weekly', label: '주간' },
    { id: 'monthly', label: '월간' },
    { id: 'yearly', label: '연간' }
];

const SUMMARY_ITEMS = [
    { key: 'completedQuests', label: '퀘스트', suffix: '개', Icon: ClipboardCheck, color: '#38bdf8' },
    { key: 'averageQuizScore', label: '퀴즈 평균', suffix: '점', Icon: Award, color: '#a78bfa' },
    { key: 'loginDays', label: '접속일', suffix: '일', Icon: Flame, color: '#fb7185' },
    { key: 'earnedPoints', label: '적립 포인트', suffix: 'P', Icon: CheckCircle2, color: '#34d399' }
];

const CATEGORY_COLORS = {
    attendance: '#fb7185',
    quest: '#38bdf8',
    education: '#a78bfa',
    hazard: '#f59e0b',
    points: '#34d399'
};

function GrowthReportPage() {
    const [periodType, setPeriodType] = useState('weekly');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportApi.getMyReport(periodType);
            setReport(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [periodType]);

    const maxTrendValue = useMemo(() => {
        if (!report?.trends?.length) return 1;
        return Math.max(...report.trends.map((item) => item.activityScore || 0), 1);
    }, [report]);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6 pb-28">
                <LoadingState title="성장 리포트를 생성하는 중입니다..." description="기간별 활동 데이터를 집계하고 있습니다." />
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6 pb-28">
                <ErrorState
                    title="성장 리포트를 불러오지 못했습니다."
                    description={error?.message || '잠시 후 다시 시도해 주세요.'}
                    onRetry={loadReport}
                />
            </div>
        );
    }

    const scoreChange = report.summary?.scoreChange || 0;
    const ScoreChangeIcon = scoreChange >= 0 ? TrendingUp : TrendingDown;

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 pb-28 space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold mb-2">
                        <BarChart3 size={18} />
                        성장 리포트
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
                        {report.periodLabel}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        잘하고 있는 부분과 다음 개선 목표를 한 번에 확인합니다.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-xl bg-slate-900/70 border border-slate-700/60 p-1">
                        {PERIOD_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setPeriodType(option.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    periodType === option.id
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={loadReport}
                        className="w-10 h-10 rounded-xl border border-slate-700/60 bg-slate-900/70 text-slate-300
                          flex items-center justify-center hover:bg-slate-800 transition-colors"
                        aria-label="리포트 새로고침"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-4">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
                    <div className="text-sm font-semibold text-slate-400 mb-3">종합 점수</div>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-bold text-slate-50">
                            {report.summary.overallScore}
                        </span>
                        <span className="text-slate-500 pb-2">/ 100</span>
                    </div>
                    <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                        scoreChange >= 0
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300'
                    }`}>
                        <ScoreChangeIcon size={16} />
                        지난 기간 대비 {scoreChange >= 0 ? '+' : ''}{scoreChange}점
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SUMMARY_ITEMS.map(({ key, label, suffix, Icon, color }) => (
                        <div key={key} className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-400">{label}</span>
                                <Icon size={18} style={{ color }} />
                            </div>
                            <div className="text-2xl font-bold text-slate-100">
                                {report.summary[key] ?? 0}
                                <span className="text-sm text-slate-500 ml-1">{suffix}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Panel title="잘하고 있는 부분" Icon={ShieldCheck} tone="emerald">
                    <InsightList items={report.strengths} />
                </Panel>
                <Panel title="개선이 필요한 부분" Icon={ChevronUp} tone="amber">
                    <InsightList items={report.improvements} />
                </Panel>
            </section>

            <section className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <Activity size={18} className="text-blue-300" />
                    <h2 className="text-base font-semibold text-slate-100">카테고리별 성과</h2>
                </div>
                <div className="space-y-4">
                    {report.categoryScores?.map((category) => {
                        const color = CATEGORY_COLORS[category.key] || '#38bdf8';
                        return (
                            <div key={category.key} className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-200">{category.label}</div>
                                        <div className="text-xs text-slate-500">{category.detail}</div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-100">{category.score}점</div>
                                </div>
                                <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${category.score}%`, backgroundColor: color }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <BarChart3 size={18} className="text-violet-300" />
                    <h2 className="text-base font-semibold text-slate-100">활동 추이</h2>
                </div>
                <div className="h-44 flex items-end gap-2">
                    {report.trends?.map((item) => {
                        const height = Math.max(6, Math.round((item.activityScore / maxTrendValue) * 100));
                        return (
                            <div key={`${item.startDate}-${item.endDate}`} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                                <div className="w-full flex items-end h-32">
                                    <div
                                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-300"
                                        style={{ height: `${height}%` }}
                                        title={`${item.label}: ${item.activityScore}`}
                                    />
                                </div>
                                <div className="text-[10px] text-slate-500 text-center leading-tight truncate w-full">
                                    {item.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <Panel title="다음 기간 추천 행동" Icon={Lightbulb} tone="blue">
                <InsightList items={report.recommendations} />
            </Panel>
        </div>
    );
}

function Panel({ title, Icon, tone, children }) {
    const toneClass = {
        emerald: 'text-emerald-300',
        amber: 'text-amber-300',
        blue: 'text-blue-300'
    }[tone] || 'text-blue-300';

    return (
        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Icon size={18} className={toneClass} />
                <h2 className="text-base font-semibold text-slate-100">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function InsightList({ items = [] }) {
    return (
        <ul className="space-y-3">
            {items.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export default GrowthReportPage;
