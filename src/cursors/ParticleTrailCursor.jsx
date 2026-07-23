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
    const spd = burst ? Math.random() * 5 + 1.5 : 0;
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
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:35;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let particles = [];
    let mx = -1000, my = -1000;
    let moving = false, moveTimer = null;
    let rafId;

    // Idle emitter for pointer state
    let idleFrame = 0;

    const spawnAt = (x, y, count, burst = false) => {
      const { hue = 260, maxSize = 6 } = configRef.current || {};
      for (let i = 0; i < count; i++)
        particles.push(new Particle(x, y, hue, maxSize, burst));
    };

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      moving = true;
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => { moving = false; }, 80);
      spawnAt(mx, my, configRef.current?.count ?? 4);
    };

    const onClick = () => {
      const cfg = configRef.current || {};
      if (!cfg.clickAnim) return;
      spawnAt(mx, my, cfg.burstCount ?? 45, true);
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cfg = configRef.current || {};

      // Pointer state idle emission - keep particles alive at cursor
      if (cfg.pointerAnim && !moving) {
        const isPtr = checkPointer(
          container.getBoundingClientRect().left + mx,
          container.getBoundingClientRect().top + my
        );
        if (isPtr && mx > 0) {
          idleFrame++;
          if (idleFrame % 3 === 0)
            spawnAt(mx, my, 1);
        } else {
          idleFrame = 0;
        }
      }

      particles = particles.filter(p => p.alpha > 0);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      ro.disconnect();
      canvas.remove();
    };
  }, [container]);

  return null;
}
