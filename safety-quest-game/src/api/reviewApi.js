/**
 * 검토 관련 API
 */

import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const toReview = (row) => ({
    id: row.id,
    checklistId: row.checklist_id ?? row.checklistId,
    reviewerId: row.reviewer_id ?? row.reviewerId,
    reviewerRole: row.reviewer_role ?? row.reviewerRole,
    action: row.action,
    comment: row.comment,
    previousStatus: row.previous_status ?? row.previousStatus,
    newStatus: row.new_status ?? row.newStatus,
    reviewedAt: row.reviewed_at ?? row.reviewedAt,
});

const reviewApi = {
    /**
     * 체크리스트 검토 (승인/반려)
     * @param {number} checklistId
     * @param {object} request - { action: 'APPROVE' | 'REJECT', comment: string }
     */
    reviewChecklist: async (checklistId, request) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase().rpc('review_checklist', {
                p_checklist_id: checklistId,
                p_action: request.action,
                p_comment: request.comment || null,
            });
            if (error) throw error;
            return toReview(data);
        }
        return apiClient.post(`/reviews/${checklistId}`, request);
    },
    
    /**
     * 체크리스트 검토 이력 조회
     * @param {number} checklistId
     */
    getChecklistReviewHistory: async (checklistId) => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('checklist_review_logs')
                .select('id,checklist_id,reviewer_id,reviewer_role,action,comment,previous_status,new_status,reviewed_at')
                .eq('checklist_id', checklistId)
                .order('reviewed_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(toReview);
        }
        return apiClient.get(`/reviews/${checklistId}/history`);
    },
    
    /**
     * 최근 검토 이력 조회
     */
    getRecentReviews: async () => {
        if (authApi.usesSupabase) {
            const { data, error } = await requireSupabase()
                .from('checklist_review_logs')
                .select('id,checklist_id,reviewer_id,reviewer_role,action,comment,previous_status,new_status,reviewed_at')
                .order('reviewed_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            return (data || []).map(toReview);
        }
        return apiClient.get('/reviews/recent');
    },
};

export default reviewApi;

