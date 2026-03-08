/**
 * stable.js — Sparkle's Stable (home base)
 * Rooms: Closet (re-customise), Garden, Trophy Wall
 */

import { UnicornRenderer } from '../characters/unicorn.js';

export class StableScene {
    constructor(game) {
        this.game = game;
        this.unicorn = new UnicornRenderer();
        this.room = 'main'; // 'main' | 'closet' | 'garden' | 'trophies'
        this.buttons = [];
        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;

        this.buttons = [
            { x: W / 2 - 300, y: H / 2 + 50, w: 160, h: 130, icon: '👗', name: 'Closet',   room: 'closet' },
            { x: W / 2 - 80,  y: H / 2 + 50, w: 160, h: 130, icon: '🌸', name: 'Garden',   room: 'garden' },
            { x: W / 2 + 140, y: H / 2 + 50, w: 160, h: 130, icon: '🏆', name: 'Trophies', room: 'trophies' },
        ];

        this.game.audio.speak("Welcome home! This is Sparkle's Stable!");
    }

    update(dt) {}

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Cozy interior background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#fde4cf');
        grad.addColorStop(1, '#f8c8dc');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Title
        ctx.font = 'bold 38px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#9b4dca';
        ctx.fillText("🏠 Sparkle's Stable", W / 2, 70);

        // Unicorn in center
        const config = this.game.save.state.unicorn;
        this.unicorn.draw(ctx, W / 2, H / 2 - 20, config, 2, 1, time, false);

        // Room buttons
        for (const btn of this.buttons) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 18);
            ctx.fill();

            ctx.font = '36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(btn.icon, btn.x + btn.w / 2, btn.y + 55);

            ctx.font = '18px -apple-system, sans-serif';
            ctx.fillStyle = '#555';
            ctx.fillText(btn.name, btn.x + btn.w / 2, btn.y + 95);
        }

        // Back button
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
                if (btn.room === 'closet') {
                    this.game.goToCreator();
                } else if (btn.room === 'garden') {
                    this.game.audio.speak('The garden is being planted!');
                } else if (btn.room === 'trophies') {
                    this.game.audio.speak('Your trophies are being polished!');
                }
                return;
            }
        }
    }

    destroy() {}
}
