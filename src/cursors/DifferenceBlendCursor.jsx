import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function DifferenceBlendCursor({ containerRef, config }) {
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);
  const container = containerRef?.current;

  useEffect(() => {
    if (!container) return;

    // Create big ball element
    const bigBall = document.createElement('div');
    bigBall.style.cssText = `
      position:absolute; pointer-events:none; z-index:40;
      mix-blend-mode:difference; transform:translate(-50%,-50%);
      will-change:left,top,transform; display:flex; align-items:center; justify-content:center;
    `;
    const bigSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const bigCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bigSvg.appendChild(bigCircle);
    bigBall.appendChild(bigSvg);
    container.appendChild(bigBall);

    // Create small ball element
    const smallBall = document.createElement('div');
    smallBall.style.cssText = `
      position:absolute; pointer-events:none; z-index:41;
      mix-blend-mode:difference; transform:translate(-50%,-50%);
      will-change:left,top,transform; display:flex; align-items:center; justify-content:center;
    `;
    const smallSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const smallCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    smallSvg.appendChild(smallCircle);
    smallBall.appendChild(smallSvg);
    container.appendChild(smallBall);

    let mx = -200, my = -200;
    let bx = -200, by = -200;
    let sx = -200, sy = -200;
    let bigScale = 1;
    let smallScale = 1;
    let clickT = -1;
    let rafId;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };

    const onClick = () => {
      const cfg = configRef.current || {};
      if (cfg.clickAnim) {
        clickT = 0;
      }
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    const loop = () => {
      const cfg = configRef.current || {};
      const color = cfg.color ?? '#f7f8fa';
      const bigSize = cfg.bigSize ?? 30;
      const smallSize = cfg.smallSize ?? 10;
      const bigSpeed = cfg.bigSpeed ?? 0.1;
      const smallSpeed = cfg.smallSpeed ?? 0.25;
      const pScale = cfg.pointerScale ?? 3.0;

      // Update SVGs attributes based on configured sizes
      bigSvg.setAttribute('width', String(bigSize));
      bigSvg.setAttribute('height', String(bigSize));
      bigCircle.setAttribute('cx', String(bigSize / 2));
      bigCircle.setAttribute('cy', String(bigSize / 2));
      bigCircle.setAttribute('r', String(bigSize / 2 - 1));
      bigCircle.setAttribute('fill', color);

      smallSvg.setAttribute('width', String(smallSize));
      smallSvg.setAttribute('height', String(smallSize));
      smallCircle.setAttribute('cx', String(smallSize / 2));
      smallCircle.setAttribute('cy', String(smallSize / 2));
      smallCircle.setAttribute('r', String(smallSize / 2 - 1));
      smallCircle.setAttribute('fill', color);

      // Check pointer status
      const rect = container.getBoundingClientRect();
      const isPointer = cfg.pointerAnim && checkPointer(rect.left + mx, rect.top + my);

      // Scale targets
      let targetBigScale = 1;
      let targetSmallScale = 1;

      if (isPointer) {
        targetBigScale = pScale;
        targetSmallScale = 0.5; // shrink the inner dot slightly to emphasize outer expansion
      }

      // Handle click animation
      if (clickT >= 0) {
        const bounce = Math.sin(clickT * Math.PI);
        const clickScaleFactor = cfg.clickScale ?? 0.6;
        targetBigScale *= (1 - bounce * clickScaleFactor);
        targetSmallScale *= (1 + bounce * clickScaleFactor * 1.5);
        clickT += 0.08;
        if (clickT >= 1) clickT = -1;
      }

      // Smooth interpolation for scales
      bigScale += (targetBigScale - bigScale) * 0.15;
      smallScale += (targetSmallScale - smallScale) * 0.15;

      // Smooth interpolation for positions
      bx += (mx - bx) * bigSpeed;
      by += (my - by) * bigSpeed;

      sx += (mx - sx) * smallSpeed;
      sy += (my - sy) * smallSpeed;

      // Apply styles
      bigBall.style.left = `${bx}px`;
      bigBall.style.top = `${by}px`;
      bigBall.style.transform = `translate(-50%,-50%) scale(${bigScale})`;

      smallBall.style.left = `${sx}px`;
      smallBall.style.top = `${sy}px`;
      smallBall.style.transform = `translate(-50%,-50%) scale(${smallScale})`;

      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      bigBall.remove();
      smallBall.remove();
    };
  }, [container]);

  return null;
}
