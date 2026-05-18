import { useNavigate } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

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
            background: 'rgba(2, 6, 23, 0.9)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            backdropFilter: 'blur(18px)',
        }}>
            <div style={{
                maxWidth: 1180,
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'flex-end',
            }}>
                <button
                    type="button"
                    onClick={handleTestMode}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        border: '1px solid rgba(34, 197, 94, 0.38)',
                        background: 'rgba(22, 163, 74, 0.16)',
                        color: '#dcfce7',
                        borderRadius: 8,
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
