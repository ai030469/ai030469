import { Renderer } from '../core/Renderer';
import { CANVAS_WIDTH, HUD_HEIGHT, PLAYER, C, GROUND_Y } from '../config';
import { PLAYER_SPRITE } from '../entities/Sprites';

const LIFE_SCALE = 2;
const LIFE_W = 12 * LIFE_SCALE;
const LIFE_H = 8  * LIFE_SCALE;
const LIFE_GAP = 6;

export class HUD {
  private score = 0;
  private highScore = 0;
  private lives: number = PLAYER.START_LIVES;
  private wave = 1;
  private flashTimer = 0;
  private statusMsg = '';
  private statusTimer = 0;
  private readonly STATUS_DURATION = 2.0;

  update(score: number, highScore: number, lives: number, wave: number, dt: number): void {
    this.score = score;
    this.highScore = highScore;
    this.lives = lives;
    this.wave = wave;
    this.flashTimer += dt;
    if (this.statusTimer > 0) this.statusTimer -= dt;
  }

  setStatus(msg: string, duration?: number): void {
    this.statusMsg = msg;
    this.statusTimer = duration ?? this.STATUS_DURATION;
  }

  render(r: Renderer): void {
    const ctx = r.ctx;

    // ── Top bar background ─────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);

    // Dividing line
    r.drawLine(0, HUD_HEIGHT - 1, CANVAS_WIDTH, HUD_HEIGHT - 1, C.BORDER, 1);

    // ── Score ──────────────────────────────────────────────────────────────
    r.text('SCORE', 14, 6, C.DIM, 'left', 11);
    r.text(String(this.score).padStart(6, '0'), 14, 20, C.HUD_SCORE, 'left', 18, true);

    // ── High Score ─────────────────────────────────────────────────────────
    const hiLabel = 'HI-SCORE';
    r.text(hiLabel, CANVAS_WIDTH / 2, 6, C.DIM, 'center', 11);
    r.text(String(this.highScore).padStart(6, '0'), CANVAS_WIDTH / 2, 20, C.HIGHLIGHT, 'center', 18, true);

    // ── Wave ───────────────────────────────────────────────────────────────
    r.text('WAVE', CANVAS_WIDTH - 90, 6, C.DIM, 'left', 11);
    r.text(`${this.wave}`.padStart(2, ' '), CANVAS_WIDTH - 90, 20, C.INFO ?? '#44ccff', 'left', 18, true);

    // ── Lives ──────────────────────────────────────────────────────────────
    const livesX = CANVAS_WIDTH - 220;
    r.text('LIVES', livesX, 6, C.DIM, 'left', 11);
    for (let i = 0; i < Math.min(this.lives, 5); i++) {
      const lx = livesX + i * (LIFE_W + LIFE_GAP);
      const ly = 20;
      r.drawSprite(PLAYER_SPRITE, lx, ly, C.PLAYER, LIFE_SCALE);
    }
    if (this.lives > 5) {
      r.text(`+${this.lives - 5}`, livesX + 5 * (LIFE_W + LIFE_GAP) + 2, 22, C.PLAYER, 'left', 10);
    }

    // ── Ground line ────────────────────────────────────────────────────────
    r.drawLine(0, GROUND_Y, CANVAS_WIDTH, GROUND_Y, C.GROUND, 2);

    // ── Status message ─────────────────────────────────────────────────────
    if (this.statusTimer > 0 && this.statusMsg) {
      const alpha = Math.min(1, this.statusTimer * 3);
      r.setAlpha(alpha);
      const blink = Math.floor(this.flashTimer * 4) % 2 === 0;
      if (blink || this.statusTimer > 0.5) {
        r.text(this.statusMsg, CANVAS_WIDTH / 2, GROUND_Y - 26, C.HIGHLIGHT, 'center', 16, true);
      }
      r.resetAlpha();
    }

    // ── Pause hint ─────────────────────────────────────────────────────────
    r.text('ESC=PAUSE', CANVAS_WIDTH - 10, HUD_HEIGHT - 14, C.DIM, 'right', 9);
  }
}
