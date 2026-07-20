import CURSORS from '../data/cursors.js';

const ACCENT_COLORS = [
  '#7c5cfc', '#5cf4fc', '#fc5cb8', '#5cfca8', '#fca85c',
  '#fc5c5c', '#c45cfc', '#5c8afc', '#fcf25c', '#5cfcdc',
  '#fc8a5c', '#5cfc7c', '#fc5c8a', '#5cb8fc', '#d4fc5c',
  '#fc5cd4', '#5cfcf4', '#fc9c5c', '#5c5cfc', '#fc5c9c',
  '#8afc5c', '#5cfca0', '#fcb85c', '#a05cfc', '#fc5c68',
];

export default function HeroSlide({ onNavigate }) {
  return (
    <div className="slide hero-slide" id="slide-0">
      {/* Animated background grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(124,92,252,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,92,252,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />

      <div className="hero-header" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Developer Resource
        </div>

        <h1 className="hero-title">
          <span className="gradient-text">Cursor</span>
          <span style={{ color: 'var(--text)' }}>X</span>
        </h1>
        <p className="hero-sub">
          Browse <strong style={{ color: 'var(--text)' }}>25 distinct cursor effects</strong> — preview them live, grab the code, get the AI prompt. Ship stunning cursors in minutes.
        </p>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">22</span>
            <span className="hero-stat-label">Cursor Effects</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">∞</span>
            <span className="hero-stat-label">Customizable</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">0</span>
            <span className="hero-stat-label">Dependencies</span>
          </div>
        </div>
      </div>

      <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>
        {CURSORS.map((cursor, i) => (
          <button
            key={cursor.id}
            className="hero-card"
            id={`hero-card-${cursor.id}`}
            onClick={() => onNavigate(cursor.id)}
            style={{
              '--card-accent': ACCENT_COLORS[i],
              background: 'var(--surface)',
              textAlign: 'left',
              fontFamily: 'var(--font)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = ACCENT_COLORS[i];
              e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${ACCENT_COLORS[i]}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <span className="hero-card-num">
              {String(cursor.id).padStart(2, '0')}
            </span>
            <span
              className="hero-card-name"
              style={{ color: ACCENT_COLORS[i] }}
            >
              {cursor.name}
            </span>
            <span className="hero-card-desc">{cursor.tagline}</span>
            <span className="hero-card-arrow" style={{ color: ACCENT_COLORS[i] }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
