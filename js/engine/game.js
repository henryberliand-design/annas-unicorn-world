/**
 * game.js — Core game engine for Anna's Unicorn World
 * Game loop, scene management, transitions, coordinate mapping
 */

import { AudioEngine } from './audio.js';
import { InputManager } from './input.js';
import { SaveManager } from './save.js';
import { Renderer } from './renderer.js';
import { DDA } from './dda.js';
import { CreatorScene } from '../scenes/creator.js';
import { HubScene } from '../scenes/hub.js';
import { HUD } from '../ui/hud.js';
import { StableScene } from '../scenes/stable.js';
import { registerRainbowMeadow } from '../zones/rainbow-meadow.js';
import { registerCountingCreek } from '../zones/counting-creek.js';
import { registerLetterGrove } from '../zones/letter-grove.js';
import { registerShapeMountain } from '../zones/shape-mountain.js';
import { registerMusicPond } from '../zones/music-pond.js';
import { registerFeelingsForest } from '../zones/feelings-forest.js';
import { registerStarObservatory } from '../zones/star-observatory.js';
import { registerSwimmingPool } from '../zones/swimming-pool.js';
import { registerPlacesPlayground } from '../zones/places-playground.js';

// ─── Scene Manager ───────────────────────────────────────────
export class SceneManager {
    constructor() {
        this.currentScene = null;
        this.transitioning = false;
        this.transitionAlpha = 0;
        this.transitionDirection = 'in';
        this.nextSceneFactory = null;
        this.transitionSpeed = 2;
        this.transitionColor = '#1a0a2e';
    }

    switchTo(sceneFactory) {
        if (this.transitioning) return;
        this.transitioning = true;
        this.transitionDirection = 'in';
        this.transitionAlpha = 0;
        this.nextSceneFactory = sceneFactory;
    }

    setScene(scene) {
        if (this.currentScene && this.currentScene.destroy) {
            this.currentScene.destroy();
        }
        this.currentScene = scene;
        if (scene.init) scene.init();
    }

    update(dt) {
        if (this.transitioning) {
            if (this.transitionDirection === 'in') {
                this.transitionAlpha += this.transitionSpeed * dt;
                if (this.transitionAlpha >= 1) {
                    this.transitionAlpha = 1;
                    if (this.currentScene && this.currentScene.destroy) {
                        this.currentScene.destroy();
                    }
                    this.currentScene = this.nextSceneFactory();
                    if (this.currentScene.init) this.currentScene.init();
                    this.nextSceneFactory = null;
                    this.transitionDirection = 'out';
                }
            } else {
                this.transitionAlpha -= this.transitionSpeed * dt;
                if (this.transitionAlpha <= 0) {
                    this.transitionAlpha = 0;
                    this.transitioning = false;
                }
            }
        }
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(dt);
        }
    }

    render(ctx) {
        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render(ctx);
        }
        if (this.transitioning && this.transitionAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.transitionAlpha;
            ctx.fillStyle = this.transitionColor;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }

    handleInput(event) {
        if (this.transitioning) return;
        if (this.currentScene && this.currentScene.handleInput) {
            this.currentScene.handleInput(event);
        }
    }
}

// ─── Ripple System (visual tap feedback) ─────────────────────
class RippleSystem {
    constructor() {
        this.ripples = [];
    }

    add(x, y) {
        this.ripples.push({ x, y, radius: 0, alpha: 0.5 });
    }

