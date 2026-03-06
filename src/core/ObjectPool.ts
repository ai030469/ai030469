/**
 * Generic fixed-size object pool to avoid GC pressure for frequently
 * created/destroyed objects (bullets, particles).
 */
export class ObjectPool<T extends { active: boolean }> {
  private pool: T[];
  private size: number;

  constructor(size: number, factory: () => T) {
    this.size = size;
    this.pool = Array.from({ length: size }, factory);
  }

  /** Acquire an inactive slot, or null if pool is exhausted. */
  acquire(): T | null {
    for (let i = 0; i < this.size; i++) {
      if (!this.pool[i].active) return this.pool[i];
    }
    return null;
  }

  /** Release all active objects matching predicate. */
  releaseWhere(pred: (obj: T) => boolean): void {
    for (let i = 0; i < this.size; i++) {
      if (this.pool[i].active && pred(this.pool[i])) {
        this.pool[i].active = false;
      }
    }
  }

  /** Iterate all active objects. */
  forEach(fn: (obj: T) => void): void {
    for (let i = 0; i < this.size; i++) {
      if (this.pool[i].active) fn(this.pool[i]);
    }
  }

  /** Get all active objects as an array (allocates). */
  getActive(): T[] {
    return this.pool.filter(o => o.active);
  }

  /** Reset all objects to inactive. */
  reset(): void {
    for (let i = 0; i < this.size; i++) this.pool[i].active = false;
  }

  get activeCount(): number {
    let n = 0;
    for (let i = 0; i < this.size; i++) if (this.pool[i].active) n++;
    return n;
  }
}
