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
        <div className={`quest-card ${isCompleted ? 'completed' : ''}`}>
            {isCompleted && <div className="completed-overlay"></div>}

            <div className="quest-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '2rem' }}>{quest.icon}</span>
                    <h3 className="quest-title">{quest.title}</h3>
                </div>
                {isCompleted ? (
                    <div className="completed-badge-icon">
                        <span className="glowing-checkmark">✓</span>
                    </div>
                ) : (
                    <span className="quest-reward">+{quest.reward.points} P</span>
                )}
            </div>

            <p className="quest-description">{quest.description}</p>

            <div className="quest-progress-container">
                {isCompleted ? (
                    <div className="quest-complete-text">QUEST COMPLETE</div>
                ) : (
                    <>
                        <ProgressBar
                            progress={percentage}
                            color={isCompleted ? '#10b981' : '#38bdf8'}
                        />
                        <span className="progress-text">
                            {progress.current} / {target}
                        </span>
                    </>
                )}
            </div>

            {isCompleted ? (
                <button className="btn-action completed" disabled>
                    보상 지급 완료
                </button>
            ) : (
                <button
                    className="btn-action"
                    onClick={handleComplete}
                    disabled={percentage < 100}
                >
                    {percentage >= 100 ? '보상 받기' : '진행 중'}
                </button>
            )}

            {/* 홀로그램 효과용 배경 */}
            <div className="hologram-effect"></div>
        </div>
    );
}

export default QuestCard;
