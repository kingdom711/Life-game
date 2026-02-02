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
    CHEMICAL: 'chemical'                     // 화학물질
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
                question: '사다리 작업 시 안전각도는 몇 도인가요?',
                options: ['45도', '60도', '75도', '90도'],
                correctAnswer: 2,
                explanation: '사다리는 벽면과 75도 각도(4:1 비율)로 설치해야 안전합니다.'
            },
            {
                id: 'q1_002',
                question: '사다리 상단은 작업면보다 얼마나 높게 설치해야 하나요?',
                options: ['30cm 이상', '60cm 이상', '90cm 이상', '120cm 이상'],
                correctAnswer: 1,
                explanation: '사다리 상단은 작업면보다 최소 60cm 이상 돌출되어야 안전하게 오르내릴 수 있습니다.'
            },
            {
                id: 'q1_003',
                question: '사다리 작업 시 반드시 착용해야 하는 보호구는?',
                options: ['안전모만', '안전화만', '안전모와 안전화', '안전모, 안전화, 안전대'],
                correctAnswer: 3,
                explanation: '사다리 작업 시 추락 위험이 있으므로 안전모, 안전화, 안전대를 모두 착용해야 합니다.'
            },
            {
                id: 'q1_004',
                question: '다음 중 사다리 작업 시 올바른 행동은?',
                options: [
                    '양손에 물건을 들고 오르내린다',
                    '3점 지지를 유지하며 오르내린다',
                    '빠르게 뛰어 올라간다',
                    '최상단 발판에 서서 작업한다'
                ],
                correctAnswer: 1,
                explanation: '사다리를 오르내릴 때는 항상 3점 지지(손 2개 + 발 1개 또는 손 1개 + 발 2개)를 유지해야 합니다.'
            },
            {
                id: 'q1_005',
                question: '사다리 설치가 불안정할 때 어떻게 해야 하나요?',
                options: [
                    '조심해서 사용한다',
                    '동료가 잡아준다',
                    '안전한 장소로 이동하여 재설치한다',
                    '빨리 작업을 끝낸다'
                ],
                correctAnswer: 2,
                explanation: '불안정한 사다리는 즉시 사용을 중지하고 안전한 장소에 재설치해야 합니다.'
            }
        ]
    },
    {
        id: 'edu_002',
        category: EDUCATION_CATEGORY.FALL_PREVENTION,
        title: '고소작업대 안전 작업',
        description: '고소작업대 사용 전 점검사항과 안전한 작업 방법을 학습합니다.',
        videoUrl: '/videos/safety/aerial_work_platform.mp4',
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
                question: '고소작업대 사용 전 반드시 확인해야 할 사항이 아닌 것은?',
                options: ['작업대 바닥 상태', '안전난간 설치 상태', '작업자의 생년월일', '작업대 하중 제한'],
                correctAnswer: 2,
                explanation: '고소작업대 사용 전 바닥 상태, 안전난간, 하중 제한 등을 확인해야 합니다.'
            },
            {
                id: 'q2_002',
                question: '고소작업대에서 작업 시 안전대는 어디에 체결해야 하나요?',
                options: ['작업대 바닥', '안전난간', '별도의 생명줄', '동료의 허리'],
                correctAnswer: 2,
                explanation: '안전대는 고소작업대와 별도의 견고한 구조물이나 생명줄에 체결해야 합니다.'
            },
            {
                id: 'q2_003',
                question: '고소작업대 이동 시 주의사항으로 올바른 것은?',
                options: [
                    '작업자가 탑승한 채로 이동한다',
                    '작업대를 완전히 내린 후 이동한다',
                    '빠른 속도로 이동한다',
                    '이동 중 작업을 계속한다'
                ],
                correctAnswer: 1,
                explanation: '고소작업대 이동 시에는 작업대를 완전히 내리고 작업자는 하차해야 합니다.'
            },
            {
                id: 'q2_004',
                question: '고소작업대 작업 가능 풍속 기준은?',
                options: ['초속 5m 이하', '초속 10m 이하', '초속 15m 이하', '풍속과 무관'],
                correctAnswer: 1,
                explanation: '풍속이 초속 10m를 초과하면 고소작업대 작업을 중지해야 합니다.'
            },
            {
                id: 'q2_005',
                question: '고소작업대에서 추락 시 피해를 최소화하기 위한 보호구는?',
                options: ['안전모만', '안전대만', '안전모와 안전대', '보호구 없이 작업 가능'],
                correctAnswer: 2,
                explanation: '고소작업대 작업 시 안전모와 안전대를 반드시 착용해야 합니다.'
            }
        ]
    },
    {
        id: 'edu_003',
        category: EDUCATION_CATEGORY.FALL_PREVENTION,
        title: '개구부 및 단차 추락 예방',
        description: '바닥 개구부와 단차에서의 추락 위험과 예방 대책을 학습합니다.',
        videoUrl: '/videos/safety/opening_fall_prevention.mp4',
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
                question: '바닥 개구부에 반드시 설치해야 하는 것은?',
                options: ['경고 표지판만', '덮개 또는 안전난간', '아무것도 필요 없음', '테이프만'],
                correctAnswer: 1,
                explanation: '바닥 개구부에는 튼튼한 덮개 또는 안전난간을 반드시 설치해야 합니다.'
            },
            {
                id: 'q3_002',
                question: '단차가 있는 작업장에서 이동 시 주의사항은?',
                options: [
                    '뛰어서 빠르게 이동한다',
                    '어두운 곳에서도 그냥 이동한다',
                    '단차 위치를 확인하고 천천히 이동한다',
                    '핸드폰을 보면서 이동한다'
                ],
                correctAnswer: 2,
                explanation: '단차가 있는 장소에서는 위치를 확인하고 천천히 이동해야 합니다.'
            },
            {
                id: 'q3_003',
                question: '개구부 덮개의 조건으로 올바른 것은?',
                options: [
                    '쉽게 움직일 수 있어야 한다',
                    '충분한 강도가 있고 고정되어야 한다',
                    '작업자가 볼 수 있도록 투명해야 한다',
                    '가벼워야 한다'
                ],
                correctAnswer: 1,
                explanation: '개구부 덮개는 충분한 강도가 있고 움직이지 않도록 고정되어야 합니다.'
            },
            {
                id: 'q3_004',
                question: '야간 작업 시 개구부 주변에 추가로 필요한 것은?',
                options: ['아무것도 필요 없음', '조명 설치', '음악 설비', '에어컨'],
                correctAnswer: 1,
                explanation: '야간 작업 시에는 개구부 주변에 충분한 조명을 설치해야 합니다.'
            },
            {
                id: 'q3_005',
                question: '개구부 주변에서 작업 시 착용해야 하는 보호구는?',
                options: ['안전모만', '안전화만', '안전모, 안전화, 안전대', '장갑만'],
                correctAnswer: 2,
                explanation: '개구부 주변 작업 시 추락 위험이 있으므로 안전모, 안전화, 안전대를 착용해야 합니다.'
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
                question: '회전체 작업 시 착용하면 안 되는 것은?',
                options: ['안전모', '보안경', '장갑', '안전화'],
                correctAnswer: 2,
                explanation: '회전체 작업 시 장갑이 말려들어갈 수 있어 착용하면 안 됩니다.'
            },
            {
                id: 'q4_002',
                question: '기계 청소나 정비 시 반드시 해야 할 것은?',
                options: [
                    '기계를 가동시킨 채로 작업한다',
                    '전원을 차단하고 잠금장치를 한다',
                    '빠르게 작업을 끝낸다',
                    '혼자서 작업한다'
                ],
                correctAnswer: 1,
                explanation: '기계 청소나 정비 시에는 반드시 전원을 차단하고 잠금장치(LOTO)를 해야 합니다.'
            },
            {
                id: 'q4_003',
                question: '기계의 위험 부위에 반드시 설치해야 하는 것은?',
                options: ['경고 표지판만', '방호덮개나 방호울', '아무것도 필요 없음', '조명'],
                correctAnswer: 1,
                explanation: '기계의 위험 부위에는 방호덮개나 방호울을 반드시 설치해야 합니다.'
            },
            {
                id: 'q4_004',
                question: '기계 작업 시 헐거운 옷을 입으면 안 되는 이유는?',
                options: [
                    '더워서',
                    '회전체에 말려들 수 있어서',
                    '예쁘지 않아서',
                    '작업하기 불편해서'
                ],
                correctAnswer: 1,
                explanation: '헐거운 옷은 회전체에 말려들어가 끼임 사고의 원인이 됩니다.'
            },
            {
                id: 'q4_005',
                question: '비상정지 버튼의 올바른 위치는?',
                options: [
                    '기계 뒤편에 숨겨둔다',
                    '작업자가 쉽게 접근할 수 있는 곳',
                    '관리자 사무실',
                    '창고'
                ],
                correctAnswer: 1,
                explanation: '비상정지 버튼은 작업자가 언제든 쉽게 접근할 수 있는 곳에 설치해야 합니다.'
            }
        ]
    },
    {
        id: 'edu_005',
        category: EDUCATION_CATEGORY.COLLISION_PREVENTION,
        title: '지게차 충돌 예방',
        description: '지게차와 작업자 간 충돌 사고 예방 방법을 학습합니다.',
        videoUrl: '/videos/safety/forklift_safety.mp4',
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
                question: '지게차 작업 구역에서 보행자가 지켜야 할 것은?',
                options: [
                    '지게차와 같이 다닌다',
                    '지정된 보행로를 이용한다',
                    '지게차 뒤를 따라다닌다',
                    '아무 데나 다녀도 된다'
                ],
                correctAnswer: 1,
                explanation: '보행자는 지게차 작업 구역과 분리된 지정 보행로를 이용해야 합니다.'
            },
            {
                id: 'q5_002',
                question: '지게차 운전자가 후진 시 해야 할 것은?',
                options: [
                    '경적을 울리고 주변을 확인한다',
                    '빠르게 후진한다',
                    '전방만 본다',
                    '아무런 확인 없이 후진한다'
                ],
                correctAnswer: 0,
                explanation: '지게차 후진 시에는 반드시 경적을 울리고 주변을 확인해야 합니다.'
            },
            {
                id: 'q5_003',
                question: '지게차의 적정 운행 속도는?',
                options: ['최대 속도', '시속 10km 이하', '시속 30km', '제한 없음'],
                correctAnswer: 1,
                explanation: '작업장 내 지게차는 시속 10km 이하로 운행해야 합니다.'
            },
            {
                id: 'q5_004',
                question: '지게차 주행 시 포크의 올바른 위치는?',
                options: [
                    '최대한 높이 올린다',
                    '지면에서 15~20cm 높이',
                    '지면에 닿게 한다',
                    '눈높이로 올린다'
                ],
                correctAnswer: 1,
                explanation: '지게차 주행 시 포크는 지면에서 15~20cm 높이로 유지해야 합니다.'
            },
            {
                id: 'q5_005',
                question: '지게차 작업 구역 표시로 올바른 것은?',
                options: [
                    '표시가 필요 없다',
                    '노란색 바닥 표시선',
                    '흰색 점선',
                    '아무 색이나 가능'
                ],
                correctAnswer: 1,
                explanation: '지게차 작업 구역은 노란색 바닥 표시선으로 구분해야 합니다.'
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
                question: '안전모 착용 시 턱끈은 어떻게 해야 하나요?',
                options: [
                    '느슨하게 맨다',
                    '맬 필요 없다',
                    '턱에 밀착되게 맨다',
                    '목에 맨다'
                ],
                correctAnswer: 2,
                explanation: '안전모 턱끈은 손가락 1~2개가 들어갈 정도로 턱에 밀착되게 매야 합니다.'
            },
            {
                id: 'q6_002',
                question: '안전모의 내피(충격흡수재)가 손상되었을 때 어떻게 해야 하나요?',
                options: [
                    '그냥 사용한다',
                    '테이프로 붙인다',
                    '즉시 교체한다',
                    '덧대서 사용한다'
                ],
                correctAnswer: 2,
                explanation: '내피가 손상된 안전모는 충격 흡수 기능이 저하되므로 즉시 교체해야 합니다.'
            },
            {
                id: 'q6_003',
                question: '안전모의 권장 교체 주기는?',
                options: ['1년', '2년', '5년', '10년'],
                correctAnswer: 1,
                explanation: '안전모는 일반적으로 2년마다 교체하는 것이 권장됩니다.'
            },
            {
                id: 'q6_004',
                question: '전기 작업 시 사용해야 하는 안전모 종류는?',
                options: ['일반 안전모', '절연 안전모', '아무 안전모나 가능', '안전모 불필요'],
                correctAnswer: 1,
                explanation: '전기 작업 시에는 반드시 절연 기능이 있는 안전모를 착용해야 합니다.'
            },
            {
                id: 'q6_005',
                question: '안전모를 보관할 때 주의사항은?',
                options: [
                    '직사광선에 보관한다',
                    '서늘하고 건조한 곳에 보관한다',
                    '뜨거운 곳에 보관한다',
                    '물에 담가 보관한다'
                ],
                correctAnswer: 1,
                explanation: '안전모는 직사광선을 피해 서늘하고 건조한 곳에 보관해야 합니다.'
            }
        ]
    },
    {
        id: 'edu_007',
        category: EDUCATION_CATEGORY.PPE,
        title: '안전대 착용 및 점검',
        description: '안전대의 올바른 착용법과 작업 전 점검 방법을 학습합니다.',
        videoUrl: '/videos/safety/safety_harness.mp4',
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
                question: '안전대 훅은 어디에 체결해야 하나요?',
                options: [
                    '허리 아래',
                    '발목 높이',
                    '허리 위 견고한 구조물',
                    '아무 데나 가능'
                ],
                correctAnswer: 2,
                explanation: '안전대 훅은 허리 위 견고한 구조물에 체결해야 추락 시 충격을 최소화합니다.'
            },
            {
                id: 'q7_002',
                question: '안전대 착용 전 점검사항이 아닌 것은?',
                options: ['벨트 마모 상태', '훅 작동 상태', '안전대 색상', 'D링 상태'],
                correctAnswer: 2,
                explanation: '안전대 점검 시 벨트, 훅, D링 등의 기능적 상태를 확인해야 합니다.'
            },
            {
                id: 'q7_003',
                question: '전체식 안전대(Full Body Harness)의 장점은?',
                options: [
                    '가격이 저렴하다',
                    '추락 시 충격을 분산시킨다',
                    '착용이 간편하다',
                    '가볍다'
                ],
                correctAnswer: 1,
                explanation: '전체식 안전대는 추락 시 충격을 신체 전체에 분산시켜 부상을 최소화합니다.'
            },
            {
                id: 'q7_004',
                question: '안전대를 한 번 추락에 사용했을 경우 어떻게 해야 하나요?',
                options: [
                    '그대로 재사용한다',
                    '청소 후 사용한다',
                    '즉시 폐기하고 새 것으로 교체한다',
                    '1주일 후 사용한다'
                ],
                correctAnswer: 2,
                explanation: '추락에 사용된 안전대는 내부 손상이 있을 수 있어 즉시 폐기해야 합니다.'
            },
            {
                id: 'q7_005',
                question: '안전대 착용이 필수인 작업 높이는?',
                options: ['1m 이상', '2m 이상', '3m 이상', '5m 이상'],
                correctAnswer: 1,
                explanation: '높이 2m 이상에서 작업 시 반드시 안전대를 착용해야 합니다.'
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
                question: '소화기 사용 순서로 올바른 것은?',
                options: [
                    '뿌리기 → 안전핀 뽑기 → 노즐 조준',
                    '안전핀 뽑기 → 노즐 조준 → 손잡이 누르기',
                    '손잡이 누르기 → 안전핀 뽑기 → 노즐 조준',
                    '노즐 조준 → 안전핀 뽑기 → 손잡이 누르기'
                ],
                correctAnswer: 1,
                explanation: '소화기는 안전핀 뽑기 → 노즐 조준 → 손잡이 누르기 순서로 사용합니다.'
            },
            {
                id: 'q8_002',
                question: '소화기로 화재 진압 시 어느 방향에서 접근해야 하나요?',
                options: ['바람을 등지고', '바람을 맞으며', '옆에서', '위에서'],
                correctAnswer: 0,
                explanation: '바람을 등지고 접근해야 연기와 화염을 피할 수 있습니다.'
            },
            {
                id: 'q8_003',
                question: '소화기의 유효 사용거리는?',
                options: ['1m', '3~5m', '10m', '20m'],
                correctAnswer: 1,
                explanation: '일반 소화기의 유효 사용거리는 약 3~5m입니다.'
            },
            {
                id: 'q8_004',
                question: '전기 화재 시 사용할 수 있는 소화기는?',
                options: ['물 소화기', 'ABC 분말 소화기', '폼 소화기', '물 양동이'],
                correctAnswer: 1,
                explanation: '전기 화재에는 ABC 분말 소화기나 CO2 소화기를 사용해야 합니다.'
            },
            {
                id: 'q8_005',
                question: '소화기 점검 시 확인해야 할 것은?',
                options: ['색상', '압력 게이지 상태', '무게만', '소화기 브랜드'],
                correctAnswer: 1,
                explanation: '소화기 점검 시 압력 게이지가 녹색 범위에 있는지 확인해야 합니다.'
            }
        ]
    },
    {
        id: 'edu_009',
        category: EDUCATION_CATEGORY.ELECTRICAL,
        title: '전기 안전 기본',
        description: '전기 작업 시 안전 수칙과 감전 예방 방법을 학습합니다.',
        videoUrl: '/videos/safety/electrical_safety.mp4',
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
                question: '전기 작업 전 반드시 해야 할 것은?',
                options: [
                    '그냥 시작한다',
                    '전원을 차단하고 확인한다',
                    '장갑만 착용한다',
                    '안전모만 착용한다'
                ],
                correctAnswer: 1,
                explanation: '전기 작업 전에는 반드시 전원을 차단하고 검전기로 확인해야 합니다.'
            },
            {
                id: 'q9_002',
                question: '습한 환경에서 전기 작업 시 추가로 필요한 것은?',
                options: ['일반 장갑', '절연 장갑과 절연 장화', '면장갑', '필요 없음'],
                correctAnswer: 1,
                explanation: '습한 환경에서는 절연 장갑과 절연 장화를 반드시 착용해야 합니다.'
            },
            {
                id: 'q9_003',
                question: '전선이 손상된 것을 발견했을 때 어떻게 해야 하나요?',
                options: [
                    '테이프로 감는다',
                    '그냥 사용한다',
                    '사용을 중지하고 교체한다',
                    '물로 닦는다'
                ],
                correctAnswer: 2,
                explanation: '손상된 전선은 즉시 사용을 중지하고 교체해야 합니다.'
            },
            {
                id: 'q9_004',
                question: '누전차단기의 역할은?',
                options: [
                    '전기 요금 절약',
                    '누전 시 자동으로 전기를 차단',
                    '조명을 밝게 함',
                    '전압을 높임'
                ],
                correctAnswer: 1,
                explanation: '누전차단기는 누전 발생 시 자동으로 전기를 차단하여 감전을 예방합니다.'
            },
            {
                id: 'q9_005',
                question: '감전자 발견 시 가장 먼저 해야 할 것은?',
                options: [
                    '감전자를 직접 만져서 끌어낸다',
                    '전원을 차단한다',
                    '물을 뿌린다',
                    '그냥 둔다'
                ],
                correctAnswer: 1,
                explanation: '감전자 발견 시 가장 먼저 전원을 차단해야 합니다.'
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
                question: '밀폐공간 작업 전 반드시 해야 할 것은?',
                options: [
                    '바로 들어간다',
                    '산소 농도를 측정한다',
                    '조명만 확인한다',
                    '혼자 들어간다'
                ],
                correctAnswer: 1,
                explanation: '밀폐공간 작업 전에는 반드시 산소 농도를 측정해야 합니다.'
            },
            {
                id: 'q10_002',
                question: '정상 산소 농도 범위는?',
                options: ['15~17%', '18~23.5%', '25~30%', '10~15%'],
                correctAnswer: 1,
                explanation: '정상 산소 농도는 18~23.5%이며, 18% 미만은 산소결핍 상태입니다.'
            },
            {
                id: 'q10_003',
                question: '밀폐공간 작업 시 필수 인원 배치는?',
                options: [
                    '혼자 작업 가능',
                    '감시인 배치 필수',
                    '인원 제한 없음',
                    '2명 이내'
                ],
                correctAnswer: 1,
                explanation: '밀폐공간 작업 시 외부에 반드시 감시인을 배치해야 합니다.'
            },
            {
                id: 'q10_004',
                question: '밀폐공간에서 의식을 잃은 동료를 발견했을 때?',
                options: [
                    '바로 들어가서 구출한다',
                    '공기호흡기 착용 후 구출하거나 119 신고',
                    '큰 소리로 부른다',
                    '물을 뿌린다'
                ],
                correctAnswer: 1,
                explanation: '구조자도 위험할 수 있으므로 공기호흡기 착용 후 구출하거나 119에 신고해야 합니다.'
            },
            {
                id: 'q10_005',
                question: '밀폐공간 작업 시 환기는 언제까지 해야 하나요?',
                options: [
                    '작업 시작 전 5분만',
                    '작업이 끝날 때까지 계속',
                    '환기 불필요',
                    '1시간만'
                ],
                correctAnswer: 1,
                explanation: '밀폐공간 작업 중에는 작업이 끝날 때까지 계속 환기해야 합니다.'
            }
        ]
    }
];

/**
 * 오늘의 교육 콘텐츠 가져오기
 * 주차와 요일에 따라 순환하여 제공
 */
export const getTodayEducation = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
    
    // 주차 계산 (1~52)
    const weekNumber = Math.ceil(dayOfYear / 7) % 5 + 1; // 5주 순환
    // 요일 계산 (1=월요일 ~ 5=금요일, 주말은 1로 처리)
    let dayOfWeek = today.getDay();
    if (dayOfWeek === 0) dayOfWeek = 1; // 일요일 → 월요일
    if (dayOfWeek === 6) dayOfWeek = 1; // 토요일 → 월요일
    
    // 해당 주차와 요일에 맞는 교육 찾기
    const education = educationContents.find(
        edu => edu.weekNumber === weekNumber && edu.dayOfWeek === dayOfWeek
    );
    
    // 없으면 첫 번째 교육 반환
    return education || educationContents[0];
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
