import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (authApi.isAuthenticated()) {
                    const response = await authApi.getMe();
                    // Assuming getMe returns { user: ... } or just the user object.
                    // Adjust based on actual API response structure.
                    // Looking at authApi.js, it calls apiClient.get('/auth/me').
                    // Usually this returns the data directly if apiClient handles interception.
                    setUser(response.user || response); 
                }
            } catch (err) {
                console.error("Failed to restore session:", err);
                // If token is invalid, authApi might throw. We should ensure we are logged out.
                // However, we don't want to show an error to the user just because they aren't logged in on first load.
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authApi.login(credentials);
            // response should contain { user, accessToken, ... }
            if (response.user) {
                setUser(response.user);
            } else {
                // If the user object isn't in the immediate response, fetch it
                const userResponse = await authApi.getMe();
                setUser(userResponse.user || userResponse);
            }
            return response;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authApi.logout();
            setUser(null);
        } catch (err) {
            console.error("Logout failed:", err);
            // Force logout on client side even if server fails
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
