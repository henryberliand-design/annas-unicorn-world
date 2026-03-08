/**
 * letter-grove.js — Zone 3: Letters & Early Reading
 * 3 mini-games: Alphabet Apples, Letter Sounds, Story Seeds
 */

import { MiniGameScene } from '../scenes/minigame.js';

// ─── Zone Menu ──────────────────────────────────────────────

export class LetterGroveScene {
    constructor(game) {
        this.game = game;
        this.buttons = [];
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;
        const stars = this.game.save.state.starsPerZone['letter-grove'] || [0, 0, 0];

        this.buttons = [
            { x: W / 2 - 350, y: H / 2 - 60, w: 200, h: 120, icon: '🍎', name: 'Alphabet Apples', idx: 0, stars: stars[0] },
            { x: W / 2 - 100, y: H / 2 - 60, w: 200, h: 120, icon: '🔤', name: 'Letter Sounds', idx: 1, stars: stars[1] },
            { x: W / 2 + 150, y: H / 2 - 60, w: 200, h: 120, icon: '🌱', name: 'Story Seeds', idx: 2, stars: stars[2] },
        ];
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };
        this.game.audio.speak('Welcome to Letter Grove! Let\'s learn letters!');
        this.game.audio.startZoneMusic('letter-grove');
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Forest background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#a7d7a7');
        grad.addColorStop(1, '#2d5a27');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Trees
        for (let i = 0; i < 6; i++) {
            const tx = 100 + i * 320;
            const sway = Math.sin(time * 0.5 + i) * 5;
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(tx - 15, H * 0.4, 30, H * 0.6);
            ctx.fillStyle = '#388e3c';
            ctx.beginPath();
            ctx.arc(tx + sway, H * 0.35, 80, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.font = 'bold 38px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1b5e20';
        ctx.fillText('🌳 Letter Grove', W / 2, 70);

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
                if (btn.idx === 0) this.game.scenes.switchTo(() => new AlphabetApplesGame(this.game));
                else if (btn.idx === 1) this.game.scenes.switchTo(() => new LetterSoundsGame(this.game));
                else this.game.scenes.switchTo(() => new StorySeedsGame(this.game));
                return;
            }
        }
    }
    destroy() {}
}

// ─── Data ───────────────────────────────────────────────────

