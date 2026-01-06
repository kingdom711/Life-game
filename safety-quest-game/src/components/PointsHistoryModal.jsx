import React, { useEffect, useState } from 'react';
import { pointsHistory } from '../utils/storage';
import '../styles/index.css';

const PointsHistoryModal = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState([]);
    const [totalBySource, setTotalBySource] = useState({});
    const [filterSource, setFilterSource] = useState('전체');

    useEffect(() => {
        if (isOpen) {
            const allHistory = pointsHistory.getRecent(100);
            const totals = pointsHistory.getTotalBySource();
            setHistory(allHistory);
            setTotalBySource(totals);
        }
    }, [isOpen]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const historyDate = new Date(kstDate.getFullYear(), kstDate.getMonth(), kstDate.getDate());
        
        if (historyDate.getTime() === today.getTime()) {
            return `오늘 ${String(kstDate.getHours()).padStart(2, '0')}:${String(kstDate.getMinutes()).padStart(2, '0')}`;
        }
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (historyDate.getTime() === yesterday.getTime()) {
            return `어제 ${String(kstDate.getHours()).padStart(2, '0')}:${String(kstDate.getMinutes()).padStart(2, '0')}`;
        }
        
        return `${kstDate.getFullYear()}.${String(kstDate.getMonth() + 1).padStart(2, '0')}.${String(kstDate.getDate()).padStart(2, '0')} ${String(kstDate.getHours()).padStart(2, '0')}:${String(kstDate.getMinutes()).padStart(2, '0')}`;
    };

    const getSourceIcon = (source) => {
        const icons = {
            '퀘스트 완료': '✅',
            '출석 체크': '🔥',
            '출석 보너스': '🎁',
            '기타': '💰'
        };
        return icons[source] || '💰';
    };

    const filteredHistory = filterSource === '전체' 
        ? history 
        : history.filter(entry => entry.source === filterSource);

    const sources = ['전체', ...Object.keys(totalBySource)];

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content points-history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>💰 포인트 획득 내역</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="points-history-body">
                    {/* 필터 */}
                    <div className="source-filter">
                        {sources.map(source => (
                            <button
                                key={source}
                                className={`filter-btn ${filterSource === source ? 'active' : ''}`}
                                onClick={() => setFilterSource(source)}
                            >
                                {source}
                            </button>
                        ))}
                    </div>

                    {/* 소스별 총합 */}
                    {filterSource === '전체' && (
                        <div className="source-totals">
                            {Object.entries(totalBySource).map(([source, total]) => (
                                <div key={source} className="source-total-item">
                                    <span className="source-icon">{getSourceIcon(source)}</span>
                                    <span className="source-name">{source}</span>
                                    <span className="source-amount">+{total.toLocaleString()}P</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 내역 리스트 */}
                    <div className="history-list">
                        {filteredHistory.length === 0 ? (
                            <div className="empty-history">
                                <p>포인트 획득 내역이 없습니다.</p>
                            </div>
                        ) : (
                            filteredHistory.map(entry => (
                                <div key={entry.id} className="history-item">
                                    <div className="history-icon">{getSourceIcon(entry.source)}</div>
                                    <div className="history-content">
                                        <div className="history-source">{entry.source}</div>
                                        <div className="history-detail">{entry.sourceDetail || ''}</div>
                                        <div className="history-time">{formatDate(entry.timestamp)}</div>
                                    </div>
                                    <div className={`history-amount ${entry.amount > 0 ? 'positive' : 'negative'}`}>
                                        {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}P
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <style jsx>{`
                    .points-history-modal {
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                        border: 2px solid #3b82f6;
                        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                        color: white;
                        max-width: 600px;
                        max-height: 80vh;
                        display: flex;
                        flex-direction: column;
                    }

                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20px;
                        border-bottom: 1px solid rgba(59, 130, 246, 0.3);
                    }

                    .modal-header h2 {
                        margin: 0;
                        font-size: 1.5rem;
                        color: #f1f5f9;
                    }

                    .close-btn {
                        background: none;
                        border: none;
                        color: #94a3b8;
                        font-size: 2rem;
                        cursor: pointer;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: color 0.2s;
                    }

                    .close-btn:hover {
                        color: #f1f5f9;
                    }

                    .points-history-body {
                        padding: 20px;
                        overflow-y: auto;
                        flex: 1;
                    }

                    .source-filter {
                        display: flex;
                        gap: 8px;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                    }

                    .filter-btn {
                        padding: 8px 16px;
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        background: rgba(30, 41, 59, 0.5);
                        color: #94a3b8;
                        border-radius: 20px;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-size: 0.9rem;
                    }

                    .filter-btn:hover {
                        border-color: #3b82f6;
                        color: #f1f5f9;
                    }

                    .filter-btn.active {
                        background: #3b82f6;
                        border-color: #3b82f6;
                        color: white;
                    }

                    .source-totals {
                        background: rgba(59, 130, 246, 0.1);
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 20px;
                    }

                    .source-total-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 8px 0;
                    }

                    .source-icon {
                        font-size: 1.2rem;
                    }

                    .source-name {
                        flex: 1;
                        color: #cbd5e1;
                    }

                    .source-amount {
                        font-weight: bold;
                        color: #fbbf24;
                    }

                    .history-list {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    .history-item {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        padding: 15px;
                        background: rgba(30, 41, 59, 0.5);
                        border-radius: 12px;
                        border: 1px solid rgba(59, 130, 246, 0.2);
                        transition: all 0.2s;
                    }

                    .history-item:hover {
                        background: rgba(30, 41, 59, 0.7);
                        border-color: rgba(59, 130, 246, 0.4);
                    }

                    .history-icon {
                        font-size: 1.5rem;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(59, 130, 246, 0.2);
                        border-radius: 50%;
                    }

                    .history-content {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }

                    .history-source {
                        font-weight: bold;
                        color: #f1f5f9;
                        font-size: 1rem;
                    }

                    .history-detail {
                        color: #94a3b8;
                        font-size: 0.85rem;
                    }

                    .history-time {
                        color: #64748b;
                        font-size: 0.75rem;
                    }

                    .history-amount {
                        font-weight: bold;
                        font-size: 1.1rem;
                        padding: 8px 12px;
                        border-radius: 8px;
                    }

                    .history-amount.positive {
                        color: #10b981;
                        background: rgba(16, 185, 129, 0.1);
                    }

                    .history-amount.negative {
                        color: #ef4444;
                        background: rgba(239, 68, 68, 0.1);
                    }

                    .empty-history {
                        text-align: center;
                        padding: 40px 20px;
                        color: #94a3b8;
                    }

                    .empty-history p {
                        margin: 0;
                        font-size: 1rem;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default PointsHistoryModal;

