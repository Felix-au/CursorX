import { useState, useRef, useEffect, useCallback } from 'react';
import CURSORS from './data/cursors.js';
import HeroSlide from './components/HeroSlide.jsx';
import CursorSlide from './components/CursorSlide.jsx';
import NavDots from './components/NavDots.jsx';

const TOTAL = CURSORS.length; // 22

export default function App() {
  // Hook listener for keybindings and slides intersection observer
  // Hook listener for keybindings and slides intersection observer
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);
  const isScrolling = useRef(false);

  // Global cursor dot — hides automatically inside .demo-canvas-area
  useEffect(() => {
    let dot = document.getElementById('global-cursor');
    if (!dot) {
      dot = document.createElement('div');
      dot.id = 'global-cursor';
      document.body.appendChild(dot);
    }

    const onMove = (e) => {
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
    };

    // Hide global dot when inside preview area — each cursor renders its own
    const onOver = (e) => {
      dot.style.opacity = e.target.closest('.demo-canvas-area') ? '0' : '1';
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      dot.remove();
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
      // Tweak: Scroll timeout extracted
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
            const id = entry.target.id;
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

      {/* Keyboard hint — pure black bg */}
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