    update(dt) {
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.radius += 180 * dt;
            r.alpha -= 1.5 * dt;
            if (r.alpha <= 0) this.ripples.splice(i, 1);
        }
    }

    render(ctx) {
        for (const r of this.ripples) {
            ctx.save();
            ctx.globalAlpha = r.alpha;
            ctx.strokeStyle = '#f8c8dc';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.stroke();
            // Inner sparkle
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = r.alpha * 0.5;
            ctx.beginPath();
            ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// ─── Particle System ─────────────────────────────────────────
export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addSparkle(x, y, count = 8, color = '#ffd700') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 80 + Math.random() * 120;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 0.6 + Math.random() * 0.4,
                size: 3 + Math.random() * 4,
                color,
                type: 'sparkle'
            });
        }
    }

    addConfetti(x, y, count = 20) {
        const colors = ['#ff69b4', '#ffd700', '#87ceeb', '#98fb98', '#dda0dd', '#ffb6c1'];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 100,
                y,
                vx: (Math.random() - 0.5) * 200,
                vy: -200 - Math.random() * 200,
                life: 1.5 + Math.random(),
                maxLife: 1.5 + Math.random(),
                size: 6 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 8,
                type: 'confetti'
            });
        }
    }

    addStars(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 60 + Math.random() * 80;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 40,
                life: 0.8 + Math.random() * 0.5,
                maxLife: 0.8 + Math.random() * 0.5,
                size: 8 + Math.random() * 6,
                color: '#ffd700',
                type: 'star'
            });
        }
    }

    addTrail(x, y, color = '#f8c8dc') {
        this.particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 20,
            vy: -20 - Math.random() * 30,
            life: 0.4 + Math.random() * 0.3,
            maxLife: 0.4 + Math.random() * 0.3,
            size: 2 + Math.random() * 4,
            color,
            type: 'sparkle'
        });
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.type === 'confetti') {
                p.vy += 300 * dt; // gravity
                p.rotation += p.rotSpeed * dt;
            }
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    render(ctx) {
        for (const p of this.particles) {
            const alpha = Math.max(0, p.life / p.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;

            if (p.type === 'star') {
                ctx.translate(p.x, p.y);
                ctx.fillStyle = p.color;
                this._drawStar(ctx, 0, 0, p.size * 0.5, p.size, 5);
            } else if (p.type === 'confetti') {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                // sparkle
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                ctx.fill();
                // glow
                ctx.globalAlpha = alpha * 0.3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    _drawStar(ctx, cx, cy, innerR, outerR, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI * i) / points - Math.PI / 2;
            const method = i === 0 ? 'moveTo' : 'lineTo';
            ctx[method](cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
    }
}

// ─── Main Game Class ─────────────────────────────────────────
export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.W = 1920;
        this.H = 1080;
        canvas.width = this.W;
        canvas.height = this.H;

        // Core systems
        this.audio = new AudioEngine();
        this.input = new InputManager(canvas, this);
        this.save = new SaveManager();
        this.renderer = new Renderer(this);
        this.dda = new DDA();
        this.scenes = new SceneManager();
        this.particles = new ParticleSystem();
        this.ripples = new RippleSystem();
        this.hud = new HUD(this);

        // Time tracking
        this.time = 0;
        this.lastFrame = 0;
        this.running = false;
    }

    /** Convert screen coordinates to canvas coordinates */
    screenToCanvas(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.W / rect.width;
        const scaleY = this.H / rect.height;
        return {
            x: (screenX - rect.left) * scaleX,
            y: (screenY - rect.top) * scaleY
        };
    }

    /** Start the game — enter creator or hub based on save state */
    start() {
        this.running = true;
        this.lastFrame = performance.now();

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }

        // Start with creator if no unicorn exists, otherwise hub
        if (!this.save.state.unicorn.name) {
            this.scenes.setScene(new CreatorScene(this));
        } else {
            this.scenes.setScene(new HubScene(this));
        }

        // Register all zones
        registerRainbowMeadow(this);
        registerCountingCreek(this);
        registerLetterGrove(this);
        registerShapeMountain(this);
        registerMusicPond(this);
        registerFeelingsForest(this);
        registerStarObservatory(this);
        registerSwimmingPool(this);
        registerPlacesPlayground(this);

        this._loop();
    }

    goToStable() {
        this.scenes.switchTo(() => new StableScene(this));
    }

    _loop() {
        if (!this.running) return;
        requestAnimationFrame(() => this._loop());

        const now = performance.now();
        const dt = Math.min((now - this.lastFrame) / 1000, 0.05); // cap at 50ms
        this.lastFrame = now;
        this.time += dt;

        this._update(dt);
        this._render();
    }

    _update(dt) {
        this.scenes.update(dt);
        this.particles.update(dt);
        this.ripples.update(dt);
    }

    _render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);

        this.scenes.render(ctx);
        this.particles.render(ctx);
        this.ripples.render(ctx);
        this.hud.render(ctx);
    }

    /** Handle input events from InputManager */
    handleInput(event) {
        // Add ripple on tap
        if (event.type === 'tap') {
            this.ripples.add(event.x, event.y);
            this.audio.playTap();
        }
        this.scenes.handleInput(event);
    }

    /** Navigate to a specific scene */
    goToCreator() {
        this.scenes.switchTo(() => new CreatorScene(this));
    }

    goToHub() {
        this.scenes.switchTo(() => new HubScene(this));
    }

    goToZone(zoneId) {
        // Dynamic zone loading — will be implemented per zone
        const { createZoneScene } = this._getZoneModule(zoneId);
        if (createZoneScene) {
            this.scenes.switchTo(() => createZoneScene(this));
        }
    }

    _getZoneModule(zoneId) {
        // Returns zone scene factory — zones register themselves
        return this._zoneRegistry?.[zoneId] || {};
    }

    /** Register a zone module */
    registerZone(zoneId, createFn) {
        if (!this._zoneRegistry) this._zoneRegistry = {};
        this._zoneRegistry[zoneId] = { createZoneScene: createFn };
    }
}
