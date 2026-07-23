export default function QuickLinksSection({ onNavigate, tutorialIndex }) {
  return (
    <div className="quick-links-section" style={{ zIndex: 2 }}>
      <div className="ql-container">
        <div className="ql-col brand-col">
          <button onClick={() => onNavigate && onNavigate(0)} className="ql-brand-btn" aria-label="Go to Hero Section">
            <img src="/logo.png" alt="CursorX Logo" className="ql-logo" />
          </button>
          <div className="brand-details">
            <p className="ql-description">
              Browse 20+ distinct cursor effects, preview them live, copy the code, and get structured AI generation prompts.
            </p>
            <div className="ql-socials">
              <a
                href="https://github.com/Felix-au"
                target="_blank"
                rel="noopener noreferrer"
                className="ql-social-btn"
                aria-label="GitHub Developer Profile"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                </svg>
              </a>
              <a
                href="mailto:felixaugum@gmail.com"
                className="ql-social-btn"
                aria-label="Email Felix"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="ql-col">
          <h4 className="ql-col-title">Product</h4>
          <ul className="ql-list">
            <li>
              <button onClick={() => onNavigate && onNavigate(0)} className="ql-link-btn">
                All Cursors
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate && onNavigate(tutorialIndex)} className="ql-link-btn">
                Tutorial Guide
              </button>
            </li>
          </ul>
        </div>

        <div className="ql-col">
          <h4 className="ql-col-title">Project</h4>
          <ul className="ql-list">
            <li>
              <a href="https://github.com/Felix-au/CursorX" target="_blank" rel="noopener noreferrer" className="ql-link">
                GitHub Repo
              </a>
            </li>
            <li>
              <a href="https://github.com/Felix-au/CursorX/issues" target="_blank" rel="noopener noreferrer" className="ql-link">
                Report a Bug
              </a>
            </li>
            <li>
              <a href="https://github.com/Felix-au/CursorX" target="_blank" rel="noopener noreferrer" className="ql-link">
                Star Us
              </a>
            </li>
          </ul>
        </div>

        <div className="ql-col">
          <h4 className="ql-col-title">Tech</h4>
          <ul className="ql-list">
            <li>
              <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="ql-link ql-tech-link">
                React
              </a>
            </li>
            <li>
              <a href="https://vite.dev" target="_blank" rel="noopener noreferrer" className="ql-link ql-tech-link">
                Vite
              </a>
            </li>
            <li>
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API" target="_blank" rel="noopener noreferrer" className="ql-link ql-tech-link">
                Canvas API
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
