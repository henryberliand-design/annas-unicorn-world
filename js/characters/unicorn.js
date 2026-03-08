/**
 * unicorn.js — Procedural unicorn drawing + animation
 * Soft watercolour storybook style — all Canvas 2D bezier curves
 */

export class UnicornRenderer {
    constructor() {
        this.bobOffset = 0;
        this.trotFrame = 0;
        this.blinkTimer = 0;
        this.blinking = false;
    }

    /**
     * Draw the unicorn at position (cx, cy) with given customisation
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} cx - center X
     * @param {number} cy - ground Y (hooves)
     * @param {object} config - { bodyColor, maneColor, maneStyle, horn, wings, eyes, accessory }
     * @param {number} scale - size multiplier (1 = default ~200px tall)
     * @param {number} facing - 1 = right, -1 = left
     * @param {number} time - animation time
     * @param {boolean} walking - trot animation active
     */
    draw(ctx, cx, cy, config, scale = 1, facing = 1, time = 0, walking = false) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale * facing, scale);

        // Animation
        this.bobOffset = walking ? Math.sin(time * 6) * 4 : Math.sin(time * 1.5) * 2;
        this.trotFrame = walking ? time * 6 : 0;

        // Blink
        this.blinkTimer += 0.016;
        if (this.blinkTimer > 3 + Math.random() * 2) {
            this.blinking = true;
            this.blinkTimer = 0;
        }
        if (this.blinking && this.blinkTimer > 0.15) {
            this.blinking = false;
        }

        const bodyHex = config.bodyColor === 'rainbow' ? '#ffb6c1' : (config.bodyColor || '#ffb6c1');
        const maneHex = config.maneColor === 'rainbow' ? '#ff69b4' : (config.maneColor || '#ff69b4');
        const outline = this._darken(bodyHex, 0.25);
        const bob = this.bobOffset;

        // Draw order: tail → back legs → body → wings → front legs → head → mane → horn → eyes → accessory
        this._drawTail(ctx, bodyHex, maneHex, outline, time);
        this._drawLegs(ctx, bodyHex, outline, 'back', walking, time);
        this._drawBody(ctx, bodyHex, outline, bob);
        if (config.wings && config.wings !== 'none') {
            this._drawWings(ctx, config.wings, bodyHex, time, bob);
        }
        this._drawLegs(ctx, bodyHex, outline, 'front', walking, time);
        this._drawHead(ctx, bodyHex, outline, bob);
        this._drawMane(ctx, maneHex, config.maneStyle, time, bob);
        this._drawHorn(ctx, config.horn, time, bob);
        this._drawEyes(ctx, config.eyes, bob);
        if (config.accessory && config.accessory !== 'none') {
            this._drawAccessory(ctx, config.accessory, bodyHex, bob);
        }

        // Rainbow shimmer overlay for rainbow body
        if (config.bodyColor === 'rainbow') {
            this._drawRainbowOverlay(ctx, bob, time);
        }

        ctx.restore();
    }

    // ─── Body Parts ──────────────────────────────────────────

    _drawBody(ctx, color, outline, bob) {
        ctx.save();
        ctx.translate(0, bob);

        // Body — large oval
        ctx.fillStyle = color;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -80, 70, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Belly highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(-5, -70, 40, 25, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _drawHead(ctx, color, outline, bob) {
        ctx.save();
        ctx.translate(55, -120 + bob);

        // Head — rounded shape
        ctx.fillStyle = color;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 35, 30, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Snout — smaller oval
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(22, 8, 18, 14, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Nostril
        ctx.fillStyle = this._darken(color, 0.15);
        ctx.beginPath();
        ctx.ellipse(32, 8, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mouth — gentle smile
        ctx.strokeStyle = this._darken(color, 0.2);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(28, 14, 8, 0.1, Math.PI * 0.7);
        ctx.stroke();

        // Ear
        ctx.fillStyle = color;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-5, -22);
        ctx.quadraticCurveTo(5, -45, 15, -28);
        ctx.quadraticCurveTo(10, -20, -5, -22);
        ctx.fill();
        ctx.stroke();

        // Inner ear
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.quadraticCurveTo(6, -38, 12, -28);
        ctx.quadraticCurveTo(8, -22, 0, -22);
        ctx.fill();

        // Cheek blush
        ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
        ctx.beginPath();
        ctx.ellipse(10, 10, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _drawEyes(ctx, eyeStyle, bob) {
        ctx.save();
        ctx.translate(55, -120 + bob);

        const eyeX = 5;
        const eyeY = -2;

        if (this.blinking) {
            // Blink — closed line
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 6, 0.2, Math.PI - 0.2);
            ctx.stroke();
        } else {
            // Open eye
            ctx.fillStyle = '#333';
            ctx.beginPath();

            if (eyeStyle === 'big-round' || !eyeStyle) {
                ctx.arc(eyeX, eyeY, 7, 0, Math.PI * 2);
                ctx.fill();
                // White highlight
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(eyeX + 2, eyeY - 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (eyeStyle === 'starry') {
                ctx.arc(eyeX, eyeY, 7, 0, Math.PI * 2);
                ctx.fill();
                // Star highlight
                ctx.fillStyle = '#fff';
                this._miniStar(ctx, eyeX + 1, eyeY - 2, 3);
            } else if (eyeStyle === 'sparkly') {
                ctx.arc(eyeX, eyeY, 7, 0, Math.PI * 2);
                ctx.fill();
                // Multiple sparkle dots
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(eyeX + 2, eyeY - 2, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX - 2, eyeY + 1, 1.2, 0, Math.PI * 2);
                ctx.fill();
            } else if (eyeStyle === 'sleepy-cute') {
                // Half-closed happy eye
                ctx.beginPath();
                ctx.arc(eyeX, eyeY, 7, Math.PI * 0.1, Math.PI * 0.9);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(eyeX + 1, eyeY - 1, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (eyeStyle === 'heart') {
                this._drawHeartEye(ctx, eyeX, eyeY);
            } else if (eyeStyle === 'gem') {
                // Diamond-shaped eye
                ctx.beginPath();
                ctx.moveTo(eyeX, eyeY - 7);
                ctx.lineTo(eyeX + 6, eyeY);
                ctx.lineTo(eyeX, eyeY + 7);
                ctx.lineTo(eyeX - 6, eyeY);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#87ceeb';
                ctx.beginPath();
                ctx.arc(eyeX + 1, eyeY - 1, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Eyelashes
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(eyeX + 5, eyeY - 4);
            ctx.lineTo(eyeX + 9, eyeY - 7);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(eyeX + 6, eyeY - 1);
            ctx.lineTo(eyeX + 10, eyeY - 3);
            ctx.stroke();
        }

        ctx.restore();
    }

    _drawHeartEye(ctx, x, y) {
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.moveTo(x, y + 4);
        ctx.bezierCurveTo(x - 7, y - 3, x - 4, y - 8, x, y - 4);
        ctx.bezierCurveTo(x + 4, y - 8, x + 7, y - 3, x, y + 4);
        ctx.fill();
    }

    _drawHorn(ctx, hornStyle, time, bob) {
        ctx.save();
        ctx.translate(55, -120 + bob);

        const hx = 8;
        const hy = -30;

        if (hornStyle === 'classic' || !hornStyle) {
            // Spiral horn
            const grad = ctx.createLinearGradient(hx, hy, hx + 5, hy - 40);
            grad.addColorStop(0, '#fde68a');
            grad.addColorStop(1, '#fbbf24');
            ctx.fillStyle = grad;
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hx - 6, hy);
            ctx.lineTo(hx, hy - 40);
            ctx.lineTo(hx + 6, hy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Spiral lines
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const t = i / 5;
                const sx = hx - 6 + t * 6;
                const sy = hy - t * 40;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + 6 * (1 - t), sy);
                ctx.stroke();
            }
        } else if (hornStyle === 'crystal') {
            // Faceted crystal horn
            ctx.fillStyle = '#93c5fd';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hx - 5, hy);
            ctx.lineTo(hx - 2, hy - 20);
            ctx.lineTo(hx, hy - 42);
            ctx.lineTo(hx + 2, hy - 20);
            ctx.lineTo(hx + 5, hy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Facet line
            ctx.beginPath();
            ctx.moveTo(hx - 2, hy - 20);
            ctx.lineTo(hx + 5, hy);
            ctx.stroke();
        } else if (hornStyle === 'star-tipped') {
            // Horn with star on top
            ctx.fillStyle = '#fde68a';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hx - 5, hy);
            ctx.lineTo(hx, hy - 35);
            ctx.lineTo(hx + 5, hy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Star
            ctx.fillStyle = '#fbbf24';
            this._miniStar(ctx, hx, hy - 40, 8);
        } else if (hornStyle === 'glowing') {
            // Glowing horn
            const glow = 0.4 + Math.sin(time * 3) * 0.2;
            ctx.shadowColor = '#fde68a';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#fde68a';
            ctx.globalAlpha = 0.8 + glow * 0.2;
            ctx.beginPath();
            ctx.moveTo(hx - 5, hy);
            ctx.lineTo(hx, hy - 40);
            ctx.lineTo(hx + 5, hy);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        } else if (hornStyle === 'rainbow') {
            // Rainbow gradient horn
            const grad = ctx.createLinearGradient(hx, hy, hx, hy - 40);
            grad.addColorStop(0, '#ff0000');
            grad.addColorStop(0.17, '#ff8800');
            grad.addColorStop(0.33, '#ffff00');
            grad.addColorStop(0.5, '#00cc00');
            grad.addColorStop(0.67, '#0088ff');
            grad.addColorStop(0.83, '#8800ff');
            grad.addColorStop(1, '#ff00ff');
            ctx.fillStyle = grad;
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.moveTo(hx - 5, hy);
            ctx.lineTo(hx, hy - 40);
            ctx.lineTo(hx + 5, hy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (hornStyle === 'heart') {
            // Heart-tipped horn
            ctx.fillStyle = '#f472b6';
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hx - 4, hy);
            ctx.lineTo(hx, hy - 32);
            ctx.lineTo(hx + 4, hy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Heart on top
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.moveTo(hx, hy - 35);
            ctx.bezierCurveTo(hx - 8, hy - 44, hx - 5, hy - 50, hx, hy - 44);
            ctx.bezierCurveTo(hx + 5, hy - 50, hx + 8, hy - 44, hx, hy - 35);
            ctx.fill();
        }

        ctx.restore();
    }

    _drawMane(ctx, color, style, time, bob) {
        ctx.save();
        ctx.translate(55, -120 + bob);

        const sway = Math.sin(time * 2) * 5;

        ctx.fillStyle = color;
        ctx.strokeStyle = this._darken(color, 0.2);
        ctx.lineWidth = 2;

        if (style === 'flowing' || !style) {
            // Long flowing mane
            ctx.beginPath();
            ctx.moveTo(-15, -20);
            ctx.bezierCurveTo(-25, -10, -40 + sway, 10, -45 + sway, 30);
            ctx.bezierCurveTo(-42 + sway, 45, -30, 50, -20, 40);
            ctx.bezierCurveTo(-15, 30, -10, 10, -5, -5);
            ctx.bezierCurveTo(-8, -15, -12, -20, -15, -20);
            ctx.fill();
            ctx.stroke();
        } else if (style === 'curly') {
            // Curly locks
            for (let i = 0; i < 5; i++) {
                const y = -15 + i * 12;
                const x = -18 - i * 3 + Math.sin(time * 2 + i) * 3;
                ctx.beginPath();
                ctx.arc(x, y, 10 - i * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        } else if (style === 'braided') {
            // Braided mane
            ctx.beginPath();
            ctx.moveTo(-15, -18);
            for (let i = 0; i < 8; i++) {
                const x = -18 + Math.sin(i * 0.8 + time) * 6;
                const y = -15 + i * 8;
                ctx.quadraticCurveTo(x - 8, y, x, y + 4);
                ctx.quadraticCurveTo(x + 8, y + 4, x, y + 8);
            }
            ctx.lineTo(-10, 50);
            ctx.lineTo(-5, -5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (style === 'wild') {
            // Wild spiky mane
            ctx.beginPath();
            ctx.moveTo(-10, -20);
            ctx.lineTo(-30 + sway, -30);
            ctx.lineTo(-15, -10);
            ctx.lineTo(-35 + sway, 0);
            ctx.lineTo(-15, 10);
            ctx.lineTo(-30 + sway, 25);
            ctx.lineTo(-10, 20);
            ctx.lineTo(-25 + sway, 40);
            ctx.lineTo(-5, 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    _drawLegs(ctx, color, outline, which, walking, time) {
        ctx.save();
        const phase = walking ? time * 6 : 0;

        ctx.fillStyle = color;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 2.5;

        if (which === 'back') {
            // Back legs (slightly behind body)
            const legColor = this._darken(color, 0.08);
            ctx.fillStyle = legColor;

            // Left back
            const lb = walking ? Math.sin(phase + Math.PI) * 12 : 0;
            ctx.beginPath();
            ctx.roundRect(-35, -45 + this.bobOffset, 18, 48 + lb, 6);
            ctx.fill();
            ctx.stroke();
            // Hoof
            ctx.fillStyle = this._darken(color, 0.3);
            ctx.beginPath();
            ctx.ellipse(-26, 3 + this.bobOffset + lb, 11, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Right back
            ctx.fillStyle = legColor;
            const rb = walking ? Math.sin(phase) * 12 : 0;
            ctx.beginPath();
            ctx.roundRect(-15, -45 + this.bobOffset, 18, 48 + rb, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = this._darken(color, 0.3);
            ctx.beginPath();
            ctx.ellipse(-6, 3 + this.bobOffset + rb, 11, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Front legs
            const lf = walking ? Math.sin(phase) * 12 : 0;
            ctx.beginPath();
            ctx.roundRect(20, -45 + this.bobOffset, 18, 48 + lf, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = this._darken(color, 0.3);
            ctx.beginPath();
            ctx.ellipse(29, 3 + this.bobOffset + lf, 11, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = color;
            const rf = walking ? Math.sin(phase + Math.PI) * 12 : 0;
            ctx.beginPath();
            ctx.roundRect(38, -45 + this.bobOffset, 18, 48 + rf, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = this._darken(color, 0.3);
            ctx.beginPath();
            ctx.ellipse(47, 3 + this.bobOffset + rf, 11, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    _drawTail(ctx, bodyColor, maneColor, outline, time) {
        ctx.save();
        const sway = Math.sin(time * 1.8) * 8;

        ctx.fillStyle = maneColor;
        ctx.strokeStyle = this._darken(maneColor, 0.2);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-60, -90 + this.bobOffset);
        ctx.bezierCurveTo(-80, -80, -90 + sway, -50, -85 + sway, -30);
        ctx.bezierCurveTo(-80 + sway, -20, -65, -40, -55, -65 + this.bobOffset);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    _drawWings(ctx, wingStyle, bodyColor, time, bob) {
        ctx.save();
        ctx.translate(0, bob);

        const flap = Math.sin(time * 2) * 0.15;

        if (wingStyle === 'fairy') {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#e8b4f8';
            ctx.strokeStyle = '#d4a0e8';
            ctx.lineWidth = 1.5;
            // Upper wing
            ctx.save();
            ctx.rotate(-0.3 + flap);
            ctx.beginPath();
            ctx.ellipse(-10, -110, 35, 20, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            // Lower wing
            ctx.save();
            ctx.rotate(-0.1 + flap * 0.5);
            ctx.beginPath();
            ctx.ellipse(-5, -85, 25, 15, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            ctx.globalAlpha = 1;
        } else if (wingStyle === 'pegasus') {
            ctx.fillStyle = '#f5f5f5';
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            ctx.save();
            ctx.rotate(-0.2 + flap);
            // Large feathered wing
            ctx.beginPath();
            ctx.moveTo(-10, -85);
            ctx.quadraticCurveTo(-50, -130, -30, -140);
            ctx.quadraticCurveTo(-10, -135, -5, -120);
            ctx.quadraticCurveTo(5, -130, 10, -120);
            ctx.quadraticCurveTo(0, -100, -10, -85);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        } else if (wingStyle === 'crystal') {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#93c5fd';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1.5;
            ctx.save();
            ctx.rotate(-0.25 + flap);
            ctx.beginPath();
            ctx.moveTo(-8, -85);
            ctx.lineTo(-40, -130);
            ctx.lineTo(-15, -115);
            ctx.lineTo(-30, -140);
            ctx.lineTo(-5, -110);
            ctx.lineTo(-10, -85);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            ctx.globalAlpha = 1;
        } else if (wingStyle === 'butterfly') {
            ctx.globalAlpha = 0.7;
            ctx.lineWidth = 1.5;
            ctx.save();
            ctx.rotate(-0.2 + flap);
            // Upper wing
            const grad1 = ctx.createRadialGradient(-20, -115, 5, -20, -115, 30);
            grad1.addColorStop(0, '#ff69b4');
            grad1.addColorStop(0.5, '#a855f7');
            grad1.addColorStop(1, '#3b82f6');
            ctx.fillStyle = grad1;
            ctx.beginPath();
            ctx.ellipse(-20, -115, 30, 22, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#a855f7';
            ctx.stroke();
            // Lower wing
            ctx.beginPath();
            ctx.ellipse(-15, -88, 20, 15, -0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            ctx.globalAlpha = 1;
        } else if (wingStyle === 'galaxy') {
            ctx.globalAlpha = 0.7;
            ctx.save();
            ctx.rotate(-0.25 + flap);
            const grad = ctx.createLinearGradient(-40, -140, 0, -80);
            grad.addColorStop(0, '#1e1b4b');
            grad.addColorStop(0.5, '#4c1d95');
            grad.addColorStop(1, '#7c3aed');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(-8, -85);
            ctx.quadraticCurveTo(-50, -125, -35, -140);
            ctx.quadraticCurveTo(-15, -135, -5, -115);
            ctx.quadraticCurveTo(0, -105, -8, -85);
            ctx.fill();
            // Tiny stars
            ctx.fillStyle = '#fff';
            [[-25, -120], [-15, -130], [-30, -110], [-20, -100]].forEach(([sx, sy]) => {
                ctx.beginPath();
                ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    _drawAccessory(ctx, accessory, bodyColor, bob) {
        ctx.save();
        ctx.translate(55, -120 + bob);

        if (accessory === 'flower-crown') {
            const flowers = [[-15, -22], [-5, -26], [5, -25], [15, -20]];
            flowers.forEach(([fx, fy], i) => {
                const colors = ['#ff69b4', '#ffd700', '#ff6347', '#87ceeb'];
                ctx.fillStyle = colors[i];
                ctx.beginPath();
                ctx.arc(fx, fy, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(fx, fy, 2, 0, Math.PI * 2);
                ctx.fill();
            });
            // Vine
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-15, -22);
            ctx.quadraticCurveTo(-10, -25, -5, -26);
            ctx.quadraticCurveTo(0, -27, 5, -25);
            ctx.quadraticCurveTo(10, -23, 15, -20);
            ctx.stroke();
        } else if (accessory === 'bow') {
            ctx.fillStyle = '#ff69b4';
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 1.5;
            // Left loop
            ctx.beginPath();
            ctx.ellipse(-12, -20, 10, 7, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Right loop
            ctx.beginPath();
            ctx.ellipse(-2, -22, 10, 7, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Center knot
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.arc(-7, -21, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (accessory === 'tiara') {
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-18, -18);
            ctx.lineTo(-12, -32);
            ctx.lineTo(-5, -22);
            ctx.lineTo(2, -35);
            ctx.lineTo(9, -22);
            ctx.lineTo(16, -30);
            ctx.lineTo(20, -16);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Gems
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.arc(2, -28, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(-12, -26, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (accessory === 'necklace') {
            ctx.save();
            ctx.translate(-55, 120 - bob); // undo head translate, back to body
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(30, -95, 20, 0.3, Math.PI - 0.3);
            ctx.stroke();
            // Pendant
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.arc(30, -75, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (accessory === 'cape') {
            ctx.save();
            ctx.translate(-55, 120 - bob); // undo head translate
            ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -100);
            ctx.quadraticCurveTo(-30, -60, -40, -20);
            ctx.lineTo(30, -20);
            ctx.quadraticCurveTo(40, -60, 20, -100);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    _drawRainbowOverlay(ctx, bob, time) {
        ctx.save();
        ctx.globalAlpha = 0.15 + Math.sin(time * 2) * 0.05;
        ctx.globalCompositeOperation = 'overlay';
        const grad = ctx.createLinearGradient(-70, -130 + bob, 70, 0);
        grad.addColorStop(0, '#ff0000');
        grad.addColorStop(0.17, '#ff8800');
        grad.addColorStop(0.33, '#ffff00');
        grad.addColorStop(0.5, '#00cc00');
        grad.addColorStop(0.67, '#0088ff');
        grad.addColorStop(0.83, '#8800ff');
        grad.addColorStop(1, '#ff00ff');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, -80 + bob, 70, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // ─── Utilities ───────────────────────────────────────────

    _darken(hex, amount) {
        if (hex === 'rainbow') return '#cc6699';
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
        const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
        const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
        return `rgb(${r},${g},${b})`;
    }

    _miniStar(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? size : size * 0.4;
            const angle = (Math.PI * i) / 5 - Math.PI / 2;
            const method = i === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x + Math.cos(angle) * r, y + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
    }
}
