import { storage } from './storage';

const ACHIEVEMENTS_KEY = 'safety_quest_ranking_achievements';

export const RANKING_ACHIEVEMENTS = {
    FIRST_TOP_10: {
        id: 'FIRST_TOP_10',
        name: '첫 Top 10 진입',
        description: '랭킹 상위 10위 안에 처음 진입했습니다!',
        icon: '🏅',
        condition: (rank) => rank <= 10
    },
    FIRST_TOP_3: {
        id: 'FIRST_TOP_3',
        name: '첫 Top 3 달성',
        description: '랭킹 3위 안에 처음 진입했습니다!',
        icon: '🥉',
        condition: (rank) => rank <= 3
    },
    FIRST_PLACE: {
        id: 'FIRST_PLACE',
        name: '첫 1위 달성',
        description: '랭킹 1위를 처음 달성했습니다!',
        icon: '🏆',
        condition: (rank) => rank === 1
    },
    WEEKLY_TOP_3: {
        id: 'WEEKLY_TOP_3',
        name: '주간 Top 3',
        description: '주간 랭킹 3위 안에 진입했습니다!',
        icon: '⭐',
        condition: (rank, period) => rank <= 3 && period === 'weekly'
    },
    STREAK_KING: {
        id: 'STREAK_KING',
        name: '스트릭 챔피언',
        description: '스트릭 랭킹 1위를 달성했습니다!',
        icon: '🔥',
        condition: (rank, period, type) => rank === 1 && type === 'streak'
    }
};

export function getUnlockedAchievements() {
    return storage.get(ACHIEVEMENTS_KEY, {});
}

export function checkAndUpdateAchievements(currentUserRank, { period = 'all', type = 'points' } = {}) {
    if (!currentUserRank || !currentUserRank.isCurrentUser) return [];

    const rank = currentUserRank.rank;
    const unlocked = getUnlockedAchievements();
    const newlyUnlocked = [];

    Object.values(RANKING_ACHIEVEMENTS).forEach((achievement) => {
        if (unlocked[achievement.id]) return;

        if (achievement.condition(rank, period, type)) {
            unlocked[achievement.id] = {
                unlockedAt: new Date().toISOString(),
                rank,
                period,
                type
            };
            newlyUnlocked.push(achievement);
        }
    });

    if (newlyUnlocked.length > 0) {
        storage.set(ACHIEVEMENTS_KEY, unlocked);
    }

    return newlyUnlocked;
}

export function getUserAchievementIcons() {
    const unlocked = getUnlockedAchievements();
    return Object.keys(unlocked)
        .map((id) => RANKING_ACHIEVEMENTS[id]?.icon)
        .filter(Boolean);
}

