import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function SpotlightCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:35;transition:none;';
    container.appendChild(overlay);

    let mx = container.clientWidth / 2;
    let my = container.clientHeight / 2;
    let currentRadius, baseRadius;
    let pulseT = 0;    // for pointer rhythmic dilation (0→2π continuous)
    let clickT = -1;   // -1 = inactive, 0→1 = animating
    let rafId;

    const updateOverlay = (r) => {
      const cfg = configRef.current || {};
      overlay.style.background = `radial-gradient(
        circle ${r}px at ${mx}px ${my}px,
        transparent 0%,
        rgba(0,0,0,${cfg.darkness ?? 0.90}) 100%
      )`;
    };

    baseRadius = config.radius ?? 160;
    currentRadius = baseRadius;

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
      const cfg = configRef.current || {};
      baseRadius = cfg.radius ?? 160;

      const isPointer = cfg.pointerAnim && checkPointer(
        container.getBoundingClientRect().left + mx,
        container.getBoundingClientRect().top  + my
      );

      let targetRadius = baseRadius;

      if (clickT >= 0) {
        // Single expand-retract pulse on click
        const pulse = Math.sin(clickT * Math.PI);
        targetRadius = baseRadius + pulse * (cfg.clickPulse ?? 70);
        clickT += 0.04;
        if (clickT >= 1) clickT = -1;
      } else if (isPointer) {
        // Rhythmic dilation in pointer state
        pulseT += 0.035;
        const p = cfg.pointerPulse ?? 40;
        targetRadius = baseRadius + Math.sin(pulseT) * p;
      } else {
        pulseT = 0;
      }

      currentRadius += (targetRadius - currentRadius) * 0.1;
      updateOverlay(currentRadius);
      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      overlay.remove();
    };
  }, [container]);

  return null;
}
