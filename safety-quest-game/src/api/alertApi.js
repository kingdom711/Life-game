import apiClient from './apiClient';

const formatTimeAgo = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
};

const mapAlertType = (backendType) => {
    const t = (backendType || '').toUpperCase();
    if (t === 'DANGER') return 'work_stop';
    return 'system';
};

const splitAlertTitle = (title) => {
    const rawTitle = (title || '').trim();
    const separator = ' - ';
    const separatorIndex = rawTitle.indexOf(separator);

    if (separatorIndex === -1) {
        return {
            zone: '전체',
            message: rawTitle
        };
    }

    const zone = rawTitle.slice(0, separatorIndex).trim();
    const duplicatePrefix = `${zone}${separator}`;
    const rawMessage = rawTitle.slice(separatorIndex + separator.length).trim();
    const message = rawMessage.startsWith(duplicatePrefix)
        ? rawMessage.slice(duplicatePrefix.length).trim()
        : rawMessage;

    return {
        zone: zone || '전체',
        message
    };
};

const transformAlert = (alert) => {
    const title = splitAlertTitle(alert.title);

    return {
        id: alert.id,
        type: mapAlertType(alert.type),
        backendType: alert.type,
        zone: title.zone,
        message: title.message,
        detail: alert.message || '',
        time: formatTimeAgo(alert.createdAt),
        createdAt: alert.createdAt,
        priority: alert.priority,
        active: alert.active
    };
};

const transformToBackend = (data) => {
    const zone = (data.zone || '').trim();
    const message = (data.message || '').trim();
    const detail = (data.detail || '').trim();

    return {
        title: zone && message ? `${zone} - ${message}` : message || zone,
        message: detail,
        type: data.type?.toUpperCase() || 'INFO',
        priority: data.priority || 0,
        active: data.active !== false,
        startDate: data.startDate || null,
        endDate: data.endDate || null
    };
};

export const getAlerts = async () => {
    try {
        const alerts = await apiClient.get('/alerts/active');
        const alertList = Array.isArray(alerts) ? alerts : [];
        return alertList.map(transformAlert);
    } catch (error) {
        console.error('[AlertApi] Failed to fetch alerts:', error);
        throw error;
    }
};

export const getAllAlerts = async () => {
    try {
        const alerts = await apiClient.get('/alerts');
        const alertList = Array.isArray(alerts) ? alerts : [];
        return alertList.map(transformAlert);
    } catch (error) {
        console.error('[AlertApi] Failed to fetch all alerts:', error);
        throw error;
    }
};

export const createAlert = async (data) => {
    try {
        const backendData = transformToBackend(data);
        const alert = await apiClient.post('/alerts', backendData);
        return transformAlert(alert);
    } catch (error) {
        console.error('[AlertApi] Failed to create alert:', error);
        throw error;
    }
};

export const updateAlert = async (id, data) => {
    try {
        const backendData = transformToBackend(data);
        const alert = await apiClient.put(`/alerts/${id}`, backendData);
        return transformAlert(alert);
    } catch (error) {
        console.error('[AlertApi] Failed to update alert:', error);
        throw error;
    }
};

export const deleteAlert = async (id) => {
    try {
        await apiClient.delete(`/alerts/${id}`);
        console.log('[AlertApi] Alert deleted:', id);
    } catch (error) {
        console.error('[AlertApi] Failed to delete alert:', error);
        throw error;
    }
};

const alertApi = {
    getAlerts,
    getAllAlerts,
    createAlert,
    updateAlert,
    deleteAlert
};

export default alertApi;
