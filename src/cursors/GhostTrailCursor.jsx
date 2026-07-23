import { useEffect, useRef } from 'react';

const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function GhostTrailCursor({ containerRef, config }) {
  const container = containerRef?.current;
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute; inset:0; pointer-events:none; z-index:35;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Physics state
    let mx = container.clientWidth / 2;
    let my = container.clientHeight / 2;
    let gx = mx, gy = my; // ghost position
    let vx = 0, vy = 0;   // ghost velocity
    let time = 0;
    let clickT = -1;

    // Drifting particles
    let particles = [];

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };

    const onClick = () => {
      const cfg = configRef.current || {};
      if (cfg.clickAnim !== false) {
        clickT = 0;
      }
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);


    let rafId;
    const loop = () => {
      const cfg = configRef.current || {};
      const color = cfg.color ?? '#ffffff';
      const glowColor = cfg.glowColor ?? '#7c5cfc';
      const size = cfg.size ?? 22;
      const stiffness = cfg.stiffness ?? 0.12;
      const damping = cfg.damping ?? 0.78;
      const glowRadius = cfg.glowRadius ?? 15;
      const particleRate = cfg.particleCount ?? 3;

      time += 0.05;

      // Spring physics to follow mouse
      const ax = (mx - gx) * stiffness;
      const ay = (my - gy) * stiffness;
      vx = (vx + ax) * damping;
      vy = (vy + ay) * damping;
      gx += vx;
      gy += vy;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check if mouse is over interactive element
      const rect = container.getBoundingClientRect();
      const isPointer = (cfg.pointerAnim !== false) && checkPointer(rect.left + mx, rect.top + my);

      // Scale multiplier on hover
      const pScale = cfg.pointerScale ?? 1.5;
      const hoverScale = isPointer ? pScale : 1.0;

      // Handle click animation
      let clickScaleMult = 1.0;
      if (clickT >= 0) {
        const bounce = Math.sin(clickT * Math.PI);
        const cScale = cfg.clickScale ?? 0.5;
        clickScaleMult = 1.0 + bounce * cScale;
        clickT += 0.06; // smooth bounce speed
        if (clickT >= 1) clickT = -1;
      }

      const rSize = size * hoverScale * clickScaleMult;

      // Spawn drifting particles from ghost bottom
      if (particleRate > 0 && Math.random() < particleRate * 0.15) {
        particles.push({
          x: gx + (Math.random() - 0.5) * rSize * 1.5,
          y: gy + rSize * 1.2,
          vx: (Math.random() - 0.5) * 1.0 - vx * 0.1,
          vy: Math.random() * 1.2 + 0.5,
          life: 1.0,
          size: Math.random() * 3 + 2,
          color: glowColor,
        });
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.globalAlpha = p.life * 0.6;
        ctx.fill();
        ctx.restore();
      });


      // Calculate look offset for face based on current movement direction
      const travelDist = Math.sqrt(vx * vx + vy * vy);
      let lookX = 0;
      let lookY = 0;
      if (travelDist > 0.5) {
        lookX = (vx / travelDist) * 5;
        lookY = (vy / travelDist) * 3;
      }

      // Draw Ghost body
      ctx.save();

      // Ghost glow shadow
      if (glowRadius > 0) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowRadius;
      }

      ctx.fillStyle = color;
      ctx.beginPath();

      // We tilt the ghost slightly depending on horizontal speed
      const tilt = Math.max(-0.25, Math.min(0.25, vx * 0.012));
      ctx.translate(gx, gy);
      ctx.rotate(tilt);

      // Draw smooth rounded top head
      ctx.arc(0, 0, rSize, Math.PI, 0, false);

      // Draw sides and wavy bottom trail using bezier curve / sine wiggles
      const bodyHeight = rSize * 1.8;
      ctx.lineTo(rSize, bodyHeight);

      // Wavy bottom skirt wiggles
      const waveCount = 3;
      const waveAmplitude = rSize * 0.15;
      for (let i = 0; i <= 20; i++) {
        const tVal = i / 20;
        const xOffset = rSize - tVal * (rSize * 2);
        // wiggle bottom using a sine wave synced to time
        const yOffset = bodyHeight + Math.sin(time * 2.8 + tVal * Math.PI * waveCount) * waveAmplitude;
        ctx.lineTo(xOffset, yOffset);
      }

      ctx.lineTo(-rSize, bodyHeight);
      ctx.closePath();
      ctx.fill();

      // Draw wiggling floating arms
      ctx.beginPath();
      // Left arm waving
      const lArmAngle = Math.sin(time * 1.6) * 0.28 - 0.2;
      ctx.save();
      ctx.translate(-rSize * 0.85, rSize * 0.4);
      ctx.rotate(lArmAngle);
      ctx.ellipse(0, 0, rSize * 0.5, rSize * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // Right arm waving
      const rArmAngle = -Math.sin(time * 1.6) * 0.28 + 0.2;
      ctx.save();
      ctx.translate(rSize * 0.85, rSize * 0.4);
      ctx.rotate(rArmAngle);
      ctx.ellipse(0, 0, rSize * 0.5, rSize * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // Draw cute face
      // Remove glow shadow for eyes and mouth to keep them sharp
      ctx.shadowBlur = 0;

      // Eyes
      ctx.fillStyle = '#000000';
      const eyeR = Math.max(2, rSize * 0.12);
      const eyeSpacing = rSize * 0.38;

      // Left Eye
      ctx.beginPath();
      ctx.arc(-eyeSpacing + lookX, -rSize * 0.1 + lookY, eyeR, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      ctx.beginPath();
      ctx.arc(eyeSpacing + lookX, -rSize * 0.1 + lookY, eyeR, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.beginPath();
      const mouthW = Math.max(3, rSize * 0.18);
      const mouthH = Math.max(2, rSize * 0.1 + Math.max(0, Math.sin(time * 2.0) * rSize * 0.05));
      ctx.ellipse(lookX, rSize * 0.22 + lookY, mouthW, mouthH, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      canvas.remove();
    };
  }, [container]);

  return null;
}
