import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function MirrorGhostCursor({ containerRef, config }) {
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let cx = canvas.width / 2, cy = canvas.height / 2;
    let mx = cx, my = cy; // mouse coords
    let showDot = false;

    // Follow physics state for 4 mirror ghosts
    const ghosts = [
      { x: cx, y: cy, sx: 1,  sy: 1,  l: 1.0 },
      { x: cx, y: cy, sx: -1, sy: 1,  l: 0.14 },
      { x: cx, y: cy, sx: 1,  sy: -1, l: 0.14 },
      { x: cx, y: cy, sx: -1, sy: -1, l: 0.098 }, // lerp * 0.7
    ];

    let clickT = -1;
    let ghostScale = 1.0;
    let dotScale = 1.0;
    let raf;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      showDot = true;
    };
    const onLeave = () => { showDot = false; };
    const onEnter = () => { showDot = true; };
    const onClick = () => {
      const cfg = configRef.current || {};
      if (cfg.clickAnim !== false) {
        clickT = 0;
      }
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('click', onClick);

    const loop = () => {
      const cfg = configRef.current || {};
      const color = cfg.color ?? '#c45cfc';
      const baseSize = cfg.size ?? 20;
      const baseLerp = cfg.lerp ?? 0.14;
      const pointerAnim = cfg.pointerAnim ?? true;
      const pointerScale = cfg.pointerScale ?? 2.2;
      const clickAnim = cfg.clickAnim ?? true;
      const clickScale = cfg.clickScale ?? 0.8;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Recalculate center dynamically in case canvas size changes
      cx = canvas.width / 2;
      cy = canvas.height / 2;

      // Update follow speeds live
      ghosts[1].l = baseLerp;
      ghosts[2].l = baseLerp;
      ghosts[3].l = baseLerp * 0.7;

      const rect = container.getBoundingClientRect();
      const isPointer = pointerAnim && checkPointer(rect.left + mx, rect.top + my);

      let targetGhostScale = 1.0;
      let targetDotScale = 1.0;

      if (isPointer) {
        targetGhostScale = pointerScale;
        targetDotScale = 0.5;
      }

      if (clickAnim && clickT >= 0) {
        const bounce = Math.sin(clickT * Math.PI);
        targetGhostScale *= (1 - bounce * clickScale * 0.5);
        targetDotScale *= (1 + bounce * clickScale * 1.2);
        clickT += 0.08;
        if (clickT >= 1) clickT = -1;
      }

      ghostScale += (targetGhostScale - ghostScale) * 0.15;
      dotScale += (targetDotScale - dotScale) * 0.15;

      // Update and draw ghosts on canvas (eliminates pixelation!)
      ghosts.forEach((g, i) => {
        // Mirrored target coordinate
        const tx = cx + (mx - cx) * g.sx;
        const ty = cy + (my - cy) * g.sy;

        // Lerp position
        g.x += (tx - g.x) * g.l;
        g.y += (ty - g.y) * g.l;

        // Draw ring
        const opacity = i === 0 ? 0.9 : i === 3 ? 0.28 : 0.5;
        const sizeOffset = i === 0 ? 0 : i === 3 ? -4 : -2;
        const currentSize = Math.max(1, (baseSize + sizeOffset) * ghostScale);

        ctx.save();
        ctx.beginPath();
        ctx.arc(g.x, g.y, currentSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12 * opacity;
        ctx.stroke();
        ctx.restore();
      });

      // Draw center dot
      if (showDot && mx >= 0) {
        const currentDotRadius = Math.max(0.5, (3 * dotScale));
        ctx.save();
        ctx.beginPath();
        ctx.arc(mx, my, currentDotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('click', onClick);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 35 }} />;
}
