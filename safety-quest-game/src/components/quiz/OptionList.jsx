import { Check, X as XIcon } from 'lucide-react';

const OptionList = ({ options, selectedAnswer, isGraded, correctAnswer, onSelect }) => {
    const isCorrect = selectedAnswer === correctAnswer;

    return (
        <div className="space-y-3">
            {options.map((option, index) => {
                let buttonStyle = 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-100';
                let pillStyle = 'bg-gray-700 text-gray-400 border-gray-600';
                let animClass = '';

                if (isGraded) {
                    if (index === correctAnswer) {
                        buttonStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-300';
                        pillStyle = 'bg-emerald-500 text-white border-emerald-500';
                        animClass = 'quiz-pop';
                    } else if (index === selectedAnswer && !isCorrect) {
                        buttonStyle = 'bg-red-500/15 border-red-500 text-red-300';
                        pillStyle = 'bg-red-500 text-white border-red-500';
                        animClass = 'quiz-shake';
                    } else {
                        buttonStyle = 'bg-gray-800/40 border-gray-800 text-gray-600';
                        pillStyle = 'bg-gray-800 text-gray-600 border-gray-700';
                    }
                } else if (selectedAnswer === index) {
                    buttonStyle = 'bg-blue-500/15 border-blue-500 text-blue-300';
                    pillStyle = 'bg-blue-500 text-white border-blue-500';
                }

                let pillContent;
                if (isGraded && index === correctAnswer) {
                    pillContent = <Check size={16} strokeWidth={3} />;
                } else if (isGraded && index === selectedAnswer && !isCorrect) {
                    pillContent = <XIcon size={16} strokeWidth={3} />;
                } else {
                    pillContent = <span>{index + 1}</span>;
                }

                return (
                    <button
                        key={index}
                        onClick={() => onSelect(index)}
                        disabled={isGraded}
                        className={`quiz-tap w-full px-4 py-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${buttonStyle} ${animClass}`}
                    >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-2 shrink-0 ${pillStyle}`}>
                            {pillContent}
                        </span>
                        <span className="flex-1 font-medium">{option}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default OptionList;
