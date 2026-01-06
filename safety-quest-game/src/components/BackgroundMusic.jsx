import React, { useEffect, useRef, useState } from 'react';

const BackgroundMusic = ({ src, isPlaying, volume = 0.5 }) => {
    const audioRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // 사용자 상호작용 후 자동 재생
    useEffect(() => {
        const handleUserInteraction = async () => {
            if (audioRef.current && isPlaying && !hasStarted) {
                try {
                    await audioRef.current.play();
                    setHasStarted(true);
                } catch (error) {
                    console.log("Audio play failed on user interaction:", error);
                }
            }
        };

        // 다양한 사용자 상호작용 이벤트 감지
        const events = ['click', 'touchstart', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, handleUserInteraction, { once: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleUserInteraction);
            });
        };
    }, [isPlaying, hasStarted]);

    // isPlaying이 변경되면 재생/일시정지
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying && hasStarted) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Audio play failed:", error);
                    });
                }
            } else if (!isPlaying) {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, hasStarted]);

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div 
            className="bgm-controls" 
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '10px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                transition: 'all 0.3s ease'
            }} 
            onClick={toggleMute}
        >
            <audio
                ref={audioRef}
                src={src}
                loop
                preload="auto"
            />
            <span style={{ fontSize: '1.2rem' }}>
                {isMuted ? '🔇' : '🔊'}
            </span>
        </div>
    );
};

export default BackgroundMusic;
