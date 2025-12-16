import React from 'react';

const TeamPage = ({ onBack }) => {
    const teamMembers = [
        // 대표
        {
            category: 'leadership',
            name: '김도현',
            role: 'CEO & Founder',
            title: '안전의 길 대표',
            image: '👨‍💼',
            description: '15년간 건설·제조업 현장에서 안전관리 실무를 경험한 후, "안전은 재미있어야 지속된다"는 철학으로 안전의 길을 창업. 게이미피케이션을 통한 안전문화 혁신을 이끌고 있습니다.',
            career: [
                '前 삼성물산 안전환경팀 팀장',
                '한국산업안전보건공단 자문위원',
                '서울대학교 산업공학과 졸업'
            ],
            color: '#fbbf24'
        },
        // AI 개발진
        {
            category: 'ai',
            name: '이준혁',
            role: 'CTO',
            title: 'AI 기술총괄',
            image: '👨‍💻',
            description: 'Google AI Research 출신으로 컴퓨터 비전과 자연어처리 분야의 전문가. 안전 현장 이미지 분석 AI 시스템의 핵심 아키텍처를 설계했습니다.',
            career: [
                '前 Google AI Research 시니어 엔지니어',
                'KAIST 인공지능학과 박사',
                'NeurIPS, CVPR 다수 논문 발표'
            ],
            color: '#60a5fa'
        },
        {
            category: 'ai',
            name: '박서연',
            role: 'AI Engineer',
            title: 'MLOps 리드',
            image: '👩‍💻',
            description: '대규모 AI 모델의 배포와 운영을 담당. 실시간 위험 감지 시스템의 안정적인 서비스를 책임지고 있습니다.',
            career: [
                '前 네이버 클로바 ML엔지니어',
                '서울대학교 컴퓨터공학과 석사',
                'AWS Machine Learning 전문가'
            ],
            color: '#60a5fa'
        },
        {
            category: 'ai',
            name: '최민수',
            role: 'AI Engineer',
            title: '데이터 사이언티스트',
            image: '👨‍🔬',
            description: '산업 현장 데이터 분석 전문가. 수만 건의 안전사고 데이터를 분석하여 예방 모델을 개발하고 있습니다.',
            career: [
                '前 LG CNS 데이터분석팀',
                '고려대학교 통계학과 석사',
                '한국데이터사이언스학회 정회원'
            ],
            color: '#60a5fa'
        },
        // 산업안전보건법 컨설팅
        {
            category: 'safety',
            name: '정현우',
            role: 'Safety Director',
            title: '산업안전 총괄',
            image: '🦺',
            description: '산업안전기사, 건설안전기사 자격 보유. 20년 이상의 현장 경험을 바탕으로 실효성 있는 안전관리 체계를 설계합니다.',
            career: [
                '前 현대건설 안전관리팀 부장',
                '산업안전기사, 건설안전기사',
                '고용노동부 안전보건 우수사업장 심사위원'
            ],
            color: '#34d399'
        },
        {
            category: 'safety',
            name: '한미영',
            role: 'Safety Consultant',
            title: '보건관리 전문가',
            image: '👩‍⚕️',
            description: '산업보건 분야 전문가로 작업환경 측정, 건강검진 관리, 직업병 예방 프로그램을 담당하고 있습니다.',
            career: [
                '前 삼성전자 산업보건팀',
                '산업위생관리기사, 간호사',
                '대한산업보건협회 자문위원'
            ],
            color: '#34d399'
        },
        {
            category: 'safety',
            name: '윤재호',
            role: 'Safety Consultant',
            title: '법정점검 전문가',
            image: '📋',
            description: '법정 자율점검표 전산화의 핵심 담당자. 건설업, 제조업 등 업종별 맞춤 체크리스트를 개발하고 있습니다.',
            career: [
                '前 한국산업안전보건공단 연구원',
                '산업안전지도사',
                '서울과학기술대학교 안전공학과 겸임교수'
            ],
            color: '#34d399'
        },
        // 중대재해처벌법 컨설팅
        {
            category: 'legal',
            name: '송지훈',
            role: 'Legal Advisor',
            title: '중대재해 법률 자문',
            image: '⚖️',
            description: '중대재해처벌법 전문 변호사로 기업의 법적 리스크 관리와 경영책임자 보호 전략을 자문합니다. 다수의 산업재해 소송 경험 보유.',
            career: [
                '법무법인 율촌 파트너 변호사',
                '서울대학교 법학전문대학원 졸업',
                '고용노동부 중대재해처벌법 해설위원'
            ],
            color: '#a78bfa'
        }
    ];

    const categories = [
        { id: 'leadership', name: '경영진', icon: '👔', color: '#fbbf24' },
        { id: 'ai', name: 'AI 개발팀', icon: '🤖', color: '#60a5fa' },
        { id: 'safety', name: '산업안전보건 컨설팅', icon: '🦺', color: '#34d399' },
        { id: 'legal', name: '중대재해법 컨설팅', icon: '⚖️', color: '#a78bfa' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            color: 'white',
            padding: '2rem'
        }}>
            {/* 헤더 */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '50px',
                        padding: '0.75rem 1.5rem',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        marginBottom: '2rem',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                >
                    ← 돌아가기
                </button>

                {/* 페이지 타이틀 */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(167, 139, 250, 0.2) 100%)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        borderRadius: '50px',
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.9rem',
                        color: '#fbbf24',
                        marginBottom: '1.5rem'
                    }}>
                        👥 Our Team
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #a78bfa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        안전의 길을 만드는 사람들
                    </h1>
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '1.1rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.7
                    }}>
                        AI 기술과 안전 전문성을 결합하여<br />
                        더 안전한 현장을 만들어가는 팀입니다
                    </p>
                </div>

                {/* 카테고리별 팀원 */}
                {categories.map((category) => (
                    <div key={category.id} style={{ marginBottom: '4rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1.5rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: category.color,
                                margin: 0
                            }}>
                                {category.name}
                            </h2>
                            <div style={{
                                flex: 1,
                                height: '2px',
                                background: `linear-gradient(90deg, ${category.color}40 0%, transparent 100%)`,
                                marginLeft: '1rem'
                            }} />
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {teamMembers
                                .filter((member) => member.category === category.id)
                                .map((member, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: `1px solid ${member.color}33`,
                                            borderRadius: '20px',
                                            padding: '2rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = `${member.color}10`;
                                            e.currentTarget.style.borderColor = `${member.color}66`;
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                            e.currentTarget.style.borderColor = `${member.color}33`;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        {/* 프로필 헤더 */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            marginBottom: '1.25rem'
                                        }}>
                                            <div style={{
                                                width: '70px',
                                                height: '70px',
                                                background: `${member.color}20`,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '2rem',
                                                border: `2px solid ${member.color}40`
                                            }}>
                                                {member.image}
                                            </div>
                                            <div>
                                                <h3 style={{
                                                    color: 'white',
                                                    fontSize: '1.25rem',
                                                    fontWeight: '700',
                                                    margin: 0,
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {member.name}
                                                </h3>
                                                <p style={{
                                                    color: member.color,
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    margin: 0,
                                                    marginBottom: '0.15rem'
                                                }}>
                                                    {member.role}
                                                </p>
                                                <p style={{
                                                    color: '#94a3b8',
                                                    fontSize: '0.8rem',
                                                    margin: 0
                                                }}>
                                                    {member.title}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 설명 */}
                                        <p style={{
                                            color: '#cbd5e1',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.6,
                                            marginBottom: '1.25rem'
                                        }}>
                                            {member.description}
                                        </p>

                                        {/* 경력 */}
                                        <div style={{
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: '12px',
                                            padding: '1rem'
                                        }}>
                                            <div style={{
                                                color: '#64748b',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                marginBottom: '0.5rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Career
                                            </div>
                                            {member.career.map((item, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        color: '#94a3b8',
                                                        fontSize: '0.8rem',
                                                        marginBottom: i < member.career.length - 1 ? '0.35rem' : 0,
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <span style={{ color: member.color }}>•</span>
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}

                {/* 하단 CTA */}
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    marginTop: '2rem'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: 'white'
                    }}>
                        함께 안전한 현장을 만들어가요
                    </h3>
                    <p style={{
                        color: '#94a3b8',
                        marginBottom: '2rem'
                    }}>
                        안전의 길 팀과 함께 게이미피케이션 안전관리를 시작하세요
                    </p>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: '#1a1a2e',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 30px rgba(251, 191, 36, 0.4)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 8px 30px rgba(251, 191, 36, 0.4)';
                        }}
                    >
                        🎮 게임 시작하기
                    </button>
                </div>
            </div>

            {/* 푸터 */}
            <footer style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.85rem',
                marginTop: '3rem'
            }}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <img src="/assets/safety_road_logo-removebg-preview.png" alt="안전의 길" style={{ width: '28px', height: '28px', objectFit: 'contain', marginRight: '0.5rem' }} />
                    <strong style={{ color: '#fbbf24' }}>안전의 길</strong>
                    <span style={{ color: '#94a3b8' }}> | 게이미피케이션 안전관리 플랫폼</span>
                </div>
                <p style={{ margin: 0 }}>© 2024 Safety Quest. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default TeamPage;

