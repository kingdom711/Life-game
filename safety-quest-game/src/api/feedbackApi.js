import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const normalize = (row) => row && ({
    ...row, pagePath: row.page_path, adminReply: row.admin_reply,
    repliedAt: row.replied_at, repliedByName: row.replied_by_name,
    createdAt: row.created_at, authorUsername: row.author_username,
    authorName: row.author_name,
});

const feedbackApi = {
    create: async (data) => {
        if (authApi.usesSupabase) {
            const { data: userData, error: userError } = await requireSupabase().auth.getUser();
            if (userError || !userData.user) throw userError || new Error('로그인이 필요합니다.');
            const { data: row, error } = await requireSupabase().from('feedback_posts').insert({
                user_id: userData.user.id, category: data.category, title: data.title,
                content: data.content, page_path: data.pagePath || null,
            }).select().single();
            if (error) throw error;
            return normalize(row);
        }
        return apiClient.post('/feedback', data);
    },

    getMine: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().from('feedback_posts').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data.map(normalize);
        }
        return apiClient.get('/feedback/me');
    },

    getAll: async (status) => {
        if (authApi.usesSupabase) {
            let query = requireSupabase().from('feedback_posts').select('*').order('created_at', { ascending: false });
            if (status && status !== 'all') query = query.eq('status', status);
            const { data, error } = await query;
            if (error) throw error;
            return data.map(normalize);
        }
        const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
        return apiClient.get(`/admin/feedback${query}`);
    },

    updateStatus: async (postId, status) => {
        if (authApi.usesSupabase) {
            const { error } = await requireSupabase().rpc('admin_update_feedback', { p_id: postId, p_status: status, p_reply: null });
            if (error) throw error;
            return { success: true };
        }
        return apiClient.put(`/admin/feedback/${postId}/status`, { status });
    },

    reply: async (postId, reply) => {
        if (authApi.usesSupabase) {
            const { error } = await requireSupabase().rpc('admin_update_feedback', { p_id: postId, p_status: 'ANSWERED', p_reply: reply });
            if (error) throw error;
            return { success: true };
        }
        return apiClient.post(`/admin/feedback/${postId}/reply`, { reply });
    },

    // 공지 (관리자 작성, 전체 사용자 노출)
    getNotices: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().from('notices').select('*, notice_comments(*)').order('created_at', { ascending: false });
            if (error) throw error;
            return data.map((row) => ({ ...normalize(row), comments: (row.notice_comments || []).map(normalize) }));
        }
        return apiClient.get('/feedback/notices');
    },

    createNotice: async (data) => {
        if (authApi.usesSupabase) {
            const { data: id, error } = await requireSupabase().rpc('admin_create_notice', { p_title: data.title, p_content: data.content });
            if (error) throw error;
            return { id };
        }
        return apiClient.post('/admin/feedback/notice', data);
    },

    deleteNotice: async (postId) => {
        if (authApi.usesSupabase) {
            const { error } = await requireSupabase().rpc('admin_delete_notice', { p_id: postId });
            if (error) throw error;
            return { success: true };
        }
        return apiClient.delete(`/admin/feedback/notice/${postId}`);
    },

    // 공지 댓글
    addNoticeComment: async (postId, content) => {
        if (authApi.usesSupabase) {
            const { data: userData, error: userError } = await requireSupabase().auth.getUser();
            if (userError || !userData.user) throw userError || new Error('로그인이 필요합니다.');
            const { error } = await requireSupabase().from('notice_comments').insert({ notice_id: postId, user_id: userData.user.id, content });
            if (error) throw error;
            return { success: true };
        }
        return apiClient.post(`/feedback/notices/${postId}/comments`, { content });
    },

    deleteNoticeComment: async (postId, commentId) => {
        if (authApi.usesSupabase) {
            const { error } = await requireSupabase().from('notice_comments').delete().eq('id', commentId).eq('notice_id', postId);
            if (error) throw error;
            return { success: true };
        }
        return apiClient.delete(`/feedback/notices/${postId}/comments/${commentId}`);
    },
};

export default feedbackApi;
