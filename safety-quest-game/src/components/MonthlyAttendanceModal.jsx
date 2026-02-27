import React, { useState, useEffect } from 'react';
import { monthlyAttendance, MONTHLY_REWARDS, points } from '../utils/storage';
import ShareRewardModal from './ShareRewardModal';
import { buildMonthlyAttendanceShareData } from '../utils/shareManager';

const MonthlyAttendanceModal = ({ isOpen, onClose }) => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [claimAnimation, setClaimAnimation] = useState(null);
    const [shareModal, setShareModal] = useState({ isOpen: false, data: null });

    useEffect(() => {
        if (isOpen) {
            loadAttendanceData();
        }
    }, [isOpen]);

    const loadAttendanceData = () => {
        const data = monthlyAttendance.get();
        setAttendanceData(data);
    };

    const handleClaimReward = (rewardDay) => {
        const result = monthlyAttendance.claimReward(rewardDay);
        if (result.success) {
            setClaimAnimation(rewardDay);
            setTimeout(() => {
                setClaimAnimation(null);
                loadAttendanceData();
                // 14일 이상 출석 보상 수령 시 공유 모달 표시
                if (rewardDay >= 14) {
                    setShareModal({
                        isOpen: true,
                        data: buildMonthlyAttendanceShareData(rewardDay)
                    });
                }
            }, 1000);
        }
    };

    const getRewardIcon = (reward) => {
        switch (reward.type) {
            case 'points':
                return '💰';
            case 'box':
                if (reward.boxType === 'common') return '📦';
                if (reward.boxType === 'rare') return '🎁';
                if (reward.boxType === 'epic') return '💎';
                if (reward.boxType === 'legendary') return '👑';
                if (reward.boxType === 'special') return '🌟';
                return '📦';
            case 'grand':
                return '🏆';
            default:
                return '🎁';
        }
    };

    const getRewardStatus = (reward) => {
        if (!attendanceData) return 'locked';
        if (attendanceData.claimedRewards.includes(reward.day)) return 'claimed';
        if (attendanceData.totalAttendance >= reward.day) return 'claimable';
        return 'locked';
    };

    const getCurrentMonthName = () => {
        const now = new Date();
        return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    };

    const getDaysInMonth = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    };

    if (!isOpen) return null;

    return (
        <div className="monthly-modal-overlay" onClick={onClose}>
            <div className="monthly-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="monthly-modal-header">
                    <h2>📅 {getCurrentMonthName()} 출석 보상</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* 출석 현황 */}
                <div className="attendance-summary">
                    <div className="summary-item">
                        <span className="summary-icon">✅</span>
                        <span className="summary-label">이번 달 출석</span>
                        <span className="summary-value">{attendanceData?.totalAttendance || 0}일</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-icon">🎯</span>
                        <span className="summary-label">만근까지</span>
                        <span className="summary-value">{Math.max(0, 26 - (attendanceData?.totalAttendance || 0))}일</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-icon">📆</span>
                        <span className="summary-label">남은 일수</span>
                        <span className="summary-value">{getDaysInMonth() - new Date().getDate()}일</span>
                    </div>
                </div>

                {/* 진행률 바 */}
                <div className="attendance-progress">
                    <div className="progress-bar-container">
                        <div 
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(100, ((attendanceData?.totalAttendance || 0) / 26) * 100)}%` }}
                        />
                    </div>
                    <span className="progress-text">{attendanceData?.totalAttendance || 0} / 26일</span>
                </div>

                {/* 보상 그리드 */}
                <div className="rewards-grid">
                    {MONTHLY_REWARDS.map((reward) => {
                        const status = getRewardStatus(reward);
                        return (
                            <div 
                                key={reward.day}
                                className={`reward-card ${status} ${claimAnimation === reward.day ? 'claiming' : ''}`}
                                onClick={() => status === 'claimable' && handleClaimReward(reward.day)}
                            >
                                <div className="reward-day">Day {reward.day}</div>
                                <div className="reward-icon">{getRewardIcon(reward)}</div>
                                <div className="reward-name">{reward.name}</div>
                                {status === 'claimed' && <div className="claimed-badge">✓</div>}
                                {status === 'claimable' && <div className="claim-badge">받기</div>}
                                {status === 'locked' && <div className="locked-badge">🔒</div>}
                            </div>
                        );
                    })}
                </div>

                {/* 안내 문구 */}
                <div className="monthly-modal-footer">
                    <p>💡 한 달에 26일만 출석해도 모든 보상을 받을 수 있어요!</p>
                    <p>🔄 매월 1일에 자동으로 초기화됩니다.</p>
                </div>
            </div>

            <ShareRewardModal
                isOpen={shareModal.isOpen}
                onClose={() => setShareModal({ isOpen: false, data: null })}
                shareType="monthlyAttendance"
                shareData={shareModal.data}
            />
        </div>
    );
};

export default MonthlyAttendanceModal;

