/**
 * dda.js — Dynamic Difficulty Adjustment
 * Tracks performance within each mini-game and adjusts difficulty
 * No fail states — DDA only adjusts complexity, never punishes
 */

export class DDA {
    constructor() {
        // Track per-minigame performance
        this.sessions = {};
    }

    /** Start tracking a mini-game session */
    startSession(miniGameId) {
        this.sessions[miniGameId] = {
            attempts: 0,
            successes: 0,
            consecutiveSuccesses: 0,
            consecutiveStruggles: 0,
            level: 1,           // 1 = easy, 2 = medium, 3 = hard
            startTime: Date.now()
        };
    }

    /** Record a successful interaction */
    recordSuccess(miniGameId) {
        const s = this.sessions[miniGameId];
        if (!s) return;
        s.attempts++;
        s.successes++;
        s.consecutiveSuccesses++;
        s.consecutiveStruggles = 0;

        // Level up after 3 consecutive successes
        if (s.consecutiveSuccesses >= 3 && s.level < 3) {
            s.level++;
            s.consecutiveSuccesses = 0;
        }
    }

    /** Record a struggle (wrong answer, needed hint, took too long) */
    recordStruggle(miniGameId) {
        const s = this.sessions[miniGameId];
        if (!s) return;
        s.attempts++;
        s.consecutiveSuccesses = 0;
        s.consecutiveStruggles++;

        // Level down after 3 consecutive struggles
        if (s.consecutiveStruggles >= 3 && s.level > 1) {
            s.level--;
            s.consecutiveStruggles = 0;
        }
    }

    /** Get current difficulty level (1-3) */
    getLevel(miniGameId) {
        return this.sessions[miniGameId]?.level || 1;
    }

    /** Calculate star rating (1-3) based on session performance */
    calculateStars(miniGameId) {
        const s = this.sessions[miniGameId];
        if (!s || s.attempts === 0) return 1;

        const ratio = s.successes / s.attempts;
        if (ratio >= 0.85) return 3;
        if (ratio >= 0.6) return 2;
        return 1; // always at least 1 star — no fail states
    }
}
