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

function App() {
    const [user, setUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 초기화
        initializeUserData();

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

        setLoading(false);
    }, []);

    const handleSignupComplete = () => {
        const savedName = userProfile.getName();
        setUser({ name: savedName });
        // 회원가입 후 역할 선택으로 이동 (자동으로 리렌더링되어 처리됨)
    };

    const handleRoleSelect = (role) => {
        userProfile.setRole(role);
        setSelectedRole(role);
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
                {!user ? (
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
