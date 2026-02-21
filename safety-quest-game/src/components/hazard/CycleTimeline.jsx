function CycleTimeline({ cycles = [] }) {
    if (!cycles.length) {
        return (
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 text-sm text-slate-400">
                아직 사이클 이력이 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {cycles.map((cycle) => (
                <article key={cycle.id} className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-100">Cycle #{cycle.id}</h4>
                        <span className="text-xs text-blue-200">{cycle.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{cycle.hazardDescription || '설명 없음'}</p>
                    <p className="mt-1 text-xs text-slate-400">{cycle.locationDescription || '위치 정보 없음'}</p>
                    <p className="mt-2 text-xs text-amber-200">획득 포인트: {cycle.totalPointsEarned}P</p>
                </article>
            ))}
        </div>
    );
}

export default CycleTimeline;
