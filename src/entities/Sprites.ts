/**
 * Pixel art sprite data for all game entities.
 * Each sprite is an 8-column array of rows, where 1 = filled pixel.
 * Rendered at 3px scale = 24x24 logical pixels per 8x8 sprite grid.
 */

// ─── Enemy Sprites (8×8, rendered at 3× = 24×24) ──────────────────────────

/** Squid / top-row alien — 2 animation frames */
export const SQUID: readonly (readonly number[])[][] = [
  // Frame 0
  [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,0,1,0,0,1,0,0],
    [0,1,0,1,1,0,1,0],
    [1,0,0,0,0,0,0,1],
  ],
  // Frame 1
  [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,0,1,1,0,1,0],
    [0,0,1,0,0,1,0,0],
    [0,1,0,0,0,0,1,0],
  ],
];

/** Crab / mid-row alien — 2 animation frames */
export const CRAB: readonly (readonly number[])[][] = [
  // Frame 0
  [
    [0,1,0,0,0,0,1,0],
    [0,0,1,0,0,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,0,1,0,0,1,0,1],
    [0,0,1,0,0,1,0,0],
  ],
  // Frame 1
  [
    [0,1,0,0,0,0,1,0],
    [1,0,1,0,0,1,0,1],
    [1,1,1,1,1,1,1,1],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0],
    [1,0,0,0,0,0,0,1],
  ],
];

/** Octopus / bottom-row alien — 2 animation frames */
export const OCTOPUS: readonly (readonly number[])[][] = [
  // Frame 0
  [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [1,1,0,0,0,0,1,1],
  ],
  // Frame 1
  [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [1,1,0,0,0,0,1,1],
    [0,1,1,0,0,1,1,0],
  ],
];

/** UFO / mystery ship sprite (12×6, rendered at 3× = 36×18) */
export const UFO_SPRITE: readonly (readonly number[])[] = [
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,1,1,0,0,0,0,1,1,0,0],
  [0,0,0,1,0,0,0,0,1,0,0,0],
];

/** Player ship (12×8, rendered at 3× = 36×24 – matches PLAYER.WIDTH/HEIGHT) */
export const PLAYER_SPRITE: readonly (readonly number[])[] = [
  [0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,0,1,0,1,0,1,0,1,0],
];

/** Explosion sprite (8×8) */
export const EXPLOSION: readonly (readonly number[])[] = [
  [0,1,0,0,0,0,1,0],
  [0,0,1,0,0,1,0,0],
  [1,0,0,1,1,0,0,1],
  [0,0,1,0,0,1,0,0],
  [1,1,0,0,0,0,1,1],
  [0,0,1,0,0,1,0,0],
  [0,1,0,1,1,0,1,0],
  [1,0,0,0,0,0,0,1],
];

// Map enemy type string → sprite frames
export const ENEMY_SPRITES: Record<string, readonly (readonly number[])[][]> = {
  squid:   SQUID,
  crab:    CRAB,
  octopus: OCTOPUS,
};

// Map row index → enemy type
export const ROW_TYPE: readonly string[] = [
  'squid',    // row 0 — top
  'crab',     // row 1
  'crab',     // row 2
  'octopus',  // row 3
  'octopus',  // row 4 — bottom
];
