import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

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
        this.isEmber = false;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (!this.isEmber) {
          this.vx += (Math.random() - 0.5) * 0.35;
        } else {
          this.vy += 0.06; // slight gravity pull on click embers
        }
        this.life -= this.decay; this.size *= 0.968;
      }
      draw(c, isPointer) {
        const { pointerAnim = true, pointerAlpha = 0.35, pointerSizeMult = 1.5 } = configRef.current || {};
        const hue = this.life > 0.55 ? 42 + (1 - this.life) * 22 : this.life > 0.2 ? 12 : 0;
        const sat = this.life > 0.2 ? 100 : Math.max(0, (this.life / 0.2) * 40);
        const lit = this.life > 0.2 ? 52 + this.life * 18 : 35;
        c.save(); 
        
        let alpha = Math.max(0, this.life * 0.92);
        let currentSize = Math.max(0.1, this.size);

        if (pointerAnim && isPointer && !this.isEmber) {
          alpha *= pointerAlpha; 
          currentSize *= pointerSizeMult;
        }

        c.globalAlpha = alpha;
        c.fillStyle = `hsl(${hue},${sat}%,${lit}%)`;
        c.shadowColor = `hsl(${hue},100%,55%)`; c.shadowBlur = 14;
        c.beginPath(); c.arc(this.x, this.y, currentSize, 0, Math.PI * 2); c.fill(); c.restore();
      }
    }

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };

    const onClick = () => {
      const { rise = 2, size = 4, clickAnim = true, clickEmberCount = 25 } = configRef.current || {};
      if (!clickAnim) return;
      // Instant flare up with shooting embers
      for (let i = 0; i < clickEmberCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 2.0;
        const ember = new Flame(mx, my, { rise, size });
        ember.vx = Math.cos(angle) * speed;
        ember.vy = Math.sin(angle) * speed - 1.0;
        ember.decay = Math.random() * 0.035 + 0.015;
        ember.size = Math.random() * 5 + 3;
        ember.isEmber = true;
        particles.push(ember);
      }
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      const { count = 5, rise = 2, size = 4, pointerAnim = true } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rect = container.getBoundingClientRect();
      const isPointer = pointerAnim && checkPointer(rect.left + mx, rect.top + my);

      for (let i = 0; i < count; i++) {
        particles.push(new Flame(mx, my, { rise, size }));
      }

      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => { p.update(); p.draw(ctx, isPointer); });
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
