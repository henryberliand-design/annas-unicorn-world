/**
 * shape-mountain.js — Zone 4: Shapes & Spatial Awareness
 * 3 mini-games: Shape Sorter, Building Blocks, Shape Hunt
 */

import { MiniGameScene } from '../scenes/minigame.js';

// ─── Zone Menu ──────────────────────────────────────────────

export class ShapeMountainScene {
    constructor(game) {
        this.game = game;
        this.buttons = [];
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;
        const stars = this.game.save.state.starsPerZone['shape-mountain'] || [0, 0, 0];

        this.buttons = [
            { x: W / 2 - 350, y: H / 2 - 60, w: 200, h: 120, icon: '🔷', name: 'Shape Sorter', idx: 0, stars: stars[0] },
            { x: W / 2 - 100, y: H / 2 - 60, w: 200, h: 120, icon: '🧱', name: 'Building Blocks', idx: 1, stars: stars[1] },
            { x: W / 2 + 150, y: H / 2 - 60, w: 200, h: 120, icon: '🔍', name: 'Shape Hunt', idx: 2, stars: stars[2] },
        ];
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };
        this.game.audio.speak('Welcome to Shape Mountain! Let\'s explore shapes!');
        this.game.audio.startZoneMusic('shape-mountain');
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Mountain background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#e3f2fd');
        grad.addColorStop(0.5, '#90caf9');
        grad.addColorStop(1, '#795548');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Mountains
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(300, H * 0.3);
        ctx.lineTo(600, H * 0.6);
        ctx.lineTo(900, H * 0.25);
        ctx.lineTo(1200, H * 0.5);
        ctx.lineTo(1500, H * 0.2);
        ctx.lineTo(1920, H * 0.55);
        ctx.lineTo(1920, H);
        ctx.fill();

        // Snow caps
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(250, H * 0.32); ctx.lineTo(300, H * 0.3); ctx.lineTo(350, H * 0.34);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(850, H * 0.27); ctx.lineTo(900, H * 0.25); ctx.lineTo(950, H * 0.28);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(1450, H * 0.22); ctx.lineTo(1500, H * 0.2); ctx.lineTo(1550, H * 0.24);
        ctx.closePath(); ctx.fill();

        ctx.font = 'bold 38px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1565c0';
        ctx.fillText('⛰️ Shape Mountain', W / 2, 70);

        for (const btn of this.buttons) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 18);
            ctx.fill();
            ctx.font = '36px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(btn.icon, btn.x + btn.w / 2, btn.y + 50);
            ctx.font = '16px -apple-system, sans-serif'; ctx.fillStyle = '#555';
            ctx.fillText(btn.name, btn.x + btn.w / 2, btn.y + 85);
            for (let s = 0; s < 3; s++) {
                ctx.fillStyle = s < btn.stars ? '#fbbf24' : 'rgba(0,0,0,0.15)';
                ctx.font = '14px sans-serif';
                ctx.fillText('⭐', btn.x + btn.w / 2 - 20 + s * 20, btn.y + 108);
            }
        }
        R.drawButton(ctx, this.backButton, time);
    }

    handleInput(event) {
        if (event.type !== 'tap') return;
        const R = this.game.renderer;
        if (R.hitTest(event.x, event.y, this.backButton)) { this.game.goToHub(); return; }
        for (const btn of this.buttons) {
            if (R.hitTest(event.x, event.y, btn)) {
                this.game.audio.playSparkle();
                if (btn.idx === 0) this.game.scenes.switchTo(() => new ShapeSorterGame(this.game));
                else if (btn.idx === 1) this.game.scenes.switchTo(() => new BuildingBlocksGame(this.game));
                else this.game.scenes.switchTo(() => new ShapeHuntGame(this.game));
                return;
            }
        }
    }
    destroy() {}
}

// ─── Shape helpers ──────────────────────────────────────────

const SHAPES = [
    { id: 'circle', name: 'Circle', sides: 0 },
    { id: 'triangle', name: 'Triangle', sides: 3 },
    { id: 'square', name: 'Square', sides: 4 },
    { id: 'diamond', name: 'Diamond', sides: 4 },
    { id: 'star', name: 'Star', sides: 5 },
    { id: 'hexagon', name: 'Hexagon', sides: 6 },
    { id: 'rectangle', name: 'Rectangle', sides: 4 },
    { id: 'oval', name: 'Oval', sides: 0 },
    { id: 'heart', name: 'Heart', sides: 0 },
];

const SHAPE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#14b8a6'];

