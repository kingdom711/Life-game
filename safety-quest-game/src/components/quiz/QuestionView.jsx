const QuestionView = ({ currentIndex, totalQuestions, requiredScore, question }) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                    문제 {currentIndex + 1} / {totalQuestions}
                </span>
                <span className="text-gray-500 text-xs">
                    {requiredScore}점 이상 통과
                </span>
            </div>

            <h2 className="text-white text-2xl font-bold leading-snug">
                {question}
            </h2>
        </div>
    );
};

export default QuestionView;
