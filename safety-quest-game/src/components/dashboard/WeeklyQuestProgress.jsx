import { useState, useMemo } from 'react';
import { dailyQuestSnapshots, getKSTDateString, getKSTDayOfWeek } from '../../utils/storage';

function WeeklyQuestProgress({ quests = [] }) {
    const days = ['월', '화', '수', '목', '금'];
    const kstDayOfWeek = getKSTDayOfWeek(); // 0=일, 1=월 ... 6=토
    const todayIndex = (kstDayOfWeek === 0 || kstDayOfWeek === 6) ? -1 : kstDayOfWeek - 1;

    const [selectedDay, setSelectedDay] = useState(null);

    // dayIndex(0=월~4=금)를 현재 주의 YYYY-MM-DD로 변환
    const getDayDateString = (dayIndex) => {
        const todayStr = getKSTDateString();
        const [year, month, day] = todayStr.split('-').map(Number);
        const todayDate = new Date(year, month - 1, day);
        const diff = dayIndex - todayIndex;
        const targetDate = new Date(todayDate);
        targetDate.setDate(targetDate.getDate() + diff);
        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(targetDate.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const displayData = useMemo(() => {
        const activeDay = selectedDay !== null ? selectedDay : (todayIndex === -1 ? 4 : todayIndex);

        // 오늘 선택: 라이브 데이터 사용
        if (activeDay === todayIndex) {
            const total = quests.length;
            const completed = quests.filter(q => q.isCompleted).length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            return { total, completed, percentage, noData: false };
        }

        // 과거/주말: 스냅샷에서 로드
        const dateStr = getDayDateString(activeDay);
        const snapshot = dailyQuestSnapshots.getByDate(dateStr);

        if (!snapshot) {
            return { total: 0, completed: 0, percentage: 0, noData: true };
        }

        const percentage = snapshot.total > 0
            ? Math.round((snapshot.completed / snapshot.total) * 100)
            : 0;
        return { total: snapshot.total, completed: snapshot.completed, percentage, noData: false };
    }, [selectedDay, todayIndex, quests]);

    const handleDayClick = (dayIndex) => {
        if (todayIndex !== -1 && dayIndex > todayIndex) return;
        setSelectedDay(dayIndex === selectedDay ? null : dayIndex);
    };

    const getChipClassName = (dayIndex) => {
        const classes = ['weekly-day-chip'];
        const activeDay = selectedDay !== null ? selectedDay : (todayIndex === -1 ? 4 : todayIndex);
        const isClickable = todayIndex === -1 || dayIndex <= todayIndex;

        if (dayIndex === todayIndex) {
            classes.push('weekly-day-chip--today');
        } else if (todayIndex === -1 || dayIndex < todayIndex) {
            classes.push('weekly-day-chip--past');
        } else {
            classes.push('weekly-day-chip--future');
        }

        if (isClickable) {
            classes.push('weekly-day-chip--clickable');
        }

        if (dayIndex === activeDay) {
            classes.push('weekly-day-chip--selected');
        }

        return classes.join(' ');
    };

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
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - displayData.percentage / 100)}`}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="weekly-progress-ring-label">
                    <span className="weekly-progress-pct">{displayData.percentage}%</span>
                    <span className="weekly-progress-count">
                        {displayData.noData ? '데이터 없음' : `${displayData.completed}/${displayData.total}`}
                    </span>
                </div>
            </div>

            <div className="weekly-progress-days">
                {days.map((day, i) => (
                    <div
                        key={day}
                        className={getChipClassName(i)}
                        onClick={() => handleDayClick(i)}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </aside>
    );
}

export default WeeklyQuestProgress;
