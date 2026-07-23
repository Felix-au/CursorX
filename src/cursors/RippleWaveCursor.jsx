import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function RippleWaveCursor({ containerRef, config }) {
  const canvasRef = useRef(null);
  const dotRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    const dot = dotRef.current;
    if (!container || !canvas || !dot) return;

    const ctx = canvas.getContext('2d');
    let ripples = [], raf;
    let mx = -100, my = -100;
    let time = 0;

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onClick = (e) => {
      const { hue = 220, count = 3 } = configRef.current || {};
      const r = container.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      for (let i = 0; i < count; i++) {
        ripples.push({ x, y, r: 0, alpha: 0.82 - i * 0.2, delay: i * 5, age: 0, hue: hue + Math.random() * 30 - 15 });
      }
    };
    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      dot.style.opacity = '1';
    };
    const onLeave = () => { dot.style.opacity = '0'; };

    container.addEventListener('click', onClick);
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    const loop = () => {
      const { speed = 3.2 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;

      const rect = container.getBoundingClientRect();
      const isPointer = checkPointer(rect.left + mx, rect.top + my);

      if (isPointer) {
        // breathing pulse: expands and retracts rhythmically
        const breath = 1.0 + (0.3 + Math.sin(time * 5.2) * 0.3);
        dot.style.transform = `translate(-50%,-50%) scale(${breath})`;
      } else {
        dot.style.transform = 'translate(-50%,-50%) scale(1)';
      }

      ripples = ripples.filter(r => r.alpha > 0);
      ripples.forEach(r => {
        r.age++; if (r.age < r.delay) return;
        r.r += speed; r.alpha -= 0.011;
        ctx.save(); ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${r.hue},80%,70%,${Math.max(0, r.alpha)})`;
        ctx.lineWidth = 2; ctx.shadowColor = `hsl(${r.hue},80%,70%)`; ctx.shadowBlur = 8;
        ctx.stroke(); ctx.restore();
      });
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('click', onClick);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      ro.disconnect(); cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 35 }} />
      <div ref={dotRef} style={{
        position: 'absolute', pointerEvents: 'none', zIndex: 40, opacity: 0,
        width: 9, height: 9, borderRadius: '50%',
        border: '1.5px solid white', transform: 'translate(-50%,-50%)',
        willChange: 'left,top,transform',
      }} />
    </>
  );
}
