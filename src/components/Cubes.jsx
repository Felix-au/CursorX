import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Cubes.css';

export default function Cubes({
  rows = 7,
  cols = 14,
  cubeSize = 57,
  maxAngle = 90,
  radius = 3,
  easing = 'power3.out',
  duration = { enter: 0.3, leave: 0.6 },
  cellGap = 31,
  borderStyle = '1px dashed #5cf4fc',
  faceColor = '#000000',
  shadow = false,
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = '#5cf4fc',
  rippleSpeed = 2,
  isHero = true
}) {
  const sceneRef = useRef(null);
  const rafRef = useRef(null);
  const idleTimerRef = useRef(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const simRAFRef = useRef(null);

  const colGapStr = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.col !== undefined ? `${cellGap.col}px` : '18px';
  const rowGapStr = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.row !== undefined ? `${cellGap.row}px` : '18px';

  const enterDur = duration.enter;
  const leaveDur = duration.leave;

  const tiltAt = useCallback(
    (rowCenter, colCenter) => {
      if (!sceneRef.current) return;
      sceneRef.current.querySelectorAll('.cube').forEach(cube => {
        const r = +cube.dataset.row;
        const c = +cube.dataset.col;
        const dist = Math.hypot(r - rowCenter, c - colCenter);
        const sides = cube.querySelectorAll('.cube-face-side');

        if (dist <= radius) {
          const pct = 1 - dist / radius;
          const angle = pct * maxAngle;
          gsap.to(cube, {
            duration: enterDur,
            ease: easing,
            overwrite: true,
            rotateX: -angle,
            rotateY: angle
          });
          gsap.to(sides, {
            duration: enterDur,
            opacity: Math.min(1, pct * 1.5),
            overwrite: true
          });
        } else {
          gsap.to(cube, {
            duration: leaveDur,
            ease: 'power3.out',
            overwrite: true,
            rotateX: 0,
            rotateY: 0
          });
          gsap.to(sides, {
            duration: leaveDur,
            opacity: 0,
            overwrite: true
          });
        }
      });
    },
    [radius, maxAngle, enterDur, leaveDur, easing]
  );

  const triggerRipple = useCallback(
    (rowHit, colHit) => {
      if (!sceneRef.current) return;

      const baseRingDelay = 0.15;
      const baseAnimDur = 0.3;
      const baseHold = 0.6;

      const spreadDelay = baseRingDelay / rippleSpeed;
      const animDuration = baseAnimDur / rippleSpeed;
      const holdTime = baseHold / rippleSpeed;

      const rings = {};
      sceneRef.current.querySelectorAll('.cube').forEach(cube => {
        const r = +cube.dataset.row;
        const c = +cube.dataset.col;
        const dist = Math.hypot(r - rowHit, c - colHit);
        const ring = Math.round(dist);
        if (!rings[ring]) rings[ring] = [];
        rings[ring].push(cube);
      });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(ring => {
          const delay = ring * spreadDelay;
          const faces = rings[ring].flatMap(cube => Array.from(cube.querySelectorAll('.cube-face')));

          gsap.to(faces, {
            backgroundColor: rippleColor,
            duration: animDuration,
            delay,
            ease: 'power3.out'
          });
          gsap.to(faces, {
            backgroundColor: faceColor,
            duration: animDuration,
            delay: delay + animDuration + holdTime,
            ease: 'power3.out'
          });
        });
    },
    [faceColor, rippleColor, rippleSpeed]
  );

  const onPointerMove = useCallback(
    e => {
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / cols;
      const cellH = rect.height / rows;
      const colCenter = (e.clientX - rect.left) / cellW;
      const rowCenter = (e.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [cols, rows, tiltAt]
  );

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.querySelectorAll('.cube').forEach(cube => {
      gsap.to(cube, {
        duration: leaveDur,
        rotateX: 0,
        rotateY: 0,
        ease: 'power3.out'
      });
      gsap.to(cube.querySelectorAll('.cube-face-side'), {
        duration: leaveDur,
        opacity: 0,
        ease: 'power3.out'
      });
    });
  }, [leaveDur]);

  const onTouchMove = useCallback(
    e => {
      e.preventDefault();
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / cols;
      const cellH = rect.height / rows;

      const touch = e.touches[0];
      const colCenter = (touch.clientX - rect.left) / cellW;
      const rowCenter = (touch.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [cols, rows, tiltAt]
  );

  const onTouchStart = useCallback(() => {
    userActiveRef.current = true;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!sceneRef.current) return;
    resetAll();
  }, [resetAll]);

  const onClick = useCallback(
    e => {
      if (!rippleOnClick || !sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / cols;
      const cellH = rect.height / rows;

      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

      const colHit = Math.floor((clientX - rect.left) / cellW);
      const rowHit = Math.floor((clientY - rect.top) / cellH);

      triggerRipple(rowHit, colHit);
    },
    [rippleOnClick, cols, rows, triggerRipple]
  );

  // Trigger one initial ripple wave 1.5 seconds into website initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      const centerRow = Math.floor(rows / 2);
      const centerCol = Math.floor(cols / 2);
      triggerRipple(centerRow, centerCol);
    }, 1500);

    return () => clearTimeout(timer);
  }, [rows, cols, triggerRipple]);

  useEffect(() => {
    if (!autoAnimate || !sceneRef.current) return;
    simPosRef.current = {
      x: Math.random() * cols,
      y: Math.random() * rows
    };
    simTargetRef.current = {
      x: Math.random() * cols,
      y: Math.random() * rows
    };
    const speed = 0.02;
    const loop = () => {
      if (!userActiveRef.current) {
        const pos = simPosRef.current;
        const tgt = simTargetRef.current;
        pos.x += (tgt.x - pos.x) * speed;
        pos.y += (tgt.y - pos.y) * speed;
        tiltAt(pos.y, pos.x);
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          simTargetRef.current = {
            x: Math.random() * cols,
            y: Math.random() * rows
          };
        }
      }
      simRAFRef.current = requestAnimationFrame(loop);
    };
    simRAFRef.current = requestAnimationFrame(loop);
    return () => {
      if (simRAFRef.current != null) {
        cancelAnimationFrame(simRAFRef.current);
      }
    };
  }, [autoAnimate, cols, rows, tiltAt]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const handleGlobalPointerMove = (e) => {
      onPointerMove(e);
    };

    const handleGlobalClick = (e) => {
      onClick(e);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('click', handleGlobalClick);

    el.addEventListener('pointerleave', resetAll);
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('click', handleGlobalClick);

      el.removeEventListener('pointerleave', resetAll);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [onPointerMove, resetAll, onClick, onTouchMove, onTouchStart, onTouchEnd]);

  const rowsArr = Array.from({ length: rows });
  const colsArr = Array.from({ length: cols });

  const sceneStyle = {
    gridTemplateColumns: `repeat(${cols}, ${cubeSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cubeSize}px)`,
    columnGap: colGapStr,
    rowGap: rowGapStr
  };
  const wrapperStyle = {
    '--cube-face-border': borderStyle,
    '--cube-face-bg': faceColor,
    '--cube-face-shadow': shadow === true ? '0 0 6px rgba(0,0,0,.5)' : shadow || 'none',
    transform: isHero ? 'translateY(24px)' : 'translateY(0px)'
  };

  return (
    <div className="cubes-bg-wrapper">
      <div className="default-animation" style={wrapperStyle}>
        <div ref={sceneRef} className="default-animation--scene" style={sceneStyle}>
          {rowsArr.map((_, r) =>
            colsArr.map((__, c) => (
              <div key={`${r}-${c}`} className="cube" data-row={r} data-col={c}>
                <div className="cube-face cube-face--front" />
                <div className="cube-face cube-face-side cube-face--top" />
                <div className="cube-face cube-face-side cube-face--bottom" />
                <div className="cube-face cube-face-side cube-face--left" />
                <div className="cube-face cube-face-side cube-face--right" />
                <div className="cube-face cube-face-side cube-face--back" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
