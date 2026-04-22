import { CATEGORY_INFO } from '../../data/educationData';

function QuestOfTheDay({ quest, todayEducation, onAction, onComplete }) {
    if (!quest && !todayEducation) return null;

    // 교육 데이터 기반으로 Quest of the Day 구성
    const education = todayEducation;
    const categoryInfo = education ? CATEGORY_INFO[education.category] : null;
    const questIcon = categoryInfo?.icon || '🛡️';
    const questTitle = education?.title || quest?.title || '오늘의 안전 체크';
    const questPoints = education?.points || quest?.rewards?.points || 10;

    // 교육 설명에서 체크리스트 항목 생성
    const checklistItems = education?.description
        ? [education.description]
        : quest?.description
            ? [quest.description]
            : [];

    // 퀴즈 문제에서 힌트 가져오기
    const tipText = education?.quiz?.[0]?.explanation
        ? education.quiz[0].explanation.slice(0, 40) + '...'
        : '안전 수칙을 확인하고 포인트를 획득하세요';

    const handleClick = () => {
        if (quest && onAction) {
            onAction(quest);
        }
    };

    return (
        <div className="quest-of-day">
            {/* Header with wings */}
            <div className="quest-of-day-header">
                <div className="quest-of-day-header-wing" />
                <span className="quest-of-day-header-text">Quest of the Day</span>
                <div className="quest-of-day-header-wing quest-of-day-header-wing--right" />
            </div>

            {/* Content */}
            <div className="quest-of-day-content">
                <div className="quest-of-day-icon-area">
                    {questIcon}
                </div>
                <div className="quest-of-day-info">
                    <h3 className="quest-of-day-title">
                        <span className="quest-of-day-title-icon">🏅</span>
                        {questTitle}
                    </h3>
                    {checklistItems.length > 0 && (
                        <ol className="quest-of-day-checklist">
                            {checklistItems.map((item, i) => (
                                <li key={i}>{i + 1}. {item}</li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            {/* Tip */}
            <div className="quest-of-day-tip">
                <span>💡</span>
                {tipText}
            </div>

            {/* CTA Button */}
            <button className="quest-of-day-cta" onClick={handleClick}>
                확인했습니다 (+{questPoints}P)
            </button>
        </div>
    );
}

export default QuestOfTheDay;
