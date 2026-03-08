/**
 * rainbow-meadow.js — Zone 1: Colours & Patterns
 * 3 mini-games: Colour Garden, Rainbow Bridge, Pattern Petals
 */

import { MiniGameScene } from '../scenes/minigame.js';

// ─── Zone Menu (pick which mini-game) ────────────────────────

export class RainbowMeadowScene {
    constructor(game) {
        this.game = game;
        this.buttons = [];
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;
        const stars = this.game.save.state.starsPerZone['rainbow-meadow'];

        this.buttons = [
            { x: W / 2 - 350, y: H / 2 - 60, w: 200, h: 120, icon: '🌸', name: 'Colour Garden', idx: 0, stars: stars[0] },
            { x: W / 2 - 100, y: H / 2 - 60, w: 200, h: 120, icon: '🌈', name: 'Rainbow Bridge', idx: 1, stars: stars[1] },
            { x: W / 2 + 150, y: H / 2 - 60, w: 200, h: 120, icon: '🌼', name: 'Pattern Petals', idx: 2, stars: stars[2] },
        ];
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };

        this.game.audio.speak('Welcome to Rainbow Meadow! Pick a game!');
        this.game.audio.startZoneMusic('rainbow-meadow');
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Meadow background
        this._drawMeadowBg(ctx, time);

        // Title
        ctx.font = 'bold 42px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#166534';
        ctx.fillText('🌈 Rainbow Meadow', W / 2, 80);

