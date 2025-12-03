import React, { useState, useEffect } from 'react';
import { streak } from '../utils/storage';

const StreakButton = ({ onCheckIn }) => {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [streakCount, setStreakCount] = useState(0);

    useEffect(() => {
        // 초기 상태 확인
        const checkStatus = () => {
            const checkedIn = streak.isCheckedInToday();
            setIsCheckedIn(checkedIn);
            const currentStreak = streak.get().current;
            setStreakCount(currentStreak);
        };

        checkStatus();

        // 1분마다 날짜 변경 체크 (자정 지나면 버튼 활성화)
        const interval = setInterval(() => {
            checkStatus();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleCheckIn = () => {
        if (isCheckedIn) return;

        const result = streak.checkIn();
        if (result.success) {
            setIsCheckedIn(true);
            setStreakCount(result.streak);
            setShowAnimation(true);

            // 상위 컴포넌트에 알림
            if (onCheckIn) onCheckIn(result);

            // 애니메이션 종료 후 상태 초기화
            setTimeout(() => {
                setShowAnimation(false);
            }, 2000);
        }
    };

    return (
        <div className="streak-button-container">
            <button
                className={`btn-streak ${isCheckedIn ? 'checked-in' : ''}`}
                onClick={handleCheckIn}
                disabled={isCheckedIn}
            >
                <div className="streak-content">
                    <span className="icon">🔥</span>
                    <span className="text">
                        {isCheckedIn ? '출석 완료!' : '로그인 스트릭 유지하기'}
                    </span>
                    <span className="count">{streakCount}일 연속</span>
                </div>

                {/* 배경 효과 */}
                <div className="streak-bg"></div>
            </button>

            {/* +1 Day 애니메이션 */}
            {showAnimation && (
                <div className="streak-animation">
                    <span className="plus-one">+1 Day</span>
                    <span className="plus-points">+20 P</span>
                </div>
            )}
        </div>
    );
};

export default StreakButton;
