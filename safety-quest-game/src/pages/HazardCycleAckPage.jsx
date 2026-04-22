import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import hazardCycleApi from '../api/hazardCycleApi';
import AiVisionResult from '../components/hazard/AiVisionResult';

/**
 * 동료 근로자 위험요인 확인 페이지.
 * 산업안전보건법 제36조 2항 "근로자 참여" 증빙용.
 *
 * URL: /hazard-ack/:cycleId
 */
function HazardCycleAckPage() {
    const { cycleId } = useParams();
    const navigate = useNavigate();

    const [cycle, setCycle] = useState(null);
    const [acks, setAcks] = useState([]);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [summary, ackList] = await Promise.all([
                hazardCycleApi.getCycleSummary(cycleId),
                hazardCycleApi.listAcks(cycleId),
            ]);
            setCycle(summary);
            setAcks(ackList || []);
        } catch (e) {
            setError(e?.message || '사이클 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, [cycleId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAck = async () => {
        setSubmitting(true);
        setError('');
        setNotice('');
        try {
            await hazardCycleApi.ackCycle(cycleId, comment.trim() || null);
            setNotice('확인이 등록되었습니다. 근로자 참여 기록으로 저장됩니다.');
            setComment('');
            const ackList = await hazardCycleApi.listAcks(cycleId);
            setAcks(ackList || []);
        } catch (e) {
            const code = e?.data?.code;
            if (code === 'HC005') {
                setError('이미 이 사이클을 확인하셨습니다.');
            } else if (code === 'HC006') {
                setError('본인이 신고한 사이클은 확인할 수 없습니다.');
            } else {
                setError(e?.message || '확인 등록에 실패했습니다.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-6 text-center text-slate-300">
                불러오는 중...
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-4 px-4 pb-24 pt-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-100">동료 위험요인 확인</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-1 text-xs text-slate-300"
                >
                    뒤로
                </button>
            </div>

            <p className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs text-blue-200">
                산업안전보건법 제36조 2항 — 위험성평가 시 근로자 참여 증빙. 본 확인 기록은 위험성평가표 PDF에 포함되어
                고용노동부 점검 시 "근로자 참여 이행" 증거로 사용됩니다.
            </p>

            {error && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-100">
                    {error}
                </div>
            )}
            {notice && (
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
                    {notice}
                </div>
            )}

            {cycle?.hazardPhotoUrl && (
                <img
                    src={cycle.hazardPhotoUrl}
                    alt="위험 현장"
                    className="w-full max-h-96 rounded-xl border border-slate-700 object-contain bg-slate-950"
                />
            )}

            {cycle && (
                <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
                    <div><span className="text-slate-500">사이클 ID:</span> #{cycle.id}</div>
                    {cycle.locationDescription && (
                        <div><span className="text-slate-500">위치:</span> {cycle.locationDescription}</div>
                    )}
                    {cycle.hazardDescription && (
                        <div className="mt-1"><span className="text-slate-500">상황:</span> {cycle.hazardDescription}</div>
                    )}
                </div>
            )}

            <AiVisionResult analysis={cycle?.aiAnalysis} />

            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">내 확인 제출</h3>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="현장에서 확인한 내용 / 추가 의견 (선택)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                />
                <button
                    onClick={handleAck}
                    disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                    {submitting ? '등록 중...' : '위험요인 확인 (peer ack)'}
                </button>
            </div>

            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-100">
                    확인자 목록 <span className="text-slate-400">({acks.length}명)</span>
                </h3>
                {acks.length === 0 ? (
                    <p className="text-xs text-slate-500">아직 확인한 동료가 없습니다.</p>
                ) : (
                    <ul className="space-y-2">
                        {acks.map((a) => (
                            <li key={a.id} className="rounded-lg bg-slate-800/70 px-3 py-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-200">{a.ackerName}</span>
                                    <span className="text-[11px] text-slate-500">
                                        {new Date(a.ackedAt).toLocaleString('ko-KR')}
                                    </span>
                                </div>
                                {a.comment && <p className="mt-1 text-xs text-slate-400">{a.comment}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default HazardCycleAckPage;
