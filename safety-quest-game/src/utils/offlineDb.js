import { openDB } from 'idb';

const DB_NAME = 'safety-quest-offline';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('pendingCycles')) {
            const store = db.createObjectStore('pendingCycles', { keyPath: 'clientTempId' });
            store.createIndex('createdAt', 'createdAt');
        }

        if (!db.objectStoreNames.contains('auth')) {
            db.createObjectStore('auth', { keyPath: 'key' });
        }
    },
});

export const offlineDb = {
    async savePendingCycle(cycle) {
        const db = await dbPromise;
        return db.put('pendingCycles', cycle);
    },

    async getPendingCycles() {
        const db = await dbPromise;
        return db.getAll('pendingCycles');
    },

    async removePendingCycle(clientTempId) {
        const db = await dbPromise;
        return db.delete('pendingCycles', clientTempId);
    },

    async getPendingCount() {
        const db = await dbPromise;
        return db.count('pendingCycles');
    },

    async saveToken(token) {
        const db = await dbPromise;
        return db.put('auth', {
            key: 'accessToken',
            token,
            updatedAt: Date.now(),
        });
    },

    async getToken() {
        const db = await dbPromise;
        const row = await db.get('auth', 'accessToken');
        return row?.token || null;
    },

    async clearToken() {
        const db = await dbPromise;
        return db.delete('auth', 'accessToken');
    },
};

export default offlineDb;
