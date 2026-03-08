/**
 * hub.js — Side-scrolling hub world (kingdom)
 * Parallax background, zone gateways, unicorn walking
 */

import { UnicornRenderer } from '../characters/unicorn.js';

// Zone definitions with positions along the world
const ZONES = [
    { id: 'stable',           name: "Sparkle's Stable",    x: 200,  icon: '🏠', color: '#f8c8dc', alwaysOpen: true },
    { id: 'rainbow-meadow',   name: 'Rainbow Meadow',      x: 800,  icon: '🌈', color: '#98fb98' },
    { id: 'counting-creek',   name: 'Counting Creek',       x: 1500, icon: '🔢', color: '#87ceeb' },
    { id: 'letter-grove',     name: 'Letter Grove',         x: 2200, icon: '✏️', color: '#c4b5fd' },
    { id: 'shape-mountain',   name: 'Shape Mountain',       x: 2900, icon: '🔷', color: '#a5b4fc' },
    { id: 'music-pond',       name: 'Music Pond',           x: 3600, icon: '🎵', color: '#c4b5fd' },
    { id: 'feelings-forest',  name: 'Feelings Forest',      x: 4300, icon: '💚', color: '#86efac' },
    { id: 'star-observatory', name: 'Star Observatory',     x: 5000, icon: '🌟', color: '#c4b5fd' },
];

const BONUS_ZONES = [
    { id: 'swimming-pool',     name: 'Swimming Pool',      x: 2900, icon: '🏊', color: '#67e8f9', attachTo: 'shape-mountain', starsNeeded: 20 },
    { id: 'places-playground', name: 'Places Playground',   x: 4300, icon: '🛝', color: '#fcd34d', attachTo: 'feelings-forest', starsNeeded: 35 },
];

const WORLD_WIDTH = 5600; // total scrollable width
const GROUND_Y = 780;     // ground level

export class HubScene {
    constructor(game) {
        this.game = game;
        this.unicorn = new UnicornRenderer();

        // Camera
        this.cameraX = 0;
        this.targetCameraX = 0;

        // Unicorn position
        this.unicornX = game.save.state.unicorn.lastHubX || 400;
        this.unicornY = GROUND_Y;
        this.facing = 1; // 1 = right, -1 = left
        this.walking = false;
        this.walkSpeed = 300; // pixels per second
        this.moveDirection = 0; // -1, 0, 1

        // Touch movement
        this._holdingLeft = false;
        this._holdingRight = false;

        // Gateway buttons
        this.gateways = [];

        // Ambient time
        this.ambientTime = 0;
    }

    init() {
        this._buildGateways();

        // Narrate
        const name = this.game.save.state.unicorn.name || 'Your unicorn';
        this.game.audio.speak(`Welcome to the kingdom, ${name}! Tap a gateway to explore!`);

        // Center camera on unicorn
        this.cameraX = this.unicornX - this.game.W / 2;
        this.targetCameraX = this.cameraX;
    }

    _buildGateways() {
        this.gateways = ZONES.map(z => ({
            ...z,
            gatewayRect: { x: z.x - 50, y: GROUND_Y - 200, w: 100, h: 200 },
            visited: this.game.save.state.zonesVisited.includes(z.id),
            completed: this.game.save.isZoneComplete(z.id)
        }));

        // Bonus zone gateways
        BONUS_ZONES.forEach(bz => {
            const parent = ZONES.find(z => z.id === bz.attachTo);
            if (parent) {
                const open = this.game.save.totalStars >= bz.starsNeeded;
                this.gateways.push({
                    ...bz,
                    gatewayRect: { x: parent.x + 80, y: GROUND_Y - 180, w: 90, h: 180 },
                    visited: false,
                    completed: false,
                    bonus: true,
                    open,
                    starsNeeded: bz.starsNeeded
                });
            }
        });
    }

    update(dt) {
        this.ambientTime += dt;

        // Movement from keyboard
        const input = this.game.input;
        let moveDir = 0;
        if (input.isKeyDown('ArrowRight') || input.isKeyDown('d') || this._holdingRight) moveDir = 1;
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('a') || this._holdingLeft) moveDir = -1;

