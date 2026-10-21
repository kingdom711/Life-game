import { useNavigate } from 'react-router-dom';
import { BarChart3, RotateCcw } from 'lucide-react';
import { roles } from '../data/rolesData';

function AdminTestToolbar({ selectedRole, onRoleChange, onAdminMode }) {
    const navigate = useNavigate();

    const handleRoleClick = (roleId) => {
        onRoleChange(roleId);
        navigate('/');
    };

    const handleAdminMode = () => {
        onAdminMode();
        navigate('/admin');
    };

    return (
        <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            padding: '0.6rem 1rem',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
        }}>
            <div style={{
                maxWidth: 1180,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)', fontWeight: 900 }}>
                    <RotateCcw size={16} color="var(--color-safe)" />
                    테스트 모드
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {roles.map((role) => {
                        const active = selectedRole === role.id;
                        return (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => handleRoleClick(role.id)}
                                aria-pressed={active}
                                style={{
                                    border: active ? `1px solid ${role.color}` : '1px solid rgba(148, 163, 184, 0.22)',
                                    background: active ? 'var(--color-primary-soft)' : 'var(--color-surface-subtle)',
                                    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    minHeight: 44, borderRadius: 8,
                                    padding: '0.5rem 0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                }}
                            >
                                {role.name}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={handleAdminMode}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        border: '1px solid rgba(96, 165, 250, 0.4)',
                        background: 'var(--color-primary-soft)',
                        color: 'var(--color-primary)',
                        minHeight: 44, borderRadius: 8,
                        padding: '0.5rem 0.75rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                    }}
                >
                    <BarChart3 size={16} />
                    관리자 대시보드
                </button>
            </div>
        </div>
    );
}

export default AdminTestToolbar;
