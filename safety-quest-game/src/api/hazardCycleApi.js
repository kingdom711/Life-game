import apiClient from './apiClient';
import { requireSupabase } from '../lib/supabase';

const useSupabase = true;

const hazardCycleApi = {
    createCycle: async (photo, description, location, clientTempId) => {
        if (useSupabase) {
            const formData = new FormData();
            formData.append('action', 'create');
            formData.append('photo', photo);
            if (description) formData.append('description', description);
            if (location) formData.append('location', location);
            if (clientTempId) formData.append('clientTempId', clientTempId);
            const { data, error } = await requireSupabase().functions.invoke('hazard-cycle', { body: formData });
            if (error) throw error;
            if (data?.error?.message) throw new Error(data.error.message);
            return data;
        }
        const formData = new FormData();
        formData.append('photo', photo);

        if (description || location || clientTempId) {
            formData.append(
                'request',
                new Blob(
                    [
                        JSON.stringify({
                            description: description || null,
                            location: location || null,
                            clientTempId: clientTempId || null,
                        }),
                    ],
                    { type: 'application/json' },
                ),
            );
        }

        return apiClient.post('/hazard-cycles', formData);
    },

    completeCycle: async (cycleId, photo, note) => {
        if (useSupabase) {
            const formData = new FormData();
            formData.append('action', 'complete');
            formData.append('cycleId', cycleId);
            formData.append('photo', photo);
            if (note) formData.append('note', note);
            const { data, error } = await requireSupabase().functions.invoke('hazard-cycle', { body: formData });
            if (error) throw error;
            if (data?.error?.message) throw new Error(data.error.message);
            return data;
        }
        const formData = new FormData();
        formData.append('photo', photo);

        if (note) {
            formData.append(
                'request',
                new Blob([JSON.stringify({ note })], {
                    type: 'application/json',
                }),
            );
        }

        return apiClient.post(`/hazard-cycles/${cycleId}/complete`, formData);
    },

    getMyCycles: async (page = 0, size = 20, status = 'ALL') => {
        if (useSupabase) {
            const formData = new FormData();
            formData.append('action', 'list'); formData.append('page', page); formData.append('size', size); formData.append('status', status);
            const { data, error } = await requireSupabase().functions.invoke('hazard-cycle', { body: formData });
            if (error) throw error; if (data?.error?.message) throw new Error(data.error.message); return data;
        }
        return apiClient.get(`/hazard-cycles/my?page=${page}&size=${size}&status=${status}`);
    },

    getCycleDetail: async (cycleId) => {
        if (useSupabase) {
            const formData = new FormData(); formData.append('action', 'detail'); formData.append('cycleId', cycleId);
            const { data, error } = await requireSupabase().functions.invoke('hazard-cycle', { body: formData });
            if (error) throw error; if (data?.error?.message) throw new Error(data.error.message); return data;
        }
        return apiClient.get(`/hazard-cycles/${cycleId}`);
    },

    syncOfflineCycles: async (cycles, photos) => {
        if (useSupabase) {
            const results = await Promise.all(cycles.map(async (cycle, index) => {
                try {
                    const data = await hazardCycleApi.createCycle(
                        photos[index], cycle.description, cycle.location, cycle.clientTempId,
                    );
                    return { clientTempId: cycle.clientTempId, data };
                } catch (error) {
                    return { clientTempId: cycle.clientTempId, error: error.message || 'Offline sync failed' };
                }
            }));
            return {
                results,
                syncedCount: results.filter((row) => !row.error).length,
                failedCount: results.filter((row) => row.error).length,
            };
        }
        const formData = new FormData();
        formData.append('cycles', JSON.stringify(cycles));

        photos.forEach((photo, index) => {
            const fileName = photo.name || `offline-photo-${index + 1}.jpg`;
            formData.append('photos', photo, fileName);
        });

        return apiClient.post('/hazard-cycles/sync', formData);
    },

    getStats: async () => {
        if (useSupabase) {
            const formData = new FormData(); formData.append('action', 'stats');
            const { data, error } = await requireSupabase().functions.invoke('hazard-cycle', { body: formData });
            if (error) throw error; if (data?.error?.message) throw new Error(data.error.message); return data;
        }
        return apiClient.get('/hazard-cycles/stats');
    },

    getCycleSummary: async (cycleId) => {
        if (useSupabase) {
            const formData = new FormData(); formData.append('action', 'summary'); formData.append('cycleId', cycleId);
            const { data, error } = await requireSupabase().functions.invoke('hazard-cycle', { body: formData });
            if (error) throw error; if (data?.error?.message) throw new Error(data.error.message); return data;
        }
        return apiClient.get(`/hazard-cycles/${cycleId}/summary`);
    },

    ackCycle: async (cycleId, comment) => {
        if (useSupabase) {
            const formData = new FormData(); formData.append('action', 'ack'); formData.append('cycleId', cycleId); if (comment) formData.append('comment', comment);
            const { data, error } = await requireSupabase().functions.invoke('hazard-cycle', { body: formData });
            if (error) throw error; if (data?.error) { const err = new Error(data.error.message); err.data = data.error; throw err; } return data;
        }
        return apiClient.post(`/hazard-cycles/${cycleId}/ack`, { comment: comment || null });
    },

    listAcks: async (cycleId) => {
        if (useSupabase) {
            const formData = new FormData(); formData.append('action', 'acks'); formData.append('cycleId', cycleId);
            const { data, error } = await requireSupabase().functions.invoke('hazard-cycle', { body: formData });
            if (error) throw error; if (data?.error?.message) throw new Error(data.error.message); return data;
        }
        return apiClient.get(`/hazard-cycles/${cycleId}/acks`);
    },

    exportHazardExcel: async ({ from, to } = {}) => {
        const { data, error } = await requireSupabase().functions.invoke('export-hazard-excel', {
            body: { from: from || undefined, to: to || undefined },
        });
        if (error) throw error;
        if (!data?.signedUrl) throw new Error(data?.error?.message || 'Excel export failed');
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        return data;
    },

    /**
     * 위험성평가표 PDF 다운로드 (고용노동부 제출용).
     * apiClient는 JSON 전용이므로 fetch 직접 사용.
     */
    downloadRiskAssessmentPdf: async (cycleId) => {
        const { data, error } = await requireSupabase().functions.invoke('generate-risk-pdf', {
            body: { cycleId },
        });
        if (error) throw error;
        if (!data?.signedUrl) throw new Error(data?.error?.message || 'PDF generation failed');
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        return;

        await config.resolveApiBaseUrl();
        const url = config.getApiUrl(`/hazard-cycles/${cycleId}/risk-assessment.pdf`);
        const token = localStorage.getItem('accessToken');

        const response = await fetch(url, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
            let message = `PDF 다운로드 실패 (${response.status})`;
            try {
                const err = await response.json();
                message = err?.error?.message || message;
            } catch (_) {
                /* binary or empty */
            }
            throw new Error(message);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `risk-assessment-${cycleId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
    },
};

export default hazardCycleApi;
