import { useEffect, useRef } from 'react';

export default function TorchLightCursor({ containerRef, config }) {
  const overlayRef = useRef(null);
  const flameRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const container = containerRef?.current;
    const overlay = overlayRef.current;
    const flame = flameRef.current;
    if (!container || !overlay || !flame) return;

    let tx = container.offsetWidth / 2, ty = container.offsetHeight / 2;
    let cx = tx, cy = ty, flickPhase = 0, raf;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      flame.style.left = tx + 'px'; flame.style.top = ty + 'px';
      flame.style.opacity = '1';
    };
    const onLeave = () => { flame.style.opacity = '0'; };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    const loop = () => {
      const { radius = 140, darkness = 0.91, flickerIntensity = 9 } = configRef.current || {};
      cx += (tx - cx) * 0.11; cy += (ty - cy) * 0.11;
      flickPhase += 0.09;
      const flick = Math.sin(flickPhase) * flickerIntensity + Math.sin(flickPhase * 2.4) * flickerIntensity * 0.44;
      const r = radius + flick;
      overlay.style.background = `radial-gradient(circle ${r}px at ${cx}px ${cy}px,
        rgba(255,120,18,0.09) 0%,rgba(255,80,0,0.04) 38%,
        rgba(0,0,0,${darkness}) 72%,rgba(0,0,0,${Math.min(darkness + 0.06, 1)}) 100%)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return (
    <>
      <div ref={overlayRef} style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 35,
        borderRadius: 'inherit', background: 'rgba(0,0,0,0.85)',
      }} />
      <div ref={flameRef} style={{
        position: 'absolute', pointerEvents: 'none', zIndex: 40, opacity: 0,
        width: 9, height: 9, borderRadius: '50%', background: '#ffb347',
        boxShadow: '0 0 14px 5px rgba(255,140,20,0.65)',
        transform: 'translate(-50%,-50%)',
      }} />
    </>
  );
}
