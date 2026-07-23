import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function FluidGlassCursor({ containerRef, config }) {
  const container = containerRef?.current;
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    if (!container) return;

    /* ── Build lens shell ───────────────────────────────── */

    // Lens: circular clip wrapper, marked so clones strip it out
    const lens = document.createElement('div');
    lens.setAttribute('data-fluid-glass', '1');
    lens.style.cssText = `
      position:absolute; pointer-events:none; z-index:55;
      border-radius:50%; overflow:hidden;
      transform:translate(-50%,-50%);
      will-change:left,top,width,height;
    `;
    container.appendChild(lens);

    // Glass overlay: convex highlight + rim, floats above the magnified clone
    const glassOverlay = document.createElement('div');
    glassOverlay.style.cssText = `
      position:absolute; inset:0; z-index:2; pointer-events:none;
      border-radius:50%;
    `;
    lens.appendChild(glassOverlay);

    /* ── Clone management ───────────────────────────────── */
    let cloneView = null;

    const buildClone = () => {
      // Guard: if lens has been removed (component unmounted) do nothing
      if (!lens.isConnected) return;

      const prevClone = cloneView;

      // Fresh DOM snapshot of the preview container
      const clone = container.cloneNode(true);

      // Strip: blank canvas elements, and the lens itself (identified by data attr)
      clone.querySelectorAll('canvas, [data-fluid-glass]').forEach(el => el.remove());

      // Override container's own positioning/overflow so we control it from here
      clone.style.cssText = `
        position:absolute;
        overflow:visible;
        pointer-events:none;
        cursor:none;
        width:${container.clientWidth}px;
        height:${container.clientHeight}px;
        transform-origin:0 0;
        z-index:1;
        flex-shrink:0;
      `;

      // Insert new clone BEFORE removing the old one → zero-flash transition
      lens.insertBefore(clone, glassOverlay);
      cloneView = clone;

      if (prevClone && prevClone.parentNode === lens) {
        lens.removeChild(prevClone);
      }
    };

    // Initial clone + periodic refresh to pick up live DOM changes (typed text, checkboxes, etc.)
    buildClone();
    const recloneInterval = setInterval(buildClone, 1000);

    /* ── State ────────────────────────────────────────────── */
    let mx = container.clientWidth  / 2;
    let my = container.clientHeight / 2;
    let lx = mx, ly = my;   // lerped lens center
    let hoverScale = 1.0;   // smooth lerp for pointer size boost
    let sizeScale  = 1.0;   // spring scale for click expand/retract
    let clickT = -1;
    let rafId;

    /* ── Events ─────────────────────────────────────────── */
    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };

    const onClick = () => {
      if ((configRef.current || {}).clickAnim !== false) clickT = 0;
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    /* ── RAF loop ───────────────────────────────────────── */
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const cfg = configRef.current || {};

      const baseSize      = cfg.lensSize         ?? 50;
      const baseZoom      = cfg.zoomLevel        ?? 1.2;
      const lerpSpeed     = cfg.lerpSpeed        ?? 0.1;
      const glassOpac     = cfg.glassOpacity     ?? 0.3;
      const rimStr        = cfg.rimStrength      ?? 0.0;
      const pointerAnim   = cfg.pointerAnim      !== false;
      const sizeBoost     = cfg.pointerSizeBoost ?? 1.25;
      const clickAnimOn   = cfg.clickAnim        !== false;
      const clickExp      = cfg.clickExpand      ?? 1.5;

      /* — Lerp lens position — */
      lx += (mx - lx) * lerpSpeed;
      ly += (my - ly) * lerpSpeed;

      /* — Pointer check — */
      const rect = container.getBoundingClientRect();
      const isPointer = pointerAnim && checkPointer(rect.left + mx, rect.top + my);

      /* — Smooth hover size lerp — */
      const targetHoverScale = isPointer ? sizeBoost : 1.0;
      hoverScale += (targetHoverScale - hoverScale) * 0.12;

      /* — Click expand → spring retract animation — */
      if (clickT >= 0 && clickAnimOn) {
        sizeScale = 1 + Math.sin(clickT * Math.PI) * (clickExp - 1);
        clickT += 0.04;
        if (clickT >= 1) { sizeScale = 1; clickT = -1; }
      } else {
        sizeScale = 1;
      }

      // Hover grows the lens size; click also grows it (independently)
      // Zoom is kept constant for hover (only click divides zoom to prevent content jump)
      const size = baseSize * hoverScale * sizeScale;
      const r    = size / 2;
      const zoom = baseZoom / sizeScale;

      /* ── Lens position + size ─────────────────────────── */
      lens.style.left   = `${lx}px`;
      lens.style.top    = `${ly}px`;
      lens.style.width  = `${size}px`;
      lens.style.height = `${size}px`;

      // Drop shadow + optional hover glow ring
      lens.style.boxShadow = isPointer
        ? `0 8px 28px rgba(0,0,0,0.45),0 2px 6px rgba(0,0,0,0.3),0 0 0 2px rgba(255,255,255,0.35),0 0 18px rgba(255,255,255,0.18)`
        : `0 8px 28px rgba(0,0,0,0.45),0 2px 6px rgba(0,0,0,0.3)`;

      /* ── Clone magnification ──────────────────────────── */
      // With transform:scale(zoom) and transform-origin:0 0:
      //   clone coords → lens coords via:  (cx*zoom + left, cy*zoom + top)
      // We want clone point (lx, ly) to appear at lens centre (r, r):
      //   r = lx*zoom + left  ⟹  left = r - lx*zoom
      //   r = ly*zoom + top   ⟹  top  = r - ly*zoom
      if (cloneView) {
        cloneView.style.left      = `${r - lx * zoom}px`;
        cloneView.style.top       = `${r - ly * zoom}px`;
        cloneView.style.transform = `scale(${zoom})`;
      }

      /* ── Glass overlay: convex highlight + rim shadows ── */
      const rimW = Math.max(1, size * 0.018);
      const topGlowY  = Math.max(1, size * 0.025);
      const topGlowB  = Math.max(3, size * 0.07);
      const botGlowY  = Math.max(1, size * 0.02);
      const botGlowB  = Math.max(3, size * 0.06);

      glassOverlay.style.background = `
        radial-gradient(
          circle at 35% 32%,
          rgba(255,255,255,${glassOpac})   0%,
          rgba(255,255,255,${glassOpac * 0.28}) 36%,
          rgba(255,255,255,0.015)           60%,
          transparent                        72%
        )
      `;
      glassOverlay.style.boxShadow = `
        inset 0 0 0 ${rimW}px rgba(255,255,255,${rimStr}),
        inset 0 ${topGlowY}px ${topGlowB}px rgba(255,255,255,${rimStr * 0.65}),
        inset 0 -${botGlowY}px ${botGlowB}px rgba(0,0,0,0.15)
      `;
    };

    loop();

    /* ── Cleanup ─────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(recloneInterval);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      lens.remove();
    };
  }, [container]);

  return null;
}
