import { CURSORS } from '../data/cursors.js';

const ACCENT_COLORS = [
  '#7c5cfc', '#5cf4fc', '#fc5cb8', '#5cfca8', '#fca85c',
  '#fc5c5c', '#c45cfc', '#5c8afc', '#fcf25c', '#5cfcdc',
  '#fc8a5c', '#5cfc7c', '#fc5c8a', '#5cb8fc', '#d4fc5c',
  '#fc5cd4', '#5cfcf4', '#fc9c5c', '#5c5cfc', '#fc5c9c',
];

export default function HeroSlide({ onNavigate }) {
  return (
    <div className="slide hero-slide" id="slide-0">
      {/* Animated background grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(124,92,252,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,92,252,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div className="hero-left">
        <div className="hero-brand">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            Developer Resource
          </div>
        </div>

        <h1 className="hero-title">
          <span className="gradient-text">Cursor</span>
          <span style={{ color: 'var(--text)' }}>X</span>
        </h1>
        <p className="hero-sub">
          Browse 20+ distinct cursor effects, preview them live, grab the code, get the AI prompt. Ship stunning cursors in minutes.
        </p>
      </div>

      <div className="hero-right">
        <div className="hero-gallery-section">
          <div className="hero-gallery-scroll">
            <div className="hero-grid">
              {CURSORS.map((cursor, i) => (
                <button
                  key={cursor.id}
                  className="hero-card"
                  id={`hero-card-${cursor.id}`}
                  onClick={() => onNavigate(cursor.id)}
                  style={{
                    '--card-accent': ACCENT_COLORS[i % ACCENT_COLORS.length],
                    background: 'var(--surface)',
                    textAlign: 'center',
                    fontFamily: 'var(--font)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = ACCENT_COLORS[i % ACCENT_COLORS.length];
                    e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${ACCENT_COLORS[i % ACCENT_COLORS.length]}22`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <span className="hero-card-num-bg">
                    {String(cursor.id).padStart(2, '0')}
                  </span>
                  <span
                    className="hero-card-name"
                    style={{ color: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                  >
                    {cursor.name}
                  </span>
                  <span className="hero-card-desc">{cursor.tagline}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
