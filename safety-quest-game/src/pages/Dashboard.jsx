import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { points, level, streak, dailyQuestInstances, userProfile } from '../utils/storage';
import { calculateLevel } from '../utils/pointsCalculator';
import { getQuestsByTypeAndRole } from '../data/questsData';
import { getAllEquippedItems } from '../utils/inventoryManager';
import { QUEST_TYPE } from '../data/questsData';
import QuestCard from '../components/QuestCard';
import Avatar from '../components/Avatar';
import HazardQuestModal from '../components/HazardQuestModal';
import StreakButton from '../components/StreakButton';
import { completeQuest, triggerQuestAction } from '../utils/questManager';

import AvatarWindow from '../components/AvatarWindow';
import AvatarGearDisplay from '../components/AvatarGearDisplay';

function Dashboard({ role }) {
    const [playerStats, setPlayerStats] = useState({
        points: 0,
        level: { name: 'Bronze', progress: 0 },
        streak: { current: 0 }
    });

    const [equippedItems, setEquippedItems] = useState({});
    const [dailyQuests, setDailyQuests] = useState([]);
    const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
    const [isAvatarWindowOpen, setIsAvatarWindowOpen] = useState(false);
    const [isHazardQuestCompleted, setIsHazardQuestCompleted] = useState(false);

    useEffect(() => {
        loadData();
    }, [role]);

    const loadData = () => {
        const currentPoints = points.get();
        const currentLevel = calculateLevel(currentPoints);
        const currentStreak = streak.get();
        const equipped = getAllEquippedItems();
        const quests = getQuestsByTypeAndRole(QUEST_TYPE.DAILY, role);

        setPlayerStats({
            points: currentPoints,
            level: currentLevel,
            streak: currentStreak
        });
        setEquippedItems(equipped);
        setDailyQuests(quests.slice(0, 3)); // 처음 3개만 표시

        const todayInstance = dailyQuestInstances.getTodayInstance(userProfile.getName() || 'guest');
        setIsHazardQuestCompleted(todayInstance.isCompleted);
    };

    const handleCompleteQuest = (quest) => {
        completeQuest(quest.id);
        loadData(); // 새로고침
    };

    return (
        <div className="page">
            <div className="container">
                {/* 헤더 */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1>안전관리 대시보드</h1>
                    <p className="text-muted">오늘도 안전한 하루를 만들어가세요!</p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-3 mb-xl">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">💰 포인트</h4>
                        </div>
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                {playerStats.points.toLocaleString()}
                            </div>
                            <div className="badge badge-primary">{playerStats.level.name}</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">📈 레벨 진행도</h4>
                        </div>
                        <div className="card-body">
                            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', textAlign: 'center' }}>
                                {playerStats.level.name}
                            </div>
                            <div className="progress" style={{ height: '12px' }}>
                                <div className="progress-bar" style={{ width: `${playerStats.level.progress}%` }}></div>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                {playerStats.level.progress}%
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">🔥 연속 로그인</h4>
                        </div>
                        <div className="card-body" style={{ textAlign: 'center', padding: '1rem' }}>
                            <StreakButton
                                onCheckIn={(result) => {
                                    // 출석 체크 퀘스트 완료 트리거
                                    triggerQuestAction('daily_login', role);
                                    loadData(); // 데이터 새로고침
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* 아바타 섹션 */}
                <div className="card mb-xl">
                    <div className="card-header">
                        <h3 className="card-title">👤 내 아바타</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setIsAvatarWindowOpen(true)}
                            >
                                장비 관리
                            </button>
                            <Link to="/inventory">
                                <button className="btn btn-secondary btn-sm">인벤토리</button>
                            </Link>
                        </div>
                    </div>
                    <div className="card-body">
                        <div
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', cursor: 'pointer' }}
                            onClick={() => setIsAvatarWindowOpen(true)}
                        >
                            <div className="avatar-container" style={{ maxWidth: '100%', height: 'auto' }}>
                                <AvatarGearDisplay
                                    equippedItems={equippedItems}
                                    size={200}
                                    slotSize={45}
                                    onSlotClick={() => setIsAvatarWindowOpen(true)}
                                    roleId={role}
                                />
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                            * 아바타를 클릭하여 장비를 관리하세요
                        </div>
                    </div>
                </div>


                {/* 찾아라 위험! 일일 퀘스트 */}
                <div className="mb-xl" style={{ textAlign: 'center' }}>
                    <div
                        className={`quest-trigger-card ${isHazardQuestCompleted ? 'completed' : ''}`}
                        onClick={() => {
                            if (isHazardQuestCompleted) {
                                alert("오늘은 이미 퀘스트를 완료했습니다. 내일 다시 도전해 주세요!");
                                return;
                            }
                            setIsHazardModalOpen(true);
                        }}
                    >
                        <div className="icon">
                            {isHazardQuestCompleted ?
                                '✅' :
                                <img src="/icon/hazard hunt.ico" alt="Hazard Hunt" style={{ width: '40px', height: '40px' }} />
                            }
                        </div>
                        <div className="content">
                            <div className="title">
                                {isHazardQuestCompleted ? '위험요인 발굴 완료!' : '찾아라 위험!'}
                            </div>
                            <div className="subtitle">
                                {isHazardQuestCompleted ? '오늘의 안전을 지켰습니다' : '일일 퀘스트 • +100P'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 오늘의 퀘스트 */}
                <div className="mb-xl">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>📅 오늘의 퀘스트</h2>
                        <Link to="/daily">
                            <button className="btn btn-primary btn-sm">전체 보기</button>
                        </Link>
                    </div>

                    <div className="grid grid-3">
                        {dailyQuests.map(quest => (
                            <QuestCard
                                key={quest.id}
                                quest={quest}
                                onComplete={handleCompleteQuest}
                            />
                        ))}
                    </div>
                </div>

                {/* 빠른 액세스 */}
                <div>
                    <h3 className="mb-md">빠른 액세스</h3>
                    <div className="grid grid-4">
                        <Link to="/shop" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
                            <div className="card-body">
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛒</div>
                                <div className="font-semibold">아이템 상점</div>
                            </div>
                        </Link>

                        <Link to="/weekly" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
                            <div className="card-body">
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
                                <div className="font-semibold">주간 퀘스트</div>
                            </div>
                        </Link>

                        <Link to="/monthly" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
                            <div className="card-body">
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                                <div className="font-semibold">월간 퀘스트</div>
                            </div>
                        </Link>

                        <Link to="/profile" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
                            <div className="card-body">
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
                                <div className="font-semibold">프로필</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <HazardQuestModal
                isOpen={isHazardModalOpen}
                onClose={() => setIsHazardModalOpen(false)}
                onComplete={(points) => {
                    // 위험 항목 확인 퀘스트 트리거
                    triggerQuestAction('check_risk', role);

                    loadData(); // 포인트 및 퀘스트 상태 업데이트 반영
                }}
            />

            <AvatarWindow
                isOpen={isAvatarWindowOpen}
                onClose={() => {
                    setIsAvatarWindowOpen(false);
                    loadData(); // 장비 변경 사항 반영
                }}
                onEquipRequest={(category) => {
                    // 인벤토리로 이동하거나 인벤토리 모달을 열 수 있음
                    // 여기서는 간단히 알림 후 닫기 (추후 구현)
                    setIsAvatarWindowOpen(false);
                    window.location.href = '/inventory';
                }}
                roleId={role}
            />
        </div>
    );
}

export default Dashboard;
