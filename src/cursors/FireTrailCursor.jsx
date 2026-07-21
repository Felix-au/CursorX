import { useEffect, useRef } from 'react';

export default function FireTrailCursor({ containerRef, config }) {
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [], mx = 0, my = 0, raf;

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    class Flame {
      constructor(x, y, cfg) {
        this.x = x + (Math.random() - 0.5) * 8; this.y = y;
        this.vx = (Math.random() - 0.5) * 1.8;
        this.vy = -(Math.random() * cfg.rise + 1.2);
        this.life = 1; this.decay = Math.random() * 0.028 + 0.016;
        this.size = Math.random() * cfg.size + 4;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.vx += (Math.random() - 0.5) * 0.35;
        this.life -= this.decay; this.size *= 0.968;
      }
      draw(c) {
        const hue = this.life > 0.55 ? 42 + (1 - this.life) * 22 : this.life > 0.2 ? 12 : 0;
        const sat = this.life > 0.2 ? 100 : Math.max(0, (this.life / 0.2) * 40);
        const lit = this.life > 0.2 ? 52 + this.life * 18 : 35;
        c.save(); c.globalAlpha = Math.max(0, this.life * 0.92);
        c.fillStyle = `hsl(${hue},${sat}%,${lit}%)`;
        c.shadowColor = `hsl(${hue},100%,55%)`; c.shadowBlur = 14;
        c.beginPath(); c.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2); c.fill(); c.restore();
      }
    }

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    container.addEventListener('mousemove', onMove);

    const loop = () => {
      const { count = 5, rise = 2, size = 9 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < count; i++) particles.push(new Flame(mx, my, { rise, size }));
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => { container.removeEventListener('mousemove', onMove); ro.disconnect(); cancelAnimationFrame(raf); };
  }, [containerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }} />;
}
