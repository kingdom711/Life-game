import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { points, level, streak, dailyQuestInstances, userProfile } from '../utils/storage';
import { calculateLevel } from '../utils/pointsCalculator';
import { getQuestsByTypeAndRole } from '../data/questsData';
import { getAllEquippedItems } from '../utils/inventoryManager';
import { QUEST_TYPE } from '../data/questsData';
import QuestCard from '../components/QuestCard';
import Avatar from '../components/Avatar';
import HazardQuestModal from '../components/HazardQuestModal';
import StreakButton from '../components/StreakButton';
import DailyCheckInModal from '../components/DailyCheckInModal';
import WeeklyQuestTracker from '../components/WeeklyQuestTracker';
import MonthlyAttendanceModal from '../components/MonthlyAttendanceModal';
import { completeQuest, triggerQuestAction, checkAttendance } from '../utils/questManager';

import AvatarWindow from '../components/AvatarWindow';
import AvatarGearDisplay from '../components/AvatarGearDisplay';
import PointsHistoryModal from '../components/PointsHistoryModal';

function Dashboard({ role }) {
    const navigate = useNavigate();
    const [playerStats, setPlayerStats] = useState({
        points: 0,
        level: { 
            name: 'Bronze III', 
            progress: 0,
            color: '#cd7f32',
            tierIcon: '🥉',
            rank: 1,
            totalRanks: 15
        },
        streak: { current: 0 }
    });

    const [equippedItems, setEquippedItems] = useState({});
    const [dailyQuests, setDailyQuests] = useState([]);
    const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
    const [isAvatarWindowOpen, setIsAvatarWindowOpen] = useState(false);
    const [isHazardQuestCompleted, setIsHazardQuestCompleted] = useState(false);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    const [checkInResult, setCheckInResult] = useState({ streak: 0, bonus: 0 });
    const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
    const [isPointsHistoryModalOpen, setIsPointsHistoryModalOpen] = useState(false);

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
        setDailyQuests(quests.slice(0, 4)); // 처음 4개 표시

        const todayInstance = dailyQuestInstances.getTodayInstance(userProfile.getName() || 'guest');
        setIsHazardQuestCompleted(todayInstance.isCompleted);
    };

    const handleCompleteQuest = (quest) => {
        if (quest.id === 'daily_hazard_1') {
            if (isHazardQuestCompleted) {
                alert("오늘은 이미 퀘스트를 완료했습니다. 내일 다시 도전해 주세요!");
                return;
            }
            setIsHazardModalOpen(true);
            return;
        }
        completeQuest(quest.id);
        loadData(); // 새로고침
    };

    return (
        <div className="page dashboard-page">
            <div className="container">
                {/* 헤더 - 프리미엄 디자인 */}
                <div className="dashboard-header mb-12 text-center">
                    <div className="header-glow" />
                    <h1 className="dashboard-title">
                        안전관리 대시보드
                    </h1>
                    <p className="dashboard-subtitle">
                        오늘도 안전한 하루를 만들어가세요!
                    </p>
                </div>

                {/* 통계 카드 - 프리미엄 디자인 */}
                <div className="stats-grid mb-xl">
                    {/* 포인트 카드 */}
                    <div 
                        className="stat-card stat-card-points"
                        onClick={() => setIsPointsHistoryModalOpen(true)}
                    >
                        <div className="stat-card-glow" />
                        <div className="stat-card-pattern" />
                        <div className="stat-card-content">
                            <div className="stat-header">
                                <div className="stat-icon">💰</div>
                                <h4 className="stat-title">포인트</h4>
                            </div>
                            <div className="stat-value-wrapper">
                                <div className="stat-value" data-value={playerStats.points}>
                                    {playerStats.points.toLocaleString()}
                                </div>
                                <div className="stat-badge">
                                    {playerStats.level.name}
                                </div>
                            </div>
                            <div className="stat-footer">
                                <span className="stat-hint">클릭하여 획득 내역 보기</span>
                            </div>
                        </div>
                    </div>

                    {/* 레벨 진행도 카드 */}
                    <div className="stat-card stat-card-level">
                        <div className="stat-card-glow" />
                        <div className="stat-card-pattern" />
                        <div className="stat-card-content">
                            <div className="stat-header">
                                <div className="stat-icon">📈</div>
                                <h4 className="stat-title">레벨 진행도</h4>
                            </div>
                            <div className="level-display">
                                <div className="level-icon-wrapper">
                                    <span className="level-icon">{playerStats.level.tierIcon}</span>
                                    <div className="level-glow" />
                                </div>
                                <div className="level-info">
                                    <div className="level-name" style={{ color: playerStats.level.color }}>
                                        {playerStats.level.name}
                                    </div>
                                    <div className="level-rank">
                                        Rank {playerStats.level.rank} / {playerStats.level.totalRanks}
                                    </div>
                                </div>
                            </div>
                            <div className="progress-wrapper">
                                <div className="progress-bar-advanced">
                                    <div 
                                        className="progress-fill"
                                        style={{ 
                                            width: `${playerStats.level.progress}%`,
                                            background: `linear-gradient(90deg, ${playerStats.level.color}, ${playerStats.level.color}dd, ${playerStats.level.color})`
                                        }}
                                    >
                                        <div className="progress-shine" />
                                    </div>
                                </div>
                                <div className="progress-text">
                                    {playerStats.level.progress}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 연속 로그인 카드 */}
                    <div className="stat-card stat-card-streak">
                        <div className="stat-card-glow" />
                        <div className="stat-card-pattern" />
                        <div className="stat-card-content">
                            <div className="stat-header">
                                <div className="stat-icon">🔥</div>
                                <h4 className="stat-title">연속 로그인</h4>
                            </div>
                            <div className="streak-content-wrapper">
                                <StreakButton
                                    onCheckIn={() => {
                                        const result = checkAttendance(userProfile.getName() || 'guest');
                                        if (result.success) {
                                            triggerQuestAction('daily_login', role);
                                            setCheckInResult({ streak: result.consecutiveDays, bonus: result.bonus });
                                            setIsCheckInModalOpen(true);
                                            loadData();
                                        } else {
                                            alert(result.message);
                                        }
                                    }}
                                    onShowMonthlyRewards={() => setIsMonthlyModalOpen(true)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 아바타 섹션 - 프리미엄 디자인 */}
                <div className="avatar-section-card mb-xl">
                    <div className="avatar-section-glow" />
                    <div className="avatar-section-content">
                        <div className="avatar-section-header">
                            <h3 className="avatar-section-title">
                                <span className="avatar-section-icon">👤</span>
                                내 아바타
                            </h3>
                            <div className="avatar-section-actions">
                                <button
                                    className="btn btn-primary btn-sm btn-gradient"
                                    onClick={() => setIsAvatarWindowOpen(true)}
                                >
                                    장비 관리
                                </button>
                                <Link to="/inventory">
                                    <button className="btn btn-secondary btn-sm btn-glass">
                                        인벤토리
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="avatar-display-wrapper">
                            <div 
                                className="avatar-display"
                                onClick={() => setIsAvatarWindowOpen(true)}
                            >
                                <div className="avatar-glow-ring" />
                                <AvatarGearDisplay
                                    equippedItems={equippedItems}
                                    size={200}
                                    slotSize={45}
                                    onSlotClick={() => setIsAvatarWindowOpen(true)}
                                    onImageClick={(category, item) => {
                                        navigate('/inventory');
                                    }}
                                    roleId={role}
                                />
                            </div>
                            <div className="avatar-hint">
                                * 아바타를 클릭하여 장비를 관리하세요
                            </div>
                        </div>
                    </div>
                </div>

                {/* 주간 퀘스트 트래커 */}
                <div className="mb-xl">
                    <WeeklyQuestTracker role={role} />
                </div>


                {/* 찾아라 위험! 일일 퀘스트 & 안전 지능 시스템 */}
                <div className="mb-xl" style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    justifyContent: 'center', 
                    alignItems: 'stretch',
                    flexWrap: 'wrap',
                    width: '100%',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    {/* 찾아라 위험! 버튼 */}
                    <div
                        className={`quest-trigger-card ${isHazardQuestCompleted ? 'completed' : ''}`}
                        onClick={() => {
                            if (isHazardQuestCompleted) {
                                alert("오늘은 이미 퀘스트를 완료했습니다. 내일 다시 도전해 주세요!");
                                return;
                            }
                            setIsHazardModalOpen(true);
                        }}
                        style={{
                            flex: '0 0 auto',
                            width: '400px',
                            maxWidth: '400px',
                            margin: '0'
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

                    {/* GEMS AI 안전 지능 시스템 버튼 */}
                    <Link to="/risk-solution" className="no-underline" style={{ 
                        flex: '0 0 auto',
                        width: '400px',
                        maxWidth: '400px',
                        display: 'flex',
                        margin: '0'
                    }}>
                        <div
                            className="gemini-quest-card"
                            style={{
                                position: 'relative',
                                width: '100%',
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 0.8) 100%)',
                                border: '2px solid #8b5cf6',
                                borderRadius: '16px',
                                color: '#ffffff',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(139, 92, 246, 0.06)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4), 0 4px 8px rgba(139, 92, 246, 0.25)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(139, 92, 246, 0.06)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 0.8) 100%)';
                            }}
                        >
                            {/* 아이콘 */}
                            <div style={{
                                fontSize: '2rem',
                                filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.5))',
                                animation: 'bounce-slow 2s infinite',
                                position: 'relative',
                                zIndex: 2
                            }}>
                                🤖
                            </div>
                            
                            {/* 콘텐츠 */}
                            <div style={{ textAlign: 'left', position: 'relative', zIndex: 2 }}>
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.25rem',
                                    textShadow: '0 0 10px rgba(139, 92, 246, 0.3)'
                                }}>
                                    안전 지능 시스템
                                </div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'rgba(196, 181, 253, 0.9)',
                                    fontWeight: 500
                                }}>
                                    AI 위험 분석 • Gemini
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 오늘의 퀘스트 */}
                <div className="mb-xl">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: '#f1f5f9' }}>📅 오늘의 퀘스트</h2>
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
                    <h3 className="mb-6 text-2xl font-bold" style={{ color: '#f1f5f9' }}>
                        빠른 액세스
                    </h3>
                    <div className="grid grid-4 gap-4">
                        <Link to="/shop" className="card backdrop-blur-xl rounded-2xl p-6 
                          shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                          group relative overflow-hidden no-underline text-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent 
                              to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="card-body relative z-10">
                                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🛒</div>
                                <div className="font-semibold" style={{ color: '#f1f5f9' }}>아이템 상점</div>
                            </div>
                        </Link>

                        <Link to="/weekly" className="card backdrop-blur-xl rounded-2xl p-6 
                          shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                          group relative overflow-hidden no-underline text-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent 
                              to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="card-body relative z-10">
                                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
                                <div className="font-semibold" style={{ color: '#f1f5f9' }}>주간 퀘스트</div>
                            </div>
                        </Link>

                        <Link to="/monthly" className="card backdrop-blur-xl rounded-2xl p-6 
                          shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                          group relative overflow-hidden no-underline text-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent 
                              to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="card-body relative z-10">
                                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🏆</div>
                                <div className="font-semibold" style={{ color: '#f1f5f9' }}>월간 퀘스트</div>
                            </div>
                        </Link>

                        <Link to="/profile" className="card backdrop-blur-xl rounded-2xl p-6 
                          shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                          group relative overflow-hidden no-underline text-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent 
                              to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="card-body relative z-10">
                                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">👤</div>
                                <div className="font-semibold" style={{ color: '#f1f5f9' }}>프로필</div>
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

            <DailyCheckInModal
                isOpen={isCheckInModalOpen}
                onClose={() => setIsCheckInModalOpen(false)}
                streakCount={checkInResult.streak}
                bonus={checkInResult.bonus}
            />

            <MonthlyAttendanceModal
                isOpen={isMonthlyModalOpen}
                onClose={() => setIsMonthlyModalOpen(false)}
            />

            <AvatarWindow
                isOpen={isAvatarWindowOpen}
                onClose={() => {
                    setIsAvatarWindowOpen(false);
                    loadData(); // 장비 변경 사항 반영
                }}
                onEquipRequest={(category) => {
                    // 빈 슬롯 클릭 시 인벤토리로 이동
                    setIsAvatarWindowOpen(false);
                    navigate('/inventory');
                }}
                roleId={role}
            />

            {/* 포인트 획득 내역 모달 */}
            <PointsHistoryModal
                isOpen={isPointsHistoryModalOpen}
                onClose={() => setIsPointsHistoryModalOpen(false)}
            />
        </div>
    );
}

export default Dashboard;
