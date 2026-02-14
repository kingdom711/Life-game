import { useState, useEffect } from 'react';

/**
 * 교육 퀴즈 모달 컴포넌트
 * 
 * 특징:
 * - 문제별 즉시 피드백
 * - 해설 표시
 * - 최종 점수 계산
 * - 합격/불합격 결과
 * - 남은 시도 횟수 표시
 */
const EducationQuizModal = ({
    isOpen,
    onClose,
    quiz,
    educationTitle,
    requiredScore = 80,
    remainingAttempts = 3,
    onSubmit
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 모달이 닫힐 때 상태 초기화
    useEffect(() => {
        if (!isOpen) {
            setCurrentQuestionIndex(0);
            setAnswers({});
            setShowResult(false);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setQuizResult(null);
        }
    }, [isOpen]);

    if (!isOpen || !quiz || quiz.length === 0) return null;

    const currentQuestion = quiz[currentQuestionIndex];
    const totalQuestions = quiz.length;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    // 답변 선택
    const handleSelectAnswer = (optionIndex) => {
        if (isAnswered) return;

        setSelectedAnswer(optionIndex);
        setIsAnswered(true);
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionIndex
        }));
    };

    // 다음 문제로 이동
    const handleNextQuestion = () => {
        if (isLastQuestion) {
            // 모든 문제 완료 - 결과 화면 표시
            handleSubmitQuiz();
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        }
    };

    // 퀴즈 제출
    const handleSubmitQuiz = async () => {
        setIsSubmitting(true);
        
        try {
            const result = await onSubmit(answers);
            setQuizResult(result);
            setShowResult(true);
        } catch (error) {
            console.error('퀴즈 제출 오류:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 현재 답변이 정답인지 확인
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // 진행률 계산
    const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    // 결과 화면
    if (showResult && quizResult) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1200] p-4">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-700">
                    {/* 결과 아이콘 */}
                    <div className="text-center mb-6">
                        <div className={`text-8xl mb-4 ${quizResult.passed ? 'animate-bounce' : ''}`}>
                            {quizResult.passed ? '🎉' : '😔'}
                        </div>
                        <h2 className={`text-3xl font-bold mb-2 ${
                            quizResult.passed ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {quizResult.passed ? '축하합니다!' : '아쉽습니다'}
                        </h2>
                        <p className="text-gray-400">
                            {quizResult.passed 
                                ? '안전 교육 퀴즈를 통과했습니다!' 
                                : `${requiredScore}점 이상이 필요합니다.`
                            }
                        </p>
                    </div>

                    {/* 점수 표시 */}
                    <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400">획득 점수</span>
                            <span className={`text-4xl font-bold ${
                                quizResult.passed ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {quizResult.score}점
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">정답 수</span>
                            <span className="text-white font-bold">
                                {quizResult.correctCount} / {quizResult.totalQuestions}
                            </span>
                        </div>
                    </div>

                    {/* 보상 표시 (합격 시) */}
                    {quizResult.passed && quizResult.rewards && (
                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 mb-6 border border-yellow-500/30">
                            <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                                <span>🏆</span>
                                <span>획득 보상</span>
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-yellow-400">
                                        +{quizResult.rewards.points}
                                    </div>
                                    <div className="text-xs text-gray-400">포인트</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-400">
                                        +{quizResult.rewards.exp}
                                    </div>
                                    <div className="text-xs text-gray-400">경험치</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-400">
                                        +{quizResult.rewards.legalHours}h
                                    </div>
                                    <div className="text-xs text-gray-400">법정 시간</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 남은 시도 횟수 (불합격 시) */}
                    {!quizResult.passed && quizResult.remainingAttempts !== undefined && (
                        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-center">
                            <p className="text-gray-400 mb-2">남은 시도 횟수</p>
                            <p className="text-2xl font-bold text-orange-400">
                                {quizResult.remainingAttempts}회
                            </p>
                            {quizResult.remainingAttempts === 0 && (
                                <p className="text-red-400 text-sm mt-2">
                                    내일 다시 도전할 수 있습니다.
                                </p>
                            )}
                        </div>
                    )}

                    {/* 문제별 결과 */}
                    <div className="mb-6">
                        <h3 className="text-gray-400 text-sm mb-3">문제별 결과</h3>
                        <div className="flex gap-2 flex-wrap">
                            {quizResult.results?.map((result, index) => (
                                <div
                                    key={result.questionId}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                                        result.isCorrect 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}
                                    title={result.isCorrect ? '정답' : '오답'}
                                >
                                    {index + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3">
                        {!quizResult.passed && quizResult.remainingAttempts > 0 && (
                            <button
                                onClick={() => {
                                    setShowResult(false);
                                    setCurrentQuestionIndex(0);
                                    setAnswers({});
                                    setSelectedAnswer(null);
                                    setIsAnswered(false);
                                    setQuizResult(null);
                                }}
                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
                            >
                                다시 도전
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
                                quizResult.passed 
                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            {quizResult.passed ? '완료' : '닫기'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 퀴즈 문제 화면
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1200] p-4">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-700 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            <span>📝</span>
                            <span>안전 교육 퀴즈</span>
                        </h2>
                        <div className="text-white/80 text-sm">
                            남은 시도: <span className="font-bold text-yellow-300">{remainingAttempts}회</span>
                        </div>
                    </div>
                    <p className="text-white/70 text-sm">{educationTitle}</p>
                </div>

                {/* 진행률 바 */}
                <div className="h-1 bg-gray-700">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* 문제 영역 */}
                <div className="p-6">
                    {/* 문제 번호 */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                            문제 {currentQuestionIndex + 1} / {totalQuestions}
                        </span>
                        <span className="text-gray-500 text-sm">
                            {requiredScore}점 이상 통과
                        </span>
                    </div>

                    {/* 질문 */}
                    <div className="bg-gray-800/50 rounded-xl p-5 mb-6">
                        <p className="text-white text-lg font-medium leading-relaxed">
                            {currentQuestion.question}
                        </p>
                    </div>

                    {/* 선택지 */}
                    <div className="space-y-3 mb-6">
                        {currentQuestion.options.map((option, index) => {
                            let buttonStyle = 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300';
                            
                            if (isAnswered) {
                                if (index === currentQuestion.correctAnswer) {
                                    buttonStyle = 'bg-green-500/20 border-green-500 text-green-400';
                                } else if (index === selectedAnswer && !isCorrect) {
                                    buttonStyle = 'bg-red-500/20 border-red-500 text-red-400';
                                } else {
                                    buttonStyle = 'bg-gray-800/50 border-gray-700 text-gray-500';
                                }
                            } else if (selectedAnswer === index) {
                                buttonStyle = 'bg-blue-500/20 border-blue-500 text-blue-400';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelectAnswer(index)}
                                    disabled={isAnswered}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${buttonStyle}`}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        isAnswered && index === currentQuestion.correctAnswer
                                            ? 'bg-green-500 text-white'
                                            : isAnswered && index === selectedAnswer && !isCorrect
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-700 text-gray-400'
                                    }`}>
                                        {isAnswered && index === currentQuestion.correctAnswer
                                            ? '✓'
                                            : isAnswered && index === selectedAnswer && !isCorrect
                                                ? '✗'
                                                : index + 1
                                        }
                                    </span>
                                    <span className="flex-1">{option}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* 해설 (답변 후 표시) */}
                    {isAnswered && (
                        <div className={`rounded-xl p-4 mb-6 ${
                            isCorrect 
                                ? 'bg-green-500/10 border border-green-500/30' 
                                : 'bg-orange-500/10 border border-orange-500/30'
                        }`}>
                            <div className={`font-bold mb-2 flex items-center gap-2 ${
                                isCorrect ? 'text-green-400' : 'text-orange-400'
                            }`}>
                                <span>{isCorrect ? '🎉 정답입니다!' : '💡 해설'}</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    )}

                    {/* 다음 버튼 */}
                    {isAnswered && (
                        <button
                            onClick={handleNextQuestion}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                        >
                            {isSubmitting 
                                ? '제출 중...' 
                                : isLastQuestion 
                                    ? '결과 확인' 
                                    : '다음 문제'
                            }
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducationQuizModal;
