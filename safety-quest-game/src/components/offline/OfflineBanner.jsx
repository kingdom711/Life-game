import { useEffect, useState } from 'react';

function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);

        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 px-4 py-2 text-sm text-red-100">
            오프라인 상태입니다. 업로드 요청은 복구 후 자동 동기화됩니다.
        </div>
    );
}

export default OfflineBanner;
