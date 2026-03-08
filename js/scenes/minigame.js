/**
 * minigame.js — Base mini-game framework
 * Provides common structure: DDA, star awarding, celebration, return-to-hub
 */

export class MiniGameScene {
    constructor(game, zoneId, miniGameIndex, config = {}) {
        this.game = game;
        this.zoneId = zoneId;
        this.miniGameIndex = miniGameIndex;
        this.miniGameId = `${zoneId}-${miniGameIndex}`;

        // Config
        this.title = config.title || 'Mini-Game';
        this.instructions = config.instructions || 'Tap to play!';

        // State
        this.phase = 'intro'; // 'intro' | 'playing' | 'celebrating' | 'done'
        this.introTimer = 0;
        this.celebrationTimer = 0;
        this.round = 0;
        this.totalRounds = config.totalRounds || 5;

        // Back button
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };

        // DDA
        this.game.dda.startSession(this.miniGameId);
    }

    init() {
        this.phase = 'intro';
        this.introTimer = 0;
        this.game.audio.speak(this.instructions);
    }

    update(dt) {
        if (this.phase === 'intro') {
            this.introTimer += dt;
            if (this.introTimer > 2.5) {
                this.phase = 'playing';
                this.onStartPlaying();
            }
        } else if (this.phase === 'celebrating') {
            this.celebrationTimer += dt;
            if (this.celebrationTimer > 3) {
                this.phase = 'done';
                this._awardStars();
            }
        } else if (this.phase === 'playing') {
            this.onUpdate(dt);
        }
    }

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Zone-specific background (override in subclass)
        this.onRenderBackground(ctx);

        if (this.phase === 'intro') {
            // Title card
            R.drawSubtitle(ctx, this.title, W / 2, H / 2 - 40, 42);
            if (this.introTimer > 0.5) {
                R.drawSubtitle(ctx, this.instructions, W / 2, H / 2 + 30, 24);
            }
        } else if (this.phase === 'playing') {
            this.onRender(ctx);

            // Progress indicator
            this._drawProgress(ctx);
        } else if (this.phase === 'celebrating') {
            this.onRender(ctx);

            // Celebration overlay
            ctx.save();
            ctx.globalAlpha = Math.min(1, this.celebrationTimer);
            R.drawSubtitle(ctx, 'Amazing! ⭐', W / 2, H / 2 - 20, 48);
            ctx.restore();
        } else if (this.phase === 'done') {
            this.onRender(ctx);
            this._drawStarAward(ctx, time);
        }

        // Back button (always visible)
        R.drawButton(ctx, this.backButton, time);
    }

    handleInput(event) {
        const { type, x, y } = event;
        const R = this.game.renderer;

        // Back button
        if (type === 'tap' && R.hitTest(x, y, this.backButton)) {
            this.game.audio.playTap();
            this.game.goToHub();
            return;
        }

        // Escape key
        if (type === 'keydown' && event.key === 'Escape') {
            this.game.goToHub();
            return;
        }

        if (this.phase === 'playing' && type === 'tap') {
            this.onTap(x, y);
        }

        if (this.phase === 'playing') {
            this.onInput(event);
        }

        if (this.phase === 'done' && type === 'tap') {
            // Tap anywhere to return
            this.game.goToHub();
        }
    }

    // ─── Subclass hooks ──────────────────────────────────────

    onStartPlaying() {}
    onUpdate(dt) {}
    onRender(ctx) {}
    onRenderBackground(ctx) {
        // Default: simple gradient
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.H);
        grad.addColorStop(0, '#c8e6ff');
        grad.addColorStop(1, '#98fb98');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.W, this.game.H);
    }
    onTap(x, y) {}
    onInput(event) {}

    // ─── Common methods for subclasses ───────────────────────

    /** Call when player completes a round successfully */
    roundSuccess() {
        this.game.dda.recordSuccess(this.miniGameId);
        this.game.audio.playCorrect();
        this.game.particles.addSparkle(this.game.W / 2, this.game.H / 2, 8, '#ffd700');
        this.round++;

        if (this.round >= this.totalRounds) {
            this.phase = 'celebrating';
            this.celebrationTimer = 0;
            this.game.audio.playCelebration();
            this.game.particles.addConfetti(this.game.W / 2, this.game.H / 3, 30);
        }
    }

    /** Call on incorrect attempt (gentle — no punishment) */
    roundStruggle() {
        this.game.dda.recordStruggle(this.miniGameId);
        this.game.audio.playGentle();
    }

    /** Get DDA level (1-3) */
    get difficulty() {
        return this.game.dda.getLevel(this.miniGameId);
    }

    // ─── Private ─────────────────────────────────────────────

    _drawProgress(ctx) {
        const W = this.game.W;
        // Progress dots at top
        const dotY = 25;
        const dotSpacing = 30;
        const startX = W / 2 - (this.totalRounds * dotSpacing) / 2;

        for (let i = 0; i < this.totalRounds; i++) {
            ctx.fillStyle = i < this.round ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(startX + i * dotSpacing + 15, dotY, 8, 0, Math.PI * 2);
            ctx.fill();

            if (i < this.round) {
                // Star inside completed dot
                ctx.fillStyle = '#fff';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⭐', startX + i * dotSpacing + 15, dotY);
            }
        }
    }

    _awardStars() {
        const stars = this.game.dda.calculateStars(this.miniGameId);
        this.earnedStars = stars;
        this.game.save.awardStars(this.zoneId, this.miniGameIndex, stars);
        this.game.audio.playStar();

        // Check if zone is now complete
        if (this.game.save.isZoneComplete(this.zoneId)) {
            this.game.save.completeZone(this.zoneId);
        }
    }

    _drawStarAward(ctx, time) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;

        // Dim background
        ctx.fillStyle = 'rgba(26, 10, 46, 0.5)';
        ctx.fillRect(0, 0, W, H);

        // Star display
        const stars = this.earnedStars || 1;
        const starY = H / 2 - 30;

        for (let i = 0; i < 3; i++) {
            const sx = W / 2 + (i - 1) * 80;
            const filled = i < stars;
            ctx.save();
            const scale = 1 + Math.sin(time * 3 + i) * 0.1;
            ctx.translate(sx, starY);
            ctx.scale(scale, scale);
            ctx.fillStyle = filled ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)';
            R.drawStar(ctx, 0, 0, 15, 30, 5);
            ctx.fill();
            if (filled) {
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 2;
                R.drawStar(ctx, 0, 0, 15, 30, 5);
                ctx.stroke();
            }
            ctx.restore();
        }

        // "Tap to continue"
        R.drawSubtitle(ctx, 'Tap to continue!', W / 2, H / 2 + 60, 24);
    }

    destroy() {}
}
