import { useEffect, useState } from 'react';

const SAFETY_TIPS = [
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

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setTipIndex((prev) => (prev + 1) % SAFETY_TIPS.length);
                setIsVisible(true);
            }, 500);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="safety-tip-bar">
            <span className="safety-tip-prefix" aria-hidden="true">
                💡 Tip:
            </span>
            <span className={`safety-tip-text ${isVisible ? 'visible' : ''}`}>
                {SAFETY_TIPS[tipIndex]}
            </span>
        </div>
    );
}

export default SafetyTipBar;
