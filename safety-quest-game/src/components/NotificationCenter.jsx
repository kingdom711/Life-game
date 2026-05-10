import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    isAlertRead,
    markAlertRead,
    markAllAlertsRead,
    NOTIFICATION_TYPES,
    NOTIFICATION_ICONS
} from '../utils/notificationManager';
import { getAlerts } from '../api/alertApi';

/**
 * 알림 센터 모달 컴포넌트
 * 알림 목록 표시, 읽음 처리, 상대 시간 표시
 */
const NotificationCenter = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    const loadNotifications = async () => {
        const localList = getNotifications(20);
        try {
            const alerts = await getAlerts();
            const serverList = alerts.map((alert) => {
                const id = `alert-${alert.id}`;
                return {
                    id,
                    type: alert.type || NOTIFICATION_TYPES.SYSTEM,
                    title: alert.message || alert.zone || '알림',
                    message: alert.detail || '',
                    timestamp: alert.createdAt || new Date().toISOString(),
                    read: isAlertRead(id)
                };
            });
            const merged = [...serverList, ...localList].slice(0, 20);
            setNotifications(merged);
            setUnreadCount(merged.filter((n) => !n.read).length);
        } catch (_) {
            setNotifications(localList);
            setUnreadCount(getUnreadCount());
        }
    };

    const handleMarkAsRead = (notificationId) => {
        if (String(notificationId).startsWith('alert-')) {
            markAlertRead(notificationId);
            setNotifications((prev) => prev.map((item) => (
                item.id === notificationId ? { ...item, read: true } : item
            )));
            setUnreadCount((count) => Math.max(0, count - 1));
            return;
        }
        markAsRead(notificationId);
        loadNotifications();
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
        const alertKeys = notifications
            .filter((n) => String(n.id).startsWith('alert-'))
            .map((n) => n.id);
        if (alertKeys.length > 0) markAllAlertsRead(alertKeys);
        loadNotifications();
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
        onClose?.();
        navigate('/alert-management');
    };

    /**
     * 상대 시간 표시 (KST 기준)
     */
    const getRelativeTime = (timestamp) => {
        const now = Date.now();
        const time = new Date(timestamp).getTime();
        const diff = now - time;

        if (diff < 0) return '방금 전';

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return `${days}일 전`;
    };

    /**
     * 타입별 아이콘 가져오기
     */
    const getTypeIcon = (type) => {
        return NOTIFICATION_ICONS[type] || '🔔';
    };

    /**
     * 타입별 강조 색상
     */
    const getTypeColor = (type) => {
        const colors = {
            [NOTIFICATION_TYPES.QUEST_COMPLETE]: '#10b981',
            [NOTIFICATION_TYPES.TEAM_QUEST]: '#3b82f6',
            [NOTIFICATION_TYPES.PRAISE]: '#fbbf24',
            [NOTIFICATION_TYPES.EVENT_QUEST]: '#a78bfa',
            [NOTIFICATION_TYPES.SEASON]: '#f59e0b',
            [NOTIFICATION_TYPES.WORK_STOP]: '#ef4444',
            [NOTIFICATION_TYPES.SYSTEM]: '#64748b'
        };
        return colors[type] || '#64748b';
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* 헤더 */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <h2 style={styles.headerTitle}>
                            <span role="img" aria-label="bell">🔔</span> 알림 센터
                        </h2>
                        {unreadCount > 0 && (
                            <span style={styles.badge}>{unreadCount}</span>
                        )}
                    </div>
                    <div style={styles.headerRight}>
                        {unreadCount > 0 && (
                            <button
                                style={styles.markAllBtn}
                                onClick={handleMarkAllAsRead}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                                }}
                            >
                                모두 읽음
                            </button>
                        )}
                        <button
                            style={styles.closeBtn}
                            onClick={onClose}
                            onMouseOver={(e) => {
                                e.currentTarget.style.color = '#f1f5f9';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.color = '#94a3b8';
                            }}
                        >
                            &times;
                        </button>
                    </div>
                </div>

                {/* 알림 리스트 */}
                <div style={styles.body}>
                    {notifications.length === 0 ? (
                        <div style={styles.emptyState}>
                            <span style={styles.emptyIcon}>🔕</span>
                            <p style={styles.emptyText}>새로운 알림이 없습니다</p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const typeColor = getTypeColor(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    style={{
                                        ...styles.notificationItem,
                                        background: notification.read
                                            ? 'rgba(30, 41, 59, 0.3)'
                                            : 'rgba(30, 41, 59, 0.7)',
                                        borderLeft: `3px solid ${typeColor}`
                                    }}
                                    onClick={() => handleNotificationClick(notification)}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                                        e.currentTarget.style.borderColor = `${typeColor}`;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = notification.read
                                            ? 'rgba(30, 41, 59, 0.3)'
                                            : 'rgba(30, 41, 59, 0.7)';
                                    }}
                                >
                                    {/* 타입 아이콘 */}
                                    <div style={{
                                        ...styles.iconWrapper,
                                        background: `${typeColor}20`,
                                        border: `1px solid ${typeColor}40`
                                    }}>
                                        <span style={styles.icon}>{getTypeIcon(notification.type)}</span>
                                    </div>

                                    {/* 내용 */}
                                    <div style={styles.content}>
                                        <div style={styles.titleRow}>
                                            <span style={{
                                                ...styles.notifTitle,
                                                fontWeight: notification.read ? '500' : '700'
                                            }}>
                                                {notification.title}
                                            </span>
                                            {!notification.read && (
                                                <span style={styles.unreadDot} />
                                            )}
                                        </div>
                                        <p style={styles.message}>{notification.message}</p>
                                        <span style={styles.time}>
                                            {getRelativeTime(notification.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '60px',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
    },
    modal: {
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '2px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.3), 0 20px 60px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        margin: '0 16px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 20px',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        background: 'rgba(15, 23, 42, 0.5)'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    headerTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    badge: {
        background: '#ef4444',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: '700',
        padding: '2px 8px',
        borderRadius: '10px',
        minWidth: '20px',
        textAlign: 'center',
        lineHeight: '1.4'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    markAllBtn: {
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: '#60a5fa',
        padding: '6px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '600',
        transition: 'all 0.2s'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        fontSize: '1.8rem',
        cursor: 'pointer',
        padding: 0,
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s',
        lineHeight: 1
    },
    body: {
        overflowY: 'auto',
        flex: 1,
        padding: '8px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '50px 20px'
    },
    emptyIcon: {
        fontSize: '3rem',
        display: 'block',
        marginBottom: '12px'
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: '1rem',
        margin: 0
    },
    notificationItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '14px 16px',
        borderRadius: '10px',
        marginBottom: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    iconWrapper: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    icon: {
        fontSize: '1.2rem'
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    notifTitle: {
        color: '#f1f5f9',
        fontSize: '0.95rem',
        lineHeight: 1.3
    },
    unreadDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#3b82f6',
        flexShrink: 0,
        boxShadow: '0 0 6px rgba(59, 130, 246, 0.6)'
    },
    message: {
        color: '#94a3b8',
        fontSize: '0.85rem',
        lineHeight: 1.4,
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
    },
    time: {
        color: '#64748b',
        fontSize: '0.75rem',
        marginTop: '2px'
    }
};

export default NotificationCenter;
