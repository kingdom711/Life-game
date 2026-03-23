/**
 * 돌발 이벤트 퀘스트 매니저
 * - 날씨 기반 자동 생성
 * - 시간 제한 이벤트
 * - 특별 보상
 */
import { storage, getKSTDateString } from './storage';
import { addPoints, addExperience } from './pointsCalculator';
import { addSeasonPoints } from './seasonManager';

const EVENT_QUEST_KEY = 'safety_quest_event_quests';

// 날씨/조건별 이벤트 퀘스트 템플릿
const EVENT_TEMPLATES = {
    cold: {
        icon: '🥶',
        title: '동파 방지 긴급 점검',
        description: '영하의 기온! 배관 및 수도 시설의 동파 방지 조치를 확인하세요.',
        category: 'weather',
        reward: { points: 200, exp: 50 },
        trigger: '기온 0℃ 이하',
        actions: ['배관 보온재 상태 확인', '외부 수전 잠금 확인', '동결방지 히터 가동 확인']
    },
    heat: {
        icon: '🌡️',
        title: '온열질환 예방 점검',
        description: '폭염 경보! 작업자 건강과 휴식 환경을 확인하세요.',
        category: 'weather',
        reward: { points: 200, exp: 50 },
        trigger: '기온 33℃ 이상',
        actions: ['음료수/이온음료 비치 확인', '그늘 휴식 공간 확보', '작업자 건강 상태 확인']
    },
    rain: {
        icon: '🌧️',
        title: '우천 시 미끄럼 방지',
        description: '비 오는 날 미끄러짐 사고를 예방하세요.',
        category: 'weather',
        reward: { points: 150, exp: 40 },
        trigger: '강수',
        actions: ['바닥 미끄럼 방지 매트 확인', '우수 배수구 점검', '전기 장비 빗물 차단 확인']
    },
    wind: {
        icon: '💨',
        title: '강풍 시 고소작업 안전',
        description: '강풍 주의! 고소작업 중단 기준을 확인하세요.',
        category: 'weather',
        reward: { points: 300, exp: 80 },
        trigger: '풍속 10m/s 이상',
        actions: ['고소작업 중단 여부 판단', '가설 구조물 고정 상태 확인', '낙하물 위험 구역 통제']
    },
    dust: {
        icon: '😷',
        title: '미세먼지 대응 점검',
        description: '미세먼지 농도가 높습니다. 방진 조치를 확인하세요.',
        category: 'weather',
        reward: { points: 150, exp: 40 },
        trigger: '미세먼지 나쁨 이상',
        actions: ['방진마스크 착용 상태 확인', '실외 작업 시간 조정', '환기 시설 점검']
    },
    // 시간 기반 이벤트
    morning_safety: {
        icon: '🌅',
        title: '아침 안전 5분 체크',
        description: '작업 시작 전 주변 안전 상태를 빠르게 점검하세요.',
        category: 'time',
        reward: { points: 100, exp: 30 },
        trigger: '07:00~09:00',
        actions: ['작업 구역 정리정돈', '안전장비 착용 확인', '위험 표지판 확인']
    },
    afternoon_check: {
        icon: '☀️',
        title: '오후 집중력 안전 체크',
        description: '오후 졸음 시간대! 안전 의식을 재점검하세요.',
        category: 'time',
        reward: { points: 100, exp: 30 },
        trigger: '14:00~16:00',
        actions: ['피로도 자가 진단', '동료 안전 상태 확인', '위험 구역 재확인']
    },
    // 특별 이벤트
    safety_day: {
        icon: '🎯',
        title: '안전의 날 특별 미션',
        description: '매월 4일은 산업안전의 날! 특별 안전 활동을 수행하세요.',
        category: 'special',
        reward: { points: 500, exp: 150 },
        trigger: '매월 4일',
        actions: ['안전 서약서 작성', '위험 요소 3건 발굴', '동료 안전 칭찬 1회']
    }
};

/**
 * 현재 활성 이벤트 퀘스트 가져오기
 */
export const getActiveEventQuests = () => {
    const today = getKSTDateString();
    const data = storage.get(EVENT_QUEST_KEY, { date: null, quests: [] });

    if (data.date !== today) {
        // 오늘 날짜의 이벤트 생성
        const newQuests = generateTodayEvents();
        const newData = { date: today, quests: newQuests };
        storage.set(EVENT_QUEST_KEY, newData);
        return newQuests;
    }

    return data.quests;
};