function drawShape(ctx, id, x, y, size) {
    ctx.beginPath();
    if (id === 'circle') {
        ctx.arc(x, y, size, 0, Math.PI * 2);
    } else if (id === 'triangle') {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.87, y + size * 0.5);
        ctx.lineTo(x - size * 0.87, y + size * 0.5);
        ctx.closePath();
    } else if (id === 'square') {
        ctx.rect(x - size, y - size, size * 2, size * 2);
    } else if (id === 'diamond') {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.7, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size * 0.7, y);
        ctx.closePath();
    } else if (id === 'star') {
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? size : size * 0.45;
            const angle = (Math.PI * i) / 5 - Math.PI / 2;
            const method = i === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x + Math.cos(angle) * r, y + Math.sin(angle) * r);
        }
        ctx.closePath();
    } else if (id === 'hexagon') {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6;
            const method = i === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x + Math.cos(angle) * size, y + Math.sin(angle) * size);
        }
        ctx.closePath();
    } else if (id === 'rectangle') {
        ctx.rect(x - size * 1.3, y - size * 0.7, size * 2.6, size * 1.4);
    } else if (id === 'oval') {
        ctx.ellipse(x, y, size * 1.2, size * 0.7, 0, 0, Math.PI * 2);
    } else if (id === 'heart') {
        const s = size * 0.6;
        ctx.moveTo(x, y + s * 1.2);
        ctx.bezierCurveTo(x - s * 2, y - s * 0.5, x - s * 0.5, y - s * 1.8, x, y - s * 0.5);
        ctx.bezierCurveTo(x + s * 0.5, y - s * 1.8, x + s * 2, y - s * 0.5, x, y + s * 1.2);
    }
    ctx.fill();
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Mini-Game 1: Shape Sorter ──────────────────────────────
// Voice says a shape name, tap the matching shape

class ShapeSorterGame extends MiniGameScene {
    constructor(game) {
        super(game, 'shape-mountain', 0, {
            title: '🔷 Shape Sorter',
            instructions: 'Find the shape I say!',
            totalRounds: 5
        });
        this.target = null;
        this.options = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 3 : level === 2 ? 4 : 6;
        const subset = level === 1 ? SHAPES.slice(0, 4) : level === 2 ? SHAPES.slice(0, 6) : SHAPES;
        const picked = shuffle(subset).slice(0, count);
        this.target = picked[0];

        const W = this.game.W;
        const H = this.game.H;
        const spacing = W / (count + 1);

        this.options = shuffle(picked).map((shape, i) => ({
            shape,
            x: spacing * (i + 1),
            y: H / 2 + 20,
            size: 50,
            color: SHAPE_COLORS[i % SHAPE_COLORS.length]
        }));

        this.game.audio.speak(`Find the ${this.target.name}!`);
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#e3f2fd');
        grad.addColorStop(1, '#bbdefb');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;

        // Target name
        ctx.font = 'bold 36px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1565c0';
        ctx.fillText(`Find the ${this.target.name}!`, W / 2, 150);

        // Shape options
        for (const opt of this.options) {
            ctx.fillStyle = opt.color;
            drawShape(ctx, opt.shape.id, opt.x, opt.y, opt.size);
        }
    }

