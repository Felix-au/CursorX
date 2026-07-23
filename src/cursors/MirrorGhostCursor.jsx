import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

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
      el.style.cssText = `position:absolute;pointer-events:none;z-index:38;
        width:${sz}px;height:${sz}px;border-radius:50%;
        border:2px solid ${color}${alpha};transform:translate(-50%,-50%);
        box-shadow:0 0 12px ${color}${Math.round(opacity * 128).toString(16).padStart(2, '0')};
        will-change:left,top,transform,width,height;`;
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
    dot.style.cssText = `position:absolute;pointer-events:none;z-index:40;width:6px;height:6px;border-radius:50%;background:white;transform:translate(-50%,-50%);opacity:0;will-change:left,top,transform;`;
    container.appendChild(dot);

    const positions = ghosts.map(() => ({ x: cx, y: cy }));
    let target = { x: cx, y: cy }, raf;
    let clickT = -1;
    let ghostScale = 1;
    let dotScale = 1;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      target.x = e.clientX - r.left; target.y = e.clientY - r.top;
      dot.style.left = target.x + 'px'; dot.style.top = target.y + 'px';
      dot.style.opacity = '1';
    };
    const onLeave = () => { dot.style.opacity = '0'; };
    const onEnter = () => { dot.style.opacity = '1'; };
    const onClick = () => {
      const { clickAnim = true } = configRef.current || {};
      if (clickAnim) clickT = 0;
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('click', onClick);

    const loop = () => {
      const cfg = configRef.current || {};
      const col = cfg.color ?? '#c45cfc';
      const pointerAnim = cfg.pointerAnim ?? true;
      const pointerScale = cfg.pointerScale ?? 2.2;
      const clickScale = cfg.clickScale ?? 0.8;

      const rect = container.getBoundingClientRect();
      const isPointer = pointerAnim && checkPointer(rect.left + target.x, rect.top + target.y);

      let targetGhostScale = 1.0;
      let targetDotScale = 1.0;

      if (isPointer) {
        targetGhostScale = pointerScale;
        targetDotScale = 0.5;
      }

      if (clickT >= 0) {
        const bounce = Math.sin(clickT * Math.PI);
        targetGhostScale *= (1 - bounce * clickScale * 0.5);
        targetDotScale *= (1 + bounce * clickScale * 1.2);
        clickT += 0.08;
        if (clickT >= 1) clickT = -1;
      }

      ghostScale += (targetGhostScale - ghostScale) * 0.15;
      dotScale += (targetDotScale - dotScale) * 0.15;

      ghosts.forEach((g, i) => {
        const tx = cx + (target.x - cx) * g.sx;
        const ty = cy + (target.y - cy) * g.sy;
        positions[i].x += (tx - positions[i].x) * g.l;
        positions[i].y += (ty - positions[i].y) * g.l;
        g.el.style.left = positions[i].x + 'px'; g.el.style.top = positions[i].y + 'px';
        
        // Apply scaling
        const baseSz = size - (i === 0 ? 0 : i === 3 ? 4 : 2);
        const curSz = Math.max(2, baseSz * ghostScale);
        g.el.style.width = curSz + 'px';
        g.el.style.height = curSz + 'px';

        // live color update
        const opacities = [0.9, 0.5, 0.5, 0.28];
        const a = Math.round(opacities[i] * 255).toString(16).padStart(2, '0');
        g.el.style.borderColor = `${col}${a}`;
      });

      dot.style.transform = `translate(-50%,-50%) scale(${dotScale})`;

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      ghosts.forEach(g => g.el.remove());
      dot.remove();
    };
  }, [containerRef]);

  return null;
}
