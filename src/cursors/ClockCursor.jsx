import { useEffect, useRef } from 'react';

export default function ClockCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let mx = innerWidth / 2, my = innerHeight / 2, raf;

    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize(); window.addEventListener('resize', resize);

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const drawHand = (angle, length, width, color) => {
      ctx.save();
      ctx.rotate(angle - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 4); ctx.lineTo(0, -length);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = new Date();
      const sec = now.getSeconds() + now.getMilliseconds() / 1000;
      const min = now.getMinutes() + sec / 60;
      const hr = (now.getHours() % 12) + min / 60;
      const R = 23;

      ctx.save();
      ctx.translate(mx, my);

      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10,10,20,0.92)'; ctx.fill();
      ctx.strokeStyle = 'rgba(124,92,252,0.85)'; ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(124,92,252,0.5)'; ctx.shadowBlur = 7;
      ctx.stroke();

      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (R - 5), Math.sin(a) * (R - 5));
        ctx.lineTo(Math.cos(a) * (R - 3), Math.sin(a) * (R - 3));
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      drawHand((hr / 12) * Math.PI * 2, R * 0.54, 2.5, 'rgba(240,240,255,0.95)');
      drawHand((min / 60) * Math.PI * 2, R * 0.74, 1.5, 'rgba(200,200,255,0.9)');
      drawHand((sec / 60) * Math.PI * 2, R * 0.82, 1, 'rgba(92,244,252,1)');

      ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'white'; ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
}
