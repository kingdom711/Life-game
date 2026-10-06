import { getRoleById } from '../data/rolesData';
import { getRarityColor } from '../data/itemsData';

// Product portraits are opaque; display equipment beside the character.
const Avatar = ({ equippedItems = {}, size = 300, roleId, showGear = false }) => {
    const roleInfo = getRoleById(roleId);
    const gear = Object.values(equippedItems).filter(item => item?.image);
    const featured = gear.find(item => item.rarity === 'legendary') || gear.find(item => item.rarity === 'epic') || gear[0];
    return (
        <div className={`avatar-visual${showGear ? ' avatar-visual--adventure' : ''}`} style={{ width: size, height: size, '--avatar-rarity': featured ? getRarityColor(featured.rarity) : 'var(--adventure-primary)' }}>
            {roleInfo?.image ? <img className="avatar-character" src={roleInfo.image} alt={roleInfo.name} /> : <span className="avatar-fallback" aria-label="캐릭터">{roleInfo?.icon || '👷'}</span>}
            {showGear && gear.length > 0 && <div className="avatar-equipped" aria-label="현재 장착한 가상 장비">
                {gear.slice(0, 3).map(item => <img key={item.id} src={item.image} alt={`${item.name} 장착`} title={item.name} style={{ borderColor: getRarityColor(item.rarity) }} />)}
                {gear.length > 3 && <span className="avatar-equipped-more">+{gear.length - 3}</span>}
            </div>}
        </div>
    );
};
export default Avatar;
