import { CANVAS_WIDTH, CANVAS_HEIGHT, C } from '../config';

/**
 * Wraps the Canvas 2D context and provides helper drawing methods,
 * CRT overlay, screen shake, and DPR-aware scaling.
 */
export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private crtCanvas: HTMLCanvasElement;
  private crtCtx: CanvasRenderingContext2D;

  private dpr = 1;
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;

  // Screen shake
  private shakeX = 0;
  private shakeY = 0;
  private shakeDuration = 0;
  private shakeTimer = 0;
  private shakeMagnitude = 0;
  private shakeEnabled = true;

  // CRT settings
  private crtEnabled = true;
  private scanlinesEnabled = true;

  constructor(canvas: HTMLCanvasElement, crtCanvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2D context');
    this.ctx = ctx;

    this.crtCanvas = crtCanvas;
    const cctx = crtCanvas.getContext('2d');
    if (!cctx) throw new Error('Cannot get CRT 2D context');
    this.crtCtx = cctx;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    const scaleX = winW / CANVAS_WIDTH;
    const scaleY = winH / CANVAS_HEIGHT;
    this.scale = Math.min(scaleX, scaleY);

    const displayW = Math.floor(CANVAS_WIDTH  * this.scale);
    const displayH = Math.floor(CANVAS_HEIGHT * this.scale);

    this.offsetX = Math.floor((winW - displayW) / 2);
    this.offsetY = Math.floor((winH - displayH) / 2);

    // Game canvas
    this.canvas.width  = CANVAS_WIDTH  * this.dpr;
    this.canvas.height = CANVAS_HEIGHT * this.dpr;
    this.canvas.style.width  = `${displayW}px`;
    this.canvas.style.height = `${displayH}px`;
    this.canvas.style.marginLeft = `${this.offsetX}px`;
    this.canvas.style.marginTop  = `${this.offsetY}px`;

    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.imageSmoothingEnabled = false;

    // CRT canvas
    this.crtCanvas.width  = displayW;
    this.crtCanvas.height = displayH;
    this.crtCanvas.style.width  = `${displayW}px`;
    this.crtCanvas.style.height = `${displayH}px`;
    this.crtCtx.imageSmoothingEnabled = false;

    this.buildCrtOverlay();
  }

  private buildCrtOverlay(): void {
    const w = this.crtCanvas.width;
    const h = this.crtCanvas.height;
    const ctx = this.crtCtx;
    ctx.clearRect(0, 0, w, h);

    if (this.scanlinesEnabled) {
      const lineH = Math.max(1, Math.floor(2 * this.scale));
      ctx.fillStyle = C.SCANLINE;
      for (let y = 0; y < h; y += lineH * 2) {
        ctx.fillRect(0, y, w, lineH);
      }
    }

    if (this.crtEnabled) {
      // Vignette
      const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.8);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle green phosphor tint
      ctx.fillStyle = 'rgba(0,20,0,0.04)';
      ctx.fillRect(0, 0, w, h);
    }
  }

  setCrtEnabled(on: boolean): void {
    this.crtEnabled = on;
    this.buildCrtOverlay();
  }

  setScanlinesEnabled(on: boolean): void {
    this.scanlinesEnabled = on;
    this.buildCrtOverlay();
  }

  setShakeEnabled(on: boolean): void {
    this.shakeEnabled = on;
  }

  // ─── Screen Shake ─────────────────────────────────────────────────────────

  shake(magnitude: number, duration = 0.25): void {
    if (!this.shakeEnabled) return;
    if (magnitude > this.shakeMagnitude) {
      this.shakeMagnitude = magnitude;
      this.shakeDuration  = duration;
      this.shakeTimer     = 0;
    }
  }

  updateShake(dt: number): void {
    if (this.shakeTimer < this.shakeDuration) {
      this.shakeTimer += dt;
      const progress = this.shakeTimer / this.shakeDuration;
      const intensity = this.shakeMagnitude * (1 - progress);
      this.shakeX = (Math.random() * 2 - 1) * intensity;
      this.shakeY = (Math.random() * 2 - 1) * intensity;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeMagnitude = 0;
    }
  }

  // ─── Frame Lifecycle ──────────────────────────────────────────────────────

  beginFrame(): void {
    const c = this.ctx;
    c.save();
    if (this.shakeX !== 0 || this.shakeY !== 0) {
      c.translate(this.shakeX, this.shakeY);
    }
    // Clear
    c.fillStyle = C.BG;
    c.fillRect(-4, -4, CANVAS_WIDTH + 8, CANVAS_HEIGHT + 8);
  }

  endFrame(): void {
    this.ctx.restore();
  }

  // ─── Primitives ───────────────────────────────────────────────────────────

  fillRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  strokeRect(x: number, y: number, w: number, h: number, color: string, lw = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lw;
    this.ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, w - 1, h - 1);
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, color: string, lw = 1): void {
    const c = this.ctx;
    c.strokeStyle = color;
    c.lineWidth = lw;
    c.beginPath();
    c.moveTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5);
    c.lineTo(Math.round(x2) + 0.5, Math.round(y2) + 0.5);
    c.stroke();
  }

  // ─── Text ─────────────────────────────────────────────────────────────────

  setFont(size: number, bold = false): void {
    this.ctx.font = `${bold ? 'bold ' : ''}${size}px "Courier New", Courier, monospace`;
    this.ctx.textBaseline = 'top';
  }

  text(str: string, x: number, y: number, color: string,
       align: CanvasTextAlign = 'left', size = 14, bold = false): void {
    const c = this.ctx;
    this.setFont(size, bold);
    c.fillStyle = color;
    c.textAlign = align;
    c.fillText(str, Math.round(x), Math.round(y));
  }

  textWidth(str: string, size = 14, bold = false): number {
    this.setFont(size, bold);
    return this.ctx.measureText(str).width;
  }

  /** Draw text with a 1-pixel shadow for readability. */
  textShadow(str: string, x: number, y: number, color: string,
             shadowColor = '#000', align: CanvasTextAlign = 'left',
             size = 14, bold = false): void {
    this.text(str, x + 1, y + 1, shadowColor, align, size, bold);
    this.text(str, x, y, color, align, size, bold);
  }

  // ─── Pixel Sprite Rendering ───────────────────────────────────────────────

  /**
   * Render a sprite defined as a 2D array of 0/1 values.
   * Each '1' cell is drawn as a (scale x scale) pixel.
   */
  drawSprite(
    sprite: readonly (readonly number[])[],
    x: number, y: number,
    color: string, scale: number = 3,
  ): void {
    const c = this.ctx;
    c.fillStyle = color;
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        if (sprite[row][col]) {
          c.fillRect(
            Math.round(x + col * scale),
            Math.round(y + row * scale),
            scale, scale,
          );
        }
      }
    }
  }

  /** Draw a pixel sprite with a colored outline for depth. */
  drawSpriteWithGlow(
    sprite: readonly (readonly number[])[],
    x: number, y: number,
    color: string, glowColor: string, scale: number = 3,
  ): void {
    this.ctx.globalAlpha = 0.4;
    this.drawSprite(sprite, x - 1, y - 1, glowColor, scale);
    this.drawSprite(sprite, x + 1, y + 1, glowColor, scale);
    this.ctx.globalAlpha = 1;
    this.drawSprite(sprite, x, y, color, scale);
  }

  // ─── Misc ─────────────────────────────────────────────────────────────────

  setAlpha(a: number): void { this.ctx.globalAlpha = a; }
  resetAlpha(): void        { this.ctx.globalAlpha = 1; }

  fillCircle(x: number, y: number, r: number, color: string): void {
    const c = this.ctx;
    c.fillStyle = color;
    c.beginPath();
    c.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2);
    c.fill();
  }

  get W(): number { return CANVAS_WIDTH; }
  get H(): number { return CANVAS_HEIGHT; }
}
