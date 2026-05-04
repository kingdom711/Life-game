import React from 'react';
import { Users, ShieldOff } from 'lucide-react';

const ROLES = [
    { id: 'safety_manager', name: '안전관리자', code: 'SM-01', image: '/role_safety_manager.png' },
    { id: 'supervisor',     name: '현장 감독',   code: 'SV-02', image: '/role_supervisor.png' },
    { id: 'technician',     name: '기술자',     code: 'TC-03', image: '/role_technician.png' },
];

const STATS = [
    {
        icon: Users,
        value: '1,247',
        unit: '명',
        label: '오늘의 안전 참여자',
    },
    {
        icon: ShieldOff,
        value: '89',
        unit: '개',
        label: '제거한 위험요인',
    },
];

const AuthSidePanel = () => {
    return (
        <aside className="auth-side-panel" aria-label="오늘의 작전 브리핑">
            <div className="auth-side-panel__header">
                <span className="auth-side-panel__header-text">Today's Mission Briefing</span>
                <span className="auth-side-panel__header-line" />
            </div>

            <div className="auth-side-panel__roles">
                {ROLES.map((role) => (
                    <div key={role.id} className="auth-side-panel__role">
                        <img
                            src={role.image}
                            alt={role.name}
                            className="auth-side-panel__role-image"
                            loading="lazy"
                        />
                        <div className="auth-side-panel__role-name">{role.name}</div>
                        <div className="auth-side-panel__role-id">{role.code}</div>
                    </div>
                ))}
            </div>

            <div className="auth-side-panel__stats">
                {STATS.map((stat) => (
                    <div key={stat.label} className="auth-side-panel__stat">
                        <div className="auth-side-panel__stat-value">
                            {stat.value}
                            <span className="auth-side-panel__stat-value-unit">{stat.unit}</span>
                        </div>
                        <div className="auth-side-panel__stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default AuthSidePanel;
