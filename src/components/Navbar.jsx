import { useState, useEffect } from 'react';
import { CURSORS } from '../data/cursors.js';

export default function Navbar({ onNavigate, current, tutorialIndex, contactIndex }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isHero = current === 0;

  useEffect(() => {
    if (isHero) {
      setIsExpanded(false);
    }
  }, [isHero]);

  const handleLogoClick = () => {
    if (isHero) {
      if (onNavigate) onNavigate(0);
    } else if (isExpanded) {
      if (onNavigate) onNavigate(0);
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <nav className={`site-navbar glass-panel ${isHero ? 'mode-navbar' : 'mode-sidebar'} ${isExpanded ? 'sidebar-expanded' : ''}`}>
      <div className="nav-container">
        {/* Top/Left Section: Logo and Brand Name */}
        <div className="nav-logo-group">
          <button className="nav-logo" onClick={handleLogoClick} aria-label="Toggle Sidebar or Go to Hero">
            {!isHero && (
              !isExpanded ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-menu-svg">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              ) : (
                <img src="/logo.png" alt="CursorX Logo" className="nav-logo-img" />
              )
            )}
            {isHero && (
              <>
                <span className="nav-logo-text gradient-text">Cursor</span>
                <span className="nav-logo-text logo-x">X</span>
              </>
            )}
          </button>
          {!isHero && isExpanded && (
            <button className="nav-close-btn" onClick={() => setIsExpanded(false)} aria-label="Collapse Sidebar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Center Section: List of Cursors (only visible in expanded sidebar) */}
        {!isHero && isExpanded && (
          <div className="sidebar-middle-section">
            <div className="sidebar-divider">Cursors</div>
            <div className="sidebar-cursor-list">
              {CURSORS.map((c) => (
                <button
                  key={c.id}
                  className={`sidebar-cursor-item ${current === c.id ? 'active' : ''}`}
                  onClick={() => {
                    if (onNavigate) onNavigate(c.id);
                    setIsExpanded(false);
                  }}
                >
                  <span className="cursor-item-dot" style={{ backgroundColor: c.color }} />
                  <span className="cursor-item-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right/Bottom Section: Nav Links */}
        <div className="nav-links">
          <button onClick={() => { if (onNavigate) onNavigate(tutorialIndex); setIsExpanded(false); }} className="nav-link-btn" aria-label="Tutorial">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span className="nav-link-text">Tutorial</span>
          </button>
          <button onClick={() => { if (onNavigate) onNavigate(contactIndex); setIsExpanded(false); }} className="nav-link-btn" aria-label="Contact">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="nav-link-text">Contact</span>
          </button>
          <button onClick={() => { if (onNavigate) onNavigate('quick-links'); setIsExpanded(false); }} className="nav-link-btn" aria-label="Quick Links">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="nav-link-text">Quick Links</span>
          </button>
          <a
            href="https://github.com/Felix-au/CursorX"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            aria-label="GitHub Repository"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
            <span className="nav-link-text">GitHub</span>
          </a>
          <a
            href="https://felixau.in"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            aria-label="Developer Website"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="nav-link-text">Felix Au</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
