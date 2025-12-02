import React, { useState } from 'react';
import { hazardLogs, points } from '../utils/storage';

const HazardQuestModal = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [mainCategory, setMainCategory] = useState(null);
    const [subCategory, setSubCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen) return null;

    // 단계 1: 주 작업 종류
    const mainCategories = [
        { id: 'height', name: '고소작업', icon: '🏗️' },
        { id: 'fire', name: '화기작업', icon: '🔥' },
        { id: 'confined', name: '밀폐작업', icon: '🕳️' },
        { id: 'heavy', name: '중장비작업', icon: '🚜' },
        { id: 'other', name: '기타', icon: '⚠️' }
    ];

    // 단계 2: 세부 위험 요인
    const subCategories = {
        height: [
            { id: 'ladder', name: '사다리' },
            { id: 'scaffold', name: '비계' },
            { id: 'lift', name: '테이블리프트' },
            { id: 'fall', name: '추락 위험' }
        ],
        fire: [
            { id: 'welding', name: '용접/용단' },
            { id: 'spark', name: '불티 비산' },
            { id: 'gas', name: '가스 폭발' },
            { id: 'flammable', name: '인화성 물질' }
        ],
        confined: [
            { id: 'oxygen', name: '산소결핍' },
            { id: 'toxic', name: '유해가스' },
            { id: 'ventilation', name: '환기 불량' },
            { id: 'narrow', name: '출입구 협소' }
        ],
        heavy: [
            { id: 'forklift', name: '지게차' },
            { id: 'crane', name: '크레인' },
            { id: 'excavator', name: '굴착기' },
            { id: 'collision', name: '충돌 위험' }
        ],
        other: [
            { id: 'mess', name: '정리정돈 불량' },
            { id: 'posture', name: '불안전한 자세' },
            { id: 'ppe', name: '보호구 미착용' },
            { id: 'unqualified', name: '무자격 작업' }
        ]
    };

    const handleMainSelect = (category) => {
        setMainCategory(category);
        setStep(2);
    };

    const handleSubSelect = (category) => {
        setSubCategory(category);
    };

    const handleSubmit = () => {
        if (!mainCategory || !subCategory) return;

        setIsSubmitting(true);

        // 데이터 저장 시뮬레이션
        setTimeout(() => {
            const rewardPoints = 100;
            const log = {
                logId: crypto.randomUUID(),
                userId: 'current-user', // 실제로는 로그인된 사용자 ID
                questDate: new Date().toISOString().split('T')[0],
                mainCategory: mainCategory.name,
                subCategory: subCategory.name,
                pointAwarded: rewardPoints, // 암호화 필요 (여기서는 생략)
                createdAt: new Date().toISOString()
            };

            hazardLogs.add(log);
            points.add(rewardPoints);

            setIsSubmitting(false);
            setShowSuccess(true);

            // 2초 후 모달 닫기
            setTimeout(() => {
                onComplete(rewardPoints);
                onClose();
                // 상태 초기화
                setStep(1);
                setMainCategory(null);
                setSubCategory(null);
                setShowSuccess(false);
            }, 2000);
        }, 1000);
    };

    return (
        <div className="hazard-modal-overlay">
            <div className="hazard-modal-content">
                {showSuccess ? (
                    <div className="success-animation">
                        <div className="hologram-circle"></div>
                        <h2>QUEST COMPLETED!</h2>
                        <div className="points-fly">+100 Point Acquired!</div>
                    </div>
                ) : (
                    <>
                        <div className="modal-header">
                            <h2>⚠️ 찾아라 위험!</h2>
                            <button className="close-btn" onClick={onClose}>×</button>
                        </div>

                        <div className="progress-steps">
                            <div className={`step ${step >= 1 ? 'active' : ''}`}>1. 작업 선택</div>
                            <div className="line"></div>
                            <div className={`step ${step >= 2 ? 'active' : ''}`}>2. 위험 요인</div>
                        </div>

                        <div className="modal-body">
                            {step === 1 && (
                                <div className="category-grid">
                                    {mainCategories.map(cat => (
                                        <div
                                            key={cat.id}
                                            className="hazard-card"
                                            onClick={() => handleMainSelect(cat)}
                                        >
                                            <div className="icon">{cat.icon}</div>
                                            <div className="name">{cat.name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="sub-category-list">
                                    <h3>{mainCategory.icon} {mainCategory.name}의 위험 요인은?</h3>
                                    <div className="options-grid">
                                        {subCategories[mainCategory.id].map(sub => (
                                            <div
                                                key={sub.id}
                                                className={`option-card ${subCategory?.id === sub.id ? 'selected' : ''}`}
                                                onClick={() => handleSubSelect(sub)}
                                            >
                                                <div className="checkbox-futuristic">
                                                    <div className="dot"></div>
                                                </div>
                                                <span>{sub.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="actions">
                                        <button className="btn-back" onClick={() => setStep(1)}>이전</button>
                                        <button
                                            className="btn-submit"
                                            disabled={!subCategory || isSubmitting}
                                            onClick={handleSubmit}
                                        >
                                            {isSubmitting ? '전송 중...' : '위험 등록하기'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HazardQuestModal;
