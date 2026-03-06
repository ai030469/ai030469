import { UFO as CFG, CANVAS_WIDTH, C } from '../config';
import { UFO_SPRITE } from './Sprites';

export class UFOShip {
  x = -100;
  y = CFG.Y;
  active = false;
  private direction = 1; // 1 = left-to-right, -1 = right-to-left

  readonly w = CFG.WIDTH;
  readonly h = CFG.HEIGHT;

  private animTimer = 0;
  private animFrame = 0;

  spawn(): void {
    if (this.active) return;
    this.direction = Math.random() < 0.5 ? 1 : -1;
    if (this.direction === 1) {
      this.x = -this.w - 4;
    } else {
      this.x = CANVAS_WIDTH + 4;
    }
    this.active = true;
  }

  update(dt: number): void {
    if (!this.active) return;
    this.x += this.direction * CFG.SPEED * dt;
    this.animTimer += dt;
    if (this.animTimer >= 0.12) {
      this.animTimer -= 0.12;
      this.animFrame = 1 - this.animFrame;
    }
    // Despawn if gone off-screen
    if (this.direction === 1 && this.x > CANVAS_WIDTH + this.w) {
      this.active = false;
    } else if (this.direction === -1 && this.x < -this.w * 2) {
      this.active = false;
    }
  }

  getScore(): number {
    return CFG.SCORES[Math.floor(Math.random() * CFG.SCORES.length)];
  }

  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
  get cx(): number { return this.x + this.w / 2; }
  get cy(): number { return this.y + this.h / 2; }
}
