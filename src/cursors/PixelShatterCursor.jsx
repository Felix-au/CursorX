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
      canvas.width  = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let shards = [];
    let mx = -1000, my = -1000, lastX = -1000, lastY = -1000;
    let rafId;
    let idleFrame = 0;

    const spawnAt = (x, y, count, burst = false) => {
      window._pxHue = configRef.current?.hue ?? 220;
      for (let i = 0; i < count; i++)
        shards.push(new Shard(x, y, window._pxHue, burst));
    };

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      const dx = mx - lastX, dy = my - lastY;
      const n = Math.min(Math.floor(Math.sqrt(dx * dx + dy * dy) * 0.6), configRef.current?.count ?? 8);
      if (n > 0) spawnAt(mx, my, n);
      lastX = mx; lastY = my;
    };

    const onClick = () => {
      const cfg = configRef.current || {};
      if (!cfg.clickAnim) return;
      spawnAt(mx, my, cfg.burstCount ?? 30, true);
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cfg = configRef.current || {};
      const gravity = cfg.gravity ?? 0.18;

      // Pointer idle emission
      if (cfg.pointerAnim) {
        const isPtr = checkPointer(
          container.getBoundingClientRect().left + mx,
          container.getBoundingClientRect().top  + my
        );
        if (isPtr && mx > 0) {
          idleFrame++;
          if (idleFrame % 4 === 0) spawnAt(mx, my, 1);
        } else idleFrame = 0;
      }

      shards = shards.filter(s => s.alpha > 0);
      shards.forEach(s => { s.update(gravity); s.draw(ctx); });
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
