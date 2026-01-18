import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import BackgroundMusic from './BackgroundMusic';
import RoleSelector from './RoleSelector';
import { checkAndResetQuests } from '../utils/questManager';
import { checkAndRunMigration } from '../utils/dataMigration';

const GameLayout = ({ role, setRole }) => {
    const location = useLocation();

    // Game initialization logic
    useEffect(() => {
        const initGame = async () => {
            try {
                // Migration check
                checkAndRunMigration();
                // Quest reset check
                checkAndResetQuests();
            } catch (error) {
                console.error("Game initialization failed:", error);
            }
        };
        initGame();
    }, []);

    // If no role is selected, show RoleSelector
    // We check if the current route is NOT already role-selection related to avoid loops, 
    // though here we are replacing Outlet with RoleSelector so route path doesn't change visually 
    // but URL remains whatever it was (e.g. /game).
    if (!role) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                 <RoleSelector onSelectRole={(newRole) => {
                     setRole(newRole);
                     // userProfile.setRole is handled inside RoleSelector or App?
                     // Original App.jsx: handleRoleSelect called setRole AND userProfile.setRole
                     // We'll assume setRole passed from App handles the storage update or we do it there.
                 }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative bg-slate-900 text-white overflow-x-hidden">
            <BackgroundMusic
                src="/sounds/안전의_길_Rev.1.mp3"
                isPlaying={true}
                volume={0.3}
            />

            {/* Global Background Effects - Dark Theme */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Dynamic Background Orbs */}
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

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }} />
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Page Content */}
            <div className="relative z-10 flex-1">
                <Outlet />
            </div>
        </div>
    );
};

export default GameLayout;
