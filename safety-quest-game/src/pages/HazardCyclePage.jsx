import { useEffect, useMemo, useState } from 'react';
import hazardCycleApi from '../api/hazardCycleApi';
import CameraCapture from '../components/hazard/CameraCapture';
import AiVisionResult from '../components/hazard/AiVisionResult';
import CompletionUpload from '../components/hazard/CompletionUpload';
import CycleRewardAnimation from '../components/hazard/CycleRewardAnimation';
import BeforeAfterComparison from '../components/hazard/BeforeAfterComparison';
import OfflineIndicator from '../components/offline/OfflineIndicator';
import OfflineBanner from '../components/offline/OfflineBanner';
import { offlineDb } from '../utils/offlineDb';
import { syncManager } from '../utils/syncManager';

const createTempId = () => {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return `offline-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

function HazardCyclePage() {
    const [step, setStep] = useState('input');
    const [photo, setPhoto] = useState(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [cycle, setCycle] = useState(null);
    const [completionPhotoUrl, setCompletionPhotoUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => {
        const dispose = syncManager.init();
        return () => dispose();
    }, []);

    const beforePreview = useMemo(() => {
        if (!photo) return cycle?.hazardPhotoUrl || null;
        return URL.createObjectURL(photo);
    }, [photo, cycle?.hazardPhotoUrl]);

    useEffect(() => {
        return () => {
            if (beforePreview && beforePreview.startsWith('blob:')) {
                URL.revokeObjectURL(beforePreview);
            }
        };
    }, [beforePreview]);

    const handleCreate = async () => {
        if (!photo) {
            setError('위험 사진을 먼저 선택해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        setNotice('');
        setStep('analyzing');

        try {
            const response = await hazardCycleApi.createCycle(photo, description, location, null);
            setCycle(response);
            setStep('result');
        } catch (err) {
            if (err?.status === 0) {
                const clientTempId = createTempId();
                await offlineDb.savePendingCycle({
                    clientTempId,
                    description,
                    location,
                    reportedAt: new Date().toISOString(),
                    photoFileName: photo.name || `hazard-${Date.now()}.jpg`,
                    photoBlob: photo,
                    createdAt: Date.now(),
                });

                try {
                    await syncManager.registerSync();
                } catch (_) {
                    // Background Sync 미지원 브라우저는 online 이벤트 수동 동기화로 처리
                }

                setStep('input');
                setNotice('오프라인 상태로 임시 저장했습니다. 온라인 복구 시 자동 동기화됩니다.');
            } else {
                setStep('input');
                setError(err?.message || '사이클 생성 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (completionPhoto, note) => {
        if (!cycle?.id) {
            setError('사이클 ID를 찾을 수 없습니다.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await hazardCycleApi.completeCycle(cycle.id, completionPhoto, note);
            setCycle(response);
            if (response.completionPhotoUrl) {
                setCompletionPhotoUrl(response.completionPhotoUrl);
            } else {
                setCompletionPhotoUrl(URL.createObjectURL(completionPhoto));
            }
            setStep('completed');
        } catch (err) {
            setError(err?.message || '조치 완료 업로드에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('input');
        setPhoto(null);
        setDescription('');
        setLocation('');
        setCycle(null);
        setCompletionPhotoUrl(null);
        setError('');
        setNotice('');
    };

    return (
        <div className="mx-auto w-full max-w-4xl space-y-4 px-4 pb-24 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold text-slate-100">Hazard Cycle</h1>
                <OfflineIndicator />
            </div>

            <OfflineBanner />

            {notice && (
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
                    {notice}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-100">
                    {error}
                </div>
            )}

            {step === 'input' && (
                <div className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
                    <CameraCapture onCapture={setPhoto} initialFile={photo} />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        maxLength={2000}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                        placeholder="위험 상황 설명 (선택)"
                    />

                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        maxLength={500}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                        placeholder="위치 설명 (선택)"
                    />

                    <button
                        onClick={handleCreate}
                        disabled={loading || !photo}
                        className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700"
                    >
                        {loading ? '분석 준비 중...' : 'AI 분석 시작'}
                    </button>
                </div>
            )}

            {step === 'analyzing' && (
                <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-8 text-center text-blue-100">
                    AI가 위험 요소를 분석 중입니다...
                </div>
            )}

            {step === 'result' && cycle && (
                <div className="space-y-4">
                    <AiVisionResult analysis={cycle.aiAnalysis} />
                    <CycleRewardAnimation tier={1} points={cycle.tier1Reward?.pointsAwarded || 100} />
                    <button
                        onClick={() => setStep('action')}
                        className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                        조치하기
                    </button>
                </div>
            )}

            {step === 'action' && (
                <CompletionUpload onUpload={handleComplete} loading={loading} />
            )}

            {step === 'completed' && cycle && (
                <div className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
                    <h3 className="text-lg font-semibold text-slate-100">사이클 완료</h3>
                    <BeforeAfterComparison
                        before={beforePreview || cycle.hazardPhotoUrl}
                        after={completionPhotoUrl || cycle.completionPhotoUrl}
                    />
                    <CycleRewardAnimation
                        tier={2}
                        points={cycle.tier2Reward?.pointsAwarded || 100}
                        totalLabel="최종 보상"
                    />

                    <div className="rounded-lg bg-slate-800/70 px-4 py-3 text-sm text-slate-200">
                        총 획득 포인트: <strong>{cycle.totalPointsEarned}P</strong>
                    </div>

                    <button
                        onClick={reset}
                        className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        새 사이클 시작
                    </button>
                </div>
            )}
        </div>
    );
}

export default HazardCyclePage;
