import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, RefreshCw, Send } from 'lucide-react';
import feedbackApi from '../api/feedbackApi';
import { useAuth } from '../context/AuthContext';
import { EmptyState, LoadingState, ResultNotice } from '../components/PageState';

const CATEGORY_OPTIONS = [
    { value: 'ERROR', label: '오류' },
    { value: 'SUGGESTION', label: '개선 의견' },
    { value: 'QUESTION', label: '질문' },
    { value: 'OTHER', label: '기타' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: '전체' },
    { value: 'OPEN', label: '접수' },
    { value: 'IN_REVIEW', label: '검토중' },
    { value: 'ANSWERED', label: '답변완료' },
    { value: 'CLOSED', label: '종료' },
];

const CATEGORY_LABEL = Object.fromEntries(CATEGORY_OPTIONS.map((item) => [item.value, item.label]));
const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((item) => [item.value, item.label]));

const STATUS_STYLE = {
    OPEN: { color: '#fbbf24', bg: 'rgba(251,191,36,0.14)', border: 'rgba(251,191,36,0.3)' },
    IN_REVIEW: { color: '#60a5fa', bg: 'rgba(96,165,250,0.14)', border: 'rgba(96,165,250,0.3)' },
    ANSWERED: { color: '#34d399', bg: 'rgba(52,211,153,0.14)', border: 'rgba(52,211,153,0.3)' },
    CLOSED: { color: '#94a3b8', bg: 'rgba(148,163,184,0.14)', border: 'rgba(148,163,184,0.3)' },
};

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function FeedbackBoard() {
    const { user } = useAuth();
    const location = useLocation();
    const hasAdminRole = user?.role === 'ROLE_PROJECT_ADMIN' || user?.role === 'ROLE_ADMIN';
    const isAdmin = hasAdminRole && location.pathname.startsWith('/admin');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [replyDrafts, setReplyDrafts] = useState({});
    const [form, setForm] = useState({
        category: 'ERROR',
        title: '',
        content: '',
        pagePath: '',
    });

    const pendingCount = useMemo(
        () => posts.filter((post) => post.status === 'OPEN' || post.status === 'IN_REVIEW').length,
        [posts]
    );

    const showNotice = (type, message) => {
        setNotice({ type, message });
        window.setTimeout(() => setNotice(null), 3000);
    };

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = isAdmin ? await feedbackApi.getAll(statusFilter) : await feedbackApi.getMine();
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            showNotice('error', err.message || '게시글을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, statusFilter]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    useEffect(() => {
        if (!form.pagePath && location.pathname !== '/feedback') {
            setForm((prev) => ({ ...prev, pagePath: location.pathname }));
        }
    }, [form.pagePath, location.pathname]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.title.trim() || !form.content.trim()) {
            showNotice('error', '제목과 내용을 입력해주세요.');
            return;
        }

        setSaving(true);
        try {
            await feedbackApi.create({
                ...form,
                title: form.title.trim(),
                content: form.content.trim(),
                pagePath: form.pagePath.trim(),
            });
            setForm({ category: 'ERROR', title: '', content: '', pagePath: '' });
            showNotice('success', '의견이 접수되었습니다.');
            await loadPosts();
        } catch (err) {
            showNotice('error', err.message || '의견 접수에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleStatus = async (postId, status) => {
        try {
            await feedbackApi.updateStatus(postId, status);
            await loadPosts();
        } catch (err) {
            showNotice('error', err.message || '상태 변경에 실패했습니다.');
        }
    };

    const handleReply = async (postId) => {
        const reply = replyDrafts[postId]?.trim();
        if (!reply) {
            showNotice('error', '답변 내용을 입력해주세요.');
            return;
        }

        try {
            await feedbackApi.reply(postId, reply);
            setReplyDrafts((prev) => ({ ...prev, [postId]: '' }));
            showNotice('success', '답변을 저장했습니다.');
            await loadPosts();
        } catch (err) {
            showNotice('error', err.message || '답변 저장에 실패했습니다.');
        }
    };

    return (
        <div className="page" style={{ paddingBottom: '120px' }}>
            <div className="container" style={{ maxWidth: 760, margin: '0 auto', padding: '1rem' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'rgba(14,165,233,0.14)',
                        border: '1px solid rgba(14,165,233,0.28)',
                        color: '#7dd3fc',
                    }}>
                        <MessageSquare size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.55rem', fontWeight: 850 }}>
                            사용자 게시판
                        </h1>
                        <p style={{ margin: '4px 0 0', color: 'rgba(203,213,225,0.68)', fontSize: '0.86rem' }}>
                            오류, 사용 의견, 질문을 남기고 답변을 확인합니다.
                        </p>
                    </div>
                    <button
                        onClick={loadPosts}
                        aria-label="새로고침"
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            border: '1px solid rgba(148,163,184,0.24)',
                            background: 'rgba(15,23,42,0.72)',
                            color: '#cbd5e1',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshCw size={17} />
                    </button>
                </header>

                {notice && (
                    <ResultNotice
                        type={notice.type}
                        title={notice.message}
                        icon={notice.type === 'success' ? '✓' : '!'}
                    />
                )}

                {!isAdmin && (
                    <form
                        onSubmit={handleSubmit}
                        className="glass-panel"
                        style={{ borderRadius: 16, padding: '1rem', marginBottom: 18 }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 150px) minmax(0, 1fr)', gap: 10 }}>
                            <select
                                value={form.category}
                                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                                style={inputStyle}
                            >
                                {CATEGORY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <input
                                value={form.title}
                                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                                placeholder="제목"
                                maxLength={120}
                                style={inputStyle}
                            />
                        </div>
                        <textarea
                            value={form.content}
                            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                            placeholder="오류 상황이나 개선 의견을 구체적으로 적어주세요."
                            maxLength={4000}
                            style={{ ...inputStyle, minHeight: 128, marginTop: 10, resize: 'vertical', lineHeight: 1.5 }}
                        />
                        <input
                            value={form.pagePath}
                            onChange={(event) => setForm((prev) => ({ ...prev, pagePath: event.target.value }))}
                            placeholder="관련 화면 경로 예: /education"
                            maxLength={120}
                            style={{ ...inputStyle, marginTop: 10 }}
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            className="ui-btn-core"
                            style={{
                                width: '100%',
                                marginTop: 12,
                                border: 'none',
                                background: saving ? 'rgba(148,163,184,0.24)' : 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                                color: '#fff',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <Send size={16} />
                            {saving ? '접수 중...' : '의견 접수'}
                        </button>
                    </form>
                )}

                {isAdmin && (
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ color: '#f8fafc', fontWeight: 800, marginBottom: 8 }}>
                            처리 필요 {pendingCount}건
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
                            {STATUS_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setStatusFilter(option.value)}
                                    style={{
                                        borderRadius: 10,
                                        border: '1px solid rgba(148,163,184,0.22)',
                                        background: statusFilter === option.value ? 'rgba(14,165,233,0.22)' : 'rgba(15,23,42,0.62)',
                                        color: statusFilter === option.value ? '#7dd3fc' : '#cbd5e1',
                                        padding: '0.6rem 0.4rem',
                                        fontSize: '0.78rem',
                                        fontWeight: 750,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <LoadingState title="게시글을 불러오는 중..." description="접수된 의견과 답변을 확인하고 있습니다." />
                ) : posts.length === 0 ? (
                    <EmptyState
                        icon="💬"
                        title={isAdmin ? '접수된 의견이 없습니다.' : '아직 작성한 의견이 없습니다.'}
                        description={isAdmin ? '사용자 의견이 들어오면 이곳에 표시됩니다.' : '오류나 개선 의견을 남기면 답변 상태를 여기서 볼 수 있습니다.'}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {posts.map((post) => {
                            const status = STATUS_STYLE[post.status] || STATUS_STYLE.OPEN;
                            return (
                                <article
                                    key={post.id}
                                    className="glass-panel"
                                    style={{
                                        borderRadius: 16,
                                        padding: '1rem',
                                        border: `1px solid ${status.border}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={badgeStyle(status)}>{STATUS_LABEL[post.status] || post.status}</span>
                                        <span style={softBadgeStyle}>{CATEGORY_LABEL[post.category] || post.category}</span>
                                        {isAdmin && <span style={softBadgeStyle}>{post.authorName || post.authorUsername}</span>}
                                        <span style={{ marginLeft: 'auto', color: 'rgba(203,213,225,0.56)', fontSize: '0.76rem' }}>
                                            {formatDate(post.createdAt)}
                                        </span>
                                    </div>
                                    <h2 style={{ color: '#f8fafc', fontSize: '1rem', margin: '0 0 8px', lineHeight: 1.35 }}>
                                        {post.title}
                                    </h2>
                                    <p style={{ color: 'rgba(226,232,240,0.86)', fontSize: '0.9rem', lineHeight: 1.58, whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {post.content}
                                    </p>
                                    {post.pagePath && (
                                        <div style={{ color: 'rgba(125,211,252,0.78)', fontSize: '0.76rem', marginTop: 8 }}>
                                            관련 화면: {post.pagePath}
                                        </div>
                                    )}

                                    {post.adminReply && (
                                        <div style={{
                                            marginTop: 12,
                                            padding: '0.85rem',
                                            borderRadius: 12,
                                            background: 'rgba(34,197,94,0.08)',
                                            border: '1px solid rgba(34,197,94,0.18)',
                                        }}>
                                            <div style={{ color: '#86efac', fontWeight: 800, fontSize: '0.82rem', marginBottom: 4 }}>
                                                관리자 답변
                                            </div>
                                            <p style={{ color: '#d1fae5', whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0, fontSize: '0.86rem' }}>
                                                {post.adminReply}
                                            </p>
                                            <div style={{ color: 'rgba(187,247,208,0.62)', fontSize: '0.72rem', marginTop: 6 }}>
                                                {post.repliedByName || '관리자'} · {formatDate(post.repliedAt)}
                                            </div>
                                        </div>
                                    )}

                                    {isAdmin && (
                                        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
                                                {STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handleStatus(post.id, option.value)}
                                                        disabled={post.status === option.value}
                                                        style={{
                                                            borderRadius: 9,
                                                            border: '1px solid rgba(148,163,184,0.18)',
                                                            background: post.status === option.value ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.54)',
                                                            color: post.status === option.value ? '#94a3b8' : '#dbeafe',
                                                            padding: '0.48rem 0.3rem',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 750,
                                                            cursor: post.status === option.value ? 'default' : 'pointer',
                                                        }}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={replyDrafts[post.id] ?? ''}
                                                onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                                                placeholder="사용자에게 전달할 답변을 입력하세요."
                                                style={{ ...inputStyle, minHeight: 86, resize: 'vertical', lineHeight: 1.5 }}
                                            />
                                            <button
                                                onClick={() => handleReply(post.id)}
                                                className="ui-btn-core"
                                                style={{
                                                    border: 'none',
                                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                                    color: '#fff',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                답변 저장
                                            </button>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 12,
    border: '1px solid rgba(148,163,184,0.24)',
    background: 'rgba(15,23,42,0.82)',
    color: '#f8fafc',
    padding: '0.78rem 0.85rem',
    outline: 'none',
    fontSize: '0.88rem',
};

const softBadgeStyle = {
    borderRadius: 999,
    padding: '0.25rem 0.55rem',
    background: 'rgba(148,163,184,0.12)',
    color: '#cbd5e1',
    fontSize: '0.72rem',
    fontWeight: 750,
};

const badgeStyle = (status) => ({
    borderRadius: 999,
    padding: '0.25rem 0.55rem',
    background: status.bg,
    color: status.color,
    fontSize: '0.72rem',
    fontWeight: 800,
});

export default FeedbackBoard;
