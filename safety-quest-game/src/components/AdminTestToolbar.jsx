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
            background: 'rgba(2, 6, 23, 0.92)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            backdropFilter: 'blur(18px)',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0', fontWeight: 900 }}>
                    <RotateCcw size={16} color="#22c55e" />
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
                                style={{
                                    border: active ? `1px solid ${role.color}` : '1px solid rgba(148, 163, 184, 0.22)',
                                    background: active ? `${role.color}22` : 'rgba(15, 23, 42, 0.65)',
                                    color: active ? '#f8fafc' : '#cbd5e1',
                                    borderRadius: 8,
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
                        background: 'rgba(37, 99, 235, 0.16)',
                        color: '#dbeafe',
                        borderRadius: 8,
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
