/**
 * 전직(특수역할) 전용 교육 콘텐츠
 *
 * 일반 교육과의 차이점:
 * - 영상 시간: 15분 (일반: 10분)
 * - 합격 기준: 90% (일반: 80%)
 * - 퀴즈 문항: 7문제 (일반: 5문제)
 * - 보상 증가: 포인트 150, EXP 50 (일반: 50P, 20EXP)
 */

export const SPECIALIZATION_EDUCATION_CONFIG = {
    REQUIRED_WATCH_PERCENT: 0.9,  // 90% 시청 필수
    REQUIRED_SCORE: 90,           // 90% 이상 합격
    QUIZ_COUNT: 7,                // 7문항
    MAX_DAILY_ATTEMPTS: 3,        // 1일 3회 시도
    POINTS_REWARD: 150,
    EXP_REWARD: 50
};

/**
 * 전직 교육 콘텐츠 목록
 */
export const specializationEducations = [
    // ===== 유도원 교육 =====
    {
        id: 'edu_sp_signal_01',
        specializationId: 'signalWorker',
        title: '중장비 유도 신호 체계',
        description: '건설현장 중장비 이동 시 표준 유도 신호 체계와 안전 절차를 학습합니다.',
        videoUrl: '/videos/specialization/signal_system.mp4',
        youtubeVideoId: '670vqRvV9H4',
        thumbnailUrl: '/images/education/signal_system_thumbnail.png',
        duration: 900, // 15분
        requiredWatchTime: 810, // 90%
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 1,
        quiz: [
            {
                id: 'qsp_s1_001',
                question: '중장비 유도 시 유도원이 서 있어야 하는 위치는?',
                options: ['중장비 바로 앞', '운전자가 확인할 수 있는 안전한 위치', '중장비 뒤쪽 사각지대', '현장 사무실 앞', '중장비 운전석 옆'],
                correctAnswer: 1,
                explanation: '유도원은 중장비 운전자가 항상 확인할 수 있는 안전한 위치에 서서 신호를 보내야 합니다.'
            },
            {
                id: 'qsp_s1_002',
                question: '유도 신호 중 "정지" 신호의 올바른 동작은?',
                options: ['한 손을 위로 올린다', '양손을 머리 위에서 교차한다', '주먹을 쥐고 팔을 수평으로 든다', '양팔을 수평으로 펼친 후 아래로 내린다', '호루라기를 세 번 분다'],
                correctAnswer: 3,
                explanation: '정지 신호는 양팔을 수평으로 펼친 후 아래로 내려 명확하게 전달합니다.'
            },
            {
                id: 'qsp_s1_003',
                question: '야간 작업 시 유도원이 반드시 갖추어야 할 장비는?',
                options: ['선글라스', '야광봉(라이트스틱) 또는 신호등', '확성기만 있으면 됨', '헬멧만 착용', '특별한 장비 불필요'],
                correctAnswer: 1,
                explanation: '야간에는 시인성 확보를 위해 야광봉이나 신호등 등 발광 장비를 반드시 사용해야 합니다.'
            },
            {
                id: 'qsp_s1_004',
                question: '유도원과 중장비 운전자 간 무전 통신 시 주의사항은?',
                options: ['빠르게 말한다', '약어를 최대한 많이 쓴다', '명확하고 간결한 표현, 복창 확인', '큰 소리로 고함친다', '통신 없이 수신호만 사용'],
                correctAnswer: 2,
                explanation: '무전 시에는 명확하고 간결한 표현을 사용하고, 상대방이 복창하여 확인해야 합니다.'
            },
            {
                id: 'qsp_s1_005',
                question: '후진하는 중장비를 유도할 때 유도원의 위치로 적절한 곳은?',
                options: ['중장비 바로 뒤', '중장비 측면에서 운전자 시야 확보 가능한 곳', '중장비 위', '현장 울타리 밖', '운전석 문 옆'],
                correctAnswer: 1,
                explanation: '후진 유도 시 유도원은 중장비 측면에서 운전자가 볼 수 있는 위치에 서야 합니다.'
            },
            {
                id: 'qsp_s1_006',
                question: '유도 작업 중 위험 상황 발생 시 최우선 행동은?',
                options: ['계속 유도한다', '즉시 비상 정지 신호를 보낸다', '현장을 떠난다', '사진을 찍는다', '다른 유도원을 부른다'],
                correctAnswer: 1,
                explanation: '위험 상황 시 즉시 비상 정지 신호를 보내 중장비를 멈추게 해야 합니다.'
            },
            {
                id: 'qsp_s1_007',
                question: '유도원이 착용해야 할 개인보호구로 적절하지 않은 것은?',
                options: ['안전모', '안전조끼(반사조끼)', '안전화', '일반 운동화', '보호 장갑'],
                correctAnswer: 3,
                explanation: '유도원은 안전모, 반사조끼, 안전화 등을 착용해야 하며 일반 운동화는 적합하지 않습니다.'
            }
        ]
    },
    {
        id: 'edu_sp_signal_02',
        specializationId: 'signalWorker',
        title: '유도원 안전 실무',
        description: '유도원의 현장 실무 절차, 작업 전 안전 회의, 비상 대응 방법을 학습합니다.',
        videoUrl: '/videos/specialization/signal_practice.mp4',
        youtubeVideoId: 'zD_hQbVa_P0',
        thumbnailUrl: '/images/education/signal_practice_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 2,
        quiz: [
            {
                id: 'qsp_s2_001',
                question: '유도 작업 시작 전 TBM(Tool Box Meeting)에서 확인해야 할 사항이 아닌 것은?',
                options: ['작업 범위 및 동선', '중장비 종류 및 특성', '비상 연락망', '오늘의 점심 메뉴', '주변 작업자 위치'],
                correctAnswer: 3,
                explanation: 'TBM에서는 작업 범위, 장비 특성, 비상 연락망, 주변 인원 등 안전 관련 사항을 확인합니다.'
            },
            {
                id: 'qsp_s2_002',
                question: '유도원 배치 기준으로 옳은 것은?',
                options: ['1대당 1명 이상 배치', '3대당 1명', '장비 크기 상관없이 현장에 1명', '유도원 없이 운전자 판단', '비가 오면 배치 불필요'],
                correctAnswer: 0,
                explanation: '중장비 1대당 유도원 1명 이상을 배치하여 안전을 확보해야 합니다.'
            },
            {
                id: 'qsp_s2_003',
                question: '유도 작업 중 시야가 확보되지 않는 사각지대 발생 시 조치는?',
                options: ['그냥 진행', '추가 유도원 배치 또는 CCTV 설치', '운전자에게 알아서 하라고 함', '속도를 높여 빨리 지나감', '작업 종료 후 처리'],
                correctAnswer: 1,
                explanation: '사각지대에는 추가 유도원을 배치하거나 CCTV 등 보조 장비를 설치해야 합니다.'
            },
            {
                id: 'qsp_s2_004',
                question: '유도원이 교대 시 반드시 수행해야 할 절차는?',
                options: ['그냥 자리를 바꾼다', '인수인계 없이 교대', '작업 상황, 주의사항, 신호 체계 인수인계', '교대 없이 끝까지 근무', '전화로 간단히 알림'],
                correctAnswer: 2,
                explanation: '교대 시 작업 상황, 주의사항, 신호 체계 등을 정확히 인수인계해야 합니다.'
            },
            {
                id: 'qsp_s2_005',
                question: '강풍(풍속 10m/s 이상) 시 유도 작업에 대한 올바른 조치는?',
                options: ['평소와 동일하게 작업', '작업 중지 및 대피', '더 빠르게 유도', '유도원만 대피하고 장비는 운행', '호루라기를 더 세게 분다'],
                correctAnswer: 1,
                explanation: '강풍 시에는 중장비 전도 위험이 있으므로 작업을 중지하고 대피해야 합니다.'
            },
            {
                id: 'qsp_s2_006',
                question: '유도원의 신호가 운전자에게 전달되지 않을 때 대응 방법은?',
                options: ['더 큰 동작으로 반복', '즉시 작업 중지 후 통신 수단 확인', '포기하고 자리를 떠남', '다른 작업자에게 부탁', '고함을 지른다'],
                correctAnswer: 1,
                explanation: '신호가 전달되지 않으면 즉시 작업을 중지하고 통신 수단을 확인 후 재개해야 합니다.'
            },
            {
                id: 'qsp_s2_007',
                question: '유도 작업 완료 후 유도원이 해야 할 마무리 절차는?',
                options: ['바로 퇴근', '작업 일지 작성 및 이상 사항 보고', '장비만 확인', '사진 촬영만', '특별한 절차 없음'],
                correctAnswer: 1,
                explanation: '유도 작업 완료 후 작업 일지를 작성하고 이상 사항이 있으면 보고해야 합니다.'
            }
        ]
    },

    // ===== 신호수 교육 =====
    {
        id: 'edu_sp_crane_01',
        specializationId: 'craneSigner',
        title: '양중기 수신호 표준',
        description: '크레인 등 양중기 작업 시 사용하는 표준 수신호 체계를 학습합니다.',
        videoUrl: '/videos/specialization/crane_signal.mp4',
        youtubeVideoId: 'PA-9g7P22Lo',
        thumbnailUrl: '/images/education/crane_signal_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 1,
        quiz: [
            {
                id: 'qsp_c1_001',
                question: '크레인 "권상(올림)" 수신호의 올바른 동작은?',
                options: ['팔을 아래로 내린다', '주먹을 쥐고 엄지를 위로 올려 팔을 돌린다', '양손을 좌우로 흔든다', '양팔을 교차한다', '손바닥을 아래로 향한다'],
                correctAnswer: 1,
                explanation: '권상(올림) 신호는 주먹을 쥐고 엄지를 위로 올려 원을 그리듯 팔을 돌립니다.'
            },
            {
                id: 'qsp_c1_002',
                question: '크레인 "권하(내림)" 수신호의 올바른 동작은?',
                options: ['엄지를 위로', '주먹을 쥐고 엄지를 아래로 향해 팔을 돌린다', '양손으로 박수', '한 손을 옆으로 흔든다', '양팔을 벌린다'],
                correctAnswer: 1,
                explanation: '권하(내림) 신호는 주먹을 쥐고 엄지를 아래로 향해 원을 그리듯 팔을 돌립니다.'
            },
            {
                id: 'qsp_c1_003',
                question: '크레인 작업 중 "비상 정지" 신호는?',
                options: ['한 손을 위로', '양팔을 머리 위에서 크게 교차하며 반복', '손가락으로 방향 지시', '고개를 흔든다', '양손을 모은다'],
                correctAnswer: 1,
                explanation: '비상 정지 신호는 양팔을 머리 위에서 크게 교차하며 반복적으로 동작합니다.'
            },
            {
                id: 'qsp_c1_004',
                question: '양중기 신호수의 법적 자격 요건으로 옳은 것은?',
                options: ['별도 자격 불필요', '신호수 특별 안전교육 이수', '크레인 운전 면허 보유', '10년 이상 경력', '관리감독자만 가능'],
                correctAnswer: 1,
                explanation: '양중기 신호수는 관련 특별 안전교육을 이수해야 합니다.'
            },
            {
                id: 'qsp_c1_005',
                question: '크레인으로 자재를 인양할 때 와이어로프 각도의 안전 기준은?',
                options: ['90도 이하', '60도 이하', '45도 이하', '각도 상관없음', '30도 이하'],
                correctAnswer: 1,
                explanation: '와이어로프 걸기 각도는 60도 이하를 유지해야 안전합니다.'
            },
            {
                id: 'qsp_c1_006',
                question: '인양 중인 하물 아래 작업자 출입에 대한 규정은?',
                options: ['안전모 착용 시 가능', '신호수 허락 시 가능', '절대 출입 금지', '가벼운 물건이면 가능', '잠깐이면 괜찮다'],
                correctAnswer: 2,
                explanation: '인양 중인 하물 아래는 낙하 위험이 있으므로 절대 출입이 금지됩니다.'
            },
            {
                id: 'qsp_c1_007',
                question: '크레인 작업 반경 내 안전 조치로 적절한 것은?',
                options: ['특별한 조치 불필요', '경고 표지판 설치만', '작업 반경 내 출입 통제 및 안전 구역 설정', '작업자에게 구두 주의만', '작업 시간을 줄인다'],
                correctAnswer: 2,
                explanation: '크레인 작업 반경 내에는 출입을 통제하고 안전 구역을 설정해야 합니다.'
            }
        ]
    },
    {
        id: 'edu_sp_crane_02',
        specializationId: 'craneSigner',
        title: '크레인 작업 안전 관리',
        description: '크레인 작업의 전체 안전 관리 절차와 비상 대응 방법을 학습합니다.',
        videoUrl: '/videos/specialization/crane_safety.mp4',
        youtubeVideoId: 'ppOKTXcAS5k',
        thumbnailUrl: '/images/education/crane_safety_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 2,
        quiz: [
            {
                id: 'qsp_c2_001',
                question: '크레인 작업 전 점검 사항이 아닌 것은?',
                options: ['와이어로프 상태', '과부하방지장치', '제한스위치', '크레인 도색 색상', '브레이크 작동'],
                correctAnswer: 3,
                explanation: '크레인 작업 전 와이어로프, 안전장치, 브레이크 등 기능적 상태를 점검하며, 도색 색상은 점검 항목이 아닙니다.'
            },
            {
                id: 'qsp_c2_002',
                question: '정격하중을 초과하는 인양 작업 요청 시 신호수의 올바른 대응은?',
                options: ['천천히 올리면 가능', '거부하고 관리감독자에게 보고', '운전자 판단에 맡김', '반만 올린다', '빠르게 올리면 안전'],
                correctAnswer: 1,
                explanation: '정격하중 초과 작업은 거부하고 관리감독자에게 보고해야 합니다.'
            },
            {
                id: 'qsp_c2_003',
                question: '타워크레인 작업 중지 풍속 기준은?',
                options: ['초속 5m/s', '초속 10m/s 이상', '초속 20m/s', '풍속 상관없음', '초속 30m/s'],
                correctAnswer: 1,
                explanation: '타워크레인은 순간풍속 초속 10m/s 이상 시 작업을 중지해야 합니다.'
            },
            {
                id: 'qsp_c2_004',
                question: '크레인 인양물이 회전하는 것을 방지하기 위한 장치는?',
                options: ['안전핀', '가이드로프(유도로프)', '스프링', '고무패드', '자석'],
                correctAnswer: 1,
                explanation: '가이드로프(유도로프)를 사용하여 인양물의 회전과 흔들림을 방지합니다.'
            },
            {
                id: 'qsp_c2_005',
                question: '2대 이상의 크레인으로 공동 작업 시 주의사항은?',
                options: ['각자 알아서 작업', '신호수를 추가 배치하고 통합 신호 체계 운영', '한 명의 운전자만 조종', '작업 속도를 높인다', '야간에만 실시'],
                correctAnswer: 1,
                explanation: '공동 작업 시 신호수를 추가 배치하고 통합 신호 체계를 운영해야 합니다.'
            },
            {
                id: 'qsp_c2_006',
                question: '크레인 작업 중 전선 근접 시 안전 이격 거리는?',
                options: ['전압에 관계없이 1m', '특고압(7,000V 이상): 2m 이상', '30cm이면 충분', '접촉만 안 하면 됨', '거리 상관없음'],
                correctAnswer: 1,
                explanation: '특고압 전선(7,000V 이상)은 2m 이상 이격 거리를 확보해야 합니다.'
            },
            {
                id: 'qsp_c2_007',
                question: '크레인 해체 작업 시 신호수의 역할은?',
                options: ['해체 작업에 참여 불필요', '해체 순서에 맞춰 안전 신호 제공 및 주변 통제', '구경만 한다', '서류 작성만', '운전자와 교대'],
                correctAnswer: 1,
                explanation: '해체 시에도 신호수는 해체 순서에 맞춰 안전 신호를 제공하고 주변을 통제해야 합니다.'
            }
        ]
    },

    // ===== 밀폐담당자 교육 =====
    {
        id: 'edu_sp_confined_01',
        specializationId: 'confinedSpaceManager',
        title: '밀폐공간 위험성 평가',
        description: '밀폐공간의 정의, 유해가스 종류, 위험성 평가 방법을 학습합니다.',
        videoUrl: '/videos/specialization/confined_risk.mp4',
        youtubeVideoId: '6886vrKJ9-g',
        thumbnailUrl: '/images/education/confined_risk_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 1,
        quiz: [
            {
                id: 'qsp_cf1_001',
                question: '산업안전보건법상 밀폐공간의 정의로 옳은 것은?',
                options: ['좁은 공간', '환기가 불충분한 상태에서 유해가스 등으로 질식 위험이 있는 장소', '지하실', '창문이 없는 사무실', '좁고 어두운 곳'],
                correctAnswer: 1,
                explanation: '밀폐공간은 환기가 불충분한 상태에서 유해가스 등으로 인한 질식 위험이 있는 장소입니다.'
            },
            {
                id: 'qsp_cf1_002',
                question: '밀폐공간에서 산소 농도의 정상 범위는?',
                options: ['16~18%', '18~23.5%', '23.5~25%', '25% 이상', '15% 이상'],
                correctAnswer: 1,
                explanation: '밀폐공간의 적정 산소 농도는 18~23.5%이며, 18% 미만은 산소결핍 상태입니다.'
            },
            {
                id: 'qsp_cf1_003',
                question: '밀폐공간에서 발생 가능한 유해가스가 아닌 것은?',
                options: ['황화수소(H2S)', '일산화탄소(CO)', '질소(N2)', '메탄(CH4)', '산소(O2, 정상 농도)'],
                correctAnswer: 4,
                explanation: '정상 농도의 산소는 유해가스가 아니며, 황화수소, 일산화탄소, 질소, 메탄 등이 위험합니다.'
            },
            {
                id: 'qsp_cf1_004',
                question: '밀폐공간 가스 측정 시 측정 순서로 올바른 것은?',
                options: ['유해가스 → 산소', '산소 → 가연성가스 → 유해가스', '가연성가스만 측정', '측정 없이 환기만', '작업 후 측정'],
                correctAnswer: 1,
                explanation: '산소 농도를 먼저 측정한 후 가연성가스, 유해가스 순서로 측정합니다.'
            },
            {
                id: 'qsp_cf1_005',
                question: '황화수소(H2S)의 특징으로 옳은 것은?',
                options: ['무색무취', '계란 썩는 냄새, 고농도 시 후각 마비', '달콤한 향', '자극적인 산 냄새', '꽃 향기'],
                correctAnswer: 1,
                explanation: '황화수소는 저농도에서 계란 썩는 냄새가 나지만, 고농도에서는 후각이 마비되어 감지할 수 없습니다.'
            },
            {
                id: 'qsp_cf1_006',
                question: '밀폐공간 위험성 평가 시 반드시 포함해야 할 항목은?',
                options: ['작업자 나이', '공간의 유해가스 종류, 농도, 산소 농도, 환기 상태', '작업자 체중', '날씨 예보', '점심 메뉴'],
                correctAnswer: 1,
                explanation: '위험성 평가에는 유해가스 종류/농도, 산소 농도, 환기 상태 등이 포함되어야 합니다.'
            },
            {
                id: 'qsp_cf1_007',
                question: '밀폐공간 위험 등급 중 가장 높은 위험도의 상황은?',
                options: ['환기가 잘 되는 공간', '산소 16% 미만 + 유해가스 검출', '산소 20%의 빈 탱크', '이전 작업에서 안전했던 공간', '지상 개방형 맨홀'],
                correctAnswer: 1,
                explanation: '산소 16% 미만이고 유해가스가 검출되는 상황은 가장 높은 위험 등급입니다.'
            }
        ]
    },
    {
        id: 'edu_sp_confined_02',
        specializationId: 'confinedSpaceManager',
        title: '밀폐공간 작업허가 절차',
        description: '밀폐공간 작업허가서 발급 절차와 작업 관리 방법을 학습합니다.',
        videoUrl: '/videos/specialization/confined_permit.mp4',
        youtubeVideoId: 'VxLudzI5DjU',
        thumbnailUrl: '/images/education/confined_permit_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 2,
        quiz: [
            {
                id: 'qsp_cf2_001',
                question: '밀폐공간 작업허가서에 반드시 포함되어야 할 내용이 아닌 것은?',
                options: ['작업 일시 및 장소', '작업 내용', '안전 조치 사항', '작업자 혈액형', '비상 연락망'],
                correctAnswer: 3,
                explanation: '작업허가서에는 작업 정보, 안전 조치, 비상 연락망 등이 필요하며 혈액형은 필수가 아닙니다.'
            },
            {
                id: 'qsp_cf2_002',
                question: '밀폐공간 작업허가서의 유효 기간은?',
                options: ['1년', '1개월', '해당 작업 당일만 유효', '무기한', '1주일'],
                correctAnswer: 2,
                explanation: '밀폐공간 작업허가서는 해당 작업 당일에만 유효하며, 매일 새로 발급해야 합니다.'
            },
            {
                id: 'qsp_cf2_003',
                question: '작업허가서 발급 전 반드시 선행되어야 하는 절차는?',
                options: ['작업자 교육만', '사전 가스 측정 및 환기 조치', '장비 도색', '작업복 세탁', '회의실 예약'],
                correctAnswer: 1,
                explanation: '작업허가서 발급 전 반드시 사전 가스 측정과 환기 조치를 완료해야 합니다.'
            },
            {
                id: 'qsp_cf2_004',
                question: '밀폐공간 작업 시 감시인의 배치 기준은?',
                options: ['선택 사항', '작업자 5명당 1명', '밀폐공간 입구에 항시 1명 이상 배치', '관리감독자가 겸임', '교대 없이 종일 근무'],
                correctAnswer: 2,
                explanation: '밀폐공간 입구에는 항시 감시인 1명 이상을 배치해야 합니다.'
            },
            {
                id: 'qsp_cf2_005',
                question: '작업 중 가스 농도가 변화했을 때 올바른 조치는?',
                options: ['작업 계속', '즉시 작업 중단, 대피, 재측정 후 안전 확인 시 재개', '환기만 강화', '마스크만 착용', '작업 속도를 높여 빨리 끝냄'],
                correctAnswer: 1,
                explanation: '가스 농도 변화 시 즉시 작업을 중단하고 대피한 후, 재측정하여 안전이 확인되면 재개합니다.'
            },
            {
                id: 'qsp_cf2_006',
                question: '밀폐공간 환기 방법 중 가장 효과적인 것은?',
                options: ['자연 환기만', '강제 급배기 환기', '선풍기', '문을 열어둔다', '에어컨 가동'],
                correctAnswer: 1,
                explanation: '밀폐공간에서는 강제 급배기 환기가 가장 효과적으로 유해가스를 제거합니다.'
            },
            {
                id: 'qsp_cf2_007',
                question: '작업허가서 관리 담당자(밀폐담당자)의 책임이 아닌 것은?',
                options: ['작업허가서 발급 관리', '가스 측정 결과 확인', '안전 조치 이행 확인', '작업자 개인 일정 관리', '비상시 구조 지휘'],
                correctAnswer: 3,
                explanation: '밀폐담당자는 작업허가서, 가스 측정, 안전 조치, 비상 구조 등을 책임지며 개인 일정 관리는 해당되지 않습니다.'
            }
        ]
    },
    {
        id: 'edu_sp_confined_03',
        specializationId: 'confinedSpaceManager',
        title: '밀폐공간 비상대응 절차',
        description: '밀폐공간 사고 발생 시 비상대응 절차와 구조 방법을 학습합니다.',
        videoUrl: '/videos/specialization/confined_emergency.mp4',
        youtubeVideoId: 'zbd3j3Okwfs',
        thumbnailUrl: '/images/education/confined_emergency_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 3,
        quiz: [
            {
                id: 'qsp_cf3_001',
                question: '밀폐공간에서 의식을 잃은 작업자 발견 시 최우선 행동은?',
                options: ['즉시 뛰어들어 구조', '119 신고 및 비상 연락, 보호구 착용 후 구조', '큰 소리로 이름을 부른다', '물을 뿌린다', '다음 날 처리'],
                correctAnswer: 1,
                explanation: '먼저 119에 신고하고 비상 연락을 한 후, 반드시 보호구를 착용하고 구조해야 합니다.'
            },
            {
                id: 'qsp_cf3_002',
                question: '밀폐공간 구조 시 절대 해서는 안 되는 행동은?',
                options: ['송기마스크 착용', '구명줄 연결', '보호구 없이 진입', '119 신고', '감시인에게 알림'],
                correctAnswer: 2,
                explanation: '보호구 없이 밀폐공간에 진입하면 구조자도 피해를 당할 수 있어 절대 금지입니다.'
            },
            {
                id: 'qsp_cf3_003',
                question: '밀폐공간 비상 구조 장비로 반드시 비치해야 하는 것은?',
                options: ['송기마스크, 구명줄, 구조용 삼각대', '일반 마스크', '손전등만', '밧줄만', '소화기만'],
                correctAnswer: 0,
                explanation: '밀폐공간에는 송기마스크, 구명줄, 구조용 삼각대 등의 비상 구조 장비를 반드시 비치해야 합니다.'
            },
            {
                id: 'qsp_cf3_004',
                question: '밀폐공간 사고 시 2차 재해를 방지하기 위한 조치는?',
                options: ['모든 사람이 구조에 참여', '추가 진입 통제 및 전문 구조대 대기', '구경한다', '작업을 계속한다', '환기를 중단한다'],
                correctAnswer: 1,
                explanation: '2차 재해 방지를 위해 추가 진입을 통제하고 전문 구조대를 대기시켜야 합니다.'
            },
            {
                id: 'qsp_cf3_005',
                question: '구조된 질식 환자에 대한 응급 처치로 올바른 것은?',
                options: ['물을 마시게 한다', '신선한 공기가 있는 곳으로 이동 후 기도 확보 및 산소 공급', '밀폐공간 안에서 치료', '운동을 시킨다', '차가운 물을 끼얹는다'],
                correctAnswer: 1,
                explanation: '질식 환자는 즉시 신선한 공기가 있는 곳으로 이동시키고 기도 확보 및 산소를 공급합니다.'
            },
            {
                id: 'qsp_cf3_006',
                question: '밀폐공간 비상대응 훈련의 실시 주기는?',
                options: ['5년에 1회', '훈련 불필요', '반기 1회 이상', '10년에 1회', '사고 발생 시에만'],
                correctAnswer: 2,
                explanation: '밀폐공간 비상대응 훈련은 반기(6개월) 1회 이상 실시해야 합니다.'
            },
            {
                id: 'qsp_cf3_007',
                question: '밀폐담당자가 비상 상황 시 가장 먼저 확인해야 할 것은?',
                options: ['출퇴근 기록', '밀폐공간 내 잔류 인원 수와 위치', '장비 가격', '날씨', '다음 작업 일정'],
                correctAnswer: 1,
                explanation: '비상 시 밀폐공간 내 잔류 인원 수와 위치를 가장 먼저 파악해야 효과적인 구조가 가능합니다.'
            }
        ]
    },

    // ===== 화재감시자 교육 =====
    {
        id: 'edu_sp_fire_01',
        specializationId: 'fireWatcher',
        title: '화기작업 안전관리 기초',
        description: '화기작업의 종류, 화재 위험요인, 화재감시자의 역할과 책임을 학습합니다.',
        videoUrl: '/videos/specialization/fire_basics.mp4',
        youtubeVideoId: 'e3Gti3_K2Fk',
        thumbnailUrl: '/images/education/fire_basics_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 1,
        quiz: [
            {
                id: 'qsp_f1_001',
                question: '[placeholder] 화기작업 시 화재감시자의 주요 역할은?',
                options: ['작업 지시', '화재 감시 및 초기 대응', '장비 운반', '식사 준비', '출퇴근 관리'],
                correctAnswer: 1,
                explanation: '[placeholder] 화재감시자는 화기작업 중 화재 발생을 감시하고 초기 대응을 담당합니다.'
            },
            {
                id: 'qsp_f1_002',
                question: '[placeholder] 화기작업 전 확인해야 할 안전 조치는?',
                options: ['날씨 확인', '주변 가연물 제거 및 소화기 비치', '작업 복장 확인', '점심 메뉴 확인', '퇴근 시간 확인'],
                correctAnswer: 1,
                explanation: '[placeholder] 화기작업 전 주변 가연물을 제거하고 소화기를 비치해야 합니다.'
            },
            {
                id: 'qsp_f1_003',
                question: '[placeholder] 소화기 사용 방법으로 올바른 것은?',
                options: ['불에 직접 던진다', '안전핀을 뽑고 호스를 불의 아래쪽에 향해 분사', '거꾸로 들고 사용', '뚜껑을 열고 붓는다', '물을 먼저 뿌린 후 사용'],
                correctAnswer: 1,
                explanation: '[placeholder] 소화기는 안전핀을 뽑고 호스를 불의 아래쪽에 향해 분사합니다.'
            },
            {
                id: 'qsp_f1_004',
                question: '[placeholder] 용접 작업 시 화재 예방 조치로 적절한 것은?',
                options: ['환기만 하면 된다', '용접 불티 비산 방지 덮개 설치', '보안경만 착용', '작업 후 바로 퇴근', '소화기 없이 작업'],
                correctAnswer: 1,
                explanation: '[placeholder] 용접 작업 시 불티 비산 방지 덮개를 설치해야 합니다.'
            },
            {
                id: 'qsp_f1_005',
                question: '[placeholder] 화재감시자의 감시 범위는?',
                options: ['작업자 1m 이내', '화기작업 반경 11m 이내', '건물 전체', '작업장 출입구만', '사무실 내부만'],
                correctAnswer: 1,
                explanation: '[placeholder] 화재감시자는 화기작업 반경 11m 이내를 감시해야 합니다.'
            },
            {
                id: 'qsp_f1_006',
                question: '[placeholder] 화기작업 종료 후 화재감시 시간은?',
                options: ['즉시 종료', '작업 종료 후 최소 30분 이상', '5분', '다음 날까지', '1시간 후 확인'],
                correctAnswer: 1,
                explanation: '[placeholder] 화기작업 종료 후 최소 30분 이상 화재감시를 계속해야 합니다.'
            },
            {
                id: 'qsp_f1_007',
                question: '[placeholder] 화재 발생 시 초기 대응 순서로 올바른 것은?',
                options: ['대피 → 신고 → 소화', '신고 → 초기소화 → 대피 알림', '소화 → 대피 → 보고', '보고서 작성 → 신고', '아무것도 하지 않는다'],
                correctAnswer: 1,
                explanation: '[placeholder] 화재 발생 시 신고 → 초기소화 → 대피 알림 순서로 대응합니다.'
            }
        ]
    },
    {
        id: 'edu_sp_fire_02',
        specializationId: 'fireWatcher',
        title: '화재감시 실무 및 비상대응',
        description: '화재감시 실무 절차, 소화 장비 사용법, 비상 대응 방법을 학습합니다.',
        videoUrl: '/videos/specialization/fire_practice.mp4',
        youtubeVideoId: 'BgJ2p9zdXJk',
        thumbnailUrl: '/images/education/fire_practice_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 2,
        quiz: [
            {
                id: 'qsp_f2_001',
                question: '[placeholder] 화기작업허가서에 반드시 포함되어야 할 항목은?',
                options: ['작업자 취미', '화재감시자 지정 및 소화장비 배치', '점심 메뉴', '날씨 예보', '작업자 혈액형'],
                correctAnswer: 1,
                explanation: '[placeholder] 화기작업허가서에는 화재감시자 지정 및 소화장비 배치가 포함되어야 합니다.'
            },
            {
                id: 'qsp_f2_002',
                question: '[placeholder] 가스 용접 시 가장 주의해야 할 사항은?',
                options: ['작업 속도', '가스 누출 점검 및 역화 방지', '용접봉 색상', '작업복 색상', '배경 음악'],
                correctAnswer: 1,
                explanation: '[placeholder] 가스 용접 시 가스 누출 점검 및 역화 방지가 가장 중요합니다.'
            },
            {
                id: 'qsp_f2_003',
                question: '[placeholder] 분말소화기의 적정 방사 거리는?',
                options: ['1m', '3~5m', '10m', '20m', '50m'],
                correctAnswer: 1,
                explanation: '[placeholder] 분말소화기의 적정 방사 거리는 3~5m입니다.'
            },
            {
                id: 'qsp_f2_004',
                question: '[placeholder] 화재감시자가 휴대해야 할 필수 장비가 아닌 것은?',
                options: ['소화기', '무전기/통신장비', '개인 노트북', '방화포', '경보장치'],
                correctAnswer: 2,
                explanation: '[placeholder] 개인 노트북은 화재감시자의 필수 휴대 장비가 아닙니다.'
            },
            {
                id: 'qsp_f2_005',
                question: '[placeholder] 전기 화재(C급) 시 사용해야 할 소화기 종류는?',
                options: ['물 소화기', 'CO2 소화기 또는 분말소화기', '포소화기', '산소 소화기', '모래만 사용'],
                correctAnswer: 1,
                explanation: '[placeholder] 전기 화재에는 CO2 소화기 또는 분말소화기를 사용합니다.'
            },
            {
                id: 'qsp_f2_006',
                question: '[placeholder] 비상 대피 경로의 조건으로 적절한 것은?',
                options: ['좁을수록 좋다', '항상 개방되고 장애물이 없어야 함', '잠겨 있어야 한다', '경사가 급해야 한다', '어두워야 한다'],
                correctAnswer: 1,
                explanation: '[placeholder] 비상 대피 경로는 항상 개방되고 장애물이 없어야 합니다.'
            },
            {
                id: 'qsp_f2_007',
                question: '[placeholder] 화재 발생 시 연기 속에서의 대피 방법은?',
                options: ['서서 빠르게 뛴다', '낮은 자세로 젖은 수건으로 코와 입을 막고 이동', '엘리베이터 이용', '창문으로 뛰어내린다', '그 자리에서 기다린다'],
                correctAnswer: 1,
                explanation: '[placeholder] 연기 속에서는 낮은 자세로 젖은 수건으로 코와 입을 막고 이동합니다.'
            }
        ]
    },

    // ===== 안전담당자 교육 =====
    {
        id: 'edu_sp_safety_01',
        specializationId: 'safetyOfficer',
        title: '위험성 평가 기초',
        description: '산업 현장의 위험성 평가 개념, 절차, 실무 적용 방법을 학습합니다.',
        videoUrl: '/videos/specialization/safety_risk.mp4',
        youtubeVideoId: 'YvPWY0lwatU',
        thumbnailUrl: '/images/education/safety_risk_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 1,
        quiz: [
            {
                id: 'qsp_so1_001',
                question: '[placeholder] 위험성 평가의 정의로 올바른 것은?',
                options: ['작업 속도 평가', '유해위험요인을 파악하고 위험성을 결정하여 감소대책을 수립하는 것', '직원 능력 평가', '장비 가격 평가', '건물 외관 평가'],
                correctAnswer: 1,
                explanation: '[placeholder] 위험성 평가는 유해위험요인을 파악하고 위험성을 결정하여 감소대책을 수립하는 것입니다.'
            },
            {
                id: 'qsp_so1_002',
                question: '[placeholder] 위험성 평가의 4단계 절차 순서는?',
                options: ['대책수립→평가→파악→실행', '유해위험요인 파악→위험성 추정→위험성 결정→감소대책 수립', '실행→파악→평가→대책', '보고→파악→평가→종료', '감소대책→파악→추정→결정'],
                correctAnswer: 1,
                explanation: '[placeholder] 위험성 평가는 유해위험요인 파악→위험성 추정→위험성 결정→감소대책 수립 순서입니다.'
            },
            {
                id: 'qsp_so1_003',
                question: '[placeholder] 위험성 평가 실시 시기로 적절하지 않은 것은?',
                options: ['최초 평가', '정기 평가', '수시 평가', '퇴근 후 개인 시간', '작업 변경 시'],
                correctAnswer: 3,
                explanation: '[placeholder] 퇴근 후 개인 시간은 위험성 평가 실시 시기가 아닙니다.'
            },
            {
                id: 'qsp_so1_004',
                question: '[placeholder] 위험성의 크기를 결정하는 요소 2가지는?',
                options: ['비용과 시간', '가능성(빈도)과 중대성(강도)', '날씨와 온도', '인원수와 면적', '장비 수와 종류'],
                correctAnswer: 1,
                explanation: '[placeholder] 위험성의 크기는 가능성(빈도)과 중대성(강도)으로 결정합니다.'
            },
            {
                id: 'qsp_so1_005',
                question: '[placeholder] 위험성 감소대책 수립 시 우선순위가 가장 높은 것은?',
                options: ['개인보호구 지급', '위험원 제거(본질적 대책)', '경고 표지 부착', '작업 절차서 작성', '교육 실시'],
                correctAnswer: 1,
                explanation: '[placeholder] 위험원 제거(본질적 대책)가 가장 우선순위가 높습니다.'
            },
            {
                id: 'qsp_so1_006',
                question: '[placeholder] 위험성 평가에 참여해야 하는 사람은?',
                options: ['사업주만', '안전관리자만', '해당 작업에 종사하는 근로자를 포함한 관계자', '외부 감사관만', '경비원만'],
                correctAnswer: 2,
                explanation: '[placeholder] 해당 작업에 종사하는 근로자를 포함한 관계자가 참여해야 합니다.'
            },
            {
                id: 'qsp_so1_007',
                question: '[placeholder] 위험성 평가 결과의 기록 보존 기간은?',
                options: ['1개월', '6개월', '3년', '1주일', '기록 불필요'],
                correctAnswer: 2,
                explanation: '[placeholder] 위험성 평가 결과는 3년간 보존해야 합니다.'
            }
        ]
    },
    {
        id: 'edu_sp_safety_02',
        specializationId: 'safetyOfficer',
        title: '안전 점검 및 관리 실무',
        description: '현장 안전 점검 절차, 안전 관리 문서 작성, 법규 준수 사항을 학습합니다.',
        videoUrl: '/videos/specialization/safety_inspection.mp4',
        youtubeVideoId: 'ErCRkHfmRD8',
        thumbnailUrl: '/images/education/safety_inspection_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 2,
        quiz: [
            {
                id: 'qsp_so2_001',
                question: '[placeholder] 안전 점검의 종류가 아닌 것은?',
                options: ['정기 점검', '수시 점검', '특별 점검', '개인 취미 점검', '일상 점검'],
                correctAnswer: 3,
                explanation: '[placeholder] 개인 취미 점검은 안전 점검의 종류가 아닙니다.'
            },
            {
                id: 'qsp_so2_002',
                question: '[placeholder] 안전보건관리체제에서 안전담당자의 역할은?',
                options: ['급여 관리', '현장 안전 점검 및 위험요인 개선', '마케팅', '인사 관리', '재무 관리'],
                correctAnswer: 1,
                explanation: '[placeholder] 안전담당자는 현장 안전 점검 및 위험요인 개선을 담당합니다.'
            },
            {
                id: 'qsp_so2_003',
                question: '[placeholder] 작업 중지 권한을 행사할 수 있는 상황은?',
                options: ['점심시간', '급박한 위험이 예상되는 경우', '날씨가 좋은 날', '작업이 지루할 때', '퇴근 시간'],
                correctAnswer: 1,
                explanation: '[placeholder] 급박한 위험이 예상되는 경우 작업 중지 권한을 행사할 수 있습니다.'
            },
            {
                id: 'qsp_so2_004',
                question: '[placeholder] 안전보건교육 실시 기록에 포함되어야 할 사항이 아닌 것은?',
                options: ['교육 일시', '교육 내용', '교육 대상자', '교육자의 취미', '교육 강사'],
                correctAnswer: 3,
                explanation: '[placeholder] 교육자의 취미는 안전보건교육 기록 사항이 아닙니다.'
            },
            {
                id: 'qsp_so2_005',
                question: '[placeholder] 안전 표지의 종류 중 "경고 표지"의 색상은?',
                options: ['파란색', '노란색 바탕에 검정 기호', '초록색', '흰색', '보라색'],
                correctAnswer: 1,
                explanation: '[placeholder] 경고 표지는 노란색 바탕에 검정 기호로 표시합니다.'
            },
            {
                id: 'qsp_so2_006',
                question: '[placeholder] MSDS(물질안전보건자료)를 비치해야 하는 장소는?',
                options: ['사장실만', '해당 화학물질 취급 작업장', '주차장', '식당', '휴게실만'],
                correctAnswer: 1,
                explanation: '[placeholder] MSDS는 해당 화학물질 취급 작업장에 비치해야 합니다.'
            },
            {
                id: 'qsp_so2_007',
                question: '[placeholder] 근로자 건강진단의 종류가 아닌 것은?',
                options: ['일반건강진단', '특수건강진단', '배치전건강진단', '미용건강진단', '수시건강진단'],
                correctAnswer: 3,
                explanation: '[placeholder] 미용건강진단은 근로자 건강진단의 종류가 아닙니다.'
            }
        ]
    },
    {
        id: 'edu_sp_safety_03',
        specializationId: 'safetyOfficer',
        title: '사고 대응 및 재발 방지',
        description: '산업 사고 발생 시 대응 절차, 사고 조사 방법, 재발 방지 대책 수립을 학습합니다.',
        videoUrl: '/videos/specialization/safety_emergency.mp4',
        youtubeVideoId: 't6JFsRvOvUI',
        thumbnailUrl: '/images/education/safety_emergency_thumbnail.png',
        duration: 900,
        requiredWatchTime: 810,
        legalHours: 0.25,
        requiredScore: 90,
        points: 150,
        exp: 50,
        order: 3,
        quiz: [
            {
                id: 'qsp_so3_001',
                question: '[placeholder] 산업재해 발생 시 사업주의 1차 의무는?',
                options: ['보험 청구', '재해자 구호 및 재해 확대 방지', '언론 대응', '법률 자문', '시설 철거'],
                correctAnswer: 1,
                explanation: '[placeholder] 산업재해 발생 시 재해자 구호 및 재해 확대 방지가 1차 의무입니다.'
            },
            {
                id: 'qsp_so3_002',
                question: '[placeholder] 중대재해 발생 시 보고해야 할 기관은?',
                options: ['시청', '관할 지방고용노동관서', '경찰서', '소방서만', '세무서'],
                correctAnswer: 1,
                explanation: '[placeholder] 중대재해는 관할 지방고용노동관서에 보고해야 합니다.'
            },
            {
                id: 'qsp_so3_003',
                question: '[placeholder] 사고 조사의 목적으로 가장 적절한 것은?',
                options: ['책임자 처벌', '원인 규명 및 재발 방지 대책 수립', '보험금 산정', '작업 중단', '인력 감축'],
                correctAnswer: 1,
                explanation: '[placeholder] 사고 조사의 목적은 원인 규명 및 재발 방지 대책 수립입니다.'
            },
            {
                id: 'qsp_so3_004',
                question: '[placeholder] 하인리히 법칙(1:29:300)에서 1은 무엇을 의미하는가?',
                options: ['경미한 사고', '중대 재해', '아차 사고', '무재해', '안전 점검'],
                correctAnswer: 1,
                explanation: '[placeholder] 하인리히 법칙에서 1은 중대 재해를 의미합니다.'
            },
            {
                id: 'qsp_so3_005',
                question: '[placeholder] 재발 방지 대책의 수립 원칙이 아닌 것은?',
                options: ['근본 원인 제거', '기술적 대책 우선', '관리적 대책 보완', '책임자 해고', '교육 훈련 강화'],
                correctAnswer: 3,
                explanation: '[placeholder] 책임자 해고는 재발 방지 대책의 원칙이 아닙니다.'
            },
            {
                id: 'qsp_so3_006',
                question: '[placeholder] 산업재해 기록 보존 기간은?',
                options: ['1개월', '6개월', '3년', '1주일', '기록 불필요'],
                correctAnswer: 2,
                explanation: '[placeholder] 산업재해 기록은 3년간 보존해야 합니다.'
            },
            {
                id: 'qsp_so3_007',
                question: '[placeholder] 비상조치계획에 포함되어야 할 사항이 아닌 것은?',
                options: ['비상 연락 체계', '대피 경로 및 방법', '응급 처치 절차', '회식 계획', '비상 장비 위치'],
                correctAnswer: 3,
                explanation: '[placeholder] 회식 계획은 비상조치계획에 포함되는 사항이 아닙니다.'
            }
        ]
    }
];

/**
 * 전직 ID로 교육 목록 조회
 */
export const getEducationsBySpecialization = (specId) => {
    return specializationEducations
        .filter(edu => edu.specializationId === specId)
        .sort((a, b) => a.order - b.order);
};

/**
 * 교육 ID로 교육 콘텐츠 조회
 */
export const getSpecializationEducationById = (eduId) => {
    return specializationEducations.find(edu => edu.id === eduId);
};

/**
 * 전체 전직 교육 목록 조회
 */
export const getAllSpecializationEducations = () => {
    return specializationEducations;
};

export default {
    SPECIALIZATION_EDUCATION_CONFIG,
    specializationEducations,
    getEducationsBySpecialization,
    getSpecializationEducationById,
    getAllSpecializationEducations
};
