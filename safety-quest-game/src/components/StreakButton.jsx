import React, { useState, useEffect } from 'react';
import { streak, monthlyAttendance } from '../utils/storage';
import questApi from '../api/questApi';
import userApi from '../api/userApi';

const StreakButton = ({ onCheckIn, onShowMonthlyRewards }) => {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [streakCount, setStreakCount] = useState(0);

    useEffect(() => {
        const checkStatus = async () => {
            // 먼저 localStorage에서 빠르게 표시
            const checkedIn = streak.isCheckedInToday();
            setIsCheckedIn(checkedIn);
            const currentStreak = streak.get().current;
            setStreakCount(currentStreak);

            // 백엔드에서 최신 스트릭 동기화 (로그인 상태일 때)
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const data = await userApi.getStreak();
                    if (data && typeof data.currentStreak === 'number') {
                        setStreakCount(data.currentStreak);
                        // localStorage도 동기화
                        const today = new Date().toISOString().split('T')[0];
                        if (data.lastCheckInDate === today) {
                            setIsCheckedIn(true);
                        }
                        streak.set({
                            current: data.currentStreak,
                            longest: data.longestStreak,
                            lastLoginDate: data.lastCheckInDate
                        });
                    }
                } catch (err) {
                    console.log('[StreakButton] API fallback to localStorage:', err.message);
                }
            }
        };

        checkStatus();

        const interval = setInterval(() => {
            const checkedIn = streak.isCheckedInToday();
            setIsCheckedIn(checkedIn);
            const currentStreak = streak.get().current;
            setStreakCount(currentStreak);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleCheckIn = async () => {
        if (isCheckedIn) {
            console.log('Already checked in');
            return;
        }

        console.log('Attempting check-in...');

        // 백엔드 API 우선 시도
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const data = await questApi.checkIn();
                console.log('API check-in result:', data);

                setIsCheckedIn(true);
                setStreakCount(data.currentStreak);
                setShowAnimation(true);

                // localStorage도 동기화
                streak.set({
                    current: data.currentStreak,
                    longest: data.longestStreak,
                    lastLoginDate: data.checkInDate
                });
                monthlyAttendance.recordAttendance();

                if (onCheckIn) {
                    onCheckIn({
                        success: true,
                        streak: data.currentStreak,
                        bonus: data.bonusAwarded ? 5 : 0,
                        pointsEarned: data.pointsEarned
                    });
                }

                setTimeout(() => {
                    setShowAnimation(false);
                    if (onShowMonthlyRewards) onShowMonthlyRewards();
                }, 2000);
                return;
            } catch (err) {
                console.log('[StreakButton] API check-in failed, falling back:', err.message);
                // 이미 출석한 경우 처리
                if (err.data?.code === 'AT001') {
                    setIsCheckedIn(true);
                    return;
                }
            }
        }

        // localStorage 폴백
        const result = streak.checkIn();
        console.log('Local check-in result:', result);

        if (result.success) {
            setIsCheckedIn(true);
            setStreakCount(result.streak);
            setShowAnimation(true);
            monthlyAttendance.recordAttendance();

            if (onCheckIn) {
                console.log('Calling onCheckIn callback');
                onCheckIn(result);
            }

            setTimeout(() => {
                setShowAnimation(false);
                if (onShowMonthlyRewards) onShowMonthlyRewards();
            }, 2000);
        } else {
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
