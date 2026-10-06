import { Coins, CircleCheck, HardHat } from 'lucide-react';
function MyGrowthStats({points=0,completedQuests=0,totalQuests=0,equippedCount=0}) {
    const metrics=[{label:'보유 포인트',value:Number(points).toLocaleString()+' P',Icon:Coins},{label:'오늘의 퀘스트',value:`${completedQuests} / ${totalQuests}`,Icon:CircleCheck},{label:'장착 장비',value:`${equippedCount}개`,Icon:HardHat}];
    return <section className="new-growth-section"><h3 className="new-growth-title">나의 모험 기록</h3><div className="new-growth-stats">{metrics.map(({label,value,Icon})=><div className="new-growth-stat" key={label}><Icon size={19} className="new-growth-stat-icon" aria-hidden="true" /><span className="new-growth-stat-value">{value}</span><span className="new-growth-stat-label">{label}</span></div>)}</div></section>;
}
export default MyGrowthStats;
