import type { BulletData } from '../types';
import { ObjectPool } from '../core/ObjectPool';
import { PLAYER, ENEMY, CANVAS_HEIGHT } from '../config';

const PLAYER_BULLET_W = 3;
const PLAYER_BULLET_H = 14;
const ENEMY_BULLET_W  = 3;
const ENEMY_BULLET_H  = 10;

function makeBullet(): BulletData {
  return { active: false, x: 0, y: 0, vx: 0, vy: 0, w: 0, h: 0, owner: 'player' };
}

export class BulletSystem {
  readonly pool: ObjectPool<BulletData>;
  private playerBulletCount = 0;

  constructor(maxBullets = 64) {
    this.pool = new ObjectPool<BulletData>(maxBullets, makeBullet);
  }

  firePlayer(cx: number, y: number): boolean {
    if (this.playerBulletCount >= 1) return false; // one shot at a time
    const b = this.pool.acquire();
    if (!b) return false;
    b.active = true;
    b.owner = 'player';
    b.w = PLAYER_BULLET_W;
    b.h = PLAYER_BULLET_H;
    b.x = cx - b.w / 2;
    b.y = y - b.h;
    b.vx = 0;
    b.vy = -PLAYER.BULLET_SPEED;
    this.playerBulletCount++;
    return true;
  }

  fireEnemy(cx: number, y: number): void {
    const b = this.pool.acquire();
    if (!b) return;
    b.active = true;
    b.owner = 'enemy';
    b.w = ENEMY_BULLET_W;
    b.h = ENEMY_BULLET_H;
    b.x = cx - b.w / 2;
    b.y = y;
    b.vx = 0;
    b.vy = ENEMY.BULLET_SPEED;
  }

  update(dt: number): void {
    let pc = 0;
    this.pool.forEach((b) => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      // Despawn off-screen
      if (b.y + b.h < 0 || b.y > CANVAS_HEIGHT + 10) {
        b.active = false;
      }
      if (b.owner === 'player' && b.active) pc++;
    });
    this.playerBulletCount = pc;
  }

  deactivate(b: BulletData): void {
    if (b.owner === 'player') this.playerBulletCount--;
    b.active = false;
  }

  reset(): void {
    this.pool.reset();
    this.playerBulletCount = 0;
  }

  get hasPlayerBullet(): boolean { return this.playerBulletCount > 0; }
}
