/**
 * 안전 교육 콘텐츠 데이터
 * 마이크로 러닝 기반 스마트 안전 교육 시스템
 * 
 * - 매일 10분 내외의 짧은 교육 영상
 * - 퀴즈를 통한 실효성 확보
 * - 법정 교육 시간 누적 관리
 */

// 교육 카테고리
export const EDUCATION_CATEGORY = {
    FALL_PREVENTION: 'fall_prevention',      // 추락 예방
    COLLISION_PREVENTION: 'collision_prevention', // 부딪힘 예방
    PINCH_PREVENTION: 'pinch_prevention',    // 끼임 예방
    FIRE_SAFETY: 'fire_safety',              // 화재 안전
    PPE: 'ppe',                              // 개인보호구
    ELECTRICAL: 'electrical',                // 전기 안전
    CONFINED_SPACE: 'confined_space',        // 밀폐공간
    CHEMICAL: 'chemical',                    // 화학물질
    WORK_STOP_RIGHT: 'work_stop_right'       // [New] 작업중지권
};

// 카테고리 표시 정보
export const CATEGORY_INFO = {
    [EDUCATION_CATEGORY.FALL_PREVENTION]: {
        name: '추락 예방',
        icon: '🪜',
        color: '#ef4444'
    },
    [EDUCATION_CATEGORY.COLLISION_PREVENTION]: {
        name: '부딪힘 예방',
        icon: '⚠️',
        color: '#f59e0b'
    },
    [EDUCATION_CATEGORY.PINCH_PREVENTION]: {
        name: '끼임 예방',
        icon: '⚙️',
        color: '#eab308'
    },
    [EDUCATION_CATEGORY.FIRE_SAFETY]: {
        name: '화재 안전',
        icon: '🔥',
        color: '#dc2626'
    },
    [EDUCATION_CATEGORY.PPE]: {
        name: '개인보호구',
        icon: '🦺',
        color: '#22c55e'
    },
    [EDUCATION_CATEGORY.ELECTRICAL]: {
        name: '전기 안전',
        icon: '⚡',
        color: '#3b82f6'
    },
    [EDUCATION_CATEGORY.CONFINED_SPACE]: {
        name: '밀폐공간',
        icon: '🚧',
        color: '#6366f1'
    },
    [EDUCATION_CATEGORY.CHEMICAL]: {
        name: '화학물질',
        icon: '🧪',
        color: '#a855f7'
    },
    [EDUCATION_CATEGORY.WORK_STOP_RIGHT]: {
        name: '작업중지권',
        icon: '✋',
        color: '#dc2626'
    }
};

// 법정 교육 시간 설정 (연간 기준)
export const LEGAL_EDUCATION_REQUIREMENTS = {
    ANNUAL_HOURS: 4,           // 연간 법정 의무 교육 시간
    QUARTERLY_HOURS: 1,        // 분기별 권장 시간
    MONTHLY_MINIMUM: 0.33      // 월별 최소 권장 시간 (20분)
};

/**
 * 교육 콘텐츠 목록
 * 각 교육은 10분 내외의 영상과 5문제 퀴즈로 구성
 */
