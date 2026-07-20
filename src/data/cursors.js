// CursorX — 21 cursor effect definitions (removed: MatrixRain, Clock, EyeTracker, InkSplatter)
// Each entry: { id, name, tagline, description, tech, params, code, prompt }

export const CURSORS = [
  {
    id: 1,
    name: 'Magnetic',
    tagline: 'Pull elements toward your cursor',
    description: 'Interactive elements are magnetically attracted to the cursor, creating a satisfying snap effect.',
    tech: ['CSS Transform', 'mousemove'],
    params: [
      { key: 'color',        label: 'Cursor Color',       type: 'color',  default: '#ffffff' },
      { key: 'size',         label: 'Dot Size (px)',       type: 'range',  min: 4,     max: 28,   step: 1,     default: 12 },
      { key: 'strength',     label: 'Magnetic Strength',  type: 'range',  min: 0.003, max: 0.12, step: 0.003, default: 0.025 },
      { key: 'pointerAnim',  label: 'Pointer Hover Anim', type: 'toggle', default: true },
      { key: 'pointerScale', label: 'Hover Scale',        type: 'range',  min: 1.2,   max: 3.5,  step: 0.1,   default: 2.0 },
      { key: 'clickAnim',    label: 'Click Animation',    type: 'toggle', default: true },
      { key: 'clickScale',   label: 'Click Scale',        type: 'range',  min: 1.2,   max: 4.5,  step: 0.1,   default: 2.5 },
    ],
    code: `// Add data-magnetic to any element you want attracted
const els = document.querySelectorAll('[data-magnetic]');

els.forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    el.style.transition = 'none';
    el.style.transform = \`translate(\${dx * CONFIG.strength}px, \${dy * CONFIG.strength}px)\`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
    el.style.transform = 'translate(0,0)';
  });
});

// Cursor dot
const dot = document.createElement('div');
dot.style.cssText = \`
  position:fixed; pointer-events:none; z-index:9999;
  width:\${CONFIG.size}px; height:\${CONFIG.size}px;
  border-radius:50%; background:\${CONFIG.color};
  transform:translate(-50%,-50%);
  mix-blend-mode:difference;
\`;
document.body.appendChild(dot);
document.addEventListener('mousemove', e => {
  dot.style.left = e.clientX + 'px';
  dot.style.top  = e.clientY + 'px';
});`,
    prompt: `Implement a "Magnetic Cursor" effect. Spec:
1. Custom cursor: \${CONFIG.size}px dot, color \${CONFIG.color}, mix-blend-mode: difference
2. Elements with [data-magnetic] attracted toward cursor
3. Attraction strength = \${CONFIG.strength} × distance-to-center
4. On mouseleave: spring back via cubic-bezier(0.23,1,0.32,1) transition
5. On mouseenter: disable transition (transition: none)

Provide a React hook (useMagnetic) with cleanup on unmount.`,
  },
];
