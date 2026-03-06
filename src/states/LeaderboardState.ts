import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import type { HighScoreEntry } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C } from '../config';
import { loadHighScores } from '../persistence/Storage';

export class LeaderboardState implements IGameState {
  name: StateName = 'leaderboard';
  private scores: HighScoreEntry[] = [];
  private flashTimer = 0;
  private highlightIdx = -1;

  onEnter(ctx: Game): void {
    this.scores      = loadHighScores();
    this.flashTimer  = 0;
    // Find the index matching the just-submitted score
    this.highlightIdx = this.scores.findIndex(s => s.score === ctx.session.score && ctx.session.score > 0);
    if (this.highlightIdx < 0 || !ctx.session.active) this.highlightIdx = -1;
  }

  onExit(_ctx: Game): void {}

  update(dt: number, ctx: Game): void {
    this.flashTimer += dt;
    const input = ctx.input.snapshot();
    if (input.confirm || input.back) {
      ctx.audio.play('menuBack');
      ctx.session.active = false;
      ctx.go('menu');
    }
  }

  render(ctx: Game): void {
    const r = ctx.renderer;
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000008');
    r.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, C.BORDER, 1);

    // Header
    r.fillRect(0, 0, CANVAS_WIDTH, 44, 'rgba(0,20,0,0.8)');
    r.textShadow('HIGH SCORES', CANVAS_WIDTH / 2, 10, C.HUD_SCORE, '#003300', 'center', 22, true);

    if (this.scores.length === 0) {
      r.text('NO SCORES YET — BE THE FIRST!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, C.DIM, 'center', 14);
    } else {
      // Column headers
      const colRank  = 60;
      const colInit  = 120;
      const colScore = 320;
      const colWave  = 460;
      const colDate  = 600;
      const headerY  = 52;

      r.fillRect(0, headerY, CANVAS_WIDTH, 20, 'rgba(68,255,68,0.06)');
      r.text('RANK',     colRank,  headerY + 4, C.DIM, 'center', 9, true);
      r.text('NAME',     colInit,  headerY + 4, C.DIM, 'center', 9, true);
      r.text('SCORE',    colScore, headerY + 4, C.DIM, 'center', 9, true);
      r.text('WAVE',     colWave,  headerY + 4, C.DIM, 'center', 9, true);
      r.text('DATE',     colDate,  headerY + 4, C.DIM, 'center', 9, true);

      r.drawLine(40, headerY + 20, CANVAS_WIDTH - 40, headerY + 20, C.BORDER, 1);

      // Rows
      for (let i = 0; i < this.scores.length; i++) {
        const entry = this.scores[i];
        const rowY = headerY + 28 + i * 34;
        const isHighlight = i === this.highlightIdx;
        const blink = Math.floor(this.flashTimer * 4) % 2 === 0;

        if (isHighlight) {
          r.fillRect(40, rowY - 2, CANVAS_WIDTH - 80, 30, 'rgba(68,255,68,0.18)');
          r.strokeRect(40, rowY - 2, CANVAS_WIDTH - 80, 30, C.BORDER, 1);
        } else if (i % 2 === 0) {
          r.fillRect(40, rowY - 2, CANVAS_WIDTH - 80, 30, 'rgba(255,255,255,0.02)');
        }

        // Rank colors
        const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
        const rankColor = i < 3 ? rankColors[i] : C.DIM;
        const rankLabel = i < 3 ? ['1ST', '2ND', '3RD'][i] : `${i + 1}TH`;

        const rowColor = isHighlight ? (blink ? C.HIGHLIGHT : C.HUD_SCORE) : (i < 3 ? rankColor : C.HUD_TEXT);

        r.text(rankLabel,                              colRank,  rowY + 8, rankColor,  'center', 11, i < 3);
        r.text(entry.initials.toUpperCase().padEnd(3), colInit,  rowY + 8, rowColor,   'center', 14, true);
        r.text(String(entry.score).padStart(6, '0'),   colScore, rowY + 8, rowColor,   'center', 14, i < 3);
        r.text(`${entry.wave}`,                        colWave,  rowY + 8, C.HUD_TEXT, 'center', 11);
        r.text(entry.date,                             colDate,  rowY + 8, C.DIM,      'center', 9);
      }
    }

    // Back hint
    const blink = Math.floor(this.flashTimer * 2) % 2 === 0;
    r.text(
      blink ? '[ PRESS ENTER OR ESC TO RETURN ]' : '',
      CANVAS_WIDTH / 2, CANVAS_HEIGHT - 22, C.DIM, 'center', 10,
    );
  }
}
