import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getSpecializationById } from '../data/specializationData';
import { getEducationsBySpecialization, getSpecializationEducationById, SPECIALIZATION_EDUCATION_CONFIG } from '../data/specializationEducationData';
import {
    getSpecializationProgress,
    startSpecializationTraining,
    submitSpecializationQuiz,
    canAttemptSpecQuiz,
    executeClassChange
} from '../utils/specializationManager';
import { specializationProgress as specProgressStorage, specQuizAttempts } from '../utils/storage';
import EducationVideoPlayer from '../components/EducationVideoPlayer';

/**
 * 전직 교육 페이지
 * 전직별 전용 교육 영상 시청 + 퀴즈 플로우
 */
const SpecializationTrainingPage = () => {
    const { specId } = useParams();
    const navigate = useNavigate();

    const [spec, setSpec] = useState(null);
    const [educations, setEducations] = useState([]);
    const [progress, setProgress] = useState(null);
    const [selectedEdu, setSelectedEdu] = useState(null);
    const [isWatching, setIsWatching] = useState(false);
    const [videoCompleted, setVideoCompleted] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [showClassChangeModal, setShowClassChangeModal] = useState(false);
    const [classChangeResult, setClassChangeResult] = useState(null);
    const [watchedTime, setWatchedTime] = useState(0);
    const [maxWatchedTime, setMaxWatchedTime] = useState(0);

    useEffect(() => {
        loadData();
    }, [specId]);

    const loadData = () => {
        const specData = getSpecializationById(specId);
        if (!specData) {
            navigate('/specialization');
            return;
        }
        setSpec(specData);

        const eduList = getEducationsBySpecialization(specId);
        setEducations(eduList);

        const progressData = getSpecializationProgress(specId);
        setProgress(progressData);
    };

    const handleSelectEducation = (edu) => {
        const result = startSpecializationTraining(specId, edu.id);
        if (result.success || result.alreadyCompleted) {
            setSelectedEdu(edu);
            setIsWatching(false);
            setVideoCompleted(false);
            setShowQuiz(false);
            setQuizAnswers({});
            setQuizResult(null);
            setWatchedTime(0);
            setMaxWatchedTime(0);
        }
    };

    const handleStartVideo = () => {
        setIsWatching(true);
    };

    const handleVideoTimeUpdate = useCallback((currentTime) => {
        setWatchedTime(currentTime);
        setMaxWatchedTime(prev => Math.max(prev, currentTime));
    }, []);

    const handleVideoComplete = () => {
        setVideoCompleted(true);
    };

    const handleStartQuiz = () => {
        setShowQuiz(true);
        setQuizAnswers({});
        setQuizResult(null);
    };

    const handleAnswerSelect = (questionIdx, answerIdx) => {
        setQuizAnswers(prev => ({
            ...prev,
            [questionIdx]: answerIdx
        }));
    };

    const handleSubmitQuiz = () => {
        if (!selectedEdu) return;

        const answersArray = selectedEdu.quiz.map((_, idx) => quizAnswers[idx] ?? -1);
        const result = submitSpecializationQuiz(specId, selectedEdu.id, answersArray);
        setQuizResult(result);

        if (result.passed) {
            // 교육 완료 후 데이터 갱신
            loadData();

            // 모든 교육 완료 시 전직 가능 알림
            if (result.completionResult?.canClassChange) {
                setTimeout(() => {
                    setShowClassChangeModal(true);
                }, 1500);
            }
        }
    };

    const handleClassChange = () => {
        const result = executeClassChange(specId);
        setClassChangeResult(result);
        setShowClassChangeModal(false);
        if (result.success) {
            loadData();
        }
    };

    const isEducationCompleted = (eduId) => {
        return specProgressStorage.isEducationCompleted(specId, eduId);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!spec) return null;

    return (
        <div className="page">
            <div className="container">
                {/* 헤더 */}
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/specialization" className="btn btn-secondary btn-sm">
                        ← 전직 센터로 돌아가기
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{spec.icon}</span>
                    <h1 style={{ fontSize: '1.75rem', color: spec.color, marginTop: '0.5rem' }}>
                        {spec.name} 전직 교육
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                        모든 교육을 이수하면 {spec.name}(으)로 전직할 수 있습니다
                    </p>
                    {progress && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginTop: '0.75rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <span style={{ fontSize: '0.875rem' }}>
                                진행률: {progress.completedCount}/{progress.totalCount}
                            </span>
                            <div style={{
                                width: '100px',
                                height: '6px',
                                borderRadius: '3px',
                                background: 'rgba(255,255,255,0.1)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${progress.completionRate}%`,
                                    background: spec.bgGradient,
                                    borderRadius: '3px',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                            <span style={{ color: spec.color, fontWeight: 700, fontSize: '0.875rem' }}>
                                {progress.completionRate}%
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    {/* 좌측: 교육 목록 */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ fontSize: '1rem' }}>📋 교육 목록</h3>
                            <p className="card-subtitle" style={{ fontSize: '0.75rem' }}>
                                합격 기준: {SPECIALIZATION_EDUCATION_CONFIG.REQUIRED_SCORE}% 이상
                            </p>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {educations.map((edu, idx) => {
                                const completed = isEducationCompleted(edu.id);
                                const isSelected = selectedEdu?.id === edu.id;
                                const specProgress = specProgressStorage.getBySpecialization(specId);
                                const eduScore = specProgress[edu.id]?.score;

                                return (
                                    <div
                                        key={edu.id}
                                        onClick={() => !completed || true ? handleSelectEducation(edu) : null}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            borderBottom: idx < educations.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                            background: isSelected ? `${spec.color}15` : 'transparent',
                                            borderLeft: isSelected ? `3px solid ${spec.color}` : '3px solid transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            flexShrink: 0,
                                            background: completed ? '#22c55e' : `${spec.color}30`,
                                            color: completed ? '#fff' : spec.color
                                        }}>
                                            {completed ? '✓' : edu.order}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {edu.title}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                                                {Math.floor(edu.duration / 60)}분 · 7문항
                                                {completed && eduScore && ` · ${eduScore}점`}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 우측: 교육 콘텐츠 영역 */}
                    <div>
                        {!selectedEdu ? (
                            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                                <h3>교육을 선택하세요</h3>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    좌측 목록에서 이수할 교육을 선택하세요
                                </p>
                            </div>
                        ) : !isWatching && !showQuiz ? (
                            /* 교육 상세 정보 */
                            <div className="card">
                                <div className="card-header" style={{ textAlign: 'center' }}>
                                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                                        {selectedEdu.title}
                                    </h2>
                                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                        {selectedEdu.description}
                                    </p>
                                </div>
                                <div className="card-body">
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '1rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            background: 'rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>영상 시간</div>
                                            <div style={{ fontWeight: 700 }}>{Math.floor(selectedEdu.duration / 60)}분</div>
                                        </div>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            background: 'rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>퀴즈 문항</div>
                                            <div style={{ fontWeight: 700 }}>7문제</div>
                                        </div>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)'
                                        }}>
                                            <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>합격 기준</div>
                                            <div style={{ fontWeight: 700, color: '#ef4444' }}>
                                                {SPECIALIZATION_EDUCATION_CONFIG.REQUIRED_SCORE}%
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        background: `${spec.color}10`,
                                        border: `1px solid ${spec.color}30`,
                                        marginBottom: '1.5rem',
                                        fontSize: '0.8rem'
                                    }}>
                                        <strong style={{ color: spec.color }}>⚠️ 전직 교육 안내</strong>
                                        <ul style={{ margin: '0.5rem 0 0 1rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                                            <li>일반 교육보다 높은 합격 기준({SPECIALIZATION_EDUCATION_CONFIG.REQUIRED_SCORE}%)이 적용됩니다</li>
                                            <li>영상의 90% 이상을 시청해야 퀴즈에 응시할 수 있습니다</li>
                                            <li>1일 {SPECIALIZATION_EDUCATION_CONFIG.MAX_DAILY_ATTEMPTS}회까지 퀴즈 재시도가 가능합니다</li>
                                        </ul>
                                    </div>

                                    {isEducationCompleted(selectedEdu.id) ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '1.5rem',
                                            borderRadius: '0.5rem',
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            border: '1px solid rgba(34, 197, 94, 0.3)'
                                        }}>
                                            <span style={{ fontSize: '2rem' }}>✅</span>
                                            <div style={{ marginTop: '0.5rem', fontWeight: 700, color: '#22c55e' }}>
                                                이수 완료
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', background: spec.bgGradient }}
                                            onClick={handleStartVideo}
                                        >
                                            ▶️ 교육 영상 시청 시작
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : showQuiz ? (
                            /* 퀴즈 영역 */
                            <div className="card">
                                <div className="card-header">
                                    <h2 style={{ fontSize: '1.25rem' }}>📝 {selectedEdu.title} - 퀴즈</h2>
                                    <p className="card-subtitle" style={{ fontSize: '0.8rem' }}>
                                        {selectedEdu.quiz.length}문항 중 {SPECIALIZATION_EDUCATION_CONFIG.REQUIRED_SCORE}% 이상 정답 시 합격
                                    </p>
                                </div>
                                <div className="card-body">
                                    {quizResult ? (
                                        /* 퀴즈 결과 */
                                        <div>
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '2rem',
                                                marginBottom: '1.5rem',
                                                borderRadius: '0.75rem',
                                                background: quizResult.passed
                                                    ? 'rgba(34, 197, 94, 0.1)'
                                                    : 'rgba(239, 68, 68, 0.1)',
                                                border: `1px solid ${quizResult.passed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                            }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                                                    {quizResult.passed ? '🎉' : '😔'}
                                                </div>
                                                <h3 style={{
                                                    color: quizResult.passed ? '#22c55e' : '#ef4444'
                                                }}>
                                                    {quizResult.passed ? '합격!' : '불합격'}
                                                </h3>
                                                <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>
                                                    {quizResult.score}%
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                                    {quizResult.correctCount}/{quizResult.totalQuestions} 정답
                                                    {!quizResult.passed && ` · 남은 시도: ${quizResult.remainingAttempts}회`}
                                                </div>
                                            </div>

                                            {/* 문제별 결과 */}
                                            {quizResult.results.map((r, idx) => (
                                                <div key={idx} style={{
                                                    padding: '1rem',
                                                    marginBottom: '0.75rem',
                                                    borderRadius: '0.5rem',
                                                    background: r.isCorrect
                                                        ? 'rgba(34, 197, 94, 0.05)'
                                                        : 'rgba(239, 68, 68, 0.05)',
                                                    border: `1px solid ${r.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        <span style={{ color: r.isCorrect ? '#22c55e' : '#ef4444' }}>
                                                            {r.isCorrect ? '✓' : '✗'}
                                                        </span>
                                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                            Q{idx + 1}. {selectedEdu.quiz[idx].question}
                                                        </span>
                                                    </div>
                                                    {!r.isCorrect && (
                                                        <div style={{
                                                            fontSize: '0.8rem',
                                                            color: 'var(--color-text-secondary)',
                                                            paddingLeft: '1.25rem'
                                                        }}>
                                                            💡 {r.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                                {quizResult.passed ? (
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ flex: 1, background: spec.bgGradient }}
                                                        onClick={() => {
                                                            setSelectedEdu(null);
                                                            setShowQuiz(false);
                                                            setQuizResult(null);
                                                        }}
                                                    >
                                                        다음 교육으로 →
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ flex: 1 }}
                                                            onClick={() => {
                                                                setShowQuiz(false);
                                                                setQuizResult(null);
                                                                setIsWatching(false);
                                                            }}
                                                        >
                                                            교육 다시 보기
                                                        </button>
                                                        {quizResult.remainingAttempts > 0 && (
                                                            <button
                                                                className="btn btn-primary"
                                                                style={{ flex: 1, background: spec.bgGradient }}
                                                                onClick={() => {
                                                                    setQuizResult(null);
                                                                    setQuizAnswers({});
                                                                }}
                                                            >
                                                                재시도 ({quizResult.remainingAttempts}회 남음)
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        /* 퀴즈 문제 */
                                        <div>
                                            {selectedEdu.quiz.map((q, qIdx) => (
                                                <div key={q.id} style={{
                                                    marginBottom: '1.5rem',
                                                    padding: '1rem',
                                                    borderRadius: '0.5rem',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.06)'
                                                }}>
                                                    <div style={{
                                                        fontWeight: 600,
                                                        marginBottom: '0.75rem',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        Q{qIdx + 1}. {q.question}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {q.options.map((opt, oIdx) => (
                                                            <label
                                                                key={oIdx}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    padding: '0.5rem 0.75rem',
                                                                    borderRadius: '0.375rem',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.85rem',
                                                                    background: quizAnswers[qIdx] === oIdx
                                                                        ? `${spec.color}20`
                                                                        : 'rgba(255,255,255,0.02)',
                                                                    border: quizAnswers[qIdx] === oIdx
                                                                        ? `1px solid ${spec.color}50`
                                                                        : '1px solid rgba(255,255,255,0.06)',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`q_${qIdx}`}
                                                                    checked={quizAnswers[qIdx] === oIdx}
                                                                    onChange={() => handleAnswerSelect(qIdx, oIdx)}
                                                                    style={{ accentColor: spec.color }}
                                                                />
                                                                <span>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                className="btn btn-primary"
                                                style={{
                                                    width: '100%',
                                                    background: spec.bgGradient,
                                                    marginTop: '1rem'
                                                }}
                                                onClick={handleSubmitQuiz}
                                                disabled={Object.keys(quizAnswers).length < selectedEdu.quiz.length}
                                            >
                                                📝 답안 제출 ({Object.keys(quizAnswers).length}/{selectedEdu.quiz.length})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* 영상 시청 영역 */
                            <div className="card">
                                <div className="card-header">
                                    <h2 style={{ fontSize: '1.25rem' }}>🎬 {selectedEdu.title}</h2>
                                </div>
                                <div className="card-body">
                                    {/* 비디오 플레이어 */}
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        paddingTop: '56.25%',
                                        background: '#000',
                                        borderRadius: '0.5rem',
                                        overflow: 'hidden',
                                        marginBottom: '1rem'
                                    }}>
                                        {selectedEdu.youtubeVideoId ? (
                                            <iframe
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 'none'
                                                }}
                                                src={`https://www.youtube.com/embed/${selectedEdu.youtubeVideoId}?rel=0`}
                                                title={selectedEdu.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#666'
                                            }}>
                                                영상을 불러올 수 없습니다
                                            </div>
                                        )}
                                    </div>

                                    {/* 시청 진행률 */}
                                    <div style={{
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '0.8rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <span>영상 시청 (90% 이상 시청 필요)</span>
                                            <span style={{ color: spec.color }}>
                                                {formatTime(Math.min(watchedTime, selectedEdu.duration))} / {formatTime(selectedEdu.duration)}
                                            </span>
                                        </div>
                                        <div style={{
                                            height: '6px',
                                            borderRadius: '3px',
                                            background: 'rgba(255,255,255,0.1)',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min(100, (watchedTime / selectedEdu.duration) * 100)}%`,
                                                background: spec.bgGradient,
                                                borderRadius: '3px',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    </div>

                                    {/* 퀴즈 시작 버튼 */}
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '1rem'
                                        }}>
                                            영상 시청 후 아래 버튼을 눌러 퀴즈에 응시하세요.
                                            <br />
                                            (실제 환경에서는 90% 이상 시청 시 자동 활성화됩니다)
                                        </p>
                                        <button
                                            className="btn btn-primary"
                                            style={{ background: spec.bgGradient }}
                                            onClick={handleStartQuiz}
                                        >
                                            📝 퀴즈 응시하기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 전직 완료 모달 */}
                {showClassChangeModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="card" style={{
                            maxWidth: '400px',
                            width: '90%',
                            textAlign: 'center',
                            padding: '2rem'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{spec.icon}</div>
                            <h2>모든 교육 이수 완료!</h2>
                            <p style={{ color: 'var(--color-text-secondary)', margin: '0.75rem 0 1.5rem' }}>
                                {spec.name}(으)로 전직하시겠습니까?
                            </p>
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                background: `${spec.color}10`,
                                marginBottom: '1.5rem',
                                fontSize: '0.85rem'
                            }}>
                                <div>🎁 전직 보상</div>
                                <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>
                                    +{spec.classChangeReward.points}P / +{spec.classChangeReward.exp}EXP
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                    onClick={() => setShowClassChangeModal(false)}
                                >
                                    나중에
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1, background: spec.bgGradient }}
                                    onClick={handleClassChange}
                                >
                                    ⚔️ 전직하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 전직 성공 결과 모달 */}
                {classChangeResult?.success && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                        onClick={() => {
                            setClassChangeResult(null);
                            navigate('/specialization');
                        }}
                    >
                        <div className="card" style={{
                            maxWidth: '400px',
                            width: '90%',
                            textAlign: 'center',
                            padding: '2rem'
                        }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎉</div>
                            <h2 style={{ color: spec.color }}>{spec.name} 전직 완료!</h2>
                            <p style={{ color: 'var(--color-text-secondary)', margin: '0.75rem 0 1.5rem' }}>
                                {classChangeResult.message}
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', background: spec.bgGradient }}
                                onClick={() => {
                                    setClassChangeResult(null);
                                    navigate('/specialization');
                                }}
                            >
                                전직 센터로 돌아가기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpecializationTrainingPage;