    onTap(x, y) {
        for (const opt of this.options) {
            const dist = Math.sqrt((x - opt.x) ** 2 + (y - opt.y) ** 2);
            if (dist < opt.size + 15) {
                if (opt.shape.id === this.target.id) {
                    this.game.particles.addSparkle(opt.x, opt.y, 10, opt.color);
                    this.game.audio.speak(`Yes! That's a ${opt.shape.name}!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 700);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's a ${opt.shape.name}. Find the ${this.target.name}!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 2: Building Blocks ──────────────────────────
// Match shape outlines by tapping the correct block

class BuildingBlocksGame extends MiniGameScene {
    constructor(game) {
        super(game, 'shape-mountain', 1, {
            title: '🧱 Building Blocks',
            instructions: 'Which block fits the outline?',
            totalRounds: 5
        });
        this.target = null;
        this.blocks = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 3 : level === 2 ? 4 : 5;
        const picked = shuffle(SHAPES.slice(0, 7)).slice(0, count);
        this.target = picked[0];

        const W = this.game.W;
        const H = this.game.H;
        const spacing = W / (count + 1);

        this.blocks = shuffle(picked).map((shape, i) => ({
            shape,
            x: spacing * (i + 1),
            y: H / 2 + 100,
            size: 40,
            color: SHAPE_COLORS[i % SHAPE_COLORS.length]
        }));

        this.game.audio.speak(`Which block fits this shape?`);
    }

    onRenderBackground(ctx) {
        ctx.fillStyle = '#fff3e0';
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const H = this.game.H;

        // Outline at top
        ctx.save();
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 5]);
        ctx.beginPath();
        drawShape(ctx, this.target.id, W / 2, H / 2 - 80, 65);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        ctx.font = '22px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#795548';
        ctx.fillText('Which block fits?', W / 2, H / 2 - 10);

        // Block choices
        for (const b of this.blocks) {
            ctx.fillStyle = b.color;
            drawShape(ctx, b.shape.id, b.x, b.y, b.size);

            ctx.font = '14px sans-serif';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText(b.shape.name, b.x, b.y + b.size + 25);
        }
    }

    onTap(x, y) {
        for (const b of this.blocks) {
            const dist = Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2);
            if (dist < b.size + 15) {
                if (b.shape.id === this.target.id) {
                    this.game.particles.addSparkle(b.x, b.y, 10, b.color);
                    this.game.audio.speak(`Perfect! It's a ${b.shape.name}!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 700);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's a ${b.shape.name}. Try again!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 3: Shape Hunt ────────────────────────────────
// Find all instances of a shape in a mixed scene

class ShapeHuntGame extends MiniGameScene {
    constructor(game) {
        super(game, 'shape-mountain', 2, {
            title: '🔍 Shape Hunt',
            instructions: 'Find all the shapes!',
            totalRounds: 5
        });
        this.targetShape = null;
        this.sceneShapes = [];
        this.foundCount = 0;
        this.targetCount = 0;
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        this.targetCount = level === 1 ? 3 : level === 2 ? 4 : 5;
        const totalShapes = this.targetCount + 5 + level * 2;

        const targetIdx = Math.floor(Math.random() * 5);
        this.targetShape = SHAPES[targetIdx];
        this.foundCount = 0;

        const W = this.game.W;
        const H = this.game.H;

        this.sceneShapes = [];
        // Add target shapes
        for (let i = 0; i < this.targetCount; i++) {
            this.sceneShapes.push(this._randomPlacement(W, H, this.targetShape, true));
        }
        // Add distractor shapes
        const distractors = SHAPES.filter(s => s.id !== this.targetShape.id);
        for (let i = 0; i < totalShapes - this.targetCount; i++) {
            const s = distractors[Math.floor(Math.random() * distractors.length)];
            this.sceneShapes.push(this._randomPlacement(W, H, s, false));
        }

        // Shuffle display order
        for (let i = this.sceneShapes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.sceneShapes[i], this.sceneShapes[j]] = [this.sceneShapes[j], this.sceneShapes[i]];
        }

        this.game.audio.speak(`Find all the ${this.targetShape.name}s!`);
    }

    _randomPlacement(W, H, shape, isTarget) {
        return {
            shape,
            isTarget,
            found: false,
            x: 120 + Math.random() * (W - 240),
            y: 180 + Math.random() * (H - 380),
            size: 25 + Math.random() * 20,
            color: SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)],
            rotation: Math.random() * Math.PI * 0.3
        };
    }

    onRenderBackground(ctx) {
        ctx.fillStyle = '#f3e5f5';
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;

        // Instructions
        ctx.font = '24px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#6a1b9a';
        ctx.fillText(`Find all ${this.targetShape.name}s! (${this.foundCount}/${this.targetCount})`, W / 2, 120);

        // Show target shape
        ctx.fillStyle = '#ce93d8';
        drawShape(ctx, this.targetShape.id, W / 2, 165, 25);

        // All shapes
        for (const s of this.sceneShapes) {
            if (s.found) {
                ctx.globalAlpha = 0.2;
            }
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.fillStyle = s.color;
            drawShape(ctx, s.shape.id, 0, 0, s.size);
            ctx.restore();
            ctx.globalAlpha = 1;
        }
    }

    onTap(x, y) {
        for (const s of this.sceneShapes) {
            if (s.found) continue;
            const dist = Math.sqrt((x - s.x) ** 2 + (y - s.y) ** 2);
            if (dist < s.size + 15) {
                if (s.isTarget) {
                    s.found = true;
                    this.foundCount++;
                    this.game.particles.addSparkle(s.x, s.y, 6, s.color);
                    this.game.audio.speak(String(this.foundCount));

                    if (this.foundCount >= this.targetCount) {
                        this.roundSuccess();
                        if (this.phase === 'playing') setTimeout(() => this._newRound(), 700);
                    }
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's a ${s.shape.name}. Find the ${this.targetShape.name}!`);
                }
                return;
            }
        }
    }
}

// ─── Zone registration ──────────────────────────────────────
export function registerShapeMountain(game) {
    game.registerZone('shape-mountain', (g) => new ShapeMountainScene(g));
}
