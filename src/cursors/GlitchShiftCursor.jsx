import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function GlitchShiftCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const mkEl = (bg, zIndex, blend = 'screen') => {
      const el = document.createElement('div');
      el.style.cssText = `position:absolute;pointer-events:none;z-index:${zIndex};
        width:13px;height:13px;border-radius:50%;
        background:${bg};transform:translate(-50%,-50%);mix-blend-mode:${blend};opacity:0;
        will-change:left,top,width,height,opacity;`;
      container.appendChild(el);
      return el;
    };

    const main = mkEl('white', 15, 'normal');
    const r = mkEl('#ff0000', 12);
    const g = mkEl('#00ff88', 12);
    const b = mkEl('#0055ff', 12);

    let mx = 0, my = 0, glitching = false, gt = 0, raf;
    let interval, clickTimeout;
    let clickBurstActive = false;
    let currentSize = 13;

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      mx = e.clientX - rect.left; my = e.clientY - rect.top;
      [main, r, g, b].forEach(el => { el.style.opacity = '1'; });
    };
    const onLeave = () => { [main, r, g, b].forEach(el => { el.style.opacity = '0'; }); };

    const onClick = () => {
      glitching = true;
      clickBurstActive = true;
      gt = 0;
      if (clickTimeout) clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        clickBurstActive = false;
        glitching = false;
      }, 250);
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('click', onClick);

    const startInterval = () => {
      const { glitchInterval = 500, burstDuration = 300 } = configRef.current || {};
      interval = setInterval(() => {
        if (!clickBurstActive) {
          glitching = true; gt = 0;
          setTimeout(() => { if (!clickBurstActive) glitching = false; }, burstDuration);
        }
      }, glitchInterval);
    };
    startInterval();

    const loop = () => {
      const { split = 5 } = configRef.current || {};
      
      const rect = container.getBoundingClientRect();
      const isPointer = checkPointer(rect.left + mx, rect.top + my);

      const targetSize = isPointer ? 22 : 13;
      currentSize += (targetSize - currentSize) * 0.15;
      [main, r, g, b].forEach(el => {
        el.style.width = currentSize + 'px';
        el.style.height = currentSize + 'px';
      });

      const currentSplit = clickBurstActive ? 22 : split;

      main.style.left = mx + 'px'; main.style.top = my + 'px';
      if (glitching) {
        gt += 0.55;
        r.style.left = (mx + Math.sin(gt) * currentSplit * 3) + 'px'; r.style.top = (my + Math.cos(gt * 1.2) * currentSplit) + 'px';
        g.style.left = (mx + Math.sin(gt + 2.1) * currentSplit * 2) + 'px'; g.style.top = (my + 2) + 'px';
        b.style.left = (mx + Math.sin(gt + 4.2) * currentSplit * 2.5) + 'px'; b.style.top = (my - 2) + 'px';
      } else {
        r.style.left = (mx - currentSplit) + 'px'; r.style.top = (my - 1) + 'px';
        g.style.left = mx + 'px'; g.style.top = my + 'px';
        b.style.left = (mx + currentSplit) + 'px'; b.style.top = (my + 1) + 'px';
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('click', onClick);
      clearInterval(interval);
      if (clickTimeout) clearTimeout(clickTimeout);
      cancelAnimationFrame(raf);
      [main, r, g, b].forEach(el => el.remove());
    };
  }, [containerRef]);

  return null;
}
