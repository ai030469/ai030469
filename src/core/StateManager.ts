import type { IGameState, StateName } from '../types';

/**
 * Finite state machine managing game states.
 * Only one state is active at a time.
 */
export class StateManager {
  private states = new Map<StateName, IGameState>();
  private current: IGameState | null = null;
  private ctx: unknown;

  constructor(context: unknown) {
    this.ctx = context;
  }

  register(state: IGameState): void {
    this.states.set(state.name, state);
  }

  /** Transition to a named state, calling exit/enter hooks. */
  transition(name: StateName): void {
    const next = this.states.get(name);
    if (!next) {
      console.warn(`[StateManager] Unknown state: ${name}`);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (this.current) this.current.onExit(this.ctx as any);
    this.current = next;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.current.onEnter(this.ctx as any);
  }

  update(dt: number): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.current?.update(dt, this.ctx as any);
  }

  render(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.current?.render(this.ctx as any);
  }

  get activeName(): StateName | null {
    return this.current?.name ?? null;
  }
}
