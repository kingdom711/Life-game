import { useNavigate } from 'react-router-dom';
import { FlaskConical, MessageSquare } from 'lucide-react';

function AdminDashboardToolbar({ onTestMode }) {
    const navigate = useNavigate();

    const handleTestMode = () => {
        onTestMode();
        navigate('/');
    };

    return (
        <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            padding: '0.55rem 1rem',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
        }}>
            <div style={{
                maxWidth: 1180,
                margin: '0 auto',
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
            }}>
                <button
                    type="button"
                    onClick={() => navigate('/admin/feedback')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        border: '1px solid rgba(14, 165, 233, 0.38)',
                        background: 'var(--color-info-bg)',
                        color: 'var(--color-info)',
                        minHeight: 44, borderRadius: 8,
                        padding: '0.5rem 0.75rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                    }}
                >
                    <MessageSquare size={16} />
                    의견관리
                </button>
                <button
                    type="button"
                    onClick={handleTestMode}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        border: '1px solid rgba(34, 197, 94, 0.38)',
                        background: 'var(--color-safe-bg)',
                        color: 'var(--color-safe)',
                        minHeight: 44, borderRadius: 8,
                        padding: '0.5rem 0.75rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                    }}
                >
                    <FlaskConical size={16} />
                    테스트 모드
                </button>
            </div>
        </div>
    );
}

export default AdminDashboardToolbar;
