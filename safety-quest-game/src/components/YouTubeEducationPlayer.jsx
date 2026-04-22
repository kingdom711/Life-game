import { useState, useRef, useEffect, useCallback } from 'react';
import { educationProgress } from '../utils/storage';
import educationApi from '../api/educationApi';

// 체크포인트 전송 간격 (30초)
const CHECKPOINT_INTERVAL_MS = 30_000;

/**
 * YouTube 교육 비디오 플레이어 컴포넌트
 *
 * - 누적 시청 시간을 직접 localStorage에서 관리합니다.
 * - youtubeVideoId가 배열이면 연속 재생을 지원합니다.
 * - [교육 수료 증거] 30초 간격 서버 체크포인트 + 탭 비활성화 감지
 */
const YouTubeEducationPlayer = ({
    youtubeVideoId,
    duration,
    requiredWatchTime,
    onTimeUpdate,
    onVideoComplete,
    educationId  // 교육 ID (localStorage 저장용)
}) => {
    // ─── 다중 영상 연속 재생 지원 ───
    // youtubeVideoId가 문자열이면 배열로 변환, 배열이면 그대로 사용
    const videoIds = Array.isArray(youtubeVideoId) ? youtubeVideoId : [youtubeVideoId];
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const currentVideoIndexRef = useRef(0);  // 이벤트 핸들러에서 최신 인덱스 참조용

    const playerContainerRef = useRef(null);
    const playerRef = useRef(null);
    const timeCheckIntervalRef = useRef(null);

    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalWatchedTime, setTotalWatchedTime] = useState(0);  // 총 누적 시간
    const [isCompleted, setIsCompleted] = useState(false);
    const [playlistEnded, setPlaylistEnded] = useState(false);  // 모든 영상 재생 완료 여부

    // ─── [교육 수료 증거] 체크포인트 관련 ref ─────────────────────────
    const isPlayingRef          = useRef(false);  // interval 내에서 최신 재생 상태 참조
    const currentTimeRef        = useRef(0);      // interval 내에서 최신 재생 위치 참조
    const tabVisibleRef         = useRef(true);   // 탭 활성화 여부
    const checkpointIntervalRef = useRef(null);

    // currentVideoIndex ref 동기화
    useEffect(() => {
        currentVideoIndexRef.current = currentVideoIndex;
    }, [currentVideoIndex]);

    /**
     * [교육 수료 증거] 체크포인트 서버 전송
     * fire-and-forget — 실패해도 플레이어 동작에 영향 없음
     */
    const sendCheckpoint = useCallback((playing) => {
        if (!educationId) return;

        educationApi.saveCheckpoint({
            educationId,
            checkpointSec: Math.floor(currentTimeRef.current),
            totalSec:      Math.floor(duration),
            isPlaying:     playing,
            tabVisible:    tabVisibleRef.current,
        }).catch(() => {
            // 네트워크 오류 시 조용히 무시
        });
    }, [educationId, duration]);

    // ─── [교육 수료 증거] 탭 가시성 변경 감지 ────────────────────────
    useEffect(() => {
        const handleVisibilityChange = () => {
            const visible = document.visibilityState === 'visible';
            tabVisibleRef.current = visible;

            // 탭이 숨겨지면 영상 일시정지 + 체크포인트 즉시 전송
            if (!visible) {
                try {
                    playerRef.current?.pauseVideo?.();
                } catch (e) { /* noop */ }
                sendCheckpoint(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [sendCheckpoint]);

    // ─── [교육 수료 증거] 30초 체크포인트 인터벌 ─────────────────────
    useEffect(() => {
        checkpointIntervalRef.current = setInterval(() => {
            if (isPlayingRef.current && educationId) {
                sendCheckpoint(true);
            }
        }, CHECKPOINT_INTERVAL_MS);

        return () => {
            if (checkpointIntervalRef.current) {
                clearInterval(checkpointIntervalRef.current);
            }
        };
    }, [educationId, sendCheckpoint]);

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
            videoId: videoIds[0],  // 첫 번째 영상으로 시작
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
    }, [videoIds[0]]);

    // 플레이어 상태 변경
    const onPlayerStateChange = (event) => {
        const state = event.data;

        if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            isPlayingRef.current = true;
            startTimeCheck();
        } else if (state === window.YT.PlayerState.ENDED) {
            // ─── 다중 영상: 현재 영상이 끝났을 때 다음 영상으로 자동 전환 ───
            const idx = currentVideoIndexRef.current;
            if (idx < videoIds.length - 1) {
                // 다음 영상이 있으면 로드 및 자동 재생
                const nextIndex = idx + 1;
                setCurrentVideoIndex(nextIndex);
                currentVideoIndexRef.current = nextIndex;
                playerRef.current.loadVideoById(videoIds[nextIndex]);
                // loadVideoById는 자동으로 재생을 시작하므로 PLAYING 상태로 전환됨
            } else {
                // 마지막 영상까지 끝남
                setIsPlaying(false);
                isPlayingRef.current = false;
                stopTimeCheck();
                setPlaylistEnded(true);  // 다시 보기 버튼 표시용
                sendCheckpoint(false);   // 종료 시 최종 체크포인트
            }
        } else {
            setIsPlaying(false);
            isPlayingRef.current = false;
            stopTimeCheck();
            // PAUSED 상태에서 즉시 체크포인트 전송 (BUFFERING/CUED에서도 전송되지만 무해)
            if (state === window.YT.PlayerState.PAUSED) {
                sendCheckpoint(false);
            }
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
                currentTimeRef.current = currentVideoTime;  // 체크포인트용 ref 동기화

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

    // 처음부터 다시 보기 (새로고침 없이)
    const replayFromStart = () => {
        setCurrentVideoIndex(0);
        currentVideoIndexRef.current = 0;
        setPlaylistEnded(false);
        if (playerRef.current) {
            playerRef.current.loadVideoById(videoIds[0]);
        }
    };

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

                {/* 모든 영상 재생 완료 후 다시 보기 오버레이 */}
                {playlistEnded && !isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <div className="text-center">
                            <div className="text-5xl mb-4">🔄</div>
                            <p className="text-white text-lg font-bold mb-2">영상이 모두 끝났습니다</p>
                            <p className="text-yellow-400 text-sm mb-4">
                                필수 시청 시간까지 <span className="font-bold">{remainingMinutes}분</span> 더 필요합니다
                            </p>
                            <button
                                onClick={replayFromStart}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors text-lg"
                            >
                                ▶️ 처음부터 다시 보기
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 다중 영상 인디케이터 */}
            {videoIds.length > 1 && (
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-10">
                    📺 {currentVideoIndex + 1} / {videoIds.length}
                </div>
            )}

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
