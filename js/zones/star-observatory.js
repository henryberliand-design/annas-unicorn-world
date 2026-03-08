/**
 * star-observatory.js — Zone 7: Science & Nature
 * 3 mini-games: Star Connect, Planet Parade, Weather Watch
 */

import { MiniGameScene } from '../scenes/minigame.js';

// ─── Zone Menu ──────────────────────────────────────────────

export class StarObservatoryScene {
    constructor(game) {
        this.game = game;
        this.buttons = [];
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;
        const stars = this.game.save.state.starsPerZone['star-observatory'] || [0, 0, 0];

        this.buttons = [
            { x: W / 2 - 350, y: H / 2 - 60, w: 200, h: 120, icon: '⭐', name: 'Star Connect', idx: 0, stars: stars[0] },
            { x: W / 2 - 100, y: H / 2 - 60, w: 200, h: 120, icon: '🪐', name: 'Planet Parade', idx: 1, stars: stars[1] },
            { x: W / 2 + 150, y: H / 2 - 60, w: 200, h: 120, icon: '🌤️', name: 'Weather Watch', idx: 2, stars: stars[2] },
        ];
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };
        this.game.audio.speak('Welcome to the Star Observatory! Let\'s explore!');
        this.game.audio.startZoneMusic('star-observatory');
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Night sky
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#0d1b2a');
        grad.addColorStop(0.7, '#1b2838');
        grad.addColorStop(1, '#324a5f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Stars
        for (let i = 0; i < 60; i++) {
            const sx = (i * 137.5 + 50) % W;
            const sy = (i * 89.3 + 20) % (H * 0.7);
            const twinkle = 0.3 + Math.sin(time * 3 + i * 1.3) * 0.4;
            ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
        }

        // Dome silhouette
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(W / 2, H + 100, 350, Math.PI, 0);
        ctx.fill();

        ctx.font = 'bold 38px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd54f';
        ctx.fillText('🔭 Star Observatory', W / 2, 70);

        for (const btn of this.buttons) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 18);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 18);
            ctx.stroke();
            ctx.font = '36px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(btn.icon, btn.x + btn.w / 2, btn.y + 50);
            ctx.font = '16px -apple-system, sans-serif'; ctx.fillStyle = '#b0bec5';
            ctx.fillText(btn.name, btn.x + btn.w / 2, btn.y + 85);
            for (let s = 0; s < 3; s++) {
                ctx.fillStyle = s < btn.stars ? '#fbbf24' : 'rgba(255,255,255,0.15)';
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
                if (btn.idx === 0) this.game.scenes.switchTo(() => new StarConnectGame(this.game));
                else if (btn.idx === 1) this.game.scenes.switchTo(() => new PlanetParadeGame(this.game));
                else this.game.scenes.switchTo(() => new WeatherWatchGame(this.game));
                return;
            }
        }
    }
    destroy() {}
}

// ─── Mini-Game 1: Star Connect ──────────────────────────────
// Connect numbered stars to draw constellations

class StarConnectGame extends MiniGameScene {
    constructor(game) {
        super(game, 'star-observatory', 0, {
            title: '⭐ Star Connect',
            instructions: 'Connect the stars in order!',
            totalRounds: 5
        });
        this.stars = [];
        this.connectedLines = [];
        this.nextStarIdx = 0;
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 4 : level === 2 ? 6 : 8;
        this.nextStarIdx = 0;
        this.connectedLines = [];

        const W = this.game.W;
        const H = this.game.H;

        // Create constellation points
        this.stars = [];
        const cx = W / 2;
        const cy = H / 2;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const dist = 100 + Math.random() * 200;
            this.stars.push({
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist - 30,
                num: i + 1,
                connected: false,
                size: 18,
                twinkle: Math.random() * Math.PI * 2
            });
        }

