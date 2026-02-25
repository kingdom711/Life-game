import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AUTH_BYPASS_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DISABLE_AUTH === 'true';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (AUTH_BYPASS_ENABLED) {
        return children ? children : <Outlet />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="spinner"></div>
                    <p className="text-slate-400 animate-pulse">Loading safety data...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
