import { useState } from 'react';

export default function TutorialSection({ index }) {
  const [activeTab, setActiveTab] = useState('react');

  return (
    <div className="slide tutorial-slide" id={`slide-${index}`}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(124,92,252,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,92,252,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div className="tutorial-container" style={{ zIndex: 1 }}>
        <div className="tutorial-header">
          <h2 className="tutorial-title">
            <span className="gradient-text">How to</span> Integrate
          </h2>
        </div>

        <div className="tutorial-card glass-panel">
          {/* Tab Selector */}
          <div className="tutorial-tabs">
            <button
              className={`tutorial-tab-btn ${activeTab === 'react' ? 'active' : ''}`}
              onClick={() => setActiveTab('react')}
            >
              ⚛ React / Vite / Next.js
            </button>
            <button
              className={`tutorial-tab-btn ${activeTab === 'vanilla' ? 'active' : ''}`}
              onClick={() => setActiveTab('vanilla')}
            >
              🌐 Vanilla HTML / JS
            </button>
            <button
              className={`tutorial-tab-btn ${activeTab === 'prompt' ? 'active' : ''}`}
              onClick={() => setActiveTab('prompt')}
            >
              ✦ AI Prompt Guide
            </button>
          </div>

          <div className="tutorial-content">
            {activeTab === 'react' && (
              <div className="tutorial-step-list">
                <div className="tutorial-step">
                  <div className="step-badge">1</div>
                  <div className="step-text">
                    <h4>Copy Vanilla JS Code</h4>
                    <p>Click the <strong>&lt;/&gt; Code</strong> button on any cursor page and copy the code block.</p>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-badge">2</div>
                  <div className="step-text">
                    <h4>Wrap in React Hook</h4>
                    <p>Create a file (e.g. <code>CursorEffect.jsx</code>) and hook the code into a canvas ref inside a <code>useEffect</code> block:</p>
                    <pre className="tutorial-code">
                      {`import { useEffect, useRef } from 'react';

export default function CursorEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Paste the copied loop code here
    
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
}`}
                    </pre>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-badge">3</div>
                  <div className="step-text">
                    <h4>Import and Render</h4>
                    <p>Mount the cursor component at the root of your application layout so it overlays the viewport.</p>
                    <pre className="tutorial-code">
                      {`import CursorEffect from './components/CursorEffect';

export default function Layout({ children }) {
  return (
    <>
      <CursorEffect />
      <main>{children}</main>
    </>
  );
}`}
                    </pre>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-badge">4</div>
                  <div className="step-text">
                    <h4>Hide Default OS Cursor</h4>
                    <p>Hide the default mouse pointer in your CSS stylesheet to prevent double cursor displays.</p>
                    <pre className="tutorial-code">
                      {`/* global.css */
* {
  cursor: none !important;
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vanilla' && (
              <div className="tutorial-step-list">
                <div className="tutorial-step">
                  <div className="step-badge">1</div>
                  <div className="step-text">
                    <h4>Add Canvas Markups</h4>
                    <p>Create a fixed <code>&lt;canvas&gt;</code> element that overlays the window and ignores mouse events.</p>
                    <pre className="tutorial-code">
                      {`<canvas id="cursor-canvas" style="
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
"></canvas>`}
                    </pre>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-badge">2</div>
                  <div className="step-text">
                    <h4>Execute Canvas Loop</h4>
                    <p>Grab the Vanilla JS code from the drawer and initialize it. Provide references to the target container and configuration variables.</p>
                    <pre className="tutorial-code">
                      {`const canvas = document.getElementById('cursor-canvas');
const ctx = canvas.getContext('2d');

// Configure resize listeners and animation frame loop`}
                    </pre>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-badge">3</div>
                  <div className="step-text">
                    <h4>Styles and Hover States</h4>
                    <p>Hide default cursor pointers in your stylesheet and register trigger classes for custom hover transitions.</p>
                    <pre className="tutorial-code">
                      {`body, button, a {
  cursor: none;
}`}
                    </pre>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-badge">4</div>
                  <div className="step-text">
                    <h4>Interactivity Triggers</h4>
                    <p>Add a hover check helper in your loop, triggering changes to scale, speed, or colors on target elements:</p>
                    <pre className="tutorial-code">
                      {`const isHovered = document.elementsFromPoint(mx, my).some(el =>
  ['BUTTON', 'A'].includes(el.tagName)
);`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prompt' && (
              <div className="tutorial-step-list">
                <div className="tutorial-step">
                  <div className="step-badge">1</div>
                  <div className="step-text">
                    <h4>Copy Detailed prompt</h4>
                    <p>Click the <strong>✦ Prompt</strong> button on any cursor page. This copies a structured specification detailing visual specs, physics math, config constants, and canvas loop setups.</p>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-badge">2</div>
                  <div className="step-text">
                    <h4>Send to AI Assistant</h4>
                    <p>Paste the copied prompt into an AI coding assistant (like Gemini or Claude). You can ask it to generate specific variations or adjust physics behaviors.</p>
                    <pre className="tutorial-code">
                      {`Prompt: [Paste copied specs here]
Instruction: Convert this cursor visual specification into a clean component.`}
                    </pre>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-badge">3</div>
                  <div className="step-text">
                    <h4>Integrate and Play</h4>
                    <p>Save the generated rendering loop in your codebase and use configuration constants to fine-tune trail decays, speed boosts, and click scales.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
