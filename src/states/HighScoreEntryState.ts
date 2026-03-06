import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C, INITIALS_LENGTH } from '../config';
import { saveHighScore } from '../persistence/Storage';

const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';

export class HighScoreEntryState implements IGameState {
  name: StateName = 'highScoreEntry';
  private initials = ['A', 'A', 'A'];
  private cursorPos = 0;
  private flashTimer = 0;
  private charIndices = [0, 0, 0];
  private done = false;

  onEnter(_ctx: Game): void {
    this.initials    = ['A', 'A', 'A'];
    this.charIndices = [0, 0, 0];
    this.cursorPos   = 0;
    this.flashTimer  = 0;
    this.done        = false;
  }

  onExit(_ctx: Game): void {}

  private cycleChar(pos: number, dir: number): void {
    const idx = (this.charIndices[pos] + dir + CHAR_SET.length) % CHAR_SET.length;
    this.charIndices[pos] = idx;
    this.initials[pos] = CHAR_SET[idx];
  }

  update(dt: number, ctx: Game): void {
    this.flashTimer += dt;
    if (this.done) return;

    const input = ctx.input.snapshot();

    if (input.up)   { ctx.audio.play('menuMove'); this.cycleChar(this.cursorPos, -1); }
    if (input.down) { ctx.audio.play('menuMove'); this.cycleChar(this.cursorPos,  1); }

    if (input.right || input.confirm) {
      ctx.audio.play('menuMove');
      if (this.cursorPos < INITIALS_LENGTH - 1) {
        this.cursorPos++;
      } else {
        this.submitScore(ctx);
      }
    }

    if (input.left) {
      ctx.audio.play('menuBack');
      if (this.cursorPos > 0) this.cursorPos--;
    }

    // Direct character input
    const ch = ctx.input.nextChar();
    if (ch) {
      const idx = CHAR_SET.indexOf(ch);
      if (idx !== -1) {
        this.charIndices[this.cursorPos] = idx;
        this.initials[this.cursorPos] = ch;
        if (this.cursorPos < INITIALS_LENGTH - 1) this.cursorPos++;
      }
    }

    // Backspace
    if (ctx.input.wasBackspace()) {
      if (this.cursorPos > 0) this.cursorPos--;
      ctx.audio.play('menuBack');
    }
  }

  private submitScore(ctx: Game): void {
    this.done = true;
    ctx.audio.play('menuConfirm');
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    saveHighScore({
      initials: this.initials.join('').trim() || 'AAA',
      score: ctx.session.score,
      wave: ctx.session.wave,
      date,
    });
    // Short delay then to leaderboard
    setTimeout(() => ctx.go('leaderboard'), 600);
  }

  render(ctx: Game): void {
    const r = ctx.renderer;
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000008');
    r.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, C.BORDER, 1);

    // Header
    r.fillRect(0, 0, CANVAS_WIDTH, 44, 'rgba(0,20,0,0.8)');
    r.textShadow('HIGH SCORE!', CANVAS_WIDTH / 2, 10, C.HIGHLIGHT, '#003300', 'center', 22, true);

    // Score display
    const centerX = CANVAS_WIDTH / 2;
    r.text('YOUR SCORE', centerX, 70, C.DIM, 'center', 11);
    r.text(String(ctx.session.score).padStart(6, '0'), centerX, 88, C.HIGHLIGHT, 'center', 28, true);
    r.text(`WAVE ${ctx.session.wave} REACHED`, centerX, 124, C.HUD_TEXT, 'center', 12);

    // Entry prompt
    r.text('ENTER YOUR INITIALS', centerX, 168, C.HUD_SCORE, 'center', 14, true);

    // Character display boxes
    const boxW = 56, boxH = 64;
    const totalW = INITIALS_LENGTH * boxW + (INITIALS_LENGTH - 1) * 16;
    const startX = centerX - totalW / 2;

    for (let i = 0; i < INITIALS_LENGTH; i++) {
      const bx = startX + i * (boxW + 16);
      const by = 196;
      const isActive = i === this.cursorPos && !this.done;
      const blink = Math.floor(this.flashTimer * 4) % 2 === 0;

      r.fillRect(bx, by, boxW, boxH, isActive ? 'rgba(68,255,68,0.12)' : 'rgba(30,30,30,0.8)');
      r.strokeRect(bx, by, boxW, boxH, isActive ? (blink ? C.HIGHLIGHT : C.BORDER) : C.DIM, isActive ? 2 : 1);
      r.text(this.initials[i], bx + boxW / 2, by + 14, isActive ? C.HIGHLIGHT : C.HUD_TEXT, 'center', 36, true);

      // Cursor indicator
      if (isActive && blink) {
        r.fillRect(bx + 8, by + boxH - 10, boxW - 16, 4, C.HIGHLIGHT);
      }
    }

    // Arrow hints
    r.text('↑ ↓  CHANGE LETTER', centerX, 280, C.DIM, 'center', 10);
    r.text('← →  MOVE CURSOR', centerX, 296, C.DIM, 'center', 10);
    r.text('ENTER  CONFIRM', centerX, 312, C.DIM, 'center', 10);

    // Submit hint
    if (!this.done) {
      const blink = Math.floor(this.flashTimer * 2) % 2 === 0;
      if (this.cursorPos === INITIALS_LENGTH - 1 && blink) {
        r.text('PRESS ENTER TO SUBMIT', centerX, 348, C.HIGHLIGHT, 'center', 11, true);
      }
    } else {
      r.text('SCORE SAVED!', centerX, 348, C.OK, 'center', 14, true);
    }

    // High score list preview
    r.drawLine(40, 375, CANVAS_WIDTH - 40, 375, C.BORDER, 1);
    r.text('TYPE YOUR INITIALS USING ↑ ↓ KEYS OR KEYBOARD', centerX, 380, C.DIM, 'center', 9);
  }
}
