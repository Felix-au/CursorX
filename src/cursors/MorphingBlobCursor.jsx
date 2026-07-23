import { useEffect, useRef } from 'react';

const CLICK_COLORS = ['#7c5cfc', '#5cf4fc', '#fc5cb8', '#5cfca8', '#fca85c', '#ff4455'];

const checkPointer = (cx, cy) => {
  const els = document.elementsFromPoint(cx, cy);
  return els.find(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  ) || null;
};

export default function MorphingBlobCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    // SVG gooey filter (append once per document)
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

    // Gooey wrapper - opacity applied here for uniform translucency
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position:absolute;inset:0;pointer-events:none;z-index:35;
      filter:url(#blob-filter);overflow:hidden;
    `;
    container.appendChild(wrapper);

    // Morph overlay - snaps instantly to element, only opacity fades
    const morphOverlay = document.createElement('div');
    morphOverlay.style.cssText = `
      position:absolute;pointer-events:none;z-index:36;
      opacity:0;transition:opacity 0.15s;
    `;
    container.appendChild(morphOverlay);

    let blobEls = [];
    let mx = -200, my = -200;
    let rafId;
    let clickColorIdx = 0;
    let clickColorActive = false;  // permanent until next click

    const getColor = () =>
      clickColorActive ? CLICK_COLORS[clickColorIdx] : (configRef.current?.color ?? '#7c5cfc');

    const buildBlobs = () => {
      blobEls.forEach(b => b.el.remove());
      blobEls = [];
      const cfg = configRef.current || {};
      const baseSize = cfg.size ?? 38;
      const color = getColor();
      const trailCount = cfg.trail ?? 6;
      // All blobs same size as lead - uniform shape
      const trailSize = baseSize * 0.72;
      const sizes = [baseSize, ...Array.from({ length: trailCount }, () => trailSize)];
      sizes.forEach(sz => {
        const el = document.createElement('div');
        const s = Math.max(sz, 6);
        el.style.cssText = `
          position:absolute; width:${s}px; height:${s}px; border-radius:50%;
          background:${color}; transform:translate(-50%,-50%);
          transition: background 0.3s;
        `;
        wrapper.appendChild(el);
        blobEls.push({ el, x: -200, y: -200 });
      });
    };
    buildBlobs();

    let prevColor = null, prevSize = null, prevTrail = null;

    // Track wrapper opacity for smooth transitions
    let wrapperOpacity = 0.65;

    const onClick = () => {
      const cfg = configRef.current || {};
      if (!cfg.clickAnim) return;
      // Permanent toggle: cycle color on each click, stays until next click
      clickColorIdx = (clickColorIdx + 1) % CLICK_COLORS.length;
      clickColorActive = true;
      const c = CLICK_COLORS[clickColorIdx];
      blobEls.forEach(b => { b.el.style.background = c; });
      morphOverlay.style.background = c;
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

      // Rebuild blobs if structural params changed
      if (cfg.color !== prevColor || cfg.size !== prevSize || cfg.trail !== prevTrail) {
        buildBlobs();
        prevColor = cfg.color; prevSize = cfg.size; prevTrail = cfg.trail;
      }

      const lerp = cfg.lerp ?? 0.2;
      const baseOpacity = cfg.opacity ?? 0.65; // default translucent

      // Check what element is under cursor
      const rect = container.getBoundingClientRect();
      const pointerEl = cfg.pointerAnim
        ? checkPointer(rect.left + mx, rect.top + my)
        : null;
      const isPointer = !!pointerEl;

      // Wrapper opacity: more translucent in pointer state
      const targetWrapperOp = isPointer ? baseOpacity * 0.45 : baseOpacity;
      wrapperOpacity += (targetWrapperOp - wrapperOpacity) * 0.1;
      wrapper.style.opacity = String(wrapperOpacity);

      if (isPointer && pointerEl) {
        // Morph overlay: snap immediately to element's shape - no CSS transition on position/size
        const er = pointerEl.getBoundingClientRect();
        const pad = 6;
        const elW = er.width + pad * 2;
        const elH = er.height + pad * 2;
        const elX = er.left - rect.left;
        const elY = er.top - rect.top;
        const elBr = getComputedStyle(pointerEl).borderRadius || '6px';
        const col = getColor();

        // Snap position/size without transition
        morphOverlay.style.transition = 'opacity 0.15s';
        morphOverlay.style.left = `${elX - pad}px`;
        morphOverlay.style.top = `${elY - pad}px`;
        morphOverlay.style.width = `${elW}px`;
        morphOverlay.style.height = `${elH}px`;
        morphOverlay.style.borderRadius = elBr;
        morphOverlay.style.background = col;
        morphOverlay.style.opacity = String(baseOpacity * 0.55);

        // Hide gooey wrapper while morphed
        wrapper.style.opacity = '0';
      } else {
        morphOverlay.style.opacity = '0';
        wrapper.style.opacity = String(wrapperOpacity);
      }

      // Sync blob colors
      if (!clickColorActive) {
        const col = cfg.color ?? '#7c5cfc';
        blobEls.forEach(b => { if (b.el.style.background !== col) b.el.style.background = col; });
        morphOverlay.style.background = col;
      }

      // Main blob snaps to cursor
      if (blobEls[0]) {
        blobEls[0].x = mx;
        blobEls[0].y = my;
        blobEls[0].el.style.left = `${mx}px`;
        blobEls[0].el.style.top = `${my}px`;
      }

      // Trail lerp
      for (let i = 1; i < blobEls.length; i++) {
        const prev = blobEls[i - 1];
        blobEls[i].x += (prev.x - blobEls[i].x) * lerp;
        blobEls[i].y += (prev.y - blobEls[i].y) * lerp;
        blobEls[i].el.style.left = `${blobEls[i].x}px`;
        blobEls[i].el.style.top = `${blobEls[i].y}px`;
      }

      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      wrapper.remove();
      morphOverlay.remove();
    };
  }, [container]);

  return null;
}
