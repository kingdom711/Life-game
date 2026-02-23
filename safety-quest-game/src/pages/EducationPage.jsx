import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EducationVideoPlayer from '../components/EducationVideoPlayer';
import EducationQuizModal from '../components/EducationQuizModal';
import EducationHistoryModal from '../components/EducationHistoryModal';
import {
    getTodayEducationContent,
    startEducation,
    updateWatchTime,
    completeVideo,
    submitQuiz,
    hasCompletedTodayEducation,
    getLegalHoursProgress,
    getCurrentProgress,
    getAllEducationsWithStatus,
    getCumulativeWatchTime,
    saveCumulativeWatchTime
} from '../utils/educationManager';
import { CATEGORY_INFO } from '../data/educationData';
import { quizAttempts, getKSTDateString } from '../utils/storage';

/**
 * 교육 페이지
 * 마이크로 러닝 기반 안전 교육 시스템의 메인 페이지
 */
const EducationPage = () => {
    const navigate = useNavigate();

    // 상태 관리
    const [todayEducation, setTodayEducation] = useState(null);
    const [isEducationStarted, setIsEducationStarted] = useState(false);
    const [videoCompleted, setVideoCompleted] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [legalProgress, setLegalProgress] = useState(null);
    const [watchedTime, setWatchedTime] = useState(0);
    const [maxWatchedTime, setMaxWatchedTime] = useState(0);
    const [cumulativeWatchedTime, setCumulativeWatchedTime] = useState(0);  // 누적 시청 시간
    const [alreadyCompleted, setAlreadyCompleted] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(3);
    const [allEducations, setAllEducations] = useState([]);
    const [selectedTab, setSelectedTab] = useState('today'); // 'today' | 'all' | 'history'
    const currentKstDateRef = useRef(getKSTDateString());

    // 초기 데이터 로드
    useEffect(() => {
        currentKstDateRef.current = getKSTDateString();
        loadEducationData();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentKstDate = getKSTDateString();
            if (currentKstDate === currentKstDateRef.current) {
                return;
            }

            currentKstDateRef.current = currentKstDate;
            loadEducationData();
        }, 60000);

        return () => clearInterval(intervalId);
    }, []);

    const loadEducationData = () => {
        const education = getTodayEducationContent();
        setTodayEducation(education);

        // Reset transient UI state so day rollover does not keep old progress UI.
        setIsEducationStarted(false);
        setVideoCompleted(false);
        setWatchedTime(0);
        setMaxWatchedTime(0);

        const completed = hasCompletedTodayEducation();
        setAlreadyCompleted(completed);

        const progress = getLegalHoursProgress();
        setLegalProgress(progress);

        const currentProgress = getCurrentProgress();
        if (currentProgress.inProgress && currentProgress.education?.id === education?.id) {
            setIsEducationStarted(true);
            setVideoCompleted(currentProgress.progress.videoCompleted);
            setMaxWatchedTime(currentProgress.progress.maxWatchedTime);
            const cumulative = getCumulativeWatchTime(education.id);
            setCumulativeWatchedTime(cumulative);
        } else if (education) {
            const cumulative = getCumulativeWatchTime(education.id);
            setCumulativeWatchedTime(cumulative);
        }

        if (education) {
            const remaining = quizAttempts.getRemainingAttempts(education.id);
            setRemainingAttempts(remaining);
        }

        const educations = getAllEducationsWithStatus();
        setAllEducations(educations);
    };

    // 교육 시작
    const handleStartEducation = () => {
        if (!todayEducation) return;

        const result = startEducation(todayEducation.id);

        if (result.alreadyCompleted) {
            setAlreadyCompleted(true);
            return;
        }

        if (result.success) {
            setIsEducationStarted(true);
        }
    };

    // 시청 시간 업데이트
    const handleTimeUpdate = useCallback((currentTime, totalWatchedTime) => {
        setWatchedTime(currentTime);
        setMaxWatchedTime(totalWatchedTime);
        setCumulativeWatchedTime(totalWatchedTime);  // 누적 시간 state 업데이트

        // 누적 시간 localStorage에 저장
        if (todayEducation) {
            saveCumulativeWatchTime(todayEducation.id, totalWatchedTime);
        }

        updateWatchTime(currentTime);
    }, [todayEducation]);

    // 영상 시청 완료
    const handleVideoComplete = useCallback(() => {
        const result = completeVideo(maxWatchedTime);
        if (result.success) {
            setVideoCompleted(true);
        }
    }, [maxWatchedTime]);

    // 빨리감기 시도
    const handleSeekAttempt = useCallback(() => {
        // 경고는 VideoPlayer 컴포넌트에서 처리
        console.log('빨리감기 시도 감지');
    }, []);

    // 퀴즈 제출
    const handleQuizSubmit = async (answers) => {
        if (!todayEducation) return;

        const result = submitQuiz(todayEducation.id, answers);

        if (result.passed) {
            // 교육 완료 - 데이터 새로고침
            loadEducationData();
        } else {
            // 남은 시도 횟수 업데이트
            setRemainingAttempts(result.remainingAttempts);
        }

        return result;
    };

    // 퀴즈 모달 닫기
    const handleQuizClose = () => {
        setShowQuizModal(false);
        loadEducationData();
    };

    // 분 단위로 변환
    const formatDuration = (seconds) => {
        return Math.ceil(seconds / 60);
    };

    // 카테고리 정보
    const categoryInfo = todayEducation ? CATEGORY_INFO[todayEducation.category] : null;

    return (
        <div className="min-h-screen pb-24 pt-4 px-4">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>📚</span>
                    <span>안전 교육</span>
                </h1>
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* 법정 교육 시간 진행률 */}
            {legalProgress && (
                <div
                    className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 mb-6 border border-blue-500/30"
                    style={{ width: 'fit-content', minWidth: '400px', margin: '0 auto 1.5rem auto' }}
                >
                    <div className="flex justify-center items-center gap-4 mb-3">
                        <span className="text-gray-400 text-sm">법정 교육 시간 진행률</span>
                        <span className="text-white font-bold">
                            {legalProgress.currentYearHours}h / {legalProgress.requiredHours}h
                        </span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${legalProgress.hasMetRequirement
                                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                }`}
                            style={{ width: `${Math.min(100, legalProgress.completionRate)}%` }}
                        />
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-3">
                        <span className="text-xs text-gray-500">
                            {legalProgress.hasMetRequirement ? '✓ 연간 의무 교육 완료' : `${legalProgress.remainingHours}시간 남음`}
                        </span>
                        <span className="text-xs text-blue-400 font-bold">
                            {legalProgress.completionRate}%
                        </span>
                    </div>
                </div>
            )}

            {/* 탭 메뉴 */}
            <div className="flex gap-sm mb-lg" style={{ justifyContent: 'center' }}>
                <button
                    onClick={() => setSelectedTab('today')}
                    className={`btn btn-sm ${selectedTab === 'today' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    오늘의 교육
                </button>
                <button
                    onClick={() => setSelectedTab('all')}
                    className={`btn btn-sm ${selectedTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    전체 교육
                </button>
                <button
                    onClick={() => setShowHistoryModal(true)}
                    className="btn btn-sm btn-secondary"
                >
                    이력/증명서
                </button>
            </div>

            {/* 오늘의 교육 탭 */}
            {selectedTab === 'today' && todayEducation && (
                <div className="space-y-6" style={{ width: '66.67%', margin: '0 auto' }}>
                    {/* 교육 정보 카드 */}
                    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                        <div className="flex items-start gap-4 mb-4">
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                                style={{ backgroundColor: `${categoryInfo?.color}20` }}
                            >
                                {categoryInfo?.icon}
                            </div>
                            <div className="flex-1">
                                <span
                                    className="text-xs px-2 py-1 rounded-full font-medium"
                                    style={{
                                        backgroundColor: `${categoryInfo?.color}20`,
                                        color: categoryInfo?.color
                                    }}
                                >
                                    {categoryInfo?.name}
                                </span>
                                <h2 className="text-xl font-bold text-white mt-2">
                                    {todayEducation.title}
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    {todayEducation.description}
                                </p>
                            </div>
                        </div>

                        {/* 교육 정보 */}
                        <div className="grid grid-cols-3 gap-4 bg-gray-900/50 rounded-lg p-3">
                            <div className="text-center">
                                <div className="text-blue-400 font-bold">
                                    {formatDuration(todayEducation.duration)}분
                                </div>
                                <div className="text-gray-500 text-xs">영상 길이</div>
                            </div>
                            <div className="text-center border-x border-gray-700">
                                <div className="text-purple-400 font-bold">
                                    {todayEducation.quiz.length}문제
                                </div>
                                <div className="text-gray-500 text-xs">퀴즈</div>
                            </div>
                            <div className="text-center">
                                <div className="text-yellow-400 font-bold">
                                    +{todayEducation.points}P
                                </div>
                                <div className="text-gray-500 text-xs">보상</div>
                            </div>
                        </div>
                    </div>

                    {/* 완료 상태 */}
                    {alreadyCompleted ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                            <div className="text-5xl mb-4">✅</div>
                            <h3 className="text-green-400 text-xl font-bold mb-2">
                                오늘의 교육 완료!
                            </h3>
                            <p className="text-gray-400">
                                수고하셨습니다. 내일 새로운 교육이 준비됩니다.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="btn btn-success mt-md"
                            >
                                대시보드로 이동
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* 비디오 플레이어 */}
                            {isEducationStarted ? (
                                <div className="space-y-4">
                                    <EducationVideoPlayer
                                        videoUrl={todayEducation.videoUrl}
                                        youtubeVideoId={todayEducation.youtubeVideoId}
                                        educationId={todayEducation.id}
                                        duration={todayEducation.duration}
                                        requiredWatchTime={todayEducation.requiredWatchTime}
                                        onTimeUpdate={handleTimeUpdate}
                                        onVideoComplete={handleVideoComplete}
                                    />

                                    {/* 퀴즈 시작 버튼 */}
                                    {videoCompleted && (
                                        <button
                                            onClick={() => setShowQuizModal(true)}
                                            disabled={remainingAttempts === 0}
                                            className={`btn btn-lg ${remainingAttempts === 0 ? 'btn-secondary' : 'btn-primary'}`}
                                            style={{ width: '100%' }}
                                        >
                                            {remainingAttempts === 0
                                                ? '오늘 시도 횟수를 모두 사용했습니다'
                                                : `📝 퀴즈 풀기 (${remainingAttempts}회 남음)`
                                            }
                                        </button>
                                    )}

                                    {/* 진행 상태 안내 */}
                                    {!videoCompleted && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                                            <p className="text-yellow-400 text-sm">
                                                💡 영상을 90% 이상 시청하면 퀴즈를 풀 수 있습니다
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* 교육 시작 버튼 */
                                <button
                                    onClick={handleStartEducation}
                                    className="btn btn-lg btn-primary"
                                    style={{ width: '100%', gap: '0.75rem' }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>▶️</span>
                                    <span>교육 시작하기</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* 전체 교육 탭 */}
            {selectedTab === 'all' && (
                <div className="space-y-4">
                    {allEducations.map((edu) => {
                        const catInfo = CATEGORY_INFO[edu.category];
                        return (
                            <div
                                key={edu.id}
                                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: `${catInfo?.color}20` }}
                                    >
                                        {catInfo?.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold">{edu.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-gray-500 text-sm">
                                                {formatDuration(edu.duration)}분
                                            </span>
                                            <span className="text-gray-600">•</span>
                                            <span className="text-yellow-400 text-sm">
                                                +{edu.points}P
                                            </span>
                                        </div>
                                    </div>
                                    {edu.completedCount > 0 && (
                                        <div className="text-green-400 flex items-center gap-1">
                                            <span>✓</span>
                                            <span className="text-sm">{edu.completedCount}회</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 퀴즈 모달 */}
            {todayEducation && (
                <EducationQuizModal
                    isOpen={showQuizModal}
                    onClose={handleQuizClose}
                    quiz={todayEducation.quiz}
                    educationTitle={todayEducation.title}
                    requiredScore={todayEducation.requiredScore}
                    remainingAttempts={remainingAttempts}
                    onSubmit={handleQuizSubmit}
                />
            )}

            {/* 이력/증명서 모달 */}
            <EducationHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
            />
        </div>
    );
};

export default EducationPage;
