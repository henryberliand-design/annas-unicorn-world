/**
 * music-pond.js — Zone 5: Music & Rhythm
 * 3 mini-games: Lily Pad Drums, Frog Chorus, Melody Memory
 */

import { MiniGameScene } from '../scenes/minigame.js';

// ─── Zone Menu ──────────────────────────────────────────────

export class MusicPondScene {
    constructor(game) {
        this.game = game;
        this.buttons = [];
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;
        const stars = this.game.save.state.starsPerZone['music-pond'] || [0, 0, 0];

        this.buttons = [
            { x: W / 2 - 350, y: H / 2 - 60, w: 200, h: 120, icon: '🪷', name: 'Lily Pad Drums', idx: 0, stars: stars[0] },
            { x: W / 2 - 100, y: H / 2 - 60, w: 200, h: 120, icon: '🐸', name: 'Frog Chorus', idx: 1, stars: stars[1] },
            { x: W / 2 + 150, y: H / 2 - 60, w: 200, h: 120, icon: '🎵', name: 'Melody Memory', idx: 2, stars: stars[2] },
        ];
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };
        this.game.audio.speak('Welcome to Music Pond! Let\'s make music!');
        this.game.audio.startZoneMusic('music-pond');
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Pond background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#e0f7fa');
        grad.addColorStop(0.4, '#80deea');
        grad.addColorStop(1, '#00838f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Lily pads
        ctx.fillStyle = 'rgba(76, 175, 80, 0.4)';
        for (let i = 0; i < 8; i++) {
            const lx = (i * 247 + 100) % W;
            const ly = H * 0.5 + (i % 3) * 80 + Math.sin(time + i) * 10;
            ctx.beginPath();
            ctx.ellipse(lx, ly, 35, 25, i * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.font = 'bold 38px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#006064';
        ctx.fillText('🎶 Music Pond', W / 2, 70);

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
                if (btn.idx === 0) this.game.scenes.switchTo(() => new LilyPadDrumsGame(this.game));
                else if (btn.idx === 1) this.game.scenes.switchTo(() => new FrogChorusGame(this.game));
                else this.game.scenes.switchTo(() => new MelodyMemoryGame(this.game));
                return;
            }
        }
    }
    destroy() {}
}

// ─── Note frequencies ───────────────────────────────────────
const NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25
};
const NOTE_NAMES = Object.keys(NOTES);
const PAD_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

// ─── Mini-Game 1: Lily Pad Drums ────────────────────────────
// Free-play musical lily pads — tap to make sounds

class LilyPadDrumsGame extends MiniGameScene {
    constructor(game) {
        super(game, 'music-pond', 0, {
            title: '🪷 Lily Pad Drums',
            instructions: 'Tap the lily pads to make music!',
            totalRounds: 5
        });
        this.pads = [];
        this.sequence = [];
        this.playerSequence = [];
        this.playingBack = false;
        this.playbackIdx = 0;
        this.playbackTimer = 0;
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        const level = this.difficulty;
        const padCount = level === 1 ? 4 : level === 2 ? 6 : 8;
        const seqLen = level === 1 ? 2 : level === 2 ? 3 : 4;

        const W = this.game.W;
        const H = this.game.H;

        this.pads = [];
        const cols = Math.min(padCount, 4);
        const rows = Math.ceil(padCount / cols);
        for (let i = 0; i < padCount; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            this.pads.push({
                x: W / 2 - (cols - 1) * 100 + col * 200,
                y: H / 2 - (rows - 1) * 60 + row * 130 + 20,
                size: 55,
                note: NOTE_NAMES[i],
                freq: NOTES[NOTE_NAMES[i]],
                color: PAD_COLORS[i],
                lit: false,
                litTimer: 0
            });
        }

        // Generate sequence
        this.sequence = [];
        for (let i = 0; i < seqLen; i++) {
            this.sequence.push(Math.floor(Math.random() * padCount));
        }
        this.playerSequence = [];

        // Play back sequence
        this._startPlayback();
    }

    _startPlayback() {
        this.playingBack = true;
        this.playbackIdx = 0;
        this.playbackTimer = 0;
        this.game.audio.speak('Listen and repeat!');
    }

    onUpdate(dt) {
        // Update pad lit state
        for (const pad of this.pads) {
            if (pad.lit) {
                pad.litTimer -= dt;
                if (pad.litTimer <= 0) pad.lit = false;
            }
        }

        if (this.playingBack) {
            this.playbackTimer += dt;
            if (this.playbackTimer > 0.7) {
                this.playbackTimer = 0;
                if (this.playbackIdx < this.sequence.length) {
                    const pad = this.pads[this.sequence[this.playbackIdx]];
                    this._playPad(pad);
                    this.playbackIdx++;
                } else {
                    this.playingBack = false;
                    this.game.audio.speak('Your turn!');
                }
            }
        }
    }

