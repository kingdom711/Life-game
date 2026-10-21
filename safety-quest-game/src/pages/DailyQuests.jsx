import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuestsByTypeRoleAndSpec, QUEST_TYPE } from '../data/questsData';
import { getActiveSpecialization } from '../utils/specializationManager';
import QuestCard from '../components/QuestCard';
import { completeQuest } from '../utils/questManager';
import useWorkPermission from '../utils/useWorkPermission';
import EducationRequiredModal from '../components/EducationRequiredModal';
import ChecklistFormModal from '../components/ChecklistFormModal';
import PhotoUploadModal from '../components/PhotoUploadModal';
import ChecklistReviewModal from '../components/ChecklistReviewModal';
import ChainQuestCard from '../components/ChainQuestCard';
import authApi from '../api/authApi';
import questApi from '../api/questApi';

const NON_GATED_QUESTS = ['daily_education_1', 'daily_login_1'];
const SERVER_QUEST_LINKS = {
    daily_login_1: '/',
    daily_education_1: '/education',
    daily_hazard_1: '/hazard-cycle',
};

const decorateServerQuest = (quest) => ({
    ...quest,
    link: SERVER_QUEST_LINKS[quest.code],
    actionable: ['daily_checklist_1', 'daily_review_1'].includes(quest.code),
});

function DailyQuests({ role }) {
    const [quests, setQuests] = useState([]);
    const { hasPermission, showModal, checkPermission, closeModal, educationInfo } = useWorkPermission();
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    useEffect(() => {
        if (authApi.usesSupabase) {
            questApi.getPersonalQuests('daily').then((rows) => setQuests(rows.map(decorateServerQuest))).catch(console.error);
            return;
        }
        const dailyQuests = getQuestsByTypeRoleAndSpec(QUEST_TYPE.DAILY, role, getActiveSpecialization()?.id || null);
        setQuests(dailyQuests);
    }, [role]);

    const refreshQuests = () => {
        if (authApi.usesSupabase) {
            questApi.getPersonalQuests('daily').then((rows) => setQuests(rows.map(decorateServerQuest))).catch(console.error);
            return;
        }
        const updatedQuests = getQuestsByTypeRoleAndSpec(QUEST_TYPE.DAILY, role, getActiveSpecialization()?.id || null);
        setQuests(updatedQuests);
    };

    const handleCompleteQuest = async (quest) => {
        if (authApi.usesSupabase) {
            if (quest.progress?.completed) {
                await questApi.claimPersonalQuestReward(quest.id);
                refreshQuests();
                return;
            }
            if (quest.code === 'daily_checklist_1') {
                setIsChecklistModalOpen(true);
                return;
            }
            if (quest.code === 'daily_review_1') {
                setIsReviewModalOpen(true);
            }
            return;
        }
        if (!NON_GATED_QUESTS.includes(quest.id) && !checkPermission()) {
            return;
        }
        if (quest.id === 'daily_checklist_1') {
            setIsChecklistModalOpen(true);
            return;
        }
        if (quest.id === 'daily_photo_1') {
            setIsPhotoModalOpen(true);
            return;
        }
        if (quest.id === 'daily_review_1') {
            setIsReviewModalOpen(true);
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
                        📅 일간 퀘스트
                    </h1>
                    <p className="text-slate-600 text-lg">매일 자정에 리셋됩니다</p>
                </div>

                <div className="grid grid-2">
                    {quests.map(quest => (
                        <QuestCard
                            key={quest.id}
                            quest={quest}
                            onComplete={handleCompleteQuest}
                            isLocked={!hasPermission && !NON_GATED_QUESTS.includes(quest.id)}
                        />
                    ))}
                </div>

                {/* 체인 퀘스트 */}
                {!authApi.usesSupabase && <ChainQuestCard role={role} onComplete={() => refreshQuests()} />}
            </div>

            <EducationRequiredModal
                isOpen={showModal}
                onClose={closeModal}
                educationInfo={educationInfo}
            />

            <ChecklistFormModal
                isOpen={isChecklistModalOpen}
                onClose={() => setIsChecklistModalOpen(false)}
                onComplete={() => refreshQuests()}
                role={role}
            />

            <PhotoUploadModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onComplete={() => refreshQuests()}
                role={role}
            />

            <ChecklistReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onComplete={() => refreshQuests()}
            />
        </div>
    );
}

export default DailyQuests;