        this.moveDirection = moveDir;
        this.walking = moveDir !== 0;

        if (this.walking) {
            this.unicornX += moveDir * this.walkSpeed * dt;
            this.facing = moveDir;

            // Clamp to world bounds
            this.unicornX = Math.max(100, Math.min(WORLD_WIDTH - 100, this.unicornX));

            // Trot sound (throttled)
            if (Math.floor(this.ambientTime * 4) !== Math.floor((this.ambientTime - dt) * 4)) {
                this.game.audio.playTrot();
            }

            // Sparkle trail (if power unlocked)
            if (this.game.save.state.powersUnlocked.includes('sparkle-trot')) {
                this.game.particles.addTrail(
                    this.unicornX - this.cameraX + this.game.W / 2 - this.facing * 30,
                    this.unicornY + 5,
                    '#ffd700'
                );
            }
        }

        // Camera follows unicorn smoothly
        this.targetCameraX = this.unicornX - this.game.W / 2;
        this.targetCameraX = Math.max(0, Math.min(WORLD_WIDTH - this.game.W, this.targetCameraX));
        this.cameraX += (this.targetCameraX - this.cameraX) * 3 * dt;
    }

    render(ctx) {
        const W = this.game.W;
        const H = this.game.H;
        const cam = this.cameraX;
        const time = this.ambientTime;
        const R = this.game.renderer;

        // ─── Layer 1: Sky ───
        const skyColors = this._getSkyColors();
        R.drawSky(ctx, W, H, skyColors);

        // ─── Layer 2: Clouds ───
        R.drawClouds(ctx, cam, time, 100, 8);

        // ─── Layer 3: Far mountains ───
        R.drawHills(ctx, cam, 0.15, 400, 200, 'rgba(200, 180, 230, 0.5)');

        // ─── Layer 4: Mid hills ───
        R.drawHills(ctx, cam, 0.35, 500, 180, 'rgba(180, 220, 180, 0.6)');

        // ─── Layer 5: Near hills ───
        R.drawHills(ctx, cam, 0.55, 580, 150, 'rgba(160, 210, 160, 0.7)');

        // ─── Ground ───
        R.drawGround(ctx, GROUND_Y, H - GROUND_Y, '#7bc47f', '#5a9c5e');

        // ─── Zone gateways ───
        for (const gw of this.gateways) {
            this._drawGateway(ctx, gw, cam, time);
        }

        // ─── Unicorn ───
        const ux = this.unicornX - cam;
        const config = this.game.save.state.unicorn;
        this.unicorn.draw(ctx, ux, this.unicornY, config, 1.5, this.facing, time, this.walking);

        // ─── Foreground ───
        R.drawForegroundFlowers(ctx, cam, GROUND_Y + 15, time);

        // ─── Touch zones overlay (invisible — for movement) ───
        // Left 30% = move left, Right 30% = move right, Middle 40% = tap zones
    }

    _drawGateway(ctx, gw, cam, time) {
        const x = gw.gatewayRect.x - cam + 50; // center
        const y = gw.gatewayRect.y;
        const R = this.game.renderer;

        // Skip if off-screen
        if (x < -150 || x > this.game.W + 150) return;

        ctx.save();

        // Gateway arch
        const isBonus = gw.bonus;
        const isLocked = isBonus && !gw.open;
        const isCompleted = gw.completed;
        const isVisited = gw.visited;

        // Arch shape
        ctx.strokeStyle = isLocked ? '#888' : (isCompleted ? '#fbbf24' : gw.color);
        ctx.lineWidth = isCompleted ? 5 : 3;

        // Stone arch
        ctx.fillStyle = isLocked ? 'rgba(100, 100, 100, 0.6)' : 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y + 100, 50, Math.PI, 0);
        ctx.lineTo(x + 50, y + 200);
        ctx.lineTo(x - 50, y + 200);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shimmer for unvisited zones
        if (!isVisited && !isLocked) {
            const shimmer = 0.3 + Math.sin(time * 2 + gw.x * 0.01) * 0.2;
            R.drawGlow(ctx, x, y + 100, 70, time, gw.color);
        }

        // Completed bloom
        if (isCompleted) {
            R.drawGlow(ctx, x, y + 100, 60, time, '#ffd700');
        }

        // Lock icon for locked bonus zones
        if (isLocked) {
            ctx.font = '36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#666';
            ctx.fillText('🔒', x, y + 90);
            ctx.font = '14px sans-serif';
            ctx.fillText(`${gw.starsNeeded}⭐`, x, y + 120);
        }

        // Zone icon
        if (!isLocked) {
            ctx.font = '40px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(gw.icon, x, y + 80);
        }

        // Zone name
        ctx.font = '16px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isLocked ? '#888' : '#fff';
        ctx.fillText(gw.name, x, y + 215);

        // Stars earned indicator
        if (!isLocked && !gw.alwaysOpen) {
            const zoneStars = this.game.save.state.starsPerZone[gw.id];
            if (zoneStars) {
                const total = zoneStars.reduce((a, b) => a + b, 0);
                if (total > 0) {
                    ctx.font = '14px sans-serif';
                    ctx.fillStyle = '#fbbf24';
                    ctx.fillText(`${'⭐'.repeat(Math.min(total, 9))}`, x, y + 235);
                }
            }
        }

        ctx.restore();
    }

    _getSkyColors() {
        // Sky gradient shifts based on camera position
        const progress = this.cameraX / WORLD_WIDTH;
        if (progress < 0.3) {
            return ['#87ceeb', '#c8e6ff', '#fde4cf']; // Morning meadow
        } else if (progress < 0.6) {
            return ['#93c5fd', '#a5b4fc', '#c4b5fd']; // Midday mountains
        } else {
            return ['#1e1b4b', '#312e81', '#4c1d95']; // Evening observatory
        }
    }

    handleInput(event) {
        const { type, x, y } = event;
        const W = this.game.W;

        if (type === 'pointerdown') {
            // Touch movement — left/right thirds of screen
            if (x < W * 0.3) {
                this._holdingLeft = true;
            } else if (x > W * 0.7) {
                this._holdingRight = true;
            }
        }

        if (type === 'pointerup') {
            this._holdingLeft = false;
            this._holdingRight = false;
        }

        if (type === 'tap') {
            this._holdingLeft = false;
            this._holdingRight = false;

            // Check gateway taps
            for (const gw of this.gateways) {
                const gwScreenX = gw.gatewayRect.x - this.cameraX;
                const gwRect = {
                    x: gwScreenX,
                    y: gw.gatewayRect.y,
                    w: gw.gatewayRect.w,
                    h: gw.gatewayRect.h
                };
                if (this.game.renderer.hitTest(x, y, gwRect)) {
                    this._enterZone(gw);
                    return;
                }
            }
        }

        if (type === 'keydown') {
            if (event.key === 'Enter' || event.key === ' ') {
                // Enter nearest zone
                const nearest = this._findNearestGateway();
                if (nearest) this._enterZone(nearest);
            }
        }
    }

    _enterZone(gw) {
        if (gw.bonus && !gw.open) {
            this.game.audio.playGentle();
            this.game.audio.speak(`You need ${gw.starsNeeded} stars to open this!`);
            return;
        }

        this.game.audio.playMagic();
        this.game.save.visitZone(gw.id);

        // Save unicorn position
        this.game.save.state.unicorn.lastHubX = this.unicornX;
        this.game.save.save();

        if (gw.id === 'stable') {
            this.game.goToStable();
        } else {
            // Go to zone
            this.game.goToZone(gw.id);
        }
    }

    _findNearestGateway() {
        let nearest = null;
        let minDist = Infinity;
        for (const gw of this.gateways) {
            const dist = Math.abs(gw.x - this.unicornX);
            if (dist < minDist && dist < 150) {
                minDist = dist;
                nearest = gw;
            }
        }
        return nearest;
    }

    destroy() {
        this.game.audio.stopZoneMusic();
    }
}
