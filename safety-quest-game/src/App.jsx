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
import CycleHistoryPage from './pages/CycleHistoryPage';
import SafetyScoreDashboard from './pages/SafetyScoreDashboard';
import AdminRewardApproval from './pages/AdminRewardApproval';
import WorkStopHistoryPage from './pages/WorkStopHistoryPage'; // [New] 작업중지 이력

// Components
import RoleSelector from './components/RoleSelector';
import Navigation from './components/Navigation';
import WorkStopButton from './components/WorkStopButton'; // [New] 작업중지 플로팅 버튼
import WorkStopReportModal from './components/WorkStopReportModal'; // [New] 작업중지 신고 모달

import LaunchScreen from './pages/LaunchScreen';
import BackgroundMusic from './components/BackgroundMusic';
import ErrorBoundary from './components/ErrorBoundary';

// ...

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
    const [isWorkStopModalOpen, setIsWorkStopModalOpen] = useState(false); // [New] 작업중지 모달
    // const [loading, setLoading] = useState(true); // AuthContext로 대체

    const { user, loading } = useAuth();

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
                    setSelectedRole(null);
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
    }, [loading, user]);

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
        // if (userData.companyName) {
        //     localStorage.setItem('companyName', userData.companyName);
        // }

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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    console.log("App Render State:", { showLandingPage, showPricingPage, showLaunchScreen, user, selectedRole });

    return (
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
                    ) : !selectedRole ? (
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

                            <Navigation />
                            <div className="relative z-10">
                                <Routes>
                                    <Route path="/" element={<Dashboard role={selectedRole} />} />
                                    <Route path="/daily" element={<DailyQuests role={selectedRole} />} />
                                    <Route path="/weekly" element={<WeeklyQuests role={selectedRole} />} />
                                    <Route path="/monthly" element={<MonthlyQuests role={selectedRole} />} />
                                    <Route path="/shop" element={<Shop />} />
                                    <Route path="/exchange" element={<Exchange />} />
                                    <Route path="/reward-center" element={<RewardCenter />} />
                                    <Route path="/hazard-cycle" element={<HazardCyclePage />} />
                                    <Route path="/hazard-cycle/history" element={<CycleHistoryPage />} />
                                    <Route path="/inventory" element={<Inventory />} />
                                    <Route path="/profile" element={<Profile role={selectedRole} />} />
                                    <Route path="/risk-solution" element={<RiskSolutionPage />} />
                                    <Route path="/alert-management" element={<AlertManagement role={selectedRole} />} />
                                    <Route path="/education" element={<EducationPage />} />
                                    <Route path="/specialization" element={<SpecializationPage role={selectedRole} />} />
                                    <Route path="/specialization/training/:specId" element={<SpecializationTrainingPage />} />
                                    <Route path="/safety-score" element={<SafetyScoreDashboard role={selectedRole} />} />
                                    <Route path="/admin/reward-approval" element={<AdminRewardApproval />} />
                                    <Route path="/work-stop-history" element={<WorkStopHistoryPage />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </div>

                            {/* [New] 긴급 작업중지 플로팅 버튼 - 모든 화면에서 표시 */}
                            <WorkStopButton onActivate={() => setIsWorkStopModalOpen(true)} />
                            <WorkStopReportModal
                                isOpen={isWorkStopModalOpen}
                                onClose={() => setIsWorkStopModalOpen(false)}
                            />
                        </>
                    )}
                </div>
            </ErrorBoundary>
        </BrowserRouter>
    );
}

export default App;