    _playPad(pad) {
        pad.lit = true;
        pad.litTimer = 0.4;
        this.game.audio.playNote(pad.freq, 0.3);
        this.game.particles.addSparkle(pad.x, pad.y, 4, pad.color);
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#e0f2f1');
        grad.addColorStop(1, '#4db6ac');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        for (const pad of this.pads) {
            ctx.save();

            // Lily pad
            ctx.fillStyle = pad.lit ? pad.color : `${pad.color}88`;
            ctx.beginPath();
            ctx.ellipse(pad.x, pad.y, pad.size, pad.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();

            if (pad.lit) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Note label
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(pad.note.replace('4', '').replace('5', ''), pad.x, pad.y);

            ctx.restore();
        }

        // Status
        ctx.font = '22px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#004d40';
        if (this.playingBack) {
            ctx.fillText('Listen...', this.game.W / 2, 110);
        } else {
            ctx.fillText(`Repeat the pattern! (${this.playerSequence.length}/${this.sequence.length})`, this.game.W / 2, 110);
        }
    }

    onTap(x, y) {
        if (this.playingBack) return;

        for (let i = 0; i < this.pads.length; i++) {
            const pad = this.pads[i];
            const dist = Math.sqrt((x - pad.x) ** 2 + (y - pad.y) ** 2);
            if (dist < pad.size + 10) {
                this._playPad(pad);
                this.playerSequence.push(i);

                const seqIdx = this.playerSequence.length - 1;
                if (this.playerSequence[seqIdx] !== this.sequence[seqIdx]) {
                    // Wrong note
                    this.roundStruggle();
                    this.playerSequence = [];
                    this.game.audio.speak('Oops! Listen again!');
                    setTimeout(() => this._startPlayback(), 800);
                } else if (this.playerSequence.length === this.sequence.length) {
                    // Completed!
                    this.roundSuccess();
                    if (this.phase === 'playing') setTimeout(() => this._newRound(), 700);
                }
                return;
            }
        }
    }
}

// ─── Mini-Game 2: Frog Chorus ──────────────────────────────
// Frogs sing high/low — tap high or low to match

class FrogChorusGame extends MiniGameScene {
    constructor(game) {
        super(game, 'music-pond', 1, {
            title: '🐸 Frog Chorus',
            instructions: 'Is the frog singing high or low?',
            totalRounds: 5
        });
        this.isHigh = true;
        this.frogY = 0;
        this.answered = false;
    }

    onStartPlaying() { this._newRound(); }

