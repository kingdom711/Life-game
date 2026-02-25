import { RARITY_NAMES, getRarityColor } from '../../data/itemsData';

const CATEGORY_ICONS = {
    helmet: '🪖',
    vest: '🦺',
    gloves: '🧤',
    shoes: '👞',
    glasses: '🥽',
    belt: '🪢',
    mask: '😷'
};

function EquipmentSidebar({ equippedItems = {}, onNavigateShop, onNavigateAvatar }) {
    const items = Object.values(equippedItems);

    return (
        <aside className="dashboard-side-card">
            <header className="dashboard-side-title-row">
                <h3 className="dashboard-side-title">내 장비</h3>
            </header>

            {items.length === 0 ? (
                <div className="equipment-empty">
                    <div className="equipment-empty-icon">📦</div>
                    <p>장비가 없습니다</p>
                </div>
            ) : (
                <ul className="equipment-list">
                    {items.map((item) => {
                        const rarityColor = getRarityColor(item.rarity);
                        return (
                            <li key={item.id} className="equipment-item">
                                <div className="equipment-item-icon">
                                    {CATEGORY_ICONS[item.category] || '🧰'}
                                </div>
                                <div className="equipment-item-content">
                                    <div className="equipment-item-meta">
                                        <span
                                            className="equipment-rarity-badge"
                                            style={{
                                                background: `${rarityColor}22`,
                                                borderColor: `${rarityColor}66`,
                                                color: rarityColor
                                            }}
                                        >
                                            {RARITY_NAMES[item.rarity] || item.rarity}
                                        </span>
                                        {item.calibrationLevel > 0 && (
                                            <span className="equipment-calibration">
                                                +{item.calibrationLevel}
                                            </span>
                                        )}
                                    </div>
                                    <strong className="equipment-item-name">{item.name}</strong>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <div className="equipment-sidebar-actions">
                <button
                    type="button"
                    className="dashboard-side-action"
                    onClick={onNavigateAvatar}
                >
                    🛠️ 장비 관리
                </button>
                <button
                    type="button"
                    className="dashboard-side-action dashboard-side-action--secondary"
                    onClick={onNavigateShop}
                >
                    🛒 상점 가기
                </button>
            </div>
        </aside>
    );
}

export default EquipmentSidebar;
