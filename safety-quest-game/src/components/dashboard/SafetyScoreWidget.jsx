import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateSafetyScore } from '../../utils/safetyScoreCalculator';

function getScoreColor(score) {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
}

function SafetyScoreWidget() {
    const navigate = useNavigate();
    const [score, setScore] = useState(null);

    useEffect(() => {
        try {
            const data = calculateSafetyScore();
            setScore(data.totalScore);
        } catch {
            // 점수 계산 실패 시 위젯 숨김
        }
    }, []);

    if (score === null) return null;

    const color = getScoreColor(score);
    const circumference = 2 * Math.PI * 28;
    const offset = circumference * (1 - score / 100);

    return (
        <div
            onClick={() => navigate('/safety-score')}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50
              shadow-lg shadow-black/10 cursor-pointer hover:bg-slate-800/60 transition-colors
              mb-4"
        >
            <div className="flex items-center gap-3">
                {/* 미니 게이지 */}
                <div className="relative flex-shrink-0">
                    <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle
                            cx="32" cy="32" r="28"
                            fill="none"
                            stroke="rgba(148, 163, 184, 0.1)"
                            strokeWidth="4"
                        />
                        <circle
                            cx="32" cy="32" r="28"
                            fill="none"
                            stroke={color}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            transform="rotate(-90 32 32)"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color }}>{score}</span>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200">안전 점수</div>
                    <div className="text-xs text-slate-400">사업장 종합 점수</div>
                </div>

                <div className="text-slate-500 text-sm">
                    →
                </div>
            </div>
        </div>
    );
}

export default SafetyScoreWidget;
