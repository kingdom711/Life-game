import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    calculateSafetyScore,
    saveSafetyScoreSnapshot,
    getWeeklyTrend,
    getImprovementSuggestion,
    getScoreChange
} from '../utils/safetyScoreCalculator';

const CATEGORY_ICONS = {
    education: '📚',
    quiz: '📝',
    checklist: '✅',
    hazard: '⚠️',
    participation: '🔥'
};

const CATEGORY_COLORS = {
    education: { bar: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    quiz: { bar: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
    checklist: { bar: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    hazard: { bar: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    participation: { bar: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
};

function getScoreGrade(score) {
    if (score >= 90) return { grade: 'A+', color: '#10b981', label: '매우 우수' };
    if (score >= 80) return { grade: 'A', color: '#3b82f6', label: '우수' };
    if (score >= 70) return { grade: 'B', color: '#8b5cf6', label: '양호' };
    if (score >= 60) return { grade: 'C', color: '#f59e0b', label: '보통' };
    if (score >= 50) return { grade: 'D', color: '#f97316', label: '미흡' };
    return { grade: 'F', color: '#ef4444', label: '위험' };
}

function SafetyScoreDashboard({ role }) {
    const navigate = useNavigate();
    const [scoreData, setScoreData] = useState(null);
    const [weeklyTrend, setWeeklyTrend] = useState([]);
    const [scoreChange, setScoreChange] = useState(null);
    const [suggestion, setSuggestion] = useState(null);

    useEffect(() => {
        const data = calculateSafetyScore();
        setScoreData(data);

        // 스냅샷 저장
        saveSafetyScoreSnapshot(data);

        // 주간 추이
        setWeeklyTrend(getWeeklyTrend());

        // 점수 변화
        setScoreChange(getScoreChange());

        // 개선 제안
        setSuggestion(getImprovementSuggestion(data.categories));
    }, []);

    if (!scoreData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const grade = getScoreGrade(scoreData.totalScore);
    const circumference = 2 * Math.PI * 70;
    const scorePercent = scoreData.totalScore / 100;
    const strokeDashoffset = circumference * (1 - scorePercent);

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-100">
                        사업장 안전 점수
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        종합 안전 현황 대시보드
                    </p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="px-3 py-1.5 text-sm rounded-lg bg-slate-800/60 text-slate-300
                      hover:bg-slate-700/60 transition-colors border border-slate-700/50"
                >
                    홈으로
                </button>
            </div>

            {/* 종합 점수 게이지 */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50
              shadow-lg shadow-black/10">
                <div className="flex items-center justify-center gap-8">
                    {/* 원형 게이지 */}
                    <div className="relative">
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            {/* 배경 원 */}
                            <circle
                                cx="80" cy="80" r="70"
                                fill="none"
                                stroke="rgba(148, 163, 184, 0.1)"
                                strokeWidth="10"
                            />
                            {/* 점수 원 */}
                            <circle
                                cx="80" cy="80" r="70"
                                fill="none"
                                stroke={grade.color}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 80 80)"
                                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold" style={{ color: grade.color }}>
                                {scoreData.totalScore}
                            </span>
                            <span className="text-sm text-slate-400">/ 100점</span>
                        </div>
                    </div>

                    {/* 등급 정보 */}
                    <div className="text-center space-y-2">
                        <div className="text-5xl font-bold" style={{ color: grade.color }}>
                            {grade.grade}
                        </div>
                        <div className="text-sm font-medium" style={{ color: grade.color }}>
                            {grade.label}
                        </div>
                        {scoreChange !== null && (
                            <div className={`text-sm font-medium ${scoreChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {scoreChange >= 0 ? '📈' : '📉'} 지난주 대비 {scoreChange >= 0 ? '+' : ''}{scoreChange}점
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 카테고리별 상세 점수 */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50
              shadow-lg shadow-black/10 space-y-4">
                <h2 className="text-base font-semibold text-slate-200">카테고리별 점수</h2>

                {Object.entries(scoreData.categories).map(([key, cat]) => {
                    const colors = CATEGORY_COLORS[key];
                    const icon = CATEGORY_ICONS[key];
                    const percent = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;

                    return (
                        <div key={key} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{icon}</span>
                                    <span className="text-sm font-medium text-slate-300">{cat.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-200">{cat.score}</span>
                                    <span className="text-xs text-slate-500">/ {cat.maxScore}</span>
                                </div>
                            </div>
                            {/* 진행 바 */}
                            <div className="w-full h-2.5 rounded-full overflow-hidden"
                                style={{ backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${percent}%`,
                                        backgroundColor: colors.bar,
                                        boxShadow: `0 0 8px ${colors.bar}40`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500">{cat.detail}</p>
                        </div>
                    );
                })}
            </div>

            {/* 개선 제안 */}
            {suggestion && (
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl p-5
                  border border-blue-500/20 shadow-lg shadow-black/10">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">💡</span>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-300 mb-1">
                                개선 제안 — {suggestion.categoryLabel}
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {suggestion.suggestion}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                현재 {suggestion.currentScore}/{suggestion.maxScore}점 →
                                이 항목을 개선하면 전체 점수가 크게 올라갑니다.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 주간 추이 */}
            {weeklyTrend.length > 0 && weeklyTrend.some(w => w.avgScore !== null) && (
                <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50
                  shadow-lg shadow-black/10">
                    <h2 className="text-base font-semibold text-slate-200 mb-4">주간 점수 추이</h2>
                    <div className="flex items-end justify-between gap-2 h-32">
                        {weeklyTrend.map((week, idx) => {
                            const height = week.avgScore !== null ? Math.max(week.avgScore, 5) : 5;
                            const isNull = week.avgScore === null;

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                    {!isNull && (
                                        <span className="text-xs font-bold text-slate-300">
                                            {week.avgScore}
                                        </span>
                                    )}
                                    <div
                                        className="w-full rounded-t-lg transition-all duration-500"
                                        style={{
                                            height: `${height}%`,
                                            backgroundColor: isNull
                                                ? 'rgba(148, 163, 184, 0.1)'
                                                : week.avgScore >= 70
                                                    ? 'rgba(59, 130, 246, 0.6)'
                                                    : week.avgScore >= 50
                                                        ? 'rgba(245, 158, 11, 0.6)'
                                                        : 'rgba(239, 68, 68, 0.6)',
                                            minHeight: '4px'
                                        }}
                                    />
                                    <span className="text-[10px] text-slate-500 text-center leading-tight">
                                        {week.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 점수 기준 안내 */}
            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30">
                <h3 className="text-xs font-semibold text-slate-400 mb-2">점수 기준 안내</h3>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                    <div>90~100: <span className="text-emerald-400 font-medium">A+ 매우 우수</span></div>
                    <div>80~89: <span className="text-blue-400 font-medium">A 우수</span></div>
                    <div>70~79: <span className="text-purple-400 font-medium">B 양호</span></div>
                    <div>60~69: <span className="text-amber-400 font-medium">C 보통</span></div>
                    <div>50~59: <span className="text-orange-400 font-medium">D 미흡</span></div>
                    <div>0~49: <span className="text-red-400 font-medium">F 위험</span></div>
                </div>
            </div>
        </div>
    );
}

export default SafetyScoreDashboard;
