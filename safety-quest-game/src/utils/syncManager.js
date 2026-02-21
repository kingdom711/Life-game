import hazardCycleApi from '../api/hazardCycleApi';
import { offlineDb } from './offlineDb';

const normalizePhotoBlob = (blob, fileName) => {
    if (blob instanceof File) {
        return blob;
    }
    return new File([blob], fileName || `offline-${Date.now()}.jpg`, {
        type: blob?.type || 'image/jpeg',
    });
};

let initialized = false;
let onlineHandler = null;

export const syncManager = {
    async manualSync() {
        const pending = await offlineDb.getPendingCycles();
        if (!pending.length) {
            return { syncedCount: 0, failedCount: 0, results: [] };
        }

        const cycles = pending.map((item) => ({
            clientTempId: item.clientTempId,
            description: item.description || null,
            location: item.location || null,
            reportedAt: item.reportedAt || null,
            photoFileName: item.photoFileName,
        }));

        const photos = pending.map((item) => normalizePhotoBlob(item.photoBlob, item.photoFileName));

        const result = await hazardCycleApi.syncOfflineCycles(cycles, photos);

        for (const row of result.results || []) {
            if (!row.error) {
                await offlineDb.removePendingCycle(row.clientTempId);
            }
        }

        return result;
    },

    async registerSync() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('hazardCycleSync');
        }
    },

    init() {
        if (initialized) {
            return () => {};
        }

        onlineHandler = async () => {
            try {
                const count = await offlineDb.getPendingCount();
                if (count > 0) {
                    await this.manualSync();
                }
            } catch (error) {
                console.error('[syncManager] 수동 동기화 실패:', error);
            }
        };

        window.addEventListener('online', onlineHandler);
        initialized = true;

        return () => {
            if (onlineHandler) {
                window.removeEventListener('online', onlineHandler);
            }
            initialized = false;
            onlineHandler = null;
        };
    },
};

export default syncManager;
