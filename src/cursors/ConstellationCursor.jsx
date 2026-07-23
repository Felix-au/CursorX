import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function ConstellationCursor({ containerRef, config }) {
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    let mx = 0, my = 0, raf;
    let clickT = -1;
    let time = 0;

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const { starCount = 90 } = configRef.current || {};
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width || Math.random() * 800,
      y: Math.random() * canvas.height || Math.random() * 500,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 2 + 0.5,
    }));

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    const onLeave = () => { mx = -1000; my = -1000; };
    const onClick = () => {
      const cfg = configRef.current || {};
      if (cfg.clickAnim !== false) {
        clickT = 0;
      }
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('click', onClick);

    const draw = () => {
      const { maxDist = 115, cursorDist = 175, starColor = '#c8c8ff', pointerAnim = true, pointerDistMult = 1.25, clickAnim = true, clickGlowIntensity = 1.5 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;

      const rect = container.getBoundingClientRect();
      const isPointer = pointerAnim && checkPointer(rect.left + mx, rect.top + my);
      const pulse = isPointer ? (1.0 + Math.sin(time * 6) * 0.25) : 1.0;
      const currentCursorDist = cursorDist * (isPointer ? pointerDistMult : 1.0);

      let clickGlow = 0;
      if (clickAnim && clickT >= 0) {
        clickGlow = Math.sin(clickT * Math.PI);
        clickT += 0.05;
        if (clickT >= 1) clickT = -1;
      }

      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = canvas.width; if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height; if (s.y > canvas.height) s.y = 0;
      });

      for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        for (let j = i + 1; j < stars.length; j++) {
          const b = stars[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxDist) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124,92,252,${(1 - d / maxDist) * 0.35})`;
            ctx.lineWidth = 0.7; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }

        const dc = Math.hypot(a.x - mx, a.y - my);
        if (dc < currentCursorDist) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(92,244,252,${(1 - dc / currentCursorDist) * 0.75 * pulse})`;
          ctx.lineWidth = isPointer ? 1.5 * pulse : 1.0;
          ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();

          // Connected stars glow once on click
          if (clickAnim && clickT >= 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r * (1 + clickGlow * clickGlowIntensity * 2.5), 0, Math.PI * 2);
            ctx.fillStyle = starColor;
            ctx.globalAlpha = clickGlow * 0.8;
            ctx.shadowColor = '#5cf4fc';
            ctx.shadowBlur = 15 * clickGlow;
            ctx.fill();
            ctx.restore();
          }
        }


        ctx.beginPath(); ctx.fillStyle = starColor;
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('click', onClick);
      ro.disconnect(); cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 35 }} />;
}