const LETTER_DATA = [
    { letter: 'A', word: 'Apple', icon: '🍎' },
    { letter: 'B', word: 'Bear', icon: '🐻' },
    { letter: 'C', word: 'Cat', icon: '🐱' },
    { letter: 'D', word: 'Dog', icon: '🐕' },
    { letter: 'E', word: 'Elephant', icon: '🐘' },
    { letter: 'F', word: 'Fish', icon: '🐟' },
    { letter: 'G', word: 'Grapes', icon: '🍇' },
    { letter: 'H', word: 'Horse', icon: '🐴' },
    { letter: 'I', word: 'Ice cream', icon: '🍦' },
    { letter: 'J', word: 'Jelly', icon: '🍮' },
    { letter: 'K', word: 'Kite', icon: '🪁' },
    { letter: 'L', word: 'Lion', icon: '🦁' },
    { letter: 'M', word: 'Moon', icon: '🌙' },
    { letter: 'N', word: 'Nest', icon: '🪺' },
    { letter: 'O', word: 'Owl', icon: '🦉' },
    { letter: 'P', word: 'Penguin', icon: '🐧' },
    { letter: 'Q', word: 'Queen', icon: '👸' },
    { letter: 'R', word: 'Rainbow', icon: '🌈' },
    { letter: 'S', word: 'Sun', icon: '☀️' },
    { letter: 'T', word: 'Tree', icon: '🌲' },
    { letter: 'U', word: 'Umbrella', icon: '☂️' },
    { letter: 'V', word: 'Violin', icon: '🎻' },
    { letter: 'W', word: 'Whale', icon: '🐋' },
    { letter: 'X', word: 'Xylophone', icon: '🎵' },
    { letter: 'Y', word: 'Yarn', icon: '🧶' },
    { letter: 'Z', word: 'Zebra', icon: '🦓' },
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Mini-Game 1: Alphabet Apples ──────────────────────────
// Tap letters in ABC order on falling apples

class AlphabetApplesGame extends MiniGameScene {
    constructor(game) {
        super(game, 'letter-grove', 0, {
            title: '🍎 Alphabet Apples',
            instructions: 'Tap the letters in ABC order!',
            totalRounds: 5
        });
        this.apples = [];
        this.nextLetterIdx = 0;
        this.letterSet = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 4 : level === 2 ? 6 : 8;
        const startIdx = Math.floor(Math.random() * (26 - count));
        this.letterSet = LETTER_DATA.slice(startIdx, startIdx + count);
        this.nextLetterIdx = 0;

        const W = this.game.W;
        const H = this.game.H;
        const positions = shuffle(this.letterSet.map((_, i) => i));

        this.apples = this.letterSet.map((data, i) => ({
            ...data,
            x: 120 + positions[i] * ((W - 240) / (count - 1 || 1)),
            y: 200 + Math.random() * (H - 450),
            size: 45,
            tapped: false,
            bobPhase: Math.random() * Math.PI * 2
        }));

        const first = this.letterSet[0].letter;
        const last = this.letterSet[count - 1].letter;
        this.game.audio.speak(`Tap from ${first} to ${last}!`);
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#c8e6c9');
        grad.addColorStop(1, '#66bb6a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const time = this.game.time;
        for (const apple of this.apples) {
            const bob = Math.sin(time * 1.5 + apple.bobPhase) * 6;
            ctx.save();
            ctx.translate(apple.x, apple.y + bob);

            if (apple.tapped) {
                ctx.globalAlpha = 0.3;
            }

            // Apple circle
            ctx.fillStyle = apple.tapped ? '#aaa' : '#e53935';
            ctx.beginPath();
            ctx.arc(0, 0, apple.size, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(-apple.size * 0.2, -apple.size * 0.2, apple.size * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Letter
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${apple.size}px -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(apple.letter, 0, 2);

            // Stem
            ctx.strokeStyle = '#5d4037';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, -apple.size);
            ctx.lineTo(3, -apple.size - 10);
            ctx.stroke();

            ctx.restore();
        }

        // Hint
        if (this.nextLetterIdx < this.letterSet.length) {
            ctx.font = '24px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#1b5e20';
            ctx.fillText(`Find: ${this.letterSet[this.nextLetterIdx].letter}`, this.game.W / 2, this.game.H - 60);
        }
    }

    onTap(x, y) {
        for (const apple of this.apples) {
            if (apple.tapped) continue;
            const bob = Math.sin(this.game.time * 1.5 + apple.bobPhase) * 6;
            const dist = Math.sqrt((x - apple.x) ** 2 + (y - apple.y - bob) ** 2);
            if (dist < apple.size + 10) {
                if (apple.letter === this.letterSet[this.nextLetterIdx].letter) {
                    apple.tapped = true;
                    this.game.audio.speak(apple.letter);
                    this.game.particles.addSparkle(apple.x, apple.y, 6, '#e53935');
                    this.nextLetterIdx++;
                    if (this.nextLetterIdx >= this.letterSet.length) {
                        this.roundSuccess();
                        if (this.phase === 'playing') setTimeout(() => this._newRound(), 600);
                    }
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's ${apple.letter}. Find ${this.letterSet[this.nextLetterIdx].letter}!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 2: Letter Sounds ─────────────────────────────
// Hear a sound, tap the matching letter/picture

class LetterSoundsGame extends MiniGameScene {
    constructor(game) {
        super(game, 'letter-grove', 1, {
            title: '🔤 Letter Sounds',
            instructions: 'Listen and find the matching letter!',
            totalRounds: 5
        });
        this.targetLetter = null;
        this.options = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const optionCount = level === 1 ? 3 : level === 2 ? 4 : 5;
        const picked = shuffle(LETTER_DATA).slice(0, optionCount);
        this.targetLetter = picked[0];
        this.options = shuffle(picked);

        const W = this.game.W;
        const H = this.game.H;
        const spacing = W / (optionCount + 1);

        this.optionBtns = this.options.map((opt, i) => ({
            ...opt,
            x: spacing * (i + 1) - 60,
            y: H / 2 - 30,
            w: 120,
            h: 140
        }));

        this.game.audio.speak(`${this.targetLetter.letter} is for ${this.targetLetter.word}. Find the letter ${this.targetLetter.letter}!`);
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

        // Show icon hint
        ctx.font = '60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.targetLetter.icon, W / 2, 130);

        ctx.font = '22px -apple-system, sans-serif';
        ctx.fillStyle = '#2e7d32';
        ctx.fillText(`What letter does ${this.targetLetter.word} start with?`, W / 2, 180);

        // Option cards
        for (const opt of this.optionBtns) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            R.roundRect(ctx, opt.x, opt.y, opt.w, opt.h, 16);
            ctx.fill();

            ctx.font = 'bold 48px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#2e7d32';
            ctx.fillText(opt.letter, opt.x + opt.w / 2, opt.y + 65);

            ctx.font = '28px sans-serif';
            ctx.fillText(opt.icon, opt.x + opt.w / 2, opt.y + 110);
        }
    }

    onTap(x, y) {
        const R = this.game.renderer;
        for (const opt of this.optionBtns) {
            if (R.hitTest(x, y, opt)) {
                if (opt.letter === this.targetLetter.letter) {
                    this.game.particles.addSparkle(opt.x + opt.w / 2, opt.y, 10, '#66bb6a');
                    this.game.audio.speak(`Yes! ${opt.letter} is for ${opt.word}!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 800);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's ${opt.letter} for ${opt.word}. Try again!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 3: Story Seeds ───────────────────────────────
// Pick the right picture that starts with the shown letter

class StorySeedsGame extends MiniGameScene {
    constructor(game) {
        super(game, 'letter-grove', 2, {
            title: '🌱 Story Seeds',
            instructions: 'Which picture starts with this letter?',
            totalRounds: 5
        });
        this.targetLetter = null;
        this.choices = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const count = level === 1 ? 3 : level === 2 ? 4 : 5;
        const picked = shuffle(LETTER_DATA).slice(0, count);
        this.targetLetter = picked[0];
        this.choices = shuffle(picked);

        const W = this.game.W;
        const H = this.game.H;
        const spacing = W / (count + 1);

        this.choiceBtns = this.choices.map((c, i) => ({
            ...c,
            x: spacing * (i + 1) - 50,
            y: H / 2 + 20,
            w: 100,
            h: 100
        }));

        this.game.audio.speak(`Find something that starts with ${this.targetLetter.letter}!`);
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#fff9c4');
        grad.addColorStop(1, '#c8e6c9');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const R = this.game.renderer;

        // Show the letter prominently
        ctx.font = 'bold 100px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2e7d32';
        ctx.fillText(this.targetLetter.letter, W / 2, 200);

        ctx.font = '22px -apple-system, sans-serif';
        ctx.fillStyle = '#555';
        ctx.fillText('Which picture starts with this letter?', W / 2, 260);

        // Picture choices
        for (const c of this.choiceBtns) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            R.roundRect(ctx, c.x, c.y, c.w, c.h, 16);
            ctx.fill();

            ctx.font = '48px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(c.icon, c.x + c.w / 2, c.y + c.h / 2);
        }
    }

    onTap(x, y) {
        const R = this.game.renderer;
        for (const c of this.choiceBtns) {
            if (R.hitTest(x, y, c)) {
                if (c.letter === this.targetLetter.letter) {
                    this.game.particles.addSparkle(c.x + c.w / 2, c.y, 10, '#66bb6a');
                    this.game.audio.speak(`Yes! ${c.word} starts with ${c.letter}!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 800);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`${c.word} starts with ${c.letter}. Find ${this.targetLetter.letter}!`);
                }
                return;
            }
        }
    }
}

// ─── Zone registration ──────────────────────────────────────
export function registerLetterGrove(game) {
    game.registerZone('letter-grove', (g) => new LetterGroveScene(g));
}
