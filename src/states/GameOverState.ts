import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C } from '../config';
import { qualifiesForLeaderboard } from '../persistence/Storage';

export class GameOverState implements IGameState {
  name: StateName = 'gameOver';
  private timer = 0;
  private flashTimer = 0;
  private phase: 'reveal' | 'hold' = 'reveal';
  private readonly REVEAL_DUR = 1.5;

  onEnter(_ctx: Game): void {
    this.timer = 0;
    this.flashTimer = 0;
    this.phase = 'reveal';
  }

  onExit(_ctx: Game): void {}

  update(dt: number, ctx: Game): void {
    this.timer += dt;
    this.flashTimer += dt;

    if (this.phase === 'reveal' && this.timer >= this.REVEAL_DUR) {
      this.phase = 'hold';
    }

    if (this.phase === 'hold') {
      const input = ctx.input.snapshot();
      if (input.confirm || input.fire) {
        ctx.audio.play('menuConfirm');
        const qualifies = qualifiesForLeaderboard(ctx.session.score);
        if (qualifies && ctx.session.score > 0) {
          ctx.go('highScoreEntry');
        } else {
          ctx.go('leaderboard');
        }
      }
    }
  }

  render(ctx: Game): void {
    const r = ctx.renderer;
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000000');

    const progress = Math.min(1, this.timer / this.REVEAL_DUR);

    // Scanline / glitch effect during reveal
    if (this.phase === 'reveal') {
      for (let i = 0; i < 8; i++) {
        const gy = Math.random() * CANVAS_HEIGHT;
        r.ctx.globalAlpha = Math.random() * 0.1;
        r.fillRect(0, gy, CANVAS_WIDTH, 2, '#ff0000');
      }
      r.ctx.globalAlpha = 1;
    }

    // GAME OVER text with drop-in
    const targetY = CANVAS_HEIGHT / 2 - 80;
    const startY  = -80;
    const textY   = startY + (targetY - startY) * progress;

    const pulse = Math.sin(this.flashTimer * 4) * 0.15 + 0.85;
    r.ctx.globalAlpha = progress * pulse;
    r.textShadow('GAME', CANVAS_WIDTH / 2 - 100, textY, C.WARNING, '#330000', 'center', 52, true);
    r.textShadow('OVER', CANVAS_WIDTH / 2 + 100, textY, C.WARNING, '#330000', 'center', 52, true);
    r.ctx.globalAlpha = 1;

    if (this.phase === 'hold') {
      // Stats panel
      const panelX = CANVAS_WIDTH / 2 - 160;
      const panelY = CANVAS_HEIGHT / 2 - 10;
      r.fillRect(panelX, panelY, 320, 120, 'rgba(10,0,0,0.85)');
      r.strokeRect(panelX, panelY, 320, 120, C.WARNING, 1);

      r.text('FINAL SCORE', CANVAS_WIDTH / 2, panelY + 12, C.DIM, 'center', 11);
      r.text(String(ctx.session.score).padStart(6, '0'), CANVAS_WIDTH / 2, panelY + 28, C.HIGHLIGHT, 'center', 24, true);

      r.text(`WAVE REACHED: ${ctx.session.wave}`, CANVAS_WIDTH / 2, panelY + 66, C.HUD_TEXT, 'center', 12);
      r.text(`HIGH SCORE: ${String(ctx.session.highScore).padStart(6, '0')}`, CANVAS_WIDTH / 2, panelY + 84, C.HUD_SCORE, 'center', 12);

      if (ctx.session.score >= ctx.session.highScore && ctx.session.score > 0) {
        const blinkHi = Math.floor(this.flashTimer * 3) % 2 === 0;
        if (blinkHi) r.text('★ NEW HIGH SCORE! ★', CANVAS_WIDTH / 2, panelY + 100, C.HIGHLIGHT, 'center', 11, true);
      }

      // Continue prompt
      const blink = Math.floor(this.flashTimer * 2) % 2 === 0;
      if (blink) {
        r.text('PRESS ENTER TO CONTINUE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 130, C.HUD_TEXT, 'center', 12);
      }
    }
  }
}
