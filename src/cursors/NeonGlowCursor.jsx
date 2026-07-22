import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const COLORS = ['#7c5cfc', '#5cf4fc', '#fc5cb8', '#5cfca8', '#fca85c'];

export default function NeonGlowCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    const cursor = document.createElement('div');
    cursor.style.cssText = `
      position:absolute; pointer-events:none; z-index:45;
      border-radius:50%; transform:translate(-50%,-50%);
      will-change:left,top,width,height,opacity,box-shadow;
    `;
    container.appendChild(cursor);

    let cx = -1000, cy = -1000;
    let tx = -1000, ty = -1000;
    let colorIdx = 0;
    let currentSize, targetSize;
    let pulseT = 0;
    let rafId;

    const applyColor = (col, sz, glowR) => {
      const { r, g, b } = hexToRgb(col);
      cursor.style.background = col;
      cursor.style.boxShadow = [
        `0 0 ${glowR * 0.3}px 2px rgba(${r},${g},${b},0.95)`,
        `0 0 ${glowR}px ${glowR * 0.4}px rgba(${r},${g},${b},0.55)`,
        `0 0 ${glowR * 2.2}px ${glowR * 0.8}px rgba(${r},${g},${b},0.22)`,
      ].join(',');
      cursor.style.width  = `${sz}px`;
      cursor.style.height = `${sz}px`;
    };

    currentSize = config.size ?? 14;
    targetSize  = currentSize;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
    };

    const onClick = () => {
      const cfg = configRef.current || {};
      if (!cfg.clickAnim) return;
      colorIdx = (colorIdx + 1) % COLORS.length;
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      const cfg = configRef.current || {};
      const baseSize  = cfg.size ?? 14;
      const glowR     = cfg.glowRadius ?? 22;
      const opacity   = cfg.opacity ?? 1.0;
      const pSpeed    = cfg.pulseSpeed ?? 0.9;
      const col       = COLORS[colorIdx]; // honour configured color only on first
      const activeCol = colorIdx === 0 ? (cfg.color ?? COLORS[0]) : COLORS[colorIdx];

      pulseT += 0.016 / pSpeed;

      // Pointer state: rhythmically expand
      const isPointer = cfg.pointerAnim && checkPointer(
        container.getBoundingClientRect().left + tx,
        container.getBoundingClientRect().top  + ty
      );

      const pScale = cfg.pointerScale ?? 2.2;
      // prominent pulse: bigger amplitude
      const pulse = isPointer
        ? 1 + (Math.sin(pulseT * Math.PI * 2) * 0.5 + 0.5) * (pScale - 1)
        : 1 + Math.sin(pulseT * Math.PI * 2) * 0.28;   // ±28% pulse always visible

      targetSize = baseSize * pulse;
      currentSize += (targetSize - currentSize) * 0.12;

      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      cursor.style.left    = `${cx}px`;
      cursor.style.top     = `${cy}px`;
      cursor.style.opacity = String(opacity * (isPointer ? 0.65 : 1));
      applyColor(activeCol, currentSize, glowR);

      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      cursor.remove();
    };
  }, [container]);

  return null;
}
