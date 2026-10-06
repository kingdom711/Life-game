import { useNavigate } from 'react-router-dom';
import { Bell, Flame, OctagonAlert, HardHat } from 'lucide-react';

function DashboardHeader({ playerStats, activeWorkStopCount = 0, unreadNotifCount = 0, onNotificationClick }) {
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'long' });
    return <header className="adventure-header">
        <div className="adventure-topline"><span className="adventure-brand"><HardHat size={22} aria-hidden="true" />안전의 길</span><div className="adventure-header-actions"><span className="adventure-streak"><Flame size={17} aria-hidden="true" />{Number(playerStats?.streak?.current || 0)}일 연속</span>
            {onNotificationClick && <button type="button" onClick={onNotificationClick} aria-label={`알림 센터, 읽지 않은 알림 ${unreadNotifCount}개`}><Bell size={20} aria-hidden="true" />{unreadNotifCount > 0 && <span>{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</span>}</button>}<div id="dashboard-bgm-control-slot" aria-label="배경음악 제어" />
        </div></div>
        <p className="adventure-eyebrow">{today} · 오늘의 모험</p><h1>안전을 게임으로.</h1><p className="adventure-header-subtitle">오늘의 현장이, 나의 성장으로.</p>
        {activeWorkStopCount > 0 && <button type="button" className="adventure-urgent" onClick={() => navigate('/work-stop-history')}><OctagonAlert size={20} aria-hidden="true" />확인이 필요한 작업중지 {activeWorkStopCount}건</button>}
    </header>;
}
export default DashboardHeader;
