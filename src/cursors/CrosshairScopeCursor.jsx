import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function CrosshairScopeCursor({ containerRef, config }) {
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    let mx = container.offsetWidth / 2, my = container.offsetHeight / 2;
    let scan = 0, scaleT = 1, scaleC = 1, raf;

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    const onClick = () => { scaleT = 0.75; setTimeout(() => { scaleT = 1; }, 200); };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const draw = () => {
      const { color = '#5cf4fc', lockedColor = '#ff4455', radius = 40, scanSpeed = 0.045, pointerAnim = true, pointerSpeedMult = 1.25 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rect = container.getBoundingClientRect();
      const isPointer = pointerAnim && checkPointer(rect.left + mx, rect.top + my);

      const speed = scanSpeed * (isPointer ? pointerSpeedMult : 1.0);
      scan += speed; scaleC += (scaleT - scaleC) * 0.2;
      const s = scaleC, r = radius * s, tick = 14 * s;
      const col = isPointer ? lockedColor : color;

      ctx.save(); ctx.translate(mx, my);
      ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.moveTo(dx * (r + 2), dy * (r + 2)); ctx.lineTo(dx * (r + tick), dy * (r + tick)); ctx.stroke();
      });
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.arc(0, 0, r - 6, scan, scan + Math.PI * 0.38); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      ctx.globalAlpha = 1;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
        const bx = sx * (r + 18), by = sy * (r + 18), bs = 14 * s;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + sx * bs, by); ctx.moveTo(bx, by); ctx.lineTo(bx, by + sy * bs); ctx.stroke();
      });
      ctx.restore(); raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      ro.disconnect(); cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 42 }} />;
}
