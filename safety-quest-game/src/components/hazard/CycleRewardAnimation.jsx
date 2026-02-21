import { useEffect, useState } from 'react';

function CycleRewardAnimation({ tier, points, totalLabel = '보상' }) {
    const [displayPoints, setDisplayPoints] = useState(0);

    useEffect(() => {
        setDisplayPoints(0);
        if (!points) return;

        const duration = 700;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setDisplayPoints(Math.floor(points * progress));
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    }, [points]);

    return (
        <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-4 text-center">
            <p className="text-xs font-semibold text-amber-200">Tier {tier} {totalLabel}</p>
            <p className="mt-1 text-2xl font-black text-amber-100">+{displayPoints}P</p>
        </div>
    );
}

export default CycleRewardAnimation;
