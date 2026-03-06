import type { IGameState, StateName } from '../types';
import type { Game } from '../Game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, C } from '../config';
import { PLAYER_SPRITE, SQUID, CRAB, OCTOPUS, UFO_SPRITE } from '../entities/Sprites';

export class HowToPlayState implements IGameState {
  name: StateName = 'howtoplay';
  private flashTimer = 0;

  onEnter(_ctx: Game): void { this.flashTimer = 0; }
  onExit(_ctx: Game): void {}

  update(dt: number, ctx: Game): void {
    this.flashTimer += dt;
    const input = ctx.input.snapshot();
    if (input.back || input.confirm) {
      ctx.audio.play('menuBack');
      ctx.go('menu');
    }
  }

  render(ctx: Game): void {
    const r = ctx.renderer;
    r.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000008');

    // Header
    r.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, C.BORDER, 1);
    r.fillRect(0, 0, CANVAS_WIDTH, 44, 'rgba(0,20,0,0.8)');
    r.textShadow('HOW TO PLAY', CANVAS_WIDTH / 2, 12, C.HUD_SCORE, '#003300', 'center', 20, true);

    let y = 58;
    const col1 = 40;
    const col2 = CANVAS_WIDTH / 2 + 20;

    // Controls section
    r.text('CONTROLS', col1, y, C.HIGHLIGHT, 'left', 13, true);
    y += 22;
    const controls: [string, string][] = [
      ['← →  /  A D',    'MOVE SHIP'],
      ['SPACE  /  Z',     'FIRE'],
      ['ESC',             'PAUSE / BACK'],
      ['ENTER',           'CONFIRM'],
    ];
    for (const [key, action] of controls) {
      r.fillRect(col1, y, 140, 18, 'rgba(68,255,68,0.06)');
      r.text(key, col1 + 4, y + 2, C.BORDER, 'left', 11, true);
      r.text(action, col1 + 148, y + 2, C.HUD_TEXT, 'left', 11);
      y += 22;
    }

    // Objective section
    y = 58;
    r.text('OBJECTIVE', col2, y, C.HIGHLIGHT, 'left', 13, true);
    y += 22;
    const objectives = [
      'Destroy all alien invaders',
      'before they reach Earth!',
      '',
      'Defend the shields — they',
      'protect you from enemy fire.',
      '',
      'Don\'t let aliens reach',
      'the bottom of the screen!',
    ];
    for (const line of objectives) {
      r.text(line, col2, y, C.HUD_TEXT, 'left', 11);
      y += 18;
    }

    // Enemy score table
    y = 260;
    r.drawLine(col1, y - 8, CANVAS_WIDTH - col1, y - 8, C.BORDER, 1);
    r.text('ENEMY SCORE TABLE', CANVAS_WIDTH / 2, y, C.HIGHLIGHT, 'center', 13, true);
    y += 28;

    const enemies = [
      { sprite: SQUID[0], color: '#ff6633', label: 'SQUID', score: '30 PTS', row: 0 },
      { sprite: CRAB[0],  color: '#33ffcc', label: 'CRAB',  score: '20 PTS', row: 2 },
      { sprite: OCTOPUS[0], color: '#ff33ff', label: 'OCTOPUS', score: '10 PTS', row: 4 },
      { sprite: UFO_SPRITE, color: '#ff2222', label: 'MYSTERY SHIP', score: '???' },
    ];

    const enemyW = (CANVAS_WIDTH - 80) / enemies.length;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      const ex = 40 + i * enemyW + enemyW / 2 - 12;
      r.drawSprite(e.sprite, ex, y, e.color, 3);
      r.text(e.label, 40 + i * enemyW + enemyW / 2, y + 32, e.color, 'center', 10);
      r.text(e.score, 40 + i * enemyW + enemyW / 2, y + 44, C.HIGHLIGHT, 'center', 11, true);
    }

    // Tips
    y = 378;
    r.drawLine(col1, y - 8, CANVAS_WIDTH - col1, y - 8, C.BORDER, 1);
    r.text('TIPS', CANVAS_WIDTH / 2, y, C.HIGHLIGHT, 'center', 13, true);
    y += 24;
    const tips = [
      '★  Top row enemies score the most — target them first!',
      '★  Enemy speed increases as their numbers decrease.',
      '★  Mystery ship appears periodically for bonus points.',
      '★  Shields can be used as cover but they erode over time.',
    ];
    for (const tip of tips) {
      r.text(tip, CANVAS_WIDTH / 2, y, C.HUD_TEXT, 'center', 10);
      y += 18;
    }

    // Back hint
    const blink = Math.floor(this.flashTimer * 2) % 2 === 0;
    r.text(
      blink ? '[ PRESS ENTER OR ESC TO GO BACK ]' : '',
      CANVAS_WIDTH / 2, CANVAS_HEIGHT - 22, C.DIM, 'center', 10,
    );
  }
}
