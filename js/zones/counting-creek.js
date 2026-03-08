/**
 * counting-creek.js — Zone 2: Numbers & Counting (1-20)
 * 3 mini-games: Stepping Stones, Firefly Jars, Fish Splash
 */

import { MiniGameScene } from '../scenes/minigame.js';

// ─── Zone Menu ──────────────────────────────────────────────

export class CountingCreekScene {
    constructor(game) {
        this.game = game;
        this.buttons = [];
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;
        const stars = this.game.save.state.starsPerZone['counting-creek'] || [0, 0, 0];

        this.buttons = [
            { x: W / 2 - 350, y: H / 2 - 60, w: 200, h: 120, icon: '🪨', name: 'Stepping Stones', idx: 0, stars: stars[0] },
            { x: W / 2 - 100, y: H / 2 - 60, w: 200, h: 120, icon: '🪲', name: 'Firefly Jars', idx: 1, stars: stars[1] },
            { x: W / 2 + 150, y: H / 2 - 60, w: 200, h: 120, icon: '🐟', name: 'Fish Splash', idx: 2, stars: stars[2] },
        ];
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };

        this.game.audio.speak('Welcome to Counting Creek! Let\'s count together!');
        this.game.audio.startZoneMusic('counting-creek');
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Creek background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#87ceeb');
        grad.addColorStop(0.6, '#a3d9a5');
        grad.addColorStop(1, '#4aa3df');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Water ripples at bottom
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const waveY = H * 0.75 + i * 30;
            ctx.beginPath();
            for (let x = 0; x < W; x += 10) {
                const y = waveY + Math.sin(x * 0.02 + time * 2 + i) * 8;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Title
        ctx.font = 'bold 38px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1e3a5f';
        ctx.fillText('🏞️ Counting Creek', W / 2, 70);

        // Game buttons
        for (const btn of this.buttons) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 18);
            ctx.fill();
            ctx.font = '36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(btn.icon, btn.x + btn.w / 2, btn.y + 50);
            ctx.font = '16px -apple-system, sans-serif';
            ctx.fillStyle = '#555';
            ctx.fillText(btn.name, btn.x + btn.w / 2, btn.y + 85);

            // Star display
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

        if (R.hitTest(event.x, event.y, this.backButton)) {
            this.game.goToHub();
            return;
        }

        for (const btn of this.buttons) {
            if (R.hitTest(event.x, event.y, btn)) {
                this.game.audio.playSparkle();
                if (btn.idx === 0) this.game.scenes.switchTo(() => new SteppingStonesGame(this.game));
                else if (btn.idx === 1) this.game.scenes.switchTo(() => new FireflyJarsGame(this.game));
                else this.game.scenes.switchTo(() => new FishSplashGame(this.game));
                return;
            }
        }
    }

    destroy() {}
}

// ─── Mini-Game 1: Stepping Stones ──────────────────────────
// Tap numbered stones in order to cross the creek

class SteppingStonesGame extends MiniGameScene {
    constructor(game) {
        super(game, 'counting-creek', 0, {
            title: '🪨 Stepping Stones',
            instructions: 'Tap the stones in order to cross!',
            totalRounds: 5
        });
        this.stones = [];
        this.nextNumber = 1;
        this.maxNumber = 5;
    }

    onStartPlaying() {
        this._newRound();
    }

    _newRound() {
        const level = this.difficulty;
        this.maxNumber = level === 1 ? 5 : level === 2 ? 8 : 10;
        this.nextNumber = 1;

        const W = this.game.W;
        const H = this.game.H;

        this.stones = [];
        for (let i = 1; i <= this.maxNumber; i++) {
            let x, y, tries = 0;
            do {
                x = 120 + Math.random() * (W - 240);
                y = 200 + Math.random() * (H - 400);
                tries++;
            } while (tries < 50 && this.stones.some(s =>
                Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2) < 100));

            this.stones.push({
                num: i, x, y,
                size: 40,
                tapped: false,
                bobPhase: Math.random() * Math.PI * 2
            });
        }

