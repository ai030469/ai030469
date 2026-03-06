import { SHIELD, CANVAS_WIDTH, C } from '../config';

/**
 * A destructible shield bunker represented as a 2D grid of alive pixels.
 * Shield pixel blocks are SHIELD.PIXEL × SHIELD.PIXEL logical pixels each.
 */
export class ShieldBunker {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  private grid: Uint8Array;   // row-major, 1 = alive, 0 = destroyed
  readonly cols = SHIELD.COLS;
  readonly rows = SHIELD.ROWS;

  constructor(centerX: number) {
    this.w = this.cols * SHIELD.PIXEL;
    this.h = this.rows * SHIELD.PIXEL;
    this.x = Math.round(centerX - this.w / 2);
    this.y = SHIELD.Y;
    this.grid = new Uint8Array(this.cols * this.rows).fill(1);
    this.carveArch();
  }

  /** Carve the classic arch / notch from the bottom center. */
  private carveArch(): void {
    const archW = 5;
    const archH = 4;
    const startCol = Math.floor((this.cols - archW) / 2);
    for (let r = this.rows - archH; r < this.rows; r++) {
      for (let c = startCol; c < startCol + archW; c++) {
        this.grid[r * this.cols + c] = 0;
      }
    }
    // Round the top corners slightly
    for (let c = 0; c < 2; c++) {
      this.grid[0 * this.cols + c] = 0;
      this.grid[0 * this.cols + (this.cols - 1 - c)] = 0;
    }
  }

  /** Check if bullet rect overlaps any alive pixel; destroy hit pixels. */
  checkBulletHit(bx: number, by: number, bw: number, bh: number): boolean {
    const px = SHIELD.PIXEL;
    let hit = false;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r * this.cols + c]) continue;
        const pixX = this.x + c * px;
        const pixY = this.y + r * px;
        if (bx < pixX + px && bx + bw > pixX && by < pixY + px && by + bh > pixY) {
          // Destroy this pixel and some neighbors
          this.destroyRegion(r, c);
          hit = true;
        }
      }
    }
    return hit;
  }

  private destroyRegion(row: number, col: number): void {
    const radius = 1;
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          if (Math.random() > 0.35) {
            this.grid[r * this.cols + c] = 0;
          }
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const px = SHIELD.PIXEL;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r * this.cols + c]) continue;
        // Vary brightness slightly for top edge highlight
        ctx.fillStyle = r < 2 ? '#66ff66' : SHIELD.COLOR;
        ctx.fillRect(this.x + c * px, this.y + r * px, px, px);
      }
    }
  }

  reset(): void {
    this.grid.fill(1);
    this.carveArch();
  }

  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
}

/** Build the standard set of evenly-spaced shields. */
export function buildShields(): ShieldBunker[] {
  const count = SHIELD.COUNT;
  const shieldW = SHIELD.COLS * SHIELD.PIXEL;
  const totalSpan = CANVAS_WIDTH - 80;
  const spacing = totalSpan / count;
  const startX = 40 + spacing / 2;

  return Array.from({ length: count }, (_, i) =>
    new ShieldBunker(startX + i * spacing)
  );
}
