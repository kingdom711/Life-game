/**
 * 마이크로 러닝 콘텐츠 데이터
 * 1~2분 초단기 학습 콘텐츠 (플래시 퀴즈, 안전 카드, 시나리오)
 */

export const MICRO_TYPE = {
    QUIZ: 'quiz',
    CARD: 'card',
    SCENARIO: 'scenario'
};

export const microLearningContents = [
    // ===== 플래시 퀴즈 (O/X) =====
    {
        id: 'micro_quiz_01',
        type: MICRO_TYPE.QUIZ,
        question: '고소작업 시 안전대(안전벨트) 착용은 선택사항이다.',
        answer: false,
        explanation: '2m 이상 추락 위험이 있는 고소작업 시 안전대 착용은 법적 의무사항입니다. (산업안전보건기준에 관한 규칙 제44조)',
        category: '추락 방지',
        reward: { points: 20, exp: 10 }
    },
    {
        id: 'micro_quiz_02',
        type: MICRO_TYPE.QUIZ,
        question: '안전모는 충격 후에도 외관에 이상이 없으면 계속 사용할 수 있다.',
        answer: false,
        explanation: '한 번이라도 심한 충격을 받은 안전모는 내부 구조가 손상되었을 수 있으므로 즉시 교체해야 합니다.',
        category: '보호구',
        reward: { points: 20, exp: 10 }
    },
    {
        id: 'micro_quiz_03',
        type: MICRO_TYPE.QUIZ,
        question: '밀폐공간 작업 전 산소 농도가 18% 이상이면 안전하다.',
        answer: true,
        explanation: '산소 농도 18% 이상 23.5% 이하가 안전 범위입니다. 18% 미만은 산소 결핍 위험이 있습니다.',
        category: '밀폐공간',
        reward: { points: 20, exp: 10 }
    },
    {
        id: 'micro_quiz_04',
        type: MICRO_TYPE.QUIZ,
        question: '사다리 작업 시 가장 안전한 각도는 75도(4:1 비율)이다.',
        answer: true,
        explanation: '사다리의 기울기는 75도(수직 4, 수평 1)가 가장 안정적입니다. 이보다 가파르면 뒤로 넘어질 위험이 있습니다.',
        category: '사다리 작업',
        reward: { points: 20, exp: 10 }
    },
    {
        id: 'micro_quiz_05',
        type: MICRO_TYPE.QUIZ,
        question: '전기 작업 시 절연장갑만 착용하면 감전 위험이 없다.',
        answer: false,
        explanation: '절연장갑 외에도 절연화, 절연매트 등 복합적인 보호장구를 사용하고, 반드시 전원을 차단한 후 작업해야 합니다.',
        category: '전기 안전',
        reward: { points: 20, exp: 10 }
    },
    {
        id: 'micro_quiz_06',
        type: MICRO_TYPE.QUIZ,
        question: '지게차 운전 시 적재물을 높이 올린 상태로 이동해야 시야가 확보된다.',
        answer: false,
        explanation: '적재물은 지면에서 15~20cm 높이로 낮추고, 마스트를 뒤로 기울인 상태에서 이동해야 합니다.',
        category: '중장비',
        reward: { points: 20, exp: 10 }
    },
    {
        id: 'micro_quiz_07',
        type: MICRO_TYPE.QUIZ,
        question: '소화기는 제조일로부터 10년까지 사용할 수 있다.',
        answer: true,
        explanation: '소화기의 내용연수는 10년입니다. 10년이 지나면 폐기하고 새 것으로 교체해야 합니다.',
        category: '소방 안전',
        reward: { points: 20, exp: 10 }
    },
    {
        id: 'micro_quiz_08',
        type: MICRO_TYPE.QUIZ,
        question: '안전화의 앞코 보호 기능은 15kN 이상의 충격을 견뎌야 한다.',
        answer: true,
        explanation: 'KS 규격에 따르면 안전화 앞코는 15kN(약 1.5톤) 이상의 압축 하중을 견뎌야 합니다.',
        category: '보호구',
        reward: { points: 20, exp: 10 }
    },

    // ===== 안전 카드 =====
    {
        id: 'micro_card_01',
        type: MICRO_TYPE.CARD,
        title: '추락 방지 3원칙',
        content: '1. 안전난간 설치\n2. 안전망 설치\n3. 개인보호구(안전대) 착용',
        tip: '작업 전 3가지를 모두 확인하세요',
        category: '추락 방지',
        reward: { points: 10, exp: 5 }
    },
    {
        id: 'micro_card_02',
        type: MICRO_TYPE.CARD,
        title: '끼임 사고 예방 수칙',
        content: '1. 회전체 덮개(가드) 확인\n2. 헐렁한 옷·장신구 착용 금지\n3. 기계 정지 후 정비',
        tip: '끼임 사고는 사망 사고 2위입니다',
        category: '끼임 예방',
        reward: { points: 10, exp: 5 }
    },
    {
        id: 'micro_card_03',
        type: MICRO_TYPE.CARD,
        title: '온열질환 예방 3대 수칙',
        content: '1. 물 자주 마시기 (매 15~20분)\n2. 그늘에서 정기적 휴식\n3. 가벼운 옷 착용 + 모자',
        tip: '기온 33℃ 이상 시 야외작업 주의',
        category: '여름 안전',
        reward: { points: 10, exp: 5 }
    },
    {
        id: 'micro_card_04',
        type: MICRO_TYPE.CARD,
        title: '동절기 안전 수칙',
        content: '1. 작업 전 빙판 제거·모래 살포\n2. 보온 장비 착용\n3. 동파 방지 배관 점검',
        tip: '기온 0℃ 이하 시 미끄럼·동파 주의',
        category: '겨울 안전',
        reward: { points: 10, exp: 5 }
    },

    // ===== 30초 시나리오 =====
    {
        id: 'micro_scenario_01',
        type: MICRO_TYPE.SCENARIO,
        situation: '비 오는 날 옥외 철골 작업 중, 동료가 안전대 없이 올라가려 합니다.',
        choices: [
            { label: '위험하니까 내려오라고 말한다', correct: true },
            { label: '바쁘니까 빨리 하라고 한다', correct: false },
            { label: '모른 척 한다', correct: false }
        ],
        correctExplanation: '즉시 제지하고, 안전대 착용을 요청하세요. 필요 시 작업중지권을 행사할 수 있습니다.',
        category: '작업중지',
        reward: { points: 30, exp: 15 }
    },
    {
        id: 'micro_scenario_02',
        type: MICRO_TYPE.SCENARIO,
        situation: '밀폐공간에서 동료가 쓰러져 있습니다. 어떻게 해야 할까요?',
        choices: [
            { label: '즉시 들어가서 구출한다', correct: false },
            { label: '119에 신고하고 환기 후 진입한다', correct: true },
            { label: '큰 소리로 부른다', correct: false }
        ],
        correctExplanation: '절대 바로 진입하지 마세요! 2차 사고 위험이 있습니다. 119 신고 후 환기·산소 확인 후 진입하세요.',
        category: '밀폐공간',
        reward: { points: 30, exp: 15 }
    },
    {
        id: 'micro_scenario_03',
        type: MICRO_TYPE.SCENARIO,
        situation: '크레인 작업 중 와이어로프에서 소선 절단이 발견되었습니다.',
        choices: [
            { label: '작업을 즉시 중단하고 교체를 요청한다', correct: true },
            { label: '가벼운 물건만 들어올린다', correct: false },
            { label: '테이프로 감아서 사용한다', correct: false }
        ],
        correctExplanation: '소선 절단은 와이어로프 파단의 전조입니다. 즉시 사용을 중단하고 교체해야 합니다.',
        category: '양중 작업',
        reward: { points: 30, exp: 15 }
    }
];

// 오늘의 마이크로 러닝 콘텐츠 선정 (날짜 기반 로테이션)
export const getTodayMicroContent = () => {
    const today = new Date();
    // KST 날짜 기반
    const kstDate = new Date(today.getTime() + 9 * 60 * 60 * 1000);
    const dayOfYear = Math.floor(
        (kstDate - new Date(kstDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const index = dayOfYear % microLearningContents.length;
    return microLearningContents[index];
};

export default {
    microLearningContents,
    getTodayMicroContent,
    MICRO_TYPE
};
