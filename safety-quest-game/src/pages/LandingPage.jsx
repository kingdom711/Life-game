import React, { useState, useEffect } from 'react';
import safetyEducationVideo from '../assets/안전_교육_영상.mp4';

const LandingPage = ({ onEnter, onShowTeam }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const gameFeatures = [
        {
            icon: '🎯',
            title: '퀘스트 시스템',
            description: '일일·주간·월간 안전 미션을 수행하고 보상을 획득하세요',
            color: '#60a5fa'
        },
        {
            icon: '⭐',
            title: '레벨업 & 경험치',
            description: '안전 활동을 할수록 레벨이 오르고 새로운 능력이 해금됩니다',
            color: '#fbbf24'
        },
        {
            icon: '👕',
            title: '아바타 꾸미기',
            description: '안전모, 조끼, 장비 아이템을 수집하고 나만의 캐릭터를 완성하세요',
            color: '#a78bfa'
        },
        {
            icon: '🏆',
            title: '랭킹 & 경쟁',
            description: '동료들과 안전 점수를 겨루고 우리 현장 안전왕에 도전하세요',
            color: '#34d399'
        }
    ];

    const questExamples = [
        { type: 'Daily', name: '안전모 착용 인증하기', xp: '+50 XP', icon: '🪖' },
        { type: 'Daily', name: 'TBM 참석하기', xp: '+30 XP', icon: '📋' },
        { type: 'Weekly', name: '5일 연속 출석 달성', xp: '+200 XP', icon: '🔥' },
        { type: 'Monthly', name: '무사고 30일 달성', xp: '+1000 XP', icon: '🛡️' }
    ];

    const problems = [
        { icon: '😴', text: '지루하고 반복적인 안전 점검' },
        { icon: '😤', text: '강제로 해야 하는 안전 교육' },
        { icon: '🤷', text: '동기부여 없는 안전 활동' },
        { icon: '📉', text: '낮은 참여율과 형식적 보고' }
    ];

    return (
        <div className="landing-page" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            color: 'white',
            overflowX: 'hidden'
        }}>
            {/* Hero Section - 게이미피케이션 메인 */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative'
            }}>
                {/* 배경 파티클 */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(167, 139, 250, 0.15) 0%, transparent 40%)',
                    pointerEvents: 'none'
                }} />

                {/* 플로팅 게임 아이콘 */}
                <div style={{ position: 'absolute', top: '10%', left: '8%', fontSize: '2.5rem', opacity: 0.4, animation: 'float 4s ease-in-out infinite' }}>🎮</div>
                <div style={{ position: 'absolute', top: '20%', right: '10%', fontSize: '2rem', opacity: 0.3, animation: 'float 5s ease-in-out infinite 1s' }}>⭐</div>
                <div style={{ position: 'absolute', bottom: '30%', left: '5%', fontSize: '2rem', opacity: 0.3, animation: 'float 4.5s ease-in-out infinite 0.5s' }}>🏆</div>
                <div style={{ position: 'absolute', bottom: '20%', right: '8%', fontSize: '2.5rem', opacity: 0.4, animation: 'float 5.5s ease-in-out infinite 1.5s' }}>🎯</div>
                <div style={{ position: 'absolute', top: '40%', left: '15%', fontSize: '1.5rem', opacity: 0.25, animation: 'float 6s ease-in-out infinite 2s' }}>💎</div>
                <div style={{ position: 'absolute', top: '60%', right: '15%', fontSize: '1.5rem', opacity: 0.25, animation: 'float 5s ease-in-out infinite 0.8s' }}>🔥</div>

                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'all 0.8s ease-out',
                    maxWidth: '900px'
                }}>
                    {/* 로고/뱃지 */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(167, 139, 250, 0.2) 100%)',
                        border: '2px solid rgba(251, 191, 36, 0.4)',
                        borderRadius: '50px',
                        padding: '0.75rem 1.75rem',
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#fbbf24',
                        marginBottom: '2rem'
                    }}>
                        <img src="/assets/safety_road_logo-removebg-preview.png" alt="안전의 길" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        안전의 길 (Safety Quest)
                    </div>

                    {/* 메인 헤드라인 */}
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: '900',
                        lineHeight: 1.2,
                        marginBottom: '1.5rem',
                        textShadow: '0 4px 30px rgba(0,0,0,0.3)'
                    }}>
                        <span style={{ color: '#94a3b8' }}>안전관리가</span><br />
                        <span style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ef4444 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>게임이 되는 순간</span>
                    </h1>

                    {/* 서브 헤드라인 */}
                    <p style={{
                        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                        color: '#e2e8f0',
                        maxWidth: '700px',
                        margin: '0 auto 2.5rem',
                        lineHeight: 1.8,
                        fontWeight: '500'
                    }}>
                        <strong style={{ color: '#fbbf24' }}>퀘스트</strong>를 수행하고, <strong style={{ color: '#a78bfa' }}>레벨업</strong>하고, <strong style={{ color: '#34d399' }}>보상</strong>을 받으세요.<br />
                        현장 안전관리를 <strong style={{ color: 'white' }}>자발적으로 모두가 참여</strong>하게 하는<br />
                        <span style={{ color: '#60a5fa' }}>게이미피케이션 플랫폼</span>
                    </p>

                    {/* 안전 교육 영상 */}
                    <div style={{
                        marginBottom: '2.5rem',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem'
                    }}>
                        <video
                            src={safetyEducationVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                                width: '100%',
                                display: 'block'
                            }}
                        />
                    </div>

                    {/* 미니 스탯 카드 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        marginBottom: '3rem',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { icon: '🎯', label: '일일 퀘스트', value: '5+' },
                            { icon: '⭐', label: '레벨 시스템', value: '50 LV' },
                            { icon: '👕', label: '수집 아이템', value: '100+' }
                        ].map((stat, index) => (
                            <div key={index} style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '1rem 1.5rem',
                                textAlign: 'center',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                                <div style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: '800' }}>{stat.value}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* CTA 버튼 */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={onEnter}
                            style={{
                                padding: '1.25rem 3rem',
                                fontSize: '1.2rem',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                color: '#1a1a2e',
                                border: 'none',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                boxShadow: '0 8px 30px rgba(251, 191, 36, 0.4)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                                e.target.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 8px 30px rgba(251, 191, 36, 0.4)';
                            }}
                        >
                            🎮 게임 시작하기
                        </button>
                        <button
                            style={{
                                padding: '1.25rem 2.5rem',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                            }}
                        >
                            📖 게임 소개 보기
                        </button>
                    </div>
                </div>
            </section>

            {/* Problem Section - 기존 안전관리의 문제 */}
            <section style={{
                padding: '6rem 2rem',
                background: 'linear-gradient(180deg, #0f3460 0%, #1a1a2e 100%)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '50px',
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.9rem',
                        color: '#fca5a5',
                        marginBottom: '1.5rem'
                    }}>
                        😫 기존 안전관리의 문제
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        color: 'white'
                    }}>
                        왜 안전관리는 항상<br />
                        <span style={{ color: '#f87171' }}>"억지로" 해야 할까요?</span>
                    </h2>

                    <p style={{ color: '#94a3b8', marginBottom: '3rem', fontSize: '1.1rem' }}>
                        강제로 시키면 형식적으로만 하게 됩니다
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {problems.map((problem, index) => (
                            <div key={index} style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '16px',
                                padding: '2rem 1.5rem',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{problem.icon}</div>
                                <p style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: '500', margin: 0 }}>
                                    {problem.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution Section - 게이미피케이션 소개 */}
            <section style={{
                padding: '6rem 2rem',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '50px',
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.9rem',
                        color: '#86efac',
                        marginBottom: '1.5rem'
                    }}>
                        ✨ 해결책: 게이미피케이션
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        color: 'white'
                    }}>
                        <span style={{ color: '#fbbf24' }}>게임처럼</span> 재미있게,<br />
                        <span style={{ color: '#34d399' }}>자발적으로</span> 참여하게
                    </h2>

                    <p style={{ color: '#94a3b8', marginBottom: '3rem', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        퀘스트를 수행하면 경험치와 보상을 얻고,<br />
                        레벨업하면서 아바타를 성장시키세요
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {gameFeatures.map((feature, index) => (
                            <div key={index} style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: `2px solid ${feature.color}33`,
                                borderRadius: '20px',
                                padding: '2rem',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                cursor: 'default'
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = `${feature.color}15`;
                                    e.currentTarget.style.borderColor = `${feature.color}66`;
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.borderColor = `${feature.color}33`;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}>
                                <div style={{
                                    width: '70px',
                                    height: '70px',
                                    background: `${feature.color}20`,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    margin: '0 auto 1rem',
                                    border: `2px solid ${feature.color}40`
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{
                                    color: feature.color,
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    marginBottom: '0.75rem'
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    color: '#94a3b8',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.6,
                                    margin: 0
                                }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quest Examples Section */}
            <section style={{
                padding: '6rem 2rem',
                background: 'linear-gradient(180deg, #16213e 0%, #0f3460 100%)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(96, 165, 250, 0.15)',
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                        borderRadius: '50px',
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.9rem',
                        color: '#60a5fa',
                        marginBottom: '1.5rem'
                    }}>
                        🎯 퀘스트 시스템
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        color: 'white'
                    }}>
                        매일 새로운 <span style={{ color: '#60a5fa' }}>안전 미션</span>을 수행하세요
                    </h2>

                    <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>
                        일일·주간·월간 퀘스트로 꾸준한 안전 습관을 만들어갑니다
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {questExamples.map((quest, index) => (
                            <div key={index} style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '1.25rem 2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.transform = 'translateX(10px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '2rem' }}>{quest.icon}</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{
                                            background: quest.type === 'Daily' ? '#60a5fa' : quest.type === 'Weekly' ? '#a78bfa' : '#fbbf24',
                                            color: '#1a1a2e',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '50px',
                                            marginRight: '0.5rem'
                                        }}>
                                            {quest.type}
                                        </span>
                                        <span style={{ color: 'white', fontWeight: '600' }}>{quest.name}</span>
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(251, 191, 36, 0.2)',
                                    color: '#fbbf24',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '50px',
                                    fontWeight: '700',
                                    fontSize: '0.9rem'
                                }}>
                                    {quest.xp}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Avatar & Items Section */}
            <section style={{
                padding: '6rem 2rem',
                background: 'linear-gradient(180deg, #0f3460 0%, #1a1a2e 100%)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(167, 139, 250, 0.15)',
                        border: '1px solid rgba(167, 139, 250, 0.3)',
                        borderRadius: '50px',
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.9rem',
                        color: '#a78bfa',
                        marginBottom: '1.5rem'
                    }}>
                        👕 아바타 & 아이템
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        color: 'white'
                    }}>
                        <span style={{ color: '#a78bfa' }}>나만의 캐릭터</span>를 꾸미세요
                    </h2>

                    <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>
                        안전 장비 아이템을 수집하고 레어·에픽·레전더리 등급에 도전하세요
                    </p>

                    {/* 아이템 등급 카드 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        {[
                            { grade: 'Common', color: '#9ca3af', icon: '🪖', name: '기본 안전모' },
                            { grade: 'Rare', color: '#60a5fa', icon: '🦺', name: '형광 조끼' },
                            { grade: 'Epic', color: '#a78bfa', icon: '🥾', name: '안전화' },
                            { grade: 'Legendary', color: '#fbbf24', icon: '👑', name: '골드 헬멧' }
                        ].map((item, index) => (
                            <div key={index} style={{
                                background: `${item.color}10`,
                                border: `2px solid ${item.color}40`,
                                borderRadius: '16px',
                                padding: '1.5rem 1rem',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.borderColor = item.color;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = `${item.color}40`;
                                }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                                <div style={{ color: item.color, fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                    {item.grade}
                                </div>
                                <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '600' }}>
                                    {item.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section style={{
                padding: '6rem 2rem',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                        fontWeight: '800',
                        marginBottom: '3rem',
                        color: 'white'
                    }}>
                        왜 <span style={{ color: '#34d399' }}>안전의 길</span>인가요?
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {[
                            {
                                icon: '🎮',
                                title: '재미있는 참여',
                                desc: '게임처럼 즐기면서 자연스럽게 안전 습관이 형성됩니다',
                                color: '#fbbf24'
                            },
                            {
                                icon: '📈',
                                title: '높은 참여율',
                                desc: '강제가 아닌 자발적 참여로 실질적인 안전 문화가 정착됩니다',
                                color: '#34d399'
                            },
                            {
                                icon: '🏅',
                                title: '즉각적 보상',
                                desc: '안전 활동에 대한 즉각적인 보상으로 동기부여가 유지됩니다',
                                color: '#60a5fa'
                            }
                        ].map((benefit, index) => (
                            <div key={index} style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: `1px solid ${benefit.color}33`,
                                borderRadius: '20px',
                                padding: '2rem',
                                textAlign: 'left'
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{benefit.icon}</div>
                                <h3 style={{ color: benefit.color, fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                                    {benefit.title}
                                </h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                    {benefit.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section style={{
                padding: '6rem 2rem',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ef4444 100%)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        color: '#1a1a2e'
                    }}>
                        안전의 길을 시작하세요!
                    </h2>
                    <p style={{
                        color: 'rgba(26, 26, 46, 0.8)',
                        fontSize: '1.1rem',
                        marginBottom: '2rem',
                        fontWeight: '500'
                    }}>
                        퀘스트를 수행하고, 레벨업하고, 보상을 받으세요.<br />
                        현장 안전관리가 게임처럼 재미있어집니다.
                    </p>
                    <button
                        onClick={onEnter}
                        style={{
                            padding: '1.25rem 3.5rem',
                            fontSize: '1.3rem',
                            fontWeight: '800',
                            background: '#1a1a2e',
                            color: '#fbbf24',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.3s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-3px) scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0) scale(1)';
                        }}
                    >
                        🚀 지금 시작하기
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '3rem 2rem',
                background: '#0f172a',
                color: '#64748b',
                textAlign: 'center',
                fontSize: '0.85rem',
                borderTop: '1px solid #1e293b'
            }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <img src="/assets/safety_road_logo-removebg-preview.png" alt="안전의 길" style={{ width: '32px', height: '32px', objectFit: 'contain', marginRight: '0.5rem' }} />
                    <strong style={{ color: '#fbbf24', fontSize: '1.1rem' }}>안전의 길</strong>
                    <span style={{ color: '#94a3b8' }}> | 게이미피케이션 안전관리 플랫폼</span>
                </div>

                {/* 팀 소개 버튼 */}
                <button
                    onClick={onShowTeam}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '50px',
                        padding: '0.75rem 1.5rem',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                        e.currentTarget.style.color = '#fbbf24';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.color = '#94a3b8';
                    }}
                >
                    👥 팀 소개 보기
                </button>

                <p style={{ margin: 0 }}>© 2024 Safety Quest. All rights reserved.</p>
            </footer>

            {/* 플로팅 CTA */}
            <button
                onClick={onEnter}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: '#1a1a2e',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 30px rgba(251, 191, 36, 0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    animation: 'pulse 2s infinite'
                }}
            >
                🎮 게임 시작
            </button>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 8px 30px rgba(251, 191, 36, 0.5); }
                    50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(251, 191, 36, 0.6); }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
