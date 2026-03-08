/**
 * creator.js — Unicorn character creator scene
 * Carousel UI with category arrows, live preview, name selection, reveal
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

        // Current selection per category — store IDs not hex values
        this.selections = this._loadSelectionsAsIds();

        // Name selection
        this.nameIndex = 0;
        this.selectedName = '';

        // Reveal animation
        this.revealTimer = 0;

        // UI layout (computed in init)
        this.prevCatButton = null;
        this.nextCatButton = null;
        this.doneButton = null;
        this.optionButtons = [];
    }

    /** Convert saved hex values back to option IDs for display matching */
    _loadSelectionsAsIds() {
        const saved = { ...this.game.save.state.unicorn };
        // bodyColor is stored as hex — find matching ID
        const bodyMatch = BODY_COLORS.find(b => b.hex === saved.bodyColor);
        if (bodyMatch) saved.bodyColor = bodyMatch.id;
        // maneColor is stored as hex — find matching ID
        const maneMatch = MANE_COLORS.find(m => m.hex === saved.maneColor);
        if (maneMatch) saved.maneColor = maneMatch.id;
        return saved;
    }

    init() {
        this._computeLayout();
        this.game.audio.speak("Let's create your unicorn!");
    }

    _computeLayout() {
        const W = this.game.W;
        const H = this.game.H;

        // Category prev/next arrows (large, prominent)
        this.prevCatButton = { x: W * 0.52, y: 70, w: 90, h: 90, icon: '◀' };
        this.nextCatButton = { x: W - 130, y: 70, w: 90, h: 90, icon: '▶' };

        // Done button (large, centered at bottom right)
        this.doneButton = {
            x: W * 0.58, y: H - 160, w: 300, h: 100,
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
        const cat = CATEGORIES[this.tabIndex];

        // Title
        ctx.font = 'bold 36px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText('Create Your Unicorn!', W * 0.25, 50);

        // Unicorn preview (left 45%)
        const config = this._buildConfig();
        this.unicorn.draw(ctx, W * 0.25, H * 0.55, config, 2.5, 1, time, false);

        // ─── Category header with arrows ───
        // Category name (centered in right panel)
        const catCenterX = W * 0.73;
        ctx.font = 'bold 34px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText(cat.icon + ' ' + cat.name, catCenterX, 120);

        // Category counter
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#a855f7';
        ctx.fillText(`${this.tabIndex + 1} / ${CATEGORIES.length}`, catCenterX, 155);

        // Prev arrow (left of category name)
        this._drawArrowButton(ctx, this.prevCatButton, time, this.tabIndex > 0);

        // Next arrow (right of category name)
        this._drawArrowButton(ctx, this.nextCatButton, time, this.tabIndex < CATEGORIES.length - 1);

        // ─── Options grid ───
        const options = this._getCurrentOptions();
        const selectedId = this.selections[cat.id];

        this.optionButtons = [];
        const cols = 3;
        const optW = 130;
        const optH = 100;
        const gap = 15;
        const gridTotalW = cols * (optW + gap) - gap;
        const gridX = catCenterX - gridTotalW / 2;
        const gridY = 185;

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
                ctx.lineWidth = 4;
                R.roundRect(ctx, ox, oy, optW, optH, 12);
                ctx.stroke();
            }

            // Color swatch or name
            if (cat.id === 'bodyColor' || cat.id === 'maneColor') {
                if (opt.hex === 'rainbow') {
                    const rg = ctx.createLinearGradient(ox + 10, oy + 10, ox + optW - 10, oy + optH - 30);
                    rg.addColorStop(0, '#ff0000');
                    rg.addColorStop(0.33, '#ffff00');
                    rg.addColorStop(0.66, '#00ff00');
                    rg.addColorStop(1, '#0000ff');
                    ctx.fillStyle = rg;
                } else {
                    ctx.fillStyle = opt.hex;
                }
                R.roundRect(ctx, ox + 10, oy + 8, optW - 20, optH - 35, 8);
                ctx.fill();
                // Name
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = selected ? '#fff' : '#555';
                ctx.fillText(opt.name, ox + optW / 2, oy + optH - 8);
            } else {
                // Text label
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = opt.locked ? '#999' : (selected ? '#fff' : '#555');
                ctx.fillText(opt.name, ox + optW / 2, oy + optH / 2);
            }

            // Lock icon
            if (opt.locked) {
                ctx.font = '28px sans-serif';
                ctx.textBaseline = 'middle';
                ctx.fillText('🔒', ox + optW / 2, oy + optH / 2 - 10);
            }
        });

        // ─── Done button ───
        R.drawButton(ctx, this.doneButton, time);
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText("I'm Done! ✨", this.doneButton.x + this.doneButton.w / 2, this.doneButton.y + this.doneButton.h / 2);
    }

    _drawArrowButton(ctx, btn, time, enabled) {
        const R = this.game.renderer;
        ctx.save();
        if (!enabled) ctx.globalAlpha = 0.3;
        ctx.fillStyle = enabled ? 'rgba(168, 85, 247, 0.85)' : 'rgba(150,150,150,0.4)';
        R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, btn.h / 2);
        ctx.fill();
        // Glow border
        if (enabled) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 3) * 0.1})`;
            ctx.lineWidth = 3;
            R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, btn.h / 2);
            ctx.stroke();
        }
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(btn.icon, btn.x + btn.w / 2, btn.y + btn.h / 2);
        ctx.restore();
    }

    _renderNamePicker(ctx, time) {
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;

        // Title
        ctx.font = 'bold 44px -apple-system, sans-serif';
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
        this._nameLeftBtn = { x: W / 2 - 300, y: nameY - 40, w: 80, h: 80 };
        ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
        R.roundRect(ctx, this._nameLeftBtn.x, this._nameLeftBtn.y, this._nameLeftBtn.w, this._nameLeftBtn.h, 40);
        ctx.fill();
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText('◀', this._nameLeftBtn.x + 40, this._nameLeftBtn.y + 40);

        // Name display
        ctx.font = 'bold 56px -apple-system, sans-serif';
        ctx.fillStyle = '#7c3aed';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, W / 2, nameY);

        // Right arrow
        this._nameRightBtn = { x: W / 2 + 220, y: nameY - 40, w: 80, h: 80 };
        ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
        R.roundRect(ctx, this._nameRightBtn.x, this._nameRightBtn.y, this._nameRightBtn.w, this._nameRightBtn.h, 40);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText('▶', this._nameRightBtn.x + 40, this._nameRightBtn.y + 40);

        // Confirm button
        const confirmBtn = {
            x: W / 2 - 160, y: H - 150, w: 320, h: 90,
            color: '#a855f7', colorDark: '#7c3aed'
        };
        this._confirmButton = confirmBtn;
        R.drawButton(ctx, confirmBtn, time);
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(`I'm ${name}! 💜`, confirmBtn.x + confirmBtn.w / 2, confirmBtn.y + confirmBtn.h / 2);
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
                x: W / 2 - 160, y: H - 150, w: 320, h: 100,
                color: '#a855f7', colorDark: '#7c3aed'
            };
            this._goButton = goBtn;
            this.game.renderer.drawButton(ctx, goBtn, time);
            ctx.font = 'bold 36px sans-serif';
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
            // Prev category arrow
            if (R.hitTest(x, y, this.prevCatButton) && this.tabIndex > 0) {
                this.tabIndex--;
                this.game.audio.playSparkle();
                return;
            }

            // Next category arrow
            if (R.hitTest(x, y, this.nextCatButton) && this.tabIndex < CATEGORIES.length - 1) {
                this.tabIndex++;
                this.game.audio.playSparkle();
                return;
            }

            // Option buttons
            for (const btn of this.optionButtons) {
                if (R.hitTest(x, y, btn) && !btn.locked) {
                    const cat = CATEGORIES[this.tabIndex];
                    this.selections[cat.id] = btn.id;
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
            // Left arrow
            if (this._nameLeftBtn && R.hitTest(x, y, this._nameLeftBtn)) {
                this.nameIndex = (this.nameIndex - 1 + UNICORN_NAMES.length) % UNICORN_NAMES.length;
                this.game.audio.playTap();
                return;
            }
            // Right arrow
            if (this._nameRightBtn && R.hitTest(x, y, this._nameRightBtn)) {
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

                // Save unicorn — convert IDs back to hex for storage
                const saveData = { ...this.selections, name: this.selectedName };
                const bodyMatch = BODY_COLORS.find(b => b.id === saveData.bodyColor);
                if (bodyMatch) saveData.bodyColor = bodyMatch.hex;
                const maneMatch = MANE_COLORS.find(m => m.id === saveData.maneColor);
                if (maneMatch) saveData.maneColor = maneMatch.hex;
                this.game.save.updateUnicorn(saveData);
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
        // Convert option IDs to values the renderer expects
        const bodyMatch = BODY_COLORS.find(b => b.id === this.selections.bodyColor);
        const maneMatch = MANE_COLORS.find(m => m.id === this.selections.maneColor);
        return {
            bodyColor: bodyMatch?.hex || this.selections.bodyColor || '#ffb6c1',
            maneColor: maneMatch?.hex || this.selections.maneColor || '#ff69b4',
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
