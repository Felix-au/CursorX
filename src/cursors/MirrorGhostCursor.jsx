import { useEffect, useRef } from 'react';

export default function MirrorGhostCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const { color = '#c45cfc', size = 20, lerp = 0.14 } = configRef.current || {};
    const cx = container.offsetWidth / 2, cy = container.offsetHeight / 2;

    const makeGhost = (opacity, sz) => {
      const el = document.createElement('div');
      const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
      el.style.cssText = `position:absolute;pointer-events:none;z-index:8;
        width:${sz}px;height:${sz}px;border-radius:50%;
        border:2px solid ${color}${alpha};transform:translate(-50%,-50%);
        box-shadow:0 0 12px ${color}${Math.round(opacity * 128).toString(16).padStart(2, '0')};`;
      container.appendChild(el);
      return el;
    };

    const ghosts = [
      { el: makeGhost(0.9, size), sx: 1, sy: 1, l: 1 },
      { el: makeGhost(0.5, size - 2), sx: -1, sy: 1, l: lerp },
      { el: makeGhost(0.5, size - 2), sx: 1, sy: -1, l: lerp },
      { el: makeGhost(0.28, size - 4), sx: -1, sy: -1, l: lerp * 0.7 },
    ];
    const dot = document.createElement('div');
    dot.style.cssText = `position:absolute;pointer-events:none;z-index:10;width:6px;height:6px;border-radius:50%;background:white;transform:translate(-50%,-50%);opacity:0;`;
    container.appendChild(dot);

    const positions = ghosts.map(() => ({ x: cx, y: cy }));
    let target = { x: cx, y: cy }, raf;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      target.x = e.clientX - r.left; target.y = e.clientY - r.top;
      dot.style.left = target.x + 'px'; dot.style.top = target.y + 'px';
      dot.style.opacity = '1';
    };
    const onLeave = () => { dot.style.opacity = '0'; };
    const onEnter = () => { dot.style.opacity = '1'; };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('mouseenter', onEnter);

    const loop = () => {
      // Update ghost colors live
      const { color: col = '#c45cfc' } = configRef.current || {};
      ghosts.forEach((g, i) => {
        const tx = cx + (target.x - cx) * g.sx;
        const ty = cy + (target.y - cy) * g.sy;
        positions[i].x += (tx - positions[i].x) * g.l;
        positions[i].y += (ty - positions[i].y) * g.l;
        g.el.style.left = positions[i].x + 'px'; g.el.style.top = positions[i].y + 'px';
        // live color update
        const opacities = [0.9, 0.5, 0.5, 0.28];
        const a = Math.round(opacities[i] * 255).toString(16).padStart(2, '0');
        g.el.style.borderColor = `${col}${a}`;
      });
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf);
      ghosts.forEach(g => g.el.remove());
      dot.remove();
    };
  }, [containerRef]);

  return null;
}
