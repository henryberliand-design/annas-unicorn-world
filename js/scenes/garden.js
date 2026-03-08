/**
 * garden.js — Garden decoration scene
 * Place earned decorations, watch them grow over time
 * Stub — full implementation in later phase
 */

export class GardenScene {
    constructor(game) {
        this.game = game;
    }

    init() {
        this.game.audio.speak('Your garden is growing!');
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;

        // Garden background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#87ceeb');
        grad.addColorStop(1, '#22c55e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.font = 'bold 36px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#166534';
        ctx.fillText('🌸 Your Garden 🌸', W / 2, 80);

        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#333';
        ctx.fillText('Coming soon!', W / 2, H / 2);
    }

    handleInput(event) {
        if (event.type === 'tap') {
            this.game.goToHub();
        }
    }

    destroy() {}
}
