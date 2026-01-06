import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeUserData, userProfile } from './utils/storage';
import { checkAndResetQuests } from './utils/questManager';
import { checkAndRunMigration } from './utils/dataMigration';

// Pages
import Dashboard from './pages/Dashboard';
import DailyQuests from './pages/DailyQuests';
import WeeklyQuests from './pages/WeeklyQuests';
import MonthlyQuests from './pages/MonthlyQuests';
import Shop from './pages/Shop';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import TeamPage from './pages/TeamPage';
import PricingPage from './pages/PricingPage';
import RiskSolutionPage from './pages/RiskSolutionPage';

// Components
import RoleSelector from './components/RoleSelector';
import Navigation from './components/Navigation';

import LaunchScreen from './pages/LaunchScreen';
import BackgroundMusic from './components/BackgroundMusic';
import ErrorBoundary from './components/ErrorBoundary';

// ...

function App() {
    // 랜딩페이지 활성화
    const [showLandingPage, setShowLandingPage] = useState(true);
    const [showTeamPage, setShowTeamPage] = useState(false);
    const [showPricingPage, setShowPricingPage] = useState(false);
    const [showLaunchScreen, setShowLaunchScreen] = useState(false);
    const [isPlayingBgm, setIsPlayingBgm] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(true);

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
                const savedName = userProfile.getName();
                const savedRole = userProfile.getRole();

                if (savedName) {
                    setUser({ name: savedName });
                }

                if (savedRole) {
                    setSelectedRole(savedRole);
                }

                // 기존 사용자는 BGM 자동 재생
                if (savedName && savedRole) {
                    setIsPlayingBgm(true);
                }
            } catch (error) {
                console.error("App initialization failed:", error);
            } finally {
                setLoading(false);
            }
        };

        initApp();
    }, []);

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
        // setShowLaunchScreen(true); // LaunchScreen 건너뛰기
        setIsPlayingBgm(true); // 바로 게임 시작
    };

    const handleSelectPlan = ({ plan, userData }) => {
        // 회원가입 처리
        setUser(userData);
        userProfile.setName(userData.name);

        // 요금제 정보 저장 (추후 사용을 위해)
        localStorage.setItem('selectedPlan', JSON.stringify(plan));
        if (userData.companyName) {
            localStorage.setItem('companyName', userData.companyName);
        }

        setShowPricingPage(false);
        // setShowLaunchScreen(true); // LaunchScreen 건너뛰기
        setIsPlayingBgm(true); // 바로 게임 시작
    };

    const handleStartGame = () => {
        setShowLaunchScreen(false);
        setIsPlayingBgm(true); // 게임 시작 시 BGM 재생
    };

    const handleSignupComplete = (userData) => {
        setUser(userData);
        userProfile.set(userData); // 저장
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
                    {showLandingPage ? (
                        <LandingPage onEnter={handleEnterFromLanding} onShowTeam={handleShowTeam} onLogin={handleLogin} />
                    ) : showTeamPage ? (
                        <TeamPage onBack={handleBackFromTeam} />
                    ) : showPricingPage ? (
                        <PricingPage onSelectPlan={handleSelectPlan} onBack={handleBackFromPricing} />
                    ) : showLaunchScreen ? (
                        <LaunchScreen onStart={handleStartGame} />
                    ) : !user ? (
                        <Signup onSignupComplete={handleSignupComplete} />
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
                                    <Route path="/inventory" element={<Inventory />} />
                                    <Route path="/profile" element={<Profile role={selectedRole} />} />
                                    <Route path="/risk-solution" element={<RiskSolutionPage />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </div>
                        </>
                    )}
                </div>
            </ErrorBoundary>
        </BrowserRouter>
    );
}

export default App;
