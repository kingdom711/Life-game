function ProgressBar({ progress = 0, type = 'primary' }) {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    const colorClass = {
        primary: 'progress-bar',
        success: 'progress-bar-success',
        warning: 'progress-bar-warning',
        danger: 'progress-bar-danger'
    }[type] || 'progress-bar';

    return (
        <div className="progress">
            <div
                className={colorClass}
                style={{ width: `${clampedProgress}%` }}
                role="progressbar"
                aria-valuenow={clampedProgress}
                aria-valuemin="0"
                aria-valuemax="100"
            >
            </div>
        </div>
    );
}

export default ProgressBar;
