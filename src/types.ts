// ─── Geometry ──────────────────────────────────────────────────────────────
export interface Rect {
  x: number; y: number;
  w: number; h: number;
}

export interface Vec2 {
  x: number; y: number;
}

// ─── Input ─────────────────────────────────────────────────────────────────
export interface InputSnapshot {
  left: boolean;
  right: boolean;
  fire: boolean;
  pause: boolean;
  confirm: boolean;
  back: boolean;
  up: boolean;
  down: boolean;
  any: boolean;
}

// ─── Audio ─────────────────────────────────────────────────────────────────
export type SoundId =
  | 'playerShot'
  | 'enemyHit'
  | 'playerDeath'
  | 'ufoAppear'
  | 'ufoHit'
  | 'shieldHit'
  | 'menuMove'
  | 'menuConfirm'
  | 'menuBack'
  | 'waveClear'
  | 'gameOver'
  | 'extraLife'
  | 'march0' | 'march1' | 'march2' | 'march3';

// ─── Settings ──────────────────────────────────────────────────────────────
export interface Settings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  crtEffect: boolean;
  scanlines: boolean;
  screenShake: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  keyLeft: string;
  keyRight: string;
  keyFire: string;
  keyPause: string;
}

// ─── High Scores ───────────────────────────────────────────────────────────
export interface HighScoreEntry {
  initials: string;
  score: number;
  wave: number;
  date: string;
}

// ─── Game Session ──────────────────────────────────────────────────────────
export interface GameSession {
  score: number;
  highScore: number;
  lives: number;
  wave: number;
  active: boolean;
  paused: boolean;
}

// ─── Enemy Types ───────────────────────────────────────────────────────────
export type EnemyType = 'squid' | 'crab' | 'octopus';

// ─── State Names ───────────────────────────────────────────────────────────
export type StateName =
  | 'boot'
  | 'menu'
  | 'howtoplay'
  | 'settings'
  | 'gameplay'
  | 'pause'
  | 'levelTransition'
  | 'gameOver'
  | 'highScoreEntry'
  | 'leaderboard'
  | 'credits';

// ─── State Interface ───────────────────────────────────────────────────────
// Uses `any` context to avoid circular dependency between types.ts and Game.ts.
// Each state's concrete methods accept the typed Game object.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IGameState {
  name: StateName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEnter(ctx: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onExit(ctx: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(dt: number, ctx: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render(ctx: any): void;
}

// ─── State Context ─────────────────────────────────────────────────────────
// Alias kept for any legacy references
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StateContext = any;

// ─── Bullet ────────────────────────────────────────────────────────────────
export interface BulletData {
  active: boolean;
  x: number; y: number;
  vx: number; vy: number;
  w: number; h: number;
  owner: 'player' | 'enemy';
}

// ─── Particle ──────────────────────────────────────────────────────────────
export interface ParticleData {
  active: boolean;
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

// ─── Enemy Cell ────────────────────────────────────────────────────────────
export interface EnemyCell {
  alive: boolean;
  row: number;
  col: number;
  x: number;    // current render position
  y: number;
  frame: number; // animation frame 0/1
  flashTimer: number;
}

// ─── Menu Item ─────────────────────────────────────────────────────────────
export interface MenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
}

// ─── Dialog ────────────────────────────────────────────────────────────────
export interface DialogOptions {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
