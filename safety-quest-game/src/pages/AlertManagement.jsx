import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts, createAlert, updateAlert, deleteAlert } from '../api/alertApi';

/**
 * 알림 관리 페이지
 * 관리자(supervisor, safetyManager)만 접근 가능
 */
function AlertManagement({ role }) {
    const navigate = useNavigate();
    const isAdmin = role === 'supervisor' || role === 'safetyManager';

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
            const data = await getAlerts();
            setAlerts(data || []);
        } catch (error) {
            console.error('알림 로드 실패:', error);
            // 개발용 샘플 데이터
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
        
        try {
            if (editingAlert) {
                await updateAlert(editingAlert.id, formData);
                setAlerts(prev => prev.map(a => 
                    a.id === editingAlert.id ? { ...a, ...formData } : a
                ));
            } else {
                const newAlert = await createAlert(formData);
                // API 연결 안 됐을 때 로컬에서 추가
                const localAlert = newAlert || {
                    id: Date.now(),
                    ...formData,
                    time: '방금 전'
                };
                setAlerts(prev => [localAlert, ...prev]);
            }
            
            resetForm();
        } catch (error) {
            console.error('알림 저장 실패:', error);
            // 로컬에서라도 추가
            const localAlert = {
                id: Date.now(),
                ...formData,
                time: '방금 전'
            };
            setAlerts(prev => [localAlert, ...prev]);
            resetForm();
        }
    };

    const handleEdit = (alert) => {
        setEditingAlert(alert);
        setFormData({
            type: alert.type,
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
            case 'danger': return { label: '위험', color: '#ef4444', icon: '🚨' };
            case 'warning': return { label: '주의', color: '#fbbf24', icon: '⚠️' };
            case 'info': return { label: '안내', color: '#38bdf8', icon: 'ℹ️' };
            default: return { label: '알림', color: '#94a3b8', icon: '📢' };
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
                            color: '#e879f9',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span>🔔</span>
                            알림 관리
                        </h1>
                        <p style={{ color: 'rgba(203, 213, 225, 0.7)' }}>
                            실시간 위험 알림을 작성하고 관리합니다.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0.75rem 1.5rem',
                            color: 'white',
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
                            color: '#f1f5f9',
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
                                        color: 'rgba(203, 213, 225, 0.8)',
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
                                            color: '#f1f5f9',
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
                                        color: 'rgba(203, 213, 225, 0.8)',
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
                                            color: '#f1f5f9',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {/* 제목 */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{
                                        display: 'block',
                                        color: 'rgba(203, 213, 225, 0.8)',
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
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            color: '#f1f5f9',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {/* 상세 내용 */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{
                                        display: 'block',
                                        color: 'rgba(203, 213, 225, 0.8)',
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
                                            color: '#f1f5f9',
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
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        background: 'transparent',
                                        color: '#cbd5e1',
                                        cursor: 'pointer'
                                    }}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        color: 'white',
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
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: 'rgba(203, 213, 225, 0.6)'
                        }}>
                            로딩 중...
                        </div>
                    ) : alerts.length === 0 ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: 'rgba(203, 213, 225, 0.6)'
                        }}>
                            등록된 알림이 없습니다.
                        </div>
                    ) : (
                        <div>
                            {alerts.map((alert, index) => {
                                const typeInfo = getTypeLabel(alert.type);
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
                                                    color: '#f1f5f9',
                                                    fontWeight: 600
                                                }}>
                                                    {alert.zone} - {alert.message}
                                                </span>
                                            </div>
                                            <p style={{
                                                color: 'rgba(203, 213, 225, 0.7)',
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
                                                color: 'rgba(203, 213, 225, 0.5)'
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
                                                    color: '#a78bfa',
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
                                                    color: '#f87171',
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
                            color: '#cbd5e1',
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
