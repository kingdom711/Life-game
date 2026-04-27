import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX } from 'lucide-react';

const BackgroundMusic = ({ src, isPlaying, volume = 0.5 }) => {
    const audioRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [controlTarget, setControlTarget] = useState(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const updateControlTarget = () => {
            setControlTarget(document.getElementById('dashboard-bgm-control-slot'));
        };

        updateControlTarget();

        const observer = new MutationObserver(updateControlTarget);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
        };
    }, []);

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

    const control = (
        <button
            type="button"
            className={`bgm-controls${controlTarget ? ' bgm-controls--inline' : ''}`}
            onClick={toggleMute}
            aria-label={isMuted ? '배경음악 켜기' : '배경음악 음소거'}
            title={isMuted ? '배경음악 켜기' : '배경음악 음소거'}
        >
            <audio
                ref={audioRef}
                src={src}
                loop
                preload="auto"
            />
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
    );

    return controlTarget ? createPortal(control, controlTarget) : control;
};

export default BackgroundMusic;
