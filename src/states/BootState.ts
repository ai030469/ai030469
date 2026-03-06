import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import { Renderer } from '../core/Renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C } from '../config';

export class BootState implements IGameState {
  name: StateName = 'boot';
  private timer = 0;
  private phase: 'fade-in' | 'hold' | 'fade-out' = 'fade-in';
  private readonly FADE_IN  = 0.8;
  private readonly HOLD     = 1.2;
  private readonly FADE_OUT = 0.6;
  private pulseTimer = 0;

  onEnter(_ctx: Game): void {
    this.timer = 0;
    this.phase = 'fade-in';
    this.pulseTimer = 0;
  }

  onExit(_ctx: Game): void {}

  update(dt: number, ctx: Game): void {
    this.timer += dt;
    this.pulseTimer += dt;

    const total = this.FADE_IN + this.HOLD + this.FADE_OUT;
    if (this.timer >= this.FADE_IN + this.HOLD) {
      this.phase = 'fade-out';
    } else if (this.timer >= this.FADE_IN) {
      this.phase = 'hold';
    }

    if (this.timer >= total) {
      ctx.go('menu');
    }

    // Skip on any key
    if (ctx.input.snapshot().any) {
      ctx.audio.unlock();
      ctx.go('menu');
    }
  }

  render(ctx: Game): void {
    const r = ctx.renderer;
    const total = this.FADE_IN + this.HOLD + this.FADE_OUT;
    let alpha = 1;
    if (this.phase === 'fade-in') {
      alpha = Math.min(1, this.timer / this.FADE_IN);
    } else if (this.phase === 'fade-out') {
      const elapsed = this.timer - this.FADE_IN - this.HOLD;
      alpha = 1 - Math.min(1, elapsed / this.FADE_OUT);
    }

    r.ctx.globalAlpha = alpha;

    // Background
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000008');

    // Decorative grid
    r.ctx.globalAlpha = alpha * 0.06;
    for (let x = 0; x < CANVAS_WIDTH; x += 32) {
      r.drawLine(x, 0, x, CANVAS_HEIGHT, C.BORDER, 1);
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 32) {
      r.drawLine(0, y, CANVAS_WIDTH, y, C.BORDER, 1);
    }
    r.ctx.globalAlpha = alpha;

    // Glow circle
    const pulse = Math.sin(this.pulseTimer * 3) * 0.15 + 0.85;
    r.ctx.globalAlpha = alpha * 0.08 * pulse;
    r.fillCircle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 160, '#00ff88');
    r.ctx.globalAlpha = alpha;

    // Logo text
    r.textShadow('PRESENTS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, C.DIM, '#000', 'center', 12);
    r.textShadow('SPACE RAIDERS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 14, C.HUD_SCORE, '#003300', 'center', 38, true);

    // Tagline
    r.textShadow('AN ARCADE CLASSIC', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36, C.BORDER, '#000', 'center', 13);

    // Version
    r.text('v1.0.0', CANVAS_WIDTH - 10, CANVAS_HEIGHT - 16, C.DIM, 'right', 10);

    r.ctx.globalAlpha = 1;
  }
}
