import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeUserData, userProfile } from './utils/storage';
import { checkAndResetQuests } from './utils/questManager';
import { checkAndRunMigration } from './utils/dataMigration';
import { useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import DailyQuests from './pages/DailyQuests';
import WeeklyQuests from './pages/WeeklyQuests';
import MonthlyQuests from './pages/MonthlyQuests';
import Shop from './pages/Shop';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import TeamPage from './pages/TeamPage';
import PricingPage from './pages/PricingPage';
import RiskSolutionPage from './pages/RiskSolutionPage';
import AlertManagement from './pages/AlertManagement';
import EducationPage from './pages/EducationPage'; // [New] 교육 페이지
import SpecializationPage from './pages/SpecializationPage'; // [New] 전직 센터
import SpecializationTrainingPage from './pages/SpecializationTrainingPage'; // [New] 전직 교육
import Exchange from './pages/Exchange'; // [New] 포인트→골드 교환소
import RewardCenter from './pages/RewardCenter'; // [New] 보상센터
import HazardCyclePage from './pages/HazardCyclePage';
import HazardCycleAckPage from './pages/HazardCycleAckPage';
import CycleHistoryPage from './pages/CycleHistoryPage';
import SafetyScoreDashboard from './pages/SafetyScoreDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminRewardApproval from './pages/AdminRewardApproval';
import WorkStopHistoryPage from './pages/WorkStopHistoryPage'; // [New] 작업중지 이력
import AchievementPage from './pages/AchievementPage'; // [Phase1] 업적

// [Phase1] 팀 상세
import TeamDetailPage from './pages/TeamDetailPage';

// [Phase2] 고도화 페이지
import SeasonRankingPage from './pages/SeasonRankingPage';
import LearningPathPage from './pages/LearningPathPage';
import TeamQuestPage from './pages/TeamQuestPage';
import DepartmentBattlePage from './pages/DepartmentBattlePage';
import DailyBriefingPage from './pages/DailyBriefingPage';

// [Phase3] 고도화 페이지
import HazardHeatmapPage from './pages/HazardHeatmapPage';
import ScenarioPage from './pages/ScenarioPage';
import ComplianceReportPage from './pages/ComplianceReportPage';

// Components
import RoleSelector from './components/RoleSelector';
import Navigation from './components/Navigation';
import AdminModeSelector from './components/AdminModeSelector';
import AdminTestToolbar from './components/AdminTestToolbar';
import AdminDashboardToolbar from './components/AdminDashboardToolbar';
import WorkStopButton from './components/WorkStopButton'; // [New] 작업중지 플로팅 버튼
import WorkStopReportModal from './components/WorkStopReportModal'; // [New] 작업중지 신고 모달

import TeamJoinWizard from './components/team/TeamJoinWizard';
import useTeamGate from './hooks/useTeamGate';
import LaunchScreen from './pages/LaunchScreen';
import BackgroundMusic from './components/BackgroundMusic';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './context/LanguageContext';

// ...

const ADMIN_ENTRY_MODE_KEY = 'safety_quest_admin_entry_mode';
const ADMIN_ENTRY_MODES = {
    ADMIN: 'admin',
    TEST: 'test',
};

function App() {
    // 랜딩페이지 활성화
    const [showLandingPage, setShowLandingPage] = useState(true);
    const [showTeamPage, setShowTeamPage] = useState(false);
    const [showPricingPage, setShowPricingPage] = useState(false);
    const [showLoginPage, setShowLoginPage] = useState(false);
    const [showLaunchScreen, setShowLaunchScreen] = useState(false);
    const [isPlayingBgm, setIsPlayingBgm] = useState(false);
    // const [user, setUser] = useState(null); // AuthContext로 대체
    const [selectedRole, setSelectedRole] = useState(null);
    const [adminEntryMode, setAdminEntryMode] = useState(() => {
        try {
            return sessionStorage.getItem(ADMIN_ENTRY_MODE_KEY);
        } catch (_) {
            return null;
        }
    });
    const [isWorkStopModalOpen, setIsWorkStopModalOpen] = useState(false); // [New] 작업중지 모달
    // const [loading, setLoading] = useState(true); // AuthContext로 대체

    const { user, loading } = useAuth();
    const isAdminAccount = user?.role === 'ROLE_PROJECT_ADMIN' || user?.role === 'ROLE_ADMIN';
    const isAdminDashboardMode = isAdminAccount && adminEntryMode === ADMIN_ENTRY_MODES.ADMIN;
    const isAdminTestMode = isAdminAccount && adminEntryMode === ADMIN_ENTRY_MODES.TEST;
    const shouldShowAdminModeSelector = isAdminAccount && !adminEntryMode;
    const teamGate = useTeamGate({ autoLoad: Boolean(user && selectedRole && !isAdminAccount) });
    const shouldForceTeamJoin = Boolean(user && selectedRole && !isAdminAccount && !teamGate.loading && !teamGate.isActive);

    useEffect(() => {
        const initApp = async () => {
            try {
                // 초기화
                initializeUserData();

                // 데이터 마이그레이션 체크 (Item System 2.0)
                checkAndRunMigration();

                // 퀘스트 리셋 체크
                checkAndResetQuests();

                // 저장된 데이터 불러오기
                // const savedName = userProfile.getName(); // AuthContext 사용으로 제거/수정
                const savedRole = userProfile.getRole();

                // if (savedName) {
                //     setUser({ name: savedName });
                // }

                if (savedRole) {
                    setSelectedRole(savedRole);
                } else {
                    setSelectedRole(isAdminAccount ? 'technician' : null);
                }

                // 기존 사용자는 BGM 자동 재생
                if (user && savedRole) {
                    setIsPlayingBgm(true);
                }
            } catch (error) {
                console.error("App initialization failed:", error);
            } finally {
                // setLoading(false);
            }
        };

        if (!loading) {
            initApp();
        }
    }, [loading, user, isAdminAccount]);

    useEffect(() => {
        // 유저가 로그인되어 있으면 랜딩 페이지 닫기
        if (user) {
            setShowLandingPage(false);
            setIsPlayingBgm(true);
        }
    }, [user]);

    const handleEnterFromLanding = () => {
        setShowLandingPage(false);
        setShowTeamPage(false);
        setShowPricingPage(true);
    };

    const handleShowTeam = () => {
        setShowLandingPage(false);
        setShowTeamPage(true);
    };

    const handleBackFromTeam = () => {
        setShowTeamPage(false);
        setShowLandingPage(true);
    };

    const handleBackFromPricing = () => {
        setShowPricingPage(false);
        setShowLandingPage(true);
    };

    const handleLogin = () => {
        setShowLandingPage(false);
        setShowLoginPage(true);
        // setShowLaunchScreen(true); // LaunchScreen 건너뛰기
        // setIsPlayingBgm(true); // 바로 게임 시작
    };

    const handleSelectPlan = ({ plan, userData }) => {
        // 회원가입 처리 (Signup 페이지로 이동 또는 로직 수행)
        // 여기서는 임시로 Signup 페이지로 이동하도록 설정하거나
        // AuthContext의 signup 기능을 사용할 수 있음

        // setUser(userData);
        // userProfile.setName(userData.name);

        // // 요금제 정보 저장 (추후 사용을 위해)
        // localStorage.setItem('selectedPlan', JSON.stringify(plan));
        setShowPricingPage(false);
        // setShowLaunchScreen(true); // LaunchScreen 건너뛰기
        // setIsPlayingBgm(true); // 바로 게임 시작
    };

    const handleSignup = () => {
        setShowLandingPage(false); // Ensure Landing is off
        setShowLoginPage(false); // Hide Login, falling through to Signup
    };

    const handleStartGame = () => {
        setShowLaunchScreen(false);
        setIsPlayingBgm(true); // 게임 시작 시 BGM 재생
    };

    const handleSignupComplete = (userData) => {
        // setUser(userData);
        // userProfile.set(userData); // 저장
        // Signup 컴포넌트 내부에서 AuthContext login/signup 처리 권장
        // 만약 여기서 처리해야 한다면 로직 수정 필요
        // 현재는 Signup 페이지가 AuthContext와 연동되어 있다고 가정
    };

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        userProfile.setRole(roleId); // 저장
    };

    const setAdminMode = (mode) => {
        setAdminEntryMode(mode);
        try {
            sessionStorage.setItem(ADMIN_ENTRY_MODE_KEY, mode);
        } catch (_) {
            // sessionStorage may be unavailable in restricted browser modes.
        }

        if (mode === ADMIN_ENTRY_MODES.TEST && !selectedRole) {
            handleRoleSelect('technician');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    console.log("App Render State:", { showLandingPage, showPricingPage, showLaunchScreen, user, selectedRole });

    return (
        <LanguageProvider>
        <BrowserRouter>
            <ErrorBoundary>
                <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <BackgroundMusic
                        src="/sounds/안전의_길_Rev.1.mp3"
                        isPlaying={isPlayingBgm}
                        volume={0.3}
                    />

                    {/* 랜딩페이지 관련 코드 (보관용 - 필요시 showLandingPage를 true로 변경하여 활성화 가능) */}
                    {showLandingPage && !user ? (
                        <LandingPage onEnter={handleEnterFromLanding} onShowTeam={handleShowTeam} onLogin={handleLogin} />
                    ) : showTeamPage ? (
                        <TeamPage onBack={handleBackFromTeam} />
                    ) : showPricingPage ? (
                        <PricingPage onSelectPlan={handleSelectPlan} onBack={handleBackFromPricing} />
                    ) : showLaunchScreen ? (
                        <LaunchScreen onStart={handleStartGame} />
                    ) : showLoginPage && !user ? (
                        <Login onSignup={handleSignup} />
                    ) : !user ? (
                        <Signup onSignupComplete={handleSignupComplete} onLogin={handleLogin} />
                    ) : shouldShowAdminModeSelector ? (
                        <AdminModeSelector
                            onSelectAdmin={() => setAdminMode(ADMIN_ENTRY_MODES.ADMIN)}
                            onSelectTest={() => setAdminMode(ADMIN_ENTRY_MODES.TEST)}
                        />
                    ) : !selectedRole && !isAdminAccount ? (
                        <RoleSelector onSelectRole={handleRoleSelect} />
                    ) : (
                        <>
                            {/* 전역 배경 효과 - Dark Theme */}
                            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                                {/* 동적 배경 오브 - 어두운 테마용 */}
                                <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] 
                                  bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-500/20 
                                  rounded-full blur-[140px] animate-float" />
                                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] 
                                  bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/20 
                                  rounded-full blur-[120px] animate-float-slow" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] 
                                  bg-gradient-to-br from-cyan-500/15 via-blue-500/12 to-indigo-500/15 
                                  rounded-full blur-[100px] animate-float"
                                    style={{ animationDelay: '1s', animationDuration: '8s' }} />

                                {/* 미묘한 그리드 패턴 */}
                                <div className="absolute inset-0 opacity-[0.03]"
                                    style={{
                                        backgroundImage: `
                                            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                                            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
                                        `,
                                        backgroundSize: '50px 50px'
                                    }} />
                            </div>

                            <Navigation showAdminLinks={isAdminDashboardMode} />
                            {isAdminTestMode && (
                                <AdminTestToolbar
                                    selectedRole={selectedRole}
                                    onRoleChange={handleRoleSelect}
                                    onAdminMode={() => setAdminMode(ADMIN_ENTRY_MODES.ADMIN)}
                                />
                            )}
                            {isAdminDashboardMode && (
                                <AdminDashboardToolbar
                                    onTestMode={() => setAdminMode(ADMIN_ENTRY_MODES.TEST)}
                                />
                            )}
                            <div className="relative z-10">
                                <Routes>
                                    <Route path="/" element={isAdminDashboardMode ? <Navigate to="/admin" replace /> : <Dashboard role={selectedRole || 'technician'} />} />
                                    <Route path="/daily" element={<DailyQuests role={selectedRole} />} />
                                    <Route path="/weekly" element={<WeeklyQuests role={selectedRole} />} />
                                    <Route path="/monthly" element={<MonthlyQuests role={selectedRole} />} />
                                    <Route path="/shop" element={<Shop />} />
                                    <Route path="/exchange" element={<Exchange />} />
                                    <Route path="/reward-center" element={<RewardCenter />} />
                                    <Route path="/hazard-cycle" element={<HazardCyclePage />} />
                                    <Route path="/hazard-cycle/history" element={<CycleHistoryPage />} />
                                    <Route path="/hazard-ack/:cycleId" element={<HazardCycleAckPage />} />
                                    <Route path="/inventory" element={<Inventory />} />
                                    <Route path="/profile" element={<Profile role={selectedRole} />} />
                                    <Route path="/risk-solution" element={<RiskSolutionPage />} />
                                    <Route path="/alert-management" element={<AlertManagement role={selectedRole} />} />
                                    <Route path="/education" element={<EducationPage />} />
                                    <Route path="/specialization" element={<SpecializationPage role={selectedRole} />} />
                                    <Route path="/specialization/training/:specId" element={<SpecializationTrainingPage />} />
                                    <Route path="/safety-score" element={<SafetyScoreDashboard role={selectedRole} />} />
                                    <Route
                                        path="/admin"
                                        element={isAdminDashboardMode ? <AdminDashboard /> : <Navigate to="/" replace />}
                                    />
                                    <Route
                                        path="/admin/reward-approval"
                                        element={isAdminDashboardMode ? <AdminRewardApproval /> : <Navigate to="/" replace />}
                                    />
                                    <Route path="/work-stop-history" element={<WorkStopHistoryPage />} />
                                    <Route path="/achievements" element={<AchievementPage />} />
                                    <Route path="/season-ranking" element={<SeasonRankingPage />} />
                                    <Route path="/learning-path" element={<LearningPathPage />} />
                                    <Route path="/my-team" element={<TeamDetailPage />} />
                                    <Route path="/team-quest" element={<TeamQuestPage />} />
                                    <Route path="/department-battle" element={<DepartmentBattlePage />} />
                                    <Route path="/daily-briefing" element={<DailyBriefingPage />} />
                                    <Route path="/hazard-heatmap" element={<HazardHeatmapPage />} />
                                    <Route path="/scenario" element={<ScenarioPage />} />
                                    <Route path="/compliance-report" element={<ComplianceReportPage />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </div>

                            {/* [New] 긴급 작업중지 플로팅 버튼 - 모든 화면에서 표시 */}
                            {(!isAdminAccount || isAdminTestMode) && (
                                <>
                                    <WorkStopButton onActivate={() => setIsWorkStopModalOpen(true)} />
                                    <WorkStopReportModal
                                        isOpen={isWorkStopModalOpen}
                                        onClose={() => setIsWorkStopModalOpen(false)}
                                    />
                                </>
                            )}
                            <TeamJoinWizard
                                isOpen={shouldForceTeamJoin}
                                force
                                onComplete={teamGate.refresh}
                            />
                        </>
                    )}
                </div>
            </ErrorBoundary>
        </BrowserRouter>
        </LanguageProvider>
    );
}

export default App;
