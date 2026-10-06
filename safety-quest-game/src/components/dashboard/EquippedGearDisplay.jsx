import { useNavigate } from 'react-router-dom';
import { getRarityColor } from '../../data/itemsData';
import { HardHat, Glasses, Shirt, Hand, Link, Footprints } from 'lucide-react';

const GEAR_DISPLAY = [
    { key: 'helmet', label: '안전모', Icon: HardHat },
    { key: 'glasses', label: '보안경', Icon: Glasses },
    { key: 'vest', label: '안전조끼', Icon: Shirt },
    { key: 'gloves', label: '안전장갑', Icon: Hand },
    { key: 'belt', label: '안전벨트', Icon: Link },
    { key: 'shoes', label: '안전화', Icon: Footprints }
];

function EquippedGearDisplay({ equippedItems = {} }) {
    const navigate = useNavigate();

    return (
        <div className="new-gear-section new-gear-section--clickable" onClick={() => navigate('/inventory')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/inventory'); } }}>
            <h3 className="new-gear-title">
                <HardHat size={19} aria-hidden="true" />
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
                                    <gear.Icon size={22} aria-hidden="true" />
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
