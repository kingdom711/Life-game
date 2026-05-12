/**
 * 학습 경로 (Learning Path) 데이터
 * - 직무별 체계적 커리큘럼
 * - 단계별 해금 구조
 */

export const LEARNING_PATHS = [
    {
        id: 'path_basic_safety',
        title: '기초 안전 마스터',
        description: '모든 직무에 필수인 산업안전 기초 과정입니다.',
        icon: '🛡️',
        color: '#3b82f6',
        role: 'all',
        totalSteps: 4,
        reward: { points: 500, exp: 300, title: '안전 기초 마스터' },
        steps: [
            {
                id: 'basic_step1',
                title: 'STEP 1: 안전의 기본',
                description: '산업안전의 핵심 개념을 학습합니다.',
                type: 'education',
                content: [
                    { type: 'video', title: '산업안전 기초 개념', duration: '10분' },
                    { type: 'quiz', title: '기초 안전 퀴즈', questions: 5, passingScore: 60 }
                ],
                reward: { points: 100, exp: 30 },
                unlocked: true
            },
            {
                id: 'basic_step2',
                title: 'STEP 2: 보호구 착용법',
                description: '개인 보호구의 올바른 착용법을 배웁니다.',
                type: 'education',
                content: [
                    { type: 'video', title: '안전모·안전화·안전대 착용법', duration: '8분' },
                    { type: 'quiz', title: '보호구 퀴즈', questions: 5, passingScore: 60 }
                ],
                reward: { points: 150, exp: 50 },
                unlocked: false
            },
            {
                id: 'basic_step3',
                title: 'STEP 3: 위험 인지 훈련',
                description: '현장 위험 요소를 식별하는 눈을 키웁니다.',
                type: 'practice',
                content: [
                    { type: 'scenario', title: '위험 사진 3장 분석', count: 3 },
                    { type: 'task', title: '내 작업장 위험 1건 신고' }
                ],
                reward: { points: 200, exp: 80 },
                unlocked: false
            },
            {
                id: 'basic_step4',
                title: 'STEP 4: 종합 평가',
                description: '기초 안전 과정의 최종 평가입니다.',
                type: 'exam',
                content: [
                    { type: 'quiz', title: '종합 평가 (15문항)', questions: 15, passingScore: 80 }
                ],
                reward: { points: 300, exp: 120 },
                unlocked: false
            }
        ]
    },
    {
        id: 'path_fall_prevention',
        title: '추락 방지 전문가',
        description: '고소작업 시 추락 방지를 위한 전문 과정입니다.',
        icon: '🧗',
        color: '#ef4444',
        role: 'technician',
        totalSteps: 4,
        prerequisite: 'path_basic_safety',
        reward: { points: 800, exp: 500, title: '추락방지 전문가' },
        steps: [
            {
                id: 'fall_step1',
                title: 'STEP 1: 추락 사고 이론',
                description: '추락 사고의 원인과 유형을 학습합니다.',
                type: 'education',
                content: [
                    { type: 'video', title: '추락 사고 사례 분석', duration: '12분' },
                    { type: 'quiz', title: '추락 이론 퀴즈', questions: 5, passingScore: 60 }
                ],
                reward: { points: 150, exp: 50 },
                unlocked: true
            },
            {
                id: 'fall_step2',
                title: 'STEP 2: 안전대·비계 점검',
                description: '안전대 착용법과 비계 점검 요령을 배웁니다.',
                type: 'education',
                content: [
                    { type: 'video', title: '안전대 올바른 착용', duration: '10분' },
                    { type: 'video', title: '비계 점검 요령', duration: '10분' },
                    { type: 'quiz', title: '점검 실습 퀴즈', questions: 8, passingScore: 70 }
                ],
                reward: { points: 200, exp: 80 },
                unlocked: false
            },
            {
                id: 'fall_step3',
                title: 'STEP 3: 현장 실습',
                description: '실제 현장에서 추락 위험 요소를 점검합니다.',
                type: 'practice',
                content: [
                    { type: 'task', title: '고소작업 체크리스트 3회 완료' },
                    { type: 'task', title: '추락 위험 구역 사진 촬영 제출' }
                ],
                reward: { points: 250, exp: 100 },
                unlocked: false
            },
            {
                id: 'fall_step4',
                title: 'STEP 4: 최종 인증',
                description: '추락 방지 전문 자격 인증 시험입니다.',
                type: 'exam',
                content: [
                    { type: 'quiz', title: '최종 평가 (15문항)', questions: 15, passingScore: 80 }
                ],
                reward: { points: 400, exp: 200 },
                unlocked: false
            }
        ]
    },
    {
        id: 'path_electrical',
        title: '전기 안전 전문가',
        description: '전기 설비 안전 관리를 위한 전문 과정입니다.',
        icon: '⚡',
        color: '#eab308',
        role: 'technician',
        totalSteps: 4,
        prerequisite: 'path_basic_safety',
        reward: { points: 800, exp: 500, title: '전기안전 전문가' },
        steps: [
            {
                id: 'elec_step1',
                title: 'STEP 1: 감전 사고 이론',
                description: '감전 사고의 메커니즘과 예방법을 학습합니다.',
                type: 'education',
                content: [
                    { type: 'video', title: '감전 사고 예방', duration: '10분' },
                    { type: 'quiz', title: '감전 이론 퀴즈', questions: 5, passingScore: 60 }
                ],
                reward: { points: 150, exp: 50 },
                unlocked: true
            },
            {
                id: 'elec_step2',
                title: 'STEP 2: 전기 설비 점검',
                description: '전기 설비 점검 방법과 검전기 사용법을 배웁니다.',
                type: 'education',
                content: [
                    { type: 'video', title: '전기 설비 점검 요령', duration: '10분' },
                    { type: 'quiz', title: '설비 점검 퀴즈', questions: 8, passingScore: 70 }
                ],
                reward: { points: 200, exp: 80 },
                unlocked: false
            },
            {
                id: 'elec_step3',
                title: 'STEP 3: 현장 실습 과제',
                description: '내 작업장의 전기 설비를 직접 점검합니다.',
                type: 'practice',
                content: [
                    { type: 'task', title: '전기 설비 사진 3장 촬영·제출' },
                    { type: 'task', title: 'AI 분석으로 위험 요소 확인' }
                ],
                reward: { points: 300, exp: 120 },
                unlocked: false
            },
            {
                id: 'elec_step4',
                title: 'STEP 4: 최종 인증',
                description: '전기 안전 전문 자격 인증 시험입니다.',
                type: 'exam',
                content: [
                    { type: 'quiz', title: '최종 평가 (15문항)', questions: 15, passingScore: 80 }
                ],
                reward: { points: 400, exp: 200 },
                unlocked: false
            }
        ]
    },
    {
        id: 'path_manager',
        title: '안전 관리 리더십',
        description: '관리감독자를 위한 안전 리더십 과정입니다.',
        icon: '👔',
        color: '#8b5cf6',
        role: 'supervisor',
        totalSteps: 3,
        reward: { points: 1000, exp: 600, title: '안전 리더' },
        steps: [
            {
                id: 'mgr_step1',
                title: 'STEP 1: 관리감독자 역할',
                description: '관리감독자의 법적 의무와 역할을 학습합니다.',
                type: 'education',
                content: [
                    { type: 'video', title: '관리감독자 의무와 책임', duration: '15분' },
                    { type: 'quiz', title: '관리감독자 퀴즈', questions: 5, passingScore: 60 }
                ],
                reward: { points: 200, exp: 80 },
                unlocked: true
            },
            {
                id: 'mgr_step2',
                title: 'STEP 2: 위험성 평가',
                description: '체계적인 위험성 평가 방법을 배웁니다.',
                type: 'education',
                content: [
                    { type: 'video', title: '위험성 평가 실무', duration: '15분' },
                    { type: 'quiz', title: '위험성 평가 퀴즈', questions: 8, passingScore: 70 }
                ],
                reward: { points: 300, exp: 120 },
                unlocked: false
            },
            {
                id: 'mgr_step3',
                title: 'STEP 3: 종합 평가',
                description: '관리감독자 과정 최종 평가입니다.',
                type: 'exam',
                content: [
                    { type: 'quiz', title: '종합 평가 (15문항)', questions: 15, passingScore: 80 }
                ],
                reward: { points: 500, exp: 200 },
                unlocked: false
            }
        ]
    }
];

/**
 * 역할별 학습 경로 필터
 */
export const getPathsByRole = (role) => {
    return LEARNING_PATHS.filter(p => p.role === 'all' || p.role === role);
};

/**
 * ID로 학습 경로 조회
 */
export const getPathById = (pathId) => {
    return LEARNING_PATHS.find(p => p.id === pathId) || null;
};
