import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import adminApi from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { EmptyState, LoadingState, ResultNotice } from '../components/PageState';

const formatDateTime = (value) => value
    ? new Date(value).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
    : '-';

function AdminPasswordResetApproval() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ROLE_PROJECT_ADMIN' || user?.role === 'ROLE_ADMIN';
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/', { replace: true });
        }
    }, [isAdmin, navigate]);

    const loadRequests = async () => {
        setLoading(true);
        setNotice(null);
        try {
            const data = await adminApi.getPasswordResetRequests(true);
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            setNotice({ type: 'error', title: err.message || '비밀번호 변경 요청을 불러오지 못했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadRequests();
        }
    }, [isAdmin]);

    const approve = async (id) => {
        setProcessingId(id);
        try {
            await adminApi.approvePasswordResetRequest(id);
            setNotice({ type: 'success', title: '비밀번호 변경을 승인했습니다.' });
            await loadRequests();
        } catch (err) {
            setNotice({ type: 'error', title: err.message || '승인 처리에 실패했습니다.' });
        } finally {
            setProcessingId(null);
        }
    };

    const reject = async (id) => {
        setProcessingId(id);
        try {
            await adminApi.rejectPasswordResetRequest(id, '관리자 확인 결과 반려되었습니다.');
            setNotice({ type: 'success', title: '비밀번호 변경 요청을 거절했습니다.' });
            await loadRequests();
        } catch (err) {
            setNotice({ type: 'error', title: err.message || '거절 처리에 실패했습니다.' });
        } finally {
            setProcessingId(null);
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="page" style={{ padding: '2rem 1rem 6rem' }}>
            <div className="container" style={{ maxWidth: 760, margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <p style={{ color: '#94a3b8', margin: '0 0 6px', fontWeight: 800 }}>ACCOUNT RECOVERY</p>
                        <h1 style={{ color: '#f8fafc', margin: 0, fontSize: '1.75rem', fontWeight: 900 }}>비밀번호 변경 승인</h1>
                        <p style={{ color: '#cbd5e1', margin: '8px 0 0' }}>사용자가 요청한 새 비밀번호는 승인 후에만 적용됩니다.</p>
                    </div>
                    <button
                        type="button"
                        onClick={loadRequests}
                        disabled={loading}
                        className="ui-btn-core"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15, 23, 42, 0.72)', color: '#e2e8f0' }}
                    >
                        <RefreshCw size={16} />
                        새로고침
                    </button>
                </header>

                {notice && <ResultNotice type={notice.type} icon={notice.type === 'success' ? '✓' : '!'} title={notice.title} />}

                {loading ? (
                    <LoadingState title="요청 목록을 불러오는 중입니다." description="승인 대기 중인 계정 복구 요청을 확인하고 있습니다." />
                ) : requests.length === 0 ? (
                    <EmptyState icon="-" title="승인 대기 요청이 없습니다." description="사용자가 비밀번호 변경을 요청하면 여기에 표시됩니다." />
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {requests.map((request) => (
                            <section
                                key={request.id}
                                className="glass-panel"
                                style={{ padding: '1rem', borderRadius: 8, border: '1px solid rgba(148, 163, 184, 0.18)' }}
                            >
                                <div style={{ display: 'grid', gap: 6 }}>
                                    <strong style={{ color: '#f8fafc', fontSize: '1rem' }}>{request.userName || '이름 없음'}</strong>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>{request.email || request.username}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>요청일: {formatDateTime(request.createdAt)}</span>
                                </div>

                                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                                    <button
                                        type="button"
                                        onClick={() => approve(request.id)}
                                        disabled={processingId === request.id}
                                        className="ui-btn-core"
                                        style={{ flex: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff' }}
                                    >
                                        <CheckCircle2 size={16} />
                                        승인
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => reject(request.id)}
                                        disabled={processingId === request.id}
                                        className="ui-btn-core"
                                        style={{ flex: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.18)', color: '#fca5a5' }}
                                    >
                                        <XCircle size={16} />
                                        거절
                                    </button>
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPasswordResetApproval;
