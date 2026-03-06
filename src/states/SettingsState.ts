import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C } from '../config';

type SettingsCategory = 'audio' | 'video' | 'controls' | 'gameplay';

interface SettingRow {
  label: string;
  type: 'toggle' | 'slider' | 'choice' | 'header' | 'binding';
  key?: string;
  choices?: string[];
  min?: number; max?: number; step?: number;
}

const ROWS_BY_CATEGORY: Record<SettingsCategory, SettingRow[]> = {
  audio: [
    { label: 'AUDIO SETTINGS',  type: 'header' },
    { label: 'MASTER VOLUME',   type: 'slider', key: 'masterVolume', min: 0, max: 1, step: 0.1 },
    { label: 'SOUND EFFECTS',   type: 'slider', key: 'sfxVolume',    min: 0, max: 1, step: 0.1 },
    { label: 'MUSIC VOLUME',    type: 'slider', key: 'musicVolume',  min: 0, max: 1, step: 0.1 },
    { label: 'SFX ENABLED',     type: 'toggle', key: 'sfxEnabled' },
    { label: 'MUSIC ENABLED',   type: 'toggle', key: 'musicEnabled' },
  ],
  video: [
    { label: 'VIDEO SETTINGS',  type: 'header' },
    { label: 'CRT EFFECT',      type: 'toggle', key: 'crtEffect' },
    { label: 'SCANLINES',       type: 'toggle', key: 'scanlines' },
    { label: 'SCREEN SHAKE',    type: 'toggle', key: 'screenShake' },
  ],
  controls: [
    { label: 'CONTROLS',        type: 'header' },
    { label: 'MOVE LEFT',       type: 'binding', key: 'keyLeft' },
    { label: 'MOVE RIGHT',      type: 'binding', key: 'keyRight' },
    { label: 'FIRE',            type: 'binding', key: 'keyFire' },
    { label: 'PAUSE',           type: 'binding', key: 'keyPause' },
  ],
  gameplay: [
    { label: 'GAMEPLAY',        type: 'header' },
    { label: 'DIFFICULTY',      type: 'choice', key: 'difficulty', choices: ['easy', 'normal', 'hard'] },
  ],
};

const CATS: SettingsCategory[] = ['audio', 'video', 'controls', 'gameplay'];

export class SettingsState implements IGameState {
  name: StateName = 'settings';
  private catIndex = 0;
  private rowIndex = 0;
  private flashTimer = 0;
  private waitingForKey = false;
  private waitKeyFor: string | null = null;

  onEnter(_ctx: Game): void {
    this.catIndex  = 0;
    this.rowIndex  = 1; // skip header
    this.flashTimer = 0;
    this.waitingForKey = false;
  }

  onExit(_ctx: Game): void {}

  private get category(): SettingsCategory { return CATS[this.catIndex]; }
  private get rows(): SettingRow[] { return ROWS_BY_CATEGORY[this.category]; }
  private get currentRow(): SettingRow { return this.rows[this.rowIndex]; }

  private moveRowUp(): void {
    do {
      this.rowIndex = (this.rowIndex - 1 + this.rows.length) % this.rows.length;
    } while (this.currentRow.type === 'header' && this.rowIndex !== 0);
    if (this.currentRow.type === 'header') this.rowIndex = 1;
  }

  private moveRowDown(): void {
    do {
      this.rowIndex = (this.rowIndex + 1) % this.rows.length;
    } while (this.currentRow.type === 'header');
  }

  update(dt: number, ctx: Game): void {
    this.flashTimer += dt;
    const input = ctx.input.snapshot();

    // Waiting for key rebind
    if (this.waitingForKey) {
      // Listen for any key press via justDown — handled below
      return;
    }

    if (input.back) {
      ctx.audio.play('menuBack');
      ctx.saveCurrentSettings();
      ctx.go(ctx.settingsReturnState);
      return;
    }

    if (input.left) {
      ctx.audio.play('menuMove');
      this.catIndex = (this.catIndex - 1 + CATS.length) % CATS.length;
      this.rowIndex = 1;
    } else if (input.right) {
      ctx.audio.play('menuMove');
      this.catIndex = (this.catIndex + 1) % CATS.length;
      this.rowIndex = 1;
    } else if (input.up) {
      ctx.audio.play('menuMove');
      this.moveRowUp();
    } else if (input.down) {
      ctx.audio.play('menuMove');
      this.moveRowDown();
    } else if (input.confirm || input.left || input.right) {
      this.handleAction(ctx, input.left ? -1 : 1);
    }
  }

