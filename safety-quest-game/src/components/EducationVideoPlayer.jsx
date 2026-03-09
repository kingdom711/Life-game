import { useState, useRef, useEffect, useCallback } from 'react';
import YouTubeEducationPlayer from './YouTubeEducationPlayer';
import educationApi from '../api/educationApi';

// 체크포인트 전송 간격 (30초)
const CHECKPOINT_INTERVAL_MS = 30_000;

/**
 * 교육 비디오 플레이어 컴포넌트 (래퍼)
 *
 * YouTube 비디오 ID가 있으면 YouTubeEducationPlayer를 사용하고,
 * 없으면 기존 로컬 비디오 플레이어를 사용합니다.
 *
 * 추가 기능 (교육 수료 증거 기록):
 * - 30초 간격으로 시청 체크포인트를 서버에 전송
 * - 탭 비활성화(포커스 아웃) 이벤트 감지 및 기록
 */
const EducationVideoPlayer = (props) => {
    const { youtubeVideoId, ...restProps } = props;

    // YouTube 비디오가 있으면 YouTube 플레이어 사용
    if (youtubeVideoId) {
        return <YouTubeEducationPlayer youtubeVideoId={youtubeVideoId} {...restProps} />;
    }

    // 로컬 비디오 플레이어
    return <LocalVideoPlayer {...restProps} />;
};

/**
 * 로컬 비디오 플레이어 컴포넌트
 *
 * 특징:
 * - 시청 시간 실시간 추적
 * - 빨리감기 방지 (이전 최대 시청 위치 기준)
 * - 진행률 표시
 * - 90% 이상 시청 시 완료 처리
 * - [교육 수료 증거] 30초 간격 서버 체크포인트 전송
 * - [교육 수료 증거] 탭 비활성화 감지 및 서버 기록
 */
