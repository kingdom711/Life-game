/**
 * 작업중지권 관리 매니저
 *
 * 기능:
 * - 작업중지 신고 등록/조회
 * - 신고 상태 관리 (신고→접수확인→조사중→해결→작업재개)
 * - 보복 방지 모니터링 (30일 보호 기간)
 * - 익명/실명 신고 지원
 * - 오프라인 저장 → 연결 후 동기화
 * - API 우선 + localStorage 폴백 (Async 함수)
 */

import workStopApi from '../api/workStopApi';

const STORAGE_KEYS = {
    WORK_STOP_REPORTS: 'safety_quest_work_stop_reports',
    WORK_STOP_PROTECTION: 'safety_quest_work_stop_protection',
    RETALIATION_REPORTS: 'safety_quest_retaliation_reports'
};

// 위험 유형
export const HAZARD_TYPES = [
    { id: 'fall', label: '추락 위험', icon: '🪜', color: '#ef4444' },
    { id: 'pinch', label: '끼임 위험', icon: '⚙️', color: '#eab308' },
    { id: 'collision', label: '부딪힘 위험', icon: '⚠️', color: '#f59e0b' },
    { id: 'electric', label: '전기 위험', icon: '⚡', color: '#3b82f6' },
    { id: 'fire', label: '화재 위험', icon: '🔥', color: '#dc2626' },
    { id: 'confined', label: '밀폐공간 위험', icon: '🚧', color: '#6366f1' },
    { id: 'other', label: '기타', icon: '🔶', color: '#64748b' }
];

// 신고 상태
export const REPORT_STATUS = {
    REPORTED: 'reported',         // 신고 완료
    CONFIRMED: 'confirmed',       // 접수 확인
    INVESTIGATING: 'investigating', // 조사 중
    RESOLVED: 'resolved',         // 위험 해결
    RESUMED: 'resumed'            // 작업 재개
};

export const REPORT_STATUS_INFO = {
    [REPORT_STATUS.REPORTED]: { label: '신고', color: '#ef4444', icon: '🚨' },
    [REPORT_STATUS.CONFIRMED]: { label: '접수확인', color: '#f59e0b', icon: '📋' },
    [REPORT_STATUS.INVESTIGATING]: { label: '조사 중', color: '#3b82f6', icon: '🔍' },
    [REPORT_STATUS.RESOLVED]: { label: '위험 해결', color: '#22c55e', icon: '✅' },
    [REPORT_STATUS.RESUMED]: { label: '작업 재개', color: '#14b8a6', icon: '🔄' }
};

const parseJSON = (value, defaultValue = null) => {
    if (value === null || value === undefined) return defaultValue;
    try { return JSON.parse(value); } catch { return defaultValue; }
};

/**
 * 작업중지 신고 등록
 */
export const createWorkStopReport = ({
    hazardType,
    description = '',
    zone = '',
    isAnonymous = false,
    reporterName = '',
    photoUrl = null
}) => {
    const reports = getWorkStopReports();
    const now = new Date().toISOString();

    const report = {
        id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        hazardType,
        hazardLabel: HAZARD_TYPES.find(h => h.id === hazardType)?.label || '기타',
        description,
        zone,
        isAnonymous,
        reporterName: isAnonymous ? '익명' : reporterName,
        reporterActualName: reporterName, // 시스템만 보유
        photoUrl,
        status: REPORT_STATUS.REPORTED,
        statusHistory: [
            { status: REPORT_STATUS.REPORTED, timestamp: now, by: reporterName }
        ],
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
        resumedAt: null,
        resolverName: null,
        resolutionNote: null,
        resolutionPhotoUrl: null,
        points: 500 // 용기 포인트
    };

    reports.unshift(report);
    localStorage.setItem(STORAGE_KEYS.WORK_STOP_REPORTS, JSON.stringify(reports));

    // 보호 기간 시작
    startProtectionPeriod(reporterName, report.id);

    return report;
};

/**
 * 작업중지 신고 목록 조회
 */
export const getWorkStopReports = () => {
    return parseJSON(localStorage.getItem(STORAGE_KEYS.WORK_STOP_REPORTS), []);
};

/**
 * 특정 신고 조회
 */
