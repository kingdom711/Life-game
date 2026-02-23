import React, { useEffect, useState } from 'react';
import { getKSTDateString, monthlyAttendance, streak } from '../utils/storage';
import questApi from '../api/questApi';
import userApi from '../api/userApi';

const StreakButton = ({ onCheckIn, onShowMonthlyRewards }) => {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [streakCount, setStreakCount] = useState(0);

    const refreshLocalStatus = () => {
        const currentStreak = streak.get();
        setStreakCount(currentStreak.current);
        setIsCheckedIn(streak.isCheckedInToday());
    };

    const syncStreakFromApi = async () => {
        const data = await userApi.getStreak();
        if (!data || typeof data.currentStreak !== 'number') {
            return;
        }

        streak.set({
            current: data.currentStreak,
            longest: data.longestStreak,
            lastLoginDate: data.lastCheckInDate
        });
        refreshLocalStatus();
    };

    useEffect(() => {
        let isMounted = true;

        const checkStatus = async () => {
            if (!isMounted) return;
            refreshLocalStatus();

            const token = localStorage.getItem('accessToken');
            if (!token) return;

            try {
                await syncStreakFromApi();
            } catch (err) {
                console.log('[StreakButton] API fallback to localStorage:', err.message);
            }
        };

        checkStatus();

        const interval = setInterval(() => {
            if (!isMounted) return;
            refreshLocalStatus();
        }, 60000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const handleCheckIn = async () => {
        if (isCheckedIn) {
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const data = await questApi.checkIn();

                // Keep UI in checked-in state for the local KST day.
                streak.set({
                    current: data.currentStreak,
                    longest: data.longestStreak,
                    lastLoginDate: getKSTDateString()
                });

                setIsCheckedIn(true);
                setStreakCount(data.currentStreak);
                setShowAnimation(true);
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

                if (err.data?.code === 'AT001') {
                    try {
                        await syncStreakFromApi();
                    } catch (syncErr) {
                        console.log('[StreakButton] failed to sync streak after AT001:', syncErr.message);
                    }
                    setIsCheckedIn(true);
                    return;
                }
            }
        }

        const result = streak.checkIn();
        if (result.success) {
            setIsCheckedIn(true);
            setStreakCount(result.streak);
            setShowAnimation(true);
            monthlyAttendance.recordAttendance();

            if (onCheckIn) {
                onCheckIn(result);
            }

            setTimeout(() => {
                setShowAnimation(false);
                if (onShowMonthlyRewards) onShowMonthlyRewards();
            }, 2000);
        } else if (result.message && result.message.includes('이미 출석')) {
            setIsCheckedIn(true);
            const streakData = streak.get();
            setStreakCount(streakData.current);
        } else {
            console.error('Check-in failed:', result.message);
        }
    };

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCheckedIn) {
            if (onShowMonthlyRewards) onShowMonthlyRewards();
            return;
        }
        handleCheckIn();
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

                <div className="streak-bg"></div>
            </button>

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
