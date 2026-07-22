import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function GravityPullCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    // Cursor ring
    const ring = document.createElement('div');
    ring.style.cssText = `
      position:absolute; pointer-events:none; z-index:45;
      width:36px; height:36px; border-radius:50%;
      border:2px solid ${config.color ?? '#5cf4fc'};
      transform:translate(-50%,-50%);
      box-shadow: 0 0 12px ${config.color ?? '#5cf4fc'}55;
      will-change:left,top,width,height;
    `;
    container.appendChild(ring);

    // Physics targets
    const targets = [...container.querySelectorAll('[data-gravity]')];
    const states  = new Map(targets.map(el => [el, { x:0, y:0, vx:0, vy:0 }]));

    let mx = -5000, my = -5000;
    let ringW = 36, targetRingW = 36;
    let pulseT = 0;
    let clickFlash = false, clickFlashT = 0;
    let rafId;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    const onClick = () => { if (configRef.current?.clickAnim) { clickFlash = true; clickFlashT = 0; } };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      const cfg = configRef.current || {};
      const strength = cfg.strength ?? 25000;
      const radius   = cfg.radius   ?? 220;
      const damping  = cfg.damping  ?? 0.84;
      const color    = cfg.color    ?? '#5cf4fc';

      // Update ring position
      ring.style.left  = `${mx}px`;
      ring.style.top   = `${my}px`;
      ring.style.borderColor = color;
      ring.style.boxShadow   = `0 0 12px ${color}55`;

      // Pointer ring pulse
      const isPointer = cfg.pointerAnim && checkPointer(
        container.getBoundingClientRect().left + mx,
        container.getBoundingClientRect().top  + my
      );
      if (isPointer) {
        pulseT += 0.05;
        targetRingW = 36 + Math.sin(pulseT) * 10;
      } else {
        pulseT = 0; targetRingW = 36;
      }
      ringW += (targetRingW - ringW) * 0.12;

      // Click flash: ring expands, fades, reappears
      if (clickFlash && cfg.clickAnim) {
        clickFlashT += 0.07;
        const flashScale = 1 + Math.sin(clickFlashT * Math.PI * 0.7) * 0.9;
        ring.style.width   = `${ringW * flashScale}px`;
        ring.style.height  = `${ringW * flashScale}px`;
        ring.style.opacity = String(Math.max(0, 1 - clickFlashT));
        if (clickFlashT >= 1) { clickFlash = false; ring.style.opacity = '1'; }
      } else {
        ring.style.width  = `${ringW}px`;
        ring.style.height = `${ringW}px`;
      }

      // DOM physics — gravity
      targets.forEach(el => {
        const s = states.get(el);
        const rect = el.getBoundingClientRect();
        const cr   = container.getBoundingClientRect();
        const ex   = rect.left - cr.left + rect.width  / 2 + s.x;
        const ey   = rect.top  - cr.top  + rect.height / 2 + s.y;
        const dx   = mx - ex, dy = my - ey;
        const dist = Math.max(Math.sqrt(dx*dx + dy*dy), 1);
        if (dist < radius) {
          const f = Math.min(strength / (dist * dist), 200);  // raised cap: buttons now visibly attracted
          s.vx += (dx / dist) * f * 0.016;
          s.vy += (dy / dist) * f * 0.016;
        }
        s.vx -= s.x * 0.09; s.vy -= s.y * 0.09;
        s.vx *= damping;     s.vy *= damping;
        s.x  += s.vx;        s.y  += s.vy;
        el.style.transform = `translate(${s.x}px,${s.y}px)`;
      });

      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      ring.remove();
      targets.forEach(el => { el.style.transform = ''; });
    };
  }, [container]);

  return null;
}
