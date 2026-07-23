import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function AudioPulseCursor({ containerRef, config }) {
  const container = containerRef?.current;
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    if (!container) return;

    /* ── DOM elements ───────────────────────────────────── */

    // Dot - snaps directly to mouse, visible from first frame
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:absolute; pointer-events:none; z-index:50;
      width:8px; height:8px;
      border-radius:50%; transform:translate(-50%,-50%);
      background:#00e5ff;
      box-shadow:0 0 8px #00e5ff, 0 0 18px #6366f1;
      will-change:left,top;
    `;
    container.appendChild(dot);

    // Ring - lerp-trails mouse, visible from first frame
    const ring = document.createElement('div');
    ring.style.cssText = `
      position:absolute; pointer-events:none; z-index:49;
      width:36px; height:36px;
      border-radius:50%; transform:translate(-50%,-50%);
      border:1.5px solid rgba(0,229,255,0.6);
      box-shadow:inset 0 0 8px rgba(99,102,241,0.2);
      will-change:left,top;
    `;
    container.appendChild(ring);

    /* ── State - start at container centre ──────────────── */
    let mx = container.clientWidth / 2;
    let my = container.clientHeight / 2;
    let rx = mx, ry = my;
    let dotScale = 1.0;
    let ringScale = 1.0;
    const ripples = [];   // { id, x, y, startTime }
    let rafId;

    /* ── Events ─────────────────────────────────────────── */
    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };

    const onClick = (e) => {
      if ((configRef.current || {}).clickAnim === false) return;
      const r = container.getBoundingClientRect();
      ripples.push({
        id: performance.now() + Math.random(),
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        startTime: performance.now(),
      });
      if (ripples.length > 5) ripples.shift();
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    /* ── RAF loop ───────────────────────────────────────── */
    const loop = (now) => {
      rafId = requestAnimationFrame(loop);
      const cfg = configRef.current || {};

      const dotColor = cfg.dotColor ?? '#00e5ff';
      const ringColor = cfg.ringColor ?? '#00e5ff';
      const glowColor = cfg.glowColor ?? '#6366f1';
      const dotSize = cfg.dotSize ?? 8;
      const ringSize = cfg.ringSize ?? 36;
      const lerpFactor = cfg.ringLerp ?? 0.09;
      const glowBlur = cfg.glowBlur ?? 12;
      const borderWidth = cfg.ringBorderWidth ?? 1.5;
      const pointerAnim = cfg.pointerAnim !== false;
      const pointerRingMult = cfg.pointerRingScale ?? 1.8;
      const pointerDotMult = cfg.pointerDotScale ?? 1.8;
      const rippleMax = cfg.rippleMaxSize ?? 90;

      /* - Pointer check - */
      const rect = container.getBoundingClientRect();
      const isPointer = pointerAnim && checkPointer(rect.left + mx, rect.top + my);

      /* - Scale lerp - */
      dotScale += ((isPointer ? pointerDotMult : 1) - dotScale) * 0.12;
      ringScale += ((isPointer ? pointerRingMult : 1) - ringScale) * 0.12;

      /* - Ring position lerp - */
      rx += (mx - rx) * lerpFactor;
      ry += (my - ry) * lerpFactor;

      /* ── Dot ──────────────────────────────────────────── */
      const ds = dotSize * dotScale;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
      dot.style.width = `${ds}px`;
      dot.style.height = `${ds}px`;
      dot.style.background = dotColor;
      dot.style.boxShadow = `0 0 ${glowBlur * 0.6}px ${dotColor},0 0 ${glowBlur * 1.5}px ${glowColor}`;

      /* ── Ring ─────────────────────────────────────────── */
      const rs = ringSize * ringScale;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      ring.style.width = `${rs}px`;
      ring.style.height = `${rs}px`;
      ring.style.borderWidth = `${borderWidth}px`;
      ring.style.borderStyle = 'solid';
      ring.style.borderColor = isPointer ? dotColor : `${ringColor}99`;
      ring.style.backgroundColor = isPointer ? `${glowColor}1f` : 'transparent';
      ring.style.boxShadow = isPointer
        ? `0 0 ${glowBlur}px ${dotColor}66,inset 0 0 ${glowBlur * 0.8}px ${glowColor}4d`
        : `inset 0 0 ${glowBlur * 0.6}px ${glowColor}26,0 0 ${glowBlur}px ${glowColor}33`;

      /* ── Ripples ──────────────────────────────────────── */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const t = Math.min((now - rp.startTime) / 600, 1);

        // Find or create the ripple element
        let el = container.querySelector(`[data-rp="${rp.id}"]`);
        if (!el) {
          el = document.createElement('div');
          el.dataset.rp = rp.id;
          el.style.cssText = `
            position:absolute; pointer-events:none; z-index:48;
            border-radius:50%; transform:translate(-50%,-50%);
            border:2px solid ${dotColor};
          `;
          container.appendChild(el);
        }

        if (t >= 1) {
          el.remove();
          ripples.splice(i, 1);
          continue;
        }

        const eased = 1 - Math.pow(1 - t, 2); // quadratic ease-out
        const size = 10 + (rippleMax - 10) * eased;
        el.style.left = `${rp.x}px`;
        el.style.top = `${rp.y}px`;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.opacity = String(1 - t);
        el.style.borderColor = t < 0.5 ? dotColor : glowColor;
      }
    };

    // First call is synchronous so the cursor is visible immediately
    loop(performance.now());

    /* ── Cleanup ─────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      dot.remove();
      ring.remove();
      container.querySelectorAll('[data-rp]').forEach(el => el.remove());
    };
  }, [container]);

  return null;
}
