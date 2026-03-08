/**
 * audio.js — Sound effects (Web Audio API) + narration (Speech Synthesis)
 * All sounds procedurally generated — zero external audio files
 */

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.speechSynth = window.speechSynthesis;
        this.voice = null;
        this.speaking = false;
        this.muted = false;
        this.narrationMuted = false;
        this._initVoice();
    }

    _ensureCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    _initVoice() {
        const pickVoice = () => {
            const voices = this.speechSynth.getVoices();
            const priorities = [
                v => v.name.includes('Samantha'),
                v => v.name.includes('Karen'),
                v => v.name.includes('Google UK English Female'),
                v => v.name.includes('Google US English'),
                v => v.name.includes('Female') && v.lang.startsWith('en'),
                v => v.lang.startsWith('en-') && v.name.includes('English'),
                v => v.lang.startsWith('en')
            ];
            for (const test of priorities) {
                const found = voices.find(test);
                if (found) { this.voice = found; return; }
            }
            if (voices.length > 0) this.voice = voices[0];
        };
        pickVoice();
        this.speechSynth.onvoiceschanged = pickVoice;
    }

    // ─── Helper: play oscillator ─────────────────────────────
    _osc(freq, type, gainVal, duration, startOffset = 0) {
        if (this.muted) return;
        this._ensureCtx();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        const t = this.ctx.currentTime + startOffset;
        gain.gain.setValueAtTime(gainVal, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.start(t);
        osc.stop(t + duration);
    }

    // ─── Sound Effects ───────────────────────────────────────

    /** Soft tap feedback */
    playTap() {
        this._osc(900, 'sine', 0.06, 0.06);
    }

    /** Sparkle chime — random high pitch */
    playSparkle() {
        const notes = [1200, 1400, 1600, 1800, 2000];
        this._osc(notes[Math.floor(Math.random() * notes.length)], 'sine', 0.08, 0.35);
    }

    /** Correct answer — bright double chime */
    playCorrect() {
        this._osc(880, 'sine', 0.1, 0.25, 0);
        this._osc(1100, 'sine', 0.1, 0.25, 0.1);
    }

    /** Star collected — rising triple chime */
    playStar() {
        this._osc(660, 'triangle', 0.12, 0.3, 0);
        this._osc(880, 'triangle', 0.12, 0.3, 0.1);
        this._osc(1100, 'triangle', 0.12, 0.4, 0.2);
    }

    /** Unicorn trot — soft rhythmic clip-clop */
    playTrot() {
        if (this.muted) return;
        this._ensureCtx();
        const t = this.ctx.currentTime;
        // Click 1
        const osc1 = this.ctx.createOscillator();
        const g1 = this.ctx.createGain();
        osc1.connect(g1); g1.connect(this.ctx.destination);
        osc1.frequency.value = 400;
        osc1.type = 'square';
        g1.gain.setValueAtTime(0.04, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc1.start(t); osc1.stop(t + 0.03);
        // Click 2
        const osc2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        osc2.connect(g2); g2.connect(this.ctx.destination);
        osc2.frequency.value = 350;
        osc2.type = 'square';
        g2.gain.setValueAtTime(0.03, t + 0.08);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
        osc2.start(t + 0.08); osc2.stop(t + 0.11);
    }

    /** Gentle encouragement — for wrong/try-again */
    playGentle() {
        this._osc(440, 'sine', 0.06, 0.3, 0);
        this._osc(380, 'sine', 0.05, 0.35, 0.15);
    }

    /** Fanfare — rising arpeggio C-E-G-C */
    playFanfare() {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => this._osc(freq, 'triangle', 0.12, 0.45, i * 0.12));
    }

    /** Big celebration — double fanfare + sparkles */
    playCelebration() {
        this.playFanfare();
        setTimeout(() => this.playSparkle(), 200);
        setTimeout(() => this.playSparkle(), 400);
        setTimeout(() => {
            const notes = [659.25, 783.99, 987.77, 1318.5];
            notes.forEach((freq, i) => this._osc(freq, 'triangle', 0.1, 0.5, i * 0.1));
        }, 500);
    }

    /** Magic power unlock — sweeping shimmer */
    playMagic() {
        if (this.muted) return;
        this._ensureCtx();
        const t = this.ctx.currentTime;
        for (let i = 0; i < 8; i++) {
            const freq = 600 + i * 200;
            this._osc(freq, 'sine', 0.06 - i * 0.005, 0.6, i * 0.07);
        }
    }

    /** Musical note (for Music Pond zone) */
    playNote(frequency, duration = 0.6) {
        this._osc(frequency, 'triangle', 0.15, duration);
        this._osc(frequency * 2, 'sine', 0.04, duration * 0.7);
    }

    /** Splash — noise burst */
    playSplash() {
        if (this.muted) return;
        this._ensureCtx();
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 2500;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        source.start();
    }

    // ─── Ambient Music (per-zone procedural loops) ───────────

    /** Start a gentle ambient loop for a zone */
    startZoneMusic(zoneId) {
        this.stopZoneMusic();
        if (this.muted) return;
        this._ensureCtx();
        this._musicInterval = setInterval(() => {
            if (this.muted) return;
            const scales = {
                'rainbow-meadow': [523, 587, 659, 698, 784, 880],
                'counting-creek': [440, 494, 523, 587, 659, 698],
                'letter-grove': [392, 440, 494, 523, 587, 659],
                'shape-mountain': [330, 392, 440, 494, 523, 587],
                'music-pond': [523, 587, 659, 784, 880, 988],
                'feelings-forest': [349, 392, 440, 494, 523, 587],
                'star-observatory': [262, 330, 392, 440, 523, 659],
                'swimming-pool': [523, 659, 784, 880, 988, 1047],
                'places-playground': [440, 523, 587, 659, 784, 880]
            };
            const scale = scales[zoneId] || scales['rainbow-meadow'];
            const note = scale[Math.floor(Math.random() * scale.length)];
            this._osc(note, 'sine', 0.03, 1.5);
        }, 2000 + Math.random() * 1500);
    }

    stopZoneMusic() {
        if (this._musicInterval) {
            clearInterval(this._musicInterval);
            this._musicInterval = null;
        }
    }

    // ─── Speech Synthesis (Narration) ────────────────────────

    speak(text, onEnd = null) {
        if (this.narrationMuted) { if (onEnd) onEnd(); return; }
        this.speechSynth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) utterance.voice = this.voice;
        utterance.rate = 0.85;
        utterance.pitch = 1.2;
        utterance.volume = 1;
        this.speaking = true;
        utterance.onend = () => { this.speaking = false; if (onEnd) onEnd(); };
        utterance.onerror = () => { this.speaking = false; if (onEnd) onEnd(); };
        this.speechSynth.speak(utterance);
    }

    stopSpeech() {
        this.speechSynth.cancel();
        this.speaking = false;
    }
}
