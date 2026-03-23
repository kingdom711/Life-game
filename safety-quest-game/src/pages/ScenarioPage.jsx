import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getScenariosWithProgress,
  getScenarioStats,
  startScenario,
  submitChoice,
  completeScenario,
  getMaxScore
} from '../utils/scenarioManager';
import { getScenarioById } from '../data/scenarioData';

// 난이도 설정
const DIFFICULTY_CONFIG = {
  easy: { label: '쉬움', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.3)' },
  medium: { label: '보통', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)' },
  hard: { label: '어려움', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.3)' }
};

// 카테고리 설정
const CATEGORY_CONFIG = {
  fall: { label: '추락', color: '#60a5fa' },
  electric: { label: '전기', color: '#facc15' },
  fire: { label: '화재', color: '#fb923c' },
  chemical: { label: '화학', color: '#a78bfa' },
  general: { label: '일반', color: '#94a3b8' }
};

function ScenarioPage() {
  // ===== 상태 =====
  const [scenarios, setScenarios] = useState([]);
  const [stats, setStats] = useState({ totalCompleted: 0, totalScenarios: 0, totalAttempts: 0, averageScore: 0, perfectCount: 0 });

  // 플레이 뷰 상태
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalMaxPoints, setTotalMaxPoints] = useState(0);
  const [stepResults, setStepResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setScenarios(getScenariosWithProgress());
    setStats(getScenarioStats());
  };

  // ===== 시나리오 시작 =====
  const handleStartScenario = (scenarioId) => {
    const result = startScenario(scenarioId);
    if (!result.success) return;

    const maxScore = getMaxScore(scenarioId);
    setActiveScenario(result.scenario);
    setCurrentStepIndex(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setEarnedPoints(0);
    setTotalMaxPoints(maxScore);
    setStepResults([]);
    setIsCompleted(false);
    setCompletionResult(null);
  };

  // ===== 선택지 제출 =====
  const handleSelectChoice = (choiceId) => {
    if (showFeedback) return;

    const step = activeScenario.steps[currentStepIndex];
    const result = submitChoice(activeScenario.id, step.id, choiceId);
    if (!result.success) return;

    const choice = step.choices.find(c => c.id === choiceId);
    setSelectedChoice(choiceId);
    setShowFeedback(true);
    setEarnedPoints(prev => prev + result.points);
    setStepResults(prev => [...prev, {
      stepId: step.id,
      choiceId,
      correct: result.correct,
      points: result.points,
      feedback: result.feedback
    }]);
  };

  // ===== 다음 단계 / 완료 =====
  const handleNext = () => {
    const step = activeScenario.steps[currentStepIndex];
    const choice = step.choices.find(c => c.id === selectedChoice);

    if (choice.nextStepId === 'end' || currentStepIndex >= activeScenario.steps.length - 1) {
      // 시나리오 완료
      const result = completeScenario(activeScenario.id, earnedPoints, totalMaxPoints);
      setCompletionResult(result);
      setIsCompleted(true);
    } else {
      // 다음 단계
      const nextIndex = activeScenario.steps.findIndex(s => s.id === choice.nextStepId);
      setCurrentStepIndex(nextIndex >= 0 ? nextIndex : currentStepIndex + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
    }
  };

  // ===== 목록으로 돌아가기 =====
  const handleBackToList = () => {
    setActiveScenario(null);
    setIsCompleted(false);
    setCompletionResult(null);
    loadData();
  };

  // ===== 렌더링: 완료 화면 =====
  if (activeScenario && isCompleted && completionResult) {
    const scorePercent = completionResult.scoreRatio || 0;
    const gradeColor = scorePercent >= 90 ? '#4ade80' : scorePercent >= 60 ? '#fbbf24' : '#f87171';
    const gradeLabel = scorePercent >= 90 ? '우수' : scorePercent >= 60 ? '양호' : '미흡';

    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.completionCard}>
            <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>
              {scorePercent >= 90 ? '🏆' : scorePercent >= 60 ? '👍' : '📖'}
            </div>
            <h2 style={{ ...styles.completionTitle, color: gradeColor }}>
              시나리오 완료!
            </h2>
            <p style={styles.completionSubtitle}>{activeScenario.title}</p>

            {/* 점수 원형 */}
            <div style={styles.scoreCircleWrap}>
              <div style={{
                ...styles.scoreCircle,
                border: `4px solid ${gradeColor}`
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: gradeColor }}>{scorePercent}%</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{gradeLabel}</div>
              </div>
            </div>

            {/* 획득 포인트 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={styles.rewardItem}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>획득 포인트</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#60a5fa' }}>
                  +{completionResult.earnedPoints}P
                </div>
              </div>
              <div style={styles.rewardItem}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>획득 경험치</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a78bfa' }}>
                  +{completionResult.earnedExp}EXP
                </div>
              </div>
            </div>

            {/* 단계별 결과 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.75rem', fontWeight: 700 }}>
                단계별 결과
              </h3>
              {stepResults.map((result, idx) => (
                <div key={idx} style={{
                  ...styles.stepResultItem,
                  borderLeft: `3px solid ${result.correct ? '#4ade80' : result.points > 0 ? '#fbbf24' : '#f87171'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                      {result.correct ? '✅' : result.points > 0 ? '⚠️' : '❌'} 단계 {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: result.correct ? '#4ade80' : result.points > 0 ? '#fbbf24' : '#f87171' }}>
                      +{result.points}점
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {completionResult.isNewBest && (
              <div style={styles.newBestBadge}>
                ⭐ 최고 기록 갱신!
              </div>
            )}

            <button onClick={handleBackToList} style={styles.primaryButton}>
              목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 렌더링: 플레이 뷰 =====
  if (activeScenario) {
    const step = activeScenario.steps[currentStepIndex];
    const totalSteps = activeScenario.steps.length;

    return (
      <div style={styles.page}>
        <div style={styles.container}>
          {/* 상단 바 */}
          <div style={styles.playHeader}>
            <button onClick={handleBackToList} style={styles.backButtonSmall}>
              ← 나가기
            </button>
            <div style={styles.progressText}>
              {currentStepIndex + 1} / {totalSteps}
            </div>
          </div>

          {/* 진행 바 */}
          <div style={styles.progressBarTrack}>
            <div style={{
              ...styles.progressBarFill,
              width: `${((currentStepIndex + (showFeedback ? 1 : 0)) / totalSteps) * 100}%`
            }} />
          </div>

          {/* 시나리오 제목 */}
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#e2e8f0', fontWeight: 700, margin: 0 }}>
              {activeScenario.icon} {activeScenario.title}
            </h2>
          </div>

          {/* 상황 설명 카드 */}
          <div style={styles.situationCard}>
            <div style={{ fontSize: '3.5rem', textAlign: 'center', marginBottom: '1rem' }}>
              {step.image}
            </div>
            <p style={styles.situationText}>{step.situation}</p>
          </div>

          {/* 선택지 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {step.choices.map((choice) => {
              const isSelected = selectedChoice === choice.id;
              let choiceStyle = { ...styles.choiceButton };

              if (showFeedback && isSelected) {
                if (choice.isCorrect) {
                  choiceStyle = { ...choiceStyle, ...styles.choiceCorrect };
                } else if (choice.points > 0) {
                  choiceStyle = { ...choiceStyle, ...styles.choicePartial };
                } else {
                  choiceStyle = { ...choiceStyle, ...styles.choiceWrong };
                }
              } else if (showFeedback && choice.isCorrect) {
                // 정답 표시 (다른 선택을 한 경우)
                choiceStyle = {
                  ...choiceStyle,
                  border: '2px solid rgba(74, 222, 128, 0.3)',
                  opacity: 0.6
                };
              } else if (showFeedback) {
                choiceStyle = { ...choiceStyle, opacity: 0.4 };
              }

              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelectChoice(choice.id)}
                  disabled={showFeedback}
                  style={choiceStyle}
                >
                  <span style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{choice.text}</span>
                  {showFeedback && isSelected && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, marginLeft: '0.5rem', flexShrink: 0 }}>
                      +{choice.points}점
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 피드백 */}
          {showFeedback && selectedChoice && (
            <div style={styles.feedbackCard}>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#e2e8f0', margin: 0 }}>
                {step.choices.find(c => c.id === selectedChoice)?.feedback}
              </p>
            </div>
          )}

          {/* 다음 버튼 */}
          {showFeedback && (
            <button onClick={handleNext} style={styles.primaryButton}>
              {step.choices.find(c => c.id === selectedChoice)?.nextStepId === 'end' ||
                currentStepIndex >= totalSteps - 1
                ? '결과 확인'
                : '다음'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ===== 렌더링: 목록 뷰 =====
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* 뒤로가기 */}
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/" style={styles.backLink}>
            ← 대시보드로 돌아가기
          </Link>
        </div>

        {/* 헤더 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={styles.pageTitle}>
            🎯 시나리오 시뮬레이션
          </h1>
          <p style={styles.pageSubtitle}>
            AI가 생성한 분기형 안전 시나리오로 판단력을 훈련하세요
          </p>
        </div>

        {/* 통계 바 */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.totalCompleted}/{stats.totalScenarios}</div>
            <div style={styles.statLabel}>완료</div>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.averageScore}%</div>
            <div style={styles.statLabel}>평균 점수</div>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.perfectCount}</div>
            <div style={styles.statLabel}>만점</div>
          </div>
        </div>

        {/* 시나리오 카드 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {scenarios.map(scenario => {
            const diff = DIFFICULTY_CONFIG[scenario.difficulty] || DIFFICULTY_CONFIG.easy;
            const cat = CATEGORY_CONFIG[scenario.category] || CATEGORY_CONFIG.general;

            return (
              <div
                key={scenario.id}
                onClick={() => handleStartScenario(scenario.id)}
                style={styles.scenarioCard}
              >
                {/* 상단: 아이콘 + 정보 */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={styles.scenarioIcon}>
                    {scenario.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <h3 style={styles.scenarioTitle}>{scenario.title}</h3>
                      {/* 난이도 뱃지 */}
                      <span style={{
                        ...styles.badge,
                        background: diff.bg,
                        border: `1px solid ${diff.border}`,
                        color: diff.color
                      }}>
                        {diff.label}
                      </span>
                      {/* 카테고리 뱃지 */}
                      <span style={{
                        ...styles.badge,
                        background: `${cat.color}20`,
                        border: `1px solid ${cat.color}40`,
                        color: cat.color
                      }}>
                        {cat.label}
                      </span>
                    </div>
                    <p style={styles.scenarioDesc}>{scenario.description}</p>
                  </div>
                </div>

                {/* 하단: 상태 + 보상 */}
                <div style={styles.scenarioFooter}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* 완료 상태 */}
                    <span style={{
                      ...styles.statusBadge,
                      background: scenario.progress.completed
                        ? 'rgba(74, 222, 128, 0.15)'
                        : 'rgba(148, 163, 184, 0.1)',
                      color: scenario.progress.completed ? '#4ade80' : '#64748b'
                    }}>
                      {scenario.progress.completed ? '✅ 완료' : '미완료'}
                    </span>
                    {/* 최고 점수 */}
                    {scenario.progress.completed && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        최고: {scenario.progress.scorePercent}%
                      </span>
                    )}
                  </div>
                  {/* 보상 미리보기 */}
                  <div style={styles.rewardPreview}>
                    <span style={{ color: '#60a5fa' }}>+{scenario.reward.points}P</span>
                    <span style={{ color: '#64748b' }}>|</span>
                    <span style={{ color: '#a78bfa' }}>+{scenario.reward.exp}EXP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== 스타일 =====
const styles = {
  page: {
    minHeight: '100vh',
    padding: '1rem',
    paddingBottom: '5rem'
  },
  container: {
    maxWidth: '640px',
    margin: '0 auto'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    fontSize: '0.85rem',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  pageTitle: {
    fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
    fontWeight: 800,
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: 0,
    lineHeight: 1.5
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    padding: '1rem 1.25rem',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '1.5rem'
  },
  statItem: {
    textAlign: 'center'
  },
  statValue: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#e2e8f0'
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginTop: '0.15rem'
  },
  statDivider: {
    width: '1px',
    height: '28px',
    background: 'rgba(255, 255, 255, 0.08)'
  },
  scenarioCard: {
    padding: '1.25rem',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  scenarioIcon: {
    fontSize: '2rem',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    flexShrink: 0
  },
  scenarioTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: 0
  },
  scenarioDesc: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: '0.25rem 0 0 0',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    whiteSpace: 'nowrap'
  },
  scenarioFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
  },
  statusBadge: {
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.2rem 0.6rem',
    borderRadius: '6px'
  },
  rewardPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    fontWeight: 600
  },

  // ===== 플레이 뷰 스타일 =====
  playHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  backButtonSmall: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.85rem',
    cursor: 'pointer',
    padding: '0.4rem 0'
  },
  progressText: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#94a3b8'
  },
  progressBarTrack: {
    width: '100%',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '1.25rem'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
    transition: 'width 0.4s ease'
  },
  situationCard: {
    padding: '1.5rem',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(167, 139, 250, 0.06))',
    border: '1px solid rgba(96, 165, 250, 0.15)',
    marginBottom: '1.25rem'
  },
  situationText: {
    fontSize: '0.95rem',
    lineHeight: 1.8,
    color: '#e2e8f0',
    margin: 0,
    wordBreak: 'keep-all'
  },
  choiceButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '1rem 1.25rem',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    color: '#e2e8f0',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    lineHeight: 1.5
  },
  choiceCorrect: {
    background: 'rgba(74, 222, 128, 0.12)',
    border: '2px solid rgba(74, 222, 128, 0.4)',
    color: '#4ade80'
  },
  choicePartial: {
    background: 'rgba(251, 191, 36, 0.12)',
    border: '2px solid rgba(251, 191, 36, 0.4)',
    color: '#fbbf24'
  },
  choiceWrong: {
    background: 'rgba(248, 113, 113, 0.12)',
    border: '2px solid rgba(248, 113, 113, 0.4)',
    color: '#f87171'
  },
  feedbackCard: {
    padding: '1.25rem',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '1rem'
  },
  primaryButton: {
    width: '100%',
    padding: '0.9rem',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    border: 'none',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // ===== 완료 화면 스타일 =====
  completionCard: {
    padding: '2rem 1.5rem',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    textAlign: 'center'
  },
  completionTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    margin: '0 0 0.3rem 0'
  },
  completionSubtitle: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    margin: '0 0 1.5rem 0'
  },
  scoreCircleWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem'
  },
  scoreCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.3)'
  },
  rewardItem: {
    textAlign: 'center'
  },
  stepResultItem: {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    background: 'rgba(0, 0, 0, 0.2)',
    marginBottom: '0.4rem'
  },
  newBestBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    background: 'rgba(251, 191, 36, 0.15)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    color: '#fbbf24',
    fontSize: '0.85rem',
    fontWeight: 700,
    marginBottom: '1.5rem'
  }
};

export default ScenarioPage;
