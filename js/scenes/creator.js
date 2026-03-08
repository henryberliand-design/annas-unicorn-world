/**
 * creator.js — Unicorn character creator scene
 * Carousel UI with category tabs, live preview, name selection, reveal
 */

import { UnicornRenderer } from '../characters/unicorn.js';
import { CATEGORIES, UNICORN_NAMES, getOptions, BODY_COLORS, MANE_COLORS } from '../characters/customisation.js';

export class CreatorScene {
    constructor(game) {
        this.game = game;
        this.unicorn = new UnicornRenderer();
        this.phase = 'create'; // 'create' | 'name' | 'reveal'

        // Current tab
        this.tabIndex = 0;

        // Current selection per category
        this.selections = { ...game.save.state.unicorn };

        // Carousel scroll index per category
        this.carouselIndex = {};
        CATEGORIES.forEach(c => { this.carouselIndex[c.id] = 0; });

        // Name selection
        this.nameIndex = 0;
        this.selectedName = '';

        // Reveal animation
        this.revealTimer = 0;

        // UI layout (computed in init)
        this.tabButtons = [];
        this.arrowLeft = null;
        this.arrowRight = null;
        this.doneButton = null;
        this.optionButtons = [];
    }

    init() {
        this._computeLayout();
        this.game.audio.speak("Let's create your unicorn!");
    }

    _computeLayout() {
        const W = this.game.W;
        const H = this.game.H;

        // Tab buttons along the bottom
        const tabW = 90;
        const tabH = 80;
        const tabY = H - tabH - 15;
        const totalTabW = CATEGORIES.length * (tabW + 10);
        const tabStartX = (W - totalTabW) / 2;

        this.tabButtons = CATEGORIES.map((cat, i) => ({
            x: tabStartX + i * (tabW + 10),
            y: tabY,
            w: tabW,
            h: tabH,
            icon: cat.icon,
            id: cat.id,
            name: cat.name
        }));

        // Arrows for carousel
        this.arrowLeft = { x: W / 2 + 150, y: H / 2 - 40, w: 80, h: 80, icon: '◀' };
        this.arrowRight = { x: W - 120, y: H / 2 - 40, w: 80, h: 80, icon: '▶' };

        // Done button
        this.doneButton = {
            x: W / 2 + 200, y: H - 180, w: 200, h: 70,
            icon: '✨', color: '#a855f7', colorDark: '#7c3aed'
        };
    }

    update(dt) {
        if (this.phase === 'reveal') {
            this.revealTimer += dt;
        }
    }

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const time = this.game.time;

        // Background — soft pastel gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#e8b4f8');
        grad.addColorStop(0.4, '#f8c8dc');
        grad.addColorStop(0.7, '#fde4cf');
        grad.addColorStop(1, '#c8e6ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Ambient sparkles
        this._drawAmbientSparkles(ctx, time);

        if (this.phase === 'create') {
            this._renderCreator(ctx, time);
        } else if (this.phase === 'name') {
            this._renderNamePicker(ctx, time);
        } else if (this.phase === 'reveal') {
            this._renderReveal(ctx, time);
        }
    }

    _renderCreator(ctx, time) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;

        // Title
        ctx.font = 'bold 36px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText('Create Your Unicorn!', W / 2, 50);

        // Unicorn preview (left half)
        const config = this._buildConfig();
        this.unicorn.draw(ctx, W * 0.3, H * 0.55, config, 2.5, 1, time, false);

