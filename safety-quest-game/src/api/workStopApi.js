import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const workStopApi = {
    /**
     * 작업중지 신고 등록
     */
    createReport: async (data) => {
        if (authApi.usesSupabase) {
            const { data: id, error } = await requireSupabase().rpc('create_work_stop_report', {
                p_hazard_type: data.hazardType, p_description: data.description || '',
                p_zone: data.zone || '', p_is_anonymous: Boolean(data.isAnonymous),
                p_photo_path: data.photoUrl || null,
            });
            if (error) throw error;
            return { data: { ...data, id } };
        }
        return apiClient.post('/work-stop-reports', data);
    },

    /**
     * 작업중지 신고 목록 조회
     * @param {string} [status] - 상태 필터 (reported, confirmed, investigating, resolved, resumed)
     */
    getReports: async (status) => {
        if (authApi.usesSupabase) {
            let query = requireSupabase().from('work_stop_reports').select('*, work_stop_status_history(*)').order('created_at', { ascending: false });
            if (status) query = query.eq('status', status);
            const { data, error } = await query;
            if (error) throw error;
            return { data: data.map((row) => ({ ...row, createdAt: row.created_at, updatedAt: row.updated_at, statusHistory: row.work_stop_status_history || [] })) };
        }
        const query = status ? `?status=${status}` : '';
        return apiClient.get(`/work-stop-reports${query}`);
    },

    /**
     * 특정 작업중지 신고 조회
     */
    getReportById: async (id) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().from('work_stop_reports').select('*, work_stop_status_history(*)').eq('id', id).single();
            if (error) throw error;
            return { data: { ...data, createdAt: data.created_at, updatedAt: data.updated_at, statusHistory: data.work_stop_status_history || [] } };
        }
        return apiClient.get(`/work-stop-reports/${id}`);
    },

    /**
     * 작업중지 신고 상태 업데이트 (누구든 가능)
     */
    updateStatus: async (reportId, newStatus, updaterName, note = '') => {
        if (authApi.usesSupabase) {
            const { error } = await requireSupabase().rpc('transition_work_stop', { p_id: reportId, p_status: newStatus, p_note: note || null });
            if (error) throw error;
            return workStopApi.getReportById(reportId);
        }
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
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().from('work_stop_reports').select('status, created_at');
            if (error) throw error;
            const resolved = data.filter((r) => r.status === 'resolved' || r.status === 'resumed').length;
            return { data: { totalReports: data.length, resolvedCount: resolved, resolutionRate: data.length ? Math.round(resolved * 100 / data.length) : 100 } };
        }
        return apiClient.get('/work-stop-reports/stats');
    },

    /**
     * 보호 기간 조회
     * @param {string} [workerName] - 특정 근로자 필터
     */
    getProtections: async (workerName) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().from('work_stop_protections').select('*').gte('end_date', new Date().toISOString());
            if (error) throw error;
            return { data };
        }
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
