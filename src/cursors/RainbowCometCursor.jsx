import { useEffect, useRef } from 'react';

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

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    container.addEventListener('mousemove', onMove);

    const loop = () => {
      const { trailLength = 45, hueSpeed = 2.5, maxWidth = 13 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hue = (hue + hueSpeed) % 360;
      trail.push({ x: mx, y: my, hue });
      if (trail.length > trailLength) trail.shift();
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1], b = trail[i];
        const alpha = i / trail.length, w = alpha * maxWidth;
        ctx.save();
        ctx.strokeStyle = `hsla(${b.hue},100%,62%,${alpha * 0.88})`;
        ctx.shadowColor = `hsl(${b.hue},100%,60%)`; ctx.shadowBlur = w;
        ctx.lineWidth = w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
      }
      if (trail.length > 0) {
        const h = trail[trail.length - 1];
        ctx.save(); ctx.beginPath(); ctx.arc(h.x, h.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${h.hue},100%,82%)`;
        ctx.shadowColor = `hsl(${h.hue},100%,60%)`; ctx.shadowBlur = 22; ctx.fill(); ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => { container.removeEventListener('mousemove', onMove); ro.disconnect(); cancelAnimationFrame(raf); };
  }, [containerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 35 }} />;
}
