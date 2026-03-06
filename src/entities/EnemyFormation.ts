import { ENEMY, CANVAS_WIDTH, PLAYFIELD_BOTTOM } from '../config';
import { ROW_TYPE } from './Sprites';
import type { EnemyCell } from '../types';

export class EnemyFormation {
  cells: EnemyCell[] = [];
  private direction = 1;         // 1 = right, -1 = left
  private offsetX = 0;           // cumulative horizontal shift
  private offsetY = 0;           // cumulative vertical drop
  private tickTimer = 0;
  private tickInterval: number;
  private animFrame = 0;         // 0 or 1, toggled each tick

  // Firing
  private fireTimer = 0;
  private fireInterval: number;
  pendingFire: EnemyCell | null = null;

  private wave = 1;

  constructor(wave = 1) {
    this.wave = wave;
    this.tickInterval  = this.calcTickInterval(ENEMY.COLS * ENEMY.ROWS);
    this.fireInterval  = this.calcFireInterval();
    this.build();
  }

  private build(): void {
    this.cells = [];
    this.direction = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.tickTimer = 0;
    this.animFrame = 0;

    for (let row = 0; row < ENEMY.ROWS; row++) {
      for (let col = 0; col < ENEMY.COLS; col++) {
        this.cells.push({
          alive: true,
          row, col,
          x: ENEMY.FORMATION_LEFT + col * (ENEMY.SPRITE_W + ENEMY.H_GAP),
          y: ENEMY.FORMATION_TOP  + row * (ENEMY.SPRITE_H + ENEMY.V_GAP),
          frame: 0,
          flashTimer: 0,
        });
      }
    }
  }

  private calcTickInterval(remaining: number): number {
    const ratio = remaining / (ENEMY.COLS * ENEMY.ROWS);
    const base  = ENEMY.TICK_INTERVAL_MIN + (ENEMY.TICK_INTERVAL_MAX - ENEMY.TICK_INTERVAL_MIN) * ratio;
    // Scale with wave
    const waveFactor = Math.pow(0.92, this.wave - 1);
    return Math.max(ENEMY.TICK_INTERVAL_MIN, base * waveFactor);
  }

  private calcFireInterval(): number {
    const base = 1.6;
    const scaled = base * Math.pow(0.9, this.wave - 1);
    return Math.max(0.28, scaled);
  }

  get aliveCount(): number {
    return this.cells.filter(c => c.alive).length;
  }

  get allDead(): boolean {
    return this.cells.every(c => !c.alive);
  }

  /** Returns the Y of the lowest alive enemy. */
  get lowestY(): number {
    let lowest = 0;
    for (const c of this.cells) {
      if (c.alive) {
        const bottom = c.y + this.offsetY + ENEMY.SPRITE_H;
        if (bottom > lowest) lowest = bottom;
      }
    }
    return lowest;
  }

  get hasReachedBottom(): boolean {
    return this.lowestY >= PLAYFIELD_BOTTOM - 80;
  }

  /** Kill one cell by (row, col). Returns score value. */
  kill(row: number, col: number): number {
    const cell = this.cells.find(c => c.row === row && c.col === col && c.alive);
    if (!cell) return 0;
    cell.alive = false;
    this.tickInterval = this.calcTickInterval(this.aliveCount);
    return ENEMY.ROW_SCORES[row] ?? 10;
  }

  /** Flash cell briefly on hit (used for near-miss visual). */
  flash(row: number, col: number): void {
    const cell = this.cells.find(c => c.row === row && c.col === col);
    if (cell) cell.flashTimer = 0.12;
  }

  update(dt: number): void {
    // Update flash timers
    for (const c of this.cells) {
      if (c.flashTimer > 0) c.flashTimer -= dt;
    }

    // Movement tick
    this.tickTimer += dt;
    if (this.tickTimer >= this.tickInterval) {
      this.tickTimer -= this.tickInterval;
      this.step();
    }

    // Fire tick
    this.fireTimer += dt;
    if (this.fireTimer >= this.fireInterval) {
      this.fireTimer -= this.fireInterval;
      this.pendingFire = this.selectShooter();
    }
  }

  private step(): void {
    const alive = this.cells.filter(c => c.alive);
    if (alive.length === 0) return;

    // Toggle animation frame
    this.animFrame = 1 - this.animFrame;
    for (const c of this.cells) c.frame = this.animFrame;

    // Calculate bounds with offset
    let minX = Infinity, maxX = -Infinity;
    for (const c of alive) {
      const ax = c.x + this.offsetX;
      if (ax < minX) minX = ax;
      if (ax + ENEMY.SPRITE_W > maxX) maxX = ax + ENEMY.SPRITE_W;
    }

    const margin = 12;
    const stepSize = 12;

    // Check if we should drop
    if (this.direction === 1 && maxX + stepSize >= CANVAS_WIDTH - margin) {
      this.offsetY += ENEMY.DROP_AMOUNT;
      this.direction = -1;
    } else if (this.direction === -1 && minX - stepSize <= margin) {
      this.offsetY += ENEMY.DROP_AMOUNT;
      this.direction = 1;
    } else {
      this.offsetX += this.direction * stepSize;
    }
  }

  /**
   * Choose a random shooter from the bottom-most alive enemy in each column.
   */
  private selectShooter(): EnemyCell | null {
    const aliveCols = new Map<number, EnemyCell>();
    for (const c of this.cells) {
      if (!c.alive) continue;
      const existing = aliveCols.get(c.col);
      if (!existing || c.row > existing.row) {
        aliveCols.set(c.col, c);
      }
    }
    const candidates = Array.from(aliveCols.values());
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /** Get world position of a cell. */
  cellWorldPos(c: EnemyCell): { x: number; y: number } {
    return { x: c.x + this.offsetX, y: c.y + this.offsetY };
  }

  /** Get all alive cells with their world positions for collision. */
  getAliveCellRects(): Array<{ cell: EnemyCell; x: number; y: number; w: number; h: number }> {
    return this.cells
      .filter(c => c.alive)
      .map(c => ({
        cell: c,
        x: c.x + this.offsetX,
        y: c.y + this.offsetY,
        w: ENEMY.SPRITE_W,
        h: ENEMY.SPRITE_H,
      }));
  }

  get currentOffsetX(): number { return this.offsetX; }
  get currentOffsetY(): number { return this.offsetY; }
}
