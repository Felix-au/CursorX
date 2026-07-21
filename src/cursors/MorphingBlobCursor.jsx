import { useEffect, useRef } from 'react';

const CLICK_COLORS = ['#7c5cfc','#5cf4fc','#fc5cb8','#5cfca8','#fca85c','#ff4455'];
const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function MorphingBlobCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    // SVG gooey filter (append once)
    const svgId = 'blob-filter-cx';
    if (!document.getElementById(svgId)) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', svgId);
      svg.style.cssText = 'position:fixed;top:-999px;left:-999px;width:0;height:0;';
      svg.innerHTML = `<defs><filter id="blob-filter">
        <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur"/>
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/>
      </filter></defs>`;
      document.body.appendChild(svg);
    }

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position:absolute;inset:0;pointer-events:none;z-index:35;
      filter:url(#blob-filter);overflow:hidden;
    `;
    container.appendChild(wrapper);

    let blobEls = [];
    let mx = -200, my = -200;
    let rafId;
    let clickColorIdx = 0;
    let clickColorActive = false;
    let clickColorTimer = null;

    const buildBlobs = () => {
      blobEls.forEach(b => b.el.remove());
      blobEls = [];
      const cfg = configRef.current || {};
      const baseSize = cfg.size ?? 38;
      const color = clickColorActive ? CLICK_COLORS[clickColorIdx] : (cfg.color ?? '#7c5cfc');
      const opacity = cfg.opacity ?? 0.85;
      const trailCount = cfg.trail ?? 6;

      const sizes = [baseSize, ...Array.from({ length: trailCount }, (_, i) => baseSize * 0.7 - i * 3.5)];
      sizes.forEach((sz, i) => {
        const el = document.createElement('div');
        const s = Math.max(sz, 6);
        el.style.cssText = `
          position:absolute; width:${s}px; height:${s}px; border-radius:50%;
          background:${color}; transform:translate(-50%,-50%);
          opacity:${opacity * (1 - i * 0.07)};
          mix-blend-mode:difference;
          transition: background 0.3s, opacity 0.3s;
        `;
        wrapper.appendChild(el);
        blobEls.push({ el, x: -200, y: -200 });
      });
    };
    buildBlobs();

    let prevColor = null, prevSize = null, prevTrail = null, prevOpacity = null;

    const onClick = () => {
      const cfg = configRef.current || {};
      if (!cfg.clickAnim) return;
      clickColorIdx = (clickColorIdx + 1) % CLICK_COLORS.length;
      clickColorActive = true;
      clearTimeout(clickColorTimer);
      clickColorTimer = setTimeout(() => {
        clickColorActive = false;
        const c = configRef.current?.color ?? '#7c5cfc';
        blobEls.forEach(b => { b.el.style.background = c; });
      }, 1200);
      const c = CLICK_COLORS[clickColorIdx];
      blobEls.forEach(b => { b.el.style.background = c; });
    };

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      const cfg = configRef.current || {};

      // Rebuild blobs if key params changed
      if (cfg.color !== prevColor || cfg.size !== prevSize ||
          cfg.trail !== prevTrail || cfg.opacity !== prevOpacity) {
        buildBlobs();
        prevColor = cfg.color; prevSize = cfg.size;
        prevTrail = cfg.trail; prevOpacity = cfg.opacity;
      }

      const lerp = cfg.lerp ?? 0.2;
      const isPointer = cfg.pointerAnim && checkPointer(
        container.getBoundingClientRect().left + mx,
        container.getBoundingClientRect().top  + my
      );

      // Pointer state: more translucent
      const baseOpacity = cfg.opacity ?? 0.85;
      blobEls.forEach((b, i) => {
        const op = isPointer ? baseOpacity * 0.55 : baseOpacity * (1 - i * 0.07);
        b.el.style.opacity = op;
      });

      // Main blob snaps to cursor
      if (blobEls[0]) {
        blobEls[0].x = mx;
        blobEls[0].y = my;
        blobEls[0].el.style.left = `${mx}px`;
        blobEls[0].el.style.top  = `${my}px`;
      }

      // Trail lerp
      for (let i = 1; i < blobEls.length; i++) {
        const prev = blobEls[i - 1];
        blobEls[i].x += (prev.x - blobEls[i].x) * lerp;
        blobEls[i].y += (prev.y - blobEls[i].y) * lerp;
        blobEls[i].el.style.left = `${blobEls[i].x}px`;
        blobEls[i].el.style.top  = `${blobEls[i].y}px`;
      }

      if (!clickColorActive) {
        const col = cfg.color ?? '#7c5cfc';
        blobEls.forEach(b => { if (b.el.style.background !== col) b.el.style.background = col; });
      }

      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(clickColorTimer);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      wrapper.remove();
    };
  }, [container]);

  return null;
}
