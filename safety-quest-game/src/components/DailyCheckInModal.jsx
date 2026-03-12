import React, { useEffect, useState } from 'react';
import '../styles/index.css';

const DailyCheckInModal = ({ isOpen, onClose, streakCount, bonus, onShowMonthlyRewards }) => {
    const [showFire, setShowFire] = useState(false);
    const [shieldLevel, setShieldLevel] = useState(1);

    useEffect(() => {
        if (isOpen) {
            // 애니메이션 트리거
            setTimeout(() => setShowFire(true), 500);

            // 쉴드 레벨 계산 (3, 7, 30일 기준)
            if (streakCount >= 30) setShieldLevel(3);
            else if (streakCount >= 7) setShieldLevel(2);
            else if (streakCount >= 3) setShieldLevel(1);
            else setShieldLevel(0);
        } else {
            setShowFire(false);
        }
    }, [isOpen, streakCount]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content check-in-modal">
                <div className="modal-header">
                    <h2>📅 일일 안전 서약 & 출석</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="check-in-body">
                    <div className="shield-container">
                        <div className={`shield level-${shieldLevel}`}>
                            <img src="/assets/safety_road_logo-removebg-preview.png" alt="안전의 길" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                        </div>
                        {shieldLevel > 0 && <div className="shield-label">Level {shieldLevel} Shield</div>}
                    </div>

                    <div className="streak-container">
                        <h3>연속 안전 작업</h3>
                        <div className="streak-count">
                            <span className="number">{streakCount}</span>
                            <span className="days">일째</span>
                        </div>
                        {showFire && <div className="fire-effect">🔥</div>}
                    </div>

                    <div className="message-box">
                        <p className="pledge">"나는 오늘도 안전 수칙을 준수하며<br />나와 동료의 안전을 지키겠습니다."</p>
                        <p className="reward-info">
                            기본 보상: <span className="point">+20P</span>
                            {bonus > 0 && <span className="bonus"> (보너스 +{bonus}P!)</span>}
                        </p>
                    </div>

                    <div className="check-in-buttons">
                        <button className="monthly-reward-btn" onClick={() => {
                            onClose();
                            if (onShowMonthlyRewards) onShowMonthlyRewards();
                        }}>
                            📅 월간 출석 보상 확인
                        </button>
                        <button className="confirm-btn" onClick={onClose}>
                            확인
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    .check-in-modal {
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                        border: 2px solid #3b82f6;
                        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                        color: white;
                        text-align: center;
                        max-width: 400px;
                    }
                    .shield-container {
                        margin: 20px 0;
                        position: relative;
                    }
                    .shield {
                        font-size: 4rem;
                        transition: all 0.5s ease;
                    }
                    .shield.level-1 { filter: drop-shadow(0 0 10px #cd7f32); } /* Bronze */
                    .shield.level-2 { filter: drop-shadow(0 0 15px #c0c0c0); transform: scale(1.1); } /* Silver */
                    .shield.level-3 { filter: drop-shadow(0 0 20px #ffd700); transform: scale(1.2); } /* Gold */
                    
                    .streak-container {
                        margin: 20px 0;
                        position: relative;
                    }
                    .streak-count {
                        font-size: 3rem;
                        font-weight: bold;
                        color: #10b981;
                        text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
                    }
                    .fire-effect {
                        position: absolute;
                        top: -20px;
                        right: 20%;
                        font-size: 2rem;
                        animation: bounce 1s infinite;
                    }
                    .pledge {
                        font-style: italic;
                        color: #94a3b8;
                        margin-bottom: 15px;
                    }
                    .reward-info {
                        font-size: 1.1rem;
                        font-weight: bold;
                    }
                    .point { color: #fbbf24; }
                    .bonus { color: #f472b6; animation: pulse 1s infinite; }
                    
                    .check-in-buttons {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        margin-top: 20px;
                        align-items: center;
                    }
                    .monthly-reward-btn {
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 20px;
                        font-size: 1.05rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
                        width: 100%;
                        max-width: 280px;
                    }
                    .monthly-reward-btn:hover {
                        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                        transform: translateY(-1px);
                        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
                    }
                    .confirm-btn {
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 10px 30px;
                        border-radius: 20px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: background 0.2s;
                        width: 100%;
                        max-width: 280px;
                    }
                    .confirm-btn:hover {
                        background: #2563eb;
                    }

                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default DailyCheckInModal;
