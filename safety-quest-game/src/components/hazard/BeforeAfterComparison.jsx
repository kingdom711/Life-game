function BeforeAfterComparison({ before, after }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-slate-700">
                <div className="border-b border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200">Before</div>
                <img src={before} alt="before" className="h-56 w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-700">
                <div className="border-b border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200">After</div>
                <img src={after} alt="after" className="h-56 w-full object-cover" />
            </div>
        </div>
    );
}

export default BeforeAfterComparison;