export const getWorkStopReportById = (reportId) => {
    const reports = getWorkStopReports();
    return reports.find(r => r.id === reportId) || null;
};

/**
 * 신고 상태 업데이트
 */
export const updateReportStatus = (reportId, newStatus, updaterName = '', note = '') => {
    const reports = getWorkStopReports();
    const index = reports.findIndex(r => r.id === reportId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    reports[index].status = newStatus;
    reports[index].updatedAt = now;
    reports[index].statusHistory.push({
        status: newStatus,
        timestamp: now,
        by: updaterName,
        note
    });

    if (newStatus === REPORT_STATUS.RESOLVED) {
        reports[index].resolvedAt = now;
        reports[index].resolverName = updaterName;
        reports[index].resolutionNote = note;
    }
    if (newStatus === REPORT_STATUS.RESUMED) {
        reports[index].resumedAt = now;
    }

    localStorage.setItem(STORAGE_KEYS.WORK_STOP_REPORTS, JSON.stringify(reports));
    return reports[index];
};

/**
 * 보호 기간 시작 (30일)
 */
const startProtectionPeriod = (workerName, reportId) => {
    const protections = parseJSON(localStorage.getItem(STORAGE_KEYS.WORK_STOP_PROTECTION), []);
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    protections.push({
        workerName,
        reportId,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true
    });

    localStorage.setItem(STORAGE_KEYS.WORK_STOP_PROTECTION, JSON.stringify(protections));
};

/**
 * 현재 보호 기간 확인
 */
export const getActiveProtections = (workerName = null) => {
    const protections = parseJSON(localStorage.getItem(STORAGE_KEYS.WORK_STOP_PROTECTION), []);
    const now = new Date().toISOString();

    return protections.filter(p => {
        const isActive = p.endDate > now;
        if (workerName) return isActive && p.workerName === workerName;
        return isActive;
    });
};

/**
 * 보복 신고
 */
export const createRetaliationReport = ({
    workerName,
    protectionId,
    retaliationType,
    description,
    evidence = null
}) => {
    const reports = parseJSON(localStorage.getItem(STORAGE_KEYS.RETALIATION_REPORTS), []);
    const now = new Date().toISOString();

    const report = {
        id: `ret_${Date.now()}`,
        workerName,
        protectionId,
        retaliationType,
        description,
        evidence,
        createdAt: now,
        status: 'reported'
    };

    reports.unshift(report);
    localStorage.setItem(STORAGE_KEYS.RETALIATION_REPORTS, JSON.stringify(reports));
    return report;
};

/**
 * 보복 신고 목록 조회
 */
export const getRetaliationReports = () => {
    return parseJSON(localStorage.getItem(STORAGE_KEYS.RETALIATION_REPORTS), []);
};

/**
 * 통계 계산
 */
export const getWorkStopStats = () => {
    const reports = getWorkStopReports();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentReports = reports.filter(r => new Date(r.createdAt) >= thirtyDaysAgo);
    const resolvedReports = recentReports.filter(r =>
        r.status === REPORT_STATUS.RESOLVED || r.status === REPORT_STATUS.RESUMED
    );

    // 평균 대응 시간 (분)
    const responseTimes = recentReports
        .filter(r => r.statusHistory.length > 1)
        .map(r => {
            const reportTime = new Date(r.statusHistory[0].timestamp);
            const confirmTime = new Date(r.statusHistory[1].timestamp);
            return (confirmTime - reportTime) / (1000 * 60);
        });

    const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length)
        : 0;

    const retaliationReports = getRetaliationReports().filter(r =>
        new Date(r.createdAt) >= thirtyDaysAgo
    );

    return {
        totalReports: reports.length,
        recentReports: recentReports.length,
        resolvedCount: resolvedReports.length,
        resolutionRate: recentReports.length > 0
            ? Math.round((resolvedReports.length / recentReports.length) * 100)
            : 100,
        avgResponseTime,
        retaliationCount: retaliationReports.length,
        activeProtections: getActiveProtections().length
    };
};

// ============================================================
// Async 함수 (API 우선 + localStorage 폴백)
// 백엔드 서버 연결 시 데이터가 공유되어 기술인/관리감독자/안전관리자 모두 확인 가능
// ============================================================

/**
 * [Async] 작업중지 신고 등록 — API 우선, 실패 시 localStorage
 */
