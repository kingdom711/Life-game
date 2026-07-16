import { Link } from 'react-router-dom';
import { Gift, MessageSquare, ShieldCheck, UserCheck } from 'lucide-react';

const steps = [
    {
        title: '보상 대상 확인',
        description: '관리자가 총 참여일자와 정상 참여 포인트를 기준으로 대상자를 확정합니다.',
        Icon: UserCheck,
    },
    {
        title: '개별 의견으로 정보 제출',
        description: '이름, 연락처, 앱 닉네임 또는 계정 정보는 댓글이 아니라 의견으로 보내주세요.',
        Icon: MessageSquare,
    },
    {
        title: '관리자 확인 후 직접 지급',
        description: '중복 지급 여부와 본인 확인을 마친 뒤 상품권을 개별 지급합니다.',
        Icon: ShieldCheck,
    },
];

function RewardCenter() {
    return (
        <div className="page">
            <div className="container" style={{ maxWidth: 920 }}>
                <div
                    className="card"
                    style={{
                        padding: '1.5rem',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        background: 'rgba(15, 23, 42, 0.78)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                display: 'grid',
                                placeItems: 'center',
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.22), rgba(236,72,153,0.18))',
                                color: '#93c5fd',
                            }}
                        >
                            <Gift size={24} aria-hidden="true" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                보상 지급 안내
                            </h1>
                            <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-muted)' }}>
                                베타 참여 보상 방식이 직접 지급으로 변경되었습니다.
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: 12,
                            background: 'rgba(14, 165, 233, 0.12)',
                            border: '1px solid rgba(14, 165, 233, 0.24)',
                            color: 'var(--color-text)',
                            lineHeight: 1.65,
                        }}
                    >
                        포인트와 골드를 상품권으로 교환하는 방식은 사용하지 않습니다. 관리자가 참여 내역을 확인한 뒤
                        보상 대상자에게 편의점 상품권, 커피 쿠폰, 신세계 상품권 등을 직접 지급합니다.
                    </div>

                    <div
                        style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: 12,
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.24)',
                            color: '#fecaca',
                            lineHeight: 1.65,
                        }}
                    >
                        개인정보 보호를 위해 이름과 전화번호는 댓글에 남기지 마세요. 개별로 의견을 남기면 관리자만
                        확인할 수 있으니, 보상 확인 정보는 의견으로 보내주세요.
                    </div>

                    <div className="grid grid-3" style={{ marginTop: '1.25rem', gap: '0.85rem' }}>
                        {steps.map(({ title, description, Icon }) => (
                            <div
                                key={title}
                                style={{
                                    minHeight: 156,
                                    padding: '1rem',
                                    borderRadius: 12,
                                    background: 'rgba(30, 41, 59, 0.72)',
                                    border: '1px solid rgba(148, 163, 184, 0.18)',
                                }}
                            >
                                <Icon size={22} color="#93c5fd" aria-hidden="true" />
                                <h2 style={{ margin: '0.75rem 0 0.45rem', fontSize: '1rem', color: 'var(--color-text)' }}>
                                    {title}
                                </h2>
                                <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            marginTop: '1.25rem',
                            padding: '1rem',
                            borderRadius: 12,
                            background: 'rgba(71, 85, 105, 0.26)',
                            border: '1px dashed rgba(148, 163, 184, 0.32)',
                            color: 'var(--color-text-muted)',
                            lineHeight: 1.6,
                        }}
                    >
                        골드 교환소와 보상 교환 신청 기능은 비활성화되었습니다. 기존 포인트와 골드 수치는 참여 내역
                        확인용으로만 참고됩니다.
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: '1.25rem' }}>
                        <Link to="/profile" className="btn btn-secondary">
                            내 점수 확인
                        </Link>
                        <Link to="/feedback" className="btn btn-primary">
                            의견 남기기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RewardCenter;
