import React, { useEffect, useState } from 'react';
import { weeklyQuestProgress } from '../utils/storage';

const WeeklyQuestTracker = () => {
    const [quests, setQuests] = useState([]);

    useEffect(() => {
        const loadProgress = () => {
            // 현재 주차 계산 (questManager 로직과 동일하게)
            const d = new Date();
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
            var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            const currentWeek = parseInt(`${d.getUTCFullYear()}${weekNo.toString().padStart(2, '0')}`);

            const types = [
                { type: 'SAFETY_CHECKLIST', label: '✅ 체크리스트 제출', target: 5 },
                { type: 'REPORT_RISK', label: '🚨 위험 요인 보고', target: 3 },
                { type: 'TBM_ATTENDANCE', label: '🗣️ TBM 참석', target: 5 }
            ];

            const loadedQuests = types.map(q => {
                const progress = weeklyQuestProgress.getByWeekAndType(currentWeek, q.type);
                return {
                    ...q,
                    current: progress ? progress.currentCount : 0,
                    completed: progress ? progress.isCompleted : false
                };
            });

            setQuests(loadedQuests);
        };

        loadProgress();
        // 이벤트 리스너 등으로 실시간 업데이트가 필요하다면 여기에 추가
        const interval = setInterval(loadProgress, 2000); // 간단한 폴링으로 업데이트 감지
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="weekly-tracker-widget">
            <h3>📅 주간 안전 퀘스트</h3>
            <div className="tracker-list">
                {quests.map((quest, index) => (
                    <div key={index} className="tracker-item">
                        <div className="tracker-header">
                            <span className="label">{quest.label}</span>
                            <span className="count">{quest.current}/{quest.target}</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div
                                className={`progress-bar-fill ${quest.completed ? 'completed' : ''}`}
                                style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .weekly-tracker-widget {
                    background: rgba(30, 41, 59, 0.8);
                    border-radius: 15px;
                    padding: 15px;
                    margin-top: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }
                .weekly-tracker-widget h3 {
                    margin: 0 0 15px 0;
                    font-size: 1rem;
                    color: #e2e8f0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 10px;
                }
                .tracker-item {
                    margin-bottom: 12px;
                }
                .tracker-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    margin-bottom: 5px;
                    color: #94a3b8;
                }
                .progress-bar-bg {
                    width: 100%;
                    height: 8px;
                    background: #334155;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: #3b82f6;
                    transition: width 0.5s ease;
                }
                .progress-bar-fill.completed {
                    background: #10b981;
                    box-shadow: 0 0 10px #10b981;
                }
            `}</style>
        </div>
    );
};

export default WeeklyQuestTracker;
