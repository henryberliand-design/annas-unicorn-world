/**
 * save.js — Persistent game state via localStorage
 * Tracks unicorn customisation, progress, unlocks, garden
 */

const SAVE_KEY = 'annas-unicorn-world-save';

const DEFAULT_STATE = () => ({
    // Unicorn customisation
    unicorn: {
        name: '',
        bodyColor: '#ffb6c1',    // pink default
        maneColor: '#ff69b4',
        maneStyle: 'flowing',
        horn: 'classic',
        wings: 'none',
        eyes: 'big-round',
        accessory: 'none',
        magicTrail: 'basic-sparkles'
    },

    // Progress tracking
    starsPerZone: {
        'rainbow-meadow': [0, 0, 0],
        'counting-creek': [0, 0, 0],
        'letter-grove': [0, 0, 0],
        'shape-mountain': [0, 0, 0],
        'music-pond': [0, 0, 0],
        'feelings-forest': [0, 0, 0],
        'star-observatory': [0, 0, 0],
        'places-playground': [0, 0, 0]
    },

    // Zones visited / completed
    zonesVisited: [],
    zonesCompleted: [],

    // Unlocked items (customisation rewards)
    unlockedItems: [],

    // Companion creatures unlocked
    companionsUnlocked: [],

    // Powers unlocked
    powersUnlocked: [],

    // Garden decorations placed
    garden: {
        decorations: [],   // { id, x, y, type }
        unlockedDecorations: []
    },

    // Bonus zones
    swimmingPoolOpen: false,
    playgroundOpen: false,

    // Session tracking
    totalPlayTime: 0,
    lastPlayed: null
});

export class SaveManager {
    constructor() {
        this.state = this.load();
    }

    load() {
        try {
            const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
            if (saved) {
                // Merge with defaults to handle new fields
                const defaults = DEFAULT_STATE();
                return this._deepMerge(defaults, saved);
            }
        } catch (e) { /* ignore */ }
        return DEFAULT_STATE();
    }

    save() {
        this.state.lastPlayed = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    }

    reset() {
        this.state = DEFAULT_STATE();
        this.save();
    }

    // ─── Convenience methods ─────────────────────────────────

    /** Total stars earned across all zones */
    get totalStars() {
        let total = 0;
        for (const zone of Object.values(this.state.starsPerZone)) {
            for (const s of zone) total += s;
        }
        return total;
    }

    /** Award stars for completing a mini-game */
    awardStars(zoneId, miniGameIndex, stars) {
        if (!this.state.starsPerZone[zoneId]) return;
        const current = this.state.starsPerZone[zoneId][miniGameIndex];
        // Only update if better
        if (stars > current) {
            this.state.starsPerZone[zoneId][miniGameIndex] = stars;
        }
        this._checkUnlocks();
        this.save();
    }

    /** Mark zone as visited */
    visitZone(zoneId) {
        if (!this.state.zonesVisited.includes(zoneId)) {
            this.state.zonesVisited.push(zoneId);
            this.save();
        }
    }

    /** Mark zone as completed (all 3 mini-games done) */
    completeZone(zoneId) {
        if (!this.state.zonesCompleted.includes(zoneId)) {
            this.state.zonesCompleted.push(zoneId);
            this.save();
        }
    }

    /** Check if a zone's stars are all > 0 */
    isZoneComplete(zoneId) {
        const stars = this.state.starsPerZone[zoneId];
        return stars && stars.every(s => s > 0);
    }

    /** Unlock a customisation item */
    unlockItem(itemId) {
        if (!this.state.unlockedItems.includes(itemId)) {
            this.state.unlockedItems.push(itemId);
            this.save();
        }
    }

    /** Unlock a companion creature */
    unlockCompanion(creatureId) {
        if (!this.state.companionsUnlocked.includes(creatureId)) {
            this.state.companionsUnlocked.push(creatureId);
            this.save();
        }
    }

    /** Update unicorn customisation */
    updateUnicorn(changes) {
        Object.assign(this.state.unicorn, changes);
        this.save();
    }

    /** Check star thresholds for power/zone unlocks */
    _checkUnlocks() {
        const stars = this.totalStars;
        const powers = this.state.powersUnlocked;

        if (stars >= 5 && !powers.includes('sparkle-trot')) powers.push('sparkle-trot');
        if (stars >= 15 && !powers.includes('bloom-touch')) powers.push('bloom-touch');
        if (stars >= 20) this.state.swimmingPoolOpen = true;
        if (stars >= 25 && !powers.includes('rainbow-jump')) powers.push('rainbow-jump');
        if (stars >= 35) {
            this.state.playgroundOpen = true;
            if (!powers.includes('glow-horn')) powers.push('glow-horn');
        }
        if (stars >= 50 && !powers.includes('flight')) powers.push('flight');
        if (stars >= 72 && !powers.includes('rainbow-burst')) powers.push('rainbow-burst');
    }

    /** Deep merge utility — merges source into target, keeping target structure */
    _deepMerge(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            if (key in target) {
                if (typeof target[key] === 'object' && !Array.isArray(target[key]) && target[key] !== null) {
                    result[key] = this._deepMerge(target[key], source[key] || {});
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }
}
