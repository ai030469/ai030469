import { Renderer } from '../core/Renderer';
import { CANVAS_WIDTH, C } from '../config';
import type { MenuItem } from '../types';

/**
 * Reusable retro-style menu component with keyboard navigation,
 * focused selection indicator, and optional panel background.
 */
export class Menu {
  private items: MenuItem[] = [];
  private selectedIndex = 0;
  private flashTimer = 0;

  setItems(items: MenuItem[]): void {
    this.items = items;
    this.selectedIndex = 0;
    // Auto-skip disabled items
    while (
      this.selectedIndex < this.items.length &&
      this.items[this.selectedIndex].disabled
    ) this.selectedIndex++;
  }

  moveUp(): void {
    let prev = (this.selectedIndex - 1 + this.items.length) % this.items.length;
    while (this.items[prev].disabled && prev !== this.selectedIndex) {
      prev = (prev - 1 + this.items.length) % this.items.length;
    }
    if (!this.items[prev].disabled) this.selectedIndex = prev;
  }

  moveDown(): void {
    let next = (this.selectedIndex + 1) % this.items.length;
    while (this.items[next].disabled && next !== this.selectedIndex) {
      next = (next + 1) % this.items.length;
    }
    if (!this.items[next].disabled) this.selectedIndex = next;
  }

  confirm(): boolean {
    const item = this.items[this.selectedIndex];
    if (item && !item.disabled) {
      item.action();
      return true;
    }
    return false;
  }

  get selectedItem(): MenuItem | null {
    return this.items[this.selectedIndex] ?? null;
  }

  update(dt: number): void {
    this.flashTimer += dt;
  }

  render(
    r: Renderer,
    centerX: number,
    startY: number,
    itemHeight = 36,
    fontSize = 18,
    showCursor = true,
  ): void {
    const items = this.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const y = startY + i * itemHeight;
      const isSelected = i === this.selectedIndex;
      const isDisabled = !!item.disabled;

      let color: string;
      if (isDisabled) {
        color = C.DIM;
      } else if (isSelected) {
        color = C.HIGHLIGHT;
      } else {
        color = C.HUD_TEXT;
      }

      // Draw selection indicator
      if (isSelected && showCursor && !isDisabled) {
        const blink = Math.floor(this.flashTimer * 4) % 2 === 0;
        if (blink) {
          const tw = r.textWidth(item.label, fontSize, true);
          r.text('>', centerX - tw / 2 - 22, y, C.HIGHLIGHT, 'left', fontSize, true);
          r.text('<', centerX + tw / 2 + 8,  y, C.HIGHLIGHT, 'left', fontSize, true);
        }
      }

      r.text(item.label, centerX, y, color, 'center', fontSize, isSelected && !isDisabled);
    }
  }

  /** Draw a full-width selector panel style menu. */
  renderPanel(
    r: Renderer,
    panelX: number,
    panelY: number,
    panelW: number,
    itemHeight = 38,
    fontSize = 16,
  ): void {
    const items = this.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const y    = panelY + i * itemHeight;
      const isSelected = i === this.selectedIndex;
      const isDisabled = !!item.disabled;

      if (isSelected && !isDisabled) {
        r.fillRect(panelX, y - 2, panelW, itemHeight - 2, 'rgba(68,255,68,0.12)');
        r.strokeRect(panelX, y - 2, panelW, itemHeight - 2, C.BORDER, 1);
      }

      const color = isDisabled ? C.DIM : isSelected ? C.HIGHLIGHT : C.HUD_TEXT;
      r.text(item.label, panelX + 18, y + 8, color, 'left', fontSize, isSelected && !isDisabled);

      if (isSelected && !isDisabled) {
        const blink = Math.floor(this.flashTimer * 4) % 2 === 0;
        if (blink) r.text('▶', panelX + 4, y + 8, C.HIGHLIGHT, 'left', fontSize);
      }
    }
  }
}
