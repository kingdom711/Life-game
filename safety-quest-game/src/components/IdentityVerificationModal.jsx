import React, { useState } from 'react';
import rewardApi from '../api/rewardApi';

const IdentityVerificationModal = ({ isOpen, onClose, onVerified }) => {
    const [step, setStep] = useState('phone'); // phone, code, done
    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestCode = async () => {
        if (phoneNumber.length < 10) {
            setError('올바른 휴대폰 번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await rewardApi.requestVerification(phoneNumber);
            setStep('code');
            alert('인증번호가 발송되었습니다. (개발 환경: 브라우저 콘솔에서 인증번호 확인)');
        } catch (err) {
            setError(err.message || '인증번호 발송 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCode = async () => {
        if (code.length < 4) {
            setError('인증번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await rewardApi.confirmVerification(phoneNumber, code);
            setStep('done');
            setTimeout(() => {
                onVerified();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || '인증번호 확인 실패');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#1e293b', padding: '2rem', borderRadius: '16px',
                width: '90%', maxWidth: '400px',
                border: '1px solid #475569',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>
                    🔐 본인 인증
                </h2>

                {step === 'phone' && (
                    <>
                        <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            상품 교환을 위해 본인 인증이 필요합니다.<br />
                            휴대폰 번호를 입력하면 인증번호가 발송됩니다.
                        </p>
                        <input
                            type="tel"
                            placeholder="휴대폰 번호 (- 없이 입력)"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            style={{
                                width: '100%', padding: '0.8rem', marginBottom: '1rem',
                                borderRadius: '8px', border: '1px solid #475569',
                                background: '#0f172a', color: '#fff'
                            }}
                        />
                        <button
                            onClick={handleRequestCode}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '0.8rem',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: '#fff', border: 'none', borderRadius: '8px',
                                fontWeight: 'bold', cursor: 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? '처리 중...' : '인증번호 받기'}
                        </button>
                    </>
                )}

                {step === 'code' && (
                    <>
                        <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            발송된 인증번호 6자리를 입력해주세요.
                        </p>
                        <input
                            type="text"
                            placeholder="인증번호 입력"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{
                                width: '100%', padding: '0.8rem', marginBottom: '1rem',
                                borderRadius: '8px', border: '1px solid #475569',
                                background: '#0f172a', color: '#fff'
                            }}
                        />
                        <button
                            onClick={handleConfirmCode}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '0.8rem',
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                color: '#fff', border: 'none', borderRadius: '8px',
                                fontWeight: 'bold', cursor: 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? '확인 중...' : '인증 완료'}
                        </button>
                    </>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>인증 성공!</h3>
                        <p style={{ color: '#94a3b8' }}>잠시 후 상품 교환이 진행됩니다.</p>
                    </div>
                )}

                {error && (
                    <div style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                        ⚠️ {error}
                    </div>
                )}

                {step !== 'done' && (
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%', padding: '0.8rem', marginTop: '1rem',
                            background: 'transparent', color: '#64748b',
                            border: 'none', cursor: 'pointer'
                        }}
                    >
                        취소
                    </button>
                )}
            </div>
        </div>
    );
};

export default IdentityVerificationModal;
