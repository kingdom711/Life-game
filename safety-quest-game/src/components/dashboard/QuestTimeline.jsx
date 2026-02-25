import QuestTimelineItem from './QuestTimelineItem';

function QuestTimeline({
    quests = [],
    onQuestAction,
    todayEducation,
    educationCompleted,
    onCheckIn,
    onOpenMonthlyRewards
}) {
    if (!quests.length) {
        return (
            <div className="quest-timeline-empty">
                오늘 진행 가능한 퀘스트가 없습니다.
            </div>
        );
    }

    return (
        <div className="quest-timeline" role="list">
            {quests.map((quest, index) => {
                const state = quest.state || (quest.isCompleted ? 'completed' : quest.isLocked ? 'locked' : 'active');
                return (
                    <QuestTimelineItem
                        key={quest.id}
                        quest={quest}
                        index={index}
                        state={state}
                        lockReason={quest.lockReason}
                        isLast={index === quests.length - 1}
                        onAction={onQuestAction}
                        todayEducation={todayEducation}
                        educationCompleted={educationCompleted}
                        onCheckIn={onCheckIn}
                        onOpenMonthlyRewards={onOpenMonthlyRewards}
                    />
                );
            })}
        </div>
    );
}

export default QuestTimeline;
