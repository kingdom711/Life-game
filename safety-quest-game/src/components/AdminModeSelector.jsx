import { BarChart3, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminModeSelector({ onSelectAdmin, onSelectTest }) {
    const navigate = useNavigate();

    const handleAdmin = () => {
        onSelectAdmin();
        navigate('/admin');
    };

    const handleTest = () => {
        onSelectTest();
        navigate('/');
    };

    return (
        <div className="page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem 1rem' }}>
            <section className="glass-panel" style={{
                width: 'min(920px, 100%)',
                borderRadius: 8,
                padding: '2rem',
                border: '1px solid rgba(148, 163, 184, 0.22)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <p style={{ color: '#94a3b8', fontWeight: 800, marginBottom: 8 }}>ADMIN ACCESS</p>
                    <h1 style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                        진입 모드 선택
                    </h1>
                    <p style={{ color: '#cbd5e1', marginTop: 10 }}>
                        관리자 계정으로 운영 콘솔을 보거나, 일반 사용자 흐름을 테스트할 수 있습니다.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                    gap: 14,
                }}>
                    <button
                        type="button"
                        onClick={handleAdmin}
                        className="glass-panel"
                        style={{
                            borderRadius: 8,
                            padding: '1.25rem',
                            textAlign: 'left',
                            border: '1px solid rgba(96, 165, 250, 0.36)',
                            background: 'rgba(15, 23, 42, 0.72)',
                            cursor: 'pointer',
                        }}
                    >
                        <BarChart3 size={28} color="#60a5fa" />
                        <h2 style={{ color: '#f8fafc', margin: '0.85rem 0 0.5rem', fontSize: '1.2rem' }}>
                            관리자 대시보드
                        </h2>
                        <p style={{ color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>
                            운영 지표, 작업중지, 보상 승인, 최근 활동을 관리자 관점에서 확인합니다.
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={handleTest}
                        className="glass-panel"
                        style={{
                            borderRadius: 8,
                            padding: '1.25rem',
                            textAlign: 'left',
                            border: '1px solid rgba(34, 197, 94, 0.32)',
                            background: 'rgba(15, 23, 42, 0.72)',
                            cursor: 'pointer',
                        }}
                    >
                        <FlaskConical size={28} color="#22c55e" />
                        <h2 style={{ color: '#f8fafc', margin: '0.85rem 0 0.5rem', fontSize: '1.2rem' }}>
                            테스트 모드
                        </h2>
                        <p style={{ color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>
                            기술인, 관리감독자, 안전관리자 역할을 자유롭게 전환하며 사용자 화면을 점검합니다.
                        </p>
                    </button>
                </div>
            </section>
        </div>
    );
}

export default AdminModeSelector;
