import { FIXED_STEP } from '../config';

type UpdateFn = (dt: number) => void;
type RenderFn = () => void;

/**
 * Fixed-timestep game loop using requestAnimationFrame.
 * Ensures deterministic simulation while rendering at max frame rate.
 */
export class GameLoop {
  private updateFn: UpdateFn;
  private renderFn: RenderFn;
  private accumulator = 0;
  private lastTime = -1;
  private rafId = 0;
  private running = false;
  private readonly dt = FIXED_STEP / 1000; // seconds

  constructor(updateFn: UpdateFn, renderFn: RenderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = -1;
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private tick = (timestamp: number): void => {
    if (!this.running) return;

    if (this.lastTime < 0) this.lastTime = timestamp;

    // Cap delta to avoid spiral of death after tab switch
    const rawDelta = Math.min(timestamp - this.lastTime, 200);
    this.lastTime = timestamp;
    this.accumulator += rawDelta;

    while (this.accumulator >= FIXED_STEP) {
      this.updateFn(this.dt);
      this.accumulator -= FIXED_STEP;
    }

    this.renderFn();
    this.rafId = requestAnimationFrame(this.tick);
  };

  get isRunning(): boolean { return this.running; }
}
