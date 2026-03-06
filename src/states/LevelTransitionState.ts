import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C, ENEMY } from '../config';
import { SQUID, CRAB, OCTOPUS } from '../entities/Sprites';

export class LevelTransitionState implements IGameState {
  name: StateName = 'levelTransition';
  private timer = 0;
  private phase: 'waveClear' | 'ready' = 'waveClear';
  private readonly WAVE_CLEAR_DURATION = 2.2;
  private readonly READY_DURATION = 1.8;
  private flashTimer = 0;
  private stars: Array<{ x: number; y: number; speed: number; size: number }> = [];

  private completedWave = 1;

  onEnter(ctx: Game): void {
    this.timer = 0;
    this.phase = 'waveClear';
    this.flashTimer = 0;
    this.completedWave = ctx.session.wave - 1;

    // Wave clear bonus
    const bonus = this.completedWave * 100;
    ctx.session.score += bonus;
    if (ctx.session.score > ctx.session.highScore) ctx.session.highScore = ctx.session.score;

    this.stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      speed: 30 + Math.random() * 80,
      size: Math.random() < 0.3 ? 2 : 1,
    }));
  }

  onExit(_ctx: Game): void {}

  update(dt: number, ctx: Game): void {
    this.timer += dt;
    this.flashTimer += dt;

    // Scroll stars
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > CANVAS_HEIGHT) { s.y = -2; s.x = Math.random() * CANVAS_WIDTH; }
    }

    if (this.phase === 'waveClear' && this.timer >= this.WAVE_CLEAR_DURATION) {
      this.phase = 'ready';
      this.timer = 0;
    }

    if (this.phase === 'ready' && this.timer >= this.READY_DURATION) {
      // Transition to next wave — reinitialize gameplay
      this.startNextWave(ctx);
    }
  }

  private startNextWave(ctx: Game): void {
    ctx.session.paused = false;
    ctx.go('gameplay');
  }

  render(ctx: Game): void {
    const r = ctx.renderer;
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000000');

    // Scrolling starfield
    for (const s of this.stars) {
      const alpha = s.speed / 110;
      r.ctx.globalAlpha = alpha;
      r.fillRect(s.x, s.y, s.size, s.size + Math.floor(s.speed / 30), '#ffffff');
    }
    r.ctx.globalAlpha = 1;

    // Wave clear banner
    if (this.phase === 'waveClear') {
      const progress = Math.min(1, this.timer / 0.4);
      const scale = 0.5 + progress * 0.5;
      r.ctx.save();
      r.ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      r.ctx.scale(scale, scale);
      r.text('WAVE CLEAR!', 0, -20, C.HUD_SCORE, 'center', 32, true);
      r.ctx.restore();

      const wave = ctx.session.wave - 1;
      r.text(`WAVE ${wave} COMPLETE`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, C.HIGHLIGHT, 'center', 16, true);

      // Score display
      r.text(`SCORE: ${String(ctx.session.score).padStart(6, '0')}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40, C.HUD_TEXT, 'center', 14);

      // Wave bonus
      const bonus = wave * 100;
      r.text(`WAVE BONUS: +${bonus}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 62, C.OK, 'center', 12);
    }

    // Get Ready banner
    if (this.phase === 'ready') {
      r.text(`WAVE ${ctx.session.wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30, C.HIGHLIGHT, 'center', 28, true);
      const blink = Math.floor(this.flashTimer * 3) % 2 === 0;
      if (blink) {
        r.text('GET READY!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 16, C.HUD_SCORE, 'center', 20, true);
      }

      // Show enemy score table briefly
      r.text('SCORE ADVANCE TABLE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60, C.DIM, 'center', 10);
      const enemies = [
        { sprite: SQUID[0], color: ENEMY.ROW_COLORS[0], pts: '30 PTS' },
        { sprite: CRAB[0],  color: ENEMY.ROW_COLORS[2], pts: '20 PTS' },
        { sprite: OCTOPUS[0], color: ENEMY.ROW_COLORS[4], pts: '10 PTS' },
      ];
      enemies.forEach((e, i) => {
        const x = CANVAS_WIDTH / 2 - 80 + i * 60;
        r.drawSprite(e.sprite, x - 8, CANVAS_HEIGHT / 2 + 74, e.color, 2);
        r.text(e.pts, x + 16, CANVAS_HEIGHT / 2 + 76, C.DIM, 'left', 9);
      });
    }
  }
}
