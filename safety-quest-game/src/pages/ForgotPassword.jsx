import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Lock, Mail } from 'lucide-react';
import authApi from '../api/authApi';
import AuthLayout from '../components/auth/AuthLayout';
import IconInput from '../components/auth/IconInput';

const ForgotPassword = ({ initialMode = 'request', onLogin }) => {
    const params = useMemo(() => new URLSearchParams(window.location.search), []);
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState(params.get('email') || '');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [issuedCode, setIssuedCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const requestCode = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!email.trim()) {
            setError('이메일을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.requestPasswordReset(email.trim());
            setMode('reset');
            if (response?.codeVisible && response?.resetCode) {
                setIssuedCode(response.resetCode);
                setCode(response.resetCode);
                setMessage(response.message || '인증 코드가 발급되었습니다.');
            } else {
                setIssuedCode('');
                setMessage(response?.message || '가입된 이메일이면 인증 코드가 발송됩니다. 메일함에서 6자리 코드를 확인해주세요.');
            }
        } catch (err) {
            setError(err.message || '인증 코드 요청에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!email.trim() || !code.trim() || !newPassword) {
            setError('이메일, 인증 코드, 새 비밀번호를 모두 입력해주세요.');
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
            await authApi.resetPassword({
                email: email.trim(),
                code: code.trim(),
                newPassword,
            });
            setMessage('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.');
            setIssuedCode('');
            setCode('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || '비밀번호 재설정에 실패했습니다.');
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
                    가입 이메일로 받은 인증 코드로 새 비밀번호를 설정합니다
                </p>

                <form onSubmit={mode === 'request' ? requestCode : resetPassword} className="auth-form" noValidate>
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

                    {mode === 'reset' && (
                        <>
                            {issuedCode && (
                                <div className="auth-form__issued-code" aria-label="발급된 인증 코드">
                                    <span className="auth-form__issued-code-label">발급된 인증 코드</span>
                                    <strong>{issuedCode}</strong>
                                </div>
                            )}

                            <IconInput
                                id="reset-code"
                                label="인증 코드"
                                icon={KeyRound}
                                type="text"
                                value={code}
                                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="6자리 코드"
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
                        </>
                    )}

                    <button type="submit" disabled={isLoading} className="auth-form__submit">
                        {isLoading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                처리 중...
                            </>
                        ) : mode === 'request' ? (
                            '인증 코드 받기'
                        ) : (
                            '비밀번호 변경'
                        )}
                    </button>

                    <div className="auth-form__footer">
                        <button type="button" onClick={onLogin} className="auth-form__link">
                            로그인으로 돌아가기
                        </button>
                        {mode === 'reset' && (
                            <button type="button" onClick={requestCode} className="auth-form__link">
                                코드 다시 받기
                            </button>
                        )}
                    </div>
                </form>
            </section>
        </AuthLayout>
    );
};

export default ForgotPassword;
