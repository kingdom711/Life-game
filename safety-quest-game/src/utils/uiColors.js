// Keep category/rarity accents for decoration, with a darker ink on light surfaces.
const accentInkCache = new Map();
const luminance = (channels) => channels.reduce((total, channel, index) => {
    const value = channel / 255;
    const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    return total + linear * [0.2126, 0.7152, 0.0722][index];
}, 0);

export function getAccentInk(color) {
    if (typeof color !== 'string') return 'var(--color-text-secondary)';
    if (color.startsWith('var(')) return color;
    const key = color.toLowerCase();
    if (accentInkCache.has(key)) return accentInkCache.get(key);
    if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/.test(key)) return 'var(--color-text-secondary)';

    const hex = key.length === 4 ? key.slice(1).split('').map((digit) => digit + digit).join('') : key.slice(1);
    const original = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
    let channels = original;
    let factor = 1;
    // Extra headroom over 4.5:1 also covers the app's lightly tinted badges.
    while (1.05 / (luminance(channels) + 0.05) < 5.5) {
        factor *= 0.92;
        channels = original.map((channel) => Math.round(channel * factor));
    }
    const ink = `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
    accentInkCache.set(key, ink);
    return ink;
}
