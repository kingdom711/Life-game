import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { points, level, streak } from '../utils/storage';
import { calculateLevel } from '../utils/pointsCalculator';
import { getQuestsByTypeAndRole } from '../data/questsData';
import { getAllEquippedItems } from '../utils/inventoryManager';
import { QUEST_TYPE } from '../data/questsData';
import QuestCard from '../components/QuestCard';
import { completeQuest } from '../utils/questManager';

function Dashboard({ role }) {
    const [playerStats, setPlayerStats] = useState({
        points: 0,
        level: { name: 'Bronze', progress: 0 },
        streak: { current: 0 }
    });

    const [equippedItems, setEquippedItems] = useState({});
    const [dailyQuests, setDailyQuests] = useState([]);

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
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                {playerStats.streak.current}일
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                최고 기록: {playerStats.streak.longest}일
                            </div>
                        </div>
                    </div>
                </div>

                {/* 아바타 섹션 */}
                <div className="card mb-xl">
                    <div className="card-header">
                        <h3 className="card-title">👤 내 아바타</h3>
                        <Link to="/inventory">
                            <button className="btn btn-secondary btn-sm">인벤토리 열기</button>
                        </Link>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                            <div className="avatar-container">
                                <div className="avatar-base">
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>🧑‍💼</div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '2rem' }}>
                                            {equippedItems.helmet && <div title={equippedItems.helmet.name}>⛑️</div>}
                                            {equippedItems.glasses && <div title={equippedItems.glasses.name}>🥽</div>}
                                            {equippedItems.mask && <div title={equippedItems.mask.name}>😷</div>}
                                            {equippedItems.vest && <div title={equippedItems.vest.name}>🦺</div>}
                                            {equippedItems.gloves && <div title={equippedItems.gloves.name}>🧤</div>}
                                            {equippedItems.belt && <div title={equippedItems.belt.name}>🔒</div>}
                                            {equippedItems.shoes && <div title={equippedItems.shoes.name}>👞</div>}
                                        </div>

                                        {Object.keys(equippedItems).length === 0 && (
                                            <p className="text-muted mt-md">아직 착용 중인 안전용품이 없습니다</p>
                                        )}
                                    </div>
                                </div>
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
        </div>
    );
}

export default Dashboard;
