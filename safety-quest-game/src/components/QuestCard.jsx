import { questProgress as questProgressStorage } from '../utils/storage';
import ProgressBar from './ProgressBar';

function QuestCard({ quest, onComplete }) {
    const progress = questProgressStorage.getQuestProgress(quest.id);
    const target = quest.requirement.target || 1;
    const percentage = Math.min(100, Math.round((progress.current / target) * 100));
    const isCompleted = progress.completed;

    const handleComplete = () => {
        if (!isCompleted && onComplete) {
            onComplete(quest);
        }
    };

    return (
        <div className={`
            quest-card
            backdrop-blur-xl bg-slate-800/70 border border-slate-600/50 rounded-xl p-6
            transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
            ${isCompleted
                ? 'border-emerald-500 shadow-emerald-500/30'
                : 'hover:border-blue-400/50'
            }
            ${isCompleted ? 'completed' : ''}
        `}>
            {isCompleted && (
                <div className="completed-overlay absolute inset-0 bg-emerald-500/15 pointer-events-none z-0 rounded-xl"></div>
            )}

            <div className="quest-header flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{quest.icon}</span>
                    <h3 className="quest-title text-xl font-bold text-slate-100">{quest.title}</h3>
                </div>
                {isCompleted ? (
                    <div className="completed-badge-icon bg-emerald-500/20 rounded-full w-10 h-10 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                        <span className="glowing-checkmark text-emerald-500 text-2xl font-bold">✓</span>
                    </div>
                ) : (
                    <span className="quest-reward bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                        +{quest.reward.points} P
                    </span>
                )}
            </div>

            <p className="quest-description text-slate-300 text-sm mb-6 leading-relaxed relative z-10">
                {quest.description}
            </p>

            <div className="quest-progress-container flex items-center gap-4 mb-6 relative z-10">
                {isCompleted ? (
                    <div className="quest-complete-text text-2xl font-extrabold text-emerald-500 text-center w-full tracking-wider">
                        QUEST COMPLETE
                    </div>
                ) : (
                    <>
                        <ProgressBar
                            progress={percentage}
                            color={isCompleted ? '#10b981' : '#38bdf8'}
                        />
                        <span className="progress-text text-sm text-slate-500 font-bold">
                            {progress.current} / {target}
                        </span>
                    </>
                )}
            </div>

            {isCompleted ? (
                <button
                    className="btn-action completed w-full py-3 bg-slate-700 text-slate-400 border border-slate-600 rounded-lg font-bold cursor-not-allowed shadow-none relative z-10"
                    disabled
                >
                    보상 지급 완료
                </button>
            ) : (
                <button
                    className={`
                        btn-action w-full py-3 rounded-lg font-bold transition-all duration-300 relative z-10
                        ${percentage >= 100
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30'
                            : 'bg-slate-500 text-slate-300 cursor-not-allowed opacity-70'
                        }
                    `}
                    onClick={handleComplete}
                    disabled={percentage < 100}
                >
                    {percentage >= 100 ? '보상 받기' : '진행 중'}
                </button>
            )}

            {/* 홀로그램 효과용 배경 */}
            <div className="hologram-effect absolute inset-0 bg-gradient-to-45deg from-transparent via-white/3 to-transparent pointer-events-none rounded-xl"></div>
        </div>
    );
}

export default QuestCard;
