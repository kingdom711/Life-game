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
import DailyCheckInModal from '../components/DailyCheckInModal';
import WeeklyQuestTracker from '../components/WeeklyQuestTracker';
import { completeQuest, triggerQuestAction, checkAttendance } from '../utils/questManager';

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
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    const [checkInResult, setCheckInResult] = useState({ streak: 0, bonus: 0 });

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
        <div className="page">
            <div className="container">
                {/* 헤더 */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent">
                        안전관리 대시보드
                    </h1>
                    <p className="text-slate-600 text-lg">오늘도 안전한 하루를 만들어가세요!</p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-3 mb-xl gap-6">
                    {/* 포인트 카드 */}
                    <div className="card backdrop-blur-xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 
                      border border-white/50 rounded-2xl p-6 shadow-xl shadow-blue-500/10 
                      hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 
                      hover:-translate-y-1 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full 
                          blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-500" />
                        <div className="card-header relative z-10 mb-4">
                            <h4 className="card-title text-lg font-bold bg-gradient-to-r from-slate-800 
                              via-blue-600 to-slate-800 bg-clip-text text-transparent">
                              💰 포인트
                            </h4>
                        </div>
                        <div className="card-body text-center relative z-10">
                            <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 
                              to-indigo-600 bg-clip-text text-transparent">
                                {playerStats.points.toLocaleString()}
                            </div>
                            <div className="badge badge-primary bg-gradient-to-r from-blue-500 to-indigo-500 
                              text-white border-0 shadow-lg shadow-blue-500/30 inline-flex items-center px-3 py-1 rounded-full">
                                {playerStats.level.name}
                            </div>
                        </div>
                    </div>

                    {/* 레벨 진행도 카드 */}
                    <div className="card backdrop-blur-xl bg-gradient-to-br from-white/80 via-indigo-50/50 
                      to-white/60 border border-indigo-200/50 rounded-2xl p-6 shadow-xl 
                      shadow-indigo-500/10 hover:shadow-2xl transition-all duration-500 
                      hover:-translate-y-1 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full 
                          blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-500" />
                        <div className="card-header relative z-10 mb-4">
                            <h4 className="card-title text-lg font-bold bg-gradient-to-r from-indigo-600 
                              to-blue-600 bg-clip-text text-transparent">
                              📈 레벨 진행도
                            </h4>
                        </div>
                        <div className="card-body relative z-10">
                            <div className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-indigo-600 
                              to-blue-600 bg-clip-text text-transparent">
                                {playerStats.level.name}
                            </div>
                            <div className="progress h-3 bg-slate-200 rounded-full overflow-hidden 
                              shadow-inner mb-2">
                                <div className="progress-bar h-full bg-gradient-to-r from-indigo-500 
                                  via-blue-500 to-indigo-500 rounded-full relative overflow-hidden" 
                                  style={{ width: `${playerStats.level.progress}%` }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                                      via-white/30 to-transparent animate-shimmer" />
                                </div>
                            </div>
                            <div className="text-center text-sm text-slate-600 font-semibold">
                                {playerStats.level.progress}%
                            </div>
                        </div>
                    </div>

                    {/* 연속 로그인 카드 */}
                    <div className="card backdrop-blur-xl bg-gradient-to-br from-white/80 via-orange-50/50 
                      to-white/60 border border-orange-200/50 rounded-2xl p-6 shadow-xl 
                      shadow-orange-500/10 hover:shadow-2xl transition-all duration-500 
                      hover:-translate-y-1 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full 
                          blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-500" />
                        <div className="card-header relative z-10 mb-4">
                            <h4 className="card-title text-lg font-bold bg-gradient-to-r from-orange-600 
                              to-red-600 bg-clip-text text-transparent">
                              🔥 연속 로그인
                            </h4>
                        </div>
                        <div className="card-body text-center relative z-10 p-4">
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
                            />
                        </div>
                    </div>
                </div>

                {/* 아바타 섹션 */}
                <div className="card backdrop-blur-xl bg-gradient-to-br from-white/80 via-purple-50/50 
                  to-white/60 border border-purple-200/50 rounded-2xl p-6 mb-xl shadow-xl 
                  shadow-purple-500/10 hover:shadow-2xl transition-all duration-500 relative 
                  overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent 
                      to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="card-header flex justify-between items-center mb-4 relative z-10">
                        <h3 className="card-title text-xl font-bold bg-gradient-to-r from-purple-600 
                          to-blue-600 bg-clip-text text-transparent">
                          👤 내 아바타
                        </h3>
                        <div className="flex gap-2">
                            <button
                                className="btn btn-primary btn-sm bg-gradient-to-r from-blue-500 to-indigo-500 
                                  hover:from-blue-400 hover:to-indigo-400 text-white border-0 shadow-lg 
                                  shadow-blue-500/30 hover:shadow-xl transition-all duration-300"
                                onClick={() => setIsAvatarWindowOpen(true)}
                            >
                                장비 관리
                            </button>
                            <Link to="/inventory">
                                <button className="btn btn-secondary btn-sm backdrop-blur-sm bg-white/70 
                                  hover:bg-white/90 border border-slate-300/50 shadow-md hover:shadow-lg 
                                  transition-all duration-300">
                                  인벤토리
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="card-body relative z-10">
                        <div
                            className="flex justify-center items-center p-4 cursor-pointer hover:scale-105 
                              transition-transform duration-300"
                            onClick={() => setIsAvatarWindowOpen(true)}
                        >
                            <div className="avatar-container max-w-full h-auto">
                                <AvatarGearDisplay
                                    equippedItems={equippedItems}
                                    size={200}
                                    slotSize={45}
                                    onSlotClick={() => setIsAvatarWindowOpen(true)}
                                    roleId={role}
                                />
                            </div>
                        </div>
                        <div className="text-center mt-4 text-slate-600 text-sm">
                            * 아바타를 클릭하여 장비를 관리하세요
                        </div>
                    </div>
                </div>

                {/* 주간 퀘스트 트래커 */}
                <div className="mb-xl">
                    <WeeklyQuestTracker />
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

                {/* GEMS AI 위험 솔루션 버튼 */}
                <div className="mb-xl text-center">
                    <Link to="/risk-solution" className="no-underline">
                        <button
                            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 
                              to-slate-900 border border-blue-500/30 shadow-2xl shadow-blue-500/20 
                              hover:shadow-blue-500/40 hover:border-blue-500/50 transition-all duration-500 
                              hover:-translate-y-1 relative overflow-hidden group flex items-center justify-center gap-3"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent 
                              to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="text-2xl relative z-10">🤖</span>
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 
                              to-blue-400 bg-clip-text text-transparent relative z-10">
                                안전 지능 시스템
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 
                              to-transparent -translate-x-full group-hover:translate-x-full 
                              transition-transform duration-1000" />
                        </button>
                    </Link>
                    <p className="mt-2 text-sm text-slate-600">
                        현장의 위험 상황을 AI가 분석하고 조치 방안을 제시합니다.
                    </p>
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
                    <h3 className="mb-6 text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 
                      to-slate-800 bg-clip-text text-transparent">
                        빠른 액세스
                    </h3>
                    <div className="grid grid-4 gap-4">
                        <Link to="/shop" className="card backdrop-blur-xl bg-gradient-to-br from-white/70 
                          via-white/50 to-white/30 border border-white/40 rounded-2xl p-6 
                          shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                          group relative overflow-hidden no-underline text-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent 
                              to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="card-body relative z-10">
                                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🛒</div>
                                <div className="font-semibold text-slate-800">아이템 상점</div>
                            </div>
                        </Link>

                        <Link to="/weekly" className="card backdrop-blur-xl bg-gradient-to-br from-white/70 
                          via-white/50 to-white/30 border border-white/40 rounded-2xl p-6 
                          shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                          group relative overflow-hidden no-underline text-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent 
                              to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="card-body relative z-10">
                                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
                                <div className="font-semibold text-slate-800">주간 퀘스트</div>
                            </div>
                        </Link>

                        <Link to="/monthly" className="card backdrop-blur-xl bg-gradient-to-br from-white/70 
                          via-white/50 to-white/30 border border-white/40 rounded-2xl p-6 
                          shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                          group relative overflow-hidden no-underline text-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent 
                              to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="card-body relative z-10">
                                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🏆</div>
                                <div className="font-semibold text-slate-800">월간 퀘스트</div>
                            </div>
                        </Link>

                        <Link to="/profile" className="card backdrop-blur-xl bg-gradient-to-br from-white/70 
                          via-white/50 to-white/30 border border-white/40 rounded-2xl p-6 
                          shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 
                          group relative overflow-hidden no-underline text-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent 
                              to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="card-body relative z-10">
                                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">👤</div>
                                <div className="font-semibold text-slate-800">프로필</div>
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
