/**
 * feelings-forest.js — Zone 6: Emotions & Social Skills
 * 3 mini-games: Feeling Faces, Kindness Quest, Emotion Garden
 */

import { MiniGameScene } from '../scenes/minigame.js';

// ─── Zone Menu ──────────────────────────────────────────────

export class FeelingsForestScene {
    constructor(game) {
        this.game = game;
        this.buttons = [];
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;
        const stars = this.game.save.state.starsPerZone['feelings-forest'] || [0, 0, 0];

        this.buttons = [
            { x: W / 2 - 350, y: H / 2 - 60, w: 200, h: 120, icon: '😊', name: 'Feeling Faces', idx: 0, stars: stars[0] },
            { x: W / 2 - 100, y: H / 2 - 60, w: 200, h: 120, icon: '💝', name: 'Kindness Quest', idx: 1, stars: stars[1] },
            { x: W / 2 + 150, y: H / 2 - 60, w: 200, h: 120, icon: '🌺', name: 'Emotion Garden', idx: 2, stars: stars[2] },
        ];
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };
        this.game.audio.speak('Welcome to Feelings Forest! How are you feeling?');
        this.game.audio.startZoneMusic('feelings-forest');
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Forest background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#e8f5e9');
        grad.addColorStop(0.5, '#81c784');
        grad.addColorStop(1, '#2e7d32');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Gentle trees
        for (let i = 0; i < 5; i++) {
            const tx = 150 + i * 380;
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(tx - 12, H * 0.45, 24, H * 0.55);
            ctx.fillStyle = `hsl(${120 + i * 15}, 50%, ${40 + i * 5}%)`;
            ctx.beginPath();
            ctx.arc(tx + Math.sin(time * 0.3 + i) * 3, H * 0.38, 70 + i * 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.font = 'bold 38px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1b5e20';
        ctx.fillText('🌲 Feelings Forest', W / 2, 70);

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
                if (btn.idx === 0) this.game.scenes.switchTo(() => new FeelingFacesGame(this.game));
                else if (btn.idx === 1) this.game.scenes.switchTo(() => new KindnessQuestGame(this.game));
                else this.game.scenes.switchTo(() => new EmotionGardenGame(this.game));
                return;
            }
        }
    }
    destroy() {}
}

// ─── Data ───────────────────────────────────────────────────

const EMOTIONS = [
    { name: 'Happy', emoji: '😊', color: '#ffd700' },
    { name: 'Sad', emoji: '😢', color: '#42a5f5' },
    { name: 'Angry', emoji: '😠', color: '#ef5350' },
    { name: 'Scared', emoji: '😨', color: '#ab47bc' },
    { name: 'Surprised', emoji: '😮', color: '#ff9800' },
    { name: 'Sleepy', emoji: '😴', color: '#78909c' },
    { name: 'Excited', emoji: '🤩', color: '#ff6f00' },
    { name: 'Shy', emoji: '🙈', color: '#f48fb1' },
    { name: 'Proud', emoji: '😊', color: '#66bb6a' },
    { name: 'Silly', emoji: '🤪', color: '#ba68c8' },
];

const SCENARIOS = [
    { text: 'Your friend shares their toy with you.', emotion: 'Happy' },
    { text: 'Your tower of blocks falls down.', emotion: 'Sad' },
    { text: 'Someone takes your favourite crayon.', emotion: 'Angry' },
    { text: 'You hear a loud thunderstorm.', emotion: 'Scared' },
    { text: 'You get a surprise birthday cake!', emotion: 'Surprised' },
    { text: 'You had a very busy day playing.', emotion: 'Sleepy' },
    { text: 'You\'re going to the playground!', emotion: 'Excited' },
    { text: 'You\'re meeting someone new.', emotion: 'Shy' },
    { text: 'You finished a big puzzle all by yourself!', emotion: 'Proud' },
    { text: 'You\'re making funny faces in the mirror.', emotion: 'Silly' },
];

