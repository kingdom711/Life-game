import { useState, useEffect, useRef } from 'react';
import educationApi from '../api/educationApi';
import QuizHeader from './quiz/QuizHeader';
import QuestionView from './quiz/QuestionView';
import OptionList from './quiz/OptionList';
import FeedbackFooter from './quiz/FeedbackFooter';
import QuizResultScreen from './quiz/QuizResultScreen';

/**
 * 교육 퀴즈 모달 컴포넌트
 *
 * 특징:
 * - 문제별 즉시 피드백
 * - 해설 표시
 * - 최종 점수 계산
 * - 합격/불합격 결과
 * - 남은 시도 횟수 표시
 * - [교육 수료 증거] 문항별 답안 + 소요 시간 서버 저장
 */
const EducationQuizModal = ({
    isOpen,
    onClose,
    quiz,
    educationId,
    educationTitle,
    requiredScore = 80,
    remainingAttempts = 3,
    onSubmit
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isGraded, setIsGraded] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wrongCount, setWrongCount] = useState(0); // 오답 시 하트 펄스 트리거

    // ─── [교육 수료 증거] 문항별 소요 시간 추적 ──────────────────────
    // { questionId → { selectedOption, timeSpentSec } }
    const detailedAnswers = useRef({});
    const questionStartTime = useRef(null);   // 현재 문항 시작 시각
    const attemptNumberRef  = useRef(1);      // 현재 시도 번호

    // 모달이 닫힐 때 상태 초기화
    useEffect(() => {
        if (!isOpen) {
            setCurrentQuestionIndex(0);
            setAnswers({});
            setShowResult(false);
            setSelectedAnswer(null);
            setIsGraded(false);
            setQuizResult(null);
            setWrongCount(0);
            detailedAnswers.current = {};
            questionStartTime.current = null;
        }
    }, [isOpen]);

    // 문항이 바뀔 때 시작 시각 기록
    useEffect(() => {
        if (isOpen) {
            questionStartTime.current = Date.now();
        }
    }, [currentQuestionIndex, isOpen]);

    if (!isOpen || !quiz || quiz.length === 0) return null;

    const currentQuestion = quiz[currentQuestionIndex];
    const totalQuestions = quiz.length;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    // 답변 선택 (채점 전 임시 선택만)
    const handleSelectAnswer = (optionIndex) => {
        if (isGraded) return;
        setSelectedAnswer(optionIndex);
    };

    // 확인 버튼 - 실제 채점 + [교육 수료 증거] 소요 시간 기록
    const handleConfirm = () => {
        if (isGraded || selectedAnswer === null) return;

        const timeSpentSec = questionStartTime.current
            ? Math.floor((Date.now() - questionStartTime.current) / 1000)
            : null;

        setIsGraded(true);
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: selectedAnswer
        }));

        detailedAnswers.current[currentQuestion.id] = {
            selectedOption: selectedAnswer,
            timeSpentSec,
        };

        // 오답 시 하트 펄스 트리거
        if (selectedAnswer !== currentQuestion.correctAnswer) {
            setWrongCount(w => w + 1);
        }
    };

    // 다음 문제로 이동
    const handleNextQuestion = () => {
        if (isLastQuestion) {
            handleSubmitQuiz();
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsGraded(false);
        }
    };

    // 퀴즈 제출
    const handleSubmitQuiz = async () => {
        setIsSubmitting(true);

        try {
            // [교육 수료 증거] 퀴즈 답안 서버 저장 (fire-and-forget)
            if (educationId) {
                const answersPayload = Object.entries(detailedAnswers.current).map(
                    ([questionId, { selectedOption, timeSpentSec }]) => ({
                        questionId,
                        selectedOption,
                        timeSpentSec,
                    })
                );

                educationApi.submitQuizAnswers({
                    educationId,
                    attemptNumber: attemptNumberRef.current,
                    answers: answersPayload,
                }).catch(() => {
                    // 네트워크 오류 시 조용히 무시 (퀴즈 UX 방해 안 함)
                });
            }

            const result = await onSubmit(answers);
            setQuizResult(result);
            setShowResult(true);
        } catch (error) {
            console.error('퀴즈 제출 오류:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 재도전 시 시도 번호 증가 및 상태 초기화
    const handleRetry = () => {
        attemptNumberRef.current += 1;
        detailedAnswers.current = {};
        setShowResult(false);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setSelectedAnswer(null);
        setIsGraded(false);
        setQuizResult(null);
        questionStartTime.current = Date.now();
    };

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    // 진행바: 채점 완료된 문항 수 기준 → 확인 순간 채워짐
    const gradedCount = currentQuestionIndex + (isGraded ? 1 : 0);
    const progressPercent = (gradedCount / totalQuestions) * 100;

    if (showResult && quizResult) {
        return (
            <QuizResultScreen
                quizResult={quizResult}
                requiredScore={requiredScore}
                onRetry={handleRetry}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col overflow-hidden" style={{ zIndex: 2000 }}>
            <QuizHeader
                educationTitle={educationTitle}
                remainingAttempts={remainingAttempts}
                progressPercent={progressPercent}
                onClose={onClose}
                heartPulseKey={wrongCount}
            />

            <div className="flex-1 min-h-0 overflow-y-auto">
                <div
                    key={currentQuestionIndex}
                    className={`quiz-fade-in quiz-center max-w-2xl w-full px-6 py-8 ${isGraded ? 'pb-28' : 'pb-8'}`}
                >
                    <QuestionView
                        currentIndex={currentQuestionIndex}
                        totalQuestions={totalQuestions}
                        requiredScore={requiredScore}
                        question={currentQuestion.question}
                    />

                    <OptionList
                        options={currentQuestion.options}
                        selectedAnswer={selectedAnswer}
                        isGraded={isGraded}
                        correctAnswer={currentQuestion.correctAnswer}
                        onSelect={handleSelectAnswer}
                    />

                    {!isGraded && (
                        <button
                            onClick={handleConfirm}
                            disabled={selectedAnswer === null || selectedAnswer === undefined}
                            className={`quiz-tap w-full mt-6 py-4 font-bold rounded-xl transition-all uppercase tracking-wide ${
                                selectedAnswer !== null && selectedAnswer !== undefined
                                    ? 'bg-[var(--color-safe)] hover:bg-[var(--color-safe-dark)] text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            확인
                        </button>
                    )}

                    {isGraded && (
                        <FeedbackFooter
                            isGraded={isGraded}
                            isCorrect={isCorrect}
                            selectedAnswer={selectedAnswer}
                            explanation={currentQuestion.explanation}
                            isLastQuestion={isLastQuestion}
                            isSubmitting={isSubmitting}
                            onConfirm={handleConfirm}
                            onNext={handleNextQuestion}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducationQuizModal;
