import { useNavigate } from 'react-router-dom';
import { getRarityColor } from '../../data/itemsData';

const GEAR_DISPLAY = [
    { key: 'helmet', label: '안전모', icon: '🪖' },
    { key: 'glasses', label: '보안경', icon: '🥽' },
    { key: 'vest', label: '안전조끼', icon: '🦺' },
    { key: 'gloves', label: '안전장갑', icon: '🧤' },
    { key: 'belt', label: '안전벨트', icon: '🪢' },
    { key: 'shoes', label: '안전화', icon: '👞' }
];

function EquippedGearDisplay({ equippedItems = {} }) {
    const navigate = useNavigate();

    return (
        <div className="new-gear-section new-gear-section--clickable" onClick={() => navigate('/inventory')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/inventory')}>
            <h3 className="new-gear-title">
                <span className="new-gear-title-icon">🛡️</span>
                장착 안전장비
            </h3>
            <div className="new-gear-icons">
                {GEAR_DISPLAY.map((gear) => {
                    const equippedItem = equippedItems[gear.key];
                    const isEquipped = Boolean(equippedItem);
                    const rarityColor = equippedItem ? getRarityColor(equippedItem.rarity) : null;
                    const rarityStyle = isEquipped && rarityColor ? {
                        '--gear-rarity-color': rarityColor,
                        '--gear-rarity-bg': `${rarityColor}22`,
                        '--gear-rarity-shadow': `${rarityColor}33`,
                        '--gear-rarity-ring': `${rarityColor}66`
                    } : undefined;

                    return (
                        <div
                            key={gear.key}
                            className={`new-gear-item ${isEquipped ? 'new-gear-item--equipped' : 'new-gear-item--empty'}`}
                            title={equippedItem ? `${equippedItem.name} 착용 중` : `${gear.label} 미장착`}
                        >
                            <div className="new-gear-icon-circle" style={rarityStyle}>
                                {equippedItem?.image ? (
                                    <img
                                        className="new-gear-image"
                                        src={equippedItem.avatarLayer || equippedItem.image}
                                        alt={equippedItem.name}
                                    />
                                ) : (
                                    <span className="new-gear-icon">{gear.icon}</span>
                                )}
                            </div>
                            <span className="new-gear-label">{gear.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default EquippedGearDisplay;
