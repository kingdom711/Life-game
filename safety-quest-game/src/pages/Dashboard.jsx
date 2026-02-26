import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { points, streak, dailyQuestInstances, userProfile, getKSTDateString, questProgress, dailyQuestSnapshots } from '../utils/storage';
import { calculateLevel } from '../utils/pointsCalculator';
import { getQuestsByTypeRoleAndSpec } from '../data/questsData';
import { getAllEquippedItems } from '../utils/inventoryManager';
import { QUEST_TYPE } from '../data/questsData';
import { getActiveSpecialization } from '../utils/specializationManager';
import HazardQuestModal from '../components/HazardQuestModal';
import DailyCheckInModal from '../components/DailyCheckInModal';
import MonthlyAttendanceModal from '../components/MonthlyAttendanceModal';
import { completeQuest, triggerQuestAction } from '../utils/questManager';

import AvatarWindow from '../components/AvatarWindow';
import PointsHistoryModal from '../components/PointsHistoryModal';
import LeaderboardModal from '../components/LeaderboardModal';
import { LoadingState, ErrorState } from '../components/PageState';
import { getAlerts } from '../api/alertApi';
import userApi from '../api/userApi';
import TopProgressHeader from '../components/dashboard/TopProgressHeader';
import QuestTimeline from '../components/dashboard/QuestTimeline';
import EquipmentSidebar from '../components/dashboard/EquipmentSidebar';
import WeeklyQuestProgress from '../components/dashboard/WeeklyQuestProgress';
import TeamRankingSidebar from '../components/dashboard/TeamRankingSidebar';
import SafetyTipBar from '../components/dashboard/SafetyTipBar';

// [New] 援먯쑁 ?쒖뒪??
import { getTodayEducationContent, hasCompletedTodayEducation } from '../utils/educationManager';

// [New] 援먯쑁 寃뚯씠??
import useWorkPermission from '../utils/useWorkPermission';
import EducationRequiredModal from '../components/EducationRequiredModal';

// [New] 泥댄겕由ъ뒪??& ?ъ쭊 ?낅줈??& 寃??
import ChecklistFormModal from '../components/ChecklistFormModal';
import PhotoUploadModal from '../components/PhotoUploadModal';
import ChecklistReviewModal from '../components/ChecklistReviewModal';

const NON_GATED_QUESTS = ['daily_education_1', 'daily_login_1'];

const COLOR = {
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    textDim: 'rgba(203, 213, 225, 0.6)',
    textFaint: 'rgba(203, 213, 225, 0.5)',
    textStrong: 'rgba(203, 213, 225, 0.9)',
    primaryLight: 'var(--color-primary-light)',
    primary: 'var(--color-primary)',
    secondaryLight: 'var(--color-secondary-light)',
    secondary: 'var(--color-secondary)',
    warningLight: 'var(--color-warning-light)',
    warning: 'var(--color-warning)',
    safe: 'var(--color-safe)',
    safeLight: 'var(--color-safe-light)',
    danger: 'var(--color-danger)',
    dangerLight: 'var(--color-danger-light)',
    bronze: 'var(--color-bronze)',
    alertModalStart: 'var(--color-alert-modal-start)',
    alertModalEnd: 'var(--color-alert-modal-end)'
};

const ALERT_TYPE_THEME = {
    danger: {
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.4)',
        label: '위험',
        labelColor: 'var(--color-danger-light)',
        icon: '🚨'
    },
    warning: {
        bg: 'rgba(251, 191, 36, 0.15)',
        border: 'rgba(251, 191, 36, 0.4)',
        label: '주의',
        labelColor: 'var(--color-warning-light)',
        icon: '⚠️'
    },
    info: {
        bg: 'rgba(56, 189, 248, 0.15)',
        border: 'rgba(56, 189, 248, 0.4)',
        label: '안내',
        labelColor: 'var(--color-primary-light)',
        icon: 'ℹ️'
    }
};

