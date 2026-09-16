import React, { useEffect, useRef } from 'react';
import { ScoreboardThemeId } from '../types';

interface Arena3DCanvasProps {
  colorLeft: string;
  colorRight: string;
  isUrgent: boolean;
  isExpired: boolean;
  scoreShockwave: boolean;
  scoringTeam?: 'left' | 'right' | null;
  raidTime?: number;
  isRaidRunning?: boolean;
  theme?: ScoreboardThemeId;
}

interface QuantumParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
}

interface LightningBolt {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  segments: { x: number; y: number }[];
  alpha: number;
  color: string;
  width: number;
}

interface SupernovaBlast {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

interface StellarSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export const Arena3DCanvas: React.FC<Arena3DCanvasProps> = ({
  colorLeft = '#2563eb',
  colorRight = '#dc2626',
  isUrgent,
  isExpired,
  scoreShockwave,
  scoringTeam,
  raidTime = 30,
  isRaidRunning = false,
  theme = 'sleek-obsidian',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synced state ref for zero-latency 60FPS loop
  const stateRef = useRef({
    isUrgent,
    isExpired,
    scoreShockwave,
    scoringTeam,
    raidTime,
    isRaidRunning,
    colorLeft,
    colorRight,
    theme,
  });

  useEffect(() => {
    stateRef.current = {
      isUrgent,
      isExpired,
      scoreShockwave,
      scoringTeam,
      raidTime,
      isRaidRunning,
      colorLeft,
      colorRight,
      theme,
    };
  }, [isUrgent, isExpired, scoreShockwave, scoringTeam, raidTime, isRaidRunning, colorLeft, colorRight, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ================= 1. QUANTUM PARTICLES & VORTEX SIMULATION =================
    const particles: QuantumParticle[] = [];
    const numParticles = 140;

    for (let i = 0; i < numParticles; i++) {
      const isOrbiter = i < 60; // 60 particles spiral in the central gravitational accretion disc
      const orbitRad = Math.random() * 260 + 40;
      const side = Math.random();
      const color =
        side < 0.45 ? '#00f0ff' : side < 0.9 ? '#ff0055' : '#ffffff';

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 1.0,
        alpha: Math.random() * 0.6 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
        color,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadius: orbitRad,
        orbitSpeed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    // Dynamic Lightning Tendrils
    let lightnings: LightningBolt[] = [];

    // Detonation & Supernova Blasts
    const supernovaBlasts: SupernovaBlast[] = [];
    const stellarSparks: StellarSpark[] = [];

    // Trigger explosive cosmic shockwave when a point is scored
    const triggerCosmicDetonation = (side: 'left' | 'right' | null) => {
      const originX =
        side === 'left' ? width * 0.24 : side === 'right' ? width * 0.76 : width * 0.5;
      const originY = height * 0.5;
      const blastColor = side === 'left' ? '#00f0ff' : side === 'right' ? '#ff0055' : '#ffea00';

      // 1. Triple expanding shockwave rings
      for (let r = 0; r < 3; r++) {
        supernovaBlasts.push({
          x: originX,
          y: originY,
          radius: 10 + r * 30,
          maxRadius: Math.max(width, height) * 0.85,
          alpha: 1.0 - r * 0.2,
          color: blastColor,
          lineWidth: 5 - r * 1.2,
        });
      }

      // 2. Exploding constellation sparks (90 particles)
      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 18 + 4;
        stellarSparks.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4.0 + 1.5,
          alpha: 1.0,
          decay: Math.random() * 0.025 + 0.012,
          color: Math.random() > 0.3 ? blastColor : '#ffffff',
        });
      }

      // 3. Lightning discharge from explosion to center
      generateLightning(originX, originY, width * 0.5, height * 0.5, blastColor);
    };

    const generateLightning = (
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      color: string
    ) => {
      const segments = [{ x: sx, y: sy }];
      const steps = 14;
      const dx = (ex - sx) / steps;
      const dy = (ey - sy) / steps;

      for (let i = 1; i < steps; i++) {
        const displacement = (Math.random() - 0.5) * 45;
        segments.push({
          x: sx + dx * i + displacement,
          y: sy + dy * i + displacement,
        });
      }
      segments.push({ x: ex, y: ey });

      lightnings.push({
        startX: sx,
        startY: sy,
        endX: ex,
        endY: ey,
        segments,
        alpha: 1.0,
        color,
        width: Math.random() * 2.5 + 1.5,
      });
    };

    if (scoreShockwave) {
      triggerCosmicDetonation(scoringTeam || null);
    }

    let time = 0;
    let pulseWave = 0;

    // ================= 60 FPS QUANTUM FLUID NEXUS RENDER LOOP =================
    const render = () => {
      time += 0.018;
      const {
        isUrgent: urgent,
        isExpired: expired,
        isRaidRunning: running,
      } = stateRef.current;

      const speedFactor = expired ? 3.4 : urgent ? 2.6 : running ? 1.0 : 0.45;
      pulseWave = (pulseWave + 0.03 * speedFactor) % (Math.PI * 2);

      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.5;

      // =======================================================================
      // DYNAMIC THEME ROUTING
      // =======================================================================
      const activeTheme = stateRef.current.theme || 'sleek-obsidian';

      if (activeTheme === 'titan-mech') {
        // --- TITAN HEAVY ARMOR THEME ---
        // Industrial Hex-Grid & Slow Scanning Lazers
        ctx.fillStyle = '#050a12';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        const hexSize = 60;
        const h = Math.sqrt(3) * hexSize;
        
        for (let y = -h; y < height + h; y += h) {
          for (let x = -hexSize; x < width + hexSize * 2; x += hexSize * 3) {
            for (let i = 0; i < 2; i++) {
              const cx = x + (i * hexSize * 1.5);
              const cy = y + (i * h / 2);
              
              ctx.beginPath();
              for (let a = 0; a < 6; a++) {
                const angle = a * Math.PI / 3;
                const hx = cx + hexSize * Math.cos(angle);
                const hy = cy + hexSize * Math.sin(angle);
                if (a === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
              }
              ctx.closePath();
              ctx.stroke();
            }
          }
        }
        ctx.restore();

        // Slow scanning hazard bar
        const scanY = (time * 100 * speedFactor) % (height * 1.5) - height * 0.25;
        const scanGrad = ctx.createLinearGradient(0, scanY - 100, 0, scanY + 100);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, urgent ? 'rgba(255, 100, 0, 0.15)' : 'rgba(56, 189, 248, 0.1)');
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 100, width, 200);

      } else if (activeTheme === 'turbo-velocity') {
        // --- TURBO VELOCITY THEME ---
        // Racing stripes and motion blur
        const voidGrad = ctx.createLinearGradient(0, 0, 0, height);
        voidGrad.addColorStop(0, '#100105');
        voidGrad.addColorStop(0.5, '#050002');
        voidGrad.addColorStop(1, '#080003');
        ctx.fillStyle = voidGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-0.15);
        ctx.translate(-centerX, -centerY);
        
        const stripeSpeed = time * 800 * speedFactor;
        for (let i = 0; i < 25; i++) {
          const sy = (i * 80) - height * 0.5;
          const sx = (stripeSpeed + i * 500) % (width * 2) - width;
          ctx.fillStyle = i % 3 === 0 ? `rgba(255, 23, 83, ${0.05 + 0.05 * Math.sin(time)})` : 'rgba(255,255,255,0.02)';
          ctx.fillRect(sx, sy, width * 0.5, 4 + i % 6);
        }
        ctx.restore();

      } else if (activeTheme === 'cyber-glitch') {
        // --- NEON CYBERPUNK THEME ---
        // Binary matrix rain and digital grid
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.lineWidth = 1.5;
        
        // Grid
        for(let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for(let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Glitching data streams
        const streamSpeed = time * 200 * speedFactor;
        for (let i = 0; i < 15; i++) {
          const sx = (i * width / 15);
          const sy = (streamSpeed * (1 + i * 0.2)) % (height * 1.5) - height * 0.25;
          ctx.fillStyle = urgent ? '#ff0055' : '#00f0ff';
          ctx.globalAlpha = 0.4 + 0.3 * Math.sin(time * 5 + i);
          ctx.font = '14px monospace';
          ctx.fillText(Math.random() > 0.5 ? '1' : '0', sx, sy);
          ctx.fillText(Math.random() > 0.5 ? '1' : '0', sx, sy - 20);
          ctx.fillText(Math.random() > 0.5 ? '1' : '0', sx, sy - 40);
        }
        ctx.restore();
        
      } else if (activeTheme === 'apex-gold') {
        // --- APEX CHAMPIONSHIP THEME ---
        // Royal Volumetric Spotlights & Gold Dust
        const voidGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.8);
        voidGrad.addColorStop(0, '#1c1002');
        voidGrad.addColorStop(0.6, '#080400');
        voidGrad.addColorStop(1, '#000000');
        ctx.fillStyle = voidGrad;
        ctx.fillRect(0, 0, width, height);

        // Volumetric Light Rays
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const numRays = 8;
        for (let i = 0; i < numRays; i++) {
          const rayAngle = (i / numRays) * Math.PI * 2 + time * 0.1 * speedFactor;
          const rayGrad = ctx.createLinearGradient(centerX, centerY, centerX + Math.cos(rayAngle) * width, centerY + Math.sin(rayAngle) * width);
          rayGrad.addColorStop(0, `rgba(251, 191, 36, ${0.1 + 0.05 * Math.sin(time * 2 + i)})`);
          rayGrad.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, width, rayAngle - 0.2, rayAngle + 0.2);
          ctx.closePath();
          ctx.fillStyle = rayGrad;
          ctx.fill();
        }
        ctx.restore();

      } else {
        // --- SLEEK OBSIDIAN (DEFAULT / QUANTUM FLUID NEXUS) ---
        const voidGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          40,
          centerX,
          centerY,
          Math.max(width, height) * 0.75
        );
        voidGrad.addColorStop(0, '#040714');
        voidGrad.addColorStop(0.5, '#020308');
        voidGrad.addColorStop(1, '#000103');
        ctx.fillStyle = voidGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // =======================================================================
      // SHARED EFFECTS: EXPLOSIONS, SPARKS & LIGHTNING 
      // =======================================================================

      if (activeTheme === 'sleek-obsidian') {
        // ================= 2. UNDULATING QUANTUM FLUID ENERGY CURTAINS =================
        // We render multi-layered luminous mathematical wave harmonics that flow across the arena
        const numWaves = 6;
        ctx.save();
        for (let w = 0; w < numWaves; w++) {
          const waveSpeed = time * (0.8 + w * 0.2) * speedFactor;
          const waveFreq = 0.0025 + w * 0.0008;
          const waveAmp = (45 + w * 18) * (urgent ? 1.4 : 1.0);
          const yOffset = centerY + (w - numWaves / 2) * 60 + Math.sin(waveSpeed) * 30;

          ctx.beginPath();
          ctx.moveTo(0, yOffset);

          for (let x = 0; x <= width; x += 15) {
            // Dual-frequency organic sinusoidal interference equation
            const y =
              yOffset +
              Math.sin(x * waveFreq + waveSpeed) * waveAmp +
              Math.cos(x * (waveFreq * 1.6) - waveSpeed * 0.7) * (waveAmp * 0.4);
            ctx.lineTo(x, y);
          }

          // Color mapping: Left is Cryo Cyan, Right is Plasma Red/Magenta
          // Under 10s: Everything mutates into intense Solar Gold & Fiery Magma!
          const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
          if (urgent) {
            waveGrad.addColorStop(0, `rgba(255, 140, 0, ${0.18 + (w % 2) * 0.12})`);
            waveGrad.addColorStop(0.5, `rgba(255, 215, 0, ${0.28 + (w % 2) * 0.15})`);
            waveGrad.addColorStop(1, `rgba(255, 50, 0, ${0.22 + (w % 2) * 0.12})`);
          } else if (expired) {
            waveGrad.addColorStop(0, `rgba(255, 0, 60, ${0.35})`);
            waveGrad.addColorStop(0.5, `rgba(255, 40, 40, ${0.45})`);
            waveGrad.addColorStop(1, `rgba(255, 0, 60, ${0.35})`);
          } else {
            waveGrad.addColorStop(0, `rgba(0, 240, 255, ${0.15 + (w % 2) * 0.08})`);
            waveGrad.addColorStop(0.4, `rgba(37, 99, 235, ${0.12 + (w % 2) * 0.06})`);
            waveGrad.addColorStop(0.6, `rgba(219, 39, 119, ${0.12 + (w % 2) * 0.06})`);
            waveGrad.addColorStop(1, `rgba(255, 0, 85, ${0.16 + (w % 2) * 0.08})`);
          }

          ctx.strokeStyle = waveGrad;
          ctx.lineWidth = 2.5 + w * 0.6;
          ctx.shadowColor = urgent ? '#ffaa00' : w % 2 === 0 ? '#00f0ff' : '#ff0055';
          ctx.shadowBlur = 15;
          ctx.stroke();
        }
        ctx.restore();

        // ================= 3. CENTRAL GRAVITATIONAL SINGULARITY & ACCRETION VORTEX =================
        // Placed in the center behind the Raid Clock
        const vortexRadius = Math.min(width, height) * 0.28;

        ctx.save();
        ctx.translate(centerX, centerY);

        // Rotating Singularity Accretion Rings
        const numRings = 4;
        for (let r = 1; r <= numRings; r++) {
          const rad = (vortexRadius / numRings) * r;
          const ringRotation = time * (0.4 / r) * (r % 2 === 0 ? 1 : -1) * speedFactor;

          ctx.save();
          ctx.rotate(ringRotation);
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);

          const ringAlpha = 0.12 + Math.sin(pulseWave + r) * 0.08;
          ctx.strokeStyle = urgent
            ? `rgba(255, 170, 0, ${ringAlpha * 2.2})`
            : r % 2 === 0
            ? `rgba(0, 240, 255, ${ringAlpha * 1.8})`
            : `rgba(255, 0, 85, ${ringAlpha * 1.8})`;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([12 + r * 6, 20 + r * 4]);
          ctx.stroke();
          ctx.restore();
        }

        // Gravitational Wave Expansion Halos (Rhythmic expansion)
        const haloRadius = ((time * 80 * speedFactor) % (vortexRadius * 1.6)) + 20;
        const haloAlpha = 1.0 - haloRadius / (vortexRadius * 1.6);
        ctx.beginPath();
        ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
        ctx.strokeStyle = urgent ? '#ffd700' : '#00f0ff';
        ctx.globalAlpha = haloAlpha * (urgent ? 0.6 : 0.25);
        ctx.lineWidth = 3;
        ctx.shadowColor = urgent ? '#ff8800' : '#00f0ff';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      if (activeTheme === 'sleek-obsidian') {
        // ================= 4. RANDOM HIGH-VOLTAGE LIGHTNING ARCS =================
        // Spawn subtle electrical arcing between the two opposing energy cores
        if (Math.random() < (urgent ? 0.08 : 0.025)) {
          const isLeftSource = Math.random() > 0.5;
          const sx = isLeftSource ? width * 0.15 + (Math.random() - 0.5) * 80 : width * 0.85 + (Math.random() - 0.5) * 80;
          const sy = centerY + (Math.random() - 0.5) * 200;
          const tx = centerX + (Math.random() - 0.5) * 120;
          const ty = centerY + (Math.random() - 0.5) * 120;
          const boltColor = isLeftSource ? '#00f0ff' : '#ff0055';
          generateLightning(sx, sy, tx, ty, urgent ? '#ffcc00' : boltColor);
        }

        // Render Active Lightning Tendrils
        for (let i = lightnings.length - 1; i >= 0; i--) {
          const bolt = lightnings[i];
          bolt.alpha -= 0.08;

          if (bolt.alpha <= 0) {
            lightnings.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.strokeStyle = bolt.color;
          ctx.globalAlpha = bolt.alpha;
          ctx.lineWidth = bolt.width;
          ctx.shadowColor = bolt.color;
          ctx.shadowBlur = 18;

          ctx.beginPath();
          for (let s = 0; s < bolt.segments.length; s++) {
            const pt = bolt.segments[s];
            if (s === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
          ctx.restore();
        }

        // ================= 5. CONSTELLATION FILAMENTS & QUANTUM PARTICLES =================
        // Update particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (i < 60) {
            // Accretion orbit particles spiraling around the center
            p.orbitAngle += p.orbitSpeed * speedFactor;
            p.x = centerX + Math.cos(p.orbitAngle) * p.orbitRadius;
            p.y = centerY + Math.sin(p.orbitAngle) * (p.orbitRadius * 0.65); // 3D elliptical tilt
          } else {
            // Free quantum particles drifting through the cosmos
            p.x += p.vx * speedFactor;
            p.y += p.vy * speedFactor;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
          }

          let pColor = p.color;
          if (urgent) {
            pColor = Math.random() > 0.3 ? '#ffaa00' : '#ffd700';
          } else if (expired) {
            pColor = '#ff0033';
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
          ctx.fillStyle = pColor;
          ctx.globalAlpha = p.alpha * (urgent ? 0.95 : 0.6);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 10 * p.z;
          ctx.fill();
          ctx.restore();
        }

        // Dynamic Constellation Filaments: connect nearby particles with glowing laser threads
        ctx.save();
        const maxConnectDist = 85;
        for (let i = 0; i < 60; i++) {
          for (let j = i + 1; j < 60; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxConnectDist) {
              const filamentAlpha = (1.0 - dist / maxConnectDist) * (urgent ? 0.35 : 0.18);
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = urgent
                ? `rgba(255, 170, 0, ${filamentAlpha})`
                : `rgba(0, 240, 255, ${filamentAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      } else if (activeTheme === 'titan-mech') {
        // Render sparks and falling debris
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += (p.vy + 1.5) * speedFactor; // Fall down
          p.x += Math.sin(time + p.z) * 1.5; // Sway
          
          if (p.y > height) {
            p.y = 0;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.fillStyle = urgent ? '#ff5500' : '#ffaa00';
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (activeTheme === 'apex-gold') {
        // Floating gold confetti
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y -= (Math.abs(p.vy) + 0.5) * speedFactor; // Float up
          p.x += Math.sin(time + i) * 2; // Sway
          
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.fillStyle = urgent ? '#ff0000' : '#ffd700';
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 5;
          ctx.shadowColor = urgent ? '#ff0000' : '#ffd700';
          ctx.translate(p.x, p.y);
          ctx.rotate(time * p.vx + i);
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
          ctx.restore();
        }
      }


      // ================= 6. SUPERNOVA SHOCKWAVE DETONATIONS =================
      for (let i = supernovaBlasts.length - 1; i >= 0; i--) {
        const blast = supernovaBlasts[i];
        blast.radius += 24;
        blast.alpha -= 0.022;

        if (blast.alpha <= 0 || blast.radius > blast.maxRadius) {
          supernovaBlasts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(blast.x, blast.y, blast.radius, 0, Math.PI * 2);
        ctx.strokeStyle = blast.color;
        ctx.globalAlpha = blast.alpha;
        ctx.lineWidth = blast.lineWidth * blast.alpha;
        ctx.shadowColor = blast.color;
        ctx.shadowBlur = 35;
        ctx.stroke();
        ctx.restore();
      }

      // ================= 7. STELLAR SPARKS (POINT SCORE EXPLOSIONS) =================
      for (let i = stellarSparks.length - 1; i >= 0; i--) {
        const s = stellarSparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.98;
        s.vy *= 0.98;
        s.alpha -= s.decay;

        if (s.alpha <= 0 || s.x < 0 || s.x > width || s.y < 0 || s.y > height) {
          stellarSparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 14;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
