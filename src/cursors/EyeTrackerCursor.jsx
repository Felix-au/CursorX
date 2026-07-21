import { useEffect, useRef } from 'react';

const NS = 'http://www.w3.org/2000/svg';

export default function EyeTrackerCursor() {
  const containerRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const dot = dotRef.current;
    const eyes = [];

    const createEye = (x, y, size) => {
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', size);
      svg.setAttribute('height', size * 0.62);
      svg.setAttribute('viewBox', '0 0 40 25');
      svg.style.cssText = `position:absolute;pointer-events:none;left:${x}px;top:${y}px;transform:translate(-50%,-50%);`;

      const outer = document.createElementNS(NS, 'ellipse');
      outer.setAttribute('cx', 20); outer.setAttribute('cy', 12.5);
      outer.setAttribute('rx', 17); outer.setAttribute('ry', 11);
      outer.setAttribute('fill', 'white');
      outer.setAttribute('stroke', 'rgba(20,20,40,0.6)'); outer.setAttribute('stroke-width', '1.2');

      const pupil = document.createElementNS(NS, 'circle');
      pupil.setAttribute('cx', 20); pupil.setAttribute('cy', 12.5); pupil.setAttribute('r', 7);
      pupil.setAttribute('fill', '#0d0d1a');

      const iris = document.createElementNS(NS, 'circle');
      iris.setAttribute('cx', 20); iris.setAttribute('cy', 12.5); iris.setAttribute('r', 5);
      iris.setAttribute('fill', '#7c5cfc');

      const glint = document.createElementNS(NS, 'circle');
      glint.setAttribute('cx', 22); glint.setAttribute('cy', 10.5); glint.setAttribute('r', 1.8);
      glint.setAttribute('fill', 'white'); glint.setAttribute('opacity', '0.85');

      const dot2 = document.createElementNS(NS, 'circle');
      dot2.setAttribute('cx', 20); dot2.setAttribute('cy', 12.5); dot2.setAttribute('r', 2.8);
      dot2.setAttribute('fill', '#000');

      svg.append(outer, pupil, iris, dot2, glint);
      container.appendChild(svg);

      return {
        svg, cx: x, cy: y,
        pupil, iris, dot2, glint,
        update(mx, my) {
          const dx = mx - this.cx, dy = my - this.cy;
          const a = Math.atan2(dy, dx);
          const d = Math.sqrt(dx * dx + dy * dy);
          const t = Math.min(d / 120, 1) * 5;
          const ox = Math.cos(a) * t, oy = Math.sin(a) * t;
          [this.pupil, this.iris, this.dot2].forEach(el => {
            el.setAttribute('cx', 20 + ox);
            el.setAttribute('cy', 12.5 + oy);
          });
          this.glint.setAttribute('cx', 22 + ox);
          this.glint.setAttribute('cy', 10.5 + oy);
        }
      };
    };

    // 12 eyes in a grid
    for (let i = 0; i < 12; i++) {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 100 + col * (innerWidth / 4 - 35);
      const y = 120 + row * (innerHeight / 3 - 50);
      eyes.push(createEye(x, y, 52 + Math.random() * 20));
    }

    let mx = 0, my = 0, raf;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    };
    window.addEventListener('mousemove', onMove);

    const loop = () => {
      eyes.forEach(e => e.update(mx, my));
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997 }}
      />
      <div ref={dotRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9999,
        width: 9, height: 9, borderRadius: '50%',
        background: 'white', transform: 'translate(-50%,-50%)',
        boxShadow: '0 0 6px rgba(255,255,255,0.5)',
      }} />
    </>
  );
}
