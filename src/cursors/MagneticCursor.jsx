import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function MagneticCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    const dot = document.createElement('div');
    dot.style.cssText = `
      position:absolute; pointer-events:none; z-index:45;
      border-radius:50%; background:${config.color ?? '#fff'};
      transform:translate(-50%,-50%);
      mix-blend-mode:difference;
      transition: background 0.2s;
      will-change: left, top, width, height;
    `;
    container.appendChild(dot);

    // Magnetic elements
    const targets = [...container.querySelectorAll('[data-magnetic]')];
    const states = new Map(targets.map(el => [el, { x: 0, y: 0 }]));

    let mx = -1000, my = -1000;
    let dotX = -1000, dotY = -1000;
    let currentSize, targetSize;
    let clicking = false;
    let clickT = 0;
    let rafId;

    const initSize = () => {
      const s = configRef.current?.size ?? 12;
      currentSize = s;
      targetSize = s;
    };
    initSize();

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      dotX = e.clientX;
      dotY = e.clientY;
    };

    const onDown = () => { clicking = true; clickT = 0; };
    const onUp   = () => { clicking = false; };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mousedown', onDown);
    container.addEventListener('mouseup', onUp);

    // Magnetic attraction loop
    const moveMagnetic = () => {
      const { strength = 0.025 } = configRef.current || {};
      targets.forEach(el => {
        const s = states.get(el);
        const rect = el.getBoundingClientRect();
        const cr = container.getBoundingClientRect();
        const elCX = rect.left - cr.left + rect.width / 2;
        const elCY = rect.top  - cr.top  + rect.height / 2;
        const dx = mx - elCX, dy = my - elCY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          s.x += (dx * strength - s.x) * 0.25; // Tweak: adjust spring stiffness
          s.y += (dy * strength - s.y) * 0.25;
        } else {
          s.x += (0 - s.x) * 0.12;
          s.y += (0 - s.y) * 0.12;
        }
        el.style.transform = `translate(${s.x}px,${s.y}px)`;
      });
    };

    const loop = () => {
      const cfg = configRef.current || {};
      const baseSize = cfg.size ?? 12;

      // Pointer state
      const isPointer = cfg.pointerAnim && checkPointer(dotX, dotY);

      // Click state
      if (clicking && cfg.clickAnim) {
        clickT = Math.min(clickT + 0.15, 1);
      } else {
        clickT = Math.max(clickT - 0.1, 0);
      }

      const clickScale = cfg.clickScale ?? 2.5;
      const pointerScale = cfg.pointerScale ?? 2.0;

      if (clicking && cfg.clickAnim) {
        targetSize = baseSize * (clickScale * Math.sin(clickT * Math.PI) + 1) * 0.8 + baseSize * 0.2;
      } else if (isPointer && cfg.pointerAnim) {
        targetSize = baseSize * pointerScale;
      } else {
        targetSize = baseSize;
      }

      currentSize += (targetSize - currentSize) * 0.18;

      dot.style.width  = `${currentSize}px`;
      dot.style.height = `${currentSize}px`;
      dot.style.background = cfg.color ?? '#ffffff';

      moveMagnetic();
      rafId = requestAnimationFrame(loop);
    };

    const onEnter = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      dotX = e.clientX;
      dotY = e.clientY;
      dot.style.opacity = '1';
      loop();
    };
    const onLeave = () => {
      dot.style.opacity = '0';
      cancelAnimationFrame(rafId);
      targets.forEach(el => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
        el.style.transform = 'translate(0,0)';
        setTimeout(() => { el.style.transition = ''; }, 520);
      });
    };

    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);

    // Dot position
    const posLoop = () => {
      dot.style.left = `${mx}px`;
      dot.style.top  = `${my}px`;
      requestAnimationFrame(posLoop);
    };
    posLoop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mousedown', onDown);
      container.removeEventListener('mouseup', onUp);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      dot.remove();
      targets.forEach(el => { el.style.transform = ''; });
    };
  }, [container]);

  return null;
}
