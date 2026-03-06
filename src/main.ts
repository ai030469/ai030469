import { Game } from './Game';

// Ensure the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const canvas    = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  const crtCanvas = document.getElementById('crt-canvas')  as HTMLCanvasElement | null;

  if (!canvas || !crtCanvas) {
    console.error('[Space Raiders] Required canvas elements not found.');
    return;
  }

  const game = new Game(canvas, crtCanvas);

  game.start();
});