        // Game buttons
        for (const btn of this.buttons) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 20);
            ctx.fill();

            // Glow if unplayed
            if (btn.stars === 0) {
                R.drawGlow(ctx, btn.x + btn.w / 2, btn.y + btn.h / 2, 80, time, '#98fb98');
            }

            // Icon
            ctx.font = '36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(btn.icon, btn.x + btn.w / 2, btn.y + 45);

            // Name
            ctx.font = '16px -apple-system, sans-serif';
            ctx.fillStyle = '#333';
            ctx.fillText(btn.name, btn.x + btn.w / 2, btn.y + 75);

            // Stars
            if (btn.stars > 0) {
                ctx.font = '14px sans-serif';
                ctx.fillStyle = '#fbbf24';
                ctx.fillText('⭐'.repeat(btn.stars), btn.x + btn.w / 2, btn.y + 100);
            }
        }

        // Back button
        R.drawButton(ctx, this.backButton, time);
    }

    _drawMeadowBg(ctx, time) {
        const W = this.game.W;
        const H = this.game.H;
        // Sky
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#87ceeb');
        grad.addColorStop(0.6, '#c8e6ff');
        grad.addColorStop(1, '#98fb98');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Rainbow arc
        const colors = ['#ff0000', '#ff8800', '#ffff00', '#00cc00', '#0088ff', '#8800ff'];
        for (let i = 0; i < colors.length; i++) {
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 12;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(W / 2, H, 350 + i * 15, Math.PI, 0);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Butterflies
        for (let i = 0; i < 5; i++) {
            const bx = (i * 370 + time * 40) % (W + 100) - 50;
            const by = 150 + Math.sin(time * 1.5 + i * 2) * 50;
            const wingFlap = Math.sin(time * 8 + i) * 0.3;
            ctx.save();
            ctx.translate(bx, by);
            ctx.fillStyle = ['#ff69b4', '#ffd700', '#87ceeb', '#dda0dd', '#ff6347'][i];
            // Left wing
            ctx.save();
            ctx.scale(1 + wingFlap, 1);
            ctx.beginPath();
            ctx.ellipse(-6, 0, 8, 5, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // Right wing
            ctx.save();
            ctx.scale(1 - wingFlap, 1);
            ctx.beginPath();
            ctx.ellipse(6, 0, 8, 5, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // Body
            ctx.fillStyle = '#333';
            ctx.fillRect(-1, -4, 2, 8);
            ctx.restore();
        }
    }

    handleInput(event) {
        if (event.type !== 'tap') return;
        const { x, y } = event;
        const R = this.game.renderer;

        if (R.hitTest(x, y, this.backButton)) {
            this.game.audio.playTap();
            this.game.goToHub();
            return;
        }

        for (const btn of this.buttons) {
            if (R.hitTest(x, y, btn)) {
                this.game.audio.playSparkle();
                const games = [ColourGardenGame, RainbowBridgeGame, PatternPetalsGame];
                this.game.scenes.switchTo(() => new games[btn.idx](this.game));
                return;
            }
        }
    }

    destroy() {
        this.game.audio.stopZoneMusic();
    }
}

// ─── Mini-Game 1: Colour Garden ──────────────────────────────
// Tap the flower that matches the spoken colour name

const COLOURS_L1 = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Green', hex: '#22c55e' },
];
const COLOURS_L2 = [
    ...COLOURS_L1,
    { name: 'Orange', hex: '#f97316' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Brown', hex: '#92400e' },
];
const COLOURS_L3 = [
    ...COLOURS_L2,
    { name: 'White', hex: '#f5f5f5' },
    { name: 'Black', hex: '#1f2937' },
    { name: 'Grey', hex: '#9ca3af' },
    { name: 'Gold', hex: '#fbbf24' },
];

class ColourGardenGame extends MiniGameScene {
    constructor(game) {
        super(game, 'rainbow-meadow', 0, {
            title: '🌸 Colour Garden',
            instructions: 'Tap the flower with the right colour!',
            totalRounds: 5
        });
        this.flowers = [];
        this.targetColour = null;
        this.shakeWrong = 0;
    }

    onStartPlaying() {
        this._newRound();
    }

    _newRound() {
        const level = this.difficulty;
        const palette = level === 1 ? COLOURS_L1 : level === 2 ? COLOURS_L2 : COLOURS_L3;
        const count = level === 1 ? 4 : level === 2 ? 6 : 8;

        // Pick target
        this.targetColour = palette[Math.floor(Math.random() * palette.length)];

        // Generate flowers — ensure target is included
        const selected = [this.targetColour];
        const others = palette.filter(c => c.name !== this.targetColour.name);
        while (selected.length < count && others.length > 0) {
            const idx = Math.floor(Math.random() * others.length);
            selected.push(others.splice(idx, 1)[0]);
        }

        // Shuffle
        for (let i = selected.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selected[i], selected[j]] = [selected[j], selected[i]];
        }

        // Layout flowers in a grid
        const W = this.game.W;
        const H = this.game.H;
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const spacing = 140;
        const startX = W / 2 - (cols * spacing) / 2 + spacing / 2;
        const startY = H / 2 - (rows * spacing) / 2 + spacing / 2 + 40;

        this.flowers = selected.map((c, i) => ({
            colour: c,
            x: startX + (i % cols) * spacing,
            y: startY + Math.floor(i / cols) * spacing,
            size: 40,
            wobble: 0
        }));

        // Speak the colour
        this.game.audio.speak(`Find the ${this.targetColour.name} flower!`);
    }

    onUpdate(dt) {
        this.shakeWrong = Math.max(0, this.shakeWrong - dt * 5);
        this.flowers.forEach(f => {
            f.wobble = Math.max(0, f.wobble - dt * 3);
        });
    }

    onRenderBackground(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#87ceeb');
        grad.addColorStop(1, '#98fb98');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    onRender(ctx) {
        const time = this.game.time;

        // Target label at top
        if (this.targetColour) {
            ctx.font = 'bold 32px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = this.targetColour.hex;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.strokeText(`Find: ${this.targetColour.name}`, this.game.W / 2, 100);
            ctx.fillText(`Find: ${this.targetColour.name}`, this.game.W / 2, 100);
        }

        // Flowers
        for (const f of this.flowers) {
            ctx.save();
            ctx.translate(f.x, f.y);

            // Wobble on wrong tap
            if (f.wobble > 0) {
                ctx.translate(Math.sin(time * 30) * f.wobble * 5, 0);
            }

            // Stem
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, f.size * 0.3);
            ctx.lineTo(0, f.size);
            ctx.stroke();

            // Petals
            ctx.fillStyle = f.colour.hex;
            for (let p = 0; p < 6; p++) {
                const angle = (Math.PI * 2 * p) / 6 + Math.sin(time + f.x) * 0.05;
                const px = Math.cos(angle) * f.size * 0.4;
                const py = Math.sin(angle) * f.size * 0.4;
                ctx.beginPath();
                ctx.ellipse(px, py, f.size * 0.25, f.size * 0.15, angle, 0, Math.PI * 2);
                ctx.fill();
            }

            // Center
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(0, 0, f.size * 0.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    onTap(x, y) {
        for (const f of this.flowers) {
            const dist = Math.sqrt((x - f.x) ** 2 + (y - f.y) ** 2);
            if (dist < f.size * 0.6) {
                if (f.colour.name === this.targetColour.name) {
                    this.game.particles.addSparkle(f.x, f.y, 12, f.colour.hex);
                    this.roundSuccess();
                    if (this.phase === 'playing') {
                        setTimeout(() => this._newRound(), 600);
                    }
                } else {
                    f.wobble = 1;
                    this.roundStruggle();
                    this.game.audio.speak(`That's ${f.colour.name}. Try again!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 2: Rainbow Bridge ─────────────────────────────
// Drag colour bands into correct rainbow order

const RAINBOW_COLORS = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Violet', hex: '#a855f7' },
];

class RainbowBridgeGame extends MiniGameScene {
    constructor(game) {
        super(game, 'rainbow-meadow', 1, {
            title: '🌈 Rainbow Bridge',
            instructions: 'Put the rainbow in the right order!',
            totalRounds: 3
        });
        this.bands = [];
        this.slots = [];
        this.dragging = null;
        this.bandCount = 3;
    }

    onStartPlaying() {
        this._newRound();
    }

    _newRound() {
        const level = this.difficulty;
        this.bandCount = level === 1 ? 3 : level === 2 ? 5 : 7;
        const colors = RAINBOW_COLORS.slice(0, this.bandCount);

        const W = this.game.W;
        const H = this.game.H;

        // Slots (correct positions) — arc at top
        this.slots = colors.map((c, i) => ({
            color: c,
            x: W / 2,
            y: 200,
            radius: 250 - i * 25,
            filled: false
        }));

        // Bands (shuffled) — at bottom
        const shuffled = [...colors];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const bandW = 80;
        const startX = W / 2 - (this.bandCount * (bandW + 15)) / 2;
        this.bands = shuffled.map((c, i) => ({
            color: c,
            x: startX + i * (bandW + 15),
            y: H - 200,
            w: bandW,
            h: 50,
            placed: false,
            correctIndex: colors.indexOf(c)
        }));

        this.nextSlotIndex = 0;
        this.game.audio.speak('Build the rainbow from the outside in!');
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#c8e6ff');
        grad.addColorStop(1, '#98fb98');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;

        // Draw placed rainbow arcs
        for (let i = 0; i < this.nextSlotIndex; i++) {
            const slot = this.slots[i];
            ctx.strokeStyle = slot.color.hex;
            ctx.lineWidth = 22;
            ctx.beginPath();
            ctx.arc(slot.x, slot.y + 200, slot.radius, Math.PI, 0);
            ctx.stroke();
        }

        // Ghost arc for next slot
        if (this.nextSlotIndex < this.slots.length) {
            const next = this.slots[this.nextSlotIndex];
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 22;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.arc(next.x, next.y + 200, next.radius, Math.PI, 0);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw unplaced bands
        const R = this.game.renderer;
        for (const band of this.bands) {
            if (band.placed) continue;
            ctx.fillStyle = band.color.hex;
            R.roundRect(ctx, band.x, band.y, band.w, band.h, 10);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 2;
            R.roundRect(ctx, band.x, band.y, band.w, band.h, 10);
            ctx.stroke();

            // Label
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.fillText(band.color.name, band.x + band.w / 2, band.y + band.h / 2 + 5);
        }
    }

    onTap(x, y) {
        // Tap a band to try placing it
        const R = this.game.renderer;
        for (const band of this.bands) {
            if (band.placed) continue;
            if (R.hitTest(x, y, band)) {
                if (band.correctIndex === this.nextSlotIndex) {
                    // Correct!
                    band.placed = true;
                    this.nextSlotIndex++;
                    this.game.audio.playCorrect();
                    this.game.dda.recordSuccess(this.miniGameId);
                    this.game.particles.addSparkle(this.game.W / 2, 300, 8, band.color.hex);

                    if (this.nextSlotIndex >= this.slots.length) {
                        // Rainbow complete!
                        this.roundSuccess();
                        if (this.phase === 'playing') {
                            setTimeout(() => this._newRound(), 800);
                        }
                    }
                } else {
                    this.game.dda.recordStruggle(this.miniGameId);
                    this.game.audio.playGentle();
                    this.game.audio.speak(`That's ${band.color.name}. Try ${RAINBOW_COLORS[this.nextSlotIndex].name}!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 3: Pattern Petals ─────────────────────────────
// Complete the repeating pattern

const PETAL_COLORS = [
    { id: 'red', hex: '#ef4444' },
    { id: 'blue', hex: '#3b82f6' },
    { id: 'yellow', hex: '#eab308' },
    { id: 'green', hex: '#22c55e' },
    { id: 'pink', hex: '#ec4899' },
    { id: 'purple', hex: '#a855f7' },
];

class PatternPetalsGame extends MiniGameScene {
    constructor(game) {
        super(game, 'rainbow-meadow', 2, {
            title: '🌼 Pattern Petals',
            instructions: 'What comes next in the pattern?',
            totalRounds: 5
        });
        this.pattern = [];
        this.displayPattern = [];
        this.choices = [];
        this.correctAnswer = null;
        this.missingIndex = -1;
    }

    onStartPlaying() {
        this._newRound();
    }

    _newRound() {
        const level = this.difficulty;

        // Generate pattern based on level
        let basePattern;
        if (level === 1) {
            // AB pattern
            const a = PETAL_COLORS[Math.floor(Math.random() * 3)];
            const b = PETAL_COLORS[3 + Math.floor(Math.random() * 3)];
            basePattern = [a, b];
        } else if (level === 2) {
            // ABB pattern
            const a = PETAL_COLORS[Math.floor(Math.random() * 3)];
            const b = PETAL_COLORS[3 + Math.floor(Math.random() * 3)];
            basePattern = [a, b, b];
        } else {
            // ABC pattern
            const indices = [];
            while (indices.length < 3) {
                const idx = Math.floor(Math.random() * 6);
                if (!indices.includes(idx)) indices.push(idx);
            }
            basePattern = indices.map(i => PETAL_COLORS[i]);
        }

        // Repeat pattern to fill display
        const displayLen = basePattern.length * 3;
        this.displayPattern = [];
        for (let i = 0; i < displayLen; i++) {
            this.displayPattern.push(basePattern[i % basePattern.length]);
        }

        // Remove the last one as the "missing" piece
        this.missingIndex = displayLen - 1;
        this.correctAnswer = this.displayPattern[this.missingIndex];

        // Create choices (correct + 2 wrong)
        const wrong = PETAL_COLORS.filter(c => c.id !== this.correctAnswer.id);
        const shuffled = [this.correctAnswer];
        while (shuffled.length < 3) {
            const idx = Math.floor(Math.random() * wrong.length);
            if (!shuffled.find(s => s.id === wrong[idx].id)) {
                shuffled.push(wrong[idx]);
            }
        }
        // Shuffle choices
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const W = this.game.W;
        const H = this.game.H;
        this.choices = shuffled.map((c, i) => ({
            color: c,
            x: W / 2 - 150 + i * 130,
            y: H - 200,
            size: 45
        }));

        this.game.audio.speak('What colour comes next?');
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#fde4cf');
        grad.addColorStop(1, '#98fb98');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const time = this.game.time;

        // Pattern display
        const petalSize = 35;
        const spacing = petalSize * 2.5;
        const startX = W / 2 - (this.displayPattern.length * spacing) / 2 + spacing / 2;
        const patternY = H / 2 - 60;

        for (let i = 0; i < this.displayPattern.length; i++) {
            const px = startX + i * spacing;

            if (i === this.missingIndex) {
                // Question mark
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 3;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.arc(px, patternY, petalSize, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.font = 'bold 28px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#999';
                ctx.fillText('?', px, patternY);
            } else {
                // Flower petal
                this._drawPetal(ctx, px, patternY, petalSize, this.displayPattern[i].hex, time);
            }
        }

        // Choice buttons
        for (const choice of this.choices) {
            this._drawPetal(ctx, choice.x, choice.y, choice.size, choice.color.hex, time);
        }

        // Label
        ctx.font = '24px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#555';
        ctx.fillText('Tap the next colour!', W / 2, H - 120);
    }

    _drawPetal(ctx, x, y, size, hex, time) {
        // Simple flower
        ctx.fillStyle = hex;
        for (let p = 0; p < 5; p++) {
            const angle = (Math.PI * 2 * p) / 5;
            const px = x + Math.cos(angle) * size * 0.35;
            const py = y + Math.sin(angle) * size * 0.35;
            ctx.beginPath();
            ctx.ellipse(px, py, size * 0.25, size * 0.15, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    onTap(x, y) {
        for (const choice of this.choices) {
            const dist = Math.sqrt((x - choice.x) ** 2 + (y - choice.y) ** 2);
            if (dist < choice.size) {
                if (choice.color.id === this.correctAnswer.id) {
                    this.game.particles.addSparkle(choice.x, choice.y, 10, choice.color.hex);
                    this.roundSuccess();
                    if (this.phase === 'playing') {
                        setTimeout(() => this._newRound(), 600);
                    }
                } else {
                    this.roundStruggle();
                    this.game.audio.speak('Try again!');
                }
                return;
            }
        }
    }
}

// ─── Zone registration ───────────────────────────────────────
export function registerRainbowMeadow(game) {
    game.registerZone('rainbow-meadow', (g) => new RainbowMeadowScene(g));
}
