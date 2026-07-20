import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

class Particle {
  constructor(x, y, hue, maxSize, burst = false) {
    const angle = burst ? Math.random() * Math.PI * 2 : 0;
    const spd   = burst ? Math.random() * 5 + 1.5 : 0;
    this.x = x; this.y = y;
    this.vx = burst ? Math.cos(angle) * spd : (Math.random() - 0.5) * 2.5;
    this.vy = burst ? Math.sin(angle) * spd : (Math.random() - 0.5) * 2.5 - 0.8;
    this.alpha = 1;
    this.size = Math.random() * maxSize + 1;
    this.hue = burst
      ? Math.random() * 360          // full-spectrum on burst
      : hue + Math.random() * 60 - 30;
    this.gravity = burst ? 0.05 : 0.06;
    this.isBurst = burst;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.97;
    this.alpha -= this.isBurst ? 0.018 : 0.022;
    this.size *= 0.97;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = `hsl(${this.hue},100%,70%)`;
    ctx.shadowColor = `hsl(${this.hue},100%,60%)`; ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function ParticleTrailCursor({ containerRef, config }) {
  return null;
}
