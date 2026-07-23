import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function ElasticRingCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    const ring = document.createElement('div');
    ring.style.cssText = `
      position:absolute; pointer-events:none; z-index:45;
      border-radius:50%; border:2px solid ${config.color ?? '#7c5cfc'};
      transform:translate(-50%,-50%);
      box-shadow:0 0 14px ${config.color ?? '#7c5cfc'}66;
      will-change:left,top,transform;
    `;
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:absolute; pointer-events:none; z-index:46;
      width:6px; height:6px; border-radius:50%; background:white;
      transform:translate(-50%,-50%);
    `;
    container.appendChild(ring);
    container.appendChild(dot);

    let mouse = { x: -1000, y: -1000 };
    let pos = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let clickT = -1;     // -1=inactive, 0→1=animating
    let rafId;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      dot.style.left = `${mouse.x}px`;
      dot.style.top = `${mouse.y}px`;
    };

    const onClick = () => {
      if (configRef.current?.clickAnim) clickT = 0;
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      const cfg = configRef.current || {};
      const baseSize = cfg.size ?? 38;
      const stiffness = cfg.stiffness ?? 0.13;
      const damping = cfg.damping ?? 0.76;
      const color = cfg.color ?? '#7c5cfc';

      pos.vx = (pos.vx + (mouse.x - pos.x) * stiffness) * damping;
      pos.vy = (pos.vy + (mouse.y - pos.y) * stiffness) * damping;
      pos.x += pos.vx; pos.y += pos.vy;

      const spd = Math.sqrt(pos.vx ** 2 + pos.vy ** 2);
      const stretch = Math.min(spd * 0.07, 0.55);
      const angle = Math.atan2(pos.vy, pos.vx);

      // Click scale pulse
      let sizeScale = 1;
      if (clickT >= 0 && cfg.clickAnim) {
        sizeScale = 1 + Math.sin(clickT * Math.PI) * ((cfg.clickScale ?? 1.8) - 1);
        clickT += 0.06;
        if (clickT >= 1) clickT = -1;
      }

      // Pointer surround - expand ring to clearly surround element
      const isPointer = cfg.pointerAnim && checkPointer(
        container.getBoundingClientRect().left + mouse.x,
        container.getBoundingClientRect().top + mouse.y
      );
      const targetSz = isPointer ? baseSize * 1.7 : baseSize * sizeScale;

      ring.style.left = `${pos.x}px`;
      ring.style.top = `${pos.y}px`;
      ring.style.width = `${targetSz}px`;
      ring.style.height = `${targetSz}px`;
      ring.style.borderColor = color;
      ring.style.boxShadow = `0 0 14px ${color}66`;
      ring.style.transform = isPointer
        ? `translate(-50%,-50%)`
        : `translate(-50%,-50%) rotate(${angle}rad) scale(${1 + stretch},${1 - stretch * 0.5})`;

      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      ring.remove();
      dot.remove();
    };
  }, [container]);

  return null;
}
