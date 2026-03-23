/**
 * 팀 퀘스트 매니저
 * - 팀 협동 미션 관리
 * - 팀원 진행 상태 추적
 * - 팀 보상 지급
 */
import { storage, getKSTDateString, getKSTMonth } from './storage';
import { addPoints, addExperience } from './pointsCalculator';
import { userProfile } from './storage';

const TEAM_QUEST_KEY = 'safety_quest_team_quests';

// 팀 퀘스트 정의
const TEAM_QUESTS = {
    daily: [
        {
            id: 'team_perfect_day',
            title: '완벽한 우리 팀',
            description: '팀원 전원이 오늘의 일일 퀘스트를 100% 완료',
            icon: '🤝',
            type: 'daily',
            condition: { type: 'all_complete_daily', threshold: 100 },
            reward: { points: 300, exp: 100 },
            teamSize: 6
        },
        {
            id: 'team_hazard_relay',
            title: '위험 사냥 릴레이',
            description: '팀원 각자 최소 1건 위험 신고',
            icon: '🔍',
            type: 'daily',
            condition: { type: 'each_report_hazard', threshold: 1 },
            reward: { points: 200, exp: 50 },
            teamSize: 6
        }
    ],
    weekly: [
        {
            id: 'team_zero_accident',
            title: '무재해 한 주',
            description: '팀 소속 작업중지/사고 신고 0건 유지',
            icon: '🛡️',
            type: 'weekly',
            condition: { type: 'zero_incidents', threshold: 7 },
            reward: { points: 1000, exp: 300, gold: 500 },
            teamSize: 6
        },
        {
            id: 'team_education',
            title: '팀 교육 달성',
            description: '팀원 전원 주간 교육 이수 완료',
            icon: '📚',
            type: 'weekly',
            condition: { type: 'all_education_complete', threshold: 100 },
            reward: { points: 500, exp: 200 },
            teamSize: 6
        }
    ]
};

// 모의 팀원 데이터
const MOCK_TEAM_MEMBERS = [
    { id: 'member1', name: '김안전', role: 'technician' },
    { id: 'member2', name: '이보호', role: 'technician' },
    { id: 'member3', name: '박점검', role: 'technician' },
    { id: 'member4', name: '최수칙', role: 'supervisor' },
    { id: 'member5', name: '정예방', role: 'technician' },
];

/**
 * 팀 퀘스트 데이터 가져오기
 */
export const getTeamQuestData = () => {
    const today = getKSTDateString();
    const data = storage.get(TEAM_QUEST_KEY, { date: null, quests: {} });

    if (data.date !== today) {
        const freshData = { date: today, quests: generateTeamQuestProgress() };
        storage.set(TEAM_QUEST_KEY, freshData);
        return freshData;
    }

    return data;
};

/**
 * 팀 퀘스트 진행도 시뮬레이션 생성
 */
const generateTeamQuestProgress = () => {
    const myName = userProfile.getName() || '나';
    const allMembers = [...MOCK_TEAM_MEMBERS, { id: 'me', name: myName, role: userProfile.getRole() || 'technician', isMe: true }];

    const result = {};

    // 일간 퀘스트
    TEAM_QUESTS.daily.forEach(quest => {
        result[quest.id] = {
            ...quest,
            members: allMembers.map(m => ({
                ...m,
                // 내 진행도는 실제 값, 팀원은 시뮬레이션
                completed: m.isMe ? false : Math.random() > 0.3,
                progress: m.isMe ? 0 : Math.floor(Math.random() * 100)
            })),
            isCompleted: false,
            rewardClaimed: false
        };
    });

    // 주간 퀘스트
    TEAM_QUESTS.weekly.forEach(quest => {
        result[quest.id] = {
            ...quest,
            members: allMembers.map(m => ({
                ...m,
                completed: m.isMe ? false : Math.random() > 0.4,
                progress: m.isMe ? 0 : Math.floor(Math.random() * 100)
            })),
            isCompleted: false,
            rewardClaimed: false
        };
    });

    return result;
};

/**
 * 내 팀 퀘스트 진행도 업데이트
 */
export const updateMyTeamProgress = (questId, completed = true) => {
    const data = getTeamQuestData();
    const quest = data.quests[questId];
    if (!quest) return { success: false };

    const myMember = quest.members.find(m => m.isMe);
    if (myMember) {
        myMember.completed = completed;
        myMember.progress = completed ? 100 : myMember.progress;
    }

    // 팀 전체 완료 확인
    const allCompleted = quest.members.every(m => m.completed);
    if (allCompleted) {
        quest.isCompleted = true;
    }

    storage.set(TEAM_QUEST_KEY, data);
    return { success: true, isTeamCompleted: allCompleted };
};

/**
 * 팀 퀘스트 보상 수령
 */
export const claimTeamReward = (questId) => {
    const data = getTeamQuestData();
    const quest = data.quests[questId];

    if (!quest || !quest.isCompleted || quest.rewardClaimed) {
        return { success: false, message: '보상을 수령할 수 없습니다.' };
    }

    quest.rewardClaimed = true;
    storage.set(TEAM_QUEST_KEY, data);

    // 보상 지급
    if (quest.reward.points) addPoints(quest.reward.points, '팀 퀘스트', quest.title);
    if (quest.reward.exp) addExperience(quest.reward.exp);

    return { success: true, reward: quest.reward };
};

/**
 * 팀 퀘스트 목록 (UI용)
 */
export const getTeamQuests = () => {
    const data = getTeamQuestData();
    return Object.values(data.quests);
};

/**
 * 팀 퀘스트 통계
 */
export const getTeamQuestStats = () => {
    const quests = getTeamQuests();
    const total = quests.length;
    const completed = quests.filter(q => q.isCompleted).length;
    const completedMembers = quests.reduce((acc, q) => {
        return acc + q.members.filter(m => m.completed).length;
    }, 0);
    const totalMembers = quests.reduce((acc, q) => acc + q.members.length, 0);
    return { total, completed, completedMembers, totalMembers };
};
