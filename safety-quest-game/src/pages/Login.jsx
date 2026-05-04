import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import IconInput from '../components/auth/IconInput';

const Login = ({ onSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            await login({ username: email, password });
        } catch (err) {
            setLoginError(err.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <section className="auth-card" aria-labelledby="login-title">
                <div className="auth-card__label">AGENT LOGIN</div>
                <h1 id="login-title" className="auth-card__title">로그인</h1>
                <p className="auth-card__subtitle">
                    안전 퀘스트를 계속하려면 신원을 확인해주세요
                </p>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="auth-form__error" aria-live="polite">
                        {loginError && (
                            <div className="auth-form__error-message" role="alert">
                                <AlertCircle size={16} strokeWidth={2} />
                                <span>{loginError}</span>
                            </div>
                        )}
                    </div>

                    <IconInput
                        id="login-email"
                        label="아이디 (이메일)"
                        icon={Mail}
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="아이디 또는 이메일"
                        required
                    />

                    <IconInput
                        id="login-password"
                        label="비밀번호"
                        icon={Lock}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호 입력"
                        required
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="auth-form__submit"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                인증 중...
                            </>
                        ) : (
                            '로그인'
                        )}
                    </button>

                    <div className="auth-form__footer">
                        계정이 없으신가요?
                        <button
                            type="button"
                            onClick={onSignup}
                            className="auth-form__link"
                        >
                            회원가입
                        </button>
                    </div>
                </form>
            </section>
        </AuthLayout>
    );
};

export default Login;
