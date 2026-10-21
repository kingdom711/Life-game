import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Shield, UserMinus, X } from 'lucide-react';
import teamApi from '../api/teamApi';
import useTeamGate from '../hooks/useTeamGate';

const cardStyle = {
    background: 'var(--color-surface)',
    borderRadius: '14px',
    border: '1px solid var(--color-border)',
    padding: '1rem'
};

function TeamDetailPage() {
    const navigate = useNavigate();
    const teamGate = useTeamGate();
    const [members, setMembers] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const teamId = teamGate.team?.id || teamGate.membership?.teamId;

    const loadTeamData = useCallback(async () => {
        if (!teamId || !teamGate.isActive) {
            setMembers([]);
            setPendingMembers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const memberResult = await teamApi.listTeamMembers(teamId);
            setMembers(Array.isArray(memberResult) ? memberResult : []);

            if (teamGate.isLeader) {
                const pendingResult = await teamApi.listPendingMembers(teamId);
                setPendingMembers(Array.isArray(pendingResult) ? pendingResult : []);
            } else {
                setPendingMembers([]);
            }
        } catch (err) {
            setError(err.message || '팀 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, [teamGate.isActive, teamGate.isLeader, teamId]);

    useEffect(() => {
        loadTeamData();
    }, [loadTeamData]);

    const runAction = async (action, successMessage) => {
        setMessage('');
        setError('');
        try {
            await action();
            setMessage(successMessage);
            await Promise.all([teamGate.refresh(), loadTeamData()]);
        } catch (err) {
            setError(err.message || '처리 중 오류가 발생했습니다.');
        }
    };

    const handleApprove = (userId) => runAction(
        () => teamApi.approveMember(teamId, userId),
        '가입 신청을 승인했습니다.'
    );

    const handleReject = (userId) => runAction(
        () => teamApi.rejectMember(teamId, userId),
        '가입 신청을 거절했습니다.'
    );

    const handleKick = (member) => {
        if (!window.confirm(`${member.userName}님을 팀에서 내보낼까요?`)) return;
        runAction(
            () => teamApi.kickMember(teamId, member.userId),
            '팀원을 내보냈습니다.'
        );
    };

    const handleLeave = () => {
        if (!window.confirm('팀에서 탈퇴할까요?')) return;
        runAction(
            () => teamApi.leaveTeam(teamId),
            '팀에서 탈퇴했습니다.'
        ).then(() => navigate('/profile'));
    };

    if (!teamGate.loading && !teamGate.isActive) {
        return (
            <div className="page">
                <div className="container">
                    <Link to="/" className="btn btn-secondary btn-sm">대시보드</Link>
                    <div className="card" style={{ marginTop: '1rem' }}>
                        <div className="card-header">
                            <h3 className="card-title">팀 설정 필요</h3>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">
                                {teamGate.isPending ? '팀 리더의 승인을 기다리고 있습니다.' : '팀에 가입하면 팀 정보를 볼 수 있습니다.'}
                            </p>
                            <Link to="/profile" className="btn btn-primary btn-sm">팀 설정으로 이동</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            paddingBottom: '6rem'
        }}>
            <div style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm">뒤로</button>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>우리 팀</h2>
            </div>

            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 900, margin: '0 auto' }}>
                <div style={{
                    ...cardStyle,
                    background: 'var(--color-primary-soft)',
                    borderColor: 'var(--color-primary-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 800 }}>
                                {teamGate.team?.siteName || '현장'}
                            </div>
                            <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.35rem', fontWeight: 800 }}>
                                {teamGate.team?.name || teamGate.membership?.teamName}
                            </h3>
                            <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                승인된 팀원 {members.length}명
                            </p>
                        </div>
                        {teamGate.isLeader ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 800 }}>
                                <Shield size={18} /> 리더 관리 모드
                            </span>
                        ) : (
                            <button className="btn btn-secondary btn-sm" onClick={handleLeave}>
                                팀 탈퇴
                            </button>
                        )}
                    </div>
                </div>

                {message && <div role="status" style={{ ...cardStyle, color: 'var(--color-safe)', fontWeight: 800 }}>{message}</div>}
                {error && <div role="alert" style={{ ...cardStyle, color: 'var(--color-danger)', fontWeight: 800 }}>{error}</div>}

                {teamGate.isLeader && (
                    <section style={cardStyle}>
                        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 800 }}>
                            가입 신청 {pendingMembers.length}건
                        </h3>
                        {loading ? (
                            <p style={{ color: 'var(--color-text-muted)' }}>불러오는 중입니다.</p>
                        ) : pendingMembers.length === 0 ? (
                            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>대기 중인 신청이 없습니다.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {pendingMembers.map((member) => (
                                    <div key={member.membershipId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem', borderRadius: 10, background: 'var(--color-surface)' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800 }}>{member.userName}</div>
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{member.username}</div>
                                        </div>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(member.userId)}>
                                            <Check size={16} /> 승인
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleReject(member.userId)}>
                                            <X size={16} /> 거절
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section style={cardStyle}>
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 800 }}>
                        팀원 목록
                    </h3>
                    {loading ? (
                        <p style={{ color: 'var(--color-text-muted)' }}>불러오는 중입니다.</p>
                    ) : members.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>승인된 팀원이 없습니다.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {members.map((member) => (
                                <div key={member.membershipId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem', borderRadius: 10, background: 'var(--color-surface)' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: member.leader ? 'var(--color-primary-soft)' : 'var(--color-surface-subtle)', color: member.leader ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: 900 }}>
                                        {member.userName?.slice(0, 1) || 'U'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800 }}>
                                            {member.userName}
                                            {member.leader && <span style={{ color: 'var(--color-primary)', marginLeft: 8, fontSize: '0.78rem' }}>리더</span>}
                                        </div>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{member.username}</div>
                                    </div>
                                    {teamGate.isLeader && !member.leader && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleKick(member)}>
                                            <UserMinus size={16} /> 강퇴
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default TeamDetailPage;
