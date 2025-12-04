import { roles } from '../data/rolesData';

function RoleSelector({ onSelectRole }) {
    return (
        <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️ 안전의 길</h1>
                    <p className="text-muted" style={{ fontSize: '1.25rem' }}>
                        역할을 선택하여 안전관리 퀘스트를 시작하세요
                    </p>
                </div>

                <div className="grid grid-3">
                    {roles.map(role => (
                        <div key={role.id} className="card" style={{ cursor: 'pointer' }}>
                            <div className="card-header" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{role.icon}</div>
                                <h3 className="card-title">{role.name}</h3>
                                <p className="card-subtitle">{role.description}</p>
                            </div>

                            <div className="card-body">
                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                                    주요 기능
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {role.features.map((feature, index) => (
                                        <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: role.color }}>✓</span>
                                            <span style={{ fontSize: '0.875rem' }}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="card-footer">
                                <button
                                    onClick={() => onSelectRole(role.id)}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        background: `linear-gradient(135deg, ${role.color}, ${role.color}dd)`,
                                    }}
                                >
                                    선택하기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RoleSelector;
