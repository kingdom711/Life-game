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
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 22, 40, 0.95) 100%)',
            color: 'white',
            transition: 'opacity 0.5s ease-in-out'
        }}>
            {/* 배경 이미지 오버레이 (index.css의 body 배경과 일치) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: "url('/bg-construction.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.3,
                zIndex: -1
            }} />

            <div className="logo-container" style={{
                marginBottom: '3rem',
                textAlign: 'center',
                animation: 'bounce 2s infinite'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏗️</div>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #38bdf8, #818cf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 20px rgba(56, 189, 248, 0.5)'
                }}>
                    중대재해 멈춰!
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>안전관리 퀘스트 게임</p>
            </div>

            <button
                onClick={handleStart}
                className="btn btn-primary btn-lg"
                style={{
                    padding: '1rem 3rem',
                    fontSize: '1.5rem',
                    borderRadius: '50px',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                    animation: 'pulse 2s infinite'
                }}
            >
                TOUCH TO START
            </button>

            <div style={{
                position: 'absolute',
                bottom: '2rem',
                color: '#64748b',
                fontSize: '0.8rem'
            }}>
                © 2024 Safety Quest Game. All rights reserved.
            </div>
        </div>
    );
};

export default LaunchScreen;