    _newRound() {
        this.isHigh = Math.random() > 0.5;
        this.answered = false;
        const freq = this.isHigh ? 600 + Math.random() * 300 : 150 + Math.random() * 100;
        this.game.audio.playNote(freq, 0.5);

        const pitch = this.isHigh ? 'high' : 'low';
        setTimeout(() => {
            this.game.audio.speak(`Is this sound ${pitch} or ${this.isHigh ? 'low' : 'high'}?`);
        }, 600);
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#1b5e20');
        grad.addColorStop(1, '#004d40');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Frog
        const frogX = W / 2;
        const frogY = H / 2 - 40;
        const bounce = Math.sin(time * 4) * 8;

        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.ellipse(frogX, frogY + bounce, 60, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(frogX - 20, frogY - 30 + bounce, 18, 0, Math.PI * 2);
        ctx.arc(frogX + 20, frogY - 30 + bounce, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(frogX - 18, frogY - 28 + bounce, 8, 0, Math.PI * 2);
        ctx.arc(frogX + 22, frogY - 28 + bounce, 8, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(frogX, frogY + 10 + bounce, 20, 0, Math.PI);
        ctx.stroke();

        // High/Low buttons
        const highBtn = { x: W / 2 - 200, y: H / 2 + 80, w: 160, h: 80 };
        const lowBtn = { x: W / 2 + 40, y: H / 2 + 80, w: 160, h: 80 };

        this._highBtn = highBtn;
        this._lowBtn = lowBtn;

        ctx.fillStyle = '#ffeb3b';
        R.roundRect(ctx, highBtn.x, highBtn.y, highBtn.w, highBtn.h, 16);
        ctx.fill();
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.fillText('⬆️ HIGH', highBtn.x + highBtn.w / 2, highBtn.y + highBtn.h / 2 + 8);

        ctx.fillStyle = '#42a5f5';
        R.roundRect(ctx, lowBtn.x, lowBtn.y, lowBtn.w, lowBtn.h, 16);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.fillText('⬇️ LOW', lowBtn.x + lowBtn.w / 2, lowBtn.y + lowBtn.h / 2 + 8);
    }

    onTap(x, y) {
        if (this.answered) return;
        const R = this.game.renderer;

        let guessHigh = null;
        if (R.hitTest(x, y, this._highBtn)) guessHigh = true;
        else if (R.hitTest(x, y, this._lowBtn)) guessHigh = false;
        else return;

        this.answered = true;
        if (guessHigh === this.isHigh) {
            this.game.audio.speak(`Yes! It's a ${this.isHigh ? 'high' : 'low'} sound!`);
            this.roundSuccess();
            if (this.phase === 'playing') setTimeout(() => this._newRound(), 700);
        } else {
            this.roundStruggle();
            this.game.audio.speak(`That was a ${this.isHigh ? 'high' : 'low'} sound. Try the next one!`);
            setTimeout(() => this._newRound(), 800);
        }
    }
}

// ─── Mini-Game 3: Melody Memory ─────────────────────────────
// Simon-like: repeat growing sequences of notes

class MelodyMemoryGame extends MiniGameScene {
    constructor(game) {
        super(game, 'music-pond', 2, {
            title: '🎵 Melody Memory',
            instructions: 'Remember the melody!',
            totalRounds: 5
        });
        this.notes = [];
        this.sequence = [];
        this.playerIdx = 0;
        this.playingBack = false;
        this.playbackIdx = 0;
        this.playbackTimer = 0;
    }

    onStartPlaying() { this._setupNotes(); this._newRound(); }

    _setupNotes() {
        const W = this.game.W;
        const H = this.game.H;
        const noteKeys = ['C4', 'D4', 'E4', 'F4', 'G4'];
        this.notes = noteKeys.map((key, i) => ({
            key,
            freq: NOTES[key],
            x: W / 2 - 200 + i * 100,
            y: H / 2 + 30,
            size: 40,
            color: PAD_COLORS[i],
            lit: false,
            litTimer: 0
        }));
    }

    _newRound() {
        // Add one note to sequence
        if (this.sequence.length === 0) {
            this.sequence = [Math.floor(Math.random() * this.notes.length)];
        } else {
            this.sequence.push(Math.floor(Math.random() * this.notes.length));
        }
        this.playerIdx = 0;
        this._startPlayback();
    }

    _startPlayback() {
        this.playingBack = true;
        this.playbackIdx = 0;
        this.playbackTimer = 0;
    }

    onUpdate(dt) {
        for (const note of this.notes) {
            if (note.lit) {
                note.litTimer -= dt;
                if (note.litTimer <= 0) note.lit = false;
            }
        }

        if (this.playingBack) {
            this.playbackTimer += dt;
            if (this.playbackTimer > 0.6) {
                this.playbackTimer = 0;
                if (this.playbackIdx < this.sequence.length) {
                    const note = this.notes[this.sequence[this.playbackIdx]];
                    note.lit = true;
                    note.litTimer = 0.35;
                    this.game.audio.playNote(note.freq, 0.25);
                    this.playbackIdx++;
                } else {
                    this.playingBack = false;
                }
            }
        }
    }

    onRenderBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#e8eaf6');
        grad.addColorStop(1, '#7986cb');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }

    onRender(ctx) {
        const W = this.game.W;

        ctx.font = '22px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#283593';
        ctx.fillText(this.playingBack ? 'Listen...' : 'Your turn! Repeat the melody!', W / 2, 130);

        for (const note of this.notes) {
            ctx.fillStyle = note.lit ? note.color : `${note.color}66`;
            ctx.beginPath();
            ctx.arc(note.x, note.y, note.size, 0, Math.PI * 2);
            ctx.fill();

            if (note.lit) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            ctx.font = '18px sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(note.key.replace('4', ''), note.x, note.y);
        }

        // Sequence length display
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#5c6bc0';
        ctx.fillText(`Notes: ${this.sequence.length}`, W / 2, this.game.H - 60);
    }

    onTap(x, y) {
        if (this.playingBack) return;

        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            const dist = Math.sqrt((x - note.x) ** 2 + (y - note.y) ** 2);
            if (dist < note.size + 10) {
                note.lit = true;
                note.litTimer = 0.3;
                this.game.audio.playNote(note.freq, 0.25);

                if (i !== this.sequence[this.playerIdx]) {
                    this.roundStruggle();
                    this.sequence = [];
                    this.game.audio.speak('Oops! Let\'s start a new melody!');
                    setTimeout(() => this._newRound(), 600);
                } else {
                    this.playerIdx++;
                    if (this.playerIdx >= this.sequence.length) {
                        this.roundSuccess();
                        if (this.phase === 'playing') setTimeout(() => this._newRound(), 600);
                    }
                }
                return;
            }
        }
    }
}

// ─── Zone registration ──────────────────────────────────────
export function registerMusicPond(game) {
    game.registerZone('music-pond', (g) => new MusicPondScene(g));
}
