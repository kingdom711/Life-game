import apiClient from './apiClient';

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
};

export default hazardCycleApi;
