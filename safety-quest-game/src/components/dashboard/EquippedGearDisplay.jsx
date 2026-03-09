const GEAR_DISPLAY = [
    { key: 'helmet', label: '안전모', icon: '🪖' },
    { key: 'vest', label: '안전조끼', icon: '🦺' },
    { key: 'gloves', label: '안전장갑', icon: '🧤' },
    { key: 'shoes', label: '안전화', icon: '👞' }
];

function EquippedGearDisplay({ equippedItems = {} }) {
    const equippedCategories = Object.values(equippedItems).reduce((acc, item) => {
        if (item?.category) acc[item.category] = true;
        return acc;
    }, {});

    return (
        <div className="new-gear-section">
            <h3 className="new-gear-title">
                <span className="new-gear-title-icon">🛡️</span>
                장착 안전장비
            </h3>
            <div className="new-gear-icons">
                {GEAR_DISPLAY.map((gear) => {
                    const isEquipped = equippedCategories[gear.key];
                    return (
                        <div
                            key={gear.key}
                            className={`new-gear-item ${isEquipped ? 'new-gear-item--equipped' : 'new-gear-item--empty'}`}
                        >
                            <div className="new-gear-icon-circle">
                                <span className="new-gear-icon">{gear.icon}</span>
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
