/**
 * hud.js — Heads-up display: star counter, zone name, home button
 */

export class HUD {
    constructor(game) {
        this.game = game;
        this.visible = true;
    }

    render(ctx) {
        if (!this.visible) return;

        const W = this.game.W;
        const scene = this.game.scenes.currentScene;

        // Only show star counter in hub world
        if (scene && scene.constructor.name === 'HubScene') {
            this._drawStarCounter(ctx, W);
        }
    }

    _drawStarCounter(ctx, W) {
        const stars = this.game.save.totalStars;
        const R = this.game.renderer;

        // Star pill at top-right
        ctx.save();
        const pillW = 100;
        const pillH = 40;
        const px = W - pillW - 20;
        const py = 15;

        ctx.fillStyle = 'rgba(26, 10, 46, 0.6)';
        R.roundRect(ctx, px, py, pillW, pillH, pillH / 2);
        ctx.fill();

        // Star icon
        ctx.fillStyle = '#fbbf24';
        R.drawStar(ctx, px + 25, py + pillH / 2, 6, 12, 5);
        ctx.fill();

        // Count
        ctx.font = 'bold 20px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${stars}`, px + 42, py + pillH / 2 + 1);

        ctx.restore();
    }
}
