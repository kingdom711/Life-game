import { useState, useEffect } from 'react';
import { getQuestsByTypeAndRole, QUEST_TYPE } from '../data/questsData';
import QuestCard from '../components/QuestCard';
import { completeQuest } from '../utils/questManager';

function DailyQuests({ role }) {
    const [quests, setQuests] = useState([]);

    useEffect(() => {
        const dailyQuests = getQuestsByTypeAndRole(QUEST_TYPE.DAILY, role);
        setQuests(dailyQuests);
    }, [role]);

    const handleCompleteQuest = (quest) => {
        completeQuest(quest.id);
        // 새로고침
        const updatedQuests = getQuestsByTypeAndRole(QUEST_TYPE.DAILY, role);
        setQuests(updatedQuests);
    };

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <h1>📅 일간 퀘스트</h1>
                    <p className="text-muted">매일 자정에 리셋됩니다</p>
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

export default DailyQuests;
