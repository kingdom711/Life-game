import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX, LoaderCircle } from 'lucide-react';
import { requireSupabase } from '../lib/supabase';

const normalize = (value) => String(value || '').trim().toUpperCase();

export default function CertificateVerificationPage() {
    const [certificateNumber] = useState(() => normalize(new URLSearchParams(window.location.search).get('certificateNumber')));
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const verify = async () => {
            if (!certificateNumber) {
                setError('인증 번호가 없는 QR 코드입니다.');
                return;
            }
            try {
                const { data, error: invokeError } = await requireSupabase().functions.invoke('verify-certificate', {
                    body: { certificateNumber },
                });
                if (invokeError) throw invokeError;
                if (!cancelled) setResult(data);
            } catch (verificationError) {
                if (!cancelled) setError('인증서 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        verify();
        return () => { cancelled = true; };
    }, [certificateNumber]);

    const valid = result?.valid === true;
    return (
        <main className="certificate-verification-page">
            <section className="certificate-verification-card">
                <p className="certificate-eyebrow">SAFETY QUEST</p>
                <h1 className="mt-2 text-2xl font-bold">위험성 평가 인증서 확인</h1>
                {!result && !error && (
                    <div className="mt-8 flex items-center gap-3" style={{ color: 'var(--color-text-secondary)' }}><LoaderCircle className="animate-spin" /> 인증서를 확인하고 있습니다.</div>
                )}
                {error && <p className="certificate-status certificate-status--invalid" role="alert">{error}</p>}
                {result && (
                    <div className={`certificate-status certificate-status--${valid ? 'valid' : 'invalid'}`}>
                        <div className="flex items-center gap-3">
                            {valid ? <ShieldCheck className="h-8 w-8" /> : <ShieldX className="h-8 w-8" />}
                            <strong className="text-lg">{valid ? '유효한 인증서입니다.' : '유효하지 않은 인증서입니다.'}</strong>
                        </div>
                        <dl className="mt-5 space-y-3 text-sm">
                            <div><dt>인증 번호</dt><dd className="mt-1 break-all font-mono">{result.certificateNumber || certificateNumber}</dd></div>
                            {valid && <>
                                <div><dt>발급 일시</dt><dd className="mt-1">{result.issuedAt ? new Date(result.issuedAt).toLocaleString('ko-KR') : '-'}</dd></div>
                                <div><dt>위험 위치</dt><dd className="mt-1">{result.hazard?.location || '-'}</dd></div>
                                <div><dt>처리 상태</dt><dd className="mt-1">{result.hazard?.status || '-'}</dd></div>
                            </>}
                        </dl>
                    </div>
                )}
            </section>
        </main>
    );
}
