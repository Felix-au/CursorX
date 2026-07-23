import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function WindStreamCursor({ containerRef, config }) {
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    let streams = [], mx = 0, my = 0, raf;

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMove = (e) => {
      const { hue = 200, count = 2, minSpeed = 2.5 } = configRef.current || {};
      const r = container.getBoundingClientRect();
      const nx = e.clientX - r.left, ny = e.clientY - r.top;
      const dx = nx - mx, dy = ny - my;
      mx = nx; my = ny;
      const spd = Math.sqrt(dx * dx + dy * dy);

      const isPointer = checkPointer(r.left + mx, r.top + my);
      const spawnCount = isPointer ? count * 2 : count;

      if (spd > minSpeed) {
        for (let i = 0; i < spawnCount; i++) {
          streams.push({
            points: [{ x: mx, y: my }],
            vx: dx * 0.28 + (Math.random() - 0.5) * 3.5,
            vy: dy * 0.28 + (Math.random() - 0.5) * 3.5,
            alpha: 0.82, hue: hue + Math.random() * 45 - 22,
          });
        }
      }
    };

    const onClick = (e) => {
      const { hue = 200 } = configRef.current || {};
      const r = container.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      // Circular blast of wind streams in 360 degrees
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const speed = Math.random() * 5.0 + 3.0;
        streams.push({
          points: [{ x: cx, y: cy }],
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.95,
          hue: hue + Math.random() * 45 - 22,
        });
      }
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      const { decay = 0.93 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rect = container.getBoundingClientRect();
      const isPointer = checkPointer(rect.left + mx, rect.top + my);

      streams = streams.filter(s => s.alpha > 0.02);
      streams.forEach(s => {
        s.vx *= decay; s.vy *= decay; s.vy += 0.045;
        const last = s.points[s.points.length - 1];
        s.points.push({ x: last.x + s.vx, y: last.y + s.vy });
        if (s.points.length > 22) s.points.shift();
        s.alpha *= 0.952;
        if (s.points.length < 3) return;
        ctx.save(); ctx.beginPath(); ctx.moveTo(s.points[0].x, s.points[0].y);
        for (let i = 1; i < s.points.length - 1; i++) {
          const mx2 = (s.points[i].x + s.points[i + 1].x) / 2;
          const my2 = (s.points[i].y + s.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(s.points[i].x, s.points[i].y, mx2, my2);
        }
        ctx.strokeStyle = `hsla(${s.hue},80%,70%,${s.alpha})`;
        
        // Dynamic thickness and glow on hover
        const thickMult = isPointer ? 6.5 : 3.5;
        const glowRadius = isPointer ? 12 : 5;

        ctx.lineWidth = Math.max(0.5, s.alpha * thickMult); ctx.lineCap = 'round';
        ctx.shadowColor = `hsl(${s.hue},80%,70%)`; ctx.shadowBlur = glowRadius;
        ctx.stroke(); ctx.restore();
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
