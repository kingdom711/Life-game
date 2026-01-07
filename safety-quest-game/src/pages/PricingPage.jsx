import React, { useState, useEffect } from 'react';
import { analytics } from '../utils/analytics';

const PricingPage = ({ onSelectPlan, onBack }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [companySize, setCompanySize] = useState('');
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        adminName: '',
        email: '',
        password: '',
        phone: '',
        employeeCount: '',
        agreeTerms: false
    });
    const [error, setError] = useState('');

    useEffect(() => {
        // GA4 페이지뷰 추적
        analytics.pageView('/pricing', 'Pricing Page - 요금제');
    }, []);

    const plans = [
        {
            id: 'free',
            name: '개인',
            price: '무료',
            priceValue: 0,
            period: '',
            minUsers: 1,
            maxUsers: 1,
            color: '#9ca3af',
            icon: '👤',
            description: '개인 사용자를 위한 무료 플랜',
            features: [
                '기본 퀘스트 시스템',
                '개인 아바타 꾸미기',
                '기본 아이템 수집',
                '일일 퀘스트 참여',
                '개인 랭킹 확인'
            ],
            limitations: [
                '팀 기능 없음',
                '관리자 대시보드 없음',
                '분석 리포트 없음'
            ],
            badge: null
        },
        {
            id: 'lite',
            name: 'LITE',
            price: '₩49,000',
            priceValue: 49000,
            period: '/월',
            minUsers: 50,
            maxUsers: 199,
            color: '#60a5fa',
            icon: '🏢',
            description: '50인 이상 중소기업을 위한 요금제',
            features: [
                '개인 플랜의 모든 기능',
                '팀 퀘스트 시스템',
                '관리자 대시보드',
                '기본 분석 리포트',
                '팀 랭킹 & 경쟁',
                '이메일 지원'
            ],
            limitations: [
                'API 연동 미지원',
                '커스텀 퀘스트 제한'
            ],
            badge: null
        },
        {
            id: 'premium',
            name: 'PREMIUM',
            price: '₩149,000',
            priceValue: 149000,
            period: '/월',
            minUsers: 200,
            maxUsers: 999,
            color: '#a78bfa',
            icon: '🏗️',
            description: '200인 이상 중견기업을 위한 요금제',
            features: [
                'LITE 플랜의 모든 기능',
                '커스텀 퀘스트 생성',
                '고급 분석 & 리포트',
                'API 연동 지원',
                '전담 매니저 배정',
                '우선 기술 지원',
                '현장별 관리'
            ],
            limitations: [],
            badge: '인기',
            badgeColor: '#a78bfa'
        },
        {
            id: 'ultra',
            name: 'ULTRA',
            price: '₩399,000',
            priceValue: 399000,
            period: '/월',
            minUsers: 1000,
            maxUsers: null,
            color: '#fbbf24',
            icon: '🏭',
            description: '1000인 이상 대기업을 위한 요금제',
            features: [
                'PREMIUM 플랜의 모든 기능',
                '무제한 커스텀 퀘스트',
                '전사 통합 대시보드',
                '고급 보안 기능',
                'SSO 연동',
                '온사이트 교육 지원',
                '24/7 전담 지원',
                '맞춤 기능 개발'
            ],
            limitations: [],
            badge: 'Enterprise',
            badgeColor: '#fbbf24'
        }
    ];

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setShowSignupForm(true);

        // GA4 플랜 선택 이벤트
        analytics.conversion.planSelected(plan.id, plan.priceValue);

        // 기업 규모에 맞는 인원수 기본값 설정
        if (plan.id === 'free') {
            setFormData(prev => ({ ...prev, employeeCount: '1' }));
        } else if (plan.id === 'lite') {
            setFormData(prev => ({ ...prev, employeeCount: '50' }));
        } else if (plan.id === 'premium') {
            setFormData(prev => ({ ...prev, employeeCount: '200' }));
        } else if (plan.id === 'ultra') {
            setFormData(prev => ({ ...prev, employeeCount: '1000' }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // 유효성 검사
        if (selectedPlan.id === 'free') {
            if (!formData.adminName || !formData.email || !formData.password) {
                setError('모든 필수 정보를 입력해주세요.');
                return;
            }
        } else {
            if (!formData.companyName || !formData.adminName || !formData.email || !formData.password || !formData.employeeCount) {
                setError('모든 필수 정보를 입력해주세요.');
                return;
            }
        }

        if (!formData.agreeTerms) {
            setError('서비스 이용약관에 동의해주세요.');
            return;
        }

        // 인원수 체크
        const count = parseInt(formData.employeeCount);
        if (selectedPlan.id !== 'free' && (count < selectedPlan.minUsers || (selectedPlan.maxUsers && count > selectedPlan.maxUsers))) {
            setError(`${selectedPlan.name} 요금제는 ${selectedPlan.minUsers}명 ~ ${selectedPlan.maxUsers ? selectedPlan.maxUsers + '명' : '무제한'} 입니다.`);
            return;
        }

        // GA4 가입 완료 이벤트
        analytics.conversion.signupComplete(selectedPlan.id);

        // 회원가입 완료 처리
        onSelectPlan({
            plan: selectedPlan,
            userData: {
                name: formData.adminName,
                companyName: formData.companyName,
                email: formData.email,
                employeeCount: formData.employeeCount
            }
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            color: 'white',
            overflowX: 'hidden'
        }}>
            {/* 헤더 */}
            <header style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1400px',
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
                        fontSize: '0.9rem',
                        fontWeight: '600',
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
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <img src="/assets/safety_road_logo-removebg-preview.png" alt="안전의 길" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    <span style={{ fontWeight: '700', color: '#fbbf24' }}>안전의 길</span>
                </div>
            </header>

            {!showSignupForm ? (
                <>
                    {/* 타이틀 섹션 */}
                    <section style={{
                        textAlign: 'center',
                        padding: '3rem 2rem 4rem'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(251, 191, 36, 0.15)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '50px',
                            padding: '0.5rem 1.5rem',
                            fontSize: '0.9rem',
                            color: '#fbbf24',
                            marginBottom: '1.5rem'
                        }}>
                            💼 B2B 요금제
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: '800',
                            marginBottom: '1rem'
                        }}>
                            <span style={{ color: '#94a3b8' }}>기업 규모에 맞는</span><br />
                            <span style={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>최적의 요금제</span>를 선택하세요
                        </h1>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '1.1rem',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            개인부터 대기업까지, 모든 규모의 조직에 맞는 요금제를 제공합니다.
                        </p>
                    </section>

                    {/* 요금제 카드들 */}
                    <section style={{
                        padding: '0 2rem 6rem',
                        maxWidth: '1400px',
                        margin: '0 auto'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    style={{
                                        background: selectedPlan?.id === plan.id
                                            ? `${plan.color}15`
                                            : 'rgba(255, 255, 255, 0.03)',
                                        border: `2px solid ${selectedPlan?.id === plan.id ? plan.color : plan.color + '40'}`,
                                        borderRadius: '24px',
                                        padding: '2rem',
                                        position: 'relative',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        transform: selectedPlan?.id === plan.id ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                    onClick={() => handlePlanSelect(plan)}
                                    onMouseOver={(e) => {
                                        if (selectedPlan?.id !== plan.id) {
                                            e.currentTarget.style.background = `${plan.color}10`;
                                            e.currentTarget.style.borderColor = plan.color;
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (selectedPlan?.id !== plan.id) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                            e.currentTarget.style.borderColor = `${plan.color}40`;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {/* 뱃지 */}
                                    {plan.badge && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            right: '20px',
                                            background: plan.badgeColor,
                                            color: '#1a1a2e',
                                            padding: '0.4rem 1rem',
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: '800'
                                        }}>
                                            {plan.badge}
                                        </div>
                                    )}

                                    {/* 아이콘 & 이름 */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            background: `${plan.color}20`,
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem'
                                        }}>
                                            {plan.icon}
                                        </div>
                                        <div>
                                            <h3 style={{
                                                color: plan.color,
                                                fontSize: '1.5rem',
                                                fontWeight: '800',
                                                margin: 0
                                            }}>
                                                {plan.name}
                                            </h3>
                                            <p style={{
                                                color: '#64748b',
                                                fontSize: '0.8rem',
                                                margin: 0
                                            }}>
                                                {plan.minUsers === 1 ? '개인 사용자' :
                                                    plan.maxUsers ? `${plan.minUsers}~${plan.maxUsers}명` :
                                                        `${plan.minUsers}명 이상`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 가격 */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <span style={{
                                            fontSize: '2.5rem',
                                            fontWeight: '800',
                                            color: 'white'
                                        }}>
                                            {plan.price}
                                        </span>
                                        <span style={{ color: '#64748b', fontSize: '1rem' }}>
                                            {plan.period}
                                        </span>
                                    </div>

                                    {/* 설명 */}
                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '0.9rem',
                                        marginBottom: '1.5rem',
                                        lineHeight: 1.5
                                    }}>
                                        {plan.description}
                                    </p>

                                    {/* 기능 목록 */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}>
                                                <span style={{ color: '#34d399' }}>✓</span>
                                                <span style={{ color: '#e2e8f0' }}>{feature}</span>
                                            </div>
                                        ))}
                                        {plan.limitations.map((limitation, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}>
                                                <span style={{ color: '#64748b' }}>✗</span>
                                                <span style={{ color: '#64748b' }}>{limitation}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 선택 버튼 */}
                                    <button
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: selectedPlan?.id === plan.id
                                                ? plan.color
                                                : 'transparent',
                                            border: `2px solid ${plan.color}`,
                                            borderRadius: '12px',
                                            color: selectedPlan?.id === plan.id
                                                ? '#1a1a2e'
                                                : plan.color,
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = plan.color;
                                            e.currentTarget.style.color = '#1a1a2e';
                                        }}
                                        onMouseOut={(e) => {
                                            if (selectedPlan?.id !== plan.id) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = plan.color;
                                            }
                                        }}
                                    >
                                        {plan.id === 'free' ? '무료로 시작하기' : '선택하기'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ 섹션 */}
                    <section style={{
                        padding: '4rem 2rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            marginBottom: '2rem',
                            color: 'white'
                        }}>
                            자주 묻는 질문
                        </h2>
                        <div style={{
                            maxWidth: '800px',
                            margin: '0 auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {[
                                { q: '요금제는 언제든 변경할 수 있나요?', a: '네, 언제든지 업그레이드/다운그레이드가 가능합니다. 변경 시점부터 새로운 요금이 적용됩니다.' },
                                { q: '인원수가 변경되면 어떻게 되나요?', a: '인원 변동에 따라 적절한 요금제로 자동 안내해 드리며, 필요시 요금제 변경이 가능합니다.' },
                                { q: '무료 체험 기간이 있나요?', a: '모든 유료 요금제는 14일 무료 체험이 제공됩니다. 체험 기간 동안 모든 기능을 사용해 보실 수 있습니다.' },
                                { q: '결제 방법은 어떤 것이 있나요?', a: '신용카드, 계좌이체, 세금계산서 발행이 모두 가능합니다.' }
                            ].map((faq, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    textAlign: 'left'
                                }}>
                                    <h4 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        Q. {faq.q}
                                    </h4>
                                    <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                                        A. {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                /* 회원가입 폼 */
                <section style={{
                    padding: '2rem',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    <button
                        onClick={() => setShowSignupForm(false)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            marginBottom: '2rem',
                            padding: 0
                        }}
                    >
                        ← 요금제 다시 선택
                    </button>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `2px solid ${selectedPlan.color}40`,
                        borderRadius: '24px',
                        padding: '2rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: `${selectedPlan.color}20`,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            {selectedPlan.icon}
                        </div>
                        <div>
                            <h3 style={{ color: selectedPlan.color, margin: 0, fontWeight: '700' }}>
                                {selectedPlan.name} 요금제
                            </h3>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                                {selectedPlan.price}{selectedPlan.period}
                            </p>
                        </div>
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '1.5rem',
                        color: 'white'
                    }}>
                        {selectedPlan.id === 'free' ? '📝 회원가입' : '📝 기업 정보 입력'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {selectedPlan.id !== 'free' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#e2e8f0',
                                    fontWeight: '600'
                                }}>
                                    회사명 <span style={{ color: '#f87171' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    placeholder="회사명을 입력하세요"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#e2e8f0',
                                fontWeight: '600'
                            }}>
                                {selectedPlan.id === 'free' ? '닉네임' : '담당자명'} <span style={{ color: '#f87171' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="adminName"
                                value={formData.adminName}
                                onChange={handleInputChange}
                                placeholder={selectedPlan.id === 'free' ? '게임에서 사용할 닉네임' : '담당자 이름을 입력하세요'}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#e2e8f0',
                                fontWeight: '600'
                            }}>
                                이메일 <span style={{ color: '#f87171' }}>*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="example@company.com"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#e2e8f0',
                                fontWeight: '600'
                            }}>
                                비밀번호 <span style={{ color: '#f87171' }}>*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="비밀번호를 입력하세요"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        {selectedPlan.id !== 'free' && (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        color: '#e2e8f0',
                                        fontWeight: '600'
                                    }}>
                                        연락처
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="010-0000-0000"
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        color: '#e2e8f0',
                                        fontWeight: '600'
                                    }}>
                                        예상 사용 인원 <span style={{ color: '#f87171' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="employeeCount"
                                        value={formData.employeeCount}
                                        onChange={handleInputChange}
                                        placeholder="사용 인원수를 입력하세요"
                                        min={selectedPlan.minUsers}
                                        max={selectedPlan.maxUsers || 99999}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                        {selectedPlan.name} 요금제: {selectedPlan.minUsers}명 ~ {selectedPlan.maxUsers ? selectedPlan.maxUsers + '명' : '무제한'}
                                    </p>
                                </div>
                            </>
                        )}

                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '12px'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        marginTop: '2px'
                                    }}
                                />
                                <span style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    <strong>[필수]</strong> 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
                                    {selectedPlan.id !== 'free' && ' 14일 무료 체험 후 자동 결제됩니다.'}
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '12px',
                                color: '#f87171',
                                marginBottom: '1rem',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                background: `linear-gradient(135deg, ${selectedPlan.color} 0%, ${selectedPlan.color}dd 100%)`,
                                border: 'none',
                                borderRadius: '12px',
                                color: '#1a1a2e',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 8px 30px ${selectedPlan.color}50`;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {selectedPlan.id === 'free' ? '🎮 무료로 시작하기' : '🚀 14일 무료 체험 시작'}
                        </button>
                    </form>
                </section>
            )}

            {/* 푸터 */}
            <footer style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.85rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <p>© 2024 Safety Quest. All rights reserved.</p>
                <p style={{ marginTop: '0.5rem' }}>
                    문의: support@safetyquest.kr | 02-0000-0000
                </p>
            </footer>
        </div>
    );
};

export default PricingPage;

