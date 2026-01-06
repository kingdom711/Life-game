import React, { useState, useEffect } from 'react';
import { streak, monthlyAttendance } from '../utils/storage';

const StreakButton = ({ onCheckIn, onShowMonthlyRewards }) => {
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
        if (isCheckedIn) {
            console.log('Already checked in');
            return;
        }

        console.log('Attempting check-in...');
        const result = streak.checkIn();
        console.log('Check-in result:', result);
        
        if (result.success) {
            setIsCheckedIn(true);
            setStreakCount(result.streak);
            setShowAnimation(true);

            // 월간 출석도 기록
            monthlyAttendance.recordAttendance();

            // 상위 컴포넌트에 알림
            if (onCheckIn) {
                console.log('Calling onCheckIn callback');
                onCheckIn(result);
            }

            // 애니메이션 종료 후 월간 보상 모달 표시
            setTimeout(() => {
                setShowAnimation(false);
                // 월간 보상 모달 표시
                if (onShowMonthlyRewards) onShowMonthlyRewards();
            }, 2000);
        } else {
            // 이미 출석한 경우 상태 업데이트
            if (result.message && result.message.includes('이미 출석')) {
                console.log('Already checked in today, updating state');
                setIsCheckedIn(true);
                const streakData = streak.get();
                setStreakCount(streakData.current);
            } else {
                console.error('Check-in failed:', result.message);
            }
        }
    };

    // 이미 출석한 경우 클릭 시 월간 보상 모달 표시
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('StreakButton clicked', { isCheckedIn });
        
        if (isCheckedIn) {
            console.log('Already checked in, showing monthly rewards');
            if (onShowMonthlyRewards) onShowMonthlyRewards();
        } else {
            handleCheckIn();
        }
    };

    return (
        <div className="streak-button-container">
            <button
                className={`btn-streak ${isCheckedIn ? 'checked-in' : ''}`}
                onClick={handleClick}
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