        this.game.audio.speak(`Connect ${count} stars!`);
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#0a0e27');
        grad.addColorStop(1, '#1a237e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);

        // Background stars
        const time = this.game.time;
        for (let i = 0; i < 40; i++) {
            const sx = (i * 137.5) % this.game.W;
            const sy = (i * 89.3) % this.game.H;
            ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(time * 2 + i) * 0.15})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    onRender(ctx) {
        const time = this.game.time;

        // Connection lines
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 2;
        for (const line of this.connectedLines) {
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        }

        // Stars
        for (const star of this.stars) {
            const glow = 0.5 + Math.sin(time * 3 + star.twinkle) * 0.3;

            // Glow
            const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
            gradient.addColorStop(0, `rgba(255, 215, 0, ${glow})`);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
            ctx.fill();

            // Star dot
            ctx.fillStyle = star.connected ? '#ffd54f' : '#fff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * (star.connected ? 0.6 : 0.4), 0, Math.PI * 2);
            ctx.fill();

            // Number
            ctx.font = 'bold 16px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = star.connected ? '#fff' : '#ffd54f';
            ctx.fillText(String(star.num), star.x, star.y - star.size - 8);
        }

        // Hint
        ctx.font = '22px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#b0bec5';
        ctx.fillText(`Tap star ${this.nextStarIdx + 1}!`, this.game.W / 2, this.game.H - 60);
    }

