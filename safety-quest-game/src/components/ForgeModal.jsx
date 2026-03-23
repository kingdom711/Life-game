import { useState, useEffect } from 'react';
import { getFusionCandidates, fuseItems, getFusionRate, getForgeTokens, exchangeTokensForLegendary } from '../utils/forgeManager';
import { getRarityColor, RARITY_NAMES } from '../data/itemsData';
import { trackCalibrationSuccess } from '../utils/achievementManager';

function ForgeModal({ isOpen, onClose, onComplete }) {
    const [candidates, setCandidates] = useState({});
    const [selectedRarity, setSelectedRarity] = useState(null);
    const [selected1, setSelected1] = useState(null);
    const [selected2, setSelected2] = useState(null);
    const [result, setResult] = useState(null);
    const [isForging, setIsForging] = useState(false);
    const [tokens, setTokens] = useState(0);

    useEffect(() => {
        if (isOpen) {
            loadData();
            setResult(null);
            setSelected1(null);
            setSelected2(null);
            setSelectedRarity(null);
        }
    }, [isOpen]);

    const loadData = () => {
        const c = getFusionCandidates();
        setCandidates(c);
        setTokens(getForgeTokens());
        // 첫 합성 가능한 등급 자동 선택
        const firstRarity = Object.keys(c)[0];
        if (firstRarity) setSelectedRarity(firstRarity);
    };

    const handleFuse = () => {
        if (!selected1 || !selected2) return;
        setIsForging(true);
        setResult(null);

        // 연출 딜레이
        setTimeout(() => {
            const res = fuseItems(selected1.id, selected2.id);
            setResult(res);
            setIsForging(false);
            if (res.fusionSuccess) {
                trackCalibrationSuccess();
            }
            loadData();
            setSelected1(null);
            setSelected2(null);
            onComplete?.();
        }, 1500);
    };

    const handleTokenExchange = () => {
        const res = exchangeTokensForLegendary();
        setResult(res);
        loadData();
        onComplete?.();
    };

    if (!isOpen) return null;

    const currentItems = selectedRarity ? (candidates[selectedRarity] || []) : [];
    const rate = selectedRarity ? getFusionRate(selectedRarity) : null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2000, padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))',
                    borderRadius: '20px',
                    width: '100%', maxWidth: '520px', maxHeight: '85vh',
                    overflow: 'hidden',
                    border: '2px solid rgba(168, 85, 247, 0.4)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 60px rgba(168, 85, 247, 0.15)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#c084fc', fontWeight: 700, fontSize: '1.2rem' }}>
                            ⚒️ 장비 합성소
                        </h3>
                        <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                            같은 등급 장비 2개 → 상위 등급 장비
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {tokens > 0 && (
                            <div style={{
                                background: 'rgba(234, 179, 8, 0.15)',
                                border: '1px solid rgba(234, 179, 8, 0.3)',
                                borderRadius: '8px', padding: '0.3rem 0.6rem',
                                fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24'
                            }}>
                                토큰 {tokens}/5
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                borderRadius: '50%', width: '32px', height: '32px',
                                color: '#94a3b8', cursor: 'pointer'
                            }}
                        >✕</button>
                    </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', maxHeight: 'calc(85vh - 80px)' }}>
                    {/* 결과 메시지 */}
                    {result && (
                        <div style={{
                            padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
                            background: result.fusionSuccess
                                ? 'rgba(34, 197, 94, 0.15)'
                                : result.success ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1px solid ${result.fusionSuccess
                                ? 'rgba(34, 197, 94, 0.3)'
                                : 'rgba(239, 68, 68, 0.3)'}`,
                            color: result.fusionSuccess ? '#4ade80' : '#f87171',
                            fontSize: '0.85rem', fontWeight: 600, textAlign: 'center'
                        }}>
                            {result.message}
                            {result.resultItem && (
                                <div style={{ marginTop: '0.5rem', fontSize: '1.2rem' }}>
                                    🎉 {result.resultItem.name}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 합성 가능한 아이템 없음 */}
                    {Object.keys(candidates).length === 0 && (
                        <div style={{
                            textAlign: 'center', padding: '2rem',
                            color: '#64748b', fontSize: '0.9rem'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📦</div>
                            합성 가능한 장비가 없습니다.<br />
                            같은 등급의 장비를 2개 이상 보유해야 합니다.
                        </div>
                    )}

                    {/* 등급 선택 탭 */}
                    {Object.keys(candidates).length > 0 && (
                        <>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                {Object.keys(candidates).map(rarity => (
                                    <button
                                        key={rarity}
                                        onClick={() => {
                                            setSelectedRarity(rarity);
                                            setSelected1(null);
                                            setSelected2(null);
                                        }}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '8px',
                                            border: selectedRarity === rarity
                                                ? `2px solid ${getRarityColor(rarity)}`
                                                : '2px solid rgba(255,255,255,0.1)',
                                            background: selectedRarity === rarity
                                                ? `${getRarityColor(rarity)}22`
                                                : 'rgba(255,255,255,0.05)',
                                            color: getRarityColor(rarity),
                                            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                                        }}
                                    >
                                        {RARITY_NAMES[rarity]} ({candidates[rarity].length})
                                    </button>
                                ))}
                            </div>

                            {/* 합성 슬롯 */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.75rem', marginBottom: '1rem'
                            }}>
                                {/* 슬롯 1 */}
                                <div style={{
                                    width: '100px', height: '100px',
                                    border: `2px dashed ${selected1 ? getRarityColor(selected1.rarity) : 'rgba(255,255,255,0.2)'}`,
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column',
                                    background: selected1 ? `${getRarityColor(selected1.rarity)}11` : 'rgba(255,255,255,0.03)'
                                }}>
                                    {selected1 ? (
                                        <>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: getRarityColor(selected1.rarity), textAlign: 'center', padding: '0.25rem' }}>
                                                {selected1.name}
                                            </div>
                                        </>
                                    ) : (
                                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>재료 1</span>
                                    )}
                                </div>

                                <div style={{ fontSize: '1.5rem', color: '#64748b' }}>+</div>

                                {/* 슬롯 2 */}
                                <div style={{
                                    width: '100px', height: '100px',
                                    border: `2px dashed ${selected2 ? getRarityColor(selected2.rarity) : 'rgba(255,255,255,0.2)'}`,
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column',
                                    background: selected2 ? `${getRarityColor(selected2.rarity)}11` : 'rgba(255,255,255,0.03)'
                                }}>
                                    {selected2 ? (
                                        <>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: getRarityColor(selected2.rarity), textAlign: 'center', padding: '0.25rem' }}>
                                                {selected2.name}
                                            </div>
                                        </>
                                    ) : (
                                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>재료 2</span>
                                    )}
                                </div>

                                <div style={{ fontSize: '1.5rem', color: '#64748b' }}>=</div>

                                {/* 결과 슬롯 */}
                                <div style={{
                                    width: '100px', height: '100px',
                                    border: `2px solid ${rate ? getRarityColor(rate.resultRarity) : 'rgba(255,255,255,0.2)'}`,
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column',
                                    background: rate ? `${getRarityColor(rate.resultRarity)}11` : 'rgba(255,255,255,0.03)'
                                }}>
                                    {rate ? (
                                        <>
                                            <span style={{ fontSize: '1.5rem' }}>❓</span>
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 700,
                                                color: getRarityColor(rate.resultRarity)
                                            }}>
                                                {RARITY_NAMES[rate.resultRarity]}
                                            </span>
                                        </>
                                    ) : (
                                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>결과</span>
                                    )}
                                </div>
                            </div>

                            {/* 확률 표시 */}
                            {rate && (
                                <div style={{
                                    textAlign: 'center', marginBottom: '1rem',
                                    fontSize: '0.85rem', color: '#94a3b8'
                                }}>
                                    성공 확률: <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                                        {Math.round(rate.successRate * 100)}%
                                    </span>
                                    {' | '}실패 시 재료 1개 반환
                                </div>
                            )}

                            {/* 아이템 선택 그리드 */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                gap: '0.5rem', marginBottom: '1rem'
                            }}>
                                {currentItems.map(item => {
                                    const isSelected = selected1?.id === item.id || selected2?.id === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    if (selected1?.id === item.id) setSelected1(null);
                                                    else setSelected2(null);
                                                } else if (!selected1) {
                                                    setSelected1(item);
                                                } else if (!selected2) {
                                                    setSelected2(item);
                                                }
                                            }}
                                            style={{
                                                padding: '0.6rem',
                                                borderRadius: '10px',
                                                border: isSelected
                                                    ? `2px solid ${getRarityColor(item.rarity)}`
                                                    : '1px solid rgba(255,255,255,0.1)',
                                                background: isSelected
                                                    ? `${getRarityColor(item.rarity)}22`
                                                    : 'rgba(255,255,255,0.03)',
                                                color: '#cbd5e1',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.7rem' }}>{item.name}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 합성 버튼 */}
                            <button
                                onClick={handleFuse}
                                disabled={!selected1 || !selected2 || isForging}
                                style={{
                                    width: '100%', padding: '0.85rem',
                                    borderRadius: '12px', border: 'none',
                                    background: selected1 && selected2 && !isForging
                                        ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                                        : 'rgba(255,255,255,0.1)',
                                    color: selected1 && selected2 ? '#fff' : '#64748b',
                                    fontWeight: 700, fontSize: '1rem',
                                    cursor: selected1 && selected2 && !isForging ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {isForging ? '⚒️ 합성 중...' : '⚒️ 합성하기'}
                            </button>
                        </>
                    )}

                    {/* 보상 토큰 교환 */}
                    {tokens >= 5 && (
                        <div style={{
                            marginTop: '1rem', padding: '1rem',
                            background: 'rgba(234, 179, 8, 0.1)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            borderRadius: '12px'
                        }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>
                                        🎫 보상 토큰 교환
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        토큰 5개 → Legendary 장비 확정 획득
                                    </div>
                                </div>
                                <button
                                    onClick={handleTokenExchange}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                        color: '#0f172a', fontWeight: 700, fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    교환하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgeModal;
