/**
 * renderer.js — Canvas rendering helpers, parallax system, camera
 * Watercolour storybook art style — pastel gradients, rounded shapes, glow
 */

export class Renderer {
    constructor(game) {
        this.game = game;
    }

    // ─── Drawing Helpers ─────────────────────────────────────

    /** Rounded rectangle */
    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    /** Draw a pill-shaped button */
    drawButton(ctx, btn, time) {
        const glow = 0.5 + Math.sin(time * 3) * 0.15;
        ctx.save();

        // Shadow
        ctx.shadowColor = 'rgba(155, 77, 202, 0.3)';
        ctx.shadowBlur = 15;

        // Button body
        const grad = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.h);
        grad.addColorStop(0, btn.color || '#d4a0e8');
        grad.addColorStop(1, btn.colorDark || '#9b4dca');
        ctx.fillStyle = grad;
        this.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, btn.h / 2);
        ctx.fill();

        // Glow border
        ctx.strokeStyle = `rgba(255, 255, 255, ${glow * 0.4})`;
        ctx.lineWidth = 3;
        this.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, btn.h / 2);
        ctx.stroke();

        // Icon (if provided)
        if (btn.icon) {
            ctx.font = `${btn.h * 0.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(btn.icon, btn.x + btn.w / 2, btn.y + btn.h / 2);
        }

        ctx.restore();
    }

    /** Draw text in a semi-transparent pill */
    drawSubtitle(ctx, text, cx, cy, fontSize = 28) {
        ctx.save();
        ctx.font = `${fontSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const m = ctx.measureText(text);
        const pw = m.width + 40;
        const ph = fontSize + 20;

        // Background pill
        ctx.fillStyle = 'rgba(26, 10, 46, 0.6)';
        this.roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, ph / 2);
        ctx.fill();

        // Text
        ctx.fillStyle = '#fff';
        ctx.fillText(text, cx, cy);
        ctx.restore();
    }

    /** Pulsing glow effect */
    drawGlow(ctx, x, y, radius, time, color = '#ffd700') {
        const alpha = 0.2 + Math.sin(time * 2) * 0.1;
        ctx.save();
        ctx.globalAlpha = alpha;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /** Draw a 5-pointed star shape */
    drawStar(ctx, cx, cy, innerR, outerR, points = 5) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI * i) / points - Math.PI / 2;
            const method = i === 0 ? 'moveTo' : 'lineTo';
            ctx[method](cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
    }

    /** Hit test — is (px, py) inside rectangle? */
    hitTest(px, py, rect) {
        return px >= rect.x && px <= rect.x + rect.w &&
               py >= rect.y && py <= rect.y + rect.h;
    }

    // ─── Parallax Background ────────────────────────────────

    /**
     * Draw a parallax sky gradient
     * Zones shift the gradient colours as camera moves
     */
    drawSky(ctx, w, h, colors) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    /** Draw clouds at parallax offset */
    drawClouds(ctx, cameraX, time, y, count = 6) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < count; i++) {
            const baseX = (i * 600 + 100) - cameraX * 0.1;
            const cloudY = y + Math.sin(time * 0.3 + i) * 10;
            const w = 120 + (i % 3) * 40;
            // Simple cloud shape — 3 overlapping circles
            ctx.beginPath();
            ctx.arc(baseX, cloudY, w * 0.25, 0, Math.PI * 2);
            ctx.arc(baseX + w * 0.2, cloudY - w * 0.1, w * 0.3, 0, Math.PI * 2);
            ctx.arc(baseX + w * 0.45, cloudY, w * 0.22, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    /** Draw gentle rolling hills at a parallax depth */
    drawHills(ctx, cameraX, parallaxFactor, y, h, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, y + h);
        const offset = -cameraX * parallaxFactor;
        for (let x = -100; x <= this.game.W + 100; x += 10) {
            const worldX = x - offset;
            const hillY = y + Math.sin(worldX * 0.003) * 30 + Math.sin(worldX * 0.007) * 20;
            ctx.lineTo(x, hillY);
        }
        ctx.lineTo(this.game.W + 100, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /** Draw ground plane */
    drawGround(ctx, y, h, color1, color2) {
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, y, this.game.W, h);
    }

    /** Foreground flowers / grass */
    drawForegroundFlowers(ctx, cameraX, groundY, time) {
        ctx.save();
        const offset = -cameraX * 0.95;
        for (let i = 0; i < 30; i++) {
            const baseX = (i * 130 + 50);
            const x = ((baseX + offset) % (this.game.W + 200)) - 100;
            const sway = Math.sin(time * 2 + i * 0.7) * 3;

            // Stem
            ctx.strokeStyle = '#7bc47f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, groundY);
            ctx.quadraticCurveTo(x + sway, groundY - 20, x + sway * 1.5, groundY - 35);
            ctx.stroke();

            // Flower head
            const colors = ['#ff69b4', '#ffd700', '#87ceeb', '#dda0dd', '#ffb6c1', '#98fb98'];
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(x + sway * 1.5, groundY - 38, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
