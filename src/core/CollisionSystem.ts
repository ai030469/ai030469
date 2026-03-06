import type { Rect } from '../types';

/** Axis-aligned bounding box overlap test. */
export function aabbOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/** Returns true if point (px, py) lies inside rect r. */
export function pointInRect(px: number, py: number, r: Rect): boolean {
  return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
}

/** Clamp a value between min and max. */
export function clamp(val: number, min: number, max: number): number {
  return val < min ? min : val > max ? max : val;
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Returns a rect for an entity with position and dimensions. */
export function makeRect(x: number, y: number, w: number, h: number): Rect {
  return { x, y, w, h };
}

/** Returns an inset rect (positive inset shrinks). */
export function insetRect(r: Rect, dx: number, dy = dx): Rect {
  return { x: r.x + dx, y: r.y + dy, w: r.w - dx * 2, h: r.h - dy * 2 };
}
