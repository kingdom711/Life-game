import React, { useState, useEffect } from 'react';

const LaunchScreen = ({ onStart }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    const handleStart = () => {
        setIsFading(true);
        setTimeout(() => {
            onStart();
        }, 500); // 페이드 아웃 시간
    };

    if (!isVisible) return null;

    return (
        <div className={`launch-screen ${isFading ? 'fade-out' : ''}`} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(240, 249, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
            color: 'var(--color-text)',
            transition: 'opacity 0.5s ease-in-out'
        }}>
            {/* 배경 이미지 오버레이 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: "url('/bg_bright_construction.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.5,
                zIndex: -1
            }} />

            <div className="logo-container" style={{
                marginBottom: '3rem',
                textAlign: 'center',
                animation: 'bounce 2s infinite'
            }}>
                <div style={{ marginBottom: '1rem' }}>
                    <img
                        src="/safety_road_logo.png"
                        alt="안전의 길 로고"
                        style={{
                            width: '180px',
                            height: '180px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))'
                        }}
                    />
                </div>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 10px rgba(37, 99, 235, 0.2)',
                    margin: 0
                }}>
                    안전의 길
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', fontWeight: '600', marginTop: '0.5rem' }}>안전관리 퀘스트 게임</p>
            </div>

            <button
                onClick={handleStart}
                className="btn btn-primary btn-lg"
                style={{
                    padding: '1rem 3rem',
                    fontSize: '1.5rem',
                    borderRadius: '50px',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                    animation: 'pulse 2s infinite'
                }}
            >
                TOUCH TO START
            </button>

            <div style={{
                position: 'absolute',
                bottom: '2rem',
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem'
            }}>
                © 2024 Safety Quest Game. All rights reserved.
            </div>
        </div>
    );
};

export default LaunchScreen;
