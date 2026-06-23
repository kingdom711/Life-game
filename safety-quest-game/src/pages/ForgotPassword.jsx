import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Mail } from 'lucide-react';
import authApi from '../api/authApi';
import AuthLayout from '../components/auth/AuthLayout';
import IconInput from '../components/auth/IconInput';

const ForgotPassword = ({ onLogin }) => {
    const params = useMemo(() => new URLSearchParams(window.location.search), []);
    const [email, setEmail] = useState(params.get('email') || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const requestReset = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!email.trim() || !newPassword) {
            setError('이메일과 새 비밀번호를 입력해주세요.');
            return;
        }

        if (newPassword.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('새 비밀번호가 서로 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        try {
            await authApi.requestPasswordReset({
                email: email.trim(),
                newPassword,
            });
            setMessage('비밀번호 변경 요청이 접수되었습니다. 관리자가 승인하면 새 비밀번호로 로그인할 수 있습니다.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || '비밀번호 변경 요청에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <section className="auth-card" aria-labelledby="forgot-password-title">
                <div className="auth-card__label">PASSWORD RESET</div>
                <h1 id="forgot-password-title" className="auth-card__title">비밀번호 찾기</h1>
                <p className="auth-card__subtitle">
                    새 비밀번호를 요청하면 관리자가 확인 후 적용합니다
                </p>

                <form onSubmit={requestReset} className="auth-form" noValidate>
                    <div className="auth-form__error" aria-live="polite">
                        {error && (
                            <div className="auth-form__error-message" role="alert">
                                <AlertCircle size={16} strokeWidth={2} />
                                <span>{error}</span>
                            </div>
                        )}
                        {message && (
                            <div className="auth-form__success-message" role="status">
                                <CheckCircle2 size={16} strokeWidth={2} />
                                <span>{message}</span>
                            </div>
                        )}
                    </div>

                    <IconInput
                        id="reset-email"
                        label="가입 이메일"
                        icon={Mail}
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="이메일 입력"
                        required
                    />

                    <IconInput
                        id="reset-new-password"
                        label="새 비밀번호"
                        icon={Lock}
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="새 비밀번호 입력"
                        required
                    />

                    <IconInput
                        id="reset-confirm-password"
                        label="새 비밀번호 확인"
                        icon={Lock}
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="새 비밀번호 다시 입력"
                        required
                    />

                    <button type="submit" disabled={isLoading} className="auth-form__submit">
                        {isLoading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                요청 중...
                            </>
                        ) : (
                            '변경 요청 보내기'
                        )}
                    </button>

                    <div className="auth-form__footer">
                        <button type="button" onClick={onLogin} className="auth-form__link">
                            로그인으로 돌아가기
                        </button>
                    </div>
                </form>
            </section>
        </AuthLayout>
    );
};

export default ForgotPassword;
