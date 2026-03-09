const QUEST_ICONS = {
    daily_education_1: '📖',
    daily_quiz_1: '❓',
    daily_checklist_1: '📋',
    daily_hazard_1: '📸',
    daily_photo_1: '📸',
    daily_login_1: '🔑',
    daily_review_1: '✅',
    daily_safety_1: '🛡️'
};

const QUEST_DESCRIPTIONS = {
    daily_education_1: '고소작업 안전수칙 (10분)',
    daily_quiz_1: '교육 완료 후 풀기 가능',
    daily_checklist_1: '작업 전 안전점검 5항목',
    daily_hazard_1: '사진 촬영으로 위험 보고',
    daily_photo_1: '사진 촬영으로 위험 보고',
    daily_login_1: '출석 체크로 스트릭 유지',
    daily_review_1: '안전 활동 검토',
    daily_safety_1: '안전 실천 활동'
};

function TodayMissions({ quests = [], onQuestAction }) {
    const completedCount = quests.filter(q => q.isCompleted).length;
    const totalCount = quests.length;

    return (
        <div className="new-missions-section">
            <div className="new-missions-header">
                <div className="new-missions-title-row">
                    <h2 className="new-missions-title">오늘의 미션</h2>
                    <span className="new-missions-counter">{completedCount}/{totalCount} 완료</span>
                </div>
                <div className="new-missions-dots">
                    {quests.map((_, i) => (
                        <span
                            key={i}
                            className={`new-missions-dot ${i === 0 ? 'new-missions-dot--active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <div className="new-missions-list">
                {quests.map((quest) => {
                    const icon = QUEST_ICONS[quest.id] || '📋';
                    const description = quest.description || QUEST_DESCRIPTIONS[quest.id] || '';
                    const xpReward = quest.rewards?.exp || quest.rewards?.xp || 0;

                    return (
                        <div
                            key={quest.id}
                            className={`new-mission-card new-mission-card--${quest.state}`}
                            onClick={() => quest.isActive && onQuestAction?.(quest)}
                        >
                            <div className="new-mission-icon-wrap">
                                <span className="new-mission-icon">{icon}</span>
                            </div>
                            <div className="new-mission-content">
                                <div className="new-mission-title-row">
                                    <span className="new-mission-name">{quest.title || quest.name}</span>
                                    {xpReward > 0 && (
                                        <span className="new-mission-xp-badge">+{xpReward}XP</span>
                                    )}
                                </div>
                                <div className="new-mission-desc">{description}</div>
                            </div>
                            <div className="new-mission-status">
                                {quest.state === 'completed' && (
                                    <span className="new-mission-status-completed">
                                        <span className="new-mission-check">✓</span> 완료
                                    </span>
                                )}
                                {quest.state === 'active' && (
                                    <span className="new-mission-status-active">
                                        <span className="new-mission-clock">⏰</span> 진행중
                                        <span className="new-mission-arrow">&gt;</span>
                                    </span>
                                )}
                                {quest.state === 'locked' && (
                                    <span className="new-mission-status-locked">
                                        🔒 잠김
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TodayMissions;
