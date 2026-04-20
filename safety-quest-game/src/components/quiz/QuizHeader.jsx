import { useEffect, useState } from 'react';
import { X, Heart } from 'lucide-react';

const QuizHeader = ({ educationTitle, remainingAttempts, progressPercent, onClose, heartPulseKey }) => {
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (heartPulseKey == null) return;
        setPulse(true);
        const t = setTimeout(() => setPulse(false), 400);
        return () => clearTimeout(t);
    }, [heartPulseKey]);

    return (
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
            <div className="quiz-center max-w-2xl w-full px-4 py-3 flex items-center gap-3">
                <button
                    onClick={onClose}
                    aria-label="퀴즈 닫기"
                    className="quiz-tap text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center shrink-0 transition-colors"
                >
                    <X size={22} strokeWidth={2} />
                </button>

                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--color-safe)] transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className={`flex items-center gap-1.5 shrink-0 ${pulse ? 'quiz-heart-pulse' : ''}`}>
                    <Heart size={18} strokeWidth={2.5} className="text-red-500 fill-red-500" />
                    <span className="text-sm font-bold text-red-400">{remainingAttempts}</span>
                </div>
            </div>

            {educationTitle && (
                <div className="quiz-center max-w-2xl w-full px-4 pb-2">
                    <p className="text-xs text-gray-500 truncate">{educationTitle}</p>
                </div>
            )}
        </div>
    );
};

export default QuizHeader;
