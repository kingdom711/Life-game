import { useEffect, useState } from 'react';
import { offlineDb } from '../../utils/offlineDb';

function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const refresh = async () => {
            const count = await offlineDb.getPendingCount();
            setPendingCount(count);
            setIsOnline(navigator.onLine);
        };

        const onOnline = () => refresh();
        const onOffline = () => refresh();

        refresh();
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        const interval = setInterval(refresh, 3000);

        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="hazard-connection-status" role="status">
            <span style={{ color: isOnline ? 'var(--color-safe)' : 'var(--color-danger)' }}>
                {isOnline ? '온라인' : '오프라인'}
            </span>
            <span>대기 {pendingCount}건</span>
        </div>
    );
}

export default OfflineIndicator;
