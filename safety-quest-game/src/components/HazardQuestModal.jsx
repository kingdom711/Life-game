import React, { useState, useEffect, useRef } from 'react';
import { dailyQuestInstances, hazardIdentificationLogs, points, userProfile } from '../utils/storage';

const HazardQuestModal = ({ isOpen, onClose, onComplete }) => {
    const [questInstance, setQuestInstance] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [tempMarker, setTempMarker] = useState(null); // { x, y }
    const [inputText, setInputText] = useState('');
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const imageRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            initializeQuest();
        } else {
            // Reset state on close
            setMarkers([]);
            setTempMarker(null);
            setInputText('');
            setError('');
            setShowSuccess(false);
        }
    }, [isOpen]);

    // Focus input when tempMarker is set
    useEffect(() => {
        if (tempMarker && inputRef.current) {
            inputRef.current.focus();
        }
    }, [tempMarker]);

    const initializeQuest = () => {
        const userId = userProfile.getName() || 'guest';
        const instance = dailyQuestInstances.getTodayInstance(userId);
        setQuestInstance(instance);

        // 이미 완료한 경우 처리 (Dashboard에서 막겠지만 이중 체크)
        if (instance.isCompleted) {
            // alert("오늘은 이미 퀘스트를 완료했습니다.");
            // onClose();
        }
    };

    const handleImageClick = (e) => {
        if (tempMarker || isSubmitting || showSuccess) return;

        if (markers.length >= 5) {
            showError("위험 요인은 최대 5개까지만 마킹할 수 있습니다.");
            return;
        }

        const rect = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setTempMarker({ x, y });
        setInputText('');
        setError('');
    };

    const handleInputSubmit = () => {
        if (inputText.length < 5) {
            showError("위험 요인 설명은 5자 이상 상세히 작성해 주세요.");
            return;
        }
        if (inputText.length > 250) {
            showError("설명은 250자 이하로 작성해 주세요.");
            return;
        }

        // Add marker
        setMarkers([...markers, { ...tempMarker, text: inputText }]);
        setTempMarker(null);
        setInputText('');

        // Play sound (simulated)
        // new Audio('/sounds/mark_success.mp3').play().catch(() => {});
    };

    const handleCancelMarker = () => {
        setTempMarker(null);
        setInputText('');
        setError('');
    };

    const handleRemoveMarker = (index) => {
        const newMarkers = [...markers];
        newMarkers.splice(index, 1);
        setMarkers(newMarkers);
    };

    const handleSubmitQuest = async () => {
        if (markers.length < 1) {
            showError("최소 1개 이상의 위험 요인을 찾아주세요.");
            return;
        }

        setIsSubmitting(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save logs
        markers.forEach(marker => {
            hazardIdentificationLogs.add(questInstance.id, marker.x, marker.y, marker.text);
        });

        // Complete quest instance
        dailyQuestInstances.complete(questInstance.id);

        // Award points
        const rewardPoints = 100 + (markers.length * 10); // 기본 100 + 개당 10
        points.add(rewardPoints);

        setIsSubmitting(false);
        setShowSuccess(true);

        // Close after animation
        setTimeout(() => {
            if (onComplete) onComplete(rewardPoints);
            onClose();
        }, 3000);
    };

    const showError = (msg) => {
        setError(msg);
        setTimeout(() => setError(''), 3000);
    };

    if (!isOpen || !questInstance) return null;

    return (
        <div className="hazard-modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            {showSuccess ? (
                <div className="success-animation" style={{ textAlign: 'center', color: '#fff' }}>
                    <div className="hologram-circle" style={{
                        width: '150px', height: '150px',
                        border: '4px solid #00ff88', borderRadius: '50%',
                        margin: '0 auto 2rem',
                        boxShadow: '0 0 30px #00ff88',
                        animation: 'pulse 1.5s infinite'
                    }}></div>
                    <h1 style={{ fontSize: '3rem', textShadow: '0 0 20px #00ff88', marginBottom: '1rem' }}>QUEST COMPLETED!</h1>
                    <div style={{ fontSize: '1.5rem', color: '#00ff88' }}>일일 퀘스트 완료</div>
                </div>
            ) : (
                <div className="hazard-modal-content" style={{
                    position: 'relative',
                    width: '95%', maxWidth: '1000px', height: '90vh',
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #4a4e69',
                    borderRadius: '10px',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem 2rem',
                        borderBottom: '1px solid #4a4e69',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'rgba(255,255,255,0.05)'
                    }}>
                        <div>
                            <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ⚠️ 위험요인 찾기
                                <span style={{ fontSize: '0.8rem', background: '#333', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#aaa' }}>
                                    Daily Quest
                                </span>
                            </h2>
                            <p style={{ color: '#aaa', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                                사진 속 위험 요인을 찾아 클릭하고 설명을 작성하세요. (찾은 개수: {markers.length}/5)
                            </p>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer'
                        }}>×</button>
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                        <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
                            <img
                                ref={imageRef}
                                src={questInstance.photoUrl}
                                alt="Hazard Quest"
                                onClick={handleImageClick}
                                style={{
                                    display: 'block',
                                    maxWidth: '100%',
                                    maxHeight: 'calc(90vh - 150px)',
                                    cursor: tempMarker ? 'default' : 'crosshair',
                                    border: '2px solid #00ff88',
                                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
                                }}
                            />

                            {/* Existing Markers */}
                            {markers.map((marker, index) => (
                                <div key={index} style={{
                                    position: 'absolute',
                                    left: `${marker.x * 100}%`,
                                    top: `${marker.y * 100}%`,
                                    width: '40px', height: '40px',
                                    transform: 'translate(-50%, -50%)',
                                    border: '3px solid #ff3333',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 51, 51, 0.2)',
                                    boxShadow: '0 0 10px #ff3333',
                                    cursor: 'pointer',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    color: '#fff', fontWeight: 'bold', textShadow: '0 0 2px #000'
                                }} onClick={(e) => { e.stopPropagation(); handleRemoveMarker(index); }}>
                                    {index + 1}
                                    <div style={{
                                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                        background: 'rgba(0,0,0,0.8)', padding: '0.2rem 0.5rem', borderRadius: '4px',
                                        fontSize: '0.8rem', whiteSpace: 'nowrap', marginTop: '5px', pointerEvents: 'none'
                                    }}>
                                        {marker.text}
                                    </div>
                                </div>
                            ))}

                            {/* Temp Marker & Input */}
                            {tempMarker && (
                                <>
                                    <div style={{
                                        position: 'absolute',
                                        left: `${tempMarker.x * 100}%`,
                                        top: `${tempMarker.y * 100}%`,
                                        width: '40px', height: '40px',
                                        transform: 'translate(-50%, -50%)',
                                        border: '3px solid #00ff88',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                        boxShadow: '0 0 15px #00ff88',
                                        animation: 'pulse 1s infinite'
                                    }} />

                                    {/* Input Popover */}
                                    <div style={{
                                        position: 'absolute',
                                        left: `${tempMarker.x * 100}%`,
                                        top: `calc(${tempMarker.y * 100}% + 30px)`,
                                        transform: 'translateX(-50%)',
                                        background: 'rgba(0, 20, 0, 0.9)',
                                        border: '1px solid #00ff88',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        width: '250px',
                                        zIndex: 10,
                                        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                                    }} onClick={e => e.stopPropagation()}>
                                        <div style={{ color: '#00ff88', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                            위험 요인 설명
                                        </div>
                                        <textarea
                                            ref={inputRef}
                                            value={inputText}
                                            onChange={e => setInputText(e.target.value)}
                                            placeholder="예: 작업자가 안전모를 착용하지 않았습니다."
                                            style={{
                                                width: '100%', height: '80px',
                                                background: '#0a0a0a', border: '1px solid #333',
                                                color: '#fff', padding: '0.5rem', borderRadius: '4px',
                                                resize: 'none', marginBottom: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleInputSubmit();
                                                }
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={handleCancelMarker} style={{
                                                flex: 1, padding: '0.4rem', background: '#333', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer'
                                            }}>취소</button>
                                            <button onClick={handleInputSubmit} style={{
                                                flex: 1, padding: '0.4rem', background: '#00ff88', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer'
                                            }}>확인</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer / Error Message */}
                    <div style={{
                        padding: '1rem 2rem',
                        borderTop: '1px solid #4a4e69',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ color: '#ff4444', fontWeight: 'bold', height: '1.5rem' }}>
                            {error}
                        </div>
                        <button
                            onClick={handleSubmitQuest}
                            disabled={markers.length === 0 || isSubmitting || tempMarker}
                            style={{
                                padding: '0.8rem 2rem',
                                background: markers.length > 0 ? 'linear-gradient(45deg, #00ff88, #00cc6a)' : '#333',
                                color: markers.length > 0 ? '#000' : '#666',
                                border: 'none', borderRadius: '30px',
                                fontWeight: 'bold', fontSize: '1.1rem',
                                cursor: markers.length > 0 ? 'pointer' : 'not-allowed',
                                boxShadow: markers.length > 0 ? '0 0 20px rgba(0, 255, 136, 0.4)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isSubmitting ? '제출 중...' : '퀘스트 완료 및 로그 제출'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HazardQuestModal;
