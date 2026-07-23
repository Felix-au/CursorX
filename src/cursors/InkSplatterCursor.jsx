import { useEffect, useRef } from 'react';

export default function InkSplatterCursor({ containerRef, config }) {
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    let lastX = 0, lastY = 0, hueVar = (configRef.current?.hue ?? 260);
    let isDrawing = false, raf;

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMove = (e) => {
      if (!isDrawing) return;
      const { maxStroke = 14 } = configRef.current || {};
      hueVar = (configRef.current?.hue ?? hueVar);
      const r = container.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const dx = x - lastX, dy = y - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      if (speed > 1) {
        hueVar = (hueVar + 0.6) % 360;
        ctx.save();
        ctx.strokeStyle = `hsla(${hueVar},90%,65%,0.75)`;
        ctx.lineWidth = Math.min(speed * 0.45, maxStroke);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.shadowColor = `hsl(${hueVar},90%,60%)`; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        ctx.restore();
      }
      lastX = x; lastY = y;
    };

    const onEnter = (e) => {
      isDrawing = true;
      const r = container.getBoundingClientRect();
      lastX = e.clientX - r.left; lastY = e.clientY - r.top;
    };
    const onLeave = () => { isDrawing = false; };
    const onDblClick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('dblclick', onDblClick);

    // Dissipation loop - fades existing ink
    const loop = () => {
      const { dissipation = 0.01 } = configRef.current || {};
      ctx.fillStyle = `rgba(0,0,0,${dissipation})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('dblclick', onDblClick);
      ro.disconnect(); cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }} />;
}
