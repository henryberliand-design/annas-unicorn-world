/**
 * menus.js — Pause menu, settings, parent gate (math problem)
 */

export class PauseMenu {
    constructor(game) {
        this.game = game;
        this.visible = false;
    }

    show() { this.visible = true; }
    hide() { this.visible = false; }

    render(ctx) {
        if (!this.visible) return;
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;

        // Dim overlay
        ctx.fillStyle = 'rgba(26, 10, 46, 0.7)';
        ctx.fillRect(0, 0, W, H);

        // Menu box
        const boxW = 400;
        const boxH = 300;
        const bx = (W - boxW) / 2;
        const by = (H - boxH) / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        R.roundRect(ctx, bx, by, boxW, boxH, 20);
        ctx.fill();

        ctx.font = 'bold 32px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText('Paused', W / 2, by + 50);

        // Resume button
        this._resumeBtn = { x: bx + 50, y: by + 100, w: 300, h: 60 };
        R.drawButton(ctx, { ...this._resumeBtn, color: '#22c55e', colorDark: '#16a34a' }, this.game.time);
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('Resume', W / 2, by + 135);

        // Settings button
        this._settingsBtn = { x: bx + 50, y: by + 180, w: 300, h: 60 };
        R.drawButton(ctx, { ...this._settingsBtn, color: '#a855f7', colorDark: '#7c3aed' }, this.game.time);
        ctx.fillText('Settings', W / 2, by + 215);
    }

    handleInput(event) {
        if (!this.visible || event.type !== 'tap') return false;
        const R = this.game.renderer;

        if (this._resumeBtn && R.hitTest(event.x, event.y, this._resumeBtn)) {
            this.hide();
            return true;
        }
        return false;
    }
}

/**
 * Parent gate — simple math problem to access parent settings
 * Proven pattern from Marina V2
 */
export class ParentGate {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.problem = null;
        this.choices = [];
        this.onSuccess = null;
    }

    show(onSuccess) {
        this.active = true;
        this.onSuccess = onSuccess;

        // Generate math problem
        const a = 5 + Math.floor(Math.random() * 10);
        const b = 5 + Math.floor(Math.random() * 10);
        const answer = a + b;
        this.problem = `${a} + ${b} = ?`;

        // Generate 4 choices
        const choices = [answer];
        while (choices.length < 4) {
            const wrong = answer + Math.floor(Math.random() * 10) - 5;
            if (wrong !== answer && wrong > 0 && !choices.includes(wrong)) {
                choices.push(wrong);
            }
        }
        // Shuffle
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        this.answer = answer;
        this.choices = choices;
    }

    render(ctx) {
        if (!this.active) return;
        const W = this.game.W;
        const H = this.game.H;
        const R = this.game.renderer;

        ctx.fillStyle = 'rgba(26, 10, 46, 0.85)';
        ctx.fillRect(0, 0, W, H);

        ctx.font = '24px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#d4a0e8';
        ctx.fillText('Parent Access', W / 2, H / 2 - 80);

        ctx.font = 'bold 36px -apple-system, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.problem, W / 2, H / 2 - 30);

        // Choice buttons
        this._choiceBtns = this.choices.map((c, i) => {
            const btn = { x: W / 2 - 200 + i * 100, y: H / 2 + 20, w: 80, h: 60 };
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            R.roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
            ctx.fill();
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = '#333';
            ctx.fillText(String(c), btn.x + btn.w / 2, btn.y + btn.h / 2 + 8);
            return { ...btn, value: c };
        });
    }

    handleInput(event) {
        if (!this.active || event.type !== 'tap') return;
        const R = this.game.renderer;

        for (const btn of (this._choiceBtns || [])) {
            if (R.hitTest(event.x, event.y, btn)) {
                if (btn.value === this.answer) {
                    this.active = false;
                    if (this.onSuccess) this.onSuccess();
                } else {
                    this.game.audio.playGentle();
                }
                return;
            }
        }
    }
}
