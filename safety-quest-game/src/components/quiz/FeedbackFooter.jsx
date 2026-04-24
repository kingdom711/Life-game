import { CheckCircle2, Lightbulb } from 'lucide-react';

const FeedbackFooter = ({
    isGraded,
    isCorrect,
    selectedAnswer,
    explanation,
    isLastQuestion,
    isSubmitting,
    onConfirm,
    onNext,
}) => {
    // Pre-grade: slim footer with "확인" CTA
    if (!isGraded) {
        const canConfirm = selectedAnswer !== null && selectedAnswer !== undefined;
        return (
            <div className="shrink-0 z-10 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 quiz-safe-footer">
                <div className="quiz-center max-w-2xl w-full px-6 pt-4 pb-4">
                    <button
                        onClick={onConfirm}
                        disabled={!canConfirm}
                        className={`quiz-tap w-full py-4 font-bold rounded-xl transition-all uppercase tracking-wide ${
                            canConfirm
                                ? 'bg-[var(--color-safe)] hover:bg-[var(--color-safe-dark)] text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        확인
                    </button>
                </div>
            </div>
        );
    }

    // Post-grade: feedback panel (inline) + next CTA inside
    const panelBg = isCorrect ? 'bg-emerald-500/15' : 'bg-orange-500/15';
    const panelBorder = isCorrect ? 'border-emerald-500/40' : 'border-orange-500/40';
    const titleColor = isCorrect ? 'text-emerald-400' : 'text-orange-400';
    const btnStyle = isCorrect
        ? 'bg-[var(--color-safe)] hover:bg-[var(--color-safe-dark)] text-white shadow-lg shadow-emerald-500/20'
        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20';
    const Icon = isCorrect ? CheckCircle2 : Lightbulb;

    return (
        <div className={`quiz-slide-up mt-5 rounded-2xl border-2 backdrop-blur-sm ${panelBg} ${panelBorder}`}>
            <div className="w-full px-5 pt-5 pb-5">
                <div className={`font-bold mb-2 flex items-center gap-2 ${titleColor}`}>
                    <Icon size={20} strokeWidth={2.5} />
                    <span>{isCorrect ? '정답입니다!' : '해설'}</span>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-4">
                    {explanation}
                </p>

                <button
                    onClick={onNext}
                    disabled={isSubmitting}
                    className={`quiz-tap w-full py-4 font-bold rounded-xl transition-all uppercase tracking-wide disabled:opacity-50 ${btnStyle}`}
                >
                    {isSubmitting
                        ? '제출 중...'
                        : isLastQuestion
                            ? '결과 확인'
                            : '계속하기'
                    }
                </button>
            </div>
        </div>
    );
};

export default FeedbackFooter;