  private handleAction(ctx: Game, dir: number): void {
    const row = this.currentRow;
    if (!row.key) return;
    const s = ctx.settings as unknown as Record<string, unknown>;
    const key = row.key;

    if (row.type === 'toggle') {
      s[key] = !s[key];
      ctx.audio.play('menuConfirm');
    } else if (row.type === 'slider') {
      const cur = s[key] as number;
      const step = row.step ?? 0.1;
      s[key] = Math.max(row.min ?? 0, Math.min(row.max ?? 1, Math.round((cur + dir * step) * 10) / 10));
      ctx.audio.play('menuMove');
    } else if (row.type === 'choice' && row.choices) {
      const idx = row.choices.indexOf(s[key] as string);
      s[key] = row.choices[(idx + dir + row.choices.length) % row.choices.length];
      ctx.audio.play('menuMove');
    } else if (row.type === 'binding') {
      this.waitingForKey = true;
      this.waitKeyFor = key;
    }
    ctx.applySettings();
  }

  render(ctx: Game): void {
    const r = ctx.renderer;
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000008');
    r.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, C.BORDER, 1);

    // Header
    r.fillRect(0, 0, CANVAS_WIDTH, 44, 'rgba(0,20,0,0.8)');
    r.textShadow('SETTINGS', CANVAS_WIDTH / 2, 12, C.HUD_SCORE, '#003300', 'center', 20, true);

    // Category tabs
    const tabW = CANVAS_WIDTH / CATS.length;
    for (let i = 0; i < CATS.length; i++) {
      const tx = i * tabW;
      const isActive = i === this.catIndex;
      r.fillRect(tx, 44, tabW, 28, isActive ? 'rgba(68,255,68,0.15)' : 'rgba(0,0,0,0)');
      r.strokeRect(tx, 44, tabW, 28, isActive ? C.BORDER : C.DIM, 1);
      r.text(CATS[i].toUpperCase(), tx + tabW / 2, 51, isActive ? C.HIGHLIGHT : C.DIM, 'center', 11, isActive);
    }

    // Settings rows
    const startY = 88;
    const rows = this.rows;
    const s = ctx.settings as unknown as Record<string, unknown>;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const y = startY + i * 36;
      const isSelected = i === this.rowIndex;

      if (row.type === 'header') {
        r.drawLine(40, y + 16, CANVAS_WIDTH - 40, y + 16, C.BORDER, 1);
        r.text(row.label, CANVAS_WIDTH / 2, y + 4, C.BORDER, 'center', 11, true);
        continue;
      }

      if (isSelected) {
        r.fillRect(36, y - 2, CANVAS_WIDTH - 72, 32, 'rgba(68,255,68,0.08)');
        r.strokeRect(36, y - 2, CANVAS_WIDTH - 72, 32, C.BORDER, 1);
        const blink = Math.floor(this.flashTimer * 4) % 2 === 0;
        if (blink) r.text('▶', 42, y + 8, C.HIGHLIGHT, 'left', 13);
      }

      r.text(row.label, 60, y + 8, isSelected ? C.HIGHLIGHT : C.HUD_TEXT, 'left', 13, isSelected);

      // Value display
      if (row.key) {
        const val = s[row.key];
        let display = '';
        if (row.type === 'toggle') {
          display = val ? 'ON' : 'OFF';
        } else if (row.type === 'slider') {
          const num = val as number;
          const pct = Math.round(num * 10);
          display = '[' + '█'.repeat(pct) + '░'.repeat(10 - pct) + ']';
        } else if (row.type === 'choice') {
          display = `< ${String(val).toUpperCase()} >`;
        } else if (row.type === 'binding') {
          if (this.waitingForKey && this.waitKeyFor === row.key) {
            display = this.flashTimer % 0.5 < 0.25 ? '[ PRESS KEY... ]' : '';
          } else {
            display = String(val);
            if (display === ' ') display = 'SPACE';
          }
        }
        const dc = row.type === 'toggle'
          ? (val ? C.OK : C.WARNING)
          : isSelected ? C.HIGHLIGHT : C.BORDER;
        r.text(display, CANVAS_WIDTH - 60, y + 8, dc, 'right', 12, isSelected);
      }
    }

    // Rebind overlay
    if (this.waitingForKey) {
      r.ctx.fillStyle = 'rgba(0,0,0,0.85)';
      r.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      r.strokeRect(200, 230, 400, 80, C.WARNING, 2);
      r.fillRect(200, 230, 400, 80, '#050505');
      r.text('PRESS A KEY TO BIND', CANVAS_WIDTH / 2, 248, C.HIGHLIGHT, 'center', 14, true);
      r.text('ESC TO CANCEL', CANVAS_WIDTH / 2, 276, C.DIM, 'center', 10);
    }

    // Back hint
    r.text('← → CHANGE CATEGORY   ↑ ↓ NAVIGATE   ESC BACK', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 14, C.DIM, 'center', 9);
  }
}
