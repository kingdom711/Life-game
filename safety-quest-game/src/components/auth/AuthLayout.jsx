import React from 'react';
import AuthSidePanel from './AuthSidePanel';

const AuthLayout = ({ children, showSidePanel = true }) => {
    return (
        <div className="auth-layout">
            <header className="auth-layout__header">
                <a href="/" className="auth-layout__brand">
                    <img
                        src="/safety_road_logo.png"
                        alt="Safety Quest"
                        className="auth-layout__brand-logo"
                    />
                    <div className="auth-layout__brand-text">
                        <span className="auth-layout__brand-name">Safety Quest</span>
                        <span className="auth-layout__brand-sub">Mission Control</span>
                    </div>
                </a>
            </header>

            <main className="auth-layout__main">
                {children}
                {showSidePanel && <AuthSidePanel />}
            </main>

            <footer className="auth-layout__footer">
                <span>© 2026 Safety Quest</span>
                <a href="#terms">이용약관</a>
                <span aria-hidden="true">·</span>
                <a href="#privacy">개인정보처리방침</a>
            </footer>
        </div>
    );
};

export default AuthLayout;
