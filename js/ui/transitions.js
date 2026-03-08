/**
 * transitions.js — Zone entry/exit visual effects
 * Sparkle burst, colour wash, portal animation
 */

export class TransitionEffects {
    constructor(game) {
        this.game = game;
    }

    /** Sparkle burst centered on screen */
    sparkleBurst(color = '#ffd700') {
        const W = this.game.W;
        const H = this.game.H;
        this.game.particles.addSparkle(W / 2, H / 2, 20, color);
        this.game.particles.addConfetti(W / 2, H / 2, 15);
    }

    /** Star unlock celebration */
    starCelebration() {
        const W = this.game.W;
        const H = this.game.H;
        this.game.particles.addStars(W / 2, H / 2, 10);
        this.game.audio.plasStar?.() || this.game.audio.playFanfare();
    }
}