        this.game.audio.speak(`Tap 1 to ${this.maxNumber} in order!`);
    }

    onRenderBackground(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const time = this.game.time;
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#b3e5fc');
        grad.addColorStop(1, '#4fc3f7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Moving water
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            const baseY = H * 0.2 + i * H * 0.1;
            ctx.moveTo(0, baseY);
            for (let x = 0; x <= W; x += 20) {
                ctx.lineTo(x, baseY + Math.sin(x * 0.01 + time * 1.5 + i) * 15);
            }
            ctx.lineTo(W, baseY + 40);
            ctx.lineTo(0, baseY + 40);
            ctx.fill();
        }
    }

    onRender(ctx) {
        const time = this.game.time;

        for (const stone of this.stones) {
            const bob = Math.sin(time * 2 + stone.bobPhase) * 5;

            if (stone.tapped) {
                // Sunk stone
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#78909c';
            } else {
                ctx.globalAlpha = 1;
                ctx.fillStyle = stone.num === this.nextNumber ? '#8d6e63' : '#a1887f';
            }

            // Stone shape (ellipse)
            ctx.beginPath();
            ctx.ellipse(stone.x, stone.y + bob, stone.size, stone.size * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();

            // Number
            if (!stone.tapped) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 28px -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(stone.num), stone.x, stone.y + bob);
            }
            ctx.globalAlpha = 1;
        }

        // Current target hint
        ctx.font = '22px -apple-system, sans-serif';
        ctx.fillStyle = '#1e3a5f';
        ctx.textAlign = 'center';
        ctx.fillText(`Find number ${this.nextNumber}!`, this.game.W / 2, this.game.H - 60);
    }

    onTap(x, y) {
        for (const stone of this.stones) {
            if (stone.tapped) continue;
            const dist = Math.sqrt((x - stone.x) ** 2 + (y - stone.y) ** 2);
            if (dist < stone.size + 10) {
                if (stone.num === this.nextNumber) {
                    stone.tapped = true;
                    this.game.particles.addSparkle(stone.x, stone.y, 6, '#64b5f6');
                    this.game.audio.speak(String(stone.num));
                    this.nextNumber++;

                    if (this.nextNumber > this.maxNumber) {
                        this.roundSuccess();
                        if (this.phase === 'playing') {
                            setTimeout(() => this._newRound(), 600);
                        }
                    }
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's ${stone.num}. Find ${this.nextNumber}!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 2: Firefly Jars ─────────────────────────────
// Count the fireflies and tap the matching number

class FireflyJarsGame extends MiniGameScene {
    constructor(game) {
        super(game, 'counting-creek', 1, {
            title: '🪲 Firefly Jars',
            instructions: 'Count the fireflies!',
            totalRounds: 5
        });
        this.fireflies = [];
        this.correctCount = 0;
        this.choices = [];
    }

    onStartPlaying() {
        this._newRound();
    }

    _newRound() {
        const level = this.difficulty;
        const maxCount = level === 1 ? 5 : level === 2 ? 10 : 15;
        this.correctCount = 2 + Math.floor(Math.random() * (maxCount - 1));

        const W = this.game.W;
        const H = this.game.H;
        const jarCx = W / 2;
        const jarCy = H / 2 - 40;
        const jarW = 300;
        const jarH = 250;

        // Place fireflies in jar area
        this.fireflies = [];
        for (let i = 0; i < this.correctCount; i++) {
            this.fireflies.push({
                x: jarCx - jarW / 2 + 30 + Math.random() * (jarW - 60),
                y: jarCy - jarH / 2 + 30 + Math.random() * (jarH - 60),
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5
            });
        }

        // Choices: correct + 3 wrong
        const choices = [this.correctCount];
        while (choices.length < 4) {
            const wrong = this.correctCount + Math.floor(Math.random() * 6) - 3;
            if (wrong > 0 && wrong !== this.correctCount && !choices.includes(wrong)) {
                choices.push(wrong);
            }
        }
        // Shuffle
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        this.choices = choices.map((num, idx) => ({
            num,
            x: W / 2 - 200 + idx * 120,
            y: H - 160,
            w: 80,
            h: 70
        }));

        this.game.audio.speak('How many fireflies do you see?');
    }

    onRenderBackground(ctx) {
        // Night scene
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#1a1a2e');
        grad.addColorStop(1, '#16213e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);

        // Stars in sky
        const time = this.game.time;
        for (let i = 0; i < 30; i++) {
            const sx = (i * 137.5) % this.game.W;
            const sy = (i * 89.3) % (this.game.H * 0.4);
            const twinkle = 0.3 + Math.sin(time * 2 + i * 0.7) * 0.3;
            ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    onRender(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const time = this.game.time;
        const R = this.game.renderer;

        // Jar
        const jarCx = W / 2;
        const jarCy = H / 2 - 40;
        const jarW = 300;
        const jarH = 250;

        ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)';
        ctx.lineWidth = 3;
        R.roundRect(ctx, jarCx - jarW / 2, jarCy - jarH / 2, jarW, jarH, 20);
        ctx.stroke();
        ctx.fillStyle = 'rgba(200, 230, 255, 0.08)';
        R.roundRect(ctx, jarCx - jarW / 2, jarCy - jarH / 2, jarW, jarH, 20);
        ctx.fill();

        // Jar lid
        ctx.fillStyle = 'rgba(150, 180, 200, 0.4)';
        ctx.fillRect(jarCx - jarW / 2 - 10, jarCy - jarH / 2 - 15, jarW + 20, 20);

        // Fireflies
        for (const ff of this.fireflies) {
            const glow = 0.5 + Math.sin(time * ff.speed + ff.phase) * 0.3;
            const drift = Math.sin(time * 0.8 + ff.phase) * 15;

            // Glow
            const gradient = ctx.createRadialGradient(ff.x + drift, ff.y, 0, ff.x + drift, ff.y, 20);
            gradient.addColorStop(0, `rgba(255, 255, 100, ${glow})`);
            gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(ff.x + drift, ff.y, 20, 0, Math.PI * 2);
            ctx.fill();

            // Dot
            ctx.fillStyle = `rgba(255, 255, 150, ${0.7 + glow * 0.3})`;
            ctx.beginPath();
            ctx.arc(ff.x + drift, ff.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Number choices
        for (const choice of this.choices) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            R.roundRect(ctx, choice.x, choice.y, choice.w, choice.h, 12);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 200, 0.5)';
            ctx.lineWidth = 2;
            R.roundRect(ctx, choice.x, choice.y, choice.w, choice.h, 12);
            ctx.stroke();

            ctx.font = 'bold 32px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffe082';
            ctx.fillText(String(choice.num), choice.x + choice.w / 2, choice.y + choice.h / 2);
        }

        // Prompt
        ctx.font = '22px -apple-system, sans-serif';
        ctx.fillStyle = '#b3e5fc';
        ctx.textAlign = 'center';
        ctx.fillText('How many fireflies?', W / 2, 100);
    }

    onTap(x, y) {
        const R = this.game.renderer;
        for (const choice of this.choices) {
            if (R.hitTest(x, y, choice)) {
                if (choice.num === this.correctCount) {
                    this.game.particles.addSparkle(choice.x + choice.w / 2, choice.y, 10, '#ffe082');
                    this.game.audio.speak(`Yes! ${this.correctCount} fireflies!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') {
                        setTimeout(() => this._newRound(), 800);
                    }
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's ${choice.num}. Try counting again!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 3: Fish Splash ──────────────────────────────
// Tap the number of fish that the voice asks for

class FishSplashGame extends MiniGameScene {
    constructor(game) {
        super(game, 'counting-creek', 2, {
            title: '🐟 Fish Splash',
            instructions: 'Tap the right number of fish!',
            totalRounds: 5
        });
        this.fish = [];
        this.targetCount = 0;
        this.tappedCount = 0;
    }

    onStartPlaying() {
        this._newRound();
    }

    _newRound() {
        const level = this.difficulty;
        const maxTarget = level === 1 ? 4 : level === 2 ? 7 : 10;
        const totalFish = maxTarget + 3;
        this.targetCount = 1 + Math.floor(Math.random() * maxTarget);
        this.tappedCount = 0;

        const W = this.game.W;
        const H = this.game.H;

        this.fish = [];
        for (let i = 0; i < totalFish; i++) {
            let x, y, tries = 0;
            do {
                x = 100 + Math.random() * (W - 200);
                y = 200 + Math.random() * (H - 350);
                tries++;
            } while (tries < 50 && this.fish.some(f =>
                Math.sqrt((f.x - x) ** 2 + (f.y - y) ** 2) < 80));

            const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ec4899'];
            this.fish.push({
                x, y,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 30 + Math.random() * 15,
                tapped: false,
                phase: Math.random() * Math.PI * 2,
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }

        this.game.audio.speak(`Tap ${this.targetCount} fish!`);
    }

    onRenderBackground(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#87ceeb');
        grad.addColorStop(0.3, '#4fc3f7');
        grad.addColorStop(1, '#0277bd');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const time = this.game.time;

        // Draw fish
        for (const f of this.fish) {
            const swim = Math.sin(time * 1.5 + f.phase) * 20;
            const bob = Math.sin(time * 2 + f.phase) * 8;
            ctx.save();
            ctx.translate(f.x + swim, f.y + bob);
            ctx.scale(f.dir, 1);

            if (f.tapped) {
                ctx.globalAlpha = 0.4;
            }

            // Fish body
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, f.size, f.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tail
            ctx.beginPath();
            ctx.moveTo(-f.size * 0.8, 0);
            ctx.lineTo(-f.size * 1.3, -f.size * 0.4);
            ctx.lineTo(-f.size * 1.3, f.size * 0.4);
            ctx.closePath();
            ctx.fill();

            // Eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(f.size * 0.35, -f.size * 0.1, f.size * 0.18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(f.size * 0.4, -f.size * 0.1, f.size * 0.08, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Counter at top
        ctx.font = 'bold 28px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Tap ${this.targetCount} fish! (${this.tappedCount}/${this.targetCount})`, W / 2, 110);
    }

    onTap(x, y) {
        for (const f of this.fish) {
            if (f.tapped) continue;
            const swim = Math.sin(this.game.time * 1.5 + f.phase) * 20;
            const bob = Math.sin(this.game.time * 2 + f.phase) * 8;
            const dist = Math.sqrt((x - f.x - swim) ** 2 + (y - f.y - bob) ** 2);
            if (dist < f.size + 10) {
                f.tapped = true;
                this.tappedCount++;
                this.game.particles.addSparkle(f.x, f.y, 6, f.color);
                this.game.audio.speak(String(this.tappedCount));

                if (this.tappedCount === this.targetCount) {
                    this.roundSuccess();
                    if (this.phase === 'playing') {
                        setTimeout(() => this._newRound(), 800);
                    }
                } else if (this.tappedCount > this.targetCount) {
                    this.roundStruggle();
                    this.game.audio.speak('Too many! Let\'s try again.');
                    setTimeout(() => this._newRound(), 600);
                }
                return;
            }
        }
    }
}

// ─── Zone registration ──────────────────────────────────────
export function registerCountingCreek(game) {
    game.registerZone('counting-creek', (g) => new CountingCreekScene(g));
}
