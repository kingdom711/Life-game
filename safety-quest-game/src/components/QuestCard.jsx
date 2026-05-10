import { useNavigate } from 'react-router-dom';
import { questProgress as questProgressStorage } from '../utils/storage';
import ProgressBar from './ProgressBar';

function QuestCard({ quest, onComplete, isLocked = false }) {
    const navigate = useNavigate();
    const progress = questProgressStorage.getQuestProgress(quest.id);
    const target = quest.requirement.target || 1;
    const percentage = Math.min(100, Math.round((progress.current / target) * 100));
    const isCompleted = progress.completed;

    const handleComplete = () => {
        if (!isCompleted && onComplete) {
            onComplete(quest);
        }
    };

    const handleCardClick = (event) => {
        if (!quest.link || isCompleted) return;
        if (event.target.closest('button, a')) return;
        navigate(quest.link);
    };

    const handleCardKeyDown = (event) => {
        if (!quest.link || isCompleted) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        navigate(quest.link);
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
        `}
            onClick={handleCardClick}
            onKeyDown={handleCardKeyDown}
            role={quest.link && !isCompleted ? 'button' : undefined}
            tabIndex={quest.link && !isCompleted ? 0 : undefined}
        >
            {isCompleted && (
                <div className="completed-overlay absolute inset-0 bg-emerald-500/15 pointer-events-none z-0 rounded-xl"></div>
            )}

            {isLocked && !isCompleted && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    zIndex: 20, borderRadius: '0.75rem',
                    gap: '0.5rem'
                }}>
                    <span style={{ fontSize: '2.5rem' }}>🔒</span>
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>
                        교육을 먼저 완료하세요
                    </span>
                </div>
            )}

            <div className="quest-header flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{quest.icon}</span>
                    <h3 className="quest-title text-xl font-bold text-slate-100">{quest.title}</h3>
                </div>
                {isCompleted ? (
                    <div className="completed-badge-icon bg-emerald-500/20 rounded-full w-10 h-10 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                        <span className="text-emerald-500 text-2xl font-bold">✓</span>
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
                            color={isCompleted ? 'var(--color-safe)' : 'var(--color-primary-light)'}
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
            ) : quest.link ? (
                <button
                    onClick={() => navigate(quest.link)}
                    className="btn-action w-full py-3 rounded-lg font-bold transition-all duration-300 relative z-10 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
                >
                    바로가기
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
        </div>
    );
}

export default QuestCard;
