import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

class Shard {
  constructor(x, y, hue, burst = false) {
    const a = Math.random() * Math.PI * 2;
    const spd = burst ? (Math.random() * 7 + 2) : (Math.random() * 6 + 2);
    this.x = x; this.y = y;
    this.vx = Math.cos(a) * spd; this.vy = Math.sin(a) * spd;
    this.size = Math.random() * 6 + 2;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpd = (Math.random() - 0.5) * 0.25;
    this.alpha = 1;
    this.color = burst
      ? `hsl(${Math.random() * 360},85%,70%)`
      : `hsl(${60 + Math.random() * 60 - 30 + (window._pxHue || 220)},80%,70%)`;
    this.isBurst = burst;
  }
  update(gravity) {
    this.x += this.vx; this.y += this.vy;
    this.vy += gravity; this.vx *= 0.97;
    this.rot += this.rotSpd;
    this.alpha -= this.isBurst ? 0.016 : 0.028;
    this.size *= 0.975;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y); ctx.rotate(this.rot);
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

export default function PixelShatterCursor({ containerRef, config }) {
  return null;
}
