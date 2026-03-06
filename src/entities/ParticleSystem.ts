import type { ParticleData } from '../types';
import { ObjectPool } from '../core/ObjectPool';
import { PARTICLE } from '../config';

function makeParticle(): ParticleData {
  return { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, color: '#fff' };
}

export class ParticleSystem {
  readonly pool: ObjectPool<ParticleData>;

  constructor() {
    this.pool = new ObjectPool<ParticleData>(PARTICLE.MAX, makeParticle);
  }

  /** Emit an explosion burst at (cx, cy). */
  explode(cx: number, cy: number, color: string, count = 12): void {
    for (let i = 0; i < count; i++) {
      const p = this.pool.acquire();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = PARTICLE.SPEED_MIN + Math.random() * (PARTICLE.SPEED_MAX - PARTICLE.SPEED_MIN);
      p.active   = true;
      p.x        = cx;
      p.y        = cy;
      p.vx       = Math.cos(angle) * speed;
      p.vy       = Math.sin(angle) * speed;
      p.life     = 0;
      p.maxLife  = PARTICLE.LIFETIME * (0.6 + Math.random() * 0.8);
      p.size     = PARTICLE.SIZE_MIN + Math.random() * (PARTICLE.SIZE_MAX - PARTICLE.SIZE_MIN);
      p.color    = color;
    }
  }

  /** Emit shield debris. */
  shieldDebris(cx: number, cy: number, color: string): void {
    this.explode(cx, cy, color, 5);
  }

  update(dt: number): void {
    this.pool.forEach((p) => {
      p.life += dt;
      if (p.life >= p.maxLife) { p.active = false; return; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt; // subtle gravity
    });
  }

  reset(): void {
    this.pool.reset();
  }
}