const LocalVideoPlayer = ({
    educationId,
    videoUrl,
    duration,
    requiredWatchTime,
    onTimeUpdate,
    onVideoComplete,
    onSeekAttempt,
    initialWatchedTime = 0
}) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [maxWatchedTime, setMaxWatchedTime] = useState(initialWatchedTime);
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showSeekWarning, setShowSeekWarning] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef(null);

    // ─── [교육 수료 증거] 체크포인트 관련 ref ─────────────────────────
    const isPlayingRef   = useRef(false);   // interval 내에서 최신 상태 참조
    const currentTimeRef = useRef(0);       // interval 내에서 최신 재생 위치 참조
    const tabVisibleRef  = useRef(true);    // 탭 활성화 여부
    const checkpointIntervalRef = useRef(null);

    // ─── [교육 수료 증거] 탭 가시성 변경 감지 ────────────────────────
    useEffect(() => {
        const handleVisibilityChange = () => {
            const visible = document.visibilityState === 'visible';
            tabVisibleRef.current = visible;

            // 탭이 숨겨지면 영상 일시정지 + 체크포인트 즉시 전송
            if (!visible) {
                videoRef.current?.pause();
                sendCheckpoint(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [educationId]);

    // ─── [교육 수료 증거] 30초 체크포인트 인터벌 ─────────────────────
    useEffect(() => {
        checkpointIntervalRef.current = setInterval(() => {
            // 재생 중일 때만 전송 (불필요한 요청 방지)
            if (isPlayingRef.current && educationId) {
                sendCheckpoint(true);
            }
        }, CHECKPOINT_INTERVAL_MS);

        return () => {
            if (checkpointIntervalRef.current) {
                clearInterval(checkpointIntervalRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [educationId]);

    /**
     * 체크포인트 서버 전송 (fire-and-forget, 실패해도 플레이어 동작에 영향 없음)
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
            // 네트워크 오류 시 조용히 무시 (플레이어 UX 방해 안 함)
        });
    }, [educationId, duration]);

    // ─── 기존 로직 (진행률, 완료 체크) ──────────────────────────────

    // 진행률 계산
    useEffect(() => {
        const progressPercent = (maxWatchedTime / duration) * 100;
        setProgress(Math.min(100, progressPercent));
    }, [maxWatchedTime, duration]);

    // 시청 완료 체크
    useEffect(() => {
        if (maxWatchedTime >= requiredWatchTime && !isCompleted) {
            setIsCompleted(true);
            onVideoComplete?.();
        }
    }, [maxWatchedTime, requiredWatchTime, isCompleted, onVideoComplete]);

    // 시간 업데이트 핸들러
    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        const currentVideoTime = video.currentTime;
        setCurrentTime(currentVideoTime);
        currentTimeRef.current = currentVideoTime; // ref 동기화

        // 빨리감기 감지 (최대 시청 위치 + 3초 이상 점프 시)
        const maxAllowedJump = 3;
        if (currentVideoTime > maxWatchedTime + maxAllowedJump) {
            // 빨리감기 시도 - 이전 최대 위치로 되돌림
            video.currentTime = maxWatchedTime;
            setShowSeekWarning(true);
            setTimeout(() => setShowSeekWarning(false), 2000);
            onSeekAttempt?.();
            return;
        }

        // 최대 시청 시간 업데이트
        if (currentVideoTime > maxWatchedTime) {
            setMaxWatchedTime(currentVideoTime);
        }

        // 부모에게 시간 업데이트 알림
        onTimeUpdate?.(currentVideoTime, maxWatchedTime);
    }, [maxWatchedTime, onTimeUpdate, onSeekAttempt]);

    // 재생/일시정지 토글
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
            isPlayingRef.current = true;
        } else {
            video.pause();
            setIsPlaying(false);
            isPlayingRef.current = false;
            // 일시정지 시 즉시 체크포인트 전송
            sendCheckpoint(false);
        }
    };

    // 음소거 토글
    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    // 볼륨 변경
    const handleVolumeChange = (e) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    // 프로그레스바 클릭 핸들러 (되감기만 허용)
    const handleProgressClick = (e) => {
        const video = videoRef.current;
        if (!video) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickPercent = clickX / rect.width;
        const targetTime = clickPercent * duration;

        // 되감기만 허용 (이미 시청한 부분까지만)
        if (targetTime <= maxWatchedTime) {
            video.currentTime = targetTime;
            setCurrentTime(targetTime);
        } else {
            // 앞으로 가기 시도 시 경고
            setShowSeekWarning(true);
            setTimeout(() => setShowSeekWarning(false), 2000);
        }
    };

    // 컨트롤 표시/숨기기
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    // 시간 포맷팅
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 남은 필수 시청 시간
    const remainingRequiredTime = Math.max(0, requiredWatchTime - maxWatchedTime);
    const remainingMinutes = Math.ceil(remainingRequiredTime / 60);

    return (
        <div
            className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* 비디오 엘리먼트 */}
            <video
                ref={videoRef}
                className="w-full aspect-video"
                src={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => {
                    setIsPlaying(true);
                    isPlayingRef.current = true;
                }}
                onPause={() => {
                    setIsPlaying(false);
                    isPlayingRef.current = false;
                }}
                onEnded={() => {
                    setIsPlaying(false);
                    isPlayingRef.current = false;
                    // 영상 종료 시 최종 체크포인트 전송
                    sendCheckpoint(false);
                    if (maxWatchedTime >= requiredWatchTime) {
                        onVideoComplete?.();
                    }
                }}
                onClick={togglePlay}
                playsInline
            />

            {/* 빨리감기 경고 오버레이 */}
            {showSeekWarning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                    <div className="text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <p className="text-white text-lg font-bold">빨리감기가 제한됩니다</p>
                        <p className="text-gray-300 text-sm mt-2">
                            교육 영상은 순서대로 시청해야 합니다
                        </p>
                    </div>
                </div>
            )}

            {/* 완료 배지 */}
            {isCompleted && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 z-10">
                    <span>✓</span>
                    <span>시청 완료</span>
                </div>
            )}

            {/* 컨트롤 오버레이 */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* 진행률 바 */}
                <div
                    className="relative h-2 bg-gray-600 rounded-full mb-4 cursor-pointer group"
                    onClick={handleProgressClick}
                >
                    {/* 시청 가능 범위 (이미 시청한 부분) */}
                    <div
                        className="absolute h-full bg-blue-500/50 rounded-full"
                        style={{ width: `${(maxWatchedTime / duration) * 100}%` }}
                    />
                    {/* 현재 재생 위치 */}
                    <div
                        className="absolute h-full bg-blue-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    {/* 필수 시청 라인 */}
                    <div
                        className="absolute h-full w-0.5 bg-yellow-400"
                        style={{ left: `${(requiredWatchTime / duration) * 100}%` }}
                        title="필수 시청 위치"
                    />
                    {/* 호버 시 시간 표시 */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>

                {/* 컨트롤 버튼 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* 재생/일시정지 버튼 */}
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                            <span className="text-2xl text-white">
                                {isPlaying ? '⏸️' : '▶️'}
                            </span>
                        </button>

                        {/* 볼륨 컨트롤 */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleMute}
                                className="text-white text-xl hover:text-blue-400 transition-colors"
                            >
                                {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:w-3
                                    [&::-webkit-slider-thumb]:h-3
                                    [&::-webkit-slider-thumb]:bg-white
                                    [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>

                        {/* 시간 표시 */}
                        <div className="text-white text-sm">
                            <span>{formatTime(currentTime)}</span>
                            <span className="text-gray-400"> / </span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* 우측 정보 */}
                    <div className="flex items-center gap-4">
                        {/* 진행률 표시 */}
                        <div className="text-white text-sm">
                            <span className="text-blue-400 font-bold">{progress.toFixed(0)}%</span>
                            <span className="text-gray-400"> 시청</span>
                        </div>

                        {/* 남은 필수 시간 */}
                        {!isCompleted && remainingRequiredTime > 0 && (
                            <div className="text-yellow-400 text-sm">
                                <span className="font-bold">{remainingMinutes}분</span>
                                <span className="text-gray-400"> 더 시청 필요</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 재생 버튼 (일시정지 상태) */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
                    onClick={togglePlay}
                >
                    <div className="w-20 h-20 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-105">
                        <span className="text-4xl text-white ml-1">▶️</span>
                    </div>
                </div>
            )}

            {/* 진행 상태 표시 (하단) */}
            <div className="absolute bottom-20 left-4 right-4">
                <div className="flex items-center gap-2">
                    {/* 시청 진행률 */}
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                            style={{ width: `${Math.min(100, (maxWatchedTime / requiredWatchTime) * 100)}%` }}
                        />
                    </div>
                    <span className={`text-xs font-bold ${isCompleted ? 'text-green-400' : 'text-blue-400'}`}>
                        {Math.min(100, Math.round((maxWatchedTime / requiredWatchTime) * 100))}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EducationVideoPlayer;
