import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function TextOrbiterCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:35;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let mx = container.clientWidth  / 2;
    let my = container.clientHeight / 2;
    let angle = 0;
    let currentRadius, targetRadius;
    let currentSpeed, targetSpeed;
    let clickT = -1;   // click expand-retract
    let rafId;

    currentRadius = config.radius ?? 42;
    currentSpeed  = config.speed  ?? 0.02;
    targetRadius  = currentRadius;
    targetSpeed   = currentSpeed;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };

    const onClick = () => {
      if (configRef.current?.clickAnim) clickT = 0;
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cfg = configRef.current || {};
      const baseRadius = cfg.radius ?? 42;
      const baseSpeed  = cfg.speed  ?? 0.02;
      const color      = cfg.color  ?? '#7c5cfc';
      const text       = cfg.text   ?? '✦ CURSORX ✦ DEV ✦';

      const isPointer = cfg.pointerAnim && checkPointer(
        container.getBoundingClientRect().left + mx,
        container.getBoundingClientRect().top  + my
      );

      // Pointer state: boost radius and speed
      if (isPointer) {
        targetRadius = baseRadius + (cfg.pointerRadiusBoost ?? 20);
        targetSpeed  = baseSpeed  + (cfg.pointerSpeedBoost  ?? 0.04);
      } else if (clickT >= 0 && cfg.clickAnim) {
        // Click: expand then contract once
        const k = Math.sin(clickT * Math.PI);
        targetRadius = baseRadius + k * (cfg.pointerRadiusBoost ?? 20);
        targetSpeed  = baseSpeed  + k * (cfg.pointerSpeedBoost  ?? 0.04);
        clickT += 0.035;
        if (clickT >= 1) clickT = -1;
      } else {
        targetRadius = baseRadius;
        targetSpeed  = baseSpeed;
      }

      currentRadius += (targetRadius - currentRadius) * 0.08;
      currentSpeed  += (targetSpeed  - currentSpeed)  * 0.08;
      angle += currentSpeed;

      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

      for (let i = 0; i < text.length; i++) {
        const ca = angle + (i / text.length) * Math.PI * 2;
        ctx.save();
        ctx.translate(mx + Math.cos(ca) * currentRadius, my + Math.sin(ca) * currentRadius);
        ctx.rotate(ca + Math.PI / 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color; ctx.shadowBlur = 6;
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }

      // Center dot
      ctx.save();
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      ro.disconnect();
      canvas.remove();
    };
  }, [container]);

  return null;
}