        // Category tabs
        this.tabButtons.forEach((btn, i) => {
            const active = i === this.tabIndex;
            ctx.fillStyle = active ? 'rgba(168, 85, 247, 0.9)' : 'rgba(255, 255, 255, 0.7)';
            R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 15);
            ctx.fill();
            if (active) {
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 3;
                R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 15);
                ctx.stroke();
            }
            // Icon
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = active ? '#fff' : '#333';
            ctx.fillText(btn.icon, btn.x + btn.w / 2, btn.y + btn.h / 2);
        });

        // Options carousel (right half)
        const cat = CATEGORIES[this.tabIndex];
        const options = this._getCurrentOptions();
        const selectedId = this.selections[cat.id];

        // Category name
        ctx.font = 'bold 26px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText(cat.name, W * 0.72, H * 0.18);

        // Options grid
        this.optionButtons = [];
        const cols = 3;
        const optW = 100;
        const optH = 80;
        const gap = 15;
        const gridX = W * 0.72 - (cols * (optW + gap)) / 2;
        const gridY = H * 0.25;

        options.forEach((opt, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const ox = gridX + col * (optW + gap);
            const oy = gridY + row * (optH + gap);

            const selected = opt.id === selectedId;
            const btn = { x: ox, y: oy, w: optW, h: optH, id: opt.id, locked: opt.locked };
            this.optionButtons.push(btn);

            // Button background
            if (opt.locked) {
                ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
            } else if (selected) {
                ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            }
            R.roundRect(ctx, ox, oy, optW, optH, 12);
            ctx.fill();

            if (selected) {
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 3;
                R.roundRect(ctx, ox, oy, optW, optH, 12);
                ctx.stroke();
            }

            // Color swatch or name
            if (cat.id === 'bodyColor' || cat.id === 'maneColor') {
                if (opt.hex === 'rainbow') {
                    // Rainbow swatch
                    const rg = ctx.createLinearGradient(ox + 15, oy + 15, ox + optW - 15, oy + optH - 15);
                    rg.addColorStop(0, '#ff0000');
                    rg.addColorStop(0.33, '#ffff00');
                    rg.addColorStop(0.66, '#00ff00');
                    rg.addColorStop(1, '#0000ff');
                    ctx.fillStyle = rg;
                } else {
                    ctx.fillStyle = opt.hex;
                }
                R.roundRect(ctx, ox + 15, oy + 10, optW - 30, optH - 35, 8);
                ctx.fill();
                // Name
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = selected ? '#fff' : '#555';
                ctx.fillText(opt.name, ox + optW / 2, oy + optH - 8);
            } else {
                // Text label
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = opt.locked ? '#999' : (selected ? '#fff' : '#555');
                ctx.fillText(opt.name, ox + optW / 2, oy + optH / 2);
            }

            // Lock icon
            if (opt.locked) {
                ctx.font = '24px sans-serif';
                ctx.fillText('🔒', ox + optW / 2, oy + optH / 2 - 10);
            }
        });

        // Done button
        R.drawButton(ctx, this.doneButton, time);
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText('Done! ✨', this.doneButton.x + this.doneButton.w / 2, this.doneButton.y + this.doneButton.h / 2);
    }

    _renderNamePicker(ctx, time) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;

        // Title
        ctx.font = 'bold 40px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText('Name Your Unicorn!', W / 2, 80);

        // Unicorn preview
        const config = this._buildConfig();
        this.unicorn.draw(ctx, W / 2, H * 0.48, config, 2.8, 1, time, false);

        // Name carousel
        const nameY = H * 0.75;
        const name = UNICORN_NAMES[this.nameIndex];

        // Left arrow
        ctx.font = 'bold 60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#a855f7';
        ctx.fillText('◀', W / 2 - 250, nameY + 10);

        // Name display
        ctx.font = 'bold 52px -apple-system, sans-serif';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText(name, W / 2, nameY + 15);

        // Right arrow
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 60px sans-serif';
        ctx.fillText('▶', W / 2 + 250, nameY + 10);

        // Confirm button
        const confirmBtn = {
            x: W / 2 - 120, y: H - 130, w: 240, h: 70,
            color: '#a855f7', colorDark: '#7c3aed'
        };
        this._confirmButton = confirmBtn;
        R.drawButton(ctx, confirmBtn, time);
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(`I'm ${name}!`, confirmBtn.x + confirmBtn.w / 2, confirmBtn.y + confirmBtn.h / 2);
    }

    _renderReveal(ctx, time) {
        const W = this.game.W;
        const H = this.game.H;
        const t = this.revealTimer;

        // Sparkle burst
        const alpha = Math.min(1, t * 2);
        ctx.globalAlpha = alpha;

        // Unicorn grows in
        const scale = Math.min(3.2, t * 4);
        const config = this._buildConfig();
        this.unicorn.draw(ctx, W / 2, H * 0.55, config, scale, 1, time, false);

        // Name text
        if (t > 0.8) {
            const nameAlpha = Math.min(1, (t - 0.8) * 2);
            ctx.globalAlpha = nameAlpha;
            ctx.font = 'bold 56px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#7c3aed';
            ctx.fillText(this.selectedName, W / 2, 100);

            // Subtitle
            ctx.font = '28px sans-serif';
            ctx.fillStyle = '#a855f7';
            ctx.fillText('is ready for adventure!', W / 2, 150);
        }

        ctx.globalAlpha = 1;

        // Continuous sparkle particles
        if (t > 0.3 && Math.random() < 0.3) {
            this.game.particles.addSparkle(
                W / 2 + (Math.random() - 0.5) * 400,
                H / 2 + (Math.random() - 0.5) * 300,
                3, '#ffd700'
            );
        }

        // "Let's Go!" button after 2 seconds
        if (t > 2) {
            const goBtn = {
                x: W / 2 - 120, y: H - 140, w: 240, h: 80,
                color: '#a855f7', colorDark: '#7c3aed'
            };
            this._goButton = goBtn;
            this.game.renderer.drawButton(ctx, goBtn, time);
            ctx.font = 'bold 30px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText("Let's Go! 🌟", goBtn.x + goBtn.w / 2, goBtn.y + goBtn.h / 2);
        }
    }

    _drawAmbientSparkles(ctx, time) {
        ctx.save();
        for (let i = 0; i < 15; i++) {
            const x = (i * 137 + time * 20) % this.game.W;
            const y = (i * 89 + Math.sin(time + i) * 30) % this.game.H;
            const alpha = 0.3 + Math.sin(time * 2 + i) * 0.2;
            const size = 2 + Math.sin(time * 3 + i * 0.5) * 1.5;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    handleInput(event) {
        if (event.type !== 'tap') return;
        const { x, y } = event;
        const R = this.game.renderer;

        if (this.phase === 'create') {
            // Tab buttons
            for (let i = 0; i < this.tabButtons.length; i++) {
                if (R.hitTest(x, y, this.tabButtons[i])) {
                    this.tabIndex = i;
                    this.game.audio.playSparkle();
                    return;
                }
            }

            // Option buttons
            for (const btn of this.optionButtons) {
                if (R.hitTest(x, y, btn) && !btn.locked) {
                    const cat = CATEGORIES[this.tabIndex];
                    if (cat.id === 'bodyColor') {
                        const opt = BODY_COLORS.find(b => b.id === btn.id);
                        this.selections.bodyColor = opt?.hex || btn.id;
                    } else if (cat.id === 'maneColor') {
                        const opt = MANE_COLORS.find(m => m.id === btn.id);
                        this.selections.maneColor = opt?.hex || btn.id;
                    } else {
                        this.selections[cat.id] = btn.id;
                    }
                    this.game.audio.playSparkle();
                    return;
                }
            }

            // Done button
            if (R.hitTest(x, y, this.doneButton)) {
                this.phase = 'name';
                this.game.audio.playFanfare();
                this.game.audio.speak("Now let's pick a name!");
                return;
            }
        } else if (this.phase === 'name') {
            const W = this.game.W;
            const H = this.game.H;
            const nameY = H * 0.75;

            // Left arrow
            if (x < W / 2 - 150 && y > nameY - 50 && y < nameY + 50) {
                this.nameIndex = (this.nameIndex - 1 + UNICORN_NAMES.length) % UNICORN_NAMES.length;
                this.game.audio.playTap();
                return;
            }
            // Right arrow
            if (x > W / 2 + 150 && y > nameY - 50 && y < nameY + 50) {
                this.nameIndex = (this.nameIndex + 1) % UNICORN_NAMES.length;
                this.game.audio.playTap();
                return;
            }
            // Confirm
            if (this._confirmButton && R.hitTest(x, y, this._confirmButton)) {
                this.selectedName = UNICORN_NAMES[this.nameIndex];
                this.phase = 'reveal';
                this.revealTimer = 0;
                this.game.audio.playCelebration();
                this.game.particles.addConfetti(this.game.W / 2, this.game.H / 2, 40);
                this.game.audio.speak(`Meet ${this.selectedName}! Your magical unicorn!`);

                // Save unicorn
                this.game.save.updateUnicorn({
                    ...this.selections,
                    name: this.selectedName
                });
                return;
            }
        } else if (this.phase === 'reveal') {
            if (this.revealTimer > 2 && this._goButton && R.hitTest(x, y, this._goButton)) {
                this.game.audio.playMagic();
                this.game.goToHub();
            }
        }
    }

    _getCurrentOptions() {
        const cat = CATEGORIES[this.tabIndex];
        return getOptions(cat.id, this.game.save.state.unlockedItems);
    }

    _buildConfig() {
        return {
            bodyColor: this.selections.bodyColor || '#ffb6c1',
            maneColor: this.selections.maneColor || '#ff69b4',
            maneStyle: this.selections.maneStyle || 'flowing',
            horn: this.selections.horn || 'classic',
            wings: this.selections.wings || 'none',
            eyes: this.selections.eyes || 'big-round',
            accessory: this.selections.accessory || 'none',
            magicTrail: this.selections.magicTrail || 'basic-sparkles'
        };
    }

    destroy() {}
}
