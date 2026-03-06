// ─── Canvas & Display ──────────────────────────────────────────────────────
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const TARGET_FPS = 60;
export const FIXED_STEP = 1000 / TARGET_FPS;

// ─── Playfield Layout ──────────────────────────────────────────────────────
export const HUD_HEIGHT = 56;
export const PLAYFIELD_TOP = HUD_HEIGHT;
export const PLAYFIELD_BOTTOM = 572;
export const GROUND_Y = 574;
export const PLAYER_ZONE_Y = 536;

// ─── Player ────────────────────────────────────────────────────────────────
export const PLAYER = {
  WIDTH: 36,
  HEIGHT: 20,
  SPEED: 230,           // px / sec
  FIRE_COOLDOWN: 0.55,  // sec between shots
  BULLET_SPEED: 500,    // px / sec upward
  START_LIVES: 3,
  INVULN_DURATION: 2.2, // seconds of invulnerability after respawn
  RESPAWN_DELAY: 1.2,   // seconds before respawn animation begins
  START_Y: PLAYER_ZONE_Y,
} as const;

// ─── Enemy Formation ───────────────────────────────────────────────────────
export const ENEMY = {
  COLS: 11,
  ROWS: 5,
  SPRITE_W: 32,
  SPRITE_H: 22,
  H_GAP: 16,            // horizontal gap between enemies
  V_GAP: 18,            // vertical gap between rows
  FORMATION_LEFT: 56,   // left edge of formation at wave start
  FORMATION_TOP: 96,    // top of formation at wave start
  DROP_AMOUNT: 22,      // pixels to drop per edge hit
  // Tick interval = time between each grid step (decreases as enemies die)
  TICK_INTERVAL_MAX: 0.85,
  TICK_INTERVAL_MIN: 0.05,
  BULLET_SPEED: 220,
  // Score by row index (0 = top)
  ROW_SCORES: [30, 20, 20, 10, 10] as number[],
  // Base color per row
  ROW_COLORS: ['#ff6633', '#33ffcc', '#33ffcc', '#ff33ff', '#ff33ff'] as string[],
} as const;

// ─── UFO / Mystery Ship ────────────────────────────────────────────────────
export const UFO = {
  WIDTH: 44,
  HEIGHT: 18,
  SPEED: 150,
  Y: 74,
  SCORES: [50, 100, 150, 200, 250, 300],
  SPAWN_MIN: 18,  // seconds
  SPAWN_MAX: 35,
} as const;

// ─── Shields ───────────────────────────────────────────────────────────────
export const SHIELD = {
  COUNT: 4,
  PIXEL: 4,      // pixel block size in px
  COLS: 13,      // blocks wide
  ROWS: 10,      // blocks tall
  Y: 448,        // top of shields
  COLOR: '#44ff44',
  DAMAGED_COLOR: '#22aa22',
} as const;

// ─── Enemy Fire ────────────────────────────────────────────────────────────
export const ENEMY_FIRE = {
  INTERVAL_MIN: 0.7,   // seconds
  INTERVAL_MAX: 1.8,
  WAVE_SCALE: 0.92,    // multiplied per wave for escalation
  MIN_FLOOR: 0.3,
} as const;

// ─── Particles ─────────────────────────────────────────────────────────────
export const PARTICLE = {
  MAX: 256,
  LIFETIME: 0.6,
  SPEED_MIN: 40,
  SPEED_MAX: 160,
  SIZE_MIN: 2,
  SIZE_MAX: 5,
} as const;

// ─── Colors ────────────────────────────────────────────────────────────────
export const C = {
  BG:             '#000000',
  PLAYER:         '#44ff44',
  PLAYER_BULLET:  '#ffffff',
  ENEMY_BULLET:   '#ff6600',
  UFO:            '#ff2222',
  SHIELD:         '#44ff44',
  GROUND:         '#44ff44',
  HUD_TEXT:       '#ffffff',
  HUD_SCORE:      '#44ff44',
  HIGHLIGHT:      '#ffff33',
  DIM:            '#666666',
  BORDER:         '#33ffcc',
  SCANLINE:       'rgba(0,0,0,0.14)',
  VIGNETTE_INNER: 'rgba(0,0,0,0)',
  VIGNETTE_OUTER: 'rgba(0,0,0,0.55)',
  FLASH:          'rgba(255,255,255,0.08)',
  WARNING:        '#ff4444',
  OK:             '#44ff44',
  INFO:           '#44ccff',
} as const;

// ─── Audio ─────────────────────────────────────────────────────────────────
export const AUDIO = {
  DEFAULT_MASTER: 0.7,
  DEFAULT_SFX: 0.8,
  DEFAULT_MUSIC: 0.5,
} as const;

// ─── High Scores ───────────────────────────────────────────────────────────
export const MAX_HIGH_SCORES = 10;
export const INITIALS_LENGTH = 3;