const KIND_ACTIONS = [
    { text: 'Your friend dropped their lunch box.', kind: 'Help them pick it up', unkind: 'Walk away' },
    { text: 'Someone new joined your class.', kind: 'Say hello and smile', unkind: 'Ignore them' },
    { text: 'Your sister is sad.', kind: 'Give her a hug', unkind: 'Laugh at her' },
    { text: 'A friend can\'t reach a toy.', kind: 'Get it for them', unkind: 'Keep playing alone' },
    { text: 'Your mum is carrying heavy bags.', kind: 'Offer to help carry', unkind: 'Run ahead without helping' },
    { text: 'A friend fell and scraped their knee.', kind: 'Ask if they\'re okay', unkind: 'Keep playing' },
    { text: 'Someone is sitting alone at lunch.', kind: 'Invite them to sit with you', unkind: 'Pretend you don\'t see them' },
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Mini-Game 1: Feeling Faces ─────────────────────────────
// Match the scenario to the correct emotion

class FeelingFacesGame extends MiniGameScene {
    constructor(game) {
        super(game, 'feelings-forest', 0, {
            title: '😊 Feeling Faces',
            instructions: 'How would you feel?',
            totalRounds: 5
        });
        this.scenario = null;
        this.options = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const optCount = level === 1 ? 3 : level === 2 ? 4 : 5;

        const scenarioPool = shuffle(SCENARIOS);
        this.scenario = scenarioPool[0];
        const correctEmotion = EMOTIONS.find(e => e.name === this.scenario.emotion);

        const wrongEmotions = shuffle(EMOTIONS.filter(e => e.name !== this.scenario.emotion)).slice(0, optCount - 1);
        this.options = shuffle([correctEmotion, ...wrongEmotions]);

        const W = this.game.W;
        const H = this.game.H;
        const spacing = W / (this.options.length + 1);

        this.optionBtns = this.options.map((e, i) => ({
            emotion: e,
            x: spacing * (i + 1) - 50,
            y: H / 2 + 60,
            w: 100,
            h: 110
        }));

        this.game.audio.speak(this.scenario.text + ' How would you feel?');
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#fff8e1');
        grad.addColorStop(1, '#c8e6c9');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const R = this.game.renderer;

        // Scenario
        ctx.font = '24px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        // Word wrap
        const words = this.scenario.text.split(' ');
        let line = '';
        let lineY = 130;
        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > W * 0.7) {
                ctx.fillText(line.trim(), W / 2, lineY);
                line = word + ' ';
                lineY += 32;
            } else {
                line = test;
            }
        }
        ctx.fillText(line.trim(), W / 2, lineY);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('How would you feel?', W / 2, lineY + 50);

        // Emotion options
        for (const opt of this.optionBtns) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            R.roundRect(ctx, opt.x, opt.y, opt.w, opt.h, 16);
            ctx.fill();

            ctx.font = '42px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(opt.emotion.emoji, opt.x + opt.w / 2, opt.y + 50);

            ctx.font = '14px -apple-system, sans-serif';
            ctx.fillStyle = '#555';
            ctx.fillText(opt.emotion.name, opt.x + opt.w / 2, opt.y + 90);
        }
    }

    onTap(x, y) {
        const R = this.game.renderer;
        for (const opt of this.optionBtns) {
            if (R.hitTest(x, y, opt)) {
                if (opt.emotion.name === this.scenario.emotion) {
                    this.game.particles.addSparkle(opt.x + opt.w / 2, opt.y, 10, opt.emotion.color);
                    this.game.audio.speak(`Yes! You'd feel ${opt.emotion.name.toLowerCase()}!`);
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 800);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak(`That's ${opt.emotion.name.toLowerCase()}. Think about it again!`);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 2: Kindness Quest ────────────────────────────
// Choose the kind action in a scenario

class KindnessQuestGame extends MiniGameScene {
    constructor(game) {
        super(game, 'feelings-forest', 1, {
            title: '💝 Kindness Quest',
            instructions: 'Which is the kind thing to do?',
            totalRounds: 5
        });
        this.scenario = null;
        this.choices = [];
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const pool = shuffle(KIND_ACTIONS);
        this.scenario = pool[0];

        const W = this.game.W;
        const H = this.game.H;

        const isKindFirst = Math.random() > 0.5;
        this.choices = [
            {
                text: isKindFirst ? this.scenario.kind : this.scenario.unkind,
                isKind: isKindFirst,
                x: W / 2 - 250, y: H / 2 + 60, w: 220, h: 80
            },
            {
                text: isKindFirst ? this.scenario.unkind : this.scenario.kind,
                isKind: !isKindFirst,
                x: W / 2 + 30, y: H / 2 + 60, w: 220, h: 80
            }
        ];

        this.game.audio.speak(this.scenario.text + ' Which is the kind thing to do?');
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#fce4ec');
        grad.addColorStop(1, '#f8bbd0');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const R = this.game.renderer;

        // Scenario
        ctx.font = '24px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#880e4f';
        const words = this.scenario.text.split(' ');
        let line = '';
        let lineY = 140;
        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > W * 0.7) {
                ctx.fillText(line.trim(), W / 2, lineY);
                line = word + ' ';
                lineY += 32;
            } else {
                line = test;
            }
        }
        ctx.fillText(line.trim(), W / 2, lineY);

        // Choices
        for (const c of this.choices) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            R.roundRect(ctx, c.x, c.y, c.w, c.h, 16);
            ctx.fill();

            ctx.font = '18px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#333';
            // Simple word wrap in button
            const cWords = c.text.split(' ');
            let cLine = '';
            let cLineY = c.y + 30;
            for (const w of cWords) {
                const test = cLine + w + ' ';
                if (ctx.measureText(test).width > c.w - 20) {
                    ctx.fillText(cLine.trim(), c.x + c.w / 2, cLineY);
                    cLine = w + ' ';
                    cLineY += 22;
                } else {
                    cLine = test;
                }
            }
            ctx.fillText(cLine.trim(), c.x + c.w / 2, cLineY);
        }
    }

    onTap(x, y) {
        const R = this.game.renderer;
        for (const c of this.choices) {
            if (R.hitTest(x, y, c)) {
                if (c.isKind) {
                    this.game.particles.addSparkle(c.x + c.w / 2, c.y, 10, '#e91e63');
                    this.game.audio.speak('That\'s so kind! Well done!');
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 800);
                } else {
                    this.roundStruggle();
                    this.game.audio.speak('Let\'s think about which one is kinder.');
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 3: Emotion Garden ────────────────────────────
// Plant flowers by matching emotion faces

class EmotionGardenGame extends MiniGameScene {
    constructor(game) {
        super(game, 'feelings-forest', 2, {
            title: '🌺 Emotion Garden',
            instructions: 'Match the feelings to plant flowers!',
            totalRounds: 5
        });
        this.pairs = [];
        this.revealed = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.firstPick = -1;
        this.locked = false;
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        this.totalPairs = level === 1 ? 3 : level === 2 ? 4 : 5;
        this.matchedPairs = 0;
        this.firstPick = -1;
        this.locked = false;

        const emotions = shuffle(EMOTIONS).slice(0, this.totalPairs);
        // Each emotion appears twice (emoji card + name card)
        const cards = [];
        for (const e of emotions) {
            cards.push({ type: 'emoji', emotion: e, matched: false });
            cards.push({ type: 'name', emotion: e, matched: false });
        }

        const shuffled = shuffle(cards);
        const W = this.game.W;
        const H = this.game.H;
        const cols = Math.min(shuffled.length, 5);
        const rows = Math.ceil(shuffled.length / cols);
        const cardW = 110;
        const cardH = 90;
        const gap = 15;

        this.pairs = shuffled.map((card, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return {
                ...card,
                x: W / 2 - (cols * (cardW + gap)) / 2 + col * (cardW + gap) + gap / 2,
                y: H / 2 - (rows * (cardH + gap)) / 2 + row * (cardH + gap) + 20,
                w: cardW,
                h: cardH,
                faceUp: false
            };
        });

        this.game.audio.speak('Match the emotions!');
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#e8f5e9');
        grad.addColorStop(1, '#a5d6a7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const R = this.game.renderer;

        for (const card of this.pairs) {
            if (card.matched) {
                // Matched — show as flower
                ctx.fillStyle = `${card.emotion.color}44`;
                R.roundRect(ctx, card.x, card.y, card.w, card.h, 12);
                ctx.fill();
                ctx.font = '30px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🌸', card.x + card.w / 2, card.y + card.h / 2);
            } else if (card.faceUp) {
                // Face up
                ctx.fillStyle = `${card.emotion.color}33`;
                R.roundRect(ctx, card.x, card.y, card.w, card.h, 12);
                ctx.fill();
                ctx.strokeStyle = card.emotion.color;
                ctx.lineWidth = 2;
                R.roundRect(ctx, card.x, card.y, card.w, card.h, 12);
                ctx.stroke();

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (card.type === 'emoji') {
                    ctx.font = '36px sans-serif';
                    ctx.fillText(card.emotion.emoji, card.x + card.w / 2, card.y + card.h / 2);
                } else {
                    ctx.font = '18px -apple-system, sans-serif';
                    ctx.fillStyle = '#333';
                    ctx.fillText(card.emotion.name, card.x + card.w / 2, card.y + card.h / 2);
                }
            } else {
                // Face down
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                R.roundRect(ctx, card.x, card.y, card.w, card.h, 12);
                ctx.fill();
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('❓', card.x + card.w / 2, card.y + card.h / 2);
            }
        }
    }

    onTap(x, y) {
        if (this.locked) return;
        const R = this.game.renderer;

        for (let i = 0; i < this.pairs.length; i++) {
            const card = this.pairs[i];
            if (card.matched || card.faceUp) continue;
            if (R.hitTest(x, y, card)) {
                card.faceUp = true;
                this.game.audio.playTap();

                if (this.firstPick === -1) {
                    this.firstPick = i;
                } else {
                    const first = this.pairs[this.firstPick];
                    this.locked = true;

                    if (first.emotion.name === card.emotion.name && first.type !== card.type) {
                        // Match!
                        first.matched = true;
                        card.matched = true;
                        this.matchedPairs++;
                        this.game.particles.addSparkle(card.x + card.w / 2, card.y, 8, card.emotion.color);
                        this.game.audio.speak(card.emotion.name);

                        this.firstPick = -1;
                        this.locked = false;

                        if (this.matchedPairs >= this.totalPairs) {
                            this.roundSuccess();
                            if (this.phase === 'playing') setTimeout(() => this._newRound(), 700);
                        }
                    } else {
                        // No match — flip back
                        setTimeout(() => {
                            first.faceUp = false;
                            card.faceUp = false;
                            this.firstPick = -1;
                            this.locked = false;
                        }, 800);
                    }
                }
                return;
            }
        }
    }
}

// ─── Zone registration ──────────────────────────────────────
export function registerFeelingsForest(game) {
    game.registerZone('feelings-forest', (g) => new FeelingsForestScene(g));
}
