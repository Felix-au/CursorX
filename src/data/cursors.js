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
  {
    id: 2,
    name: 'Particle Trail',
    tagline: 'Leave a glittering particle wake',
    description: 'The cursor spawns glowing particles that fade and drift, creating a magical stardust trail.',
    tech: ['Canvas API', 'requestAnimationFrame'],
    params: [
      { key: 'hue',          label: 'Base Hue (0-360)',   type: 'range',  min: 0,   max: 360,  step: 5,     default: 260 },
      { key: 'count',        label: 'Particles / Frame',  type: 'range',  min: 1,   max: 10,   step: 1,     default: 4 },
      { key: 'maxSize',      label: 'Max Size (px)',       type: 'range',  min: 2,   max: 14,   step: 0.5,   default: 6 },
      { key: 'fadeSpeed',    label: 'Fade Speed',         type: 'range',  min: 0.01,max: 0.08, step: 0.005, default: 0.022 },
      { key: 'pointerAnim',  label: 'Pointer State',      type: 'toggle', default: true },
      { key: 'clickAnim',    label: 'Click Burst',        type: 'toggle', default: true },
      { key: 'burstCount',   label: 'Burst Particles',    type: 'range',  min: 15,  max: 80,   step: 5,     default: 45 },
      { key: 'burstDuration',label: 'Burst Duration (ms)',type: 'range',  min: 300, max: 1500, step: 100,   default: 800 },
    ],
    code: `const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let particles = [];
const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
resize(); window.addEventListener('resize', resize);

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 2.5;
    this.vy = (Math.random() - 0.5) * 2.5 - 0.8;
    this.alpha = 1;
    this.size = Math.random() * CONFIG.maxSize + 1;
    this.hue = CONFIG.hue + Math.random() * 60 - 30;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.06; this.alpha -= CONFIG.fadeSpeed; this.size *= 0.97;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = \`hsl(\${this.hue},100%,70%)\`;
    ctx.shadowColor = \`hsl(\${this.hue},100%,60%)\`; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

document.addEventListener('mousemove', e => {
  for (let i = 0; i < CONFIG.count; i++) particles.push(new Particle(e.clientX, e.clientY));
});

const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.alpha > 0);
  particles.forEach(p => { p.update(); p.draw(ctx); });
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Particle Trail" cursor using Canvas API. Spec:
1. Full-screen canvas overlay, pointer-events: none
2. On mousemove: spawn CONFIG.count (${4}) particles at cursor
3. Each: random velocity, gravity (+0.06), alpha fade at CONFIG.fadeSpeed (${0.022}), glow shadow
4. HSL color: base hue CONFIG.hue (${260}) ± 30°, size up to CONFIG.maxSize (${6})px
5. React hook version with useRef + useEffect + cleanup.`,
  },
  {
    id: 3,
    name: 'Spotlight',
    tagline: 'Illuminate what matters',
    description: 'A dark vignette follows the cursor, creating a dramatic spotlight that reveals content beneath.',
    tech: ['CSS radial-gradient', 'CSS Variables'],
    params: [
      { key: 'radius',       label: 'Light Radius (px)', type: 'range',  min: 60,  max: 360,  step: 10,   default: 160 },
      { key: 'darkness',     label: 'Darkness (0–1)',    type: 'range',  min: 0.5, max: 0.98, step: 0.02, default: 0.90 },
      { key: 'pointerAnim',  label: 'Pointer Dilation',  type: 'toggle', default: true },
      { key: 'pointerPulse', label: 'Dilation Amount',   type: 'range',  min: 10,  max: 90,   step: 5,    default: 40 },
      { key: 'clickAnim',    label: 'Click Pulse',       type: 'toggle', default: true },
      { key: 'clickPulse',   label: 'Click Pulse Size',  type: 'range',  min: 20,  max: 130,  step: 10,   default: 70 },
    ],
    code: `const overlay = document.createElement('div');
overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;';
document.body.appendChild(overlay);

document.addEventListener('mousemove', e => {
  overlay.style.background = \`radial-gradient(
    circle \${CONFIG.radius}px at \${e.clientX}px \${e.clientY}px,
    transparent 0%,
    rgba(0,0,0,\${CONFIG.darkness}) 100%
  )\`;
});`,
    prompt: `Implement a "Spotlight" cursor — dark vignette overlay with a circular light hole. Spec:
1. Fixed overlay div, pointer-events: none
2. radial-gradient: transparent center → rgba(0,0,0,CONFIG.darkness (${0.90})) at edges
3. Circle radius = CONFIG.radius (${160}px), updates on every mousemove
4. React component with configurable radius and darkness props.`,
  },
  {
    id: 4,
    name: 'Morphing Blob',
    tagline: 'Organic, fluid shape-shifting',
    description: 'A smooth gooey blob follows the cursor with organic morphing using SVG filters.',
    tech: ['SVG gooey filter', 'CSS filter'],
    params: [
      { key: 'color',       label: 'Blob Color',       type: 'color',  default: '#7c5cfc' },
      { key: 'size',        label: 'Blob Size (px)',    type: 'range',  min: 20,  max: 70,   step: 2,    default: 38 },
      { key: 'trail',       label: 'Trail Length',     type: 'range',  min: 2,   max: 12,   step: 1,    default: 6 },
      { key: 'lerp',        label: 'Follow Speed',     type: 'range',  min: 0.08,max: 0.4,  step: 0.02, default: 0.2 },
      { key: 'opacity',     label: 'Opacity',          type: 'range',  min: 0.2, max: 1.0,  step: 0.05, default: 0.85 },
      { key: 'pointerAnim', label: 'Pointer Morph',   type: 'toggle', default: true },
      { key: 'clickAnim',   label: 'Click Color Shift',type: 'toggle', default: true },
    ],
    code: `// SVG gooey filter (add once to document)
document.body.insertAdjacentHTML('beforeend', \`
  <svg style="position:fixed;top:-999px;left:-999px;width:0;height:0">
    <defs><filter id="blob-filter">
      <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur"/>
      <feColorMatrix in="blur" mode="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/>
    </filter></defs>
  </svg>\`);

const container = document.createElement('div');
container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;filter:url(#blob-filter);';
document.body.appendChild(container);

// Main blob + trail
const blobs = [42, ...Array(CONFIG.trail).fill(0).map((_,i) => 32 - i*3)].map((size, i) => {
  const el = document.createElement('div');
  el.style.cssText = \`position:absolute;width:\${size}px;height:\${size}px;border-radius:50%;
    background:\${CONFIG.color};transform:translate(-50%,-50%);opacity:\${1 - i * 0.08};\`;
  container.appendChild(el);
  return { el, x: -100, y: -100 };
});

let mx = -100, my = -100;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

const loop = () => {
  blobs[0].el.style.left = mx + 'px'; blobs[0].el.style.top = my + 'px';
  for (let i = 1; i < blobs.length; i++) {
    const prev = blobs[i-1];
    blobs[i].x += (prev.x - blobs[i].x) * CONFIG.lerp;
    blobs[i].y += (prev.y - blobs[i].y) * CONFIG.lerp;
    blobs[i].el.style.left = blobs[i].x + 'px'; blobs[i].el.style.top = blobs[i].y + 'px';
    blobs[i-1].x = parseFloat(blobs[i-1].el.style.left);
    blobs[i-1].y = parseFloat(blobs[i-1].el.style.top);
  }
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Morphing Blob" gooey cursor using SVG filter. Spec:
1. Hidden SVG with feGaussianBlur + feColorMatrix for gooey effect
2. Main blob (42px) instant follow + CONFIG.trail (${6}) smaller trailing blobs
3. Each trail blob lerps toward previous at CONFIG.lerp (${0.2}) speed
4. All inside a filter:url(#blob-filter) container div
5. Color: CONFIG.color (${'"#7c5cfc"'})
Provide React component with useRef + useEffect cleanup.`,
  },
  {
    id: 5,
    name: 'Pixel Shatter',
    tagline: 'Explode pixels with every move',
    description: 'Canvas pixels burst and shatter beneath the cursor, like breaking digital glass.',
    tech: ['Canvas API', 'Particle Physics'],
    params: [
      { key: 'hue',          label: 'Base Hue (0-360)',   type: 'range',  min: 0,   max: 360,  step: 5,     default: 220 },
      { key: 'count',        label: 'Max Shards/Frame',   type: 'range',  min: 1,   max: 15,   step: 1,     default: 8 },
      { key: 'gravity',      label: 'Gravity',            type: 'range',  min: 0,   max: 0.5,  step: 0.01,  default: 0.18 },
      { key: 'pointerAnim',  label: 'Pointer State',      type: 'toggle', default: true },
      { key: 'clickAnim',    label: 'Click Burst',        type: 'toggle', default: true },
      { key: 'burstCount',   label: 'Burst Shards',       type: 'range',  min: 15,  max: 60,   step: 5,     default: 30 },
      { key: 'burstDuration',label: 'Burst Duration (ms)',type: 'range',  min: 300, max: 1500, step: 100,   default: 700 },
    ],
    code: `const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let shards = [], lastX = 0, lastY = 0;
const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
resize(); window.addEventListener('resize', resize);

class Shard {
  constructor(x, y) {
    const a = Math.random() * Math.PI * 2, spd = Math.random() * 6 + 2;
    this.x = x; this.y = y;
    this.vx = Math.cos(a) * spd; this.vy = Math.sin(a) * spd;
    this.size = Math.random() * 6 + 2;
    this.rot = Math.random() * Math.PI * 2; this.rotSpd = (Math.random() - 0.5) * 0.25;
    this.alpha = 1;
    this.color = \`hsl(\${CONFIG.hue + Math.random()*60-30},80%,70%)\`;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += CONFIG.gravity; this.vx *= 0.97;
    this.rot += this.rotSpd; this.alpha -= 0.028; this.size *= 0.975;
  }
  draw(c) {
    c.save(); c.translate(this.x,this.y); c.rotate(this.rot);
    c.globalAlpha = Math.max(0,this.alpha); c.fillStyle = this.color;
    c.fillRect(-this.size/2,-this.size/2,this.size,this.size); c.restore();
  }
}

document.addEventListener('mousemove', e => {
  const dx = e.clientX-lastX, dy = e.clientY-lastY;
  const n = Math.min(Math.floor(Math.sqrt(dx*dx+dy*dy)*0.6), CONFIG.count);
  for (let i = 0; i < n; i++) shards.push(new Shard(e.clientX, e.clientY));
  lastX = e.clientX; lastY = e.clientY;
});

const loop = () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  shards = shards.filter(s => s.alpha > 0);
  shards.forEach(s => { s.update(); s.draw(ctx); });
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Pixel Shatter" cursor with rotating square fragments. Spec:
1. Canvas overlay, pointer-events: none
2. Spawn up to CONFIG.count (${8}) shards on mousemove, proportional to speed
3. Each shard: random burst velocity, CONFIG.gravity (${0.18}) gravity, friction 0.97, rotation, alpha fade
4. Color: HSL hue CONFIG.hue (${220}) ± 30°
Provide a React hook (usePixelShatter) with container ref + cleanup.`,
  },
  {
    id: 6,
    name: 'Elastic Ring',
    tagline: 'Spring-physics cursor ring',
    description: 'A ring cursor that lags behind with spring physics, stretching and compressing as you move.',
    tech: ['Spring Physics', 'CSS Transform'],
    params: [
      { key: 'color',       label: 'Ring Color',       type: 'color',  default: '#7c5cfc' },
      { key: 'size',        label: 'Ring Size (px)',    type: 'range',  min: 16,  max: 80,   step: 2,    default: 38 },
      { key: 'stiffness',   label: 'Stiffness',        type: 'range',  min: 0.04,max: 0.4,  step: 0.02, default: 0.13 },
      { key: 'damping',     label: 'Damping',          type: 'range',  min: 0.5, max: 0.95, step: 0.02, default: 0.76 },
      { key: 'pointerAnim', label: 'Pointer Surround', type: 'toggle', default: true },
      { key: 'clickAnim',   label: 'Click Expand',     type: 'toggle', default: true },
      { key: 'clickScale',  label: 'Click Scale',      type: 'range',  min: 1.2, max: 3.5,  step: 0.1,  default: 1.8 },
    ],
    code: `const ring = document.createElement('div');
ring.style.cssText = \`
  position:fixed; pointer-events:none; z-index:9998;
  width:\${CONFIG.size}px; height:\${CONFIG.size}px; border-radius:50%;
  border:2px solid \${CONFIG.color}; transform:translate(-50%,-50%);
  box-shadow:0 0 14px \${CONFIG.color}66;
\`;
const dot = document.createElement('div');
dot.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;width:5px;height:5px;border-radius:50%;background:white;transform:translate(-50%,-50%);';
document.body.append(ring, dot);

let mouse={x:0,y:0}, pos={x:0,y:0,vx:0,vy:0};
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  dot.style.left = e.clientX+'px'; dot.style.top = e.clientY+'px';
});

const loop = () => {
  pos.vx = (pos.vx + (mouse.x-pos.x)*CONFIG.stiffness) * CONFIG.damping;
  pos.vy = (pos.vy + (mouse.y-pos.y)*CONFIG.stiffness) * CONFIG.damping;
  pos.x += pos.vx; pos.y += pos.vy;
  const spd = Math.sqrt(pos.vx**2+pos.vy**2);
  const stretch = Math.min(spd*0.07, 0.55);
  const angle = Math.atan2(pos.vy,pos.vx);
  ring.style.left = pos.x+'px'; ring.style.top = pos.y+'px';
  ring.style.transform = \`translate(-50%,-50%) rotate(\${angle}rad) scale(\${1+stretch},\${1-stretch*0.5})\`;
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement an "Elastic Ring" cursor with spring physics and squash & stretch. Spec:
1. Small white dot at exact cursor position (instant)
2. Ring (CONFIG.size (${38})px, CONFIG.color (${'"#7c5cfc"'})) follows with spring: stiffness CONFIG.stiffness (${0.13}), damping CONFIG.damping (${0.76})
3. Squash/stretch: scale in travel direction based on velocity magnitude
4. Rotate ring to face travel direction via Math.atan2
Provide React hook with useSprings abstraction.`,
  },
  {
    id: 7,
    name: 'Neon Glow',
    tagline: 'Electric neon light cursor',
    description: 'A vibrant neon cursor pulses with electric light — click to cycle through colors.',
    tech: ['CSS box-shadow', 'CSS Animation'],
    params: [
      { key: 'color',        label: 'Neon Color',       type: 'color',  default: '#7c5cfc' },
      { key: 'size',         label: 'Dot Size (px)',    type: 'range',  min: 6,   max: 30,  step: 1,   default: 14 },
      { key: 'pulseSpeed',   label: 'Pulse Speed (s)',  type: 'range',  min: 0.3, max: 3,   step: 0.1, default: 0.9 },
      { key: 'glowRadius',   label: 'Glow Radius',      type: 'range',  min: 5,   max: 50,  step: 1,   default: 22 },
      { key: 'opacity',      label: 'Opacity',          type: 'range',  min: 0.2, max: 1.0, step: 0.05,default: 1.0 },
      { key: 'pointerAnim',  label: 'Pointer Pulse',    type: 'toggle', default: true },
      { key: 'pointerScale', label: 'Pointer Scale',    type: 'range',  min: 1.3, max: 4.0, step: 0.1, default: 2.2 },
      { key: 'clickAnim',    label: 'Click Flash',      type: 'toggle', default: true },
    ],
    code: `const cursor = document.createElement('div');
document.body.appendChild(cursor);

const colors = [CONFIG.color, '#5cf4fc', '#fc5cb8', '#5cfca8', '#fca85c'];
let idx = 0;

const apply = (col) => {
  const rgb = col.replace(/^#/,'');
  const r = parseInt(rgb.slice(0,2),16), g = parseInt(rgb.slice(2,4),16), b = parseInt(rgb.slice(4,6),16);
  cursor.style.background = col;
  cursor.style.boxShadow = \`0 0 6px 2px rgba(\${r},\${g},\${b},0.9),0 0 22px 8px rgba(\${r},\${g},\${b},0.45),0 0 45px 16px rgba(\${r},\${g},\${b},0.18)\`;
};

cursor.style.cssText = \`
  position:fixed;pointer-events:none;z-index:9999;
  width:\${CONFIG.size}px;height:\${CONFIG.size}px;border-radius:50%;
  transform:translate(-50%,-50%);
  animation:neon-pulse \${CONFIG.pulseSpeed}s ease-in-out infinite;
\`;
apply(colors[0]);

document.addEventListener('click', () => { idx=(idx+1)%colors.length; apply(colors[idx]); });

let cx=0,cy=0,tx=0,ty=0;
document.addEventListener('mousemove', e => { tx=e.clientX; ty=e.clientY; });
const loop = () => {
  cx += (tx-cx)*0.16; cy += (ty-cy)*0.16;
  cursor.style.left = cx+'px'; cursor.style.top = cy+'px';
  requestAnimationFrame(loop);
};
loop();

// Add to CSS:
// @keyframes neon-pulse { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.35)} }`,
    prompt: `Implement a "Neon Glow" cursor with triple-layer box-shadow. Spec:
1. Dot: CONFIG.size (${14})px, initial color CONFIG.color (${'"#7c5cfc"'})
2. Triple box-shadow: tight core (6px), mid glow (22px), outer ambient (45px)
3. Click cycles through 5 preset colors
4. Smooth follow lerp (0.16), pulse animation CONFIG.pulseSpeed (${1.6})s
Provide React component with useState for color cycling.`,
  },
  {
    id: 8,
    name: 'Text Orbiter',
    tagline: 'Rotating text follows your cursor',
    description: 'A string of characters orbits the cursor in a circular path, like a satellite in your hand.',
    tech: ['Canvas API', 'Trigonometry'],
    params: [
      { key: 'text',              label: 'Orbit Text',         type: 'text',   default: '✦ CURSORX ✦ DEV ✦' },
      { key: 'color',             label: 'Text Color',         type: 'color',  default: '#7c5cfc' },
      { key: 'radius',            label: 'Orbit Radius (px)',  type: 'range',  min: 20,   max: 80,   step: 2,     default: 42 },
      { key: 'speed',             label: 'Rotation Speed',     type: 'range',  min: 0.005,max: 0.06, step: 0.005, default: 0.02 },
      { key: 'pointerAnim',       label: 'Pointer State',      type: 'toggle', default: true },
      { key: 'pointerRadiusBoost',label: 'Pointer Radius +',  type: 'range',  min: 5,    max: 45,   step: 2,     default: 20 },
      { key: 'pointerSpeedBoost', label: 'Pointer Speed +',   type: 'range',  min: 0.01, max: 0.1,  step: 0.005, default: 0.04 },
      { key: 'clickAnim',         label: 'Click Expand',       type: 'toggle', default: true },
    ],
    code: `const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let mx = innerWidth/2, my = innerHeight/2, angle = 0;
const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
resize(); window.addEventListener('resize', resize);
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

const draw = () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  angle += CONFIG.speed;
  ctx.font = '10px Inter,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const text = CONFIG.text;
  for (let i = 0; i < text.length; i++) {
    const ca = angle + (i/text.length)*Math.PI*2;
    ctx.save();
    ctx.translate(mx + Math.cos(ca)*CONFIG.radius, my + Math.sin(ca)*CONFIG.radius);
    ctx.rotate(ca + Math.PI/2);
    ctx.fillStyle = CONFIG.color;
    ctx.shadowColor = CONFIG.color; ctx.shadowBlur = 5;
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  requestAnimationFrame(draw);
};
draw();`,
    prompt: `Implement a "Text Orbiter" cursor — characters arranged in a circle that rotate. Spec:
1. Canvas overlay, full screen, pointer-events none
2. Text: CONFIG.text (${'"✦ CURSORX ✦ DEV ✦"'}), each char placed at CONFIG.radius (${42}px) orbit
3. Rotate each char individually (charAngle + π/2) to face outward
4. Speed: CONFIG.speed (${0.02}) radians/frame
5. Color: CONFIG.color (${'"#7c5cfc"'}) with glow shadow
Provide React hook with configurable text, radius, speed, color.`,
  },
  {
    id: 9,
    name: 'Gravity Pull',
    tagline: 'Elements fall toward your cursor',
    description: 'Nearby DOM elements are displaced toward the cursor, as if it has gravitational mass.',
    tech: ['DOM Physics', 'Spring Simulation'],
    params: [
      { key: 'color',       label: 'Ring Color',        type: 'color',  default: '#5cf4fc' },
      { key: 'strength',    label: 'G Constant',        type: 'range',  min: 5000, max: 50000, step: 1000, default: 25000 },
      { key: 'radius',      label: 'Attract Radius (px)',type: 'range', min: 80,   max: 400,   step: 20,   default: 220 },
      { key: 'damping',     label: 'Damping',           type: 'range',  min: 0.7,  max: 0.95,  step: 0.01, default: 0.84 },
      { key: 'pointerAnim', label: 'Pointer Ring Pulse', type: 'toggle', default: true },
      { key: 'clickAnim',   label: 'Click Ring Flash',  type: 'toggle', default: true },
    ],
    code: `// Add data-gravity to elements you want affected
const targets = document.querySelectorAll('[data-gravity]');
const states = new Map();
targets.forEach(el => states.set(el, {x:0,y:0,vx:0,vy:0}));

let mx=-1000, my=-1000;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

const loop = () => {
  targets.forEach(el => {
    const rect = el.getBoundingClientRect();
    const s = states.get(el);
    const dx = mx-(rect.left+rect.width/2+s.x);
    const dy = my-(rect.top+rect.height/2+s.y);
    const dist = Math.max(Math.sqrt(dx*dx+dy*dy),1);
    if (dist < CONFIG.radius) {
      const f = Math.min(CONFIG.strength/(dist*dist), 55);
      s.vx += (dx/dist)*f*0.016; s.vy += (dy/dist)*f*0.016;
    }
    s.vx -= s.x*0.09; s.vy -= s.y*0.09; // spring return
    s.vx *= CONFIG.damping; s.vy *= CONFIG.damping;
    s.x += s.vx; s.y += s.vy;
    el.style.transform = \`translate(\${s.x}px,\${s.y}px)\`;
  });
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Gravity Pull" cursor — DOM elements attract toward cursor. Spec:
1. Elements with [data-gravity] within CONFIG.radius (${220}px attract with F = CONFIG.strength (${7500}) / dist²
2. Spring return: vx -= x * 0.09
3. Damping: vx *= CONFIG.damping (${0.84})
4. Cursor ring: CONFIG.color (${'"#5cf4fc"'})
Provide React hook (useGravity) with options object.`,
  },
  {
    id: 10,
    name: 'Repel Field',
    tagline: 'Push elements away with force',
    description: 'Like gravity, but inverted — elements flee from the cursor as if electrostatically repelled.',
    tech: ['DOM Physics', 'Spring Simulation'],
    params: [
      { key: 'color',       label: 'Ring Color',         type: 'color',  default: '#fc5cb8' },
      { key: 'strength',    label: 'Repel Force',        type: 'range',  min: 2000, max: 40000, step: 1000, default: 20000 },
      { key: 'radius',      label: 'Repel Radius (px)',  type: 'range',  min: 80,   max: 400,   step: 20,   default: 190 },
      { key: 'damping',     label: 'Damping',            type: 'range',  min: 0.6,  max: 0.95,  step: 0.01, default: 0.80 },
      { key: 'pointerAnim', label: 'Pointer Ring Pulse', type: 'toggle', default: true },
      { key: 'clickAnim',   label: 'Click Ring Flash',   type: 'toggle', default: true },
    ],
    code: `const targets = document.querySelectorAll('[data-repel]');
const states = new Map();
targets.forEach(el => states.set(el, {x:0,y:0,vx:0,vy:0}));

let mx=-1000, my=-1000;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

const loop = () => {
  targets.forEach(el => {
    const rect = el.getBoundingClientRect();
    const s = states.get(el);
    const cx = rect.left+rect.width/2+s.x, cy = rect.top+rect.height/2+s.y;
    const dx = cx-mx, dy = cy-my;
    const dist = Math.max(Math.sqrt(dx*dx+dy*dy),1);
    if (dist < CONFIG.radius) {
      const f = CONFIG.strength/(dist*dist);
      s.vx += (dx/dist)*f*0.016; s.vy += (dy/dist)*f*0.016;
    }
    s.vx -= s.x*0.1; s.vy -= s.y*0.1;
    s.vx *= CONFIG.damping; s.vy *= CONFIG.damping;
    s.x += s.vx; s.y += s.vy;
    el.style.transform = \`translate(\${s.x}px,\${s.y}px)\`;
  });
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Repel Field" cursor — elements flee cursor with inverse-square force. Spec:
1. Elements with [data-repel] within CONFIG.radius (${190}px) pushed away: F = CONFIG.strength (${5800}) / dist²
2. Force direction: (element → cursor) normalized, inverted
3. Spring return: vx -= x * 0.1; Damping: vx *= CONFIG.damping (${0.80})
4. Dual ring cursor: CONFIG.color (${'"#fc5cb8"'})
Provide React hook (useRepelField) with configurable radius and strength.`,
  },
  {
    id: 11,
    name: 'Constellation',
    tagline: 'Connect the stars under your cursor',
    description: 'Particles scatter and draw glowing constellation lines between nearby stars.',
    tech: ['Canvas API', 'Graph Connections'],
    params: [
      { key: 'starCount',  label: 'Star Count',     type: 'range', min: 30, max: 200, step: 10, default: 90 },
      { key: 'maxDist',    label: 'Star Connect (px)', type: 'range', min: 50, max: 200, step: 5, default: 115 },
      { key: 'cursorDist', label: 'Cursor Connect (px)', type: 'range', min: 80, max: 300, step: 10, default: 175 },
      { key: 'starColor',  label: 'Star Color',     type: 'color', default: '#c8c8ff' },
    ],
    code: `const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let mx=0, my=0;
const resize = () => { canvas.width=innerWidth; canvas.height=innerHeight; };
resize(); window.addEventListener('resize', resize);

const stars = Array.from({length:CONFIG.starCount}, () => ({
  x:Math.random()*innerWidth, y:Math.random()*innerHeight,
  vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28,
  r:Math.random()*2+.5,
}));
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

const draw = () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s => {
    s.x+=s.vx; s.y+=s.vy;
    if(s.x<0)s.x=canvas.width; if(s.x>canvas.width)s.x=0;
    if(s.y<0)s.y=canvas.height; if(s.y>canvas.height)s.y=0;
  });
  for (let i=0;i<stars.length;i++) {
    const a=stars[i];
    for (let j=i+1;j<stars.length;j++) {
      const b=stars[j];
      const d=Math.hypot(a.x-b.x,a.y-b.y);
      if (d<CONFIG.maxDist) {
        ctx.beginPath();
        ctx.strokeStyle=\`rgba(124,92,252,\${(1-d/CONFIG.maxDist)*.35})\`;
        ctx.lineWidth=.7; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
    const dc=Math.hypot(a.x-mx,a.y-my);
    if(dc<CONFIG.cursorDist){
      ctx.beginPath();
      ctx.strokeStyle=\`rgba(92,244,252,\${(1-dc/CONFIG.cursorDist)*.75})\`;
      ctx.lineWidth=1; ctx.moveTo(a.x,a.y); ctx.lineTo(mx,my); ctx.stroke();
    }
    ctx.beginPath(); ctx.fillStyle=CONFIG.starColor;
    ctx.arc(a.x,a.y,a.r,0,Math.PI*2); ctx.fill();
  }
  requestAnimationFrame(draw);
};
draw();`,
    prompt: `Implement a "Constellation" cursor — floating stars with line connections. Spec:
1. CONFIG.starCount (${90}) drifting star particles wrapping screen edges
2. Star-to-star lines within CONFIG.maxDist (${115}px), opacity ∝ distance
3. Star-to-cursor lines within CONFIG.cursorDist (${175}px), cyan color
4. Star color: CONFIG.starColor (${'"#c8c8ff"'})
Provide React component with configurable counts and distances.`,
  },
  {
    id: 12,
    name: 'Fire Trail',
    tagline: 'Leave flames in your wake',
    description: 'Hot fire particles stream from the cursor — each flame rises, cools, and fades into smoke.',
    tech: ['Canvas API', 'Particle HSL'],
    params: [
      { key: 'count',    label: 'Flames / Frame', type: 'range', min: 1, max: 10, step: 1, default: 5 },
      { key: 'rise',     label: 'Rise Speed',     type: 'range', min: 0.5, max: 4, step: 0.25, default: 2 },
      { key: 'size',     label: 'Max Flame Size', type: 'range', min: 4, max: 18, step: 1, default: 9 },
    ],
    code: `const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let particles=[], mx=0, my=0;
const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight;};
resize(); window.addEventListener('resize',resize);

class Flame {
  constructor(x,y){
    this.x=x+(Math.random()-.5)*8; this.y=y;
    this.vx=(Math.random()-.5)*1.8;
    this.vy=-(Math.random()*CONFIG.rise+1.2);
    this.life=1; this.decay=Math.random()*.028+.016;
    this.size=Math.random()*CONFIG.size+4;
  }
  update(){
    this.x+=this.vx; this.y+=this.vy;
    this.vx+=(Math.random()-.5)*.35;
    this.life-=this.decay; this.size*=.968;
  }
  draw(c){
    const hue=this.life>.55?42+(1-this.life)*22:this.life>.2?12:0;
    const sat=this.life>.2?100:Math.max(0,(this.life/.2)*40);
    const lit=this.life>.2?52+this.life*18:35;
    c.save(); c.globalAlpha=Math.max(0,this.life*.92);
    c.fillStyle=\`hsl(\${hue},\${sat}%,\${lit}%)\`;
    c.shadowColor=\`hsl(\${hue},100%,55%)\`; c.shadowBlur=14;
    c.beginPath(); c.arc(this.x,this.y,Math.max(.1,this.size),0,Math.PI*2); c.fill(); c.restore();
  }
}
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
const loop=()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<CONFIG.count;i++) particles.push(new Flame(mx,my));
  particles=particles.filter(p=>p.life>0);
  particles.forEach(p=>{p.update();p.draw(ctx);});
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Fire Trail" cursor with realistic flame particles. Spec:
1. Spawn CONFIG.count (${5}) Flame particles per frame at cursor position
2. Particles rise (vy: -1.2 to -CONFIG.rise-1.2 (${-3.2})), horizontal flicker
3. Color lifecycle: yellow → orange → red → smoke as life decreases
4. Glow via shadowBlur:14, size CONFIG.size (${9})px max
Provide React hook with windDirection prop.`,
  },
  {
    id: 12,
    name: 'Crosshair Scope',
    tagline: 'Lock on target with precision',
    description: 'An animated tactical crosshair follows the cursor with a scanning sweep and lock-on click.',
    tech: ['Canvas API', 'SVG Animation'],
    params: [
      { key: 'color',       label: 'Default Color', type: 'color', default: '#5cf4fc' },
      { key: 'lockedColor', label: 'Locked Color',  type: 'color', default: '#ff4455' },
      { key: 'radius',      label: 'Radius (px)',   type: 'range', min: 20, max: 80, step: 2, default: 40 },
      { key: 'scanSpeed',   label: 'Scan Speed',    type: 'range', min: 0.01, max: 0.12, step: 0.005, default: 0.045 },
    ],
    code: `const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d');
let mx=innerWidth/2,my=innerHeight/2,scan=0,locked=false,scaleT=1,scaleC=1;
const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight;};
resize();window.addEventListener('resize',resize);
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
document.addEventListener('click',()=>{locked=!locked;scaleT=.75;setTimeout(()=>scaleT=1,200);});

const draw=()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  scan+=CONFIG.scanSpeed; scaleC+=(scaleT-scaleC)*.2;
  const s=scaleC, r=CONFIG.radius*s, tick=14*s;
  const col=locked?CONFIG.lockedColor:CONFIG.color;
  ctx.save(); ctx.translate(mx,my);
  ctx.strokeStyle=col; ctx.shadowColor=col; ctx.shadowBlur=10; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke();
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
    ctx.beginPath(); ctx.moveTo(dx*(r+2),dy*(r+2)); ctx.lineTo(dx*(r+tick),dy*(r+tick)); ctx.stroke();
  });
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,0,2.5,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=.28; ctx.beginPath(); ctx.moveTo(0,0);
  ctx.arc(0,0,r-6,scan,scan+Math.PI*.38); ctx.closePath(); ctx.fillStyle=col; ctx.fill();
  ctx.globalAlpha=1;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sy])=>{
    const bx=sx*(r+18),by=sy*(r+18),bs=14*s;
    ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+sx*bs,by); ctx.moveTo(bx,by); ctx.lineTo(bx,by+sy*bs); ctx.stroke();
  });
  ctx.restore(); requestAnimationFrame(draw);
};
draw();`,
    prompt: `Implement a "Crosshair Scope" cursor with tactical reticle. Spec:
1. Outer ring CONFIG.radius (${40})px with 4 crosshair ticks and corner brackets
2. Sweep arc: 38° arc rotating at CONFIG.scanSpeed (${0.045}) rad/frame
3. Default color CONFIG.color (${'"#5cf4fc"'}), locked: CONFIG.lockedColor (${'"#ff4455"'})
4. Click toggles lock: scale compress to 0.75 then spring back
Provide React component with color and scanSpeed props.`,
  },
  {
    id: 12,
    name: 'Mirror Ghost',
    tagline: 'Symmetrical shadow cursors',
    description: 'Four ghost cursor shadows are reflected across both axes, creating a hypnotic symmetrical dance.',
    tech: ['CSS Transform', 'Viewport Mirroring'],
    params: [
      { key: 'color', label: 'Ghost Color', type: 'color', default: '#c45cfc' },
      { key: 'size',  label: 'Ring Size',   type: 'range', min: 10, max: 40, step: 2, default: 20 },
      { key: 'lerp',  label: 'Follow Speed',type: 'range', min: 0.06, max: 0.4, step: 0.02, default: 0.14 },
    ],
    code: `const cx=innerWidth/2, cy=innerHeight/2;

const makeGhost = (opacity,size) => {
  const el=document.createElement('div');
  el.style.cssText=\`position:fixed;pointer-events:none;z-index:9997;
    width:\${size}px;height:\${size}px;border-radius:50%;
    border:2px solid \${CONFIG.color}\${Math.round(opacity*255).toString(16).padStart(2,'0')};
    transform:translate(-50%,-50%);
    box-shadow:0 0 12px \${CONFIG.color}\${Math.round(opacity*128).toString(16).padStart(2,'0')};\`;
  document.body.appendChild(el); return el;
};

const ghosts=[
  {el:makeGhost(.9,CONFIG.size),sx:1,sy:1,lerp:1},
  {el:makeGhost(.5,CONFIG.size-2),sx:-1,sy:1,lerp:CONFIG.lerp},
  {el:makeGhost(.5,CONFIG.size-2),sx:1,sy:-1,lerp:CONFIG.lerp},
  {el:makeGhost(.28,CONFIG.size-4),sx:-1,sy:-1,lerp:CONFIG.lerp*.7},
];
const dot=document.createElement('div');
dot.style.cssText='position:fixed;pointer-events:none;z-index:9999;width:6px;height:6px;border-radius:50%;background:white;transform:translate(-50%,-50%);';
document.body.append(dot);

const pos=ghosts.map(()=>({x:cx,y:cy}));
let target={x:cx,y:cy};
document.addEventListener('mousemove',e=>{target.x=e.clientX;target.y=e.clientY;});

const loop=()=>{
  ghosts.forEach((g,i)=>{
    const tx=cx+(target.x-cx)*g.sx, ty=cy+(target.y-cy)*g.sy;
    pos[i].x+=(tx-pos[i].x)*g.lerp; pos[i].y+=(ty-pos[i].y)*g.lerp;
    g.el.style.left=pos[i].x+'px'; g.el.style.top=pos[i].y+'px';
  });
  dot.style.left=target.x+'px'; dot.style.top=target.y+'px';
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Mirror Ghost" cursor with 4-way symmetrical reflections. Spec:
1. Ghost 1 (real): instant follow
2. Ghost 2 (mirror X): pos.x = 2*cx - x, opacity 0.5, lerp CONFIG.lerp (${0.14})
3. Ghost 3 (mirror Y): pos.y = 2*cy - y, opacity 0.5
4. Ghost 4 (mirror XY): both, opacity 0.28, slower lerp
5. Ring size CONFIG.size (${20})px, color CONFIG.color (${'"#c45cfc"'})
Provide React component with symmetryAxes prop.`,
  },
  {
    id: 12,
    name: 'Rainbow Comet',
    tagline: 'Trail the full spectrum',
    description: 'A hue-rotating rainbow comet tail follows the cursor through a full spectrum of color.',
    tech: ['Canvas API', 'HSL Color'],
    params: [
      { key: 'trailLength', label: 'Trail Length',  type: 'range', min: 10, max: 80, step: 5, default: 45 },
      { key: 'hueSpeed',    label: 'Hue Speed',     type: 'range', min: 0.5, max: 6,  step: 0.5, default: 2.5 },
      { key: 'maxWidth',    label: 'Max Width (px)',type: 'range', min: 4,  max: 24,  step: 1, default: 13 },
    ],
    code: `const canvas=document.createElement('canvas');
canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9998;';
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d');
const trail=[];
let mx=0,my=0,hue=0;
const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight;};
resize();window.addEventListener('resize',resize);
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});

const loop=()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  hue=(hue+CONFIG.hueSpeed)%360;
  trail.push({x:mx,y:my,hue});
  if(trail.length>CONFIG.trailLength) trail.shift();
  for(let i=1;i<trail.length;i++){
    const a=trail[i-1],b=trail[i];
    const alpha=i/trail.length, w=alpha*CONFIG.maxWidth;
    ctx.save();
    ctx.strokeStyle=\`hsla(\${b.hue},100%,62%,\${alpha*.88})\`;
    ctx.shadowColor=\`hsl(\${b.hue},100%,60%)\`; ctx.shadowBlur=w;
    ctx.lineWidth=w; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.restore();
  }
  if(trail.length>0){
    const h=trail[trail.length-1];
    ctx.save(); ctx.beginPath(); ctx.arc(h.x,h.y,7,0,Math.PI*2);
    ctx.fillStyle=\`hsl(\${h.hue},100%,82%)\`;
    ctx.shadowColor=\`hsl(\${h.hue},100%,60%)\`; ctx.shadowBlur=22;
    ctx.fill(); ctx.restore();
  }
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Rainbow Comet" cursor with full-spectrum hue trail. Spec:
1. Trail: last CONFIG.trailLength (${45}) positions, each with its hue value
2. Hue advances CONFIG.hueSpeed (${2.5})°/frame (wrapping at 360)
3. Segment width: 0 → CONFIG.maxWidth (${13})px from tail to head
4. Glowing circle at head (22px shadowBlur)
Provide React hook (useRainbowComet) with trailLength, hueSpeed, maxWidth props.`,
  },
  {
    id: 12,
    name: 'Bubble Float',
    tagline: 'Bubbles rise from your touch',
    description: 'Translucent soap bubbles emerge from the cursor and float upward, wobbling and fading.',
    tech: ['Canvas API', 'Radial Gradient'],
    params: [
      { key: 'hue',       label: 'Bubble Hue',     type: 'range', min: 0,  max: 360, step: 5, default: 200 },
      { key: 'spawnRate', label: 'Spawn (1/N frames)', type: 'range', min: 1, max: 10, step: 1, default: 5 },
      { key: 'maxSize',   label: 'Max Size (px)',   type: 'range', min: 8,  max: 40,  step: 2, default: 25 },
      { key: 'riseSpeed', label: 'Rise Speed',      type: 'range', min: 0.3,max: 3,   step: 0.1, default: 1.6 },
    ],
    code: `const canvas=document.createElement('canvas');
canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9998;';
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d');
let bubbles=[],mx=0,my=0,frame=0;
const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight;};
resize();window.addEventListener('resize',resize);

class Bubble {
  constructor(x,y){
    this.x=x;this.y=y;
    this.r=Math.random()*(CONFIG.maxSize-7)+7;
    this.vy=-(Math.random()*CONFIG.riseSpeed+.6);
    this.vx=(Math.random()-.5)*.9;
    this.wobble=Math.random()*Math.PI*2;
    this.wSpd=Math.random()*.055+.025;
    this.alpha=.72;
    this.hue=CONFIG.hue+Math.random()*40-20;
  }
  update(){this.wobble+=this.wSpd;this.x+=this.vx+Math.sin(this.wobble)*.55;this.y+=this.vy;this.alpha-=.004;}
  draw(c){
    c.save();c.globalAlpha=Math.max(0,this.alpha);
    const g=c.createRadialGradient(this.x-this.r*.32,this.y-this.r*.32,this.r*.08,this.x,this.y,this.r);
    g.addColorStop(0,\`hsla(\${this.hue},70%,92%,.85)\`);
    g.addColorStop(.55,\`hsla(\${this.hue},60%,72%,.18)\`);
    g.addColorStop(1,\`hsla(\${this.hue},80%,62%,.38)\`);
    c.beginPath();c.arc(this.x,this.y,this.r,0,Math.PI*2);c.fillStyle=g;c.fill();
    c.beginPath();c.arc(this.x-this.r*.3,this.y-this.r*.3,this.r*.22,0,Math.PI*2);
    c.fillStyle='rgba(255,255,255,.65)';c.fill();c.restore();
  }
}
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
const loop=()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  frame++;if(frame%CONFIG.spawnRate===0)bubbles.push(new Bubble(mx,my));
  bubbles=bubbles.filter(b=>b.alpha>0);
  bubbles.forEach(b=>{b.update();b.draw(ctx);});
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Bubble Float" cursor with soap-bubble radial gradients. Spec:
1. Spawn bubble every CONFIG.spawnRate (${5}) frames at cursor
2. Each: radius 7 to CONFIG.maxSize (${25})px, rise vy: -0.6 to -CONFIG.riseSpeed-0.6 (${-2.2}), wobble via sin
3. Radial gradient: bright highlight → translucent center → colored rim
4. Hue: CONFIG.hue (${200}) ± 20°, fade alpha -= 0.004
Provide React component (BubbleCursor) with all params as props.`,
  },
  {
    id: 12,
    name: 'Ripple Wave',
    tagline: 'Make waves wherever you click',
    description: 'Every click sends out expanding concentric ripples, like a stone dropped in still water.',
    tech: ['Canvas API', 'Expanding Circles'],
    params: [
      { key: 'hue',      label: 'Ripple Hue',     type: 'range', min: 0,   max: 360, step: 5, default: 220 },
      { key: 'speed',    label: 'Expand Speed',   type: 'range', min: 1,   max: 8,   step: 0.5, default: 3.2 },
      { key: 'count',    label: 'Rings per Click',type: 'range', min: 1,   max: 5,   step: 1, default: 3 },
    ],
    code: `const canvas=document.createElement('canvas');
canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9998;';
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d');
let ripples=[];
const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight;};
resize();window.addEventListener('resize',resize);

document.addEventListener('click',e=>{
  for(let i=0;i<CONFIG.count;i++){
    ripples.push({x:e.clientX,y:e.clientY,r:0,alpha:.82-i*.2,delay:i*5,age:0,
      hue:CONFIG.hue+Math.random()*30-15});
  }
});

const loop=()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ripples=ripples.filter(r=>r.alpha>0);
  ripples.forEach(r=>{
    r.age++;if(r.age<r.delay)return;
    r.r+=CONFIG.speed; r.alpha-=.011;
    ctx.save();ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
    ctx.strokeStyle=\`hsla(\${r.hue},80%,70%,\${Math.max(0,r.alpha)})\`;
    ctx.lineWidth=2;ctx.shadowColor=\`hsl(\${r.hue},80%,70%)\`;ctx.shadowBlur=8;
    ctx.stroke();ctx.restore();
  });
  requestAnimationFrame(loop);
};
loop();

// Cursor ring
const dot=document.createElement('div');
dot.style.cssText='position:fixed;pointer-events:none;z-index:9999;width:9px;height:9px;border-radius:50%;border:1.5px solid white;transform:translate(-50%,-50%);';
document.body.appendChild(dot);
document.addEventListener('mousemove',e=>{dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';});`,
    prompt: `Implement a "Ripple Wave" cursor — clicking creates expanding concentric rings. Spec:
1. On click: spawn CONFIG.count (${3}) rings with staggered delays (N*5 frames)
2. Each ring expands at CONFIG.speed (${3.2})px/frame, alpha fades from 0.82 down
3. Color: HSL hue CONFIG.hue (${220}) ± 15°, glow shadowBlur: 8
4. Cursor: small hollow ring (9px, white border)
Provide React component with click and mousemove ripple variants.`,
  },
  {
    id: 12,
    name: 'Glitch Shift',
    tagline: 'Break reality with RGB splits',
    description: 'The cursor fractures into offset RGB channel ghosts with random glitch bursts.',
    tech: ['CSS mix-blend-mode', 'DOM Elements'],
    params: [
      { key: 'split',           label: 'Channel Split (px)', type: 'range', min: 1, max: 16, step: 1, default: 4 },
      { key: 'glitchInterval',  label: 'Glitch Every (ms)',  type: 'range', min: 500, max: 5000, step: 250, default: 2000 },
      { key: 'burstDuration',   label: 'Burst Duration (ms)',type: 'range', min: 50, max: 500, step: 25, default: 220 },
    ],
    code: `const mkEl=(bg,zIndex,blend='screen')=>{
  const el=document.createElement('div');
  el.style.cssText=\`position:fixed;pointer-events:none;z-index:\${zIndex};
    width:13px;height:13px;border-radius:50%;
    background:\${bg};transform:translate(-50%,-50%);mix-blend-mode:\${blend};\`;
  document.body.appendChild(el); return el;
};

const main=mkEl('white',10000,'normal');
const r=mkEl('#ff0000',9998);
const g=mkEl('#00ff88',9998);
const b=mkEl('#0055ff',9998);

let mx=0,my=0,glitching=false,gt=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});

setInterval(()=>{
  glitching=true;gt=0;
  setTimeout(()=>{glitching=false;},CONFIG.burstDuration);
},CONFIG.glitchInterval);

const loop=()=>{
  main.style.left=mx+'px';main.style.top=my+'px';
  if(glitching){
    gt+=.55;
    r.style.left=(mx+Math.sin(gt)*CONFIG.split*3)+'px';r.style.top=(my+Math.cos(gt*1.2)*CONFIG.split)+'px';
    g.style.left=(mx+Math.sin(gt+2.1)*CONFIG.split*2)+'px';g.style.top=(my+2)+'px';
    b.style.left=(mx+Math.sin(gt+4.2)*CONFIG.split*2.5)+'px';b.style.top=(my-2)+'px';
  } else {
    r.style.left=(mx-CONFIG.split)+'px';r.style.top=(my-1)+'px';
    g.style.left=mx+'px';g.style.top=my+'px';
    b.style.left=(mx+CONFIG.split)+'px';b.style.top=(my+1)+'px';
  }
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Glitch Shift" cursor with RGB channel splitting. Spec:
1. Three elements (R,G,B) offset CONFIG.split (${4})px from main cursor, mix-blend-mode: screen
2. Every CONFIG.glitchInterval (${2000})ms: trigger CONFIG.burstDuration (${220})ms glitch burst
3. During burst: channels scramble with sine-wave offsets (amplitude ~CONFIG.split*3)
4. Main cursor: white dot, mix-blend-mode: normal, z-index above channels
Provide React component (GlitchCursor) with all params as props.`,
  },
  {
    id: 12,
    name: 'Wind Stream',
    tagline: 'Sculpt air with your movement',
    description: 'Bezier-curved wind streams flow from the cursor, bending and billowing like gusts of digital air.',
    tech: ['Canvas API', 'Quadratic Bezier'],
    params: [
      { key: 'hue',      label: 'Stream Hue',     type: 'range', min: 0,    max: 360, step: 5, default: 200 },
      { key: 'count',    label: 'Streams / Move', type: 'range', min: 1,    max: 5,   step: 1, default: 2 },
      { key: 'decay',    label: 'Velocity Decay', type: 'range', min: 0.8,  max: 0.98,step: 0.01, default: 0.93 },
      { key: 'minSpeed', label: 'Min Speed Trigger', type: 'range', min: 1, max: 10,  step: 0.5, default: 2.5 },
    ],
    code: `const canvas=document.createElement('canvas');
canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9998;';
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d');
let streams=[],mx=0,my=0;
const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight;};
resize();window.addEventListener('resize',resize);

document.addEventListener('mousemove',e=>{
  const dx=e.clientX-mx,dy=e.clientY-my;
  mx=e.clientX;my=e.clientY;
  const spd=Math.sqrt(dx*dx+dy*dy);
  if(spd>CONFIG.minSpeed){
    for(let i=0;i<CONFIG.count;i++){
      streams.push({
        points:[{x:mx,y:my}],
        vx:dx*.28+(Math.random()-.5)*3.5,
        vy:dy*.28+(Math.random()-.5)*3.5,
        alpha:.82,hue:CONFIG.hue+Math.random()*45-22,
      });
    }
  }
});

const loop=()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  streams=streams.filter(s=>s.alpha>.02);
  streams.forEach(s=>{
    s.vx*=CONFIG.decay;s.vy*=CONFIG.decay;s.vy+=.045;
    const last=s.points[s.points.length-1];
    s.points.push({x:last.x+s.vx,y:last.y+s.vy});
    if(s.points.length>22)s.points.shift();
    s.alpha*=.952;
    if(s.points.length<3)return;
    ctx.save();ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);
    for(let i=1;i<s.points.length-1;i++){
      const mx2=(s.points[i].x+s.points[i+1].x)/2,my2=(s.points[i].y+s.points[i+1].y)/2;
      ctx.quadraticCurveTo(s.points[i].x,s.points[i].y,mx2,my2);
    }
    ctx.strokeStyle=\`hsla(\${s.hue},80%,70%,\${s.alpha})\`;
    ctx.lineWidth=Math.max(.5,s.alpha*3.5);ctx.lineCap='round';
    ctx.shadowColor=\`hsl(\${s.hue},80%,70%)\`;ctx.shadowBlur=5;
    ctx.stroke();ctx.restore();
  });
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Wind Stream" cursor — Bezier-smoothed flow lines emitting from cursor movement. Spec:
1. Trigger when speed > CONFIG.minSpeed (${2.5})px/frame
2. Spawn CONFIG.count (${2}) stream particles per event
3. Each stream: velocity inherits movement (28%) + random spread, decay CONFIG.decay (${0.93})/frame
4. Drawn with quadraticCurveTo for smooth curves, alpha fades (* 0.952/frame)
5. Color: HSL hue CONFIG.hue (${200}) ± 22°
Provide React hook with configurable params.`,
  },
  {
    id: 12,
    name: 'DNA Helix',
    tagline: 'Double helix spirals behind you',
    description: 'Two sinusoidal trails spiral in a double-helix pattern behind the cursor as it moves.',
    tech: ['Canvas API', 'Sine Wave', 'Normal Vectors'],
    params: [
      { key: 'color1',    label: 'Strand 1 Color', type: 'color', default: '#7c5cfc' },
      { key: 'color2',    label: 'Strand 2 Color', type: 'color', default: '#5cf4fc' },
      { key: 'amplitude', label: 'Amplitude (px)', type: 'range', min: 4, max: 32, step: 2, default: 16 },
      { key: 'speed',     label: 'Wave Speed',     type: 'range', min: 0.03, max: 0.2, step: 0.01, default: 0.09 },
    ],
    code: `const canvas=document.createElement('canvas');
canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9998;';
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d');
const HIST=80;const path=[];
let mx=0,my=0,phase=0;
const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight;};
resize();window.addEventListener('resize',resize);
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});

const loop=()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  phase+=CONFIG.speed;path.push({x:mx,y:my});
  if(path.length>HIST)path.shift();
  if(path.length<4){requestAnimationFrame(loop);return;}

  for(let strand=0;strand<2;strand++){
    const phOff=strand*Math.PI;
    ctx.beginPath();let started=false;
    path.forEach((p,i)=>{
      const t=i/path.length,amp=CONFIG.amplitude*t;
      const wp=(phase*.65)+(i*.2)+phOff;
      const next=path[Math.min(i+1,path.length-1)],prev=path[Math.max(i-1,0)];
      const dx=next.x-prev.x,dy=next.y-prev.y;
      const len=Math.sqrt(dx*dx+dy*dy)||1;
      const nx=-dy/len,ny=dx/len;
      const wx=p.x+nx*Math.sin(wp)*amp,wy=p.y+ny*Math.sin(wp)*amp;
      if(!started){ctx.moveTo(wx,wy);started=true;}else ctx.lineTo(wx,wy);
    });
    ctx.strokeStyle=strand===0?CONFIG.color1:CONFIG.color2;
    ctx.lineWidth=2;ctx.lineCap='round';
    ctx.shadowColor=strand===0?CONFIG.color1:CONFIG.color2;ctx.shadowBlur=6;
    ctx.stroke();
  }
  for(let i=0;i<path.length;i+=10){
    const t=i/path.length,amp=CONFIG.amplitude*t,wp=(phase*.65)+(i*.2);
    const next=path[Math.min(i+1,path.length-1)],prev=path[Math.max(i-1,0)];
    const dx=next.x-prev.x,dy=next.y-prev.y,len=Math.sqrt(dx*dx+dy*dy)||1;
    const nx=-dy/len,ny=dx/len;
    const x1=path[i].x+nx*Math.sin(wp)*amp,y1=path[i].y+ny*Math.sin(wp)*amp;
    const x2=path[i].x+nx*Math.sin(wp+Math.PI)*amp,y2=path[i].y+ny*Math.sin(wp+Math.PI)*amp;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
    ctx.strokeStyle='rgba(200,200,255,.22)';ctx.lineWidth=1;ctx.shadowBlur=0;ctx.stroke();
  }
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "DNA Helix" cursor — two sinusoidal strands forming a double helix trail. Spec:
1. Store last 80 cursor positions as path history
2. At each point, compute perpendicular normal vector (rotated 90°)
3. Displace along normal by sin(phase + i * 0.2) * CONFIG.amplitude (${16}), growing from 0 at tail
4. Two strands 180° out of phase (strand 2 offset = π)
5. Colors: CONFIG.color1 (${'"#7c5cfc"'}) and CONFIG.color2 (${'"#5cf4fc"'})
6. Cross-links (rungs) every 10 points; wave speed CONFIG.speed (${0.09})
Provide React component with all params configurable.`,
  },
  {
    id: 12,
    name: 'Torch Light',
    tagline: 'Navigate the dark with your cursor',
    description: 'The screen goes dark except for a warm torch-light circle around the cursor that flickers.',
    tech: ['CSS radial-gradient', 'Dark Overlay'],
    params: [
      { key: 'radius',           label: 'Light Radius (px)',   type: 'range', min: 60,  max: 300, step: 10, default: 140 },
      { key: 'darkness',         label: 'Darkness (0–1)',      type: 'range', min: 0.5, max: 0.98,step: 0.02, default: 0.91 },
      { key: 'flickerIntensity', label: 'Flicker Intensity',  type: 'range', min: 0,   max: 20,  step: 1, default: 9 },
    ],
    code: `const overlay=document.createElement('div');
overlay.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9996;';
document.body.appendChild(overlay);

const flame=document.createElement('div');
flame.style.cssText='position:fixed;pointer-events:none;z-index:9999;width:9px;height:9px;border-radius:50%;background:#ffb347;box-shadow:0 0 14px 5px rgba(255,140,20,.65);transform:translate(-50%,-50%);';
document.body.appendChild(flame);

let tx=0,ty=0,cx=innerWidth/2,cy=innerHeight/2,flick=0;
document.addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;});

const loop=()=>{
  cx+=(tx-cx)*.11;cy+=(ty-cy)*.11;
  flame.style.left=tx+'px';flame.style.top=ty+'px';
  flick+=.09;
  const f=Math.sin(flick)*CONFIG.flickerIntensity+Math.sin(flick*2.4)*CONFIG.flickerIntensity*.44;
  const r=CONFIG.radius+f;
  overlay.style.background=\`radial-gradient(circle \${r}px at \${cx}px \${cy}px,
    rgba(255,120,18,.09) 0%,rgba(255,80,0,.04) 38%,
    rgba(0,0,0,\${CONFIG.darkness}) 72%,rgba(0,0,0,\${CONFIG.darkness+.06}) 100%)\`;
  requestAnimationFrame(loop);
};
loop();`,
    prompt: `Implement a "Torch Light" cursor — dark overlay with warm flickering light hole. Spec:
1. Fixed overlay using radial-gradient: transparent center → rgba(0,0,0,CONFIG.darkness (${0.91})) edges
2. Circle radius = CONFIG.radius (${140}) + flicker (sin waves ± CONFIG.flickerIntensity (${9}))
3. Cursor has 0.11 lerp lag for the light hole (flame dot follows instantly)
4. Warm amber flame dot (9px, #ffb347) with amber glow
Provide React component with configurable radius, darkness, flickerIntensity.`,
  },
];

export default CURSORS;
