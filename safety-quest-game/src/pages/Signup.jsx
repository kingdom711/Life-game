import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userProfile } from '../utils/storage';
import { analytics } from '../utils/analytics';
import authApi from '../api/authApi';

function Signup({ onSignupComplete, onLogin }) {
    // ... existing state ...
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: '',
        isOver14: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // GA4 페이지뷰 추적
        analytics.pageView('/signup', 'Signup - 회원가입');
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 유효성 검사
        if (!formData.nickname || !formData.email || !formData.password) {
            setError('모든 필수 정보를 입력해주세요.');
            return;
        }

        if (formData.password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        if (!formData.isOver14) {
            alert('만 14세 미만은 법정대리인의 동의가 필요합니다.\n보호자와 함께 가입을 진행해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            // 백엔드 API로 회원가입 요청
            const response = await authApi.signup({
                email: formData.email,
                password: formData.password,
                name: formData.nickname
            });

            // localStorage에도 유저 정보 저장 (기존 앱 흐름 유지)
            userProfile.setName(formData.nickname);

            // GA4 회원가입 완료 이벤트
            analytics.conversion.signupComplete('free');

            if (onSignupComplete) {
                onSignupComplete({ name: formData.nickname });
            }
        } catch (err) {
            if (err.message && err.message.includes('이미 존재')) {
                setError('이미 가입된 이메일입니다. 로그인 페이지를 이용해주세요.');
            } else {
                setError(err.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '100vh',
            paddingBottom: 0,
            position: 'relative',
            zIndex: 10
        }}>
            <div className="container" style={{ maxWidth: '400px' }}>
                <div className="card" style={{ background: 'var(--color-surface)', backdropFilter: 'blur(10px)' }}>
                    <div className="card-header text-center">
                        <h1>📝 회원가입</h1>
                        <p className="text-muted">안전관리 퀘스트 게임에 오신 것을 환영합니다</p>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* ... existing fields ... */}
                            <div className="mb-md">
                                <label className="font-bold mb-sm" style={{ display: 'block' }}>닉네임 (필수)</label>
                                <input
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="게임에서 사용할 닉네임"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg-lighter)',
                                        color: 'var(--color-text)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div className="mb-md">
                                <label className="font-bold mb-sm" style={{ display: 'block' }}>이메일 ID (필수)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="example@email.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg-lighter)',
                                        color: 'var(--color-text)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div className="mb-lg">
                                <label className="font-bold mb-sm" style={{ display: 'block' }}>비밀번호 (필수)</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="비밀번호 입력"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg-lighter)',
                                        color: 'var(--color-text)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div className="mb-lg" style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="isOver14"
                                        checked={formData.isOver14}
                                        onChange={handleChange}
                                        style={{ width: '20px', height: '20px', marginRight: '0.5rem' }}
                                    />
                                    <span className="font-medium">[필수] 만 14세 이상입니다</span>
                                </label>
                            </div>

                            {error && (
                                <div className="text-danger text-center mb-md font-bold">
                                    {error}
                                </div>
                            )}

                            <div className="text-center mb-sm">
                                <p style={{ fontSize: '10pt', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    본 앱은 최소한의 정보로 가입을 진행하며,<br />
                                    추후 포인트 보상 수령 시 <strong>[본인 인증 및 실명 확인 절차]</strong>가<br />
                                    추가로 요구됩니다.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}
                            >
                                {isLoading ? '가입 처리 중...' : '회원가입 완료'}
                            </button>
                        </form>
                    </div>

                    <div className="card-footer justify-center border-t border-slate-700/50 pt-4 mt-2 text-center">
                        <p className="text-sm text-slate-400 mb-0">
                            이미 계정이 있으신가요?{' '}
                            <button
                                onClick={onLogin}
                                className="text-blue-400 hover:text-blue-300 font-medium bg-transparent border-none p-0 cursor-pointer underline hover:no-underline"
                            >
                                로그인하기
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
