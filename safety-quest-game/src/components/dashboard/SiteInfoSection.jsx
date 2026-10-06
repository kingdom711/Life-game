import { Link } from 'react-router-dom';
import { Bell, OctagonAlert } from 'lucide-react';
function SiteInfoSection({alerts=[],alertCount=0,workStopCount=0}) {
    return <section className="new-siteinfo-section"><div className="adventure-section-heading"><h2>우리 현장의 소식</h2><Link to="/alert-management" className="adventure-player-team">알림 {alertCount}개</Link></div>{alerts.length?<div className="new-siteinfo-alerts">{alerts.slice(0,2).map((alert,index)=><div key={alert.id||index} className="new-siteinfo-alert"><Bell size={17} aria-hidden="true" /><span className="new-siteinfo-alert-msg">{alert.zone&&`${alert.zone} · `}{alert.message||alert.title}{alert.detail&&` — ${alert.detail.slice(0,60)}`}</span></div>)}</div>:<p className="adventure-empty">표시할 현장 알림이 없습니다. 자세한 내용은 알림 화면에서 확인하세요.</p>}
        <Link to="/work-stop-history" className="adventure-site-stop"><OctagonAlert size={18} aria-hidden="true" />작업중지 내역{workStopCount>0?` · 확인 필요 ${workStopCount}건`:''}</Link>
    </section>;
}
export default SiteInfoSection;
