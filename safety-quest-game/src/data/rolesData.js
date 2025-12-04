export const roles = [
    {
        id: 'technician',
        name: '기술인 (작업자)',
        description: '현장에서 직접 작업을 수행하는 역할',
        icon: '👷',
        image: '/role_technician.png',
        color: '#3b82f6',
        features: [
            '체크리스트 작성 및 제출',
            '작업 사진 업로드',
            '안전용품 착용',
            '일일 안전 점검'
        ]
    },
    {
        id: 'supervisor',
        name: '관리감독자',
        description: '작업자를 관리하고 체크리스트를 검토하는 역할',
        icon: '👨‍💼',
        image: '/role_supervisor.png',
        color: '#8b5cf6',
        features: [
            '체크리스트 검토 및 승인',
            '위험 항목 확인',
            '작업자 관리',
            '안전 조치 요청'
        ]
    },
    {
        id: 'safetyManager',
        name: '안전관리자',
        description: '전체 현장의 안전을 총괄 관리하는 역할',
        icon: '🛡️',
        image: '/role_safety_manager.png',
        color: '#10b981',
        features: [
            '위험현황 모니터링',
            'AI 위험도 분석 확인',
            '조치 기록 및 완료 처리',
            '안전 통계 분석'
        ]
    }
];

export const getRoleById = (roleId) => {
    return roles.find(role => role.id === roleId);
};

export const getRoleColor = (roleId) => {
    const role = getRoleById(roleId);
    return role ? role.color : '#64748b';
};
