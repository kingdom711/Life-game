import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Search, Users, X } from 'lucide-react';
import teamApi from '../../api/teamApi';
import { useAuth } from '../../context/AuthContext';

const panelStyle = {
    background: 'rgba(15, 23, 42, 0.96)',
    border: '1px solid rgba(148, 163, 184, 0.22)',
    borderRadius: '16px',
    width: 'min(720px, calc(100vw - 2rem))',
    maxHeight: 'calc(100vh - 2rem)',
    overflow: 'auto',
    boxShadow: '0 24px 80px rgba(0,0,0,0.45)'
};

function TeamJoinWizard({ isOpen = true, onClose, force = false, onComplete }) {
    const { refreshUser } = useAuth();
    const [step, setStep] = useState(1);
    const [siteName, setSiteName] = useState('');
    const [query, setQuery] = useState('');
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [createMode, setCreateMode] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const canSearch = siteName.trim().length > 0;

    useEffect(() => {
        if (!isOpen || step !== 2 || !canSearch) return;

        const timer = setTimeout(async () => {
            setLoading(true);
            setError('');
            try {
                const data = await teamApi.searchTeams({ siteName, q: query });
                setTeams(Array.isArray(data) ? data : []);
            } catch (err) {
                setTeams([]);
                setError(err.message || '팀 목록을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [canSearch, isOpen, query, siteName, step]);

    const primaryAction = useMemo(() => {
        if (step === 1) return '다음';
        if (createMode) return '팀 만들기';
        return selectedTeam ? '가입 신청' : '팀 선택';
    }, [createMode, selectedTeam, step]);

    if (!isOpen) return null;

    const finish = async (nextResult) => {
        setResult(nextResult);
        try {
            await refreshUser?.();
        } catch (_) {
            // Membership refresh is best-effort; the gate hook will retry.
        }
        await onComplete?.(nextResult);
        setStep(3);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (step === 1) {
            if (!siteName.trim()) {
                setError('현장명을 입력해 주세요.');
                return;
            }
            setStep(2);
            return;
        }

        if (step === 2 && createMode && !newTeamName.trim()) {
            setError('새 팀 이름을 입력해 주세요.');
            return;
        }

        if (step === 2 && !createMode && !selectedTeam) {
            setError('가입할 팀을 선택해 주세요.');
            return;
        }

        setLoading(true);
        try {
            const response = createMode
                ? await teamApi.createTeam({ name: newTeamName, siteName })
                : await teamApi.joinTeam(selectedTeam.id);
            await finish({
                type: createMode ? 'created' : 'requested',
                team: createMode ? response : selectedTeam,
                membership: createMode ? { status: 'ACTIVE' } : response
            });
        } catch (err) {
            setError(err.message || '팀 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(2, 6, 23, 0.72)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <form onSubmit={handleSubmit} style={panelStyle}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                        <div>
                            <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800 }}>
                                TEAM ONBOARDING
                            </div>
                            <h2 style={{ margin: '0.25rem 0 0', color: '#e2e8f0', fontSize: '1.35rem' }}>
                                소속 팀 설정
                            </h2>
                        </div>
                        {!force && (
                            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" aria-label="닫기">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                style={{
                                    flex: 1,
                                    height: 6,
                                    borderRadius: 999,
                                    background: item <= step ? '#38bdf8' : 'rgba(148,163,184,0.18)'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                    {step === 1 && (
                        <div>
                            <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.5rem' }}>
                                현장명
                            </label>
                            <input
                                value={siteName}
                                onChange={(event) => setSiteName(event.target.value)}
                                className="form-input"
                                placeholder="예: 진성이엔지 3공구"
                                style={{ width: '100%', padding: '0.8rem' }}
                                autoFocus
                            />
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                                같은 현장 안에서 팀을 검색하거나 새 팀을 만들 수 있습니다.
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <button type="button" className={`btn btn-sm ${!createMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCreateMode(false)}>
                                    <Search size={16} /> 팀 찾기
                                </button>
                                <button type="button" className={`btn btn-sm ${createMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCreateMode(true)}>
                                    <Users size={16} /> 새 팀 만들기
                                </button>
                            </div>

                            {createMode ? (
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        새 팀 이름
                                    </label>
                                    <input
                                        value={newTeamName}
                                        onChange={(event) => setNewTeamName(event.target.value)}
                                        className="form-input"
                                        placeholder="예: 철근 A팀"
                                        style={{ width: '100%', padding: '0.8rem' }}
                                    />
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                                        생성자는 자동으로 팀 리더가 됩니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        팀 검색
                                    </label>
                                    <input
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        className="form-input"
                                        placeholder="팀 이름 일부를 입력하세요"
                                        style={{ width: '100%', padding: '0.8rem', marginBottom: '0.75rem' }}
                                    />
                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                        {loading && <div style={{ color: '#94a3b8' }}>팀을 찾는 중입니다.</div>}
                                        {!loading && teams.length === 0 && (
                                            <div style={{ color: '#94a3b8' }}>검색 결과가 없습니다. 새 팀을 만들 수 있습니다.</div>
                                        )}
                                        {teams.map((team) => (
                                            <button
                                                type="button"
                                                key={team.id}
                                                onClick={() => setSelectedTeam(team)}
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '0.85rem',
                                                    borderRadius: 10,
                                                    border: selectedTeam?.id === team.id ? '2px solid #38bdf8' : '1px solid rgba(148,163,184,0.18)',
                                                    background: selectedTeam?.id === team.id ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)',
                                                    color: '#e2e8f0',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ fontWeight: 800 }}>{team.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    리더 {team.leaderName || '-'} · 멤버 {team.activeMemberCount || 0}명
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                            <div style={{ color: '#22c55e', marginBottom: '0.75rem' }}>
                                <Check size={40} />
                            </div>
                            <h3 style={{ color: '#e2e8f0', margin: 0 }}>
                                {result?.type === 'created' ? '팀 생성이 완료되었습니다.' : '가입 신청을 보냈습니다.'}
                            </h3>
                            <p style={{ color: '#94a3b8' }}>
                                {result?.type === 'created'
                                    ? '이제 팀 기능을 바로 사용할 수 있습니다.'
                                    : '리더가 승인하면 팀 기능이 열립니다.'}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div style={{ marginTop: '1rem', color: '#f87171', fontWeight: 700 }}>
                            {error}
                        </div>
                    )}
                </div>

                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(148,163,184,0.16)', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                    {step > 1 && step < 3 ? (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(step - 1)}>
                            이전
                        </button>
                    ) : <span />}
                    {step < 3 ? (
                        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {primaryAction}
                        </button>
                    ) : (
                        <button type="button" className="btn btn-primary btn-sm" onClick={onClose || (() => window.location.reload())}>
                            확인
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default TeamJoinWizard;