function Dashboard({ role }) {
    const navigate = useNavigate();
    const [playerStats, setPlayerStats] = useState({
        points: 0,
        level: {
            name: 'Bronze III',
            progress: 0,
            color: COLOR.bronze,
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
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    // ?뚮┝ ?곗씠??(API?먯꽌 濡쒕뱶)
    const [latestAlerts, setLatestAlerts] = useState([]);
    const [hasNewAlerts, setHasNewAlerts] = useState(false);
    const [prevAlertCount, setPrevAlertCount] = useState(0);

    // [New] 援먯쑁 ?쒖뒪???곹깭
    const [todayEducation, setTodayEducation] = useState(null);
    const [educationCompleted, setEducationCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // [New] 援먯쑁 寃뚯씠??
    const { showModal: showEducationModal, checkPermission, closeModal: closeEducationModal, educationInfo } = useWorkPermission();

    // [New] 泥댄겕由ъ뒪??& ?ъ쭊 ?낅줈??& 寃??紐⑤떖
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // 愿由ъ옄 沅뚰븳 泥댄겕
    const isAdmin = role === 'supervisor' || role === 'safetyManager';

    useEffect(() => {
        initializeDashboard();
    }, [role]);

    useEffect(() => {
        let lastKstDate = getKSTDateString();

        const intervalId = setInterval(() => {
            const currentKstDate = getKSTDateString();
            if (currentKstDate === lastKstDate) {
                return;
            }

            lastKstDate = currentKstDate;
            initializeDashboard();
        }, 60000);

        return () => clearInterval(intervalId);
    }, [role]);

    // [New] ?ㅼ떆媛??뚮┝ ?대쭅 (30珥?媛꾧꺽)
    useEffect(() => {
        if (isLoading) return;

        const pollAlerts = async () => {
            // 鍮꾪솢????뿉?쒕뒗 ?대쭅 以묐떒
            if (document.visibilityState !== 'visible') return;
            try {
                const alerts = await getAlerts();
                if (alerts && alerts.length > 0) {
                    if (alerts.length > prevAlertCount && prevAlertCount > 0) {
                        setHasNewAlerts(true);
                    }
                    setPrevAlertCount(alerts.length);
                    setLatestAlerts(alerts);
                }
            } catch (error) {
                // ?대쭅 ?ㅽ뙣??議곗슜??臾댁떆
            }
        };

        const intervalId = setInterval(pollAlerts, 30000);
        return () => clearInterval(intervalId);
    }, [isLoading, prevAlertCount]);

    const initializeDashboard = async () => {
        setIsLoading(true);
        setLoadError('');
        try {
            await Promise.all([loadData(), loadAlerts()]);
        } catch (error) {
            console.error('대시보드 초기화 실패:', error);
            setLoadError('대시보드 데이터를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadData = async () => {
        // localStorage?먯꽌 利됱떆 濡쒕뱶 (鍮좊Ⅸ UI ?쒖떆)
        const currentPoints = points.get();
        const currentLevel = calculateLevel(currentPoints);
        const currentStreak = streak.get();
        const equipped = getAllEquippedItems();
        const activeSpec = getActiveSpecialization();
        const quests = getQuestsByTypeRoleAndSpec(QUEST_TYPE.DAILY, role, activeSpec?.id || null);

        setPlayerStats({
            points: currentPoints,
            level: currentLevel,
            streak: currentStreak
        });
        setEquippedItems(equipped);
        setDailyQuests(quests.slice(0, 4)); // 泥섏쓬 4媛??쒖떆

        const todayInstance = dailyQuestInstances.getTodayInstance(userProfile.getName() || 'guest');
        setIsHazardQuestCompleted(todayInstance.isCompleted);

        // [New] 援먯쑁 ?곗씠??濡쒕뱶
        try {
            const education = getTodayEducationContent();
            setTodayEducation(education);
            setEducationCompleted(hasCompletedTodayEducation());
        } catch (error) {
            console.error('교육 데이터 로드 실패:', error);
        }

        // 諛깆뿏?쒖뿉??理쒖떊 ?곗씠???숆린??(濡쒓렇???곹깭????
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const [pointsData, streakData] = await Promise.allSettled([
                    userApi.getPoints(),
                    userApi.getStreak()
                ]);

                let syncedPoints = currentPoints;
                let syncedStreak = currentStreak;

                if (pointsData.status === 'fulfilled' && pointsData.value) {
                    syncedPoints = pointsData.value.balance;
                    points.set(syncedPoints);
                }

                if (streakData.status === 'fulfilled' && streakData.value) {
                    const localStreakBeforeSync = streak.get();
                    const localCheckedInToday = streak.isCheckedInToday();
                    const apiLastCheckInDateRaw = streakData.value.lastCheckInDate;
                    const apiLastCheckInDate =
                        typeof apiLastCheckInDateRaw === 'string'
                            ? apiLastCheckInDateRaw.split('T')[0]
                            : apiLastCheckInDateRaw;
                    const todayKST = getKSTDateString();

                    syncedStreak = {
                        current: streakData.value.currentStreak,
                        longest: streakData.value.longestStreak,
                        lastLoginDate:
                            localCheckedInToday && apiLastCheckInDate !== todayKST
                                ? localStreakBeforeSync.lastLoginDate
                                : streakData.value.lastCheckInDate
                    };
                    streak.set(syncedStreak);
                }

                setPlayerStats(prev => ({
                    ...prev,
                    points: syncedPoints,
                    level: calculateLevel(syncedPoints),
                    streak: syncedStreak
                }));
            } catch (err) {
                console.log('[Dashboard] API sync failed, using localStorage:', err.message);
            }
        }
    };

    const loadAlerts = async () => {
        const fallbackAlerts = [
            {
                id: 1,
                type: 'danger',
                zone: '2구역',
                message: '낙하물 주의',
                time: '10분 전',
                detail: '2구역 상부 작업 중 낙하물 위험이 감지되었습니다. 해당 구역 진입 전 안전모 착용과 작업 반경 확인이 필요합니다.'
            },
            {
                id: 2,
                type: 'warning',
                zone: '5구역',
                message: '고소작업 진행 중',
                time: '25분 전',
                detail: '5구역 고소작업이 진행 중입니다. 추락 방지 안전대와 출입 통제 상태를 확인해 주세요.'
            },
            {
                id: 3,
                type: 'info',
                zone: '전체',
                message: '정기 안전점검 예정',
                time: '1시간 전',
                detail: '오후 2시부터 전 구역 정기 안전점검이 예정되어 있습니다. 작업 중단 및 관리자 지시에 협조해 주세요.'
            }
        ];

        try {
            const alerts = await getAlerts();
            if (alerts && alerts.length > 0) {
                setLatestAlerts(alerts);
                return;
            }
            setLatestAlerts(fallbackAlerts);
        } catch (error) {
            console.error('알림 로드 실패:', error);
            setLatestAlerts(fallbackAlerts);
        }
    };
    const enrichedQuests = dailyQuests.map((quest, index) => {
        const progress = questProgress?.getQuestProgress?.(quest.id);
        const isCompleted = progress?.completed || false;

        // 로그인(출석) 퀘스트는 잠금에서 완전히 제외
        const isLoginQuest = quest.id === 'daily_login_1';

        // 교육 게이팅: 교육 완료 시 나머지 퀘스트 모두 자동 해금 (순차 잠금 없음)
        const isGated = !NON_GATED_QUESTS.includes(quest.id) && !educationCompleted;
        const isLocked = !isCompleted && !isLoginQuest && isGated;

        return {
            ...quest,
            isCompleted,
            isLocked,
            isActive: !isCompleted && !isLocked,
            state: isCompleted ? 'completed' : (!isLocked ? 'active' : 'locked'),
            lockReason: isGated ? '교육 완료 후 잠금 해제' : ''
        };
    });

    // 오늘의 퀘스트 수행률 스냅샷 자동 저장
    useEffect(() => {
        if (dailyQuests.length === 0) return;
        const todayStr = getKSTDateString();
        dailyQuestSnapshots.save(todayStr, enrichedQuests);
    }, [dailyQuests, educationCompleted]);

    const handleStreakCheckIn = (result) => {
        if (!result?.success) {
            if (result?.message) {
                alert(result.message);
            }
            return;
        }

        triggerQuestAction('daily_login', role);
        setCheckInResult({
            streak: result.streak ?? result.consecutiveDays ?? 0,
            bonus: result.bonus ?? 0
        });
        setIsCheckInModalOpen(true);
        loadData();
    };

    const handleCompleteQuest = (quest) => {
        // 援먯쑁 寃뚯씠?? 援먯쑁/濡쒓렇???섏뒪???쒖쇅 ?섎㉧吏??援먯쑁 ?꾨즺 ?꾩슂
        if (!NON_GATED_QUESTS.includes(quest.id) && !checkPermission()) {
            return;
        }

        if (quest.id === 'daily_education_1') {
            navigate('/education');
            return;
        }
        if (quest.id === 'daily_hazard_1') {
            if (isHazardQuestCompleted) {
                alert('오늘은 이미 퀘스트를 완료했습니다. 내일 다시 도전해 주세요!');
                return;
            }
            setIsHazardModalOpen(true);
            return;
        }
        if (quest.id === 'daily_checklist_1') {
            setIsChecklistModalOpen(true);
            return;
        }
        if (quest.id === 'daily_photo_1') {
            setIsPhotoModalOpen(true);
            return;
        }
        if (quest.id === 'daily_review_1') {
            setIsReviewModalOpen(true);
            return;
        }
        completeQuest(quest.id);
        loadData(); // ?덈줈怨좎묠
    };

    if (isLoading) {
        return (
            <div className="page dashboard-page">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <LoadingState
                        title="대시보드를 불러오는 중입니다..."
                        description="퀘스트, 알림, 교육 데이터를 동기화하고 있습니다."
                    />
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="page dashboard-page">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <ErrorState
                        title="대시보드 로드에 실패했습니다."
                        description={loadError}
                        onRetry={initializeDashboard}
                    />
                </div>
            </div>
        );
    }

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
                <TopProgressHeader
                    playerStats={playerStats}
                    role={role}
                    onPointsClick={() => setIsPointsHistoryModalOpen(true)}
                    equippedItems={equippedItems}
                    onNavigateShop={() => navigate('/shop')}
                    onNavigateAvatar={() => setIsAvatarWindowOpen(true)}
                    latestAlerts={latestAlerts}
                    hasNewAlerts={hasNewAlerts}
                    onAlertClick={() => {
                        setIsAlertModalOpen(true);
                        setHasNewAlerts(false);
                    }}
                    onCheckIn={handleStreakCheckIn}
                    onShowMonthlyRewards={() => setIsMonthlyModalOpen(true)}
                />

                <div className="dashboard-content-layout">
                    <section className="dashboard-main-column">
                        <h2 className="dashboard-quest-heading">
                            오늘의 안전 퀘스트
                            <span>(Today's Safety Quests)</span>
                        </h2>
                        <QuestTimeline
                            quests={enrichedQuests}
                            onQuestAction={handleCompleteQuest}
                            todayEducation={todayEducation}
                            educationCompleted={educationCompleted}
                            onCheckIn={handleStreakCheckIn}
                            onOpenMonthlyRewards={() => setIsMonthlyModalOpen(true)}
                        />
                    </section>

                    <aside className="dashboard-side-column">
                        <WeeklyQuestProgress quests={enrichedQuests} />
                        <TeamRankingSidebar onShowLeaderboard={() => setIsLeaderboardOpen(true)} />
                    </aside>
                </div>

                <SafetyTipBar />
            </div>
            <HazardQuestModal
                isOpen={isHazardModalOpen}
                onClose={() => setIsHazardModalOpen(false)}
                onComplete={(points) => {
                    // ?꾪뿕 ??ぉ ?뺤씤 ?섏뒪???몃━嫄?
                    triggerQuestAction('check_risk', role);

                    loadData(); // ?ъ씤??諛??섏뒪???곹깭 ?낅뜲?댄듃 諛섏쁺
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
                    loadData(); // ?λ퉬 蹂寃??ы빆 諛섏쁺
                }}
                onEquipRequest={(category) => {
                    // 鍮??щ’ ?대┃ ???몃깽?좊━濡??대룞
                    setIsAvatarWindowOpen(false);
                    navigate('/inventory');
                }}
                roleId={role}
            />

            {/* 援먯쑁 寃뚯씠??紐⑤떖 */}
            <EducationRequiredModal
                isOpen={showEducationModal}
                onClose={closeEducationModal}
                educationInfo={educationInfo}
            />

            {/* 泥댄겕由ъ뒪???묒꽦 紐⑤떖 */}
            <ChecklistFormModal
                isOpen={isChecklistModalOpen}
                onClose={() => setIsChecklistModalOpen(false)}
                onComplete={() => loadData()}
                role={role}
            />

            {/* ?ъ쭊 ?낅줈??紐⑤떖 */}
            <PhotoUploadModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onComplete={() => loadData()}
                role={role}
            />

            {/* 愿由ш컧?낆옄 寃??紐⑤떖 */}
            <ChecklistReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onComplete={() => loadData()}
            />

            {/* ?ъ씤???띾뱷 ?댁뿭 紐⑤떖 */}
            <PointsHistoryModal
                isOpen={isPointsHistoryModalOpen}
                onClose={() => setIsPointsHistoryModalOpen(false)}
            />

            <LeaderboardModal
                isOpen={isLeaderboardOpen}
                onClose={() => setIsLeaderboardOpen(false)}
            />

            {/* ?ㅼ떆媛??꾪뿕 ?뚮┝ 紐⑤떖 */}
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
                            background: `linear-gradient(135deg, ${COLOR.alertModalStart} 0%, ${COLOR.alertModalEnd} 100%)`,
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
                        {/* 紐⑤떖 ?ㅻ뜑 */}
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
                                color: COLOR.secondaryLight,
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
                                    color: COLOR.textSecondary,
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

                        {/* 紐⑤떖 ?댁슜 */}
                        <div style={{
                            padding: '1.5rem',
                            maxHeight: 'calc(80vh - 80px)',
                            overflowY: 'auto'
                        }}>
                            {latestAlerts.map((alert, index) => (
                                <div
                                    key={alert.id}
                                    style={{
                                        background: (ALERT_TYPE_THEME[alert.type] || ALERT_TYPE_THEME.info).bg,
                                        border: `2px solid ${(ALERT_TYPE_THEME[alert.type] || ALERT_TYPE_THEME.info).border}`,
                                        borderRadius: '12px',
                                        padding: '1.25rem',
                                        marginBottom: index < latestAlerts.length - 1 ? '1rem' : 0
                                    }}
                                >
                                    {/* ?뚮┝ ?ㅻ뜑 */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {(ALERT_TYPE_THEME[alert.type] || ALERT_TYPE_THEME.info).icon}
                                        </span>
                                        <div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: (ALERT_TYPE_THEME[alert.type] || ALERT_TYPE_THEME.info).labelColor,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {(ALERT_TYPE_THEME[alert.type] || ALERT_TYPE_THEME.info).label}
                                            </div>
                                            <div style={{
                                                fontSize: '1.1rem',
                                                fontWeight: 700,
                                                color: COLOR.text
                                            }}>
                                                {alert.zone} - {alert.message}
                                            </div>
                                        </div>
                                        <div style={{
                                            marginLeft: 'auto',
                                            fontSize: '0.75rem',
                                            color: COLOR.textMuted
                                        }}>
                                            {alert.time}
                                        </div>
                                    </div>

                                    {/* ?곸꽭 ?댁슜 */}
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.9rem',
                                        color: COLOR.textStrong,
                                        lineHeight: 1.6,
                                        paddingLeft: '2.25rem'
                                    }}>
                                        {alert.detail}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 紐⑤떖 ?명꽣 */}
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
                                color: COLOR.textFaint
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
                                        background: `linear-gradient(135deg, ${COLOR.secondary} 0%, var(--color-secondary-dark) 100%)`,
                                        color: COLOR.text,
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