export const createWorkStopReportAsync = async (params) => {
    // localStorage에는 항상 저장 (오프라인 지원)
    const localReport = createWorkStopReport(params);

    try {
        const response = await workStopApi.createReport({
            ...localReport,
            reporterActualName: params.reporterName // 서버에 실명 전달
        });
        // API 성공 시 서버 ID로 교체
        if (response?.data?.id) {
            const reports = getWorkStopReports();
            const idx = reports.findIndex(r => r.id === localReport.id);
            if (idx !== -1) {
                reports[idx] = { ...reports[idx], ...response.data, _synced: true };
                localStorage.setItem(STORAGE_KEYS.WORK_STOP_REPORTS, JSON.stringify(reports));
                return reports[idx];
            }
        }
        return localReport;
    } catch {
        // API 실패 — localStorage 데이터 사용
        return localReport;
    }
};

/**
 * [Async] 작업중지 신고 목록 조회 — API 우선, 실패 시 localStorage
 */
export const getWorkStopReportsAsync = async () => {
    try {
        const response = await workStopApi.getReports();
        if (response?.data && Array.isArray(response.data)) {
            // API 성공 시 localStorage에도 동기화
            localStorage.setItem(STORAGE_KEYS.WORK_STOP_REPORTS, JSON.stringify(response.data));
            return response.data;
        }
        return getWorkStopReports();
    } catch {
        return getWorkStopReports();
    }
};

/**
 * [Async] 신고 상태 업데이트 — API 우선, 실패 시 localStorage
 * 누구든(기술인/관리감독자/안전관리자) 호출 가능 → 먼저 해결한 사람이 완료 처리
 */
export const updateReportStatusAsync = async (reportId, newStatus, updaterName = '', note = '') => {
    // localStorage에 즉시 반영 (오프라인/빠른 응답)
    const localResult = updateReportStatus(reportId, newStatus, updaterName, note);

    try {
        const response = await workStopApi.updateStatus(reportId, newStatus, updaterName, note);
        if (response?.data) {
            // 서버 응답으로 동기화
            const reports = getWorkStopReports();
            const idx = reports.findIndex(r => r.id === reportId);
            if (idx !== -1) {
                reports[idx] = { ...reports[idx], ...response.data, _synced: true };
                localStorage.setItem(STORAGE_KEYS.WORK_STOP_REPORTS, JSON.stringify(reports));
                return reports[idx];
            }
        }
        return localResult;
    } catch {
        return localResult;
    }
};

/**
 * [Async] 통계 조회 — API 우선, 실패 시 localStorage 기반 계산
 */
export const getWorkStopStatsAsync = async () => {
    try {
        const response = await workStopApi.getStats();
        if (response?.data) return response.data;
        return getWorkStopStats();
    } catch {
        return getWorkStopStats();
    }
};

/**
 * [Async] 보호 기간 조회 — API 우선, 실패 시 localStorage
 */
export const getActiveProtectionsAsync = async (workerName = null) => {
    try {
        const response = await workStopApi.getProtections(workerName);
        if (response?.data && Array.isArray(response.data)) {
            localStorage.setItem(STORAGE_KEYS.WORK_STOP_PROTECTION, JSON.stringify(response.data));
            return response.data;
        }
        return getActiveProtections(workerName);
    } catch {
        return getActiveProtections(workerName);
    }
};

/**
 * 미해결(진행중) 작업중지 건수 조회
 */
export const getActiveWorkStopCount = () => {
    const reports = getWorkStopReports();
    return reports.filter(r =>
        r.status !== REPORT_STATUS.RESOLVED && r.status !== REPORT_STATUS.RESUMED
    ).length;
};

export default {
    HAZARD_TYPES,
    REPORT_STATUS,
    REPORT_STATUS_INFO,
    createWorkStopReport,
    createWorkStopReportAsync,
    getWorkStopReports,
    getWorkStopReportsAsync,
    getWorkStopReportById,
    updateReportStatus,
    updateReportStatusAsync,
    getActiveProtections,
    getActiveProtectionsAsync,
    getWorkStopStats,
    getWorkStopStatsAsync,
    getActiveWorkStopCount,
    createRetaliationReport,
    getRetaliationReports,
};
