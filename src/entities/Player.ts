import { PLAYER, CANVAS_WIDTH, C } from '../config';
import { clamp } from '../core/CollisionSystem';
import type { Rect } from '../types';

export type PlayerState = 'alive' | 'dying' | 'dead' | 'respawning';

export class Player {
  x: number;
  y: number;
  readonly w = PLAYER.WIDTH;
  readonly h = PLAYER.HEIGHT;

  lives: number;
  state: PlayerState = 'alive';
  invulnTimer = 0;     // counts up during invulnerability
  dyingTimer = 0;      // counts up during death animation
  flashTimer = 0;      // oscillates for blink effect

  private fireCooldown = 0;

  constructor(lives: number = PLAYER.START_LIVES) {
    this.lives = lives;
    this.x = CANVAS_WIDTH / 2 - this.w / 2;
    this.y = PLAYER.START_Y;
  }

  reset(): void {
    this.x = CANVAS_WIDTH / 2 - this.w / 2;
    this.y = PLAYER.START_Y;
    this.state = 'alive';
    this.invulnTimer = 0;
    this.dyingTimer = 0;
    this.flashTimer = 0;
    this.fireCooldown = 0;
  }

  get cx(): number { return this.x + this.w / 2; }
  get rect(): Rect { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
  get isAlive(): boolean { return this.state === 'alive' || this.state === 'respawning'; }
  get isInvulnerable(): boolean {
    return this.state === 'respawning' || this.invulnTimer < PLAYER.INVULN_DURATION;
  }
  get canFire(): boolean {
    return this.state === 'alive' && this.fireCooldown <= 0 && this.invulnTimer >= PLAYER.INVULN_DURATION;
  }

  moveLeft(dt: number): void {
    if (!this.isAlive) return;
    this.x = clamp(this.x - PLAYER.SPEED * dt, 0, CANVAS_WIDTH - this.w);
  }

  moveRight(dt: number): void {
    if (!this.isAlive) return;
    this.x = clamp(this.x + PLAYER.SPEED * dt, 0, CANVAS_WIDTH - this.w);
  }

  triggerFire(): boolean {
    if (!this.canFire) return false;
    this.fireCooldown = PLAYER.FIRE_COOLDOWN;
    return true;
  }

  hit(): void {
    if (this.state !== 'alive') return;
    if (this.invulnTimer < PLAYER.INVULN_DURATION) return; // still invuln
    this.state = 'dying';
    this.dyingTimer = 0;
  }

  update(dt: number): void {
    this.flashTimer += dt;
    if (this.fireCooldown > 0) this.fireCooldown -= dt;

    if (this.state === 'dying') {
      this.dyingTimer += dt;
      if (this.dyingTimer >= PLAYER.RESPAWN_DELAY) {
        this.lives--;
        if (this.lives <= 0) {
          this.state = 'dead';
        } else {
          this.state = 'respawning';
          this.invulnTimer = 0;
          this.x = CANVAS_WIDTH / 2 - this.w / 2;
          this.fireCooldown = 0;
        }
      }
    } else if (this.state === 'respawning') {
      this.invulnTimer += dt;
      if (this.invulnTimer >= PLAYER.INVULN_DURATION) {
        this.state = 'alive';
      }
    } else if (this.state === 'alive') {
      if (this.invulnTimer < PLAYER.INVULN_DURATION) {
        this.invulnTimer += dt;
      }
    }
  }

  /** Returns true if the player should be drawn (handles blink). */
  get visible(): boolean {
    if (this.state === 'dead') return false;
    if (this.state === 'dying') {
      // Flash during death
      return Math.floor(this.dyingTimer * 12) % 2 === 0;
    }
    if (this.state === 'respawning' || this.invulnTimer < PLAYER.INVULN_DURATION) {
      return Math.floor(this.flashTimer * 8) % 2 === 0;
    }
    return true;
  }

  get color(): string {
    if (this.state === 'dying') return '#ff4444';
    return C.PLAYER;
  }
}
