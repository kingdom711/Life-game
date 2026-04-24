import { Trophy, PartyPopper, Frown, Coins, Zap, Clock, Check, X as XIcon } from 'lucide-react';

const QuizResultScreen = ({ quizResult, requiredScore, onRetry, onClose }) => {
    const passed = quizResult.passed;
    const HeroIcon = passed ? PartyPopper : Frown;

    return (
        <div className="fixed inset-0 bg-gray-900 z-[1200] flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="quiz-center max-w-lg w-full px-6 py-10 pb-28">
                    {/* 히어로 */}
                    <div className="text-center mb-8">
                        <div className={`w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center ${
                            passed ? 'bg-emerald-500/15' : 'bg-red-500/15'
                        }`}>
                            <HeroIcon
                                size={56}
                                strokeWidth={2}
                                className={passed ? 'text-emerald-400' : 'text-red-400'}
                            />
                        </div>
                        <h2 className={`text-3xl font-bold mb-2 ${
                            passed ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                            {passed ? '축하합니다!' : '아쉽습니다'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {passed
                                ? '안전 교육 퀴즈를 통과했습니다'
                                : `${requiredScore}점 이상이 필요합니다`
                            }
                        </p>
                    </div>

                    {/* 점수 */}
                    <div className="bg-gray-800/60 rounded-2xl p-6 mb-5 border border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400 text-sm">획득 점수</span>
                            <span className={`text-4xl font-bold ${
                                passed ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                                {quizResult.score}<span className="text-xl text-gray-500 ml-1">점</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">정답 수</span>
                            <span className="text-white font-bold">
                                {quizResult.correctCount} / {quizResult.totalQuestions}
                            </span>
                        </div>
                    </div>

                    {/* 보상 (합격 시) */}
                    {passed && quizResult.rewards && (
                        <div className="bg-yellow-500/10 rounded-2xl p-5 mb-5 border border-yellow-500/30">
                            <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2 text-sm">
                                <Trophy size={18} strokeWidth={2.5} />
                                <span>획득 보상</span>
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <RewardCell
                                    Icon={Coins}
                                    iconColor="text-yellow-400"
                                    value={`+${quizResult.rewards.points}`}
                                    label="포인트"
                                    valueColor="text-yellow-400"
                                />
                                <RewardCell
                                    Icon={Zap}
                                    iconColor="text-purple-400"
                                    value={`+${quizResult.rewards.exp}`}
                                    label="경험치"
                                    valueColor="text-purple-400"
                                />
                                <RewardCell
                                    Icon={Clock}
                                    iconColor="text-blue-400"
                                    value={`+${quizResult.rewards.legalHours}h`}
                                    label="법정 시간"
                                    valueColor="text-blue-400"
                                />
                            </div>
                        </div>
                    )}

                    {/* 남은 시도 (불합격 시) */}
                    {!passed && quizResult.remainingAttempts !== undefined && (
                        <div className="bg-gray-800/60 rounded-2xl p-5 mb-5 text-center border border-gray-800">
                            <p className="text-gray-400 mb-2 text-sm">남은 시도 횟수</p>
                            <p className="text-3xl font-bold text-orange-400">
                                {quizResult.remainingAttempts}<span className="text-base text-gray-500 ml-1">회</span>
                            </p>
                            {quizResult.remainingAttempts === 0 && (
                                <p className="text-red-400 text-xs mt-2">
                                    내일 다시 도전할 수 있습니다
                                </p>
                            )}
                        </div>
                    )}

                    {/* 문제별 결과 */}
                    <div className="mb-4">
                        <h3 className="text-gray-400 text-xs mb-3 font-semibold uppercase tracking-wide">
                            문제별 결과
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            {quizResult.results?.map((result, index) => (
                                <div
                                    key={result.questionId}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border-2 ${
                                        result.isCorrect
                                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                            : 'bg-red-500/15 text-red-300 border-red-500/40'
                                    }`}
                                    title={`${index + 1}번 - ${result.isCorrect ? '정답' : '오답'}`}
                                >
                                    {result.isCorrect ? <Check size={16} strokeWidth={3} /> : <XIcon size={16} strokeWidth={3} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단 고정 CTA */}
            <div className="shrink-0 z-10 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 quiz-safe-footer">
                <div className="quiz-center max-w-lg w-full px-6 pt-4 pb-4 flex gap-3">
                    {!passed && quizResult.remainingAttempts > 0 && (
                        <button
                            onClick={onRetry}
                            className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors uppercase tracking-wide"
                        >
                            다시 도전
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`flex-1 py-4 font-bold rounded-xl transition-colors uppercase tracking-wide ${
                            passed
                                ? 'bg-[var(--color-safe)] hover:bg-[var(--color-safe-dark)] text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        }`}
                    >
                        {passed ? '완료' : '닫기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RewardCell = ({ Icon, iconColor, value, label, valueColor }) => (
    <div>
        <Icon size={20} strokeWidth={2} className={`mx-auto mb-1 ${iconColor}`} />
        <div className={`text-xl font-bold ${valueColor}`}>{value}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
    </div>
);

export default QuizResultScreen;
