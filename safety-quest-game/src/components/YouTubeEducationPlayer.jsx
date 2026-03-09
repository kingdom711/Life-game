import { useState, useRef, useEffect, useCallback } from 'react';
import { educationProgress } from '../utils/storage';

/**
 * YouTube 교육 비디오 플레이어 컴포넌트
 * 
 * 누적 시청 시간을 직접 localStorage에서 관리합니다.
 */
const YouTubeEducationPlayer = ({
    youtubeVideoId,
    duration,
    requiredWatchTime,
    onTimeUpdate,
    onVideoComplete,
    educationId  // 교육 ID (localStorage 저장용)
}) => {
    const playerContainerRef = useRef(null);
    const playerRef = useRef(null);
    const timeCheckIntervalRef = useRef(null);

    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalWatchedTime, setTotalWatchedTime] = useState(0);  // 총 누적 시간
    const [isCompleted, setIsCompleted] = useState(false);

    // localStorage에서 누적 시간 불러오기
    const loadCumulativeTime = useCallback(() => {
        return educationProgress.getCumulativeWatchTime(educationId);
    }, [educationId]);

    // localStorage에 누적 시간 저장
    const saveCumulativeTime = useCallback((time) => {
        try {
            educationProgress.updateCumulativeWatchTime(educationId, time);
        } catch (e) {
            console.warn('누적 시간 저장 실패:', e);
        }
    }, [educationId]);

    // 컴포넌트 마운트 시 누적 시간 불러오기
    useEffect(() => {
        const savedTime = loadCumulativeTime();
        setTotalWatchedTime(savedTime);

        // 이미 완료 상태인지 확인
        if (savedTime >= requiredWatchTime) {
            setIsCompleted(true);
        }
    }, [educationId, loadCumulativeTime, requiredWatchTime]);

    const progress = Math.min(100, (totalWatchedTime / requiredWatchTime) * 100);

    // YouTube IFrame API 로드
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            initializePlayer();
            return;
        }

        const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (!existingScript) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            initializePlayer();
        };

        const checkAPIReady = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(checkAPIReady);
                initializePlayer();
            }
        }, 100);

        return () => clearInterval(checkAPIReady);
    }, [youtubeVideoId]);

    // 플레이어 초기화
    const initializePlayer = useCallback(() => {
        if (!playerContainerRef.current || playerRef.current) return;

        playerRef.current = new window.YT.Player(playerContainerRef.current, {
            videoId: youtubeVideoId,
            playerVars: {
                'playsinline': 1,
                'controls': 1,
                'fs': 1,
                'modestbranding': 1,
                'rel': 0,
            },
            events: {
                'onReady': () => setIsReady(true),
                'onStateChange': onPlayerStateChange,
            }
        });
    }, [youtubeVideoId]);

    // 플레이어 상태 변경
    const onPlayerStateChange = (event) => {
        const state = event.data;

        if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTimeCheck();
        } else {
            setIsPlaying(false);
            stopTimeCheck();
        }
    };

    // 시간 체크 시작 - 단순하게 1초마다 1초 추가
    const startTimeCheck = () => {
        if (timeCheckIntervalRef.current) return;

        timeCheckIntervalRef.current = setInterval(() => {
            if (!playerRef.current) return;

            try {
                const player = playerRef.current;
                const currentVideoTime = player.getCurrentTime();
                setCurrentTime(currentVideoTime);

                // 누적 시간 1초 증가
                setTotalWatchedTime(prev => {
                    const newTime = prev + 1;
                    // localStorage에 저장
                    saveCumulativeTime(newTime);
                    // 부모에게 알림
                    onTimeUpdate?.(currentVideoTime, newTime);
                    return newTime;
                });
            } catch (error) {
                console.warn('시간 체크 오류:', error);
            }
        }, 1000);
    };

    // 시간 체크 중지
    const stopTimeCheck = () => {
        if (timeCheckIntervalRef.current) {
            clearInterval(timeCheckIntervalRef.current);
            timeCheckIntervalRef.current = null;
        }
    };

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            stopTimeCheck();
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, []);

    // 시청 완료 체크
    useEffect(() => {
        if (totalWatchedTime >= requiredWatchTime && !isCompleted) {
            setIsCompleted(true);
            onVideoComplete?.();
        }
    }, [totalWatchedTime, requiredWatchTime, isCompleted, onVideoComplete]);

    // 시간 포맷팅
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const remainingTime = Math.max(0, requiredWatchTime - totalWatchedTime);
    const remainingMinutes = Math.ceil(remainingTime / 60);

    return (
        <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl">
            {/* YouTube 플레이어 */}
            <div className="relative aspect-video">
                <div ref={playerContainerRef} className="absolute inset-0 w-full h-full" />

                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-white">영상을 불러오는 중...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 완료 배지 */}
            {isCompleted && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 z-10">
                    <span>✓</span>
                    <span>시청 완료</span>
                </div>
            )}

            {/* 하단 정보 바 */}
            <div className="bg-gradient-to-t from-black/90 to-transparent p-4">
                {/* 진행률 바 */}
                <div className="relative h-3 bg-gray-600 rounded-full mb-4">
                    <div
                        className={`absolute h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* 정보 표시 */}
                <div className="flex items-center justify-between text-sm">
                    <div className="text-white">
                        <span className="text-gray-400">재생: </span>
                        <span>{formatTime(currentTime)}</span>
                        <span className="text-gray-400"> / {formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-white">
                            <span className="text-gray-400">누적: </span>
                            <span className="text-blue-400 font-bold">{formatTime(totalWatchedTime)}</span>
                            <span className="text-gray-400"> / {formatTime(requiredWatchTime)} ({progress.toFixed(0)}%)</span>
                        </div>

                        {!isCompleted && remainingTime > 0 && (
                            <div className="text-yellow-400">
                                <span className="font-bold">{remainingMinutes}분</span>
                                <span className="text-gray-400"> 더 필요</span>
                            </div>
                        )}
                    </div>
                </div>

                {!isCompleted && (
                    <div className="mt-2 text-xs text-gray-400 text-center">
                        💡 영상을 여러 번 시청하면 시간이 누적됩니다
                    </div>
                )}
            </div>
        </div>
    );
};

export default YouTubeEducationPlayer;
