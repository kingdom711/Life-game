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
import { getAlerts } from '../api/alertApi';

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
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    
    // 알림 데이터 (API에서 로드)
    const [latestAlerts, setLatestAlerts] = useState([]);
    
    // 관리자 권한 체크
    const isAdmin = role === 'supervisor' || role === 'safetyManager';

    useEffect(() => {
        loadData();
        loadAlerts();
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

    const loadAlerts = async () => {
        try {
            const alerts = await getAlerts();
            if (alerts && alerts.length > 0) {
                setLatestAlerts(alerts);
            } else {
                // API 연결 안 됐을 때 기본 데이터
                setLatestAlerts([
                    { id: 1, type: 'danger', zone: '2구역', message: '낙하물 주의', time: '10분 전', detail: '2구역 상부 작업 중 자재 낙하 위험이 감지되었습니다. 해당 구역 진입 시 안전모 착용을 필수로 하시고, 상부 작업자의 신호를 확인 후 이동하세요.' },
                    { id: 2, type: 'warning', zone: '5구역', message: '고소작업 진행중', time: '25분 전', detail: '5구역에서 고소작업이 진행 중입니다. 추락 방지 안전대 착용을 확인하시고, 작업 반경 내 출입을 자제해 주세요.' },
                    { id: 3, type: 'info', zone: '전체', message: '안전점검 예정', time: '1시간 전', detail: '오후 2시부터 전 구역 정기 안전점검이 예정되어 있습니다. 작업 중단 후 안전관리자의 지시에 따라주세요.' }
                ]);
            }
        } catch (error) {
            console.error('알림 로드 실패:', error);
            // 에러 시 기본 데이터
            setLatestAlerts([
                { id: 1, type: 'danger', zone: '2구역', message: '낙하물 주의', time: '10분 전', detail: '2구역 상부 작업 중 자재 낙하 위험이 감지되었습니다.' },
                { id: 2, type: 'warning', zone: '5구역', message: '고소작업 진행중', time: '25분 전', detail: '5구역에서 고소작업이 진행 중입니다.' },
                { id: 3, type: 'info', zone: '전체', message: '안전점검 예정', time: '1시간 전', detail: '오후 2시부터 전 구역 정기 안전점검이 예정되어 있습니다.' }
            ]);
        }
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
            {/* 배경 GIF - 화면 중앙 고정 */}
            <div 
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100vw',
                    height: '100vh',
                    zIndex: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
            >
                <img 
                    src="/assets/안전_관리_대시보드_배경_영상.gif" 
                    alt="배경"
                    style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        opacity: 0.3
                    }}
                />
            </div>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* 헤더 - 프리미엄 디자인 with 실시간 알림 */}
                <div 
                    className="dashboard-header mb-12"
                    style={{
                        display: 'flex',
                        alignItems: 'stretch',
                        justifyContent: 'space-between',
                        gap: '2rem',
                        flexWrap: 'wrap'
                    }}
                >
                    {/* 왼쪽 - 제목 영역 (비율 2) */}
                    <div style={{ 
                        flex: '2 1 300px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}>
                        <div className="header-glow" />
                        <h1 className="dashboard-title">
                            안전관리 대시보드
                        </h1>
                        <p className="dashboard-subtitle">
                            오늘도 안전한 하루를 만들어가세요!
                        </p>
                    </div>

                    {/* 오른쪽 - 실시간 위험 알림 카드 (비율 1) */}
                    <div 
                        onClick={() => setIsAlertModalOpen(true)}
                        style={{
                            flex: '1 1 280px',
                            maxWidth: '350px',
                            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(55, 48, 107, 0.85) 100%)',
                            border: '2px solid rgba(139, 92, 246, 0.4)',
                            borderRadius: '12px',
                            padding: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.3)';
                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                        }}
                    >
                        {/* 헤더 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.75rem',
                            paddingBottom: '0.5rem',
                            borderBottom: '1px solid rgba(139, 92, 246, 0.3)'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: '#e879f9',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}>
                                <span style={{ fontSize: '1rem' }}>🔔</span>
                                실시간 위험 알림
                            </h3>
                            <span style={{
                                fontSize: '0.65rem',
                                color: 'rgba(203, 213, 225, 0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                            }}>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    background: '#ef4444',
                                    borderRadius: '50%',
                                    animation: 'pulse 2s infinite'
                                }} />
                                LIVE
                            </span>
                        </div>

                        {/* 알림 내용 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            {/* 경고 아이콘 */}
                            <div style={{
                                flex: '0 0 auto',
                                width: '44px',
                                height: '44px',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.4rem',
                                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                            }}>
                                ⚠️
                            </div>

                            {/* 텍스트 */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#fbbf24',
                                    fontWeight: 600,
                                    marginBottom: '0.15rem'
                                }}>
                                    경고:
                                </div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: '#f1f5f9',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {latestAlerts[0]?.zone} {latestAlerts[0]?.message}
                                </div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    color: 'rgba(203, 213, 225, 0.6)',
                                    marginTop: '0.15rem'
                                }}>
                                    {latestAlerts[0]?.time} • 클릭하여 상세 보기
                                </div>
                            </div>

                            {/* 구역 미니맵 */}
                            <div style={{
                                flex: '0 0 auto',
                                width: '50px',
                                height: '40px',
                                background: 'rgba(139, 92, 246, 0.2)',
                                borderRadius: '6px',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* 간단한 구역 표시 */}
                                <div style={{
                                    position: 'absolute',
                                    inset: '3px',
                                    background: `
                                        linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px),
                                        linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px)
                                    `,
                                    backgroundSize: '8px 8px'
                                }} />
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    background: 'rgba(239, 68, 68, 0.6)',
                                    borderRadius: '3px',
                                    border: '1.5px solid #ef4444',
                                    animation: 'pulse 1.5s infinite'
                                }} />
                            </div>
                        </div>
                    </div>
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

            {/* 실시간 위험 알림 모달 */}
            {isAlertModalOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '1rem'
                    }}
                    onClick={() => setIsAlertModalOpen(false)}
                >
                    <div 
                        style={{
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflow: 'hidden',
                            border: '2px solid rgba(139, 92, 246, 0.4)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 60px rgba(139, 92, 246, 0.2)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 모달 헤더 */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: '#e879f9',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span>🔔</span>
                                실시간 위험 알림
                            </h2>
                            <button
                                onClick={() => setIsAlertModalOpen(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    color: '#cbd5e1',
                                    fontSize: '1.25rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* 모달 내용 */}
                        <div style={{
                            padding: '1.5rem',
                            maxHeight: 'calc(80vh - 80px)',
                            overflowY: 'auto'
                        }}>
                            {latestAlerts.map((alert, index) => (
                                <div 
                                    key={alert.id}
                                    style={{
                                        background: alert.type === 'danger' 
                                            ? 'rgba(239, 68, 68, 0.15)' 
                                            : alert.type === 'warning' 
                                            ? 'rgba(251, 191, 36, 0.15)' 
                                            : 'rgba(56, 189, 248, 0.15)',
                                        border: `2px solid ${
                                            alert.type === 'danger' 
                                            ? 'rgba(239, 68, 68, 0.4)' 
                                            : alert.type === 'warning' 
                                            ? 'rgba(251, 191, 36, 0.4)' 
                                            : 'rgba(56, 189, 248, 0.4)'
                                        }`,
                                        borderRadius: '12px',
                                        padding: '1.25rem',
                                        marginBottom: index < latestAlerts.length - 1 ? '1rem' : 0
                                    }}
                                >
                                    {/* 알림 헤더 */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {alert.type === 'danger' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                                        </span>
                                        <div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: alert.type === 'danger' 
                                                    ? '#fca5a5' 
                                                    : alert.type === 'warning' 
                                                    ? '#fcd34d' 
                                                    : '#7dd3fc',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {alert.type === 'danger' ? '위험' : alert.type === 'warning' ? '주의' : '안내'}
                                            </div>
                                            <div style={{
                                                fontSize: '1.1rem',
                                                fontWeight: 700,
                                                color: '#f1f5f9'
                                            }}>
                                                {alert.zone} - {alert.message}
                                            </div>
                                        </div>
                                        <div style={{
                                            marginLeft: 'auto',
                                            fontSize: '0.75rem',
                                            color: 'rgba(203, 213, 225, 0.6)'
                                        }}>
                                            {alert.time}
                                        </div>
                                    </div>

                                    {/* 상세 내용 */}
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.9rem',
                                        color: 'rgba(203, 213, 225, 0.9)',
                                        lineHeight: 1.6,
                                        paddingLeft: '2.25rem'
                                    }}>
                                        {alert.detail}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 모달 푸터 */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid rgba(139, 92, 246, 0.3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: '0.8rem',
                                color: 'rgba(203, 213, 225, 0.5)'
                            }}>
                                ※ 위험 알림은 실시간으로 업데이트됩니다.
                            </p>
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setIsAlertModalOpen(false);
                                        navigate('/alert-management');
                                    }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    ⚙️ 알림 관리
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
