import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function DNAHelixCursor({ containerRef, config }) {
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
    const HIST = 80;
    const path = [];
    let mx = -100, my = -100;
    let phase = 0, raf;
    let clickT = -1;
    let circleScale = 1;
    let circleOpacity = 1;

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    };
    const onLeave = () => { mx = -1000; my = -1000; };
    const onClick = () => {
      clickT = 0;
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('click', onClick);

    const loop = () => {
      const { color1 = '#7c5cfc', color2 = '#5cf4fc', amplitude = 16, speed = 0.09 } = configRef.current || {};
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      phase += speed;
      path.push({ x: mx, y: my });
      if (path.length > HIST) path.shift();

      const rect = container.getBoundingClientRect();
      const isPointer = checkPointer(rect.left + mx, rect.top + my);

      // Lerp scale and opacity for the tip circle (pointer state: bigger, translucent)
      const targetScale = isPointer ? 3.2 : 1.0;
      const targetOpacity = isPointer ? 0.45 : 1.0;
      circleScale += (targetScale - circleScale) * 0.15;
      circleOpacity += (targetOpacity - circleOpacity) * 0.15;

      if (mx < 0) {
        dot.style.opacity = '0';
      } else {
        dot.style.opacity = String(circleOpacity);
      }
      dot.style.transform = `translate(-50%,-50%) scale(${circleScale})`;

      // Click replication pulse boost
      let clickBoost = 0;
      if (clickT >= 0) {
        clickBoost = Math.sin(clickT * Math.PI) * 45;
        clickT += 0.05;
        if (clickT >= 1) clickT = -1;
      }

      if (path.length < 4) { raf = requestAnimationFrame(loop); return; }

      for (let strand = 0; strand < 2; strand++) {
        const phOff = strand * Math.PI;
        ctx.beginPath(); let started = false;
        path.forEach((p, i) => {
          const t = i / path.length;
          const amp = amplitude * t + clickBoost * t;
          const wp = (phase * 0.65) + (i * 0.2) + phOff;
          const next = path[Math.min(i + 1, path.length - 1)], prev = path[Math.max(i - 1, 0)];
          const dx = next.x - prev.x, dy = next.y - prev.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = -dy / len, ny = dx / len;
          const wx = p.x + nx * Math.sin(wp) * amp, wy = p.y + ny * Math.sin(wp) * amp;
          if (!started) { ctx.moveTo(wx, wy); started = true; } else ctx.lineTo(wx, wy);
        });
        ctx.strokeStyle = strand === 0 ? color1 : color2;
        ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.shadowColor = strand === 0 ? color1 : color2;
        ctx.shadowBlur = clickT >= 0 ? 15 : 6;
        ctx.stroke();
      }

      for (let i = 0; i < path.length; i += 10) {
        const t = i / path.length;
        const amp = amplitude * t + clickBoost * t;
        const wp = (phase * 0.65) + (i * 0.2);
        const next = path[Math.min(i + 1, path.length - 1)], prev = path[Math.max(i - 1, 0)];
        const dx = next.x - prev.x, dy = next.y - prev.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const x1 = path[i].x + nx * Math.sin(wp) * amp, y1 = path[i].y + ny * Math.sin(wp) * amp;
        const x2 = path[i].x + nx * Math.sin(wp + Math.PI) * amp, y2 = path[i].y + ny * Math.sin(wp + Math.PI) * amp;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(200,200,255,.22)'; ctx.lineWidth = 1; ctx.shadowBlur = 0; ctx.stroke();
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('click', onClick);
      ro.disconnect(); cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 35 }} />
      <div ref={dotRef} style={{
        position: 'absolute', pointerEvents: 'none', zIndex: 40, opacity: 0,
        width: 8, height: 8, borderRadius: '50%',
        background: 'white', transform: 'translate(-50%,-50%)',
        willChange: 'left,top,transform,opacity',
      }} />
    </>
  );
}
