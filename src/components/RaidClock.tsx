import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScoreboardThemeId } from '../types';

interface RaidClockProps {
  raidTime: number;
  totalDuration?: number;
  isRaidRunning: boolean;
  isThirdRaid?: boolean;
  theme?: ScoreboardThemeId;
}

interface SparkParticle {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
  wobble: number;
  life: number;
  maxLife: number;
}

export const RaidClock: React.FC<RaidClockProps> = ({
  raidTime,
  totalDuration = 30,
  isRaidRunning,
  isThirdRaid = false,
  theme = 'sleek-obsidian',
}) => {
  // CRITICAL REQUIREMENT: Color change animations start at 10 seconds and below!
  const isWarning = raidTime <= 10 && raidTime > 0;
  const isExpired = raidTime === 0;

  // Canvas ref for high-performance 60FPS particle & plasma graphics
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-frequency sub-second millisecond ticker for continuous kinetic sensation
  const [subMillis, setSubMillis] = useState<number>(99);
  const lastSecTimeRef = useRef<number>(Date.now());
  const raidTimeRef = useRef<number>(raidTime);
  raidTimeRef.current = raidTime;

  // Track second changes for shockwave burst
  useEffect(() => {
    lastSecTimeRef.current = Date.now();
  }, [raidTime]);

  // Main 60FPS Canvas Animation Loop: Plasma Vortex, Rotating Reticles, Trailing Sparks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation1 = 0;
    let rotation2 = 0;
    let radarAngle = 0;
    let pulsePhase = 0;

    // Seed orbiting particles
    const particles: SparkParticle[] = [];
    const maxParticles = 65;

    const baseColorsCyan = ['#38bdf8', '#00f0ff', '#0284c7', '#ffffff', '#60a5fa'];
    const baseColorsOrange = ['#ff4500', '#ff8c00', '#ffa500', '#ff0055', '#ffffff', '#ffd700'];
    const baseColorsRed = ['#ef4444', '#dc2626', '#b91c1c', '#ff0000', '#ffffff'];

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: 114 + (Math.random() - 0.5) * 22,
        speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2.4 + 1.0,
        alpha: Math.random() * 0.8 + 0.2,
        color: '#38bdf8',
        wobble: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: Math.random() * 120 + 80,
      });
    }

    // Set canvas dimensions
    const width = 340;
    const height = 340;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = 118;

    let currentThemeTracker = theme;

    const render = () => {
      // Clear canvas fully
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Reset particles if theme changes
      if (currentThemeTracker !== theme) {
        particles.length = 0;
        currentThemeTracker = theme;
      }

      const currentTime = raidTimeRef.current;
      const warningActive = currentTime <= 10 && currentTime > 0;
      const expiredActive = currentTime === 0;
      const running = isRaidRunning && !expiredActive;

      const baseColorsApex = ['#fbbf24', '#f59e0b', '#ffd700', '#ffffff', '#b45309'];
      const baseColorsCyber = ['#00f0ff', '#ff007f', '#ffffff', '#a855f7', '#06b6d4'];
      const baseColorsTitan = ['#38bdf8', '#f59e0b', '#94a3b8', '#ffffff', '#0284c7'];
      const baseColorsCyan = ['#38bdf8', '#00f0ff', '#0284c7', '#ffffff', '#60a5fa'];
      const baseColorsOrange = ['#ff4500', '#ff8c00', '#ffa500', '#ff0055', '#ffffff', '#ffd700'];
      const baseColorsRed = ['#ef4444', '#dc2626', '#b91c1c', '#ff0000', '#ffffff'];

      const primaryColor = expiredActive ? '#ef4444' : warningActive ? '#ff6b00' : theme === 'apex-gold' ? '#fbbf24' : theme === 'cyber-glitch' ? '#00f0ff' : theme === 'titan-mech' ? '#38bdf8' : '#00e5ff';
      const secondaryColor = expiredActive ? '#b91c1c' : warningActive ? '#ffaa00' : theme === 'apex-gold' ? '#b45309' : theme === 'cyber-glitch' ? '#ff007f' : theme === 'titan-mech' ? '#d97706' : '#2563eb';
      const currentColors = expiredActive ? baseColorsRed : warningActive ? baseColorsOrange : theme === 'apex-gold' ? baseColorsApex : theme === 'cyber-glitch' ? baseColorsCyber : theme === 'titan-mech' ? baseColorsTitan : baseColorsCyan;

      const speedMultiplier = warningActive ? 2.8 : running ? 1.0 : 0.25;

      rotation1 += 0.008 * speedMultiplier;
      rotation2 -= 0.012 * speedMultiplier;
      radarAngle += 0.025 * speedMultiplier;
      pulsePhase += 0.05 * speedMultiplier;

      if (running) {
        const elapsed = (Date.now() - lastSecTimeRef.current) % 1000;
        const frac = 1000 - elapsed;
        setSubMillis(Math.floor((frac / 1000) * 99));
      } else if (expiredActive) {
        setSubMillis(0);
      }

      const progressRatio = Math.max(0, Math.min(1, currentTime / (totalDuration || 30)));
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + progressRatio * Math.PI * 2;

      ctx.save();
      ctx.translate(centerX, centerY);

      if (theme === 'titan-mech') {
        // --- TITAN-MECH THEME ---
        // Heavy Industrial Look
        
        // Outer Gear
        ctx.save();
        ctx.rotate(rotation1 * 0.5);
        ctx.beginPath();
        for (let i = 0; i < 24; i++) {
          const ang = (i / 24) * Math.PI * 2;
          const r1 = baseRadius + 15;
          const r2 = baseRadius + 22;
          ctx.lineTo(Math.cos(ang - 0.05) * r1, Math.sin(ang - 0.05) * r1);
          ctx.lineTo(Math.cos(ang - 0.02) * r2, Math.sin(ang - 0.02) * r2);
          ctx.lineTo(Math.cos(ang + 0.02) * r2, Math.sin(ang + 0.02) * r2);
          ctx.lineTo(Math.cos(ang + 0.05) * r1, Math.sin(ang + 0.05) * r1);
        }
        ctx.closePath();
        ctx.fillStyle = warningActive ? 'rgba(255, 60, 0, 0.3)' : 'rgba(56, 189, 248, 0.2)';
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Inner Structural Ring
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius - 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 14;
        ctx.stroke();

        // Hex bolts on inner ring
        for(let i=0; i<8; i++) {
           const a = (i/8)*Math.PI*2;
           ctx.beginPath();
           ctx.arc(Math.cos(a)*(baseRadius-8), Math.sin(a)*(baseRadius-8), 3, 0, Math.PI*2);
           ctx.fillStyle = '#94a3b8';
           ctx.fill();
        }

        // Progress Bar Background (Trench)
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Molten Progress Arc
        if (progressRatio > 0.001) {
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius + 4, startAngle, endAngle);
          ctx.strokeStyle = warningActive ? '#ff4500' : '#0ea5e9';
          ctx.lineWidth = 8;
          ctx.lineCap = 'square';
          ctx.shadowBlur = 15;
          ctx.shadowColor = warningActive ? '#ff4500' : '#0ea5e9';
          ctx.stroke();
          ctx.shadowBlur = 0; // reset

          // Laser Core
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius + 4, startAngle, endAngle);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Hammer Head
          const headX = Math.cos(endAngle) * (baseRadius + 4);
          const headY = Math.sin(endAngle) * (baseRadius + 4);
          ctx.save();
          ctx.translate(headX, headY);
          ctx.rotate(endAngle);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-4, -12, 8, 24);
          ctx.strokeStyle = warningActive ? '#ff4500' : '#0ea5e9';
          ctx.lineWidth = 2;
          ctx.strokeRect(-4, -12, 8, 24);
          ctx.restore();

          if (running && Math.random() < (warningActive ? 0.9 : 0.4)) {
            particles.push({
              angle: endAngle,
              distance: baseRadius + 4,
              speed: 0,
              size: Math.random() * 4 + 2,
              alpha: 1,
              color: warningActive ? '#ffaa00' : '#7dd3fc',
              wobble: (Math.random() - 0.5) * 6, // vx
              life: 0,
              maxLife: Math.random() * 30 + 10,
            });
          }
        }

        // Particles falling heavily (sparks)
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life++;
          const px = Math.cos(p.angle) * p.distance + p.wobble;
          const py = Math.sin(p.angle) * p.distance + (p.life * p.life * 0.03); // heavy gravity

          const lifeRatio = 1 - p.life / p.maxLife;
          if (lifeRatio <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * lifeRatio;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI*2);
          ctx.fill();
        }

      } else if (theme === 'turbo-velocity') {
        // --- TURBO-VELOCITY THEME ---
        // Speedometer RPM gauge look

        // Speed ticks background
        ctx.save();
        for (let i = 0; i < 60; i++) {
          const ang = (i / 60) * Math.PI * 2;
          const isMajor = i % 5 === 0;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * (baseRadius - 5), Math.sin(ang) * (baseRadius - 5));
          ctx.lineTo(Math.cos(ang) * (baseRadius + (isMajor ? 12 : 5)), Math.sin(ang) * (baseRadius + (isMajor ? 12 : 5)));
          ctx.strokeStyle = isMajor ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)';
          ctx.lineWidth = isMajor ? 3 : 1;
          ctx.stroke();
        }
        ctx.restore();

        // RPM Redline
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 18, -Math.PI/2, -Math.PI/2 + (Math.PI*2 * (10/30))); // Last 10 seconds area
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Red-500
        ctx.lineWidth = 6;
        ctx.stroke();

        // Main Sweep Arc
        if (progressRatio > 0.001) {
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius + 2, startAngle, endAngle);
          ctx.strokeStyle = primaryColor;
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 12;
          ctx.shadowBlur = 20;
          ctx.shadowColor = primaryColor;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Velocity needle
          const needleX = Math.cos(endAngle) * (baseRadius - 20);
          const needleY = Math.sin(endAngle) * (baseRadius - 20);
          const tipX = Math.cos(endAngle) * (baseRadius + 25);
          const tipY = Math.sin(endAngle) * (baseRadius + 25);
          
          ctx.beginPath();
          ctx.moveTo(0, 0); // Center of gauge
          ctx.lineTo(needleX, needleY);
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(needleX, needleY);
          ctx.lineTo(tipX, tipY);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Needle glow
          ctx.beginPath();
          ctx.arc(tipX, tipY, 4, 0, Math.PI*2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = primaryColor;
          ctx.fill();

          // Exhaust flames / speed trails
          if (running && Math.random() < 0.8) {
            particles.push({
              angle: endAngle,
              distance: baseRadius + (Math.random() - 0.5) * 15,
              speed: 0,
              size: Math.random() * 3 + 1,
              alpha: 1,
              color: currentColors[Math.floor(Math.random() * currentColors.length)],
              wobble: 0, 
              life: 0,
              maxLife: Math.random() * 15 + 10,
            });
          }
        }

        // Speed trails stretching backwards around the circle
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life++;
          // Angle trails backwards relative to the needle
          const trailAngle = p.angle - (p.life * 0.05);
          const px = Math.cos(trailAngle) * p.distance;
          const py = Math.sin(trailAngle) * p.distance;

          const lifeRatio = 1 - p.life / p.maxLife;
          if (lifeRatio <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(trailAngle + Math.PI/2); // Align with tangent
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * lifeRatio;
          ctx.fillRect(-1, 0, 2, p.life * 2); // Stretch into a line
          ctx.restore();
        }

      } else if (theme === 'cyber-glitch') {
        // --- CYBER-GLITCH (NEON) THEME ---
        // Neon polygonal circuitry

        const drawPolygon = (radius, sides, offsetAngle) => {
          ctx.beginPath();
          for(let i=0; i<=sides; i++) {
            const a = (i/sides) * Math.PI * 2 + offsetAngle;
            const px = Math.cos(a) * radius;
            const py = Math.sin(a) * radius;
            if (i===0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        };

        // Outer Hexagon
        ctx.save();
        ctx.rotate(rotation1 * 0.3);
        drawPolygon(baseRadius + 22, 6, Math.PI/2);
        ctx.strokeStyle = secondaryColor;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner Octagon
        drawPolygon(baseRadius - 12, 8, 0);
        ctx.strokeStyle = primaryColor;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Circuit tracks
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 14;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glitch Progress Bar
        if (progressRatio > 0.001) {
          // Calculate jagged path
          ctx.beginPath();
          let glitchOffset = 0;
          for (let a = startAngle; a <= endAngle; a += 0.05) {
             if (Math.random() < 0.1) glitchOffset = (Math.random() - 0.5) * 8;
             if (Math.random() < 0.05) glitchOffset = 0; // reset
             const r = baseRadius + glitchOffset;
             const x = Math.cos(a) * r;
             const y = Math.sin(a) * r;
             if (a === startAngle) ctx.moveTo(x, y);
             else ctx.lineTo(x, y);
          }
          
          ctx.strokeStyle = primaryColor;
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 8;
          ctx.shadowBlur = 15;
          ctx.shadowColor = primaryColor;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Glitch Head
          const hOffset = (Math.random() - 0.5) * 10;
          const headX = Math.cos(endAngle) * (baseRadius + hOffset);
          const headY = Math.sin(endAngle) * (baseRadius + hOffset);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(headX - 5, headY - 5, 10, 10);

          // Random glitch bars
          if (running && Math.random() < 0.4) {
             ctx.fillStyle = primaryColor;
             ctx.fillRect(headX + (Math.random()-0.5)*30, headY + (Math.random()-0.5)*30, Math.random()*20, 4);
          }

          if (running && Math.random() < 0.6) {
            particles.push({
              angle: endAngle,
              distance: baseRadius,
              speed: 0,
              size: Math.random() * 4 + 1,
              alpha: 1,
              color: currentColors[Math.floor(Math.random() * currentColors.length)],
              wobble: 0,
              life: 0,
              maxLife: Math.random() * 15 + 10,
            });
          }
        }

        // Digital noise particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life++;
          // Snap to grid movement
          const xOffset = (Math.floor(p.life / 2) % 2 === 0) ? 5 : -5;
          const px = Math.cos(p.angle) * p.distance + xOffset;
          const py = Math.sin(p.angle) * p.distance + (p.life * 2 * (i%2===0?1:-1)); 

          const lifeRatio = 1 - p.life / p.maxLife;
          if (lifeRatio <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.random() > 0.2 ? p.alpha * lifeRatio : 0; // flickering
          ctx.fillRect(px, py, p.size, p.size);
        }

      } else if (theme === 'apex-gold') {
        // --- APEX-GOLD THEME ---
        // Ornate outer rings
        ctx.save();
        ctx.rotate(rotation1);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 18, 0, Math.PI * 2);
        ctx.strokeStyle = primaryColor;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 8]);
        ctx.stroke();
        
        // 4 diamond nodes
        for(let i=0; i<4; i++) {
          const a = (i/4) * Math.PI*2;
          const px = Math.cos(a) * (baseRadius + 18);
          const py = Math.sin(a) * (baseRadius + 18);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(Math.PI/4);
          ctx.fillStyle = primaryColor;
          ctx.fillRect(-4, -4, 8, 8);
          ctx.restore();
        }
        ctx.restore();

        // Base rail
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.1)';
        ctx.lineWidth = 6;
        ctx.setLineDash([]);
        ctx.stroke();

        if (progressRatio > 0.001) {
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius, startAngle, endAngle);
          ctx.strokeStyle = primaryColor;
          ctx.globalAlpha = warningActive ? 1.0 : 0.8;
          ctx.lineWidth = 6;
          ctx.shadowBlur = 15;
          ctx.shadowColor = primaryColor;
          ctx.stroke();
          ctx.shadowBlur = 0; // reset

          // Diamond head
          const cometX = Math.cos(endAngle) * baseRadius;
          const cometY = Math.sin(endAngle) * baseRadius;
          ctx.save();
          ctx.translate(cometX, cometY);
          ctx.rotate(endAngle + Math.PI/4);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffffff';
          ctx.fillRect(-6, -6, 12, 12);
          ctx.restore();

          if (running && Math.random() < 0.6) {
            particles.push({
              angle: endAngle,
              distance: baseRadius + (Math.random()-0.5)*5,
              speed: 0,
              size: Math.random() * 2 + 1,
              alpha: 1,
              color: currentColors[Math.floor(Math.random() * currentColors.length)],
              wobble: (Math.random() - 0.5) * 2, // vx
              life: 0,
              maxLife: Math.random() * 40 + 20,
            });
          }
        }

        // Apex Particles (Gold floating up)
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life++;
          const px = Math.cos(p.angle) * p.distance + p.wobble * p.life * 0.1;
          const py = Math.sin(p.angle) * p.distance - (p.life * 1.2); 

          const lifeRatio = 1 - p.life / p.maxLife;
          if (lifeRatio <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.life * 0.1);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * lifeRatio;
          ctx.fillRect(-p.size, -p.size, p.size*2, p.size*2);
          ctx.restore();
        }

      } else {
        // --- SLEEK-OBSIDIAN THEME (Default Original) ---
        // ================= 1. RADIAL PULSING PLASMA SPIKES =================
        const numSpikes = 36;
        for (let i = 0; i < numSpikes; i++) {
          const angle = (i / numSpikes) * Math.PI * 2;
          const wave = Math.sin(pulsePhase * 1.5 + i * 0.4) * Math.cos(pulsePhase * 0.8 + i * 0.2);
          const spikeLen = running
            ? (warningActive ? 13 + Math.abs(wave) * 17 : 6 + Math.abs(wave) * 11)
            : 3;

          const x1 = Math.cos(angle) * (baseRadius - 13);
          const y1 = Math.sin(angle) * (baseRadius - 13);
          const x2 = Math.cos(angle) * (baseRadius - 13 + spikeLen);
          const y2 = Math.sin(angle) * (baseRadius - 13 + spikeLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = primaryColor;
          ctx.globalAlpha = warningActive ? 0.75 : 0.35;
          ctx.lineWidth = warningActive ? 2 : 1.2;
          ctx.stroke();
        }

        // ================= 2. ROTATING CONCENTRIC RINGS =================
        ctx.save();
        ctx.rotate(rotation1);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 14, 0, Math.PI * 2);
        ctx.strokeStyle = primaryColor;
        ctx.globalAlpha = warningActive ? 0.45 : 0.2;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 11]);
        ctx.stroke();

        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2;
          const tx1 = Math.cos(ang) * (baseRadius + 11);
          const ty1 = Math.sin(ang) * (baseRadius + 11);
          const tx2 = Math.cos(ang) * (baseRadius + 19);
          const ty2 = Math.sin(ang) * (baseRadius + 19);
          ctx.beginPath();
          ctx.moveTo(tx1, ty1);
          ctx.lineTo(tx2, ty2);
          ctx.lineWidth = i % 3 === 0 ? 2 : 1.2;
          ctx.strokeStyle = i % 3 === 0 ? '#ffffff' : primaryColor;
          ctx.globalAlpha = warningActive ? 0.8 : 0.4;
          ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.rotate(rotation2);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius - 10, 0, Math.PI * 2);
        ctx.strokeStyle = secondaryColor;
        ctx.globalAlpha = warningActive ? 0.4 : 0.2;
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 6, 3, 6]);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2 + Math.PI / 4;
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius + 22, ang - 0.15, ang + 0.15);
          ctx.strokeStyle = primaryColor;
          ctx.globalAlpha = warningActive ? 0.9 : 0.5;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([]);
          ctx.stroke();
        }
        ctx.restore();

        // ================= 3. SWEEPING RADAR SCANNER BEAM =================
        if (running) {
          ctx.save();
          const scanGrad = ctx.createRadialGradient(0, 0, 40, 0, 0, baseRadius + 16);
          scanGrad.addColorStop(0, 'rgba(0,0,0,0)');
          scanGrad.addColorStop(1, warningActive ? 'rgba(255, 107, 0, 0.25)' : 'rgba(0, 229, 255, 0.18)');

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, baseRadius + 16, radarAngle - 0.45, radarAngle);
          ctx.closePath();
          ctx.fillStyle = scanGrad;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(radarAngle) * (baseRadius + 18), Math.sin(radarAngle) * (baseRadius + 18));
          ctx.strokeStyle = '#ffffff';
          ctx.globalAlpha = warningActive ? 0.9 : 0.6;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        }

        // ================= 4. BASE SVG-EQUIVALENT RECESSED ENERGY ARC =================
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 10;
        ctx.setLineDash([]);
        ctx.stroke();

        if (progressRatio > 0.001) {
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius, startAngle, endAngle);
          ctx.strokeStyle = primaryColor;
          ctx.globalAlpha = warningActive ? 0.65 : 0.4;
          ctx.lineWidth = warningActive ? 18 : 14;
          ctx.lineCap = 'round';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, baseRadius, startAngle, endAngle);
          ctx.strokeStyle = '#ffffff';
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.stroke();

          // ================= 5. LEADING COMET HEAD =================
          const cometX = Math.cos(endAngle) * baseRadius;
          const cometY = Math.sin(endAngle) * baseRadius;
          
          ctx.save();
          const cometGrad = ctx.createRadialGradient(cometX, cometY, 2, cometX, cometY, warningActive ? 18 : 14);
          cometGrad.addColorStop(0, '#ffffff');
          cometGrad.addColorStop(0.35, primaryColor);
          cometGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.beginPath();
          ctx.arc(cometX, cometY, warningActive ? 18 : 14, 0, Math.PI * 2);
          ctx.fillStyle = cometGrad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cometX, cometY, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.restore();

          if (running && Math.random() < (warningActive ? 0.8 : 0.45)) {
            particles.push({
              angle: endAngle + (Math.random() - 0.5) * 0.2,
              distance: baseRadius + (Math.random() - 0.5) * 12,
              speed: (Math.random() * 0.03 + 0.01) * -1,
              size: Math.random() * (warningActive ? 3.0 : 2.0) + 1.0,
              alpha: 1,
              color: currentColors[Math.floor(Math.random() * currentColors.length)],
              wobble: Math.random() * Math.PI * 2,
              life: 0,
              maxLife: Math.random() * 45 + 25,
            });
          }
        }

        // ================= 6. ORBITING EMBER FIELD =================
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life++;
          p.angle += p.speed * speedMultiplier;
          p.wobble += 0.08;
          const radialOffset = Math.sin(p.wobble) * (warningActive ? 6 : 3);
          const r = p.distance + radialOffset;

          const px = Math.cos(p.angle) * r;
          const py = Math.sin(p.angle) * r;

          const lifeRatio = 1 - p.life / p.maxLife;
          if (lifeRatio <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(px, py, p.size * lifeRatio, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * lifeRatio;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = warningActive ? 8 : 4;
          ctx.fill();
        }

        // Replenish background ambient particles
        while (particles.length < 65) {
          particles.push({
            angle: Math.random() * Math.PI * 2,
            distance: baseRadius + (Math.random() - 0.5) * 26,
            speed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
            size: Math.random() * (warningActive ? 2.8 : 1.8) + 0.9,
            alpha: Math.random() * 0.7 + 0.3,
            color: currentColors[Math.floor(Math.random() * currentColors.length)],
            wobble: Math.random() * Math.PI * 2,
            life: 0,
            maxLife: Math.random() * 100 + 60,
          });
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isRaidRunning, totalDuration]);

  // Overall theme styling
  const isTitan = theme === 'titan-mech';
  const isTurbo = theme === 'turbo-velocity';
  const isApex = theme === 'apex-gold';
  const isCyber = theme === 'cyber-glitch';

  const statusStyling = isExpired
    ? {
        digitColor: 'text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.95)]',
        glowAura: 'shadow-[0_0_80px_rgba(239,68,68,0.6)]',
      }
    : isWarning
    ? {
        digitColor: 'text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-400 to-red-500 drop-shadow-[0_0_35px_rgba(255,107,0,0.95)] animate-pulse',
        glowAura: 'shadow-[0_0_80px_rgba(255,107,0,0.55)]',
      }
    : {
        digitColor: isRaidRunning
          ? isApex
            ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 drop-shadow-[0_0_30px_rgba(251,191,36,0.85)]'
            : isTitan
            ? 'text-slate-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]'
            : isCyber
            ? 'text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-cyan-400 to-fuchsia-500 drop-shadow-[0_0_30px_rgba(0,240,255,0.85)]'
            : isTurbo
            ? 'text-transparent bg-clip-text bg-gradient-to-b from-rose-100 via-rose-500 to-rose-700 drop-shadow-[0_0_30px_rgba(244,63,94,0.85)]'
            : 'text-transparent bg-clip-text bg-gradient-to-b from-white via-sky-100 to-sky-300 drop-shadow-[0_0_30px_rgba(56,189,248,0.85)]'
          : 'text-slate-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]',
        glowAura: isRaidRunning
          ? isApex
            ? 'shadow-[0_0_60px_rgba(251,191,36,0.35)]'
            : isCyber
            ? 'shadow-[0_0_60px_rgba(0,240,255,0.35)]'
            : isTurbo
            ? 'shadow-[0_0_60px_rgba(244,63,94,0.35)]'
            : 'shadow-[0_0_60px_rgba(56,189,248,0.35)]'
          : 'shadow-[0_20px_50px_rgba(0,0,0,0.8)]',
      };

  const containerShape = isTitan || isCyber || isTurbo
    ? 'rounded-2xl'
    : 'rounded-full';
  
  const innerShape = isTitan
    ? 'rounded-xl'
    : isCyber
    ? 'rounded-3xl'
    : isTurbo
    ? 'rounded-xl -skew-x-6'
    : 'rounded-full';

  const getAnimationConfig = () => {
    if (theme === 'titan-mech') {
      return {
        initial: { scale: 0.8, y: -30, opacity: 0 },
        animate: { scale: 1, y: 0, opacity: 1 },
        transition: { type: 'spring', stiffness: 900, damping: 12 }
      };
    }
    if (theme === 'turbo-velocity') {
      return {
        initial: { x: 40, opacity: 0, skewX: 20 },
        animate: { x: 0, opacity: 1, skewX: 0 },
        transition: { type: 'tween', duration: 0.15, ease: 'easeOut' }
      };
    }
    if (theme === 'cyber-glitch') {
      return {
        initial: { x: Math.random() > 0.5 ? -15 : 15, opacity: 0, filter: 'hue-rotate(90deg) blur(4px)' },
        animate: { x: 0, opacity: 1, filter: 'hue-rotate(0deg) blur(0px)' },
        transition: { type: 'spring', stiffness: 1000, damping: 10 }
      };
    }
    if (theme === 'apex-gold') {
      return {
        initial: { scale: 0.85, opacity: 0, filter: 'blur(8px)' },
        animate: { scale: 1, opacity: 1, filter: 'blur(0px)' },
        transition: { duration: 0.35, ease: 'easeOut' }
      };
    }
    return {
      initial: { scale: 1.2, opacity: 0.75, filter: 'brightness(1.5)' },
      animate: { scale: 1, opacity: 1, filter: 'brightness(1)' },
      transition: { type: 'spring', stiffness: 650, damping: 22 }
    };
  };
  const animConfig = getAnimationConfig();

  return (
    <div
      id="holographic-raid-reactor"
      className="relative flex flex-col items-center justify-center select-none w-full max-w-[340px]"
    >
      {/* 1. Ambient Volcanic Shockwave Background (Under 10s & Expired) */}
      <AnimatePresence>
        {isWarning && isRaidRunning && (
          <motion.div
            key={`shockwave-${raidTime}`}
            initial={{ scale: 0.82, opacity: 0.8 }}
            animate={{ scale: 1.35, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className={`absolute -inset-6 ${containerShape} bg-gradient-to-r from-orange-600/35 via-red-600/35 to-amber-500/35 blur-2xl pointer-events-none`}
          />
        )}
      </AnimatePresence>

      {isExpired && (
        <div className={`absolute -inset-8 ${containerShape} bg-red-600/50 blur-2xl animate-ping pointer-events-none`} />
      )}

      {/* 2. Main Holographic Circular/Polygonal Display Container */}
      <div
        className={`relative w-[280px] sm:w-[310px] xl:w-[335px] h-[280px] sm:h-[310px] xl:h-[335px] flex items-center justify-center transition-all duration-500`}
      >
        {/* Dynamic 60FPS Particle & Hologram Canvas Layer */}
        <canvas
          ref={canvasRef}
          style={{ width: '340px', height: '340px' }}
          className="absolute inset-0 pointer-events-none z-10 m-auto"
        />

        {/* Outer Shield Border */}
        {!(isTitan || isCyber || isTurbo) && (
          <div
            className={`absolute inset-2 sm:inset-2.5 ${containerShape} border-2 ${isApex ? 'border-amber-400/40' : 'border-white/10'} ${statusStyling.glowAura} bg-[#04060b]/90 transition-all duration-500 backdrop-blur-md overflow-hidden`}
          >
            {/* Subtle Cyberpunk CRT Scanline Grid */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.8)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
          </div>
        )}

        {/* 3. Central Holographic Core Glass Disc */}
        <div className={`relative z-20 w-[195px] sm:w-[218px] xl:w-[235px] h-[195px] sm:h-[218px] xl:h-[235px] flex flex-col items-center justify-center p-2.5 ${(isTitan || isCyber || isTurbo) ? '' : `${innerShape} ${isApex ? 'bg-gradient-to-b from-[#1a1303]/95 via-[#0a0701]/95 to-[#050300]/95 border-amber-500/30' : 'bg-gradient-to-b from-[#080d19]/95 via-[#030509]/95 to-[#010204]/95 border-white/15'} border shadow-[inset_0_4px_30px_rgba(0,0,0,0.95)]`}`}>
          {/* MASSIVE 3D EXTRACTED NUMERALS WITH SPRING KINETIC PUNCH */}
          <div className="relative flex items-center justify-center my-[-2px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={raidTime}
                initial={animConfig.initial}
                animate={animConfig.animate}
                transition={animConfig.transition}
                className={`font-display font-black text-[96px] sm:text-[108px] xl:text-[118px] leading-none tabular-nums tracking-tighter transition-all duration-300 ${statusStyling.digitColor}`}
              >
                {String(raidTime).padStart(2, '0')}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
