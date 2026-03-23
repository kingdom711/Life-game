/**
 * 시즌제 랭킹 매니저
 * - 월간 시즌 (매월 1일 리셋)
 * - 시즌 포인트 별도 관리
 * - 시즌 보상 지급
 * - 명예의 전당
 */
import { storage, getKSTDateString, getKSTMonth, points } from './storage';

const SEASON_KEY = 'safety_quest_season_data';
const SEASON_HISTORY_KEY = 'safety_quest_season_history';
const HALL_OF_FAME_KEY = 'safety_quest_hall_of_fame';

// 시즌 보상 테이블
const SEASON_REWARDS = [
    { minRank: 1, maxRank: 1, gold: 2000, title: '시즌 챔피언', trophy: 'legendary', label: '1위' },
    { minRank: 2, maxRank: 3, gold: 1000, title: null, trophy: 'epic', label: '2~3위' },
    { minRank: 4, maxRank: 10, gold: 500, title: null, trophy: 'rare', label: '4~10위' },
    { minRank: 11, maxRank: Infinity, gold: 200, title: null, trophy: 'common', label: '상위 30%', percentile: 30 },
];

// 참여 보상
const PARTICIPATION_REWARD = { gold: 100, trophy: 'participation' };

/**
 * 현재 시즌 ID (YYYY-MM)
 */
export const getCurrentSeasonId = () => getKSTMonth();

/**
 * 현재 시즌 데이터 가져오기
 */
export const getSeasonData = () => {
    const currentSeason = getCurrentSeasonId();
    const data = storage.get(SEASON_KEY, {
        seasonId: null,
        seasonPoints: 0,
        questsCompleted: 0,
        hazardsReported: 0,
        educationCompleted: 0,
        streakDays: 0,
        startedAt: null
    });

    // 시즌이 바뀌었으면 이전 시즌 기록 저장 후 리셋
    if (data.seasonId && data.seasonId !== currentSeason) {
        archiveSeason(data);
        const fresh = createFreshSeason(currentSeason);
        storage.set(SEASON_KEY, fresh);
        return fresh;
    }

    // 첫 시즌 진입
    if (!data.seasonId) {
        const fresh = createFreshSeason(currentSeason);
        storage.set(SEASON_KEY, fresh);
        return fresh;
    }

    return data;
};

const createFreshSeason = (seasonId) => ({
    seasonId,
    seasonPoints: 0,
    questsCompleted: 0,
    hazardsReported: 0,
    educationCompleted: 0,
    streakDays: 0,
    startedAt: new Date().toISOString()
});

/**
 * 시즌 포인트 추가
 */
export const addSeasonPoints = (amount, source = '') => {
    const data = getSeasonData();
    data.seasonPoints += amount;

    if (source === 'quest') data.questsCompleted += 1;
    if (source === 'hazard') data.hazardsReported += 1;
    if (source === 'education') data.educationCompleted += 1;
    if (source === 'streak') data.streakDays += 1;

    storage.set(SEASON_KEY, data);
    return data;
};

/**
 * 이전 시즌 기록 보관
 */
const archiveSeason = (seasonData) => {
    const history = storage.get(SEASON_HISTORY_KEY, []);
    history.push({
        ...seasonData,
        archivedAt: new Date().toISOString()
    });
    // 최근 12개 시즌만 보관
    if (history.length > 12) history.shift();
    storage.set(SEASON_HISTORY_KEY, history);
};

/**
 * 시즌 이력 조회
 */
export const getSeasonHistory = () => {
    return storage.get(SEASON_HISTORY_KEY, []).reverse();
};

/**
 * 시즌 남은 일수 계산
 */
export const getSeasonRemainingDays = () => {
    const now = new Date();
    const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const year = kstNow.getFullYear();
    const month = kstNow.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const currentDay = kstNow.getDate();
    return lastDay - currentDay;
};

/**
 * 시즌 진행률 (%)
 */
export const getSeasonProgress = () => {
    const now = new Date();
    const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const year = kstNow.getFullYear();
    const month = kstNow.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const currentDay = kstNow.getDate();
    return Math.round((currentDay / lastDay) * 100);
};

/**
 * 시즌 보상 테이블 조회
 */
export const getSeasonRewards = () => SEASON_REWARDS;

/**
 * 시즌 보상 수령 (시즌 종료 시)
 */
export const claimSeasonReward = (rank, totalParticipants) => {
    const reward = SEASON_REWARDS.find(r => {
        if (r.percentile) {
            return rank <= Math.ceil(totalParticipants * (r.percentile / 100));
        }
        return rank >= r.minRank && rank <= r.maxRank;
    });

    if (!reward) {
        // 참여 보상
        points.add(PARTICIPATION_REWARD.gold, '시즌 보상', '시즌 참여 보상');
        return { ...PARTICIPATION_REWARD, rank };
    }

    points.add(reward.gold, '시즌 보상', `시즌 ${reward.label} 보상`);
    return { ...reward, rank };
};

/**
 * 명예의 전당 조회
 */
export const getHallOfFame = () => {
    return storage.get(HALL_OF_FAME_KEY, []);
};

/**
 * 명예의 전당 등록
 */
export const addToHallOfFame = (seasonId, userName, seasonPoints) => {
    const hall = getHallOfFame();
    hall.push({
        seasonId,
        userName,
        seasonPoints,
        recordedAt: new Date().toISOString()
    });
    storage.set(HALL_OF_FAME_KEY, hall);
};

/**
 * 시즌 랭킹 목 데이터 생성 (API 미연동 시)
 */
export const getMockSeasonRankings = () => {
    const myData = getSeasonData();
    const mockUsers = [
        { name: '김안전', seasonPoints: 4200, questsCompleted: 85 },
        { name: '이보호', seasonPoints: 3800, questsCompleted: 72 },
        { name: '박점검', seasonPoints: 3500, questsCompleted: 68 },
        { name: '최수칙', seasonPoints: 3100, questsCompleted: 61 },
        { name: '정예방', seasonPoints: 2800, questsCompleted: 55 },
        { name: '한관리', seasonPoints: 2400, questsCompleted: 48 },
        { name: '유감독', seasonPoints: 2100, questsCompleted: 42 },
        { name: '조시설', seasonPoints: 1800, questsCompleted: 35 },
    ];

    // 내 데이터 추가
    const allUsers = [
        ...mockUsers,
        { name: '나', seasonPoints: myData.seasonPoints, questsCompleted: myData.questsCompleted, isMe: true }
    ];

    // 정렬
    allUsers.sort((a, b) => b.seasonPoints - a.seasonPoints);

    return allUsers.map((u, i) => ({
        rank: i + 1,
        name: u.name,
        seasonPoints: u.seasonPoints,
        questsCompleted: u.questsCompleted,
        isMe: u.isMe || false
    }));
};

/**
 * 현재 시즌 이름 (예: "2026년 3월 시즌")
 */
export const getSeasonDisplayName = () => {
    const seasonId = getCurrentSeasonId();
    const [year, month] = seasonId.split('-');
    return `${year}년 ${parseInt(month)}월 시즌`;
};