    onTap(x, y) {
        for (const star of this.stars) {
            const dist = Math.sqrt((x - star.x) ** 2 + (y - star.y) ** 2);
            if (dist < star.size + 15) {
                if (star.num === this.nextStarIdx + 1) {
                    star.connected = true;
                    this.game.particles.addSparkle(star.x, star.y, 4, '#ffd54f');

                    if (this.nextStarIdx > 0) {
                        const prev = this.stars[this.nextStarIdx - 1];
                        this.connectedLines.push({
                            x1: prev.x, y1: prev.y,
                            x2: star.x, y2: star.y
                        });
                    }

                    this.nextStarIdx++;
                    if (this.nextStarIdx >= this.stars.length) {
                        this.roundSuccess();
                        if (this.phase === 'playing') setTimeout(() => this._newRound(), 700);
                    }
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's star ${star.num}. Find star ${this.nextStarIdx + 1}!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 2: Planet Parade ──────────────────────────────
// Sort planets by size or order from the sun

const PLANETS = [
    { name: 'Mercury', size: 20, color: '#9e9e9e', order: 1 },
    { name: 'Venus', size: 28, color: '#ffb74d', order: 2 },
    { name: 'Earth', size: 30, color: '#42a5f5', order: 3 },
    { name: 'Mars', size: 24, color: '#ef5350', order: 4 },
    { name: 'Jupiter', size: 55, color: '#ff8a65', order: 5 },
    { name: 'Saturn', size: 48, color: '#ffd54f', order: 6 },
    { name: 'Uranus', size: 38, color: '#4dd0e1', order: 7 },
    { name: 'Neptune', size: 36, color: '#5c6bc0', order: 8 },
];

class PlanetParadeGame extends MiniGameScene {
    constructor(game) {
        super(game, 'star-observatory', 1, {
            title: '🪐 Planet Parade',
            instructions: 'Put the planets in order!',
            totalRounds: 5
        });
        this.planets = [];
        this.slots = [];
        this.nextSlotIdx = 0;
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 3 : level === 2 ? 5 : 8;
        const subset = PLANETS.slice(0, count);
        this.nextSlotIdx = 0;

        const W = this.game.W;
        const H = this.game.H;

        // Shuffled planet buttons at bottom
        const shuffled = [...subset];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const spacing = W / (count + 1);
        this.planets = shuffled.map((p, i) => ({
            ...p,
            x: spacing * (i + 1),
            y: H - 140,
            placed: false
        }));

        // Slots at top
        this.slots = subset.map((p, i) => ({
            x: spacing * (i + 1),
            y: H / 2 - 80,
            planet: null,
            correctOrder: p.order
        }));

        this.game.audio.speak('Put the planets in order from the sun!');
    }

    onRenderBackground(ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.game.W, this.game.H);

        // Sun on left
        const sunGrad = ctx.createRadialGradient(0, this.game.H / 2 - 80, 0, 0, this.game.H / 2 - 80, 120);
        sunGrad.addColorStop(0, '#ffeb3b');
        sunGrad.addColorStop(0.5, '#ff9800');
        sunGrad.addColorStop(1, 'rgba(255,152,0,0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(0, this.game.H / 2 - 80, 120, 0, Math.PI * 2);
        ctx.fill();
    }

    onRender(ctx) {
        const R = this.game.renderer;

        // Slots
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            ctx.strokeStyle = i === this.nextSlotIdx ? '#ffd54f' : 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.arc(slot.x, slot.y, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#666';
            ctx.fillText(String(i + 1), slot.x, slot.y + 45);

            if (slot.planet) {
                ctx.fillStyle = slot.planet.color;
                ctx.beginPath();
                ctx.arc(slot.x, slot.y, slot.planet.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Planet choices
        for (const p of this.planets) {
            if (p.placed) continue;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.fill();

            // Saturn's ring
            if (p.name === 'Saturn') {
                ctx.strokeStyle = '#ffe082';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size, p.size * 0.25, 0.3, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.font = '14px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#b0bec5';
            ctx.fillText(p.name, p.x, p.y + p.size + 15);
        }

        ctx.font = '22px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#b0bec5';
        ctx.fillText('Tap the next planet closest to the sun!', this.game.W / 2, 110);
    }

    onTap(x, y) {
        for (const p of this.planets) {
            if (p.placed) continue;
            const dist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2);
            if (dist < p.size + 15) {
                const expectedOrder = this.slots[this.nextSlotIdx].correctOrder;
                if (p.order === expectedOrder) {
                    p.placed = true;
                    this.slots[this.nextSlotIdx].planet = p;
                    this.game.particles.addSparkle(p.x, p.y, 6, p.color);
                    this.game.audio.speak(p.name);
                    this.nextSlotIdx++;

                    if (this.nextSlotIdx >= this.slots.length) {
                        this.roundSuccess();
                        if (this.phase === 'playing') setTimeout(() => this._newRound(), 700);
                    }
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's ${p.name}. Which planet is closer to the sun?`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 3: Weather Watch ─────────────────────────────
// Match weather descriptions to the right weather type

const WEATHER = [
    { name: 'Sunny', icon: '☀️', desc: 'The sky is bright and warm!' },
    { name: 'Rainy', icon: '🌧️', desc: 'Water falls from the clouds!' },
    { name: 'Snowy', icon: '❄️', desc: 'White flakes fall from the sky!' },
    { name: 'Windy', icon: '💨', desc: 'The air is blowing really hard!' },
    { name: 'Cloudy', icon: '☁️', desc: 'The sky is covered in grey!' },
    { name: 'Stormy', icon: '⛈️', desc: 'Thunder and lightning!' },
    { name: 'Rainbow', icon: '🌈', desc: 'Colours appear after the rain!' },
    { name: 'Foggy', icon: '🌫️', desc: 'Everything looks misty and blurry!' },
];

class WeatherWatchGame extends MiniGameScene {
    constructor(game) {
        super(game, 'star-observatory', 2, {
            title: '🌤️ Weather Watch',
            instructions: 'Match the weather!',
            totalRounds: 5
        });
        this.target = null;
        this.options = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 3 : level === 2 ? 4 : 5;
        const shuffled = [...WEATHER];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const picked = shuffled.slice(0, count);
        this.target = picked[0];
        // Shuffle options
        for (let i = picked.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [picked[i], picked[j]] = [picked[j], picked[i]];
        }

        const W = this.game.W;
        const H = this.game.H;
        const spacing = W / (count + 1);

        this.options = picked.map((w, i) => ({
            weather: w,
            x: spacing * (i + 1) - 55,
            y: H / 2 + 50,
            w: 110,
            h: 110
        }));

        this.game.audio.speak(this.target.desc + ` What weather is this?`);
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#e3f2fd');
        grad.addColorStop(1, '#90caf9');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const R = this.game.renderer;

        // Description
        ctx.font = '26px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1565c0';
        ctx.fillText(this.target.desc, W / 2, 160);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('What weather is this?', W / 2, 200);

        // Weather options
        for (const opt of this.options) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            R.roundRect(ctx, opt.x, opt.y, opt.w, opt.h, 16);
            ctx.fill();

            ctx.font = '42px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(opt.weather.icon, opt.x + opt.w / 2, opt.y + 50);

            ctx.font = '14px -apple-system, sans-serif';
            ctx.fillStyle = '#555';
            ctx.fillText(opt.weather.name, opt.x + opt.w / 2, opt.y + 90);
        }
    }

    onTap(x, y) {
        const R = this.game.renderer;
        for (const opt of this.options) {
            if (R.hitTest(x, y, opt)) {
                if (opt.weather.name === this.target.name) {
                    this.game.particles.addSparkle(opt.x + opt.w / 2, opt.y, 10, '#42a5f5');
                    this.game.audio.speak(`Yes! That's ${opt.weather.name.toLowerCase()} weather!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 700);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's ${opt.weather.name.toLowerCase()}. Listen again!`);
                }
                return;
            }
        }
    }
}

// ─── Zone registration ──────────────────────────────────────
export function registerStarObservatory(game) {
    game.registerZone('star-observatory', (g) => new StarObservatoryScene(g));
}
