import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function RainbowCometCursor({ containerRef, config }) {
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    let trail = [], mx = 0, my = 0, hue = 0, raf;
    let clickParticles = [];
    let time = 0;

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };

    const onClick = () => {
      // Release a burst of mini rainbow sparkles
      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.5;
        clickParticles.push({
          x: mx,
          y: my,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          hue: (hue + Math.random() * 80 - 40 + 360) % 360,
          life: 1.0,
          size: Math.random() * 4 + 2.5,
        });
      }
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      const { trailLength = 45, hueSpeed = 2.5, maxWidth = 13 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;

      const rect = container.getBoundingClientRect();
      const isPointer = checkPointer(rect.left + mx, rect.top + my);

      // Pulse multiplier for neon pointer state
      const pulse = isPointer ? (1.3 + Math.sin(time * 5) * 0.2) : 1.0;
      const currentMaxWidth = maxWidth * pulse;

      hue = (hue + hueSpeed) % 360;
      trail.push({ x: mx, y: my, hue });
      if (trail.length > trailLength) trail.shift();

      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1], b = trail[i];
        const alpha = i / trail.length, w = alpha * currentMaxWidth;
        ctx.save();
        ctx.strokeStyle = `hsla(${b.hue},100%,62%,${alpha * (isPointer ? 0.95 : 0.88)})`;
        ctx.shadowColor = `hsl(${b.hue},100%,60%)`; 
        ctx.shadowBlur = w * (isPointer ? 1.8 : 1.0);
        ctx.lineWidth = w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
      }

      if (trail.length > 0) {
        const h = trail[trail.length - 1];
        const baseHeadR = isPointer ? 11 : 7;
        ctx.save(); ctx.beginPath(); ctx.arc(h.x, h.y, baseHeadR, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${h.hue},100%,82%)`;
        ctx.shadowColor = `hsl(${h.hue},100%,60%)`; ctx.shadowBlur = isPointer ? 35 : 22; ctx.fill(); ctx.restore();
      }

      // Draw click burst sparkles
      clickParticles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        if (p.life <= 0) {
          clickParticles.splice(idx, 1);
          return;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue},100%,75%)`;
        ctx.shadowColor = `hsl(${p.hue},100%,60%)`;
        ctx.shadowBlur = 8 * p.life;
        ctx.globalAlpha = p.life;
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
