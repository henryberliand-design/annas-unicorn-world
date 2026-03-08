/**
 * input.js — Unified touch + mouse + keyboard input
 * Emits normalized events: { type, x, y, key }
 */

export class InputManager {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this._dragStart = null;
        this._dragging = false;
        this._dragThreshold = 10;

        // Touch events
        canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this._onTouchEnd(e), { passive: false });

        // Mouse events (for desktop testing)
        canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this._onMouseUp(e));

        // Keyboard
        document.addEventListener('keydown', (e) => this._onKeyDown(e));
        document.addEventListener('keyup', (e) => this._onKeyUp(e));

        // Track held keys for continuous movement
        this.keysDown = new Set();
    }

    _emit(type, x, y, extra = {}) {
        this.game.handleInput({ type, x, y, ...extra });
    }

    _pos(clientX, clientY) {
        return this.game.screenToCanvas(clientX, clientY);
    }

    // ─── Touch ───────────────────────────────────────────────

    _onTouchStart(e) {
        e.preventDefault();
        const t = e.touches[0];
        const p = this._pos(t.clientX, t.clientY);
        this._dragStart = { x: p.x, y: p.y, sx: t.clientX, sy: t.clientY };
        this._dragging = false;
        this._emit('pointerdown', p.x, p.y);
    }

    _onTouchMove(e) {
        e.preventDefault();
        const t = e.touches[0];
        const p = this._pos(t.clientX, t.clientY);
        if (this._dragStart) {
            const dx = t.clientX - this._dragStart.sx;
            const dy = t.clientY - this._dragStart.sy;
            if (Math.sqrt(dx * dx + dy * dy) > this._dragThreshold) {
                this._dragging = true;
            }
        }
        this._emit('pointermove', p.x, p.y, {
            dragging: this._dragging,
            startX: this._dragStart?.x,
            startY: this._dragStart?.y
        });
    }

    _onTouchEnd(e) {
        e.preventDefault();
        // Use last known position from dragStart
        if (this._dragStart) {
            if (this._dragging) {
                const lastTouch = e.changedTouches[0];
                const p = this._pos(lastTouch.clientX, lastTouch.clientY);
                this._emit('dragend', p.x, p.y, {
                    startX: this._dragStart.x,
                    startY: this._dragStart.y
                });
            } else {
                this._emit('tap', this._dragStart.x, this._dragStart.y);
            }
        }
        const endPos = this._dragStart || { x: 0, y: 0 };
        this._dragStart = null;
        this._dragging = false;
        this._emit('pointerup', endPos.x, endPos.y);
    }

    // ─── Mouse ───────────────────────────────────────────────

    _onMouseDown(e) {
        const p = this._pos(e.clientX, e.clientY);
        this._dragStart = { x: p.x, y: p.y, sx: e.clientX, sy: e.clientY };
        this._dragging = false;
        this._emit('pointerdown', p.x, p.y);
    }

    _onMouseMove(e) {
        const p = this._pos(e.clientX, e.clientY);
        if (this._dragStart) {
            const dx = e.clientX - this._dragStart.sx;
            const dy = e.clientY - this._dragStart.sy;
            if (Math.sqrt(dx * dx + dy * dy) > this._dragThreshold) {
                this._dragging = true;
            }
        }
        this._emit('pointermove', p.x, p.y, {
            dragging: this._dragging && !!this._dragStart,
            startX: this._dragStart?.x,
            startY: this._dragStart?.y
        });
    }

    _onMouseUp(e) {
        const p = this._pos(e.clientX, e.clientY);
        if (this._dragStart) {
            if (this._dragging) {
                this._emit('dragend', p.x, p.y, {
                    startX: this._dragStart.x,
                    startY: this._dragStart.y
                });
            } else {
                this._emit('tap', p.x, p.y);
            }
        }
        this._dragStart = null;
        this._dragging = false;
        this._emit('pointerup', p.x, p.y);
    }

    // ─── Keyboard ────────────────────────────────────────────

    _onKeyDown(e) {
        this.keysDown.add(e.key);
        this._emit('keydown', 0, 0, { key: e.key });
    }

    _onKeyUp(e) {
        this.keysDown.delete(e.key);
        this._emit('keyup', 0, 0, { key: e.key });
    }

    isKeyDown(key) {
        return this.keysDown.has(key);
    }
}
