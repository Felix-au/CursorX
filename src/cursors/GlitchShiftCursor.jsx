import { useEffect, useRef } from 'react';

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
        background:${bg};transform:translate(-50%,-50%);mix-blend-mode:${blend};opacity:0;`;
      container.appendChild(el);
      return el;
    };

    const main = mkEl('white', 15, 'normal');
    const r = mkEl('#ff0000', 12);
    const g = mkEl('#00ff88', 12);
    const b = mkEl('#0055ff', 12);

    let mx = 0, my = 0, glitching = false, gt = 0, raf;
    let interval;

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      mx = e.clientX - rect.left; my = e.clientY - rect.top;
      [main, r, g, b].forEach(el => { el.style.opacity = '1'; });
    };
    const onLeave = () => { [main, r, g, b].forEach(el => { el.style.opacity = '0'; }); };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    const startInterval = () => {
      const { glitchInterval = 2000, burstDuration = 220 } = configRef.current || {};
      interval = setInterval(() => {
        glitching = true; gt = 0;
        setTimeout(() => { glitching = false; }, burstDuration);
      }, glitchInterval);
    };
    startInterval();

    const loop = () => {
      const { split = 4 } = configRef.current || {};
      main.style.left = mx + 'px'; main.style.top = my + 'px';
      if (glitching) {
        gt += 0.55;
        r.style.left = (mx + Math.sin(gt) * split * 3) + 'px'; r.style.top = (my + Math.cos(gt * 1.2) * split) + 'px';
        g.style.left = (mx + Math.sin(gt + 2.1) * split * 2) + 'px'; g.style.top = (my + 2) + 'px';
        b.style.left = (mx + Math.sin(gt + 4.2) * split * 2.5) + 'px'; b.style.top = (my - 2) + 'px';
      } else {
        r.style.left = (mx - split) + 'px'; r.style.top = (my - 1) + 'px';
        g.style.left = mx + 'px'; g.style.top = my + 'px';
        b.style.left = (mx + split) + 'px'; b.style.top = (my + 1) + 'px';
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      clearInterval(interval); cancelAnimationFrame(raf);
      [main, r, g, b].forEach(el => el.remove());
    };
  }, [containerRef]);

  return null;
}
