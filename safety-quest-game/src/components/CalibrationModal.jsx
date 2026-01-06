import React, { useState, useEffect } from 'react';
import { getCalibrationInfo, attemptCalibration, ensureItemInstance } from '../utils/calibrationService';
import { points } from '../utils/storage';
import { getRarityColor, RARITY_NAMES } from '../data/itemsData';

/**
 * 검교정(강화) 모달 - High-Tech Lab 컨셉
 */
const CalibrationModal = ({ isOpen, onClose, itemId, onCalibrationComplete }) => {
    const [calibrationInfo, setCalibrationInfo] = useState(null);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [result, setResult] = useState(null);
    const [currentPoints, setCurrentPoints] = useState(0);

    useEffect(() => {
        if (isOpen && itemId) {
            loadCalibrationInfo();
            setCurrentPoints(points.get());
            setResult(null);
        }
    }, [isOpen, itemId]);

    const loadCalibrationInfo = () => {
        // 인스턴스가 없으면 생성
        ensureItemInstance(itemId);
        const info = getCalibrationInfo(itemId);
        setCalibrationInfo(info);
    };

    const handleCalibrate = async () => {
        if (!calibrationInfo?.instanceId || isCalibrating) return;

        setIsCalibrating(true);
        setResult(null);

        // 연출을 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 1500));

        const calibrationResult = attemptCalibration(calibrationInfo.instanceId);
        setResult(calibrationResult);
        setCurrentPoints(points.get());
        
        // 정보 새로고침
        loadCalibrationInfo();
        setIsCalibrating(false);

        if (onCalibrationComplete) {
            onCalibrationComplete(calibrationResult);
        }
    };

    if (!isOpen) return null;

    const canAfford = currentPoints >= (calibrationInfo?.cost || 0);
    const canCalibrate = calibrationInfo?.canCalibrate && canAfford;

    return (
        <div className="calibration-modal-overlay">
            <div className="calibration-modal-content">
                {/* 닫기 버튼 */}
                <button className="calibration-close-btn" onClick={onClose}>
                    ×
                </button>

                {/* 헤더 */}
                <div className="calibration-header">
                    <h2>장비 검교정 시스템</h2>
                    <p>장비 강화</p>
                </div>

                {calibrationInfo && (
                    <>
                        {/* 아이템 디스플레이 */}
                        <div className="calibration-item-display">
                            <div className={`calibration-item-float ${isCalibrating ? 'calibrating' : ''} ${result?.success ? 'success' : ''} ${result && !result.success ? 'failure' : ''}`}>
                                <div className="calibration-item-glow" style={{ 
                                    '--rarity-color': getRarityColor(calibrationInfo.rarity) 
                                }} />
                                <img 
                                    src={calibrationInfo.preview?.currentStats ? `/item/${itemId.split('_').slice(0, 2).join('-')}.png` : '/item/helmet-common.png'}
                                    alt={calibrationInfo.itemName}
                                    className="calibration-item-image"
                                    onError={(e) => {
                                        e.target.src = '/item/helmet-common.png';
                                    }}
                                />
                                <div className="calibration-level-badge">
                                    +{calibrationInfo.currentLevel}
                                </div>
                            </div>

                            {/* 아이템 정보 */}
                            <div className="calibration-item-info">
                                <h3>{calibrationInfo.itemName}</h3>
                                <span 
                                    className="calibration-rarity-badge"
                                    style={{ backgroundColor: getRarityColor(calibrationInfo.rarity) }}
                                >
                                    {RARITY_NAMES[calibrationInfo.rarity]}
                                </span>
                            </div>
                        </div>

                        {/* 스탯 비교 */}
                        <div className="calibration-stats-compare">
                            <div className="calibration-stats-current">
                                <h4>현재 스탯</h4>
                                <div className="stat-row">
                                    <span className="stat-label">포인트 부스트</span>
                                    <span className="stat-value current">{calibrationInfo.preview?.currentStats?.pointBoost || 0}%</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">XP 가속</span>
                                    <span className="stat-value current">{calibrationInfo.preview?.currentStats?.xpAccelerator || 0}%</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">스트릭 보호</span>
                                    <span className="stat-value current">{calibrationInfo.preview?.currentStats?.streakSaver || 0}%</span>
                                </div>
                            </div>

                            <div className="calibration-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>

                            <div className="calibration-stats-next">
                                <h4>예상 스탯 <span className="next-level">+{(calibrationInfo.currentLevel || 0) + 1}</span></h4>
                                <div className="stat-row">
                                    <span className="stat-label">포인트 부스트</span>
                                    <span className="stat-value next">
                                        {calibrationInfo.preview?.nextStats?.pointBoost || 0}%
                                        <span className="stat-diff">+{calibrationInfo.preview?.statDiff?.pointBoost || 0}</span>
                                    </span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">XP 가속</span>
                                    <span className="stat-value next">
                                        {calibrationInfo.preview?.nextStats?.xpAccelerator || 0}%
                                        <span className="stat-diff">+{calibrationInfo.preview?.statDiff?.xpAccelerator || 0}</span>
                                    </span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">스트릭 보호</span>
                                    <span className="stat-value next">
                                        {calibrationInfo.preview?.nextStats?.streakSaver || 0}%
                                        <span className="stat-diff">+{calibrationInfo.preview?.statDiff?.streakSaver || 0}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 검교정 정보 */}
                        <div className="calibration-info-panel">
                            <div className="info-item">
                                <span className="info-label">현재 레벨</span>
                                <span className="info-value">{calibrationInfo.currentLevel} / {calibrationInfo.maxLevel}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">성공 확률</span>
                                <span className="info-value success-rate">{calibrationInfo.successRatePercent}%</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">필요 포인트</span>
                                <span className={`info-value cost ${!canAfford ? 'insufficient' : ''}`}>
                                    {calibrationInfo.cost?.toLocaleString()}P
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">보유 포인트</span>
                                <span className="info-value balance">{currentPoints.toLocaleString()}P</span>
                            </div>
                        </div>

                        {/* 결과 표시 */}
                        {result && (
                            <div className={`calibration-result ${result.success ? 'success' : 'failure'}`}>
                                {result.success ? (
                                    <>
                                        <div className="result-icon success-icon">✓</div>
                                        <div className="result-text">
                                            <h4>CALIBRATION COMPLETE</h4>
                                            <p>+{result.newLevel} 달성!</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="result-icon failure-icon">✗</div>
                                        <div className="result-text">
                                            <h4>CALIBRATION FAILED</h4>
                                            <p>{result.message}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* 검교정 버튼 */}
                        <div className="calibration-actions">
                            {calibrationInfo.currentLevel >= calibrationInfo.maxLevel ? (
                                <button className="calibration-btn max-level" disabled>
                                    MAX LEVEL
                                </button>
                            ) : (
                                <button 
                                    className={`calibration-btn ${canCalibrate ? 'active' : 'disabled'} ${isCalibrating ? 'calibrating' : ''}`}
                                    onClick={handleCalibrate}
                                    disabled={!canCalibrate || isCalibrating}
                                >
                                    {isCalibrating ? (
                                        <span className="calibrating-text">
                                            <span className="spinner"></span>
                                            강화 중...
                                        </span>
                                    ) : (
                                        <>
                                            강화
                                            <span className="btn-cost">[{calibrationInfo.cost?.toLocaleString()}P]</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* 진행도 바 */}
                        <div className="calibration-progress">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ 
                                        width: `${(calibrationInfo.currentLevel / calibrationInfo.maxLevel) * 100}%`,
                                        '--rarity-color': getRarityColor(calibrationInfo.rarity)
                                    }}
                                />
                            </div>
                            <div className="progress-levels">
                                {Array.from({ length: calibrationInfo.maxLevel + 1 }, (_, i) => (
                                    <div 
                                        key={i} 
                                        className={`level-marker ${i <= calibrationInfo.currentLevel ? 'achieved' : ''}`}
                                    >
                                        {i}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {!calibrationInfo && (
                    <div className="calibration-loading">
                        <div className="loading-spinner"></div>
                        <p>장비 정보를 불러오는 중...</p>
                    </div>
                )}
            </div>

            {/* 성공 이펙트 */}
            {result?.success && (
                <div className="calibration-success-effect">
                    <div className="success-wave"></div>
                    <div className="success-particles">
                        {Array.from({ length: 20 }, (_, i) => (
                            <div key={i} className="particle" style={{ '--delay': `${i * 0.05}s` }} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalibrationModal;

