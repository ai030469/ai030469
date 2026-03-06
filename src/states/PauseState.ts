import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import { Menu } from '../ui/Menu';
import { Dialog } from '../ui/Dialog';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C } from '../config';

export class PauseState implements IGameState {
  name: StateName = 'pause';
  private menu = new Menu();
  private dialog = new Dialog();
  private flashTimer = 0;

  onEnter(ctx: Game): void {
    this.flashTimer = 0;
    this.dialog = new Dialog();
    this.buildMenu(ctx);
  }

  onExit(_ctx: Game): void {}

  private buildMenu(ctx: Game): void {
    this.menu.setItems([
      {
        label: 'RESUME',
        action: () => {
          ctx.audio.play('menuConfirm');
          ctx.session.paused = true;
          ctx.go('gameplay');
        },
      },
      {
        label: 'RESTART GAME',
        action: () => {
          this.dialog.show({
            title: 'RESTART GAME',
            body: 'Restart the game? All current progress will be lost.',
            confirmLabel: 'RESTART',
            cancelLabel: 'CANCEL',
            onConfirm: () => {
              ctx.audio.play('menuConfirm');
              ctx.session = { score: 0, highScore: ctx.session.highScore, lives: 3, wave: 1, active: true, paused: false };
              ctx.go('gameplay');
            },
            onCancel: () => {},
          });
        },
      },
      {
        label: 'SETTINGS',
        action: () => {
          ctx.audio.play('menuConfirm');
          ctx.settingsReturnState = 'pause';
          ctx.go('settings');
        },
      },
      {
        label: 'MAIN MENU',
        action: () => {
          this.dialog.show({
            title: 'RETURN TO MAIN MENU',
            body: 'Return to the main menu? Current game progress will be lost.',
            confirmLabel: 'MAIN MENU',
            cancelLabel: 'CANCEL',
            onConfirm: () => {
              ctx.audio.play('menuBack');
              ctx.session.active = false;
              ctx.go('menu');
            },
            onCancel: () => {},
          });
        },
      },
    ]);
  }

  update(dt: number, ctx: Game): void {
    this.flashTimer += dt;
    this.menu.update(dt);
    this.dialog.update(dt);

    if (this.dialog.isVisible) {
      const input = ctx.input.snapshot();
      if (input.left || input.right) this.dialog.toggleSelection();
      if (input.confirm) this.dialog.activate();
      if (input.back)    this.dialog.cancel();
      return;
    }

    const input = ctx.input.snapshot();
    if (input.back || input.pause) {
      ctx.audio.play('menuBack');
      ctx.session.paused = true;
      ctx.go('gameplay');
      return;
    }
    if (input.up)    { ctx.audio.play('menuMove'); this.menu.moveUp(); }
    if (input.down)  { ctx.audio.play('menuMove'); this.menu.moveDown(); }
    if (input.confirm) this.menu.confirm();
  }

  render(ctx: Game): void {
    const r = ctx.renderer;

    // Dim background
    r.ctx.fillStyle = 'rgba(0,0,0,0.78)';
    r.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Panel
    const PW = 320, PH = 280;
    const px = (CANVAS_WIDTH  - PW) / 2;
    const py = (CANVAS_HEIGHT - PH) / 2;

    r.fillRect(px, py, PW, PH, '#030a03');
    r.strokeRect(px, py, PW, PH, C.BORDER, 2);
    r.strokeRect(px + 3, py + 3, PW - 6, PH - 6, '#006600', 1);

    // PAUSED header
    const blink = Math.floor(this.flashTimer * 2) % 2 === 0;
    if (blink) {
      r.textShadow('PAUSED', CANVAS_WIDTH / 2, py + 18, C.HIGHLIGHT, '#000', 'center', 24, true);
    }

    // Menu items
    this.menu.render(r, CANVAS_WIDTH / 2, py + 70, 42, 17, true);

    // Hint
    r.text('↑ ↓ NAVIGATE   ENTER SELECT   ESC RESUME', CANVAS_WIDTH / 2, py + PH - 20, C.DIM, 'center', 9);

    this.dialog.render(r);
  }
}
