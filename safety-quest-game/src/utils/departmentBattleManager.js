/**
 * 부서 대항전 매니저
 * - 월간 부서 간 안전 점수 경쟁
 * - 점수 산정 (퀘스트 참여율, 교육 이수율, 위험 신고, 무재해, 체크리스트)
 * - 순위 변동 추적
 */
import { storage, getKSTMonth, getKSTDateString } from './storage';
import { addPoints } from './pointsCalculator';

const DEPT_BATTLE_KEY = 'safety_quest_dept_battle';

// 부서 목록 (모의 데이터)
const DEPARTMENTS = [
    { id: 'dept1', name: '생산1팀', memberCount: 12 },
    { id: 'dept2', name: '생산2팀', memberCount: 10 },
    { id: 'dept3', name: '품질관리팀', memberCount: 8 },
    { id: 'dept4', name: '시설관리팀', memberCount: 9 },
    { id: 'dept5', name: '자재팀', memberCount: 7 },
    { id: 'dept6', name: '안전환경팀', memberCount: 6 },
];

// 점수 카테고리별 배점
const SCORE_WEIGHTS = {
    questParticipation: { label: '퀘스트 참여율', maxScore: 30 },
    educationRate: { label: '교육 이수율', maxScore: 25 },
    hazardReports: { label: '위험 신고 건수', maxScore: 20 },
    safeDays: { label: '무재해 일수', maxScore: 15 },
    checklistRate: { label: '체크리스트 제출률', maxScore: 10 }
};

/**
 * 부서 대항전 데이터 가져오기
 */
export const getDeptBattleData = () => {
    const currentMonth = getKSTMonth();
    const data = storage.get(DEPT_BATTLE_KEY, { month: null, departments: [], myDept: 'dept1' });

    if (data.month !== currentMonth) {
        const freshData = generateMonthlyBattle(currentMonth);
        storage.set(DEPT_BATTLE_KEY, freshData);
        return freshData;
    }

    return data;
};

/**
 * 월간 대항전 데이터 생성
 */
const generateMonthlyBattle = (month) => {
    const today = getKSTDateString();
    const [, , day] = today.split('-').map(Number);

    const departments = DEPARTMENTS.map(dept => {
        // 일자에 따라 점진적으로 점수 증가 시뮬레이션
        const baseMultiplier = day / 31;
        const randomVariance = () => 0.7 + Math.random() * 0.3;

        const scores = {
            questParticipation: Math.round(30 * baseMultiplier * randomVariance() * 10) / 10,
            educationRate: Math.round(25 * baseMultiplier * randomVariance() * 10) / 10,
            hazardReports: Math.round(20 * baseMultiplier * randomVariance() * 10) / 10,
            safeDays: Math.round(15 * baseMultiplier * randomVariance() * 10) / 10,
            checklistRate: Math.round(10 * baseMultiplier * randomVariance() * 10) / 10
        };

        const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

        return {
            ...dept,
            scores,
            totalScore: Math.round(totalScore * 10) / 10,
            rankChange: Math.floor(Math.random() * 5) - 2, // -2 ~ +2
            highlights: generateHighlights(dept.name)
        };
    });

    // 순위 정렬
    departments.sort((a, b) => b.totalScore - a.totalScore);
    departments.forEach((dept, i) => { dept.rank = i + 1; });

    return {
        month,
        departments,
        myDept: 'dept1',
        lastUpdated: new Date().toISOString()
    };
};

/**
 * 부서 하이라이트 생성
 */
const generateHighlights = (deptName) => {
    const highlights = [
        `${deptName} 퀘스트 참여율 상승 중`,
        `${deptName} 위험 신고 활발`,
        `${deptName} 교육 이수 진행 중`,
        `${deptName} 무재해 기록 유지 중`
    ];
    return [highlights[Math.floor(Math.random() * highlights.length)]];
};

/**
 * 부서 순위 목록 (UI용)
 */
export const getDeptRankings = () => {
    const data = getDeptBattleData();
    return data.departments;
};

/**
 * 내 부서 정보
 */
export const getMyDeptInfo = () => {
    const data = getDeptBattleData();
    return data.departments.find(d => d.id === data.myDept) || data.departments[0];
};

/**
 * 대항전 남은 일수
 */
export const getBattleRemainingDays = () => {
    const now = new Date();
    const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const lastDay = new Date(kstNow.getFullYear(), kstNow.getMonth() + 1, 0).getDate();
    return lastDay - kstNow.getDate();
};

/**
 * 점수 카테고리 정보 조회
 */
export const getScoreCategories = () => SCORE_WEIGHTS;

/**
 * 대항전 보상 테이블
 */
export const getBattleRewards = () => [
    { rank: 1, reward: '팀원 전원 1000G + 단체 회식 쿠폰', gold: 1000, icon: '🥇' },
    { rank: 2, reward: '팀원 전원 500G', gold: 500, icon: '🥈' },
    { rank: 3, reward: '팀원 전원 300G', gold: 300, icon: '🥉' },
    { rank: 0, reward: '참여 부서 전원 100G', gold: 100, icon: '🏅' }
];
