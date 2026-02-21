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
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-200">
            <span className={isOnline ? 'text-emerald-300' : 'text-red-300'}>
                {isOnline ? '온라인' : '오프라인'}
            </span>
            <span className="text-slate-400">대기 {pendingCount}건</span>
        </div>
    );
}

export default OfflineIndicator;