export const educationContents = [
    // Week 1 - 추락 예방
    {
        id: 'edu_001',
        category: EDUCATION_CATEGORY.FALL_PREVENTION,
        title: '사다리 작업 안전 수칙',
        description: '사다리 사용 시 안전한 설치 방법과 작업 수칙을 학습합니다.',
        videoUrl: '/videos/safety/ladder_safety.mp4',
        youtubeVideoId: '3wzOfsyEvow',
        thumbnailUrl: '/images/education/ladder_thumbnail.png',
        duration: 600, // 10분
        requiredWatchTime: 540, // 90% = 9분
        legalHours: 0.17, // 10분 = 0.17시간
        requiredScore: 80, // 80% 이상 통과
        points: 50,
        exp: 20,
        weekNumber: 1,
        dayOfWeek: 1, // 월요일
        quiz: [
            {
                id: 'q1_001',
                question: '사다리 작업 시 \'2인 1조\' 원칙에서 보조자의 주된 역할은?',
                options: ['작업자 대신 사진 촬영', '공구함 정리', '주변 청소', '사다리 하단 고정 및 주변 통제', '휴식 시간 체크'],
                correctAnswer: 3,
                explanation: '2인 1조 원칙에서 보조자는 사다리 하단을 고정하고 주변을 통제하여 작업자의 안전을 확보합니다.'
            },
            {
                id: 'q1_002',
                question: '사다리 설치 시 지면의 조건으로 가장 적절한 것은?',
                options: ['견고하고 수평인 평탄한 지면', '부드러운 모래 위', '약간의 경사가 있는 콘크리트', '물기가 있는 타일', '자재가 쌓여 있는 임시 공간'],
                correctAnswer: 0,
                explanation: '사다리는 견고하고 수평인 평탄한 지면에 설치해야 전도 위험을 방지할 수 있습니다.'
            },
            {
                id: 'q1_003',
                question: '이동식 사다리를 사용할 수 있는 \'최대 높이\'에 대한 설명으로 옳은 것은?',
                options: ['높이 제한 없음', '10m 이상 고소 작업용', '보통 2m 미만의 경작업용으로 권장', '반드시 5m 이상에서만 사용', '천장 크레인 정비용'],
                correctAnswer: 2,
                explanation: '이동식 사다리는 보통 2m 미만의 경작업용으로 권장되며, 고소작업에는 적합하지 않습니다.'
            },
            {
                id: 'q1_004',
                question: '사다리에서 작업 중 추락을 방지하기 위한 신체 접촉 원칙은?',
                options: ['1점 지지(한 발)', '2점 지지(두 손)', '3점 지지(두 발과 한 손 또는 두 손과 한 발)', '무릎 지지', '지지 없이 자유롭게 작업'],
                correctAnswer: 2,
                explanation: '사다리를 오르내릴 때는 항상 3점 지지(두 발과 한 손 또는 두 손과 한 발)를 유지해야 합니다.'
            },
            {
                id: 'q1_005',
                question: '사다리 전도 방지를 위해 하단에 설치하는 장치의 명칭은?',
                options: ['리미트 스위치', '아웃트리거(전도방지대)', '세이프티 가드', '죔줄', '스토퍼'],
                correctAnswer: 1,
                explanation: '아웃트리거(전도방지대)는 사다리 하단에 설치하여 전도를 방지하는 안전장치입니다.'
            }
        ]
    },
    {
        id: 'edu_002',
        category: EDUCATION_CATEGORY.FALL_PREVENTION,
        title: '고소작업대 안전 작업',
        description: '고소작업대 사용 전 점검사항과 안전한 작업 방법을 학습합니다.',
        videoUrl: '/videos/safety/aerial_work_platform.mp4',
        youtubeVideoId: 'n_uUre9nWQE',
        thumbnailUrl: '/images/education/aerial_thumbnail.png',
        duration: 600,
        requiredWatchTime: 540,
        legalHours: 0.17,
        requiredScore: 80,
        points: 50,
        exp: 20,
        weekNumber: 1,
        dayOfWeek: 2,
        quiz: [
            {
                id: 'q2_001',
                question: '고소작업대 탑승 전 가장 먼저 확인해야 할 장비 상태는?',
                options: ['타이어의 색상', '도색 상태', '제조사 로고', '과부하 방지 장치 및 비상정지 스위치', '작업대 내부의 먼지'],
                correctAnswer: 3,
                explanation: '고소작업대 탑승 전 과부하 방지 장치 및 비상정지 스위치의 정상 작동 여부를 가장 먼저 확인해야 합니다.'
            },
            {
                id: 'q2_002',
                question: '고소작업대 위에서 작업자가 안전을 위해 반드시 체결해야 하는 곳은?',
                options: ['건물 외벽', '사다리', '옆에 있는 동료의 벨트', '작업대 내 전용 안전대 체결 고리', '천장 조명 기구'],
                correctAnswer: 3,
                explanation: '고소작업대에는 전용 안전대 체결 고리가 있으며, 반드시 이곳에 안전대를 체결해야 합니다.'
            },
            {
                id: 'q2_003',
                question: '고소작업대 이동(주행) 시 금지 사항인 것은?',
                options: ['유도원 배치', '저속 주행', '작업대를 올린 상태로 이동', '안전모 착용', '노면 확인'],
                correctAnswer: 2,
                explanation: '고소작업대는 반드시 작업대를 완전히 내린 후 이동해야 하며, 올린 상태로 이동하면 전도 위험이 있습니다.'
            },
            {
                id: 'q2_004',
                question: '고소작업대 이용 시 \'상부 압착\' 사고를 예방하기 위한 장치는?',
                options: ['풋 스위치', '과상승 방지 장치(방호울)', '안전 난간', '경광등', '경보음'],
                correctAnswer: 1,
                explanation: '과상승 방지 장치(방호울)는 작업대가 과도하게 올라가 상부 구조물에 압착되는 사고를 예방합니다.'
            },
            {
                id: 'q2_005',
                question: '고소작업대 난간에 대한 올바른 관리 방법은?',
                options: ['자재 반입을 위해 한쪽을 떼어낸다', '높이를 낮게 개조한다', '발판으로 사용한다', '임의 해제 금지 및 상시 고정 상태 유지', '장식물을 많이 매단다'],
                correctAnswer: 3,
                explanation: '고소작업대 난간은 임의로 해제하지 않고 항상 고정 상태를 유지해야 추락을 예방할 수 있습니다.'
            }
        ]
    },
    {
        id: 'edu_003',
        category: EDUCATION_CATEGORY.FALL_PREVENTION,
        title: '개구부 및 단차 추락 예방',
        description: '바닥 개구부와 단차에서의 추락 위험과 예방 대책을 학습합니다.',
        videoUrl: '/videos/safety/opening_fall_prevention.mp4',
        youtubeVideoId: 'EwfcoDngbSI',
        thumbnailUrl: '/images/education/opening_thumbnail.png',
        duration: 480, // 8분
        requiredWatchTime: 432,
        legalHours: 0.13,
        requiredScore: 80,
        points: 40,
        exp: 15,
        weekNumber: 1,
        dayOfWeek: 3,
        quiz: [
            {
                id: 'q3_001',
                question: '개구부 덮개에 반드시 표시해야 할 내용은?',
                options: ['\'추락 주의\' 문구 및 개구부 표시', '작업자 이름', '오늘 날짜', '회사 로고', '하중 견딤 수치(kg)만 표시'],
                correctAnswer: 0,
                explanation: '개구부 덮개에는 \'추락 주의\' 문구 및 개구부 표시를 반드시 해야 합니다.'
            },
            {
                id: 'q3_002',
                question: '개구부 주변에 설치하는 방호 시설로 부적절한 것은?',
                options: ['안전 난간', '울타리', '수평 보호망', '고정식 덮개', '투명 비닐막'],
                correctAnswer: 4,
                explanation: '투명 비닐막은 강도가 없어 추락 방지 방호 시설로 적합하지 않습니다.'
            },
            {
                id: 'q3_003',
                question: '개구부 덮개의 재질 및 고정 상태 기준은?',
                options: ['가벼운 종이 박스', '뒤집히기 쉬운 합판', '작업자 무게를 견딜 수 있는 강도와 고정', '끈으로 느슨하게 연결', '색깔만 밝으면 됨'],
                correctAnswer: 2,
                explanation: '개구부 덮개는 작업자 무게를 충분히 견딜 수 있는 강도가 있으며 견고하게 고정되어야 합니다.'
            },
            {
                id: 'q3_004',
                question: '단차(높낮이 차이)가 있는 곳에서 안전한 통행 방법은?',
                options: ['점프해서 이동', '안전 통로 및 가설 계단 이용', '난간 위로 걷기', '단차 끝에 서서 작업', '어두운 상태로 이동'],
                correctAnswer: 1,
                explanation: '단차가 있는 곳에서는 안전 통로 및 가설 계단을 이용해야 합니다.'
            },
            {
                id: 'q3_005',
                question: '현장 순찰 중 고정되지 않은 개구부 덮개를 발견했을 때 조치는?',
                options: ['그냥 지나간다', '나중에 고친다', '다른 사람에게 시킨다', '즉시 고정하고 관리자에게 보고한다', '사진만 찍고 퇴근한다'],
                correctAnswer: 3,
                explanation: '고정되지 않은 개구부 덮개를 발견하면 즉시 고정하고 관리자에게 보고해야 합니다.'
            }
        ]
    },
    // Week 2 - 끼임/부딪힘 예방
    {
        id: 'edu_004',
        category: EDUCATION_CATEGORY.PINCH_PREVENTION,
        title: '기계 작업 끼임 예방',
        description: '기계 작업 시 끼임 사고 예방을 위한 안전 수칙을 학습합니다.',
        videoUrl: '/videos/safety/pinch_prevention.mp4',
        youtubeVideoId: 'sOxSFMUZ8Uk',
        thumbnailUrl: '/images/education/pinch_thumbnail.png',
        duration: 600,
        requiredWatchTime: 540,
        legalHours: 0.17,
        requiredScore: 80,
        points: 50,
        exp: 20,
        weekNumber: 2,
        dayOfWeek: 1,
        quiz: [
            {
                id: 'q4_001',
                question: '기계 청소 및 정비 시 가장 먼저 해야 할 일은?',
                options: ['기름칠', '전원 차단 및 운전 정지', '장갑 착용', '동료와 대화', '회전 속도 올리기'],
                correctAnswer: 1,
                explanation: '기계 청소 및 정비 전에는 반드시 전원을 차단하고 운전을 정지해야 합니다.'
            },
            {
                id: 'q4_002',
                question: '정비 중 다른 사람이 기계를 켜지 못하도록 하는 시스템은?',
                options: ['LOTO (Lock-Out, Tag-Out)', 'GPS', 'RFID', 'NFC', 'KTX'],
                correctAnswer: 0,
                explanation: 'LOTO(Lock-Out, Tag-Out)는 정비 중 기계 가동을 방지하기 위한 잠금/표지 시스템입니다.'
            },
            {
                id: 'q4_003',
                question: '끼임 사고가 가장 많이 발생하는 기계 부위는?',
                options: ['기계 바닥', '손잡이', '회전체 접동부 및 말림점', '조작 패널', '외함 케이스'],
                correctAnswer: 2,
                explanation: '회전체 접동부 및 말림점은 끼임 사고가 가장 빈번하게 발생하는 위험 부위입니다.'
            },
            {
                id: 'q4_004',
                question: '회전 기계 작업 시 복장 수칙으로 옳은 것은?',
                options: ['소매가 넓은 옷', '목걸이 착용', '긴 머리를 풀고 작업', '밀착된 작업복과 머리카락 묶기', '면장갑 착용(말림 위험 시)'],
                correctAnswer: 3,
                explanation: '회전 기계 작업 시에는 밀착된 작업복을 입고 머리카락을 묶어야 말림 사고를 예방할 수 있습니다.'
            },
            {
                id: 'q4_005',
                question: '기계의 방호 덮개를 제거해야 하는 상황은?',
                options: ['작업이 불편할 때', '내부가 안 보일 때', '어떠한 경우에도 임의 제거 금지', '기계가 느리게 돌 때', '날씨가 더울 때'],
                correctAnswer: 2,
                explanation: '기계의 방호 덮개는 어떠한 경우에도 임의로 제거해서는 안 됩니다.'
            }
        ]
    },
    {
        id: 'edu_005',
        category: EDUCATION_CATEGORY.COLLISION_PREVENTION,
        title: '지게차 충돌 예방',
        description: '지게차와 작업자 간 충돌 사고 예방 방법을 학습합니다.',
        videoUrl: '/videos/safety/forklift_safety.mp4',
        youtubeVideoId: 'adQHFaQ0S8g',
        thumbnailUrl: '/images/education/forklift_thumbnail.png',
        duration: 600,
        requiredWatchTime: 540,
        legalHours: 0.17,
        requiredScore: 80,
        points: 50,
        exp: 20,
        weekNumber: 2,
        dayOfWeek: 2,
        quiz: [
            {
                id: 'q5_001',
                question: '지게차 주행 시 포크(날)의 올바른 높이는?',
                options: ['바닥에서 10~30cm 이격', '지면 밀착 주행', '사람 눈높이', '최대 높이', '1m 유지'],
                correctAnswer: 0,
                explanation: '지게차 주행 시 포크는 바닥에서 10~30cm 이격하여 유지해야 합니다.'
            },
            {
                id: 'q5_002',
                question: '지게차로 자재를 높게 쌓아 전방 시야가 가려질 때 주행 방법은?',
                options: ['고개를 옆으로 빼고 전진', '유도원의 신호에 따라 후진 주행', '속도를 높여 신속 이동', '경적을 계속 울리며 전진', '짐 위로 올라가서 확인'],
                correctAnswer: 1,
                explanation: '전방 시야가 가려질 때는 유도원의 신호에 따라 후진 주행해야 합니다.'
            },
            {
                id: 'q5_003',
                question: '지게차 운전자가 자리를 비울 때 조치 사항이 아닌 것은?',
                options: ['포크를 바닥에 내린다', '주차 브레이크를 건다', '시동을 끈다', '열쇠를 지참한다', '포크를 높이 올린다'],
                correctAnswer: 4,
                explanation: '지게차 운전자가 자리를 비울 때 포크를 높이 올리면 안 되며, 바닥에 내려야 합니다.'
            },
            {
                id: 'q5_004',
                question: '지게차 작업 구역 내 일반 작업자의 출입 관리 방법은?',
                options: ['자유롭게 통행', '뛰어다니기', '안전 차단스탠드 설치 및 출입 통제', '지게차 뒤를 바짝 따라가기', '운전자와 수다 떨기'],
                correctAnswer: 2,
                explanation: '지게차 작업 구역에는 안전 차단스탠드를 설치하고 일반 작업자의 출입을 통제해야 합니다.'
            },
            {
                id: 'q5_005',
                question: '지게차의 안전 장치 중 후진 시 주변에 알리는 장치는?',
                options: ['후진 알람(경보음) 및 경광등', '와이퍼', '백미러', '시트벨트', '헤드라이트'],
                correctAnswer: 0,
                explanation: '후진 알람(경보음) 및 경광등은 지게차 후진 시 주변 작업자에게 알리는 안전 장치입니다.'
            }
        ]
    },
    // Week 3 - 개인보호구
    {
        id: 'edu_006',
        category: EDUCATION_CATEGORY.PPE,
        title: '안전모 올바른 착용법',
        description: '안전모의 종류와 올바른 착용 방법을 학습합니다.',
        videoUrl: '/videos/safety/helmet_usage.mp4',
        youtubeVideoId: '3gQpoOe9RWs',
        thumbnailUrl: '/images/education/helmet_thumbnail.png',
        duration: 480,
        requiredWatchTime: 432,
        legalHours: 0.13,
        requiredScore: 80,
        points: 40,
        exp: 15,
        weekNumber: 3,
        dayOfWeek: 1,
        quiz: [
            {
                id: 'q6_001',
                question: '안전모의 충격 흡수 기능을 담당하는 내부 부품 명칭은?',
                options: ['껍데기', '착장체(해먹)', '턱끈', '모체', '챙'],
                correctAnswer: 1,
                explanation: '착장체(해먹)는 안전모 내부에서 충격을 흡수하여 머리를 보호하는 핵심 부품입니다.'
            },
            {
                id: 'q6_002',
                question: '안전모 착용 시 턱끈의 적절한 조임 상태는?',
                options: ['손가락 1~2개 들어갈 정도로 밀착', '아주 느슨하게', '목이 조일 정도로 꽉', '턱끈을 하지 않음', '귀 뒤로 넘김'],
                correctAnswer: 0,
                explanation: '안전모 턱끈은 손가락 1~2개가 들어갈 정도로 밀착시켜야 안전모가 벗겨지지 않습니다.'
            },
            {
                id: 'q6_003',
                question: '안전모의 교체 주기에 대한 설명으로 옳은 것은?',
                options: ['평생 사용 가능', '색이 변할 때까지', '강한 충격을 받았거나 외관에 균열 발생 시 즉시', '10년에 한 번', '남이 버린 것 사용'],
                correctAnswer: 2,
                explanation: '안전모는 강한 충격을 받았거나 외관에 균열이 발생하면 즉시 교체해야 합니다.'
            },
            {
                id: 'q6_004',
                question: '안전모 안에 일반 모자(캡 모자)를 쓰고 안전모를 착용하면 안 되는 이유는?',
                options: ['패션에 안 좋아서', '머리가 커 보여서', '안전모가 머리에 밀착되지 않아 벗겨지기 쉬움', '땀이 많이 나서', '모자가 더러워져서'],
                correctAnswer: 2,
                explanation: '일반 모자를 안에 쓰면 안전모가 머리에 밀착되지 않아 벗겨지기 쉽고 보호 기능이 저하됩니다.'
            },
            {
                id: 'q6_005',
                question: '비래(물체가 날아옴) 위험이 있는 현장에서 필수적인 안전모 종류는?',
                options: ['AB종 또는 ABE종', '종이 안전모', '등산용 헬멧', '자전거용 헬멧', '패션용 캡'],
                correctAnswer: 0,
                explanation: 'AB종 또는 ABE종 안전모는 추락 및 비래 위험이 있는 현장에서 착용해야 합니다.'
            }
        ]
    },
    {
        id: 'edu_007',
        category: EDUCATION_CATEGORY.PPE,
        title: '안전대 착용 및 점검',
        description: '안전대의 올바른 착용법과 작업 전 점검 방법을 학습합니다.',
        videoUrl: '/videos/safety/safety_harness.mp4',
        youtubeVideoId: 'wA_H9Hb_4n4',
        thumbnailUrl: '/images/education/harness_thumbnail.png',
        duration: 600,
        requiredWatchTime: 540,
        legalHours: 0.17,
        requiredScore: 80,
        points: 50,
        exp: 20,
        weekNumber: 3,
        dayOfWeek: 2,
        quiz: [
            {
                id: 'q7_001',
                question: '안전대(안전벨트)의 \'D링\'이 위치해야 하는 신체 부위는?',
                options: ['가슴 앞', '등 뒤(양 어깨뼈 사이)', '허리 옆', '배꼽 위', '허벅지'],
                correctAnswer: 1,
                explanation: 'D링은 등 뒤 양 어깨뼈 사이에 위치해야 추락 시 올바른 자세를 유지할 수 있습니다.'
            },
            {
                id: 'q7_002',
                question: '고소작업 시 안전대 고리를 거는 \'생명줄\'의 설치 기준은?',
                options: ['작업자의 머리 위쪽 높은 곳', '발바닥 높이', '무릎 높이', '허리보다 낮은 곳', '아무 파이프나 상관없음'],
                correctAnswer: 0,
                explanation: '생명줄은 작업자의 머리 위쪽 높은 곳에 설치해야 추락 거리를 최소화할 수 있습니다.'
            },
            {
                id: 'q7_003',
                question: '안전대 죔줄(로프)의 점검 항목이 아닌 것은?',
                options: ['소선(가닥)의 끊어짐', '벨트의 마모', '카라비너(고리)의 작동', '충격 흡수 장치의 터짐 여부', '벨트의 브랜드명'],
                correctAnswer: 4,
                explanation: '안전대 점검 시 소선, 마모, 카라비너, 충격 흡수 장치 등 기능적 상태를 확인해야 하며, 브랜드명은 점검 항목이 아닙니다.'
            },
            {
                id: 'q7_004',
                question: '추락 시 신체에 가해지는 충격을 분산해주는 가장 안전한 형태의 안전대는?',
                options: ['허리식 안전대', '어깨식 안전대', '그네식(전신식) 안전대', '끈 없는 안전대', '가죽 벨트'],
                correctAnswer: 2,
                explanation: '그네식(전신식) 안전대는 추락 시 충격을 신체 전체에 분산시켜 부상을 최소화합니다.'
            },
            {
                id: 'q7_005',
                question: '안전대 고리를 체결할 때 주의사항은?',
                options: ['고리가 잠기지 않아도 됨', '완전히 잠겼는지 확인(Lock 확인)', '고리를 두 개 겹쳐 걸기', '녹슨 곳에 걸기', '이동 시에는 고리를 풀고 뛰기'],
                correctAnswer: 1,
                explanation: '안전대 고리를 체결할 때는 완전히 잠겼는지(Lock) 반드시 확인해야 합니다.'
            }
        ]
    },
    // Week 4 - 화재/전기 안전
    {
        id: 'edu_008',
        category: EDUCATION_CATEGORY.FIRE_SAFETY,
        title: '소화기 사용법',
        description: '소화기의 종류와 올바른 사용 방법을 학습합니다.',
        videoUrl: '/videos/safety/fire_extinguisher.mp4',
        youtubeVideoId: 'BgJ2p9zdXJk',
        thumbnailUrl: '/images/education/fire_thumbnail.png',
        duration: 480,
        requiredWatchTime: 432,
        legalHours: 0.13,
        requiredScore: 80,
        points: 40,
        exp: 15,
        weekNumber: 4,
        dayOfWeek: 1,
        quiz: [
            {
                id: 'q8_001',
                question: '소화기 안전핀을 뽑을 때 올바른 방법은?',
                options: ['몸체를 잡고 핀을 힘껏 뽑는다', '손잡이를 꽉 쥐고 뽑는다', '가위로 자른다', '망치로 때린다', '뽑지 않고 사용한다'],
                correctAnswer: 0,
                explanation: '소화기 안전핀을 뽑을 때는 몸체를 잡고 핀을 힘껏 뽑아야 합니다.'
            },
            {
                id: 'q8_002',
                question: '일반 화재(A급), 유류 화재(B급), 전기 화재(C급) 모두 사용 가능한 소화기는?',
                options: ['물 소화기', '모래', 'ABC 분말 소화기', '투척용 소화기', '거품 소화기'],
                correctAnswer: 2,
                explanation: 'ABC 분말 소화기는 일반, 유류, 전기 화재 모두에 사용할 수 있는 범용 소화기입니다.'
            },
            {
                id: 'q8_003',
                question: '소화기 방사 시 노즐을 향해야 하는 곳은?',
                options: ['연기 위쪽', '불이 일어나는 바닥 부분(화원)', '옆 사람', '천장', '창문 밖'],
                correctAnswer: 1,
                explanation: '소화기 방사 시 노즐은 불이 일어나는 바닥 부분(화원)을 향해야 효과적으로 진화할 수 있습니다.'
            },
            {
                id: 'q8_004',
                question: '소화기 점검 시 압력계의 바늘이 가리켜야 하는 색상은?',
                options: ['녹색', '적색', '황색', '검정색', '흰색'],
                correctAnswer: 0,
                explanation: '소화기 압력계의 바늘이 녹색 범위를 가리켜야 정상 압력 상태입니다.'
            },
            {
                id: 'q8_005',
                question: '소화기가 비치되어야 하는 장소로 적절하지 않은 곳은?',
                options: ['출입구 근처', '눈에 잘 띄는 곳', '화기 작업 장소', '복도', '깊숙한 창고 구석 자재 밑'],
                correctAnswer: 4,
                explanation: '소화기는 눈에 잘 띄고 접근이 용이한 곳에 비치해야 하며, 깊숙한 창고 구석 자재 밑은 부적절합니다.'
            }
        ]
    },
    {
        id: 'edu_009',
        category: EDUCATION_CATEGORY.ELECTRICAL,
        title: '전기 안전 기본',
        description: '전기 작업 시 안전 수칙과 감전 예방 방법을 학습합니다.',
        videoUrl: '/videos/safety/electrical_safety.mp4',
        youtubeVideoId: '0UjrtwwaCl4',
        thumbnailUrl: '/images/education/electrical_thumbnail.png',
        duration: 600,
        requiredWatchTime: 540,
        legalHours: 0.17,
        requiredScore: 80,
        points: 50,
        exp: 20,
        weekNumber: 4,
        dayOfWeek: 2,
        quiz: [
            {
                id: 'q9_001',
                question: '전기 기계의 누전으로 인한 감전을 방지하기 위해 땅과 연결하는 것은?',
                options: ['안테나', '접지(Grounding)', '절연 테이프', '연장선', '퓨즈'],
                correctAnswer: 1,
                explanation: '접지(Grounding)는 누전 시 전류를 땅으로 흘려보내 감전을 방지하는 안전 장치입니다.'
            },
            {
                id: 'q9_002',
                question: '젖은 손으로 전기 기기를 만지면 위험한 이유는?',
                options: ['물에 의해 인체의 저항이 낮아져 감전 위험이 급증함', '손이 미끄러워서', '기계가 고장 나서', '옷이 젖어서', '전기가 아까워서'],
                correctAnswer: 0,
                explanation: '물에 의해 인체의 전기 저항이 크게 낮아지면 감전 위험이 급증합니다.'
            },
            {
                id: 'q9_003',
                question: '전기 화재가 발생했을 때 절대 사용하면 안 되는 소화 약제는?',
                options: ['분말', '이산화탄소', '할론', '물', '모래'],
                correctAnswer: 3,
                explanation: '전기 화재 시 물을 사용하면 감전 위험이 있으므로 절대 사용하면 안 됩니다.'
            },
            {
                id: 'q9_004',
                question: '차단기(분전함) 앞에 자재를 쌓아두면 안 되는 이유는?',
                options: ['무거워서', '보기 싫어서', '비상시 신속한 차단이 불가능함', '자재에 전기가 옮겨붙어서', '법적으로 상관없음'],
                correctAnswer: 2,
                explanation: '차단기 앞에 자재를 쌓으면 비상 시 신속하게 전원을 차단할 수 없어 위험합니다.'
            },
            {
                id: 'q9_005',
                question: '전선 피복이 손상된 것을 발견했을 때 조치는?',
                options: ['손으로 만져본다', '사용을 즉시 중단하고 교체/수리 요청', '물을 뿌린다', '비닐봉지로 감싼다', '모르는 척한다'],
                correctAnswer: 1,
                explanation: '전선 피복이 손상되면 즉시 사용을 중단하고 교체 또는 수리를 요청해야 합니다.'
            }
        ]
    },
    // Week 5 - 밀폐공간/화학물질
    {
        id: 'edu_010',
        category: EDUCATION_CATEGORY.CONFINED_SPACE,
        title: '밀폐공간 작업 안전',
        description: '밀폐공간 작업 시 산소결핍 예방과 안전 절차를 학습합니다.',
        videoUrl: '/videos/safety/confined_space.mp4',
        youtubeVideoId: 'fBiwQvg22tk',
        thumbnailUrl: '/images/education/confined_thumbnail.png',
        duration: 600,
        requiredWatchTime: 540,
        legalHours: 0.17,
        requiredScore: 80,
        points: 50,
        exp: 20,
        weekNumber: 5,
        dayOfWeek: 1,
        quiz: [
            {
                id: 'q10_001',
                question: '밀폐공간 산소 결핍 기준 산소 농도는 몇 % 미만인가?',
                options: ['18% 미만', '21% 미만', '25% 미만', '30% 미만', '10% 미만'],
                correctAnswer: 0,
                explanation: '산소 농도 18% 미만은 산소 결핍 상태로 분류되며, 밀폐공간 작업 전 반드시 확인해야 합니다.'
            },
            {
                id: 'q10_002',
                question: '밀폐공간 작업 중 내부 작업자와 외부 감시인 간의 올바른 소통 방법은?',
                options: ['소리 지르기', '쪽지 주고받기', '무전기 또는 신호 로프 활용', '텔레파시', '작업 끝나고 대화'],
                correctAnswer: 2,
                explanation: '밀폐공간에서는 무전기 또는 신호 로프를 활용하여 내부 작업자와 외부 감시인이 소통해야 합니다.'
            },
            {
                id: 'q10_003',
                question: '밀폐공간 내 유해가스가 발견되었을 때 가장 먼저 해야 할 조치는?',
                options: ['숨 참고 일하기', '강제 환기 장치 가동 및 대피', '마스크만 쓰고 들어가기', '향수 뿌리기', '선풍기 틀기'],
                correctAnswer: 1,
                explanation: '유해가스 발견 시 강제 환기 장치를 가동하고 즉시 대피해야 합니다.'
            },
            {
                id: 'q10_004',
                question: '밀폐공간 작업 시 입구에 배치되어야 하는 전담 인력은?',
                options: ['감시인', '요리사', '안내원', '홍보 담당자', '회계사'],
                correctAnswer: 0,
                explanation: '밀폐공간 작업 시 입구에는 전담 감시인을 반드시 배치해야 합니다.'
            },
            {
                id: 'q10_005',
                question: '밀폐공간 구조 상황 발생 시 구조자가 취해야 할 행동은?',
                options: ['장비 없이 즉시 뛰어든다', '숨을 크게 들이마시고 들어간다', '밖에서 구경한다', '송기마스크 등 보호구 착용 후 구조', '119에 신고만 하고 퇴근한다'],
                correctAnswer: 3,
                explanation: '밀폐공간 구조 시에는 반드시 송기마스크 등 적절한 보호구를 착용한 후 구조해야 합니다.'
            }
        ]
    },
    // ─── [New] 작업중지권 교육 모듈 (추가 1~3) ───
    {
        id: 'edu_ws_001',
        category: EDUCATION_CATEGORY.WORK_STOP_RIGHT,
        title: '작업중지권이란 무엇인가',
        description: '산업안전보건법 제52조에 근거한 작업중지권의 개념과 2025년 확대 기준을 학습합니다.',
        videoUrl: '/videos/safety/work_stop_right_intro.mp4',
        youtubeVideoId: ['GYg7en3Pf88', '7pR4y1SBMb4'],  // 두 영상 연속 재생 (10분 충족)
        thumbnailUrl: '/images/education/work_stop_thumbnail.png',
        duration: 600,
        requiredWatchTime: 540,
        legalHours: 0.17,
        requiredScore: 80,
        points: 50,
        exp: 20,
        weekNumber: 6,
        dayOfWeek: 3,
        quiz: [
            {
                id: 'qws_001',
                question: '작업중지권은 어떤 법률에 근거한 권리인가요?',
                options: ['근로기준법 제30조', '산업안전보건법 제52조', '건설산업기본법 제10조', '소방기본법 제25조', '환경보호법 제15조'],
                correctAnswer: 1,
                explanation: '작업중지권은 산업안전보건법 제52조에 근거한 근로자의 법적 권리입니다.'
            },
            {
                id: 'qws_002',
                question: '2025년 확대된 작업중지권 행사 기준은?',
                options: ['사고가 발생한 후', '급박한 위험이 있을 때만', '산업재해 발생 우려 시', '관리자 허가를 받은 후', '안전관리자가 판단한 경우만'],
                correctAnswer: 2,
                explanation: '2025년 노동안전 종합대책에서 작업중지권 행사 기준이 "급박한 위험"에서 "발생 우려" 시로 완화되었습니다.'
            },
            {
                id: 'qws_003',
                question: '2025년 정책에서 작업중지권 행사 주체로 새롭게 추가된 것은?',
                options: ['안전관리자', '노동조합', '고용노동부 장관', '원청 사업주', '현장 소장'],
                correctAnswer: 1,
                explanation: '2025년 확대 정책에서 근로자 개인 외에 노동조합도 작업중지권 행사 주체로 추가되었습니다.'
            },
            {
                id: 'qws_004',
                question: '작업중지권을 행사할 수 있는 상황으로 적절한 것은?',
                options: ['작업이 힘들어서 쉬고 싶을 때', '비계 연결부 볼트가 풀려 추락 위험이 있을 때', '점심시간이 되었을 때', '동료와 의견 충돌이 있을 때', '작업 도구가 부족할 때'],
                correctAnswer: 1,
                explanation: '비계 연결부 볼트 풀림은 추락 위험이 우려되는 상황으로 작업중지권 행사가 가능합니다.'
            },
            {
                id: 'qws_005',
                question: '영상에서 소개된 삼성물산의 작업중지권 도입 사례에서, 2023~2024년 2년 연속으로 달성한 성과는?',
                options: ['작업중지 건수 0건 달성', '사망사고 0명 기록', '영업이익 10조 원 돌파', '전 현장 무재해 인증 획득', '작업중지권 행사 비율 100% 달성'],
                correctAnswer: 1,
                explanation: '삼성물산은 2021년 작업중지권을 전면 도입한 뒤, 2023년과 2024년 2년 연속 사망사고 0명을 기록했습니다. 또한 영업이익도 약 4배 증가하여 안전이 곧 경쟁력임을 보여주었습니다.'
            }
        ]
    },
    {
        id: 'edu_ws_002',
        category: EDUCATION_CATEGORY.WORK_STOP_RIGHT,
        title: '작업중지권 행사 5단계',
        description: '위험 인지부터 기록까지, 작업중지권 행사의 구체적인 5단계 절차를 학습합니다.',
        videoUrl: '/videos/safety/work_stop_5steps.mp4',
        youtubeVideoId: 'FfFr3GqRGNE',
        thumbnailUrl: '/images/education/work_stop_steps_thumbnail.png',
        duration: 600,
        requiredWatchTime: 540,
        legalHours: 0.17,
        requiredScore: 80,
        points: 50,
        exp: 20,
        weekNumber: 7,
        dayOfWeek: 3,
        quiz: [
            {
                id: 'qws2_001',
                question: '작업중지권 행사 5단계의 올바른 순서는?',
                options: ['신고→대피→중지→기록→인지', '인지→중지→대피→신고→기록', '중지→인지→신고→대피→기록', '대피→중지→인지→기록→신고', '기록→신고→인지→중지→대피'],
                correctAnswer: 1,
                explanation: '올바른 순서는 ① 위험 인지 → ② 작업 중지 → ③ 대피 → ④ 신고 → ⑤ 기록입니다.'
            },
            {
                id: 'qws2_002',
                question: '고소작업 중 비계 연결부 볼트가 풀려 있고 관리감독자가 없습니다. 올바른 행동은?',
                options: ['볼트를 직접 조이고 작업 계속', '작업을 중지하고 대피 후 신고', '동료에게 알리고 작업 계속', '퇴근 시 관리감독자에게 보고', '다른 구역으로 이동해서 작업'],
                correctAnswer: 1,
                explanation: '추락 위험이 우려되는 상황에서는 작업을 즉시 중지하고 대피한 후 신고해야 합니다.'
            },
            {
                id: 'qws2_003',
                question: '밀폐공간 작업 전 가스 측정기 경고등이 깜빡입니다. 관리감독자가 "괜찮으니 들어가라"고 합니다. 올바른 행동은?',
                options: ['관리감독자 지시를 따른다', '작업중지권을 행사하고 대피한다', '잠시 기다렸다 들어간다', '마스크를 쓰고 들어간다', '동료에게 먼저 들어가라고 한다'],
                correctAnswer: 1,
                explanation: '가스 측정기 경고는 위험 신호이므로 관리감독자의 지시와 무관하게 작업중지권을 행사해야 합니다.'
            },
            {
                id: 'qws2_004',
                question: '작업중지 후 반드시 기록해야 할 항목이 아닌 것은?',
                options: ['위험 유형', '발생 시간', '발생 위치', '당일 점심 메뉴', '조치 사항'],
                correctAnswer: 3,
                explanation: '작업중지 기록에는 위험 유형, 발생 시간, 위치, 조치 사항 등을 기록해야 합니다.'
            },
            {
                id: 'qws2_005',
                question: '작업중지 후 작업 재개의 조건은?',
                options: ['30분이 경과하면 자동 재개', '관리감독자/안전관리자의 위험 해결 확인 후', '작업자 본인 판단으로 재개', '다른 팀이 작업 시작 시', '원청 사업주의 전화 승인'],
                correctAnswer: 1,
                explanation: '작업 재개는 관리감독자 또는 안전관리자가 위험을 해결하고 안전을 확인한 후에 가능합니다.'
            }
        ]
    },
    {
        id: 'edu_ws_003',
        category: EDUCATION_CATEGORY.WORK_STOP_RIGHT,
        title: '보복 금지와 나의 보호',
        description: '작업중지권 행사 후 보복 금지 규정과 근로자 보호 방법을 학습합니다.',
        videoUrl: '/videos/safety/work_stop_protection.mp4',
        youtubeVideoId: 'FfFr3GqRGNE',
        thumbnailUrl: '/images/education/work_stop_protect_thumbnail.png',
        duration: 600,
        requiredWatchTime: 540,
        legalHours: 0.17,
        requiredScore: 80,
        points: 50,
        exp: 20,
        weekNumber: 8,
        dayOfWeek: 3,
        quiz: [
            {
                id: 'qws3_001',
                question: '작업중지권을 행사한 후 관리감독자가 "다음부터 이러면 불이익이 있을 것"이라고 합니다. 이는?',
                options: ['정당한 관리 행위', '불법 보복으로 형사처벌 대상', '구두 경고일 뿐 문제없음', '작업자가 참아야 할 사항', '노동조합에만 해당'],
                correctAnswer: 1,
                explanation: '2025년 정책에서 작업중지권 행사에 대한 보복은 형사처벌 대상으로 규정되었습니다.'
            },
            {
                id: 'qws3_002',
                question: '작업중지권 행사 후 보호 기간은?',
                options: ['7일', '14일', '30일', '90일', '보호 기간 없음'],
                correctAnswer: 2,
                explanation: '작업중지권 행사 후 30일간 보호 기간이 적용되며, 이 기간 내 보복 행위가 모니터링됩니다.'
            },
            {
                id: 'qws3_003',
                question: '보복으로 인정될 수 있는 행위가 아닌 것은?',
                options: ['업무 배제', '부당 전보', '임금 삭감', '정상적인 안전 교육 배정', '비공식적 냉대'],
                correctAnswer: 3,
                explanation: '정상적인 안전 교육 배정은 보복이 아닌 정당한 관리 행위입니다.'
            },
            {
                id: 'qws3_004',
                question: '소규모 사업장에서 익명 신고가 중요한 이유는?',
                options: ['신고 절차가 간편해서', '신고자 특정이 쉬워 보복 위험이 높아서', '관리자가 귀찮아해서', '법적으로 실명만 가능해서', '포인트를 더 받을 수 있어서'],
                correctAnswer: 1,
                explanation: '소규모 사업장은 인원이 적어 신고자 특정이 용이하므로 익명 신고가 보복 방지에 중요합니다.'
            },
            {
                id: 'qws3_005',
                question: '보복을 당했을 때 가장 올바른 대응 방법은?',
                options: ['그냥 참고 넘어간다', '직접 관리자에게 항의한다', '앱 내 보복 신고 + 증거 보존 후 노동부 신고', '즉시 퇴사한다', '동료에게만 이야기한다'],
                correctAnswer: 2,
                explanation: '보복 발생 시 앱 내 보복 신고로 기록을 남기고 증거를 보존한 후 노동부에 신고하는 것이 올바른 대응입니다.'
            }
        ]
    }
];

