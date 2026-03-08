/**
 * customisation.js — All unicorn customisation options and data
 * Defines starting options and unlockable rewards
 */

export const BODY_COLORS = [
    { id: 'pink',    hex: '#ffb6c1', name: 'Pink',    locked: false },
    { id: 'white',   hex: '#f5f5f5', name: 'White',   locked: false },
    { id: 'purple',  hex: '#d8b4fe', name: 'Purple',  locked: false },
    { id: 'blue',    hex: '#93c5fd', name: 'Blue',    locked: false },
    { id: 'gold',    hex: '#fde68a', name: 'Gold',    locked: false },
    { id: 'mint',    hex: '#a7f3d0', name: 'Mint',    locked: false },
    // Unlockable
    { id: 'rainbow',   hex: 'rainbow',  name: 'Rainbow',   locked: true, zone: 'rainbow-meadow' },
    { id: 'galaxy',    hex: '#1e1b4b',  name: 'Galaxy',    locked: true, zone: 'star-observatory' },
    { id: 'sunset',    hex: '#fb923c',  name: 'Sunset',    locked: true, zone: 'feelings-forest' },
    { id: 'ocean',     hex: '#06b6d4',  name: 'Ocean',     locked: true, zone: 'swimming-pool' },
    { id: 'rose-gold', hex: '#e8a0bf',  name: 'Rose Gold', locked: true, zone: 'counting-creek' },
    { id: 'silver',    hex: '#cbd5e1',  name: 'Silver',    locked: true, zone: 'shape-mountain' },
];

export const MANE_COLORS = [
    { id: 'hot-pink',  hex: '#ff69b4', name: 'Hot Pink' },
    { id: 'purple',    hex: '#a855f7', name: 'Purple' },
    { id: 'rainbow',   hex: 'rainbow', name: 'Rainbow' },
    { id: 'gold',      hex: '#fbbf24', name: 'Gold' },
    { id: 'silver',    hex: '#94a3b8', name: 'Silver' },
    { id: 'rose',      hex: '#f472b6', name: 'Rose' },
];

export const MANE_STYLES = [
    { id: 'flowing',       name: 'Flowing',       locked: false },
    { id: 'curly',         name: 'Curly',         locked: false },
    { id: 'braided',       name: 'Braided',       locked: false },
    { id: 'wild',          name: 'Wild',          locked: false },
    // Unlockable
    { id: 'star-sparkle',  name: 'Star Sparkle',  locked: true, zone: 'star-observatory' },
    { id: 'flower-braided', name: 'Flower Braid', locked: true, zone: 'rainbow-meadow' },
];

export const HORNS = [
    { id: 'classic',    name: 'Classic Spiral', locked: false },
    { id: 'crystal',    name: 'Crystal',        locked: false },
    { id: 'star-tipped', name: 'Star Tipped',   locked: false },
    // Unlockable
    { id: 'glowing',    name: 'Glowing',        locked: true, zone: 'feelings-forest' },
    { id: 'rainbow',    name: 'Rainbow',        locked: true, zone: 'rainbow-meadow' },
    { id: 'heart',      name: 'Heart',          locked: true, zone: 'feelings-forest' },
];

export const WINGS = [
    { id: 'none',       name: 'None',           locked: false },
    { id: 'fairy',      name: 'Fairy Wings',    locked: false },
    { id: 'pegasus',    name: 'Pegasus Wings',  locked: false },
    // Unlockable
    { id: 'crystal',    name: 'Crystal Wings',  locked: true, zone: 'shape-mountain' },
    { id: 'butterfly',  name: 'Butterfly Wings', locked: true, zone: 'rainbow-meadow' },
    { id: 'galaxy',     name: 'Galaxy Wings',   locked: true, zone: 'star-observatory' },
];

export const EYES = [
    { id: 'big-round',  name: 'Big Round',   locked: false },
    { id: 'starry',     name: 'Starry',      locked: false },
    { id: 'sparkly',    name: 'Sparkly',     locked: false },
    { id: 'sleepy-cute', name: 'Sleepy Cute', locked: false },
    // Unlockable
    { id: 'heart',      name: 'Heart Eyes',   locked: true, zone: 'feelings-forest' },
    { id: 'gem',        name: 'Gem Eyes',     locked: true, zone: 'shape-mountain' },
];

export const ACCESSORIES = [
    { id: 'none',       name: 'None',          locked: false },
    { id: 'flower-crown', name: 'Flower Crown', locked: false },
    { id: 'bow',        name: 'Bow',           locked: false },
    { id: 'tiara',      name: 'Tiara',         locked: false },
    // Unlockable
    { id: 'necklace',   name: 'Necklace',      locked: true, zone: 'counting-creek' },
    { id: 'ankle-flowers', name: 'Ankle Flowers', locked: true, zone: 'rainbow-meadow' },
    { id: 'saddle',     name: 'Saddle',        locked: true, zone: 'shape-mountain' },
    { id: 'cape',       name: 'Cape',          locked: true, zone: 'places-playground' },
];

export const MAGIC_TRAILS = [
    { id: 'basic-sparkles', name: 'Sparkles', locked: false },
    // Unlockable
    { id: 'rainbow-trail',  name: 'Rainbow',  locked: true, zone: 'rainbow-meadow' },
    { id: 'star-trail',     name: 'Stars',    locked: true, zone: 'star-observatory' },
    { id: 'flower-trail',   name: 'Flowers',  locked: true, zone: 'letter-grove' },
    { id: 'bubble-trail',   name: 'Bubbles',  locked: true, zone: 'swimming-pool' },
    { id: 'water-trail',    name: 'Water',    locked: true, zone: 'counting-creek' },
    { id: 'music-trail',    name: 'Music',    locked: true, zone: 'music-pond' },
    { id: 'gem-trail',      name: 'Gems',     locked: true, zone: 'shape-mountain' },
    { id: 'friendship-trail', name: 'Hearts', locked: true, zone: 'feelings-forest' },
];

export const UNICORN_NAMES = [
    'Sparkle', 'Star', 'Luna', 'Blossom', 'Crystal',
    'Daisy', 'Rosie', 'Twinkle', 'Aurora', 'Bella',
    'Misty', 'Sugar', 'Cupcake', 'Moonbeam', 'Stardust'
];

/** Get all options for a category, marking locked/unlocked based on save state */
export function getOptions(category, unlockedItems) {
    const lists = {
        bodyColor: BODY_COLORS,
        maneColor: MANE_COLORS,
        maneStyle: MANE_STYLES,
        horn: HORNS,
        wings: WINGS,
        eyes: EYES,
        accessory: ACCESSORIES,
        magicTrail: MAGIC_TRAILS
    };
    const list = lists[category] || [];
    return list.map(item => ({
        ...item,
        locked: item.locked && !unlockedItems.includes(item.id)
    }));
}

/** Category display info for the creator tabs */
export const CATEGORIES = [
    { id: 'bodyColor',  icon: '🎨', name: 'Body' },
    { id: 'maneColor',  icon: '💇', name: 'Mane Colour' },
    { id: 'maneStyle',  icon: '✨', name: 'Mane Style' },
    { id: 'horn',       icon: '🦄', name: 'Horn' },
    { id: 'wings',      icon: '🦋', name: 'Wings' },
    { id: 'eyes',       icon: '👀', name: 'Eyes' },
    { id: 'accessory',  icon: '👑', name: 'Accessory' },
    { id: 'magicTrail', icon: '🌟', name: 'Trail' },
];
