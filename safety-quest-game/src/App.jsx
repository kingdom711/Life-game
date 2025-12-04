import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeUserData, userProfile } from './utils/storage';
import { checkAndResetQuests } from './utils/questManager';

// Pages
import Dashboard from './pages/Dashboard';
import DailyQuests from './pages/DailyQuests';
import WeeklyQuests from './pages/WeeklyQuests';
import MonthlyQuests from './pages/MonthlyQuests';
import Shop from './pages/Shop';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import Signup from './pages/Signup';

// Components
import RoleSelector from './components/RoleSelector';
import Navigation from './components/Navigation';

import LaunchScreen from './pages/LaunchScreen';
import BackgroundMusic from './components/BackgroundMusic';

// ...

function App() {
    const [showLaunchScreen, setShowLaunchScreen] = useState(true);
    const [isPlayingBgm, setIsPlayingBgm] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // ... (useEffect 등 기존 코드 유지)

    const handleStartGame = () => {
        setShowLaunchScreen(false);
        setIsPlayingBgm(true); // 게임 시작 시 BGM 재생
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <BackgroundMusic
                    src="/sounds/안전의길.mp3"
                    isPlaying={isPlayingBgm}
                    volume={0.3}
                />

                {showLaunchScreen ? (
                    <LaunchScreen onStart={handleStartGame} />
                ) : !user ? (
                    <Signup onSignupComplete={handleSignupComplete} />
                ) : !selectedRole ? (
                    <RoleSelector onSelectRole={handleRoleSelect} />
                ) : (
                    <>
                        <Navigation />
                        <Routes>
                            <Route path="/" element={<Dashboard role={selectedRole} />} />
                            <Route path="/daily" element={<DailyQuests role={selectedRole} />} />
                            <Route path="/weekly" element={<WeeklyQuests role={selectedRole} />} />
                            <Route path="/monthly" element={<MonthlyQuests role={selectedRole} />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/profile" element={<Profile role={selectedRole} />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </>
                )}
            </div>
        </BrowserRouter>
    );
}

export default App;
