import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuestsByTypeAndRole, QUEST_TYPE } from '../data/questsData';
import QuestCard from '../components/QuestCard';
import { completeQuest } from '../utils/questManager';
import authApi from '../api/authApi';
import questApi from '../api/questApi';

function MonthlyQuests({ role }) {
    const [quests, setQuests] = useState([]);

    const refreshQuests = () => {
        if (authApi.usesSupabase) {
            questApi.getPersonalQuests('monthly').then((rows) => setQuests(rows.map((quest) => ({ ...quest, link: '/daily' })))).catch(console.error);
            return;
        }
        const monthlyQuests = getQuestsByTypeAndRole(QUEST_TYPE.MONTHLY, role);
        setQuests(monthlyQuests);
    };

    useEffect(() => { refreshQuests(); }, [role]);

    const handleCompleteQuest = async (quest) => {
        if (authApi.usesSupabase) {
            await questApi.claimPersonalQuestReward(quest.id);
            refreshQuests();
            return;
        }
        completeQuest(quest.id);
        refreshQuests();
    };

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">
                        ← 대시보드로 돌아가기
                    </Link>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                        🏆 월간 퀘스트
                    </h1>
                    <p className="text-slate-600 text-lg">매월 1일에 리셋됩니다</p>
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

export default MonthlyQuests;
