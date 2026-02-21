import { useEffect, useState } from 'react';
import hazardCycleApi from '../api/hazardCycleApi';
import CycleTimeline from '../components/hazard/CycleTimeline';

function CycleHistoryPage() {
    const [cycles, setCycles] = useState([]);
    const [status, setStatus] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadData = async (nextStatus = status) => {
        setLoading(true);
        setError('');

        try {
            const pageData = await hazardCycleApi.getMyCycles(0, 30, nextStatus);
            setCycles(pageData.content || []);
        } catch (err) {
            setError(err?.message || '이력 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onChangeStatus = (value) => {
        setStatus(value);
        loadData(value);
    };

    return (
        <div className="mx-auto w-full max-w-4xl space-y-4 px-4 pb-24 pt-6">
            <h1 className="text-2xl font-bold text-slate-100">Hazard Cycle 이력</h1>

            <div className="flex items-center gap-2">
                <select
                    value={status}
                    onChange={(e) => onChangeStatus(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                >
                    <option value="ALL">전체</option>
                    <option value="HAZARD_REPORTED">위험 등록</option>
                    <option value="AI_ANALYZED">AI 분석 완료</option>
                    <option value="ACTION_COMPLETED">조치 완료</option>
                </select>

                <button
                    onClick={() => loadData(status)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    새로고침
                </button>
            </div>

            {loading && (
                <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                    불러오는 중...
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                </div>
            )}

            {!loading && !error && <CycleTimeline cycles={cycles} />}
        </div>
    );
}

export default CycleHistoryPage;
