import apiClient from './apiClient';
import config from '../config/environment';

const hazardCycleApi = {
    createCycle: async (photo, description, location, clientTempId) => {
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
        return apiClient.get(`/hazard-cycles/my?page=${page}&size=${size}&status=${status}`);
    },

    getCycleDetail: async (cycleId) => {
        return apiClient.get(`/hazard-cycles/${cycleId}`);
    },

    syncOfflineCycles: async (cycles, photos) => {
        const formData = new FormData();
        formData.append('cycles', JSON.stringify(cycles));

        photos.forEach((photo, index) => {
            const fileName = photo.name || `offline-photo-${index + 1}.jpg`;
            formData.append('photos', photo, fileName);
        });

        return apiClient.post('/hazard-cycles/sync', formData);
    },

    getStats: async () => {
        return apiClient.get('/hazard-cycles/stats');
    },

    getCycleSummary: async (cycleId) => {
        return apiClient.get(`/hazard-cycles/${cycleId}/summary`);
    },

    ackCycle: async (cycleId, comment) => {
        return apiClient.post(`/hazard-cycles/${cycleId}/ack`, { comment: comment || null });
    },

    listAcks: async (cycleId) => {
        return apiClient.get(`/hazard-cycles/${cycleId}/acks`);
    },

    /**
     * 위험성평가표 PDF 다운로드 (고용노동부 제출용).
     * apiClient는 JSON 전용이므로 fetch 직접 사용.
     */
    downloadRiskAssessmentPdf: async (cycleId) => {
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
