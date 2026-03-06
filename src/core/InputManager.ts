import type { InputSnapshot, Settings } from '../types';

/**
 * Centralized keyboard input manager.
 * Tracks pressed, just-pressed, and just-released states per frame.
 */
export class InputManager {
  private held = new Set<string>();
  private justDown = new Set<string>();
  private justUp = new Set<string>();
  private charQueue: string[] = [];

  // Configurable bindings
  private bindings: Pick<Settings, 'keyLeft' | 'keyRight' | 'keyFire' | 'keyPause'>;

  constructor(bindings: Pick<Settings, 'keyLeft' | 'keyRight' | 'keyFire' | 'keyPause'>) {
    this.bindings = bindings;
    this.attachListeners();
  }

  updateBindings(b: Pick<Settings, 'keyLeft' | 'keyRight' | 'keyFire' | 'keyPause'>): void {
    this.bindings = b;
  }

  private attachListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.held.add(e.code);
      this.justDown.add(e.code);
      // Also track by key for char matching
      this.held.add(e.key);
      this.justDown.add(e.key);
      // Queue printable characters for name entry
      if (e.key.length === 1 && /[A-Za-z]/.test(e.key)) {
        this.charQueue.push(e.key.toUpperCase());
      }
      // Prevent scrolling on space/arrows
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.held.delete(e.code);
      this.held.delete(e.key);
      this.justUp.add(e.code);
      this.justUp.add(e.key);
    });

    // Lose focus → clear all held keys to prevent stuck keys
    window.addEventListener('blur', () => { this.held.clear(); });
  }

  /** Call once per frame after processing all state updates. */
  flush(): void {
    this.justDown.clear();
    this.justUp.clear();
    this.charQueue = [];
  }

  isHeld(code: string): boolean { return this.held.has(code); }
  wasPressed(code: string): boolean { return this.justDown.has(code); }
  wasReleased(code: string): boolean { return this.justUp.has(code); }

  /** Consume the next queued character (for name entry). */
  nextChar(): string | null {
    return this.charQueue.shift() ?? null;
  }

  wasBackspace(): boolean {
    return this.justDown.has('Backspace');
  }

  /** High-level snapshot for the current frame. */
  snapshot(): InputSnapshot {
    const b = this.bindings;
    const anyKey = this.justDown.size > 0;
    return {
      left:    this.isHeld(b.keyLeft)  || this.isHeld('ArrowLeft'),
      right:   this.isHeld(b.keyRight) || this.isHeld('ArrowRight'),
      fire:    this.isHeld(b.keyFire)  || this.isHeld('KeyZ') || this.isHeld('z'),
      pause:   this.wasPressed(b.keyPause) || this.wasPressed('Escape'),
      confirm: this.wasPressed('Enter') || this.wasPressed(' ') || this.wasPressed('KeyZ'),
      back:    this.wasPressed('Escape') || this.wasPressed('Backspace'),
      up:      this.wasPressed('ArrowUp')   || this.wasPressed('KeyW'),
      down:    this.wasPressed('ArrowDown') || this.wasPressed('KeyS'),
      any:     anyKey,
    };
  }

  /** Just-pressed for a specific action key. */
  justPressedFire(): boolean {
    return this.wasPressed(this.bindings.keyFire) ||
           this.wasPressed('KeyZ') || this.wasPressed('z');
  }
  justPressedLeft(): boolean  { return this.wasPressed(this.bindings.keyLeft) || this.wasPressed('ArrowLeft'); }
  justPressedRight(): boolean { return this.wasPressed(this.bindings.keyRight) || this.wasPressed('ArrowRight'); }
}
