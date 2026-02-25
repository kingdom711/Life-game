function WeeklyQuestProgress({ quests = [] }) {
    const total = quests.length;
    const completed = quests.filter((q) => q.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const days = ['월', '화', '수', '목', '금'];
    const today = new Date().getDay();
    // getDay(): 0=일, 1=월 ... 6=토 → 월~금 index: 0~4
    const todayIndex = today === 0 ? -1 : today - 1;

    return (
        <aside className="dashboard-side-card">
            <header className="dashboard-side-title-row">
                <h3 className="dashboard-side-title">주간 퀘스트 수행률</h3>
            </header>

            <div className="weekly-progress-ring-wrap">
                <svg className="weekly-progress-ring" viewBox="0 0 100 100">
                    <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="rgba(15, 23, 42, 0.68)"
                        strokeWidth="8"
                    />
                    <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="weekly-progress-ring-label">
                    <span className="weekly-progress-pct">{percentage}%</span>
                    <span className="weekly-progress-count">{completed}/{total}</span>
                </div>
            </div>

            <div className="weekly-progress-days">
                {days.map((day, i) => (
                    <div
                        key={day}
                        className={`weekly-day-chip${i === todayIndex ? ' weekly-day-chip--today' : ''}${i < todayIndex ? ' weekly-day-chip--past' : ''}`}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </aside>
    );
}

export default WeeklyQuestProgress;
