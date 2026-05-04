import { useState, useEffect } from 'react';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';
import { userProfile } from '../utils/storage';
import { analytics } from '../utils/analytics';
import authApi from '../api/authApi';
import AuthLayout from '../components/auth/AuthLayout';
import IconInput from '../components/auth/IconInput';

function Signup({ onSignupComplete, onLogin }) {
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: '',
        isOver14: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
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

        if (!formData.nickname || !formData.email || !formData.password) {
            setError('모든 필수 정보를 입력해주세요.');
            return;
        }

        if (formData.password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        if (!formData.isOver14) {
            setError('만 14세 이상이어야 가입할 수 있습니다.');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.signup({
                email: formData.email,
                password: formData.password,
                name: formData.nickname
            });

            userProfile.setName(formData.nickname);
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
        <AuthLayout>
            <section className="auth-card" aria-labelledby="signup-title">
                <div className="auth-card__label">NEW AGENT REGISTRATION</div>
                <h1 id="signup-title" className="auth-card__title">회원가입</h1>
                <p className="auth-card__subtitle">
                    안전관리 작전에 합류할 신원 정보를 입력하세요
                </p>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="auth-form__error" aria-live="polite">
                        {error && (
                            <div className="auth-form__error-message" role="alert">
                                <AlertCircle size={16} strokeWidth={2} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <IconInput
                        id="signup-nickname"
                        label="닉네임"
                        icon={User}
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        placeholder="게임에서 사용할 닉네임"
                        required
                    />

                    <IconInput
                        id="signup-email"
                        label="이메일 ID"
                        icon={Mail}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        required
                    />

                    <IconInput
                        id="signup-password"
                        label="비밀번호 (6자 이상)"
                        icon={Lock}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="비밀번호 입력"
                        required
                    />

                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 0.875rem',
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(71, 85, 105, 0.4)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)'
                        }}
                    >
                        <input
                            type="checkbox"
                            name="isOver14"
                            checked={formData.isOver14}
                            onChange={handleChange}
                            style={{ width: 18, height: 18, minHeight: 18, accentColor: 'var(--color-warning-light)' }}
                        />
                        <span>[필수] 만 14세 이상입니다</span>
                    </label>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="auth-form__submit"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                가입 처리 중...
                            </>
                        ) : (
                            '회원가입 완료'
                        )}
                    </button>

                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                        포인트 보상 수령 시 본인 인증 및 실명 확인 절차가 추가로 요구됩니다.
                    </p>

                    <div className="auth-form__footer">
                        이미 계정이 있으신가요?
                        <button
                            type="button"
                            onClick={onLogin}
                            className="auth-form__link"
                        >
                            로그인하기
                        </button>
                    </div>
                </form>
            </section>
        </AuthLayout>
    );
}

export default Signup;
