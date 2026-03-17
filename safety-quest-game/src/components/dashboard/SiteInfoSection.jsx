import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ALERT_ICONS = {
    danger: '⚠️',
    warning: '🔔',
    info: 'ℹ️'
};

const SAFETY_QUOTES = [
    { text: '"빠른 것보다 안전한 것이 진짜 빠른 것이다"', author: '현장소장 박영호' },
    { text: '"안전은 선택이 아닌 습관이다"', author: '안전관리자' },
    { text: '"한 번의 확인이 사고를 예방한다"', author: '현장 격언' },
];

function SiteInfoSection({ alerts = [], alertCount = 0, workStopCount = 0 }) {
    const navigate = useNavigate();
    const [weatherData] = useState({
        temp: 18,
        warning: '오후 강풍 주의',
        tip: '안전모 턱끈 확인'
    });

    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % SAFETY_QUOTES.length);
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    const displayAlerts = alerts.slice(0, 2);
    const quote = SAFETY_QUOTES[quoteIndex];

    return (
        <div className="new-siteinfo-section">
            <div className="new-siteinfo-header">
                <h2 className="new-siteinfo-title">현장 정보</h2>
                <div className="new-siteinfo-header-actions">
                    {/* 작업중지 현황 버튼 */}
                    <button
                        type="button"
                        className="new-siteinfo-workstop-btn"
                        onClick={() => navigate('/work-stop-history')}
                    >
                        <span className="new-siteinfo-workstop-btn-icon">✋</span>
                        {workStopCount > 0 && (
                            <span className="new-siteinfo-workstop-btn-badge">{workStopCount}</span>
                        )}
                        <span className="new-siteinfo-workstop-btn-text">작업중지</span>
                    </button>
                    {/* 알림 상세 버튼 */}
                    <button
                        type="button"
                        className="new-siteinfo-alert-btn"
                        onClick={() => navigate('/alert-management')}
                    >
                        <span className="new-siteinfo-alert-btn-icon">🔔</span>
                        {alertCount > 0 && (
                            <span className="new-siteinfo-alert-btn-badge">{alertCount}</span>
                        )}
                        <span className="new-siteinfo-alert-btn-text">알림 상세</span>
                    </button>
                </div>
            </div>

            <div className="new-siteinfo-alerts">
                {displayAlerts.map((alert, i) => (
                    <div key={alert.id || i} className={`new-siteinfo-alert new-siteinfo-alert--${alert.type}`}>
                        <span className="new-siteinfo-alert-icon">
                            {ALERT_ICONS[alert.type] || 'ℹ️'}
                        </span>
                        <div className="new-siteinfo-alert-content">
                            <span className="new-siteinfo-alert-msg">
                                {alert.zone && `${alert.zone} `}{alert.message}
                                {alert.detail && ` — ${alert.detail.substring(0, 40)}`}
                            </span>
                        </div>
                        <span className="new-siteinfo-alert-time">{alert.time}</span>
                    </div>
                ))}
            </div>

            <div className="new-siteinfo-bottom-row">
                <div className="new-siteinfo-weather">
                    <div className="new-siteinfo-weather-icon">☀️</div>
                    <div className="new-siteinfo-weather-label">날씨 안전</div>
                    <div className="new-siteinfo-weather-temp">{weatherData.temp}°C</div>
                    <div className="new-siteinfo-weather-warn">{weatherData.warning}</div>
                    <a href="#" className="new-siteinfo-weather-link">🪖 {weatherData.tip}</a>
                </div>
                <div className="new-siteinfo-quote">
                    <div className="new-siteinfo-quote-icon">💬</div>
                    <div className="new-siteinfo-quote-label">오늘의 한마디</div>
                    <div className="new-siteinfo-quote-text">{quote.text}</div>
                    <div className="new-siteinfo-quote-author">— {quote.author}</div>
                </div>
            </div>
        </div>
    );
}

export default SiteInfoSection;
