import StreakButton from '../StreakButton';

const QUEST_SUBTITLES = {
    education: "(Today's Micro-Learning)",
    photo: "(Hazard Mission)",
    checklist: '(Safety Checklist)',
    review: '(Supervisor Review)',
    safety: '(Safety Action)',
    login: '(Attendance Check)'
};

const isEducationQuest = (quest) =>
    quest?.id?.includes('education') || quest?.category === 'education';

const isLoginQuest = (quest) =>
    quest?.id?.includes('login') || quest?.category === 'login';

const getActiveButtonLabel = (quest) => {
    const reward = Number(quest?.reward?.points || 0);
    if (isEducationQuest(quest)) return `퀴즈 풀기 (+${reward}P)`;
    if (quest?.id?.includes('hazard') || quest?.category === 'photo') return `시작하기 (+${reward}P)`;
    if (quest?.id?.includes('checklist') || quest?.category === 'checklist') return `점검 시작 (+${reward}P)`;
    if (quest?.id?.includes('review') || quest?.category === 'review') return `검토 시작 (+${reward}P)`;
    return `퀘스트 시작 (+${reward}P)`;
};

function QuestTimelineItem({
    quest,
    index,
    state,
    lockReason,
    isLast,
    onAction,
    todayEducation,
    onCheckIn,
    onOpenMonthlyRewards
}) {
    const rewardPoints = Number(quest?.reward?.points || 0);
    const subtitle = QUEST_SUBTITLES[quest?.category] || '';
    const indicator = state === 'completed' ? '✓' : state === 'locked' ? '🔒' : String(index + 1);

    const showEducationPreview = state === 'active' && isEducationQuest(quest) && todayEducation;
    const showLoginButton = state === 'active' && isLoginQuest(quest);

    return (
        <div
            className={`quest-timeline-item quest-state-${state}`}
            style={{ animationDelay: `${index * 0.1}s` }}
            role="listitem"
        >
            <div className="quest-timeline-rail">
                <div className={`quest-indicator quest-indicator-${state}`}>{indicator}</div>
                {!isLast && <div className={`quest-connector quest-connector-${state}`} />}
            </div>

            <article className={`quest-card quest-card-${state}`}>
                <header className="quest-card-header">
                    <div className="quest-title-wrap">
                        <h3 className="quest-title">{quest?.title}</h3>
                        {state === 'active' && subtitle && (
                            <p className="quest-subtitle">{subtitle}</p>
                        )}
                    </div>
                    {(state === 'completed' || state === 'locked') && (
                        <div className="quest-reward-label">
                            {state === 'completed'
                                ? `+${rewardPoints}P Earned`
                                : `(+${rewardPoints}P)`}
                        </div>
                    )}
                </header>

                {state === 'completed' && null}

                {state === 'locked' && (
                    <p className="quest-lock-reason">{lockReason || '이전 퀘스트 완료 필요'}</p>
                )}

                {state === 'active' && (
                    <div className="quest-active-content">
                        <p className="quest-description">{quest?.description}</p>

                        {showEducationPreview && (
                            <div className="quest-education-preview">
                                <div className="quest-education-thumb">
                                    {todayEducation.thumbnailUrl ? (
                                        <img src={todayEducation.thumbnailUrl} alt={todayEducation.title} />
                                    ) : (
                                        <span aria-hidden="true">🎬</span>
                                    )}
                                </div>
                                <div className="quest-education-meta">
                                    <strong>{todayEducation.title}</strong>
                                    <span>{Math.ceil((todayEducation.duration || 0) / 60)}분</span>
                                </div>
                            </div>
                        )}

                        {showLoginButton ? (
                            <div className="quest-login-button-wrap">
                                <StreakButton
                                    onCheckIn={onCheckIn}
                                    onShowMonthlyRewards={onOpenMonthlyRewards}
                                />
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="quest-action-button"
                                onClick={() => onAction?.(quest)}
                            >
                                {getActiveButtonLabel(quest)}
                            </button>
                        )}
                    </div>
                )}
            </article>
        </div>
    );
}

export default QuestTimelineItem;
