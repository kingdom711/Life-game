import { useNavigate } from 'react-router-dom';
import { getActiveSpecialization } from '../utils/specializationManager';

/**
 * 전직 뱃지 컴포넌트
 * Dashboard, Profile 등에서 현재 전직 상태를 표시하는 작은 뱃지
 */
const SpecializationBadge = ({ onClick, style = {} }) => {
    const navigate = useNavigate();
    const activeSpec = getActiveSpecialization();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate('/specialization');
        }
    };

    if (!activeSpec) {
        return (
            <div
                onClick={handleClick}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-tertiary)',
                    transition: 'all 0.2s',
                    ...style
                }}
            >
                <span>⚔️</span>
                <span>전직 가능</span>
            </div>
        );
    }

    return (
        <div
            onClick={handleClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                background: `${activeSpec.color}15`,
                border: `1px solid ${activeSpec.color}40`,
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: activeSpec.color,
                transition: 'all 0.2s',
                ...style
            }}
        >
            <span>{activeSpec.icon}</span>
            <span>{activeSpec.name}</span>
        </div>
    );
};

export default SpecializationBadge;
