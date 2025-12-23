import React, { useEffect, useState } from 'react';
import { questProgress as questProgressStorage } from '../utils/storage';
import { getQuestsByTypeAndRole, QUEST_TYPE } from '../data/questsData';

const WeeklyQuestTracker = ({ role }) => {
    const [quests, setQuests] = useState([]);

    useEffect(() => {
        const loadProgress = () => {
            // WeeklyQuests 페이지와 동일한 데이터 소스 사용
            const weeklyQuests = getQuestsByTypeAndRole(QUEST_TYPE.WEEKLY, role);

            const loadedQuests = weeklyQuests.map(quest => {
                const progress = questProgressStorage.getQuestProgress(quest.id);
                const target = quest.requirement.target || 1;
                return {
                    id: quest.id,
                    icon: quest.icon,
                    title: quest.title,
                    label: `${quest.icon} ${quest.title}`,
                    target: target,
                    current: progress.current || 0,
                    completed: progress.completed || false,
                    reward: quest.reward
                };
            });

            setQuests(loadedQuests);
        };

        loadProgress();
        // 실시간 업데이트를 위한 폴링
        const interval = setInterval(loadProgress, 2000);
        return () => clearInterval(interval);
    }, [role]);

    const styles = {
        widget: {
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '15px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
        },
        headerSection: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        },
        title: {
            margin: 0,
            fontSize: '1.1rem',
            color: '#e2e8f0'
        },
        resetNotice: {
            fontSize: '0.75rem',
            color: '#94a3b8',
            background: 'rgba(100, 116, 139, 0.3)',
            padding: '4px 10px',
            borderRadius: '12px'
        },
        trackerItem: {
            marginBottom: '16px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            transition: 'all 0.3s ease'
        },
        trackerItemCompleted: {
            marginBottom: '16px',
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            transition: 'all 0.3s ease'
        },
        trackerHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
        },
        questInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        questIcon: {
            fontSize: '1.2rem'
        },
        label: {
            fontSize: '0.9rem',
            color: '#e2e8f0',
            fontWeight: '500'
        },
        questMeta: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        count: {
            fontSize: '0.85rem',
            color: '#94a3b8',
            fontWeight: '600'
        },
        countCompleted: {
            fontSize: '0.85rem',
            color: '#10b981',
            fontWeight: '600'
        },
        rewardBadge: {
            fontSize: '0.75rem',
            color: '#60a5fa',
            background: 'rgba(96, 165, 250, 0.2)',
            padding: '3px 8px',
            borderRadius: '8px',
            fontWeight: '600'
        },
        completedBadge: {
            fontSize: '0.75rem',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.2)',
            padding: '3px 8px',
            borderRadius: '8px',
            fontWeight: '600'
        },
        progressBarBg: {
            width: '100%',
            height: '6px',
            background: '#334155',
            borderRadius: '3px',
            overflow: 'hidden'
        },
        progressBarFill: {
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            transition: 'width 0.5s ease',
            borderRadius: '3px'
        },
        progressBarFillCompleted: {
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
            transition: 'width 0.5s ease',
            borderRadius: '3px'
        },
        emptyState: {
            textAlign: 'center',
            color: '#94a3b8',
            padding: '20px',
            fontSize: '0.9rem'
        }
    };

    return (
        <div style={styles.widget}>
            <div style={styles.headerSection}>
                <h3 style={styles.title}>📅 주간 안전 퀘스트</h3>
                <span style={styles.resetNotice}>매주 월요일에 리셋됩니다</span>
            </div>
            <div>
                {quests.map((quest) => (
                    <div 
                        key={quest.id} 
                        style={quest.completed ? styles.trackerItemCompleted : styles.trackerItem}
                    >
                        <div style={styles.trackerHeader}>
                            <div style={styles.questInfo}>
                                <span style={styles.questIcon}>{quest.icon}</span>
                                <span style={styles.label}>{quest.title}</span>
                            </div>
                            <div style={styles.questMeta}>
                                <span style={quest.completed ? styles.countCompleted : styles.count}>
                                    {quest.current}/{quest.target}
                                </span>
                                {quest.completed ? (
                                    <span style={styles.completedBadge}>✓ 완료</span>
                                ) : (
                                    <span style={styles.rewardBadge}>+{quest.reward.points}P</span>
                                )}
                            </div>
                        </div>
                        <div style={styles.progressBarBg}>
                            <div
                                style={{
                                    ...(quest.completed ? styles.progressBarFillCompleted : styles.progressBarFill),
                                    width: `${Math.min(100, (quest.current / quest.target) * 100)}%`
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            {quests.length === 0 && (
                <div style={styles.emptyState}>
                    이번 주 퀘스트가 없습니다.
                </div>
            )}
        </div>
    );
};

export default WeeklyQuestTracker;
