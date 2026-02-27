import { useState, useEffect, useRef } from 'react';
import { shareReward, generateShareCardImage } from '../utils/shareManager';

/**
 * 보상 공유 모달 (ShareRewardModal)
 *
 * 기획서 4-5: 보상 공유하기 — 자발적 공유 버튼
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - shareType: 'levelUp' | 'rareItem' | 'specialization' | 'monthlyAttendance'
 * - shareData: object (유형별 데이터)
 */

const TYPE_CONFIG = {
    levelUp: {
        title: '레벨업을 달성했습니다!',
        description: '안전 교육을 꾸준히 이수한 결과입니다.',
        gradient: 'from-yellow-500/20 to-amber-500/20',
        borderColor: 'border-yellow-500/30'
    },
    rareItem: {
        title: '희귀 아이템을 획득했습니다!',
        description: '안전 퀘스트 보상으로 획득한 특별한 장비입니다.',
        gradient: 'from-purple-500/20 to-indigo-500/20',
        borderColor: 'border-purple-500/30'
    },
    specialization: {
        title: '전직에 성공했습니다!',
        description: '전문 안전 교육을 모두 이수하여 전문가가 되었습니다.',
        gradient: 'from-orange-500/20 to-red-500/20',
        borderColor: 'border-orange-500/30'
    },
    monthlyAttendance: {
        title: '월간 출석 목표를 달성했습니다!',
        description: '한 달간 꾸준히 안전 활동에 참여한 증거입니다.',
        gradient: 'from-emerald-500/20 to-teal-500/20',
        borderColor: 'border-emerald-500/30'
    }
};

function ShareRewardModal({ isOpen, onClose, shareType, shareData }) {
    const [cardImageUrl, setCardImageUrl] = useState(null);
    const [shareStatus, setShareStatus] = useState(null); // null | 'sharing' | 'success' | 'copied' | 'failed'
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !shareType || !shareData) return;

        // 카드 이미지 미리 생성
        const generatePreview = async () => {
            try {
                const blob = await generateShareCardImage(shareType, shareData);
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setCardImageUrl(url);
                }
            } catch {
                // 이미지 생성 실패 시 텍스트만 표시
            }
        };

        generatePreview();

        return () => {
            if (cardImageUrl) {
                URL.revokeObjectURL(cardImageUrl);
            }
        };
    }, [isOpen, shareType, shareData]);

    // 모달 닫힐 때 상태 초기화
    useEffect(() => {
        if (!isOpen) {
            setShareStatus(null);
            if (cardImageUrl) {
                URL.revokeObjectURL(cardImageUrl);
                setCardImageUrl(null);
            }
        }
    }, [isOpen]);

    if (!isOpen || !shareType) return null;

    const config = TYPE_CONFIG[shareType] || TYPE_CONFIG.levelUp;

    const handleShare = async () => {
        setShareStatus('sharing');

        const result = await shareReward(shareType, shareData);

        if (result.success) {
            if (result.method === 'clipboard') {
                setShareStatus('copied');
            } else {
                setShareStatus('success');
            }
            // 3초 후 모달 닫기
            setTimeout(() => {
                onClose();
            }, 2000);
        } else if (result.method === 'cancelled') {
            setShareStatus(null);
        } else {
            setShareStatus('failed');
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '1rem'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={`w-full max-w-sm bg-gradient-to-br ${config.gradient}
                  backdrop-blur-xl rounded-2xl border ${config.borderColor}
                  shadow-2xl shadow-black/30 overflow-hidden`}
                style={{ background: 'rgba(15, 23, 42, 0.95)' }}
            >
                {/* 헤더 */}
                <div className="p-5 text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <h2 className="text-lg font-bold text-slate-100 mb-1">
                        {config.title}
                    </h2>
                    <p className="text-sm text-slate-400">
                        {config.description}
                    </p>
                </div>

                {/* 카드 미리보기 */}
                {cardImageUrl && (
                    <div className="px-5 pb-3">
                        <img
                            src={cardImageUrl}
                            alt="공유 카드"
                            className="w-full rounded-xl border border-slate-700/50 shadow-lg"
                        />
                    </div>
                )}

                {/* 상태 메시지 */}
                {shareStatus === 'success' && (
                    <div className="mx-5 mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20
                      text-center text-sm text-emerald-400">
                        공유가 완료되었습니다!
                    </div>
                )}
                {shareStatus === 'copied' && (
                    <div className="mx-5 mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20
                      text-center text-sm text-blue-400">
                        클립보드에 복사되었습니다!
                    </div>
                )}
                {shareStatus === 'failed' && (
                    <div className="mx-5 mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20
                      text-center text-sm text-red-400">
                        공유에 실패했습니다. 다시 시도해주세요.
                    </div>
                )}

                {/* 버튼 영역 */}
                <div className="p-5 pt-2 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400
                          bg-slate-800/60 hover:bg-slate-700/60 transition-colors
                          border border-slate-700/50"
                    >
                        닫기
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={shareStatus === 'sharing' || shareStatus === 'success' || shareStatus === 'copied'}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                          bg-gradient-to-r from-blue-500 to-indigo-500
                          hover:from-blue-600 hover:to-indigo-600 transition-all
                          disabled:opacity-50 disabled:cursor-not-allowed
                          shadow-lg shadow-blue-500/20"
                    >
                        {shareStatus === 'sharing' ? '공유 중...' :
                         shareStatus === 'success' ? '완료!' :
                         shareStatus === 'copied' ? '복사 완료!' :
                         '공유하기 🔗'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareRewardModal;
