import { useState, useEffect } from 'react';
import { getQuestsByTypeAndRole, QUEST_TYPE } from '../data/questsData';
import QuestCard from '../components/QuestCard';
import { completeQuest } from '../utils/questManager';

function WeeklyQuests({ role }) {
    const [quests, setQuests] = useState([]);

    useEffect(() => {
        const weeklyQuests = getQuestsByTypeAndRole(QUEST_TYPE.WEEKLY, role);
        setQuests(weeklyQuests);
    }, [role]);

    const handleCompleteQuest = (quest) => {
        completeQuest(quest.id);
        const updatedQuests = getQuestsByTypeAndRole(QUEST_TYPE.WEEKLY, role);
        setQuests(updatedQuests);
    };

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <h1>📊 주간 퀘스트</h1>
                    <p className="text-muted">매주 월요일에 리셋됩니다</p>
                </div>

                <div className="grid grid-2">
                    {quests.map(quest => (
                        <QuestCard
                            key={quest.id}
                            quest={quest}
                            onComplete={handleCompleteQuest}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WeeklyQuests;
