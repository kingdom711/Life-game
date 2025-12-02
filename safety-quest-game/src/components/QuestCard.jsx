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
        <div className={`card ${isCompleted ? 'opacity-60' : ''}`} style={{ position: 'relative' }}>
            {isCompleted && (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    fontSize: '2rem'
                }}>
                    ✅
                </div>
            )}

            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>{quest.icon}</span>
                    <div style={{ flex: 1 }}>
                        <h3 className="card-title mb-0">{quest.title}</h3>
                    </div>
                </div>
                <p className="card-subtitle">{quest.description}</p>
            </div>

            <div className="card-body">
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>진행도</span>
                        <span className="font-semibold">{progress.current} / {target}</span>
                    </div>
                    <ProgressBar progress={percentage} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex gap-md">
                        <div className="badge badge-primary">
                            💰 {quest.reward.points}P
                        </div>
                        {quest.reward.exp && (
                            <div className="badge badge-secondary">
                                ⭐ {quest.reward.exp} EXP
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!isCompleted && percentage === 100 && (
                <div className="card-footer">
                    <button onClick={handleComplete} className="btn btn-success" style={{ width: '100%' }}>
                        완료하기
                    </button>
                </div>
            )}
        </div>
    );
}

export default QuestCard;
