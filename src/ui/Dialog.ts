import { Renderer } from '../core/Renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C } from '../config';
import type { DialogOptions } from '../types';

/**
 * Modal confirmation dialog with confirm/cancel actions.
 * Rendered over any game state as an overlay.
 */
export class Dialog {
  private visible = false;
  private opts: DialogOptions | null = null;
  private selectedBtn = 0; // 0 = confirm, 1 = cancel
  private flashTimer = 0;

  show(opts: DialogOptions): void {
    this.opts = opts;
    this.visible = true;
    this.selectedBtn = 1; // default to Cancel (safer)
    this.flashTimer = 0;
  }

  hide(): void {
    this.visible = false;
    this.opts = null;
  }

  get isVisible(): boolean { return this.visible; }

  selectConfirm(): void { this.selectedBtn = 0; }
  selectCancel():  void { this.selectedBtn = 1; }

  toggleSelection(): void {
    this.selectedBtn = 1 - this.selectedBtn;
  }

  confirm(): void {
    if (!this.opts) return;
    this.hide();
    this.opts.onConfirm();
  }

  cancel(): void {
    if (!this.opts) return;
    this.hide();
    this.opts.onCancel();
  }

  activate(): void {
    if (this.selectedBtn === 0) this.confirm();
    else this.cancel();
  }

  update(dt: number): void {
    this.flashTimer += dt;
  }

  render(r: Renderer): void {
    if (!this.visible || !this.opts) return;

    const BOX_W = 400;
    const BOX_H = 180;
    const bx = (CANVAS_WIDTH  - BOX_W) / 2;
    const by = (CANVAS_HEIGHT - BOX_H) / 2;

    // Dimmed overlay
    r.ctx.fillStyle = 'rgba(0,0,0,0.75)';
    r.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Panel
    r.fillRect(bx, by, BOX_W, BOX_H, '#0a0a0a');
    r.strokeRect(bx, by, BOX_W, BOX_H, C.WARNING, 2);
    r.strokeRect(bx + 3, by + 3, BOX_W - 6, BOX_H - 6, '#550000', 1);

    // Title
    r.text(this.opts.title, CANVAS_WIDTH / 2, by + 20, C.WARNING, 'center', 16, true);

    // Body
    const bodyLines = this.wrapText(this.opts.body, 40);
    bodyLines.forEach((line, i) => {
      r.text(line, CANVAS_WIDTH / 2, by + 52 + i * 20, C.HUD_TEXT, 'center', 13);
    });

    // Buttons
    const btnY = by + BOX_H - 44;
    const confirmLabel = this.opts.confirmLabel ?? 'CONFIRM';
    const cancelLabel  = this.opts.cancelLabel  ?? 'CANCEL';
    const BTN_W = 130;
    const BTN_H = 30;
    const gap = 20;
    const confirmX = CANVAS_WIDTH / 2 - BTN_W - gap / 2;
    const cancelX  = CANVAS_WIDTH / 2 + gap / 2;

    // Confirm button
    const confirmSel = this.selectedBtn === 0;
    r.fillRect(confirmX, btnY, BTN_W, BTN_H, confirmSel ? 'rgba(255,68,68,0.3)' : 'rgba(40,40,40,0.8)');
    r.strokeRect(confirmX, btnY, BTN_W, BTN_H, confirmSel ? C.WARNING : C.DIM, 1);
    const blink = Math.floor(this.flashTimer * 4) % 2 === 0;
    r.text(confirmLabel, confirmX + BTN_W / 2, btnY + 8, confirmSel && blink ? C.WARNING : C.HUD_TEXT, 'center', 13, confirmSel);

    // Cancel button
    const cancelSel = this.selectedBtn === 1;
    r.fillRect(cancelX, btnY, BTN_W, BTN_H, cancelSel ? 'rgba(68,255,68,0.15)' : 'rgba(40,40,40,0.8)');
    r.strokeRect(cancelX, btnY, BTN_W, BTN_H, cancelSel ? C.OK : C.DIM, 1);
    r.text(cancelLabel, cancelX + BTN_W / 2, btnY + 8, cancelSel && blink ? C.OK : C.HUD_TEXT, 'center', 13, cancelSel);

    // Hint
    r.text('← → SELECT   ENTER CONFIRM   ESC CANCEL', CANVAS_WIDTH / 2, by + BOX_H - 10, C.DIM, 'center', 9);
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length <= maxChars) {
        current = (current + ' ' + word).trim();
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }
}
