import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C } from '../config';
import { SQUID, CRAB, OCTOPUS, UFO_SPRITE } from '../entities/Sprites';

export class CreditsState implements IGameState {
  name: StateName = 'credits';
  private flashTimer = 0;
  private scrollY = 0;
  private readonly SCROLL_SPEED = 28;

  onEnter(_ctx: Game): void {
    this.flashTimer = 0;
    this.scrollY = CANVAS_HEIGHT;
  }
  onExit(_ctx: Game): void {}

  update(dt: number, ctx: Game): void {
    this.flashTimer += dt;
    this.scrollY -= this.SCROLL_SPEED * dt;
    const input = ctx.input.snapshot();
    if (input.back || input.confirm) {
      ctx.audio.play('menuBack');
      ctx.go('menu');
    }
  }

  render(ctx: Game): void {
    const r = ctx.renderer;
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000000');

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 197) % 1000) / 1000 * CANVAS_WIDTH;
      const sy = ((i * 313) % 1000) / 1000 * CANVAS_HEIGHT;
      const tw = Math.sin(this.flashTimer * 2 + i) * 0.5 + 0.5;
      r.ctx.globalAlpha = tw * 0.35;
      r.fillRect(Math.floor(sx), Math.floor(sy), 1, 1, '#ffffff');
    }
    r.ctx.globalAlpha = 1;

    // Scrolling credits
    const lines: Array<{ text: string; color: string; size: number; bold: boolean; gap?: number }> = [
      { text: 'SPACE RAIDERS', color: C.HUD_SCORE, size: 28, bold: true },
      { text: 'AN ARCADE CLASSIC', color: C.BORDER, size: 12, bold: false, gap: 20 },
      { text: '─────────────────────────────', color: C.DIM, size: 10, bold: false, gap: 30 },
      { text: 'GAME DESIGN & PROGRAMMING', color: C.DIM, size: 10, bold: false },
      { text: 'THE ARCADE TEAM', color: C.HIGHLIGHT, size: 16, bold: true, gap: 20 },
      { text: 'INSPIRED BY', color: C.DIM, size: 10, bold: false },
      { text: 'SPACE INVADERS (1978)', color: C.HUD_TEXT, size: 13, bold: false },
      { text: 'BY TOMOHIRO NISHIKADO', color: C.DIM, size: 10, bold: false, gap: 20 },
      { text: '─────────────────────────────', color: C.DIM, size: 10, bold: false, gap: 10 },
      { text: 'TECHNOLOGY', color: C.DIM, size: 10, bold: false, gap: 6 },
      { text: 'HTML5 CANVAS', color: C.BORDER, size: 13, bold: false },
      { text: 'TYPESCRIPT', color: C.BORDER, size: 13, bold: false },
      { text: 'WEB AUDIO API', color: C.BORDER, size: 13, bold: false, gap: 20 },
      { text: '─────────────────────────────', color: C.DIM, size: 10, bold: false, gap: 10 },
      { text: 'DEDICATED TO', color: C.DIM, size: 10, bold: false, gap: 6 },
      { text: 'ALL THE QUARTER-MUNCHERS', color: C.HIGHLIGHT, size: 14, bold: true },
      { text: 'WHO PLAYED THROUGH THE NIGHT', color: C.HUD_TEXT, size: 12, bold: false, gap: 28 },
      { text: '★  THANK YOU FOR PLAYING  ★', color: C.HIGHLIGHT, size: 16, bold: true, gap: 20 },
      { text: 'PRESS ESC OR ENTER TO RETURN', color: C.DIM, size: 10, bold: false },
    ];

    // Render scrolling text (clipped to screen)
    r.ctx.save();
    r.ctx.beginPath();
    r.ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    r.ctx.clip();

    let y = this.scrollY;
    for (const line of lines) {
      if (y > -30 && y < CANVAS_HEIGHT + 30) {
        r.text(line.text, CANVAS_WIDTH / 2, y, line.color, 'center', line.size, line.bold);
      }
      y += line.size * 1.4 + (line.gap ?? 8);
    }

    // Reset scroll when done
    if (y + this.scrollY < -100) this.scrollY = CANVAS_HEIGHT;

    // Enemy showcase at bottom (static)
    r.ctx.restore();

    // Header overlay
    r.fillRect(0, 0, CANVAS_WIDTH, 44, 'rgba(0,0,0,0.9)');
    r.strokeRect(0, 0, CANVAS_WIDTH, 44, C.BORDER, 1);
    r.textShadow('CREDITS', CANVAS_WIDTH / 2, 10, C.HUD_SCORE, '#003300', 'center', 20, true);

    // Footer
    r.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30, 'rgba(0,0,0,0.9)');
    const blink = Math.floor(this.flashTimer * 2) % 2 === 0;
    r.text(blink ? '[ PRESS ESC TO RETURN ]' : '', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 18, C.DIM, 'center', 9);
  }
}