/**
 * 오늘의 교육 콘텐츠 가져오기 (KST 기준)
 * 주차와 요일에 따라 순환하여 제공
 */
export const getTodayEducation = () => {
    if (!educationContents.length) {
        return null;
    }

    const partsFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = partsFormatter.formatToParts(new Date());
    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);
    const day = Number(parts.find((part) => part.type === 'day')?.value);

    if (!year || !month || !day) {
        return educationContents[0];
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const currentUtc = Date.UTC(year, month - 1, day);
    const startOfYearUtc = Date.UTC(year, 0, 1);
    const dayOfYear = Math.floor((currentUtc - startOfYearUtc) / msPerDay) + 1;

    // dayOfYear 1 => index 0, then rotate one content per day.
    const educationIndex = (dayOfYear - 1) % educationContents.length;
    return educationContents[educationIndex] || educationContents[0];
};

/**
 * 카테고리별 교육 목록 가져오기
 */
export const getEducationsByCategory = (category) => {
    return educationContents.filter(edu => edu.category === category);
};

/**
 * ID로 교육 콘텐츠 가져오기
 */
export const getEducationById = (id) => {
    return educationContents.find(edu => edu.id === id);
};

/**
 * 모든 교육 콘텐츠 가져오기
 */
export const getAllEducations = () => {
    return educationContents;
};

export default {
    EDUCATION_CATEGORY,
    CATEGORY_INFO,
    LEGAL_EDUCATION_REQUIREMENTS,
    educationContents,
    getTodayEducation,
    getEducationsByCategory,
    getEducationById,
    getAllEducations
};
