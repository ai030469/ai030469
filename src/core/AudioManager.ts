import type { SoundId } from '../types';

/**
 * Web Audio API based synthesized sound system.
 * All sounds are procedurally generated - no audio files needed.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private sfxGain!: GainNode;
  private musicGain!: GainNode;

  private masterVol = 0.7;
  private sfxVol = 0.8;
  private musicVol = 0.5;
  private sfxEnabled = true;
  private musicEnabled = true;

  // March beat oscillators
  private marchOscs: OscillatorNode[] = [];
  private marchNotes = [110, 92, 82, 92];
  private marchIndex = 0;
  private marchTimer = 0;
  private marchInterval = 0.5;
  private marchPlaying = false;

  private ufoLoop: OscillatorNode | null = null;

  // ─── Init ────────────────────────────────────────────────────────────────

  private ensureContext(): boolean {
    if (this.ctx) return true;
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.sfxGain    = this.ctx.createGain();
      this.musicGain  = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.applyVolumes();
      return true;
    } catch {
      return false;
    }
  }

  private applyVolumes(): void {
    if (!this.masterGain) return;
    this.masterGain.gain.value = this.masterVol;
    this.sfxGain.gain.value    = this.sfxEnabled ? this.sfxVol : 0;
    this.musicGain.gain.value  = this.musicEnabled ? this.musicVol : 0;
  }

  // ─── Settings ────────────────────────────────────────────────────────────

  setMasterVolume(v: number): void { this.masterVol = v; this.applyVolumes(); }
  setSfxVolume(v: number): void    { this.sfxVol = v;    this.applyVolumes(); }
  setMusicVolume(v: number): void  { this.musicVol = v;  this.applyVolumes(); }
  setSfxEnabled(on: boolean): void  { this.sfxEnabled = on;  this.applyVolumes(); }
  setMusicEnabled(on: boolean): void{ this.musicEnabled = on; this.applyVolumes(); }

  // ─── Core helpers ────────────────────────────────────────────────────────

  private osc(type: OscillatorType, freq: number, start: number, end: number,
               freqEnd?: number, gain = 0.3, dest?: AudioNode): void {
    if (!this.ctx) return;
    const d = dest ?? this.sfxGain;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    g.connect(d);
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (freqEnd !== undefined) {
      o.frequency.exponentialRampToValueAtTime(freqEnd, end);
    }
    o.connect(g);
    o.start(start);
    o.stop(end);
  }

  private noise(start: number, end: number, gain = 0.2, dest?: AudioNode): void {
    if (!this.ctx) return;
    const d = dest ?? this.sfxGain;
    const bufSize = Math.floor((end - start) * this.ctx.sampleRate) || 2048;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    src.connect(g);
    g.connect(d);
    src.start(start);
    src.stop(end);
  }

  // ─── Sound Effects ───────────────────────────────────────────────────────

  play(id: SoundId): void {
    if (!this.ensureContext() || !this.ctx) return;
    if (!this.sfxEnabled) return;
    const t = this.ctx.currentTime;
    switch (id) {
      case 'playerShot':
        this.osc('square', 880, t, t + 0.06, 440, 0.22);
        break;
      case 'enemyHit':
        this.noise(t, t + 0.12, 0.18);
        this.osc('square', 220, t, t + 0.1, 80, 0.15);
        break;
      case 'playerDeath':
        this.osc('sawtooth', 400, t,       t + 0.18, 60, 0.3);
        this.osc('sawtooth', 320, t + 0.1, t + 0.3, 40, 0.25);
        this.noise(t + 0.05, t + 0.4, 0.2);
        break;
      case 'ufoHit':
        this.osc('square', 1200, t, t + 0.08, 200, 0.3);
        this.osc('square', 600,  t + 0.06, t + 0.2, 100, 0.2);
        this.noise(t, t + 0.15, 0.15);
        break;
      case 'shieldHit':
        this.noise(t, t + 0.07, 0.1);
        break;
      case 'menuMove':
        this.osc('square', 660, t, t + 0.055, undefined, 0.12);
        break;
      case 'menuConfirm':
        this.osc('square', 880, t, t + 0.04, undefined, 0.18);
        this.osc('square', 1100, t + 0.04, t + 0.09, undefined, 0.18);
        break;
      case 'menuBack':
        this.osc('square', 440, t, t + 0.08, 220, 0.15);
        break;
      case 'waveClear':
        [0, 0.07, 0.14, 0.22, 0.32].forEach((delay, i) => {
          const freqs = [440, 550, 660, 880, 1100];
          this.osc('square', freqs[i], t + delay, t + delay + 0.09, undefined, 0.2);
        });
        break;
      case 'gameOver':
        this.osc('sawtooth', 220, t, t + 0.4, 55, 0.4);
        this.osc('sawtooth', 165, t + 0.35, t + 0.75, 40, 0.35);
        this.noise(t, t + 0.8, 0.1);
        break;
      case 'extraLife':
        [0, 0.08, 0.16, 0.24, 0.32, 0.4].forEach((delay, i) => {
          const freqs = [440, 550, 660, 770, 880, 1100];
          this.osc('square', freqs[i], t + delay, t + delay + 0.1, undefined, 0.18);
        });
        break;
      case 'march0': this.marchBeat(0); break;
      case 'march1': this.marchBeat(1); break;
      case 'march2': this.marchBeat(2); break;
      case 'march3': this.marchBeat(3); break;
    }
  }

  private marchBeat(idx: number): void {
    if (!this.ctx || !this.musicEnabled) return;
    const notes = [82, 69, 55, 69];
    const t = this.ctx.currentTime;
    this.osc('square', notes[idx], t, t + 0.08, undefined, 0.18, this.musicGain);
  }

  // ─── UFO Ambient Tone ────────────────────────────────────────────────────

  startUfoSound(): void {
    if (!this.ensureContext() || !this.ctx) return;
    if (!this.musicEnabled) return;
    this.stopUfoSound();
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 8;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 60;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const g = this.ctx.createGain();
    g.gain.value = 0.12 * this.musicVol * this.masterVol;
    osc.connect(g);
    g.connect(this.ctx.destination);

    lfo.start();
    osc.start();
    this.ufoLoop = osc;
  }

  stopUfoSound(): void {
    if (this.ufoLoop) {
      try { this.ufoLoop.stop(); } catch { /* ignore */ }
      this.ufoLoop = null;
    }
  }

  // ─── March Tick (called by gameplay) ─────────────────────────────────────

  updateMarch(dt: number, interval: number): void {
    if (!this.musicEnabled) return;
    this.marchTimer += dt;
    if (this.marchTimer >= interval) {
      this.marchTimer -= interval;
      this.play(`march${this.marchIndex}` as SoundId);
      this.marchIndex = (this.marchIndex + 1) % 4;
    }
  }

  resetMarch(): void {
    this.marchTimer = 0;
    this.marchIndex = 0;
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  /** Must be called once from a user gesture to unlock AudioContext. */
  unlock(): void {
    this.ensureContext();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }
}
