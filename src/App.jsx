import { useState, useRef, useEffect, useCallback } from 'react';
import { CURSORS } from './data/cursors.js';
import HeroSlide from './components/HeroSlide.jsx';
import CursorSlide from './components/CursorSlide.jsx';
import NavDots from './components/NavDots.jsx';

const TOTAL = CURSORS.length; // 22

export default function App() {
  const [current, setCurrent] = useState(0);
  const scrollRef  = useRef(null);
  const isScrolling = useRef(false);

  // Global website cursor: Difference Blend (cursor number 21)
  useEffect(() => {
    let container = document.getElementById('global-cursor-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'global-cursor-container';
      container.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:9990;';
      document.body.appendChild(container);
    }

    const bigBall = document.createElement('div');
    bigBall.style.cssText = `
      position:absolute; pointer-events:none; z-index:9990;
      mix-blend-mode:difference; transform:translate(-50%,-50%);
      width:30px; height:30px; border-radius:50%; background:#f7f8fa;
      will-change:left,top,transform; transition: opacity 0.15s;
    `;
    container.appendChild(bigBall);

    const smallBall = document.createElement('div');
    smallBall.style.cssText = `
      position:absolute; pointer-events:none; z-index:9991;
      mix-blend-mode:difference; transform:translate(-50%,-50%);
      width:10px; height:10px; border-radius:50%; background:#f7f8fa;
      will-change:left,top,transform; transition: opacity 0.15s;
    `;
    container.appendChild(smallBall);

    let mx = -200, my = -200;
    let bx = -200, by = -200;
    let sx = -200, sy = -200;
    let bigScale = 1;
    let smallScale = 1;
    let clickT = -1;
    let rafId;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onOver = (e) => {
      // Hide global dot when inside preview area — each cursor renders its own
      const insidePreview = e.target.closest('.demo-canvas-area');
      const opacity = insidePreview ? '0' : '1';
      bigBall.style.opacity = opacity;
      smallBall.style.opacity = opacity;
    };

    const onClick = () => {
      clickT = 0;
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    window.addEventListener('click', onClick);

    const checkGlobalPointer = (cx, cy) =>
      document.elementsFromPoint(cx, cy).some(el =>
        ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
        el.classList.contains('btn') ||
        el.classList.contains('hero-card') ||
        el.classList.contains('nav-dot') ||
        el.classList.contains('demo-custom-select-trigger') ||
        el.classList.contains('demo-check-label')
      );

    const loop = () => {
      const isPointer = checkGlobalPointer(mx, my);

      let targetBigScale = 1;
      let targetSmallScale = 1;

      if (isPointer) {
        targetBigScale = 3.0; // scale up outer
        targetSmallScale = 0.5; // shrink inner
      }

      if (clickT >= 0) {
        const bounce = Math.sin(clickT * Math.PI);
        targetBigScale *= (1 - bounce * 0.6);
        targetSmallScale *= (1 + bounce * 0.9);
        clickT += 0.08;
        if (clickT >= 1) clickT = -1;
      }

      bigScale += (targetBigScale - bigScale) * 0.15;
      smallScale += (targetSmallScale - smallScale) * 0.15;

      bx += (mx - bx) * 0.1;
      by += (my - by) * 0.1;

      sx += (mx - sx) * 0.25;
      sy += (my - sy) * 0.25;

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
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(rafId);
      container.remove();
    };
  }, []);

  // Programmatic navigation
  const navigateTo = useCallback((index) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const slides = container.querySelectorAll('.slide');
    if (slides[index]) {
      isScrolling.current = true;
      slides[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrent(index);
      setTimeout(() => { isScrolling.current = false; }, 800);
    }
  }, []);

  // Track current slide via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const id  = entry.target.id;
            const idx = id === 'slide-0' ? 0 : parseInt(id.split('-')[1], 10);
            if (!isNaN(idx)) setCurrent(idx);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    const slides = container.querySelectorAll('.slide');
    slides.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        navigateTo(Math.min(current + 1, TOTAL));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigateTo(Math.max(current - 1, 0));
      } else if (e.key === 'Escape') {
        navigateTo(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, navigateTo]);

  return (
    <>
      <NavDots total={TOTAL} current={current} onNavigate={navigateTo} />

      {/* Keyboard hint */}
      <div style={{
        position: 'fixed', bottom: 20, left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-full)',
        padding: '6px 16px',
        fontSize: 11,
        color: 'var(--text-3)',
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <span>↑↓ Navigate</span>
        <span style={{ color: 'var(--border-hover)' }}>|</span>
        <span>Esc → Index</span>
        <span style={{ color: 'var(--border-hover)' }}>|</span>
        <span style={{ color: 'var(--accent)' }}>Slide {current} / {TOTAL}</span>
      </div>

      <div className="scroll-container" ref={scrollRef}>
        <HeroSlide onNavigate={navigateTo} />

        {CURSORS.map((cursor) => (
          <CursorSlide
            key={cursor.id}
            cursor={cursor}
            index={cursor.id}
            total={TOTAL}
            isActive={current === cursor.id}
            onNavigate={navigateTo}
            onBack={() => navigateTo(0)}
          />
        ))}
      </div>
    </>
  );
}
