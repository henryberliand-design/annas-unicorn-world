/**
 * places-playground.js — Bonus Zone 2: Places & Geography
 * 3 mini-games: Animal Homes, Map Explorer, Around the World
 * Unlocked at 35 stars
 */

import { MiniGameScene } from '../scenes/minigame.js';

// ─── Zone Menu ──────────────────────────────────────────────

export class PlacesPlaygroundScene {
    constructor(game) {
        this.game = game;
        this.buttons = [];
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;
        const stars = this.game.save.state.starsPerZone['places-playground'] || [0, 0, 0];

        this.buttons = [
            { x: W / 2 - 350, y: H / 2 - 60, w: 200, h: 120, icon: '🏡', name: 'Animal Homes', idx: 0, stars: stars[0] },
            { x: W / 2 - 100, y: H / 2 - 60, w: 200, h: 120, icon: '🗺️', name: 'Map Explorer', idx: 1, stars: stars[1] },
            { x: W / 2 + 150, y: H / 2 - 60, w: 200, h: 120, icon: '🌍', name: 'Around the World', idx: 2, stars: stars[2] },
        ];
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };
        this.game.audio.speak('Welcome to Places Playground! Let\'s explore the world!');
        this.game.audio.startZoneMusic('places-playground');
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // World map background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#e8f5e9');
        grad.addColorStop(0.5, '#a5d6a7');
        grad.addColorStop(1, '#4fc3f7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Simple continents
        ctx.fillStyle = 'rgba(139, 195, 74, 0.3)';
        ctx.beginPath();
        ctx.ellipse(W * 0.25, H * 0.35, 150, 100, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(W * 0.55, H * 0.3, 120, 80, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(W * 0.75, H * 0.4, 100, 120, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 38px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1b5e20';
        ctx.fillText('🌍 Places Playground', W / 2, 70);

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
                if (btn.idx === 0) this.game.scenes.switchTo(() => new AnimalHomesGame(this.game));
                else if (btn.idx === 1) this.game.scenes.switchTo(() => new MapExplorerGame(this.game));
                else this.game.scenes.switchTo(() => new AroundTheWorldGame(this.game));
                return;
            }
        }
    }
    destroy() {}
}

// ─── Data ───────────────────────────────────────────────────

const ANIMAL_HOMES = [
    { animal: '🐻', home: 'Cave', homeIcon: '🏔️', habitat: 'Mountains' },
    { animal: '🐟', home: 'Ocean', homeIcon: '🌊', habitat: 'Water' },
    { animal: '🐒', home: 'Jungle', homeIcon: '🌴', habitat: 'Forest' },
    { animal: '🐧', home: 'Ice', homeIcon: '🧊', habitat: 'Arctic' },
    { animal: '🐫', home: 'Desert', homeIcon: '🏜️', habitat: 'Sandy' },
    { animal: '🐄', home: 'Farm', homeIcon: '🏡', habitat: 'Countryside' },
    { animal: '🦁', home: 'Savanna', homeIcon: '🌿', habitat: 'Grassland' },
    { animal: '🐸', home: 'Pond', homeIcon: '💧', habitat: 'Wetland' },
];

const LANDMARKS = [
    { name: 'Eiffel Tower', icon: '🗼', country: 'France' },
    { name: 'Pyramids', icon: '🔺', country: 'Egypt' },
    { name: 'Big Ben', icon: '🕐', country: 'England' },
    { name: 'Statue of Liberty', icon: '🗽', country: 'America' },
    { name: 'Panda', icon: '🐼', country: 'China' },
    { name: 'Kangaroo', icon: '🦘', country: 'Australia' },
    { name: 'Sushi', icon: '🍣', country: 'Japan' },
    { name: 'Pizza', icon: '🍕', country: 'Italy' },
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Mini-Game 1: Animal Homes ──────────────────────────────
// Match animals to their habitats

class AnimalHomesGame extends MiniGameScene {
    constructor(game) {
        super(game, 'places-playground', 0, {
            title: '🏡 Animal Homes',
            instructions: 'Where does this animal live?',
            totalRounds: 5
        });
        this.target = null;
        this.options = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 3 : level === 2 ? 4 : 5;
        const picked = shuffle(ANIMAL_HOMES).slice(0, count);
        this.target = picked[0];

        const W = this.game.W;
        const H = this.game.H;
        const spacing = W / (count + 1);

        this.options = shuffle(picked).map((ah, i) => ({
            ...ah,
            x: spacing * (i + 1) - 55,
            y: H / 2 + 50,
            w: 110,
            h: 110
        }));

        this.game.audio.speak(`Where does the ${this.target.animal} live?`);
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#e8f5e9');
        grad.addColorStop(1, '#a5d6a7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const R = this.game.renderer;

        // Animal
        ctx.font = '80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.target.animal, W / 2, 180);

        ctx.font = '24px -apple-system, sans-serif';
        ctx.fillStyle = '#2e7d32';
        ctx.fillText('Where does this animal live?', W / 2, 230);

        // Home options
        for (const opt of this.options) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            R.roundRect(ctx, opt.x, opt.y, opt.w, opt.h, 16);
            ctx.fill();

            ctx.font = '36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(opt.homeIcon, opt.x + opt.w / 2, opt.y + 45);

            ctx.font = '14px -apple-system, sans-serif';
            ctx.fillStyle = '#555';
            ctx.fillText(opt.home, opt.x + opt.w / 2, opt.y + 80);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#999';
            ctx.fillText(opt.habitat, opt.x + opt.w / 2, opt.y + 98);
        }
    }

    onTap(x, y) {
        const R = this.game.renderer;
        for (const opt of this.options) {
            if (R.hitTest(x, y, opt)) {
                if (opt.home === this.target.home) {
                    this.game.particles.addSparkle(opt.x + opt.w / 2, opt.y, 10, '#66bb6a');
                    this.game.audio.speak(`Yes! The ${this.target.animal} lives in the ${opt.home.toLowerCase()}!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 800);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`The ${opt.animal} lives there. Try again!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 2: Map Explorer ──────────────────────────────
// Match landmarks/foods to countries

class MapExplorerGame extends MiniGameScene {
    constructor(game) {
        super(game, 'places-playground', 1, {
            title: '🗺️ Map Explorer',
            instructions: 'Where is this from?',
            totalRounds: 5
        });
        this.target = null;
        this.options = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 3 : level === 2 ? 4 : 5;
        const picked = shuffle(LANDMARKS).slice(0, count);
        this.target = picked[0];

        const W = this.game.W;
        const H = this.game.H;
        const spacing = W / (count + 1);

        this.options = shuffle(picked).map((lm, i) => ({
            ...lm,
            x: spacing * (i + 1) - 55,
            y: H / 2 + 50,
            w: 110,
            h: 90
        }));

        this.game.audio.speak(`Where does the ${this.target.name} come from?`);
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

        // Landmark icon
        ctx.font = '80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.target.icon, W / 2, 170);

        ctx.font = '26px -apple-system, sans-serif';
        ctx.fillStyle = '#1565c0';
        ctx.fillText(this.target.name, W / 2, 210);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Where is this from?', W / 2, 250);

        // Country options
        for (const opt of this.options) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            R.roundRect(ctx, opt.x, opt.y, opt.w, opt.h, 16);
            ctx.fill();

            ctx.font = '20px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#333';
            ctx.fillText(opt.country, opt.x + opt.w / 2, opt.y + opt.h / 2);
        }
    }

    onTap(x, y) {
        const R = this.game.renderer;
        for (const opt of this.options) {
            if (R.hitTest(x, y, opt)) {
                if (opt.country === this.target.country) {
                    this.game.particles.addSparkle(opt.x + opt.w / 2, opt.y, 10, '#42a5f5');
                    this.game.audio.speak(`Yes! ${this.target.name} is from ${opt.country}!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 800);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's ${opt.country}. Try another!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 3: Around the World ──────────────────────────
// Match greetings to countries

const GREETINGS = [
    { word: 'Hello', lang: 'English', country: 'England', flag: '🇬🇧' },
    { word: 'Bonjour', lang: 'French', country: 'France', flag: '🇫🇷' },
    { word: 'Hola', lang: 'Spanish', country: 'Spain', flag: '🇪🇸' },
    { word: 'Ciao', lang: 'Italian', country: 'Italy', flag: '🇮🇹' },
    { word: 'Konnichiwa', lang: 'Japanese', country: 'Japan', flag: '🇯🇵' },
    { word: 'Ni hao', lang: 'Chinese', country: 'China', flag: '🇨🇳' },
    { word: 'Guten Tag', lang: 'German', country: 'Germany', flag: '🇩🇪' },
    { word: 'Namaste', lang: 'Hindi', country: 'India', flag: '🇮🇳' },
];

class AroundTheWorldGame extends MiniGameScene {
    constructor(game) {
        super(game, 'places-playground', 2, {
            title: '🌍 Around the World',
            instructions: 'Match the greeting!',
            totalRounds: 5
        });
        this.target = null;
        this.options = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 3 : level === 2 ? 4 : 5;
        const picked = shuffle(GREETINGS).slice(0, count);
        this.target = picked[0];

        const W = this.game.W;
        const H = this.game.H;
        const spacing = W / (count + 1);

        this.options = shuffle(picked).map((g, i) => ({
            ...g,
            x: spacing * (i + 1) - 60,
            y: H / 2 + 50,
            w: 120,
            h: 100
        }));

        this.game.audio.speak(`${this.target.word} means hello in ${this.target.lang}. Which country speaks ${this.target.lang}?`);
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#fff3e0');
        grad.addColorStop(1, '#ffe0b2');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const R = this.game.renderer;

        // Greeting word
        ctx.font = 'bold 60px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e65100';
        ctx.fillText(this.target.word, W / 2, 160);

        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#bf360c';
        ctx.fillText(`means "hello" in ${this.target.lang}`, W / 2, 200);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Which country?', W / 2, 240);

        // Country options
        for (const opt of this.options) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            R.roundRect(ctx, opt.x, opt.y, opt.w, opt.h, 16);
            ctx.fill();

            ctx.font = '36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(opt.flag, opt.x + opt.w / 2, opt.y + 40);

            ctx.font = '14px -apple-system, sans-serif';
            ctx.fillStyle = '#333';
            ctx.fillText(opt.country, opt.x + opt.w / 2, opt.y + 75);
        }
    }

    onTap(x, y) {
        const R = this.game.renderer;
        for (const opt of this.options) {
            if (R.hitTest(x, y, opt)) {
                if (opt.country === this.target.country) {
                    this.game.particles.addSparkle(opt.x + opt.w / 2, opt.y, 10, '#ff9800');
                    this.game.audio.speak(`Yes! They say ${this.target.word} in ${opt.country}!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 800);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`They say ${opt.word} in ${opt.country}. Try again!`);
                }
                return;
            }
        }
    }
}

// ─── Zone registration ──────────────────────────────────────
export function registerPlacesPlayground(game) {
    game.registerZone('places-playground', (g) => new PlacesPlaygroundScene(g));
}
