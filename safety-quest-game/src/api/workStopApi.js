import apiClient from './apiClient';

const workStopApi = {
    /**
     * 작업중지 신고 등록
     */
    createReport: async (data) => {
        return apiClient.post('/work-stop-reports', data);
    },

    /**
     * 작업중지 신고 목록 조회
     * @param {string} [status] - 상태 필터 (reported, confirmed, investigating, resolved, resumed)
     */
    getReports: async (status) => {
        const query = status ? `?status=${status}` : '';
        return apiClient.get(`/work-stop-reports${query}`);
    },

    /**
     * 특정 작업중지 신고 조회
     */
    getReportById: async (id) => {
        return apiClient.get(`/work-stop-reports/${id}`);
    },

    /**
     * 작업중지 신고 상태 업데이트 (누구든 가능)
     */
    updateStatus: async (reportId, newStatus, updaterName, note = '') => {
        return apiClient.put(`/work-stop-reports/${reportId}/status`, {
            status: newStatus,
            updaterName,
            note
        });
    },

    /**
     * 작업중지 통계 조회
     */
    getStats: async () => {
        return apiClient.get('/work-stop-reports/stats');
    },

    /**
     * 보호 기간 조회
     * @param {string} [workerName] - 특정 근로자 필터
     */
    getProtections: async (workerName) => {
        const query = workerName ? `?worker=${encodeURIComponent(workerName)}` : '';
        return apiClient.get(`/work-stop-reports/protections${query}`);
    },

    /**
     * 보복 신고 등록
     */
    createRetaliationReport: async (data) => {
        return apiClient.post('/work-stop-reports/retaliation', data);
    },
};

export default workStopApi;
