import { useEffect, useRef } from 'react';

export default function MatrixRainCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const FS = 14;
    const CHARS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF</>{}[]=>|';
    let cols, drops, mx = 0, my = 0, raf;

    const init = () => {
      canvas.width = innerWidth; canvas.height = innerHeight;
      cols = Math.floor(canvas.width / FS);
      drops = Array(cols).fill(1);
    };
    init();
    window.addEventListener('resize', init);

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = FS + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const x = i * FS;
        const distX = Math.abs(x - mx);
        const bri = distX < 60 ? 1 : distX < 130 ? 0.55 : 0.22;
        const g = Math.floor(210 * bri);
        const b = Math.floor(90 * bri);
        ctx.fillStyle = `rgba(0,${g},${b},${bri})`;
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, x, drops[i] * FS);

        const reset = distX < 80 ? 0.045 : 0.012;
        if (drops[i] * FS > canvas.height && Math.random() < reset) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997 }} />;
}
