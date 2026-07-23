import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function BubbleFloatCursor({ containerRef, config }) {
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    let bubbles = [], mx = 0, my = 0, frame = 0, raf;
    let popParticles = [];

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    class Bubble {
      constructor(x, y, cfg) {
        this.x = x; this.y = y;
        this.r = (Math.random() * (cfg.maxSize - 7) + 7) * (cfg.isPointer ? cfg.pointerSizeMult : 1.0);
        this.vy = -(Math.random() * cfg.riseSpeed + 0.6) * (cfg.isPointer ? 1.25 : 1.0);
        this.vx = (Math.random() - 0.5) * 0.9;
        this.wobble = Math.random() * Math.PI * 2;
        this.wSpd = (Math.random() * 0.055 + 0.025) * (cfg.isPointer ? 1.75 : 1.0);
        this.alpha = 0.72;
        this.hue2 = cfg.hue + Math.random() * 40 - 20;
      }
      update() {
        this.wobble += this.wSpd;
        this.x += this.vx + Math.sin(this.wobble) * 0.65;
        this.y += this.vy; this.alpha -= 0.004;
      }
      draw(c) {
        c.save(); c.globalAlpha = Math.max(0, this.alpha);
        const g = c.createRadialGradient(this.x - this.r * 0.32, this.y - this.r * 0.32, this.r * 0.08, this.x, this.y, this.r);
        g.addColorStop(0, `hsla(${this.hue2},70%,92%,.85)`);
        g.addColorStop(0.55, `hsla(${this.hue2},60%,72%,.18)`);
        g.addColorStop(1, `hsla(${this.hue2},80%,62%,.38)`);
        c.beginPath(); c.arc(this.x, this.y, this.r, 0, Math.PI * 2); c.fillStyle = g; c.fill();
        c.beginPath(); c.arc(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.22, 0, Math.PI * 2);
        c.fillStyle = 'rgba(255,255,255,.65)'; c.fill(); c.restore();
      }
    }

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };

    const onClick = () => {
      const { clickAnim = true } = configRef.current || {};
      if (!clickAnim) return;
      // Pop all current bubbles into tiny splash droplets
      bubbles.forEach(b => {
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2.2 + 1.2;
          popParticles.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: Math.random() * 1.5 + 1.0,
            life: 1.0,
            hue: b.hue2,
          });
        }
      });
      bubbles = [];
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      const { hue = 200, spawnRate = 5, maxSize = 25, riseSpeed = 1.6, pointerAnim = true, pointerSizeMult = 1.55 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      const rect = container.getBoundingClientRect();
      const isPointer = pointerAnim && checkPointer(rect.left + mx, rect.top + my);

      // Double spawn frequency inside pointer state
      const currentSpawnRate = isPointer ? Math.max(1, Math.floor(spawnRate / 2)) : spawnRate;

      if (frame % Math.max(1, currentSpawnRate) === 0) {
        bubbles.push(new Bubble(mx, my, { hue, maxSize, riseSpeed, isPointer, pointerSizeMult }));
      }

      bubbles = bubbles.filter(b => b.alpha > 0);
      bubbles.forEach(b => { b.update(); b.draw(ctx); });

      // Update and draw pop particle droplets
      popParticles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity pull on droplets
        p.life -= 0.035;
        if (p.life <= 0) {
          popParticles.splice(idx, 1);
          return;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.life})`;
        ctx.fill();
        ctx.restore();
      });

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 35 }} />;
}
