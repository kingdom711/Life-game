import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAlerts, createAlert, updateAlert, deleteAlert } from '../api/alertApi';
import { LoadingState, EmptyState, ResultNotice } from '../components/PageState';
import { useAuth } from '../context/AuthContext';

const COLOR = {
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    primaryLight: 'var(--color-primary-light)',
    danger: 'var(--color-danger)',
    dangerLight: 'var(--color-danger-light)',
    warningLight: 'var(--color-warning-light)',
    secondary: 'var(--color-secondary)',
    secondaryLight: 'var(--color-secondary-light)',
    secondaryDark: 'var(--color-secondary-dark)'
};

/**
 * 알림 관리 페이지
 * 관리자(supervisor, safetyManager)만 접근 가능
 */
function AlertManagement({ role }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = role === 'supervisor'
        || role === 'safetyManager'
        || user?.role === 'ROLE_ADMIN'
        || user?.role === 'ROLE_SAFETY_MANAGER'
        || user?.role === 'ROLE_SUPERVISOR'
        || user?.role === 'ROLE_PROJECT_ADMIN';

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [formData, setFormData] = useState({
        type: 'warning',
        zone: '',
        message: '',
        detail: ''
    });
    const [saveStatus, setSaveStatus] = useState(null); // { type: 'success'|'error', message: '' }

    // 권한 체크 - 관리자가 아니면 대시보드로 리다이렉트
    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // 알림 목록 로드
    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            // 관리자 페이지에서는 모든 알림 조회 (활성/비활성 포함)
            const data = await getAllAlerts();
            setAlerts(data || []);
        } catch (error) {
            console.error('알림 로드 실패:', error);
            // 백엔드 미연결 시 샘플 데이터
            setAlerts([
                { id: 1, type: 'danger', zone: '2구역', message: '낙하물 주의', time: '10분 전', detail: '2구역 상부 작업 중 자재 낙하 위험이 감지되었습니다.' },
                { id: 2, type: 'warning', zone: '5구역', message: '고소작업 진행중', time: '25분 전', detail: '5구역에서 고소작업이 진행 중입니다.' },
                { id: 3, type: 'info', zone: '전체', message: '안전점검 예정', time: '1시간 전', detail: '오후 2시부터 전 구역 정기 안전점검이 예정되어 있습니다.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveStatus(null);

        try {
            if (editingAlert) {
                await updateAlert(editingAlert.id, formData);
                setSaveStatus({ type: 'success', message: '알림이 수정되었습니다.' });
            } else {
                await createAlert(formData);
                setSaveStatus({ type: 'success', message: '알림이 등록되었습니다.' });
            }
            // 저장 성공 후 백엔드에서 최신 목록 다시 로드
            await loadAlerts();
            resetForm();
        } catch (error) {
            console.error('알림 저장 실패:', error);
            const errorMsg = error?.message || '서버 연결에 실패했습니다.';
            setSaveStatus({ type: 'error', message: `저장 실패: ${errorMsg}` });
        }

        // 3초 후 상태 메시지 자동 제거
        setTimeout(() => setSaveStatus(null), 3000);
    };

    const handleEdit = (alert) => {
        setEditingAlert(alert);
        setFormData({
            type: (alert.backendType || alert.type || 'warning').toLowerCase(),
            zone: alert.zone,
            message: alert.message,
            detail: alert.detail
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        
        try {
            await deleteAlert(id);
        } catch (error) {
            console.error('알림 삭제 실패:', error);
        }
        // 로컬에서도 삭제
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const resetForm = () => {
        setFormData({ type: 'warning', zone: '', message: '', detail: '' });
        setEditingAlert(null);
        setIsFormOpen(false);
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'danger': return { label: '위험', color: COLOR.danger, icon: '🚨' };
            case 'warning': return { label: '주의', color: COLOR.warningLight, icon: '⚠️' };
            case 'info': return { label: '안내', color: COLOR.primaryLight, icon: 'ℹ️' };
            default: return { label: '알림', color: COLOR.textMuted, icon: '📢' };
        }
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="page" style={{ padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* 헤더 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: COLOR.secondaryLight,
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span>🔔</span>
                            알림 관리
                        </h1>
                        <p style={{ color: COLOR.textSecondary }}>
                            실시간 위험 알림을 작성하고 관리합니다.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        style={{
                            background: `linear-gradient(135deg, ${COLOR.secondary} 0%, ${COLOR.secondaryDark} 100%)`,
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0.75rem 1.5rem',
                            color: COLOR.text,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <span>➕</span>
                        새 알림 작성
                    </button>
                </div>

                {/* 저장 결과 메시지 */}
                {saveStatus && (
                    <ResultNotice
                        type={saveStatus.type === 'success' ? 'success' : 'error'}
                        icon={saveStatus.type === 'success' ? '✅' : '❌'}
                        title={saveStatus.message}
                    />
                )}

                {/* 알림 작성/수정 폼 */}
                {isFormOpen && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(55, 48, 107, 0.9) 100%)',
                        border: '2px solid rgba(139, 92, 246, 0.4)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{
                            color: COLOR.text,
                            marginBottom: '1.5rem',
                            fontSize: '1.25rem'
                        }}>
                            {editingAlert ? '알림 수정' : '새 알림 작성'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                {/* 알림 유형 */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        color: COLOR.textSecondary,
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        알림 유형
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            color: COLOR.text,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option value="danger">🚨 위험</option>
                                        <option value="warning">⚠️ 주의</option>
                                        <option value="info">ℹ️ 안내</option>
                                    </select>
                                </div>

                                {/* 구역 */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        color: COLOR.textSecondary,
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        구역
                                    </label>
                                    <input
                                        type="text"
                                        name="zone"
                                        value={formData.zone}
                                        onChange={handleInputChange}
                                        placeholder="예: 2구역, 전체"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            color: COLOR.text,
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {/* 제목 */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{
                                        display: 'block',
                                        color: COLOR.textSecondary,
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        알림 제목
                                    </label>
                                    <input
                                        type="text"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="예: 낙하물 주의"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            color: COLOR.text,
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {/* 상세 내용 */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{
                                        display: 'block',
                                        color: COLOR.textSecondary,
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        상세 내용
                                    </label>
                                    <textarea
                                        name="detail"
                                        value={formData.detail}
                                        onChange={handleInputChange}
                                        placeholder="알림에 대한 상세 설명을 입력하세요..."
                                        required
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            color: COLOR.text,
                                            fontSize: '1rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* 버튼들 */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="ui-btn-core ui-btn-ghost"
                                    style={{
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        background: 'transparent',
                                        color: COLOR.textSecondary,
                                        cursor: 'pointer'
                                    }}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="ui-btn-core ui-btn-gradient-secondary"
                                    style={{
                                        border: 'none',
                                        background: `linear-gradient(135deg, ${COLOR.secondary} 0%, ${COLOR.secondaryDark} 100%)`,
                                        color: COLOR.text,
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingAlert ? '수정 완료' : '알림 등록'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* 알림 목록 */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}>
                    {loading ? (
                        <div style={{ padding: '2rem' }}>
                            <LoadingState
                                title="알림 목록을 불러오는 중입니다..."
                                description="최신 위험 알림 데이터를 동기화하고 있습니다."
                            />
                        </div>
                    ) : alerts.length === 0 ? (
                        <div style={{ padding: '2rem' }}>
                            <EmptyState
                                icon="🔔"
                                title="등록된 알림이 없습니다."
                                description="새 알림을 작성하거나 잠시 후 다시 동기화해 주세요."
                                actionLabel="목록 새로고침"
                                onAction={loadAlerts}
                            />
                        </div>
                    ) : (
                        <div>
                            {alerts.map((alert, index) => {
                                const typeInfo = getTypeLabel((alert.backendType || alert.type || 'info').toLowerCase());
                                const displayTitle = alert.message ? `${alert.zone} - ${alert.message}` : alert.zone;
                                return (
                                    <div
                                        key={alert.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1.25rem',
                                            borderBottom: index < alerts.length - 1 
                                                ? '1px solid rgba(71, 85, 105, 0.3)' 
                                                : 'none',
                                            gap: '1rem'
                                        }}
                                    >
                                        {/* 유형 아이콘 */}
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: `${typeInfo.color}20`,
                                            border: `2px solid ${typeInfo.color}40`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            flexShrink: 0
                                        }}>
                                            {typeInfo.icon}
                                        </div>

                                        {/* 내용 */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: `${typeInfo.color}30`,
                                                    color: typeInfo.color,
                                                    fontWeight: 600
                                                }}>
                                                    {typeInfo.label}
                                                </span>
                                                <span style={{
                                                    color: COLOR.text,
                                                    fontWeight: 600
                                                }}>
                                                    {displayTitle}
                                                </span>
                                            </div>
                                            <p style={{
                                                color: COLOR.textSecondary,
                                                fontSize: '0.875rem',
                                                margin: 0,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {alert.detail}
                                            </p>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: COLOR.textMuted
                                            }}>
                                                {alert.time}
                                            </span>
                                        </div>

                                        {/* 액션 버튼 */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem'
                                        }}>
                                            <button
                                                onClick={() => handleEdit(alert)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(139, 92, 246, 0.4)',
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    color: COLOR.secondaryLight,
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(alert.id)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: COLOR.dangerLight,
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 뒤로 가기 */}
                <div style={{ marginTop: '1.5rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            background: 'transparent',
                            color: COLOR.textSecondary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        ← 대시보드로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AlertManagement;
