/**
 * creatures.js — 7 companion creatures that follow the unicorn
 * Each drawn procedurally on Canvas 2D
 */

export const CREATURES = [
    { id: 'bunny',   name: 'Bunny',   zone: 'rainbow-meadow',   icon: '🐰' },
    { id: 'owl',     name: 'Owl',     zone: 'star-observatory',  icon: '🦉' },
    { id: 'fox',     name: 'Fox',     zone: 'feelings-forest',   icon: '🦊' },
    { id: 'cat',     name: 'Cat',     zone: 'letter-grove',      icon: '🐱' },
    { id: 'dragon',  name: 'Dragon',  zone: 'shape-mountain',    icon: '🐉' },
    { id: 'fairy',   name: 'Fairy',   zone: 'music-pond',        icon: '🧚' },
    { id: 'dolphin', name: 'Dolphin', zone: 'swimming-pool',     icon: '🐬' },
];

export class CreatureRenderer {
    /**
     * Draw a companion creature at (x, y)
     */
    draw(ctx, creatureId, x, y, scale = 1, time = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const bob = Math.sin(time * 2) * 3;
        ctx.translate(0, bob);

        switch (creatureId) {
            case 'bunny': this._drawBunny(ctx, time); break;
            case 'owl': this._drawOwl(ctx, time); break;
            case 'fox': this._drawFox(ctx, time); break;
            case 'cat': this._drawCat(ctx, time); break;
            case 'dragon': this._drawDragon(ctx, time); break;
            case 'fairy': this._drawFairy(ctx, time); break;
            case 'dolphin': this._drawDolphin(ctx, time); break;
        }

        ctx.restore();
    }

    _drawBunny(ctx, time) {
        // Body
        ctx.fillStyle = '#f5f5f5';
        ctx.strokeStyle = '#d4d4d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(12, -8, 12, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Ears
        const earWiggle = Math.sin(time * 3) * 0.1;
        ctx.save();
        ctx.rotate(-0.2 + earWiggle);
        ctx.beginPath();
        ctx.ellipse(10, -28, 5, 14, -0.1, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.ellipse(10, -28, 3, 10, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#f5f5f5';
        ctx.save();
        ctx.rotate(0.2 - earWiggle);
        ctx.beginPath();
        ctx.ellipse(18, -28, 5, 14, 0.1, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.ellipse(18, -28, 3, 10, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(8, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(16, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.arc(12, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tail poof
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-16, 2, 7, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawOwl(ctx, time) {
        // Body
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Face disc
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.ellipse(0, -10, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        const blink = Math.sin(time * 0.5) > 0.95;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-5, -12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5, -12, 6, 0, Math.PI * 2);
        ctx.fill();

        if (!blink) {
            ctx.fillStyle = '#1f2937';
            ctx.beginPath();
            ctx.arc(-5, -12, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(5, -12, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Beak
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(-3, -4);
        ctx.lineTo(3, -4);
        ctx.closePath();
        ctx.fill();
    }

    _drawFox(ctx, time) {
        // Body
        ctx.fillStyle = '#f97316';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(15, -8, 11, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Ears
        ctx.beginPath();
        ctx.moveTo(8, -15);
        ctx.lineTo(12, -28);
        ctx.lineTo(16, -15);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(14, -15);
        ctx.lineTo(18, -28);
        ctx.lineTo(22, -15);
        ctx.fill();

        // White chest
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(15, -2, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(11, -10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(19, -10, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(15, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        const tailSway = Math.sin(time * 2) * 0.2;
        ctx.fillStyle = '#f97316';
        ctx.save();
        ctx.rotate(tailSway);
        ctx.beginPath();
        ctx.ellipse(-22, 5, 14, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-30, 5, 5, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    _drawCat(ctx, time) {
        // Body
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(12, -8, 10, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(5, -14);
        ctx.lineTo(8, -26);
        ctx.lineTo(12, -16);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(12, -16);
        ctx.lineTo(16, -26);
        ctx.lineTo(19, -14);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(8, -9, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(16, -9, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.ellipse(8, -9, 1.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(16, -9, 1.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        const tailCurl = Math.sin(time * 2) * 0.3;
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.bezierCurveTo(-25, -5, -28 + tailCurl * 10, -20, -22, -25);
        ctx.stroke();
    }

    _drawDragon(ctx, time) {
        // Body
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.ellipse(16, -8, 12, 10, 0.1, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Tiny wings
        const flap = Math.sin(time * 4) * 0.2;
        ctx.fillStyle = '#86efac';
        ctx.save();
        ctx.rotate(-0.3 + flap);
        ctx.beginPath();
        ctx.ellipse(-5, -18, 12, 6, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Spikes
        ctx.fillStyle = '#fbbf24';
        for (let i = 0; i < 4; i++) {
            const sx = -8 + i * 6;
            ctx.beginPath();
            ctx.moveTo(sx - 3, -12);
            ctx.lineTo(sx, -20);
            ctx.lineTo(sx + 3, -12);
            ctx.closePath();
            ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(14, -11, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(14, -11, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tiny flame from nose
        if (Math.sin(time * 3) > 0.5) {
            ctx.fillStyle = '#f97316';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.ellipse(28, -5, 6, 3, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.ellipse(26, -5, 3, 2, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    _drawFairy(ctx, time) {
        // Glow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#e8b4f8';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Wings
        ctx.fillStyle = 'rgba(232, 180, 248, 0.5)';
        const wingFlap = Math.sin(time * 8) * 0.3;
        ctx.save();
        ctx.scale(1 + wingFlap, 1);
        ctx.beginPath();
        ctx.ellipse(-6, -2, 10, 6, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.scale(1 - wingFlap, 1);
        ctx.beginPath();
        ctx.ellipse(6, -2, 10, 6, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Body
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, -10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle trail
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < 3; i++) {
            const sx = (Math.sin(time * 4 + i * 2) * 8);
            const sy = 8 + i * 5;
            ctx.globalAlpha = 0.6 - i * 0.2;
            ctx.beginPath();
            ctx.arc(sx, sy, 2 - i * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    _drawDolphin(ctx, time) {
        const jump = Math.sin(time * 2) * 3;
        ctx.translate(0, jump);

        // Body
        ctx.fillStyle = '#60a5fa';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Belly
        ctx.fillStyle = '#bfdbfe';
        ctx.beginPath();
        ctx.ellipse(2, 4, 14, 5, 0, 0, Math.PI);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.ellipse(20, -2, 8, 4, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(14, -3, 2, 0, Math.PI * 2);
        ctx.fill();

        // Dorsal fin
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(-2, -8);
        ctx.quadraticCurveTo(2, -20, 8, -10);
        ctx.closePath();
        ctx.fill();

        // Tail
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.quadraticCurveTo(-30, -8, -28, -14);
        ctx.quadraticCurveTo(-24, -6, -20, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.quadraticCurveTo(-30, 8, -28, 14);
        ctx.quadraticCurveTo(-24, 6, -20, 0);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(22, 0, 4, 0.2, Math.PI * 0.7);
        ctx.stroke();
    }
}
