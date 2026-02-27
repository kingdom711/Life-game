import { useEffect, useState } from 'react';
import { getCachedOrFetchWeather, getWeatherSafetyTip, getStaticSafetyTip } from '../../utils/weatherService';

const STATIC_TIPS = [
    '3점 지지 원칙을 잊지 마세요!',
    '안전모는 작업 시작 전 항상 점검하세요.',
    '사다리 작업 시 4:1 각도를 유지하세요.',
    '밀폐 공간 작업 전 산소 농도를 확인하세요.',
    '중장비 작업 시 신호수의 신호를 반드시 확인하세요.',
    '작업 전 TBM(Tool Box Meeting)에 반드시 참여하세요.',
    '안전대는 추락 위험 2m 이상에서 반드시 착용하세요.',
    '전기 작업 시 검전기로 무전압을 확인하세요.'
];

function SafetyTipBar() {
    const [tipIndex, setTipIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [weatherTip, setWeatherTip] = useState(null);
    const [isWeatherMode, setIsWeatherMode] = useState(false);

    // 날씨 데이터 로드
    useEffect(() => {
        let cancelled = false;

        const loadWeather = async () => {
            try {
                const weatherData = await getCachedOrFetchWeather();
                if (cancelled) return;

                if (weatherData) {
                    const tip = getWeatherSafetyTip(weatherData);
                    setWeatherTip(tip);
                    setIsWeatherMode(true);
                }
            } catch {
                // 날씨 로드 실패 시 정적 팁 유지
            }
        };

        loadWeather();

        return () => { cancelled = true; };
    }, []);

    // 정적 팁 로테이션 (날씨 모드가 아닐 때)
    useEffect(() => {
        if (isWeatherMode) return;

        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setTipIndex((prev) => (prev + 1) % STATIC_TIPS.length);
                setIsVisible(true);
            }, 500);
        }, 10000);

        return () => clearInterval(interval);
    }, [isWeatherMode]);

    // 날씨 모드 렌더링
    if (isWeatherMode && weatherTip) {
        return (
            <div className="safety-tip-bar">
                <span className="safety-tip-prefix" aria-hidden="true"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{weatherTip.icon}</span>
                    {weatherTip.temperature !== null && (
                        <span style={{
                            fontSize: '0.85em',
                            fontWeight: '600',
                            color: 'var(--color-primary-light, #93c5fd)',
                            marginRight: '4px'
                        }}>
                            {weatherTip.temperature}°C
                        </span>
                    )}
                    <span style={{
                        fontSize: '0.75em',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: 'var(--color-primary-light, #93c5fd)',
                        fontWeight: '600'
                    }}>
                        {weatherTip.label}
                    </span>
                </span>
                <span className="safety-tip-text visible">
                    {weatherTip.tip}
                </span>
            </div>
        );
    }

    // 정적 팁 폴백 렌더링
    return (
        <div className="safety-tip-bar">
            <span className="safety-tip-prefix" aria-hidden="true">
                💡 Tip:
            </span>
            <span className={`safety-tip-text ${isVisible ? 'visible' : ''}`}>
                {STATIC_TIPS[tipIndex]}
            </span>
        </div>
    );
}

export default SafetyTipBar;