/**
 * 오늘의 이벤트 퀘스트 자동 생성
 */
const generateTodayEvents = () => {
    const events = [];
    const now = new Date();
    const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const hour = kstNow.getHours();
    const day = kstNow.getDate();

    // 시간 기반 이벤트
    if (hour >= 7 && hour < 9) {
        events.push(createEventQuest('morning_safety'));
    }
    if (hour >= 14 && hour < 16) {
        events.push(createEventQuest('afternoon_check'));
    }

    // 매월 4일 특별 이벤트
    if (day === 4) {
        events.push(createEventQuest('safety_day'));
    }

    // 랜덤 날씨 이벤트 1개 (시뮬레이션)
    const weatherEvents = ['cold', 'heat', 'rain', 'wind', 'dust'];
    const seasonalWeights = getSeasonalWeights(kstNow.getMonth());
    const selectedWeather = weightedRandom(weatherEvents, seasonalWeights);
    events.push(createEventQuest(selectedWeather));

    return events;
};

/**
 * 이벤트 퀘스트 객체 생성
 */
const createEventQuest = (templateId) => {
    const template = EVENT_TEMPLATES[templateId];
    if (!template) return null;

    return {
        id: `event_${templateId}_${getKSTDateString()}`,
        templateId,
        ...template,
        isCompleted: false,
        completedActions: [],
        createdAt: new Date().toISOString()
    };
};

/**
 * 계절별 날씨 이벤트 가중치
 */
const getSeasonalWeights = (month) => {
    // [cold, heat, rain, wind, dust]
    if (month >= 11 || month <= 1) return [40, 5, 15, 25, 15]; // 겨울
    if (month >= 2 && month <= 4) return [10, 10, 20, 30, 30]; // 봄 (황사)
    if (month >= 5 && month <= 7) return [5, 35, 35, 10, 15]; // 여름
    return [15, 15, 25, 25, 20]; // 가을
};

/**
 * 가중치 기반 랜덤 선택
 */
const weightedRandom = (items, weights) => {
    const total = weights.reduce((sum, w) => sum + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
    }
    return items[items.length - 1];
};

/**
 * 이벤트 퀘스트 액션 완료
 */
export const completeEventAction = (questId, actionIndex) => {
    const today = getKSTDateString();
    const data = storage.get(EVENT_QUEST_KEY, { date: today, quests: [] });

    const quest = data.quests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return { success: false };

    if (!quest.completedActions.includes(actionIndex)) {
        quest.completedActions.push(actionIndex);
    }

    // 모든 액션 완료 시 퀘스트 완료
    if (quest.completedActions.length >= quest.actions.length) {
        quest.isCompleted = true;
        quest.completedAt = new Date().toISOString();

        // 보상 지급
        if (quest.reward.points) {
            addPoints(quest.reward.points, '이벤트 퀘스트', quest.title);
            addSeasonPoints(quest.reward.points, 'quest');
        }
        if (quest.reward.exp) addExperience(quest.reward.exp);
    }

    storage.set(EVENT_QUEST_KEY, data);

    return {
        success: true,
        isQuestCompleted: quest.isCompleted,
        progress: `${quest.completedActions.length}/${quest.actions.length}`
    };
};

/**
 * 이벤트 퀘스트 한번에 완료
 */
export const completeEventQuest = (questId) => {
    const today = getKSTDateString();
    const data = storage.get(EVENT_QUEST_KEY, { date: today, quests: [] });

    const quest = data.quests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return { success: false };

    quest.isCompleted = true;
    quest.completedActions = quest.actions.map((_, i) => i);
    quest.completedAt = new Date().toISOString();

    // 보상 지급
    if (quest.reward.points) {
        addPoints(quest.reward.points, '이벤트 퀘스트', quest.title);
        addSeasonPoints(quest.reward.points, 'quest');
    }
    if (quest.reward.exp) addExperience(quest.reward.exp);

    storage.set(EVENT_QUEST_KEY, data);

    return { success: true, reward: quest.reward };
};

/**
 * 오늘 이벤트 퀘스트 통계
 */
export const getEventQuestStats = () => {
    const quests = getActiveEventQuests();
    const total = quests.length;
    const completed = quests.filter(q => q.isCompleted).length;
    return { total, completed, remaining: total - completed };
};
