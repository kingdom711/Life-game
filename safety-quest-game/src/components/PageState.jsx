import React from 'react';

export function LoadingState({ title = '데이터를 불러오는 중입니다...', description = '잠시만 기다려주세요.' }) {
    return (
        <div className="page-state-card">
            <div className="page-state-spinner" aria-hidden="true" />
            <h3 className="page-state-title">{title}</h3>
            <p className="page-state-description">{description}</p>
        </div>
    );
}

export function ErrorState({
    title = '데이터를 불러오지 못했습니다.',
    description = '네트워크 상태를 확인한 뒤 다시 시도해 주세요.',
    onRetry
}) {
    return (
        <div className="page-state-card">
            <div className="page-state-icon" aria-hidden="true">⚠️</div>
            <h3 className="page-state-title">{title}</h3>
            <p className="page-state-description">{description}</p>
            {onRetry && (
                <button className="btn btn-primary page-state-action" onClick={onRetry}>
                    다시 시도
                </button>
            )}
        </div>
    );
}

export function EmptyState({
    icon = '📭',
    title = '표시할 데이터가 없습니다.',
    description = '조건을 변경하거나 다른 메뉴를 확인해 주세요.',
    actionLabel,
    onAction
}) {
    return (
        <div className="page-state-card">
            <div className="page-state-icon" aria-hidden="true">{icon}</div>
            <h3 className="page-state-title">{title}</h3>
            <p className="page-state-description">{description}</p>
            {actionLabel && onAction && (
                <button className="btn btn-primary page-state-action" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export function ResultNotice({
    type = 'success',
    icon,
    title,
    description
}) {
    const resolvedIcon = icon || (type === 'success' ? '✅' : '⚠️');
    const resolvedTitle = title || (type === 'success' ? '작업이 완료되었습니다.' : '요청 처리 중 문제가 발생했습니다.');

    return (
        <div className={`page-notice page-notice-${type}`} role="status" aria-live="polite">
            <div className="page-notice-icon" aria-hidden="true">{resolvedIcon}</div>
            <div className="page-notice-content">
                <p className="page-notice-title">{resolvedTitle}</p>
                {description ? <p className="page-notice-description">{description}</p> : null}
            </div>
        </div>
    );
}
