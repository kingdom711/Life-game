/**
 * 긴급 작업중지 플로팅 버튼
 *
 * 계획서 2-2: 어떤 화면에서든 1터치 접근 가능한 빨간 플로팅 버튼
 * - 항상 화면 우하단에 표시
 * - 터치 시 확인 다이얼로그 → 위험 유형 선택 → 즉시 전파
 * - 오터치 방지를 위한 확인 단계 포함
 */

import { useState } from 'react';

function WorkStopButton({ onActivate }) {
    const [isPulsing, setIsPulsing] = useState(true);

    const handleClick = () => {
        setIsPulsing(false);
        if (onActivate) onActivate();
    };

    return (
        <button
            onClick={handleClick}
            style={{
                position: 'fixed',
                bottom: '100px',
                right: '20px',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 900,
                cursor: 'pointer',
                zIndex: 1500,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isPulsing
                    ? '0 4px 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.3)'
                    : '0 4px 15px rgba(220, 38, 38, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                animation: isPulsing ? 'workStopPulse 2s ease-in-out infinite' : 'none',
                WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
            title="긴급 작업중지"
        >
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>✋</span>
            <span style={{ fontSize: '0.5rem', fontWeight: 700, marginTop: '1px', letterSpacing: '-0.02em' }}>중지</span>

            {/* CSS Animation */}
            <style>{`
                @keyframes workStopPulse {
                    0%, 100% {
                        box-shadow: 0 4px 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.3);
                    }
                    50% {
                        box-shadow: 0 4px 30px rgba(220, 38, 38, 0.8), 0 0 60px rgba(220, 38, 38, 0.5);
                    }
                }
            `}</style>
        </button>
    );
}

export default WorkStopButton;
