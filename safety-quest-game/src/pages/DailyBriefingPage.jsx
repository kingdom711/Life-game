import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage, getKSTDateString, questProgress, educationHistory, points } from '../utils/storage';
import { getActiveEventQuests } from '../utils/eventQuestManager';
import { getSeasonData } from '../utils/seasonManager';

/**
 * AI 일일 브리핑 페이지
 * 전일 데이터를 기반으로 안전 요약 리포트를 생성합니다.
 */
function DailyBriefingPage() {
    const [briefing, setBriefing] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);

    useEffect(() => {
        // 브리핑 생성 시뮬레이션 (1초 딜레이)
        const timer = setTimeout(() => {
            setBriefing(generateBriefing());
            setIsGenerating(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const generateBriefing = () => {
        const today = getKSTDateString();
        const now = new Date();
        const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
        const weekday = ['일', '월', '화', '수', '목', '금', '토'][kstNow.getDay()];

        // 데이터 수집
        const allProgress = questProgress.get();
        const completedQuests = Object.values(allProgress).filter(q => q.completed).length;
        const totalQuests = Object.keys(allProgress).length || 1;
        const questRate = Math.round((completedQuests / totalQuests) * 100);

        const eduHistory = educationHistory.getTodayCompleted();
        const currentPoints = points.get();
        const seasonData = getSeasonData();
        const eventQuests = getActiveEventQuests();

        // 랜덤 요소 (시뮬레이션)
        const hazardCount = Math.floor(Math.random() * 5) + 1;
        const unresolvedCount = Math.floor(Math.random() * 3);
        const checklistRate = 78 + Math.floor(Math.random() * 20);
        const educationRate = 65 + Math.floor(Math.random() * 30);

        // AI 추천 액션 생성
        const recommendations = [];
        if (questRate < 70) recommendations.push('퀘스트 참여율이 낮습니다. 일일 퀘스트를 먼저 수행해주세요.');
        if (unresolvedCount > 0) recommendations.push(`미해결 위험 신고 ${unresolvedCount}건 → 즉시 조치 필요`);
        if (educationRate < 80) recommendations.push('금주 교육 이수율이 목표에 미달합니다. 교육을 완료해주세요.');
        if (eventQuests.some(q => !q.isCompleted)) recommendations.push('오늘의 이벤트 퀘스트가 남아있습니다.');
        if (recommendations.length === 0) recommendations.push('모든 안전 지표가 양호합니다. 좋은 하루 되세요!');

        // 위험 사례 (시뮬레이션)
        const incidents = [
            { location: 'A동 2층', type: '추락 위험', status: unresolvedCount > 0 ? '미해결' : '해결', daysAgo: 1 },
            { location: 'B동 지하', type: '전기 설비', status: '해결', daysAgo: 2 },
        ];

        return {
            date: today,
            weekday,
            summary: {
                questRate,
                hazardCount,
                unresolvedCount,
                checklistRate,
                educationRate,
                eventQuestsActive: eventQuests.filter(q => !q.isCompleted).length
            },
            recommendations,
            incidents: incidents.slice(0, hazardCount > 2 ? 2 : 1),
            seasonPoints: seasonData.seasonPoints,
            kudos: {
                name: '김안전',
                reason: `위험 신고 ${Math.floor(Math.random() * 3) + 1}건 (팀 최다)`
            }
        };
    };

    if (isGenerating) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                    <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        AI 브리핑 생성 중...
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        전일 안전 데이터를 분석하고 있습니다
                    </div>
                    <div className="spinner" style={{ margin: '1.5rem auto' }} />
                </div>
            </div>
        );
    }

    if (!briefing) return null;

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" className="btn btn-secondary btn-sm">← 대시보드</Link>
                </div>

                {/* 브리핑 헤더 */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))',
                    border: '2px solid rgba(59,130,246,0.3)',
                    borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>📋</span>
                        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0' }}>
                            {briefing.date} ({briefing.weekday}) 안전 일일 브리핑
                        </h1>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        🤖 AI가 자동 생성한 안전 요약 리포트입니다
                    </div>
                </div>

                {/* 어제 요약 */}
                <div style={{
                    padding: '1.25rem', borderRadius: '14px', marginBottom: '1rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)'
                }}>
                    <h3 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                        📊 어제 요약
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        <SummaryItem
                            label="퀘스트 참여율"
                            value={`${briefing.summary.questRate}%`}
                            warn={briefing.summary.questRate < 70}
                        />
                        <SummaryItem
                            label="위험 신고"
                            value={`${briefing.summary.hazardCount}건`}
                            sub={briefing.summary.unresolvedCount > 0 ? `미해결 ${briefing.summary.unresolvedCount}건` : null}
                            warn={briefing.summary.unresolvedCount > 0}
                        />
                        <SummaryItem
                            label="체크리스트 제출률"
                            value={`${briefing.summary.checklistRate}%`}
                            warn={briefing.summary.checklistRate < 80}
                        />
                        <SummaryItem
                            label="교육 이수율"
                            value={`${briefing.summary.educationRate}%`}
                            warn={briefing.summary.educationRate < 80}
                        />
                    </div>
                </div>

                {/* 주의 사항 */}
                {briefing.incidents.length > 0 && (
                    <div style={{
                        padding: '1.25rem', borderRadius: '14px', marginBottom: '1rem',
                        background: 'rgba(234,179,8,0.05)',
                        border: '1px solid rgba(234,179,8,0.15)'
                    }}>
                        <h3 style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                            ⚠️ 주의 사항
                        </h3>
                        {briefing.incidents.map((inc, idx) => (
                            <div key={idx} style={{
                                padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.5rem',
                                background: 'rgba(0,0,0,0.2)', fontSize: '0.85rem'
                            }}>
                                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                                    {inc.location} — {inc.type}
                                </span>
                                <span style={{
                                    marginLeft: '0.5rem', fontSize: '0.75rem',
                                    color: inc.status === '미해결' ? '#f87171' : '#4ade80',
                                    fontWeight: 600
                                }}>
                                    [{inc.status}]
                                </span>
                                <span style={{ color: '#64748b', fontSize: '0.7rem', marginLeft: '0.3rem' }}>
                                    (D+{inc.daysAgo})
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* AI 추천 액션 */}
                <div style={{
                    padding: '1.25rem', borderRadius: '14px', marginBottom: '1rem',
                    background: 'rgba(59,130,246,0.05)',
                    border: '1px solid rgba(59,130,246,0.15)'
                }}>
                    <h3 style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                        💡 AI 추천 액션
                    </h3>
                    {briefing.recommendations.map((rec, idx) => (
                        <div key={idx} style={{
                            display: 'flex', gap: '0.5rem', marginBottom: '0.4rem',
                            fontSize: '0.85rem', color: '#cbd5e1'
                        }}>
                            <span style={{ color: '#60a5fa' }}>{idx + 1}.</span>
                            {rec}
                        </div>
                    ))}
                </div>

                {/* 어제의 안전 스타 */}
                <div style={{
                    padding: '1rem 1.25rem', borderRadius: '14px',
                    background: 'rgba(234,179,8,0.05)',
                    border: '1px solid rgba(234,179,8,0.15)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>🏆</span>
                    <div>
                        <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>
                            어제의 안전 스타
                        </div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                            {briefing.kudos.name} — {briefing.kudos.reason}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryItem({ label, value, sub, warn }) {
    return (
        <div style={{
            padding: '0.5rem 0.75rem', borderRadius: '8px',
            background: 'rgba(0,0,0,0.2)'
        }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                {label}
            </div>
            <div style={{
                fontSize: '1.1rem', fontWeight: 800,
                color: warn ? '#fbbf24' : '#e2e8f0'
            }}>
                {value} {warn && '⚠️'}
            </div>
            {sub && (
                <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 600 }}>
                    {sub}
                </div>
            )}
        </div>
    );
}

export default DailyBriefingPage;
