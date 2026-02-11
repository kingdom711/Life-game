/**
 * 전직(특수역할) 데이터
 * 기술인이 특수 교육을 이수한 후 전환할 수 있는 전문 역할 정의
 *
 * 전직 가능 역할:
 * - 유도원: 중장비/차량 안전 유도
 * - 신호수: 크레인 등 양중기 수신호
 * - 밀폐담당자: 밀폐공간 작업 안전 관리
 */

export const SPECIALIZATION_STATUS = {
    LOCKED: 'locked',           // 레벨 미달 등 조건 미충족
    AVAILABLE: 'available',     // 조건 충족, 교육 시작 가능
    IN_PROGRESS: 'in_progress', // 교육 진행 중
    UNLOCKED: 'unlocked',       // 전직 해금 완료
    ACTIVE: 'active'            // 현재 장착 중
};

export const SPECIALIZATIONS = [
    {
        id: 'signalWorker',
        name: '유도원',
        icon: '🚦',
        color: '#f59e0b',
        bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        parentRole: 'technician',
        description: '중장비 및 차량 이동 시 안전 유도를 담당하는 전문 역할',
        shortDescription: '중장비 안전 유도 전문가',
        unlockRequirements: {
            minLevel: 3,  // Bronze I 이상
            minLevelName: 'Bronze I',
            requiredEducations: ['edu_sp_signal_01', 'edu_sp_signal_02'],
            requiredScore: 90
        },
        features: [
            '중장비 작업 유도 체크리스트 작성',
            '유도 신호 체계 퀘스트',
            '전용 장비 아이템 해금',
            '유도원 전용 일일 퀘스트'
        ],
        bonuses: {
            pointMultiplier: 1.15,
            exclusiveQuests: true,
            specialBadge: 'signal_worker_badge'
        },
        classChangeReward: {
            points: 500,
            exp: 100,
            title: '유도원 자격 취득'
        }
    },
    {
        id: 'craneSigner',
        name: '신호수',
        icon: '🏗️',
        color: '#ef4444',
        bgGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
        parentRole: 'technician',
        description: '크레인 등 양중기 작업 시 수신호를 담당하는 전문 역할',
        shortDescription: '양중기 수신호 전문가',
        unlockRequirements: {
            minLevel: 4,  // Silver III 이상
            minLevelName: 'Silver III',
            requiredEducations: ['edu_sp_crane_01', 'edu_sp_crane_02'],
            requiredScore: 90
        },
        features: [
            '양중기 신호 체크리스트 작성',
            '크레인 작업 신호 퀘스트',
            '전용 장비 아이템 해금',
            '신호수 전용 일일 퀘스트'
        ],
        bonuses: {
            pointMultiplier: 1.2,
            exclusiveQuests: true,
            specialBadge: 'crane_signer_badge'
        },
        classChangeReward: {
            points: 800,
            exp: 150,
            title: '신호수 자격 취득'
        }
    },
    {
        id: 'confinedSpaceManager',
        name: '밀폐담당자',
        icon: '🚧',
        color: '#6366f1',
        bgGradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        parentRole: 'technician',
        description: '밀폐공간 작업의 안전 관리를 전담하는 전문 역할',
        shortDescription: '밀폐공간 안전 관리 전문가',
        unlockRequirements: {
            minLevel: 5,  // Silver II 이상
            minLevelName: 'Silver II',
            requiredEducations: ['edu_sp_confined_01', 'edu_sp_confined_02', 'edu_sp_confined_03'],
            requiredScore: 90
        },
        features: [
            '밀폐공간 작업허가서 관리',
            '산소농도 측정 체크리스트',
            '전용 장비 아이템 해금',
            '밀폐담당자 전용 일일 퀘스트'
        ],
        bonuses: {
            pointMultiplier: 1.25,
            exclusiveQuests: true,
            specialBadge: 'confined_space_badge'
        },
        classChangeReward: {
            points: 1200,
            exp: 200,
            title: '밀폐담당자 자격 취득'
        }
    }
];

/**
 * ID로 전직 데이터 조회
 */
export const getSpecializationById = (specId) => {
    return SPECIALIZATIONS.find(spec => spec.id === specId);
};

/**
 * 부모 역할별 전직 목록 조회
 */
export const getSpecializationsByRole = (roleId) => {
    return SPECIALIZATIONS.filter(spec => spec.parentRole === roleId);
};

/**
 * 전직 색상 조회
 */
export const getSpecializationColor = (specId) => {
    const spec = getSpecializationById(specId);
    return spec ? spec.color : '#64748b';
};

export default {
    SPECIALIZATION_STATUS,
    SPECIALIZATIONS,
    getSpecializationById,
    getSpecializationsByRole,
    getSpecializationColor
};
