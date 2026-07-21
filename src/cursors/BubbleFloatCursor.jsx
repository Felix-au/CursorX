import { useEffect, useRef } from 'react';

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

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    class Bubble {
      constructor(x, y, cfg) {
        this.x = x; this.y = y;
        this.r = Math.random() * (cfg.maxSize - 7) + 7;
        this.vy = -(Math.random() * cfg.riseSpeed + 0.6);
        this.vx = (Math.random() - 0.5) * 0.9;
        this.wobble = Math.random() * Math.PI * 2;
        this.wSpd = Math.random() * 0.055 + 0.025;
        this.alpha = 0.72;
        this.hue2 = cfg.hue + Math.random() * 40 - 20;
      }
      update() {
        this.wobble += this.wSpd;
        this.x += this.vx + Math.sin(this.wobble) * 0.55;
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
    container.addEventListener('mousemove', onMove);

    const loop = () => {
      const { hue = 200, spawnRate = 5, maxSize = 25, riseSpeed = 1.6 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      if (frame % Math.max(1, spawnRate) === 0) bubbles.push(new Bubble(mx, my, { hue, maxSize, riseSpeed }));
      bubbles = bubbles.filter(b => b.alpha > 0);
      bubbles.forEach(b => { b.update(); b.draw(ctx); });
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => { container.removeEventListener('mousemove', onMove); ro.disconnect(); cancelAnimationFrame(raf); };
  }, [containerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }} />;
}
