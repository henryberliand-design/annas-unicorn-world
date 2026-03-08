/**
 * swimming-pool.js — Bonus Zone 1: Free-play water fun
 * Unlocked at 20 stars — splash, dive, swim with friends
 */

export class SwimmingPoolScene {
    constructor(game) {
        this.game = game;
        this.splashes = [];
        this.floaties = [];
        this.waterLevel = 0;
    }

    init() {
        const W = this.game.W;
        const H = this.game.H;
        this.waterLevel = H * 0.45;

        // Pool toys
        const toyEmojis = ['🏖️', '🎈', '⭐', '🦆', '🐠', '🌈', '🦋', '🌸'];
        this.floaties = toyEmojis.map((emoji, i) => ({
            emoji,
            x: 120 + Math.random() * (W - 240),
            y: this.waterLevel + 40 + Math.random() * (H - this.waterLevel - 150),
            size: 30 + Math.random() * 20,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1
        }));

        this.backButton = { x: 30, y: 30, w: 80, h: 80, icon: '🏠' };

        this.game.audio.speak('Splash! Welcome to the Swimming Pool! Tap to make splashes!');
        this.game.audio.startZoneMusic('swimming-pool');
    }

    update(dt) {
        // Update splashes
        for (let i = this.splashes.length - 1; i >= 0; i--) {
            const s = this.splashes[i];
            s.life -= dt;
            s.radius += 150 * dt;
            if (s.life <= 0) this.splashes.splice(i, 1);
        }
    }

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;
        const time = this.game.time;

        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.waterLevel);
        skyGrad.addColorStop(0, '#87ceeb');
        skyGrad.addColorStop(1, '#b3e5fc');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, this.waterLevel);

        // Sun
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath();
        ctx.arc(W - 120, 100, 60, 0, Math.PI * 2);
        ctx.fill();

        // Pool edge
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, this.waterLevel - 20, W, 30);

        // Water
        const waterGrad = ctx.createLinearGradient(0, this.waterLevel, 0, H);
        waterGrad.addColorStop(0, 'rgba(66, 165, 245, 0.7)');
        waterGrad.addColorStop(0.3, 'rgba(33, 150, 243, 0.8)');
        waterGrad.addColorStop(1, 'rgba(21, 101, 192, 0.9)');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, this.waterLevel + 10, W, H - this.waterLevel);

        // Water surface waves
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = 0; x <= W; x += 10) {
                const y = this.waterLevel + 10 + Math.sin(x * 0.015 + time * 2 + i * 1.5) * 6 + i * 15;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Floaties
        for (const f of this.floaties) {
            const bob = Math.sin(time * f.speed + f.phase) * 10;
            ctx.font = `${f.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(f.emoji, f.x + Math.sin(time * 0.3 + f.phase) * 20, f.y + bob);
        }

        // Splashes
        for (const s of this.splashes) {
            const alpha = s.life / s.maxLife;
            // Rings
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(100, 181, 246, ${alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius * 0.6, 0, Math.PI * 2);
            ctx.stroke();

            // Droplets
            for (const d of s.droplets) {
                const dx = s.x + Math.cos(d.angle) * d.dist * (1 - alpha * 0.3);
                const dy = s.y + Math.sin(d.angle) * d.dist * (1 - alpha * 0.3) + d.gravity * (1 - alpha);
                ctx.fillStyle = `rgba(100, 181, 246, ${alpha})`;
                ctx.beginPath();
                ctx.arc(dx, dy, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Title
        ctx.font = 'bold 36px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1565c0';
        ctx.fillText('🏊 Swimming Pool', W / 2, 70);

        ctx.font = '20px -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText('Tap the water to splash!', W / 2, H - 40);

        R.drawButton(ctx, this.backButton, time);
    }

    handleInput(event) {
        if (event.type !== 'tap') return;
        const R = this.game.renderer;

        if (R.hitTest(event.x, event.y, this.backButton)) {
            this.game.goToHub();
            return;
        }

        // Splash!
        if (event.y > this.waterLevel) {
            const droplets = [];
            for (let i = 0; i < 8; i++) {
                droplets.push({
                    angle: (Math.PI * 2 * i) / 8 + Math.random() * 0.3,
                    dist: 30 + Math.random() * 60,
                    gravity: 50 + Math.random() * 100
                });
            }
            this.splashes.push({
                x: event.x,
                y: event.y,
                radius: 0,
                life: 0.8,
                maxLife: 0.8,
                droplets
            });
            this.game.particles.addSparkle(event.x, event.y, 6, '#42a5f5');
            this.game.audio.playBubble?.() || this.game.audio.playSparkle();
        }
    }

    destroy() {}
}

// ─── Zone registration ──────────────────────────────────────
export function registerSwimmingPool(game) {
    game.registerZone('swimming-pool', (g) => new SwimmingPoolScene(g));
}
