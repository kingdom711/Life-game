import { useNavigate } from 'react-router-dom';

/**
 * 교육 필수 안내 모달
 * 주요 기능 접근 시 교육 완료 여부를 체크하고 안내하는 모달
 */
const EducationRequiredModal = ({ isOpen, onClose, educationInfo }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleGoToEducation = () => {
        onClose();
        navigate('/education');
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1200] p-4">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-500/30">
                {/* 아이콘 */}
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        안전 교육이 필요합니다
                    </h2>
                    <p className="text-gray-400 text-sm">
                        작업을 시작하기 전에 오늘의 안전 교육을 완료해주세요.
                    </p>
                </div>

                {/* 교육 정보 */}
                {educationInfo && (
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl">
                                📖
                            </div>
                            <div>
                                <h3 className="text-white font-medium">
                                    {educationInfo.title || '오늘의 안전 교육'}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    약 {educationInfo.duration || 10}분 소요
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 안내 메시지 */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                    <p className="text-yellow-400 text-sm text-center">
                        💡 교육을 완료하면 체크리스트 작성, 위험 신고 등 
                        모든 기능을 이용할 수 있습니다.
                    </p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-colors"
                    >
                        나중에
                    </button>
                    <button
                        onClick={handleGoToEducation}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all"
                    >
                        교육 시작하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EducationRequiredModal;
