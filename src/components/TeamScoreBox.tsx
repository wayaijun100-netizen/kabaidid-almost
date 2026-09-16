import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScoreboardThemeId } from '../types';
import redPanelBg from '../assets/images/red_panel_bg.jpg';

interface TeamScoreBoxProps {
  side: 'left' | 'right';
  score: number;
  color?: string;
  theme?: ScoreboardThemeId;
  isScoring: boolean;
  onAdjustScore?: (delta: number) => void;
  width?: number;
  height?: number;
  fontSize?: number;
}

export const TeamScoreBox: React.FC<TeamScoreBoxProps> = ({
  side,
  score,
  theme = 'sleek-obsidian',
  isScoring,
  onAdjustScore,
  fontSize,
}) => {
  const isLeft = side === 'left';
  const [surgeKey, setSurgeKey] = useState(0);
  const prevScoreRef = useRef(score);

  useEffect(() => {
    if (prevScoreRef.current !== score) {
      setSurgeKey((k) => k + 1);
      prevScoreRef.current = score;
    }
  }, [score]);

  // Dynamic Theme Color Tokens
  const isApex = theme === 'apex-gold';
  const isTitan = theme === 'titan-mech';
  const isCyber = theme === 'cyber-glitch';
  const isTurbo = theme === 'turbo-velocity';

  const p = isLeft
    ? {
        primary: isApex ? '#fbbf24' : isTitan ? '#38bdf8' : isCyber ? '#00f0ff' : isTurbo ? '#00e5ff' : '#00f0ff',
        secondary: isApex ? '#b45309' : '#0284c7',
        accentGold: '#f59e0b',
        scoreGrad: isApex
          ? 'from-amber-100 via-yellow-200 to-amber-400'
          : isTitan
          ? 'from-white via-slate-100 to-slate-300'
          : isCyber
          ? 'from-white via-cyan-100 to-cyan-300'
          : 'from-white via-white to-slate-200',
        scoreShadow: isApex
          ? 'drop-shadow-[0_6px_14px_rgba(0,0,0,1)] drop-shadow-[0_0_24px_rgba(251,191,36,0.55)]'
          : isCyber
          ? 'drop-shadow-[0_6px_14px_rgba(0,0,0,1)] drop-shadow-[0_0_22px_rgba(0,240,255,0.65)]'
          : isTitan
          ? 'drop-shadow-[0_8px_16px_rgba(0,0,0,1)] drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]'
          : 'drop-shadow-[0_6px_12px_rgba(0,0,0,1)] drop-shadow-[0_14px_35px_rgba(0,0,0,0.95)] drop-shadow-[0_0_18px_rgba(0,240,255,0.45)]',
        shockwave: isApex
          ? 'bg-amber-400/40'
          : isCyber
          ? 'bg-cyan-400/50'
          : isTitan
          ? 'bg-sky-500/40'
          : 'bg-cyan-500/40',
        scanGlow: isApex
          ? 'bg-gradient-to-r from-transparent via-amber-300/60 to-transparent'
          : isCyber
          ? 'bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent'
          : 'bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent',
      }
    : {
        primary: isApex ? '#fbbf24' : isTitan ? '#f43f5e' : isCyber ? '#ff007f' : isTurbo ? '#ff1753' : '#ff1753',
        secondary: isApex ? '#b45309' : '#be123c',
        accentGold: '#f59e0b',
        scoreGrad: isApex
          ? 'from-amber-100 via-yellow-200 to-amber-400'
          : isTitan
          ? 'from-white via-slate-100 to-slate-300'
          : isCyber
          ? 'from-white via-rose-100 to-pink-300'
          : 'from-white via-white to-slate-200',
        scoreShadow: isApex
          ? 'drop-shadow-[0_6px_14px_rgba(0,0,0,1)] drop-shadow-[0_0_24px_rgba(251,191,36,0.55)]'
          : isCyber
          ? 'drop-shadow-[0_6px_14px_rgba(0,0,0,1)] drop-shadow-[0_0_22px_rgba(255,0,127,0.65)]'
          : isTitan
          ? 'drop-shadow-[0_8px_16px_rgba(0,0,0,1)] drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]'
          : 'drop-shadow-[0_6px_12px_rgba(0,0,0,1)] drop-shadow-[0_14px_35px_rgba(0,0,0,0.95)] drop-shadow-[0_0_18px_rgba(255,23,83,0.45)]',
        shockwave: isApex
          ? 'bg-amber-400/40'
          : isCyber
          ? 'bg-fuchsia-500/50'
          : isTitan
          ? 'bg-rose-500/40'
          : 'bg-red-500/40',
        scanGlow: isApex
          ? 'bg-gradient-to-r from-transparent via-amber-300/60 to-transparent'
          : isCyber
          ? 'bg-gradient-to-r from-transparent via-pink-400/80 to-transparent'
          : 'bg-gradient-to-r from-transparent via-rose-500/50 to-transparent',
      };

  return (
    <div
      id={`${side}-team-score-box`}
      onClick={() => onAdjustScore && onAdjustScore(1)}
      title="Click score to add +1 point"
      className="relative w-full h-full flex items-center justify-center cursor-pointer group/score select-none transition-transform duration-200 hover:scale-[1.015]"
    >
      {/* Scoring Shockwave / Pyro Flash */}
      <AnimatePresence>
        {isScoring && (
          <motion.div
            initial={{ scale: 0.82, opacity: 1 }}
            animate={{ scale: isTitan ? 1.6 : 1.45, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isTitan ? 0.9 : 0.75, ease: 'easeOut' }}
            className={`absolute -inset-8 rounded-full ${p.shockwave} blur-3xl pointer-events-none z-0`}
          />
        )}
      </AnimatePresence>

      {/* SVG Chassis Rendering based on Active Theme */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        viewBox="0 0 500 340"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Base Chamber Background Gradient */}
          <linearGradient id={`boxChamberBg-${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isLeft ? '#020814' : '#100105'} stopOpacity="0.99" />
            <stop offset="28%" stopColor={isLeft ? '#041126' : '#1d0209'} stopOpacity="0.99" />
            <stop offset="72%" stopColor={isLeft ? '#020b1c' : '#140107'} stopOpacity="0.99" />
            <stop offset="100%" stopColor={isLeft ? '#01050e' : '#080003'} stopOpacity="1" />
          </linearGradient>

          {/* Standard Neon Hull Border */}
          <linearGradient id={`boxHullBorder-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={p.primary} stopOpacity="0.45" />
            <stop offset="20%" stopColor={p.primary} stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="80%" stopColor={p.primary} stopOpacity="0.95" />
            <stop offset="100%" stopColor={p.primary} stopOpacity="0.45" />
          </linearGradient>

          {/* Natural Seamless Feather Radial Vignette (Default Sleek Obsidian) */}
          <radialGradient id={`scoreNaturalFeather-${side}`} cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="#010307" stopOpacity="0.99" />
            <stop offset="35%" stopColor="#010307" stopOpacity="0.92" />
            <stop offset="68%" stopColor={isLeft ? '#030e24' : '#1d0209'} stopOpacity="0.75" />
            <stop offset="88%" stopColor={isLeft ? '#041538' : '#2d030c'} stopOpacity="0.30" />
            <stop offset="100%" stopColor={isLeft ? '#041538' : '#2d030c'} stopOpacity="0.0" />
          </radialGradient>

          {/* Glow filter for soft blooms */}
          <filter id={`streakGlow-${side}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ================= THEME 2: TURBO VELOCITY DEFS ================= */}
          <linearGradient id={`speedBeamGrad-${side}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={p.primary} stopOpacity="0" />
            <stop offset="20%" stopColor={p.primary} stopOpacity="0.85" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="80%" stopColor={p.primary} stopOpacity="0.85" />
            <stop offset="100%" stopColor={p.primary} stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`speedCapsuleGrad-${side}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={p.primary} stopOpacity="0.1" />
            <stop offset="35%" stopColor={p.primary} stopOpacity="0.85" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="65%" stopColor={p.primary} stopOpacity="0.85" />
            <stop offset="100%" stopColor={p.primary} stopOpacity="0.1" />
          </linearGradient>

          <radialGradient id={`flareBloom-${side}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.primary} stopOpacity="0.75" />
            <stop offset="40%" stopColor={p.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={p.primary} stopOpacity="0" />
          </radialGradient>

          {/* ================= THEME 3: TITAN HEAVY ARMOR DEFS ================= */}
          <pattern id={`carbonWeave-${side}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 4L4 0L8 4L4 8Z" fill="#181e29" opacity="0.45" />
            <circle cx="4" cy="4" r="1" fill="#252f40" opacity="0.35" />
          </pattern>

          <linearGradient id={`titanBevelGrad-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="25%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="75%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <radialGradient id={`rivetGrad`} cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#94a3b8" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#1e293b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </radialGradient>

          {/* ================= THEME 4: NEON CYBERPUNK DEFS ================= */}
          <linearGradient id={`cyberBorderGrad-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#ff007f" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.9" />
          </linearGradient>

          {/* ================= THEME 5: APEX GRAND CHAMPIONSHIP DEFS ================= */}
          <linearGradient id={`apexGoldGrad-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" stopOpacity="0.9" />
            <stop offset="22%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="50%" stopColor="#fffbeb" stopOpacity="1" />
            <stop offset="78%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
          </linearGradient>

          <radialGradient id={`apexRoyalVignette-${side}`} cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="#02040a" stopOpacity="0.99" />
            <stop offset="38%" stopColor="#02040a" stopOpacity="0.93" />
            <stop offset="70%" stopColor={isLeft ? '#07152f' : '#23040c'} stopOpacity="0.8" />
            <stop offset="90%" stopColor={isLeft ? '#0a1d3f' : '#330512'} stopOpacity="0.35" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ========================================================================= */}
        {/* THEME 1: SLEEK OBSIDIAN (DEFAULT)                                         */}
        {/* ========================================================================= */}
        {theme === 'sleek-obsidian' && (
          <g>
            {/* Outer Neon Aura Bloom */}
            <polygon
              points="55,20 445,20 478,52 484,170 478,288 445,320 55,320 22,288 16,170 22,52"
              fill="none"
              stroke={p.primary}
              strokeWidth="7"
              opacity="0.25"
              filter="blur(8px)"
            />

            {/* Outer Armor Plating Hull */}
            <polygon
              points="55,20 445,20 478,52 484,170 478,288 445,320 55,320 22,288 16,170 22,52"
              fill={`url(#boxChamberBg-${side})`}
              stroke={`url(#boxHullBorder-${side})`}
              strokeWidth="2.4"
              className="filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
            />

            {/* Deep Natural Feather Vignette - Completely unclipped for seamless organic falloff */}
            <ellipse
              cx="250"
              cy="170"
              rx="225"
              ry="135"
              fill={`url(#scoreNaturalFeather-${side})`}
            />
            <ellipse
              cx="250"
              cy="170"
              rx="170"
              ry="90"
              fill={p.primary}
              opacity="0.06"
              filter="blur(20px)"
            />

            {/* Precision Chamfer Corner Brackets (Positioned cleanly inside to prevent score crowding) */}
            <path
              d="M 82,28 L 60,28 L 32,56 L 32,82"
              fill="none"
              stroke={p.primary}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            <path
              d="M 418,28 L 440,28 L 468,56 L 468,82"
              fill="none"
              stroke={p.primary}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            <path
              d="M 32,258 L 32,284 L 60,312 L 82,312"
              fill="none"
              stroke={p.primary}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            <path
              d="M 468,258 L 468,284 L 440,312 L 418,312"
              fill="none"
              stroke={p.primary}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />

            {/* White Inner Chamfer Ticks */}
            <path
              d="M 68,28 L 60,28 L 40,48"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeOpacity="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 432,28 L 440,28 L 460,48"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeOpacity="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Specular Horizon Rails */}
            <line
              x1="95"
              y1="20"
              x2="405"
              y2="20"
              stroke={`url(#boxHullBorder-${side})`}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <line
              x1="160"
              y1="20"
              x2="340"
              y2="20"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeOpacity="0.9"
              strokeLinecap="round"
            />
            <line
              x1="95"
              y1="320"
              x2="405"
              y2="320"
              stroke={`url(#boxHullBorder-${side})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="160"
              y1="320"
              x2="340"
              y2="320"
              stroke={p.primary}
              strokeWidth="1.8"
              strokeOpacity="0.95"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ========================================================================= */}
        {/* THEME 2: TURBO VELOCITY (PREVIOUS RACING HUD DESIGN)                      */}
        {/* ========================================================================= */}
        {theme === 'turbo-velocity' && (
          <g>
            <clipPath id={`boxClip-${side}`}>
              <polygon points="55,20 445,20 478,52 484,170 478,288 445,320 55,320 22,288 16,170 22,52" />
            </clipPath>

            {/* Outer Glow */}
            <polygon
              points="55,20 445,20 478,52 484,170 478,288 445,320 55,320 22,288 16,170 22,52"
              fill="none"
              stroke={p.primary}
              strokeWidth="7"
              opacity="0.32"
              filter="blur(8px)"
            />

            {/* Armor Plating Hull */}
            <polygon
              points="55,20 445,20 478,52 484,170 478,288 445,320 55,320 22,288 16,170 22,52"
              fill={`url(#boxChamberBg-${side})`}
              stroke={`url(#boxHullBorder-${side})`}
              strokeWidth="2.8"
              className="filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
            />

            {/* Fast-Track Racing Texture & Dynamic 45-Degree Speed Streaks */}
            <g clipPath={`url(#boxClip-${side})`} transform={isLeft ? 'translate(500, 0) scale(-1, 1)' : undefined} pointerEvents="none">
              <image
                href={redPanelBg}
                x="0"
                y="0"
                width="500"
                height="340"
                preserveAspectRatio="xMidYMid slice"
                opacity="0.22"
                style={{
                  filter: isLeft
                    ? 'hue-rotate(185deg) saturate(1.2) brightness(0.92)'
                    : 'brightness(0.92)',
                }}
              />

              {/* Corner Flares */}
              <ellipse
                cx="395"
                cy="70"
                rx="95"
                ry="38"
                transform="rotate(-45 395 70)"
                fill={`url(#flareBloom-${side})`}
                opacity="0.3"
              />
              <ellipse
                cx="110"
                cy="235"
                rx="75"
                ry="30"
                transform="rotate(-45 110 235)"
                fill={`url(#flareBloom-${side})`}
                opacity="0.2"
              />

              {/* 45-Degree Radiant Speed Streak Beams */}
              <line
                x1="305"
                y1="155"
                x2="455"
                y2="5"
                stroke={p.primary}
                strokeWidth="10"
                opacity="0.14"
                filter={`url(#streakGlow-${side})`}
              />
              <line
                x1="315"
                y1="145"
                x2="455"
                y2="5"
                stroke={`url(#speedBeamGrad-${side})`}
                strokeWidth="2.6"
                opacity="0.55"
              />
              <line
                x1="325"
                y1="135"
                x2="455"
                y2="5"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.5"
              />

              {/* Parallel Speed Lines */}
              <line
                x1="285"
                y1="155"
                x2="425"
                y2="15"
                stroke={p.primary}
                strokeWidth="1.4"
                strokeOpacity="0.35"
                strokeDasharray="40 12 12 10"
              />
              <line
                x1="340"
                y1="165"
                x2="465"
                y2="40"
                stroke={p.primary}
                strokeWidth="1"
                strokeOpacity="0.22"
              />

              {/* Speed Capsule Bar */}
              <line
                x1="380"
                y1="115"
                x2="440"
                y2="55"
                strokeLinecap="round"
                stroke={`url(#speedCapsuleGrad-${side})`}
                strokeWidth="3.2"
                opacity="0.55"
              />

              {/* Bottom Speed Streaks */}
              <line
                x1="45"
                y1="285"
                x2="165"
                y2="165"
                stroke={`url(#speedBeamGrad-${side})`}
                strokeWidth="1.8"
                strokeOpacity="0.4"
              />
              <line
                x1="305"
                y1="325"
                x2="435"
                y2="195"
                stroke={`url(#speedBeamGrad-${side})`}
                strokeWidth="1.8"
                strokeOpacity="0.4"
              />

              {/* Dot Matrix Telemetry Array */}
              {[275, 285, 295, 305].map((gridX) =>
                [275, 285, 295].map((gridY) => (
                  <circle
                    key={`t-dot-${gridX}-${gridY}`}
                    cx={gridX}
                    cy={gridY}
                    r="1.3"
                    fill={p.primary}
                    opacity="0.4"
                  />
                ))
              )}
            </g>

            {/* Seamless Center Dark Vignette */}
            <ellipse
              cx="250"
              cy="170"
              rx="215"
              ry="130"
              fill={`url(#scoreNaturalFeather-${side})`}
            />

            {/* Corner Chamfer Accents */}
            <path
              d="M 82,24 L 55,24 L 22,57 L 22,84"
              fill="none"
              stroke={p.primary}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 418,24 L 445,24 L 478,57 L 478,84"
              fill="none"
              stroke={p.primary}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 22,256 L 22,283 L 55,316 L 82,316"
              fill="none"
              stroke={p.primary}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 478,256 L 478,283 L 445,316 L 418,316"
              fill="none"
              stroke={p.primary}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Technical HUD Guide Rails */}
            <line
              x1="90"
              y1="24"
              x2="410"
              y2="24"
              stroke={p.primary}
              strokeWidth="1.6"
              strokeOpacity="0.45"
              strokeDasharray="30 8 15 8"
            />
            <line
              x1="90"
              y1="316"
              x2="410"
              y2="316"
              stroke={p.primary}
              strokeWidth="1.6"
              strokeOpacity="0.45"
              strokeDasharray="40 10 10 10"
            />
          </g>
        )}

        {/* ========================================================================= */}
        {/* THEME 3: TITAN HEAVY ARMOR (INDUSTRIAL BATTLE PLATE)                      */}
        {/* ========================================================================= */}
        {theme === 'titan-mech' && (
          <g>
            {/* Heavy Carbon-Weave Base */}
            <polygon
              points="45,16 455,16 488,48 492,170 488,292 455,324 45,324 12,292 8,170 12,48"
              fill="#0b0f17"
              stroke="#475569"
              strokeWidth="6"
              className="filter drop-shadow-[0_24px_50px_rgba(0,0,0,0.98)]"
            />
            <polygon
              points="45,16 455,16 488,48 492,170 488,292 455,324 45,324 12,292 8,170 12,48"
              fill={`url(#carbonWeave-${side})`}
            />

            {/* Inner Plate Bevel */}
            <polygon
              points="55,26 445,26 475,56 478,170 475,284 445,314 55,314 25,284 22,170 25,56"
              fill="#020408"
              stroke="#1e293b"
              strokeWidth="3"
            />

            {/* Industrial Hazard Stripe Core */}
            <g opacity="0.3">
               <polygon
                 points="70,36 430,36 450,60 450,280 430,304 70,304 50,280 50,60"
                 fill="none"
                 stroke={p.primary}
                 strokeWidth="2"
                 strokeDasharray="15 10"
               />
            </g>

            {/* Segmented Armor Plate Bevels */}
            <path
              d="M 50,22 L 450,22 L 480,52 L 484,170 L 480,288 L 450,318 L 50,318 L 20,288 L 16,170 L 20,52 Z"
              fill="none"
              stroke={`url(#titanBevelGrad-${side})`}
              strokeWidth="3.5"
            />

            {/* Industrial Corner Heavy Rivet Bolts (Steel Hardware) */}
            <circle cx="56" cy="30" r="5.5" fill="url(#rivetGrad)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="56" cy="30" r="1.5" fill="#334155" />
            <circle cx="444" cy="30" r="5.5" fill="url(#rivetGrad)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="444" cy="30" r="1.5" fill="#334155" />
            <circle cx="56" cy="310" r="5.5" fill="url(#rivetGrad)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="56" cy="310" r="1.5" fill="#334155" />
            <circle cx="444" cy="310" r="5.5" fill="url(#rivetGrad)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="444" cy="310" r="1.5" fill="#334155" />

            {/* Glowing Vents / Clamps */}
            <rect x="12" y="145" width="8" height="50" rx="2" fill={p.primary} opacity="0.9" />
            <rect x="480" y="145" width="8" height="50" rx="2" fill={p.primary} opacity="0.9" />

            {/* Top and Bottom Hazard Tape */}
            <line
              x1="120"
              y1="22"
              x2="380"
              y2="22"
              stroke={p.primary}
              strokeWidth="3.5"
              strokeDasharray="16 12"
              opacity="0.85"
            />
            <line
              x1="120"
              y1="318"
              x2="380"
              y2="318"
              stroke={p.primary}
              strokeWidth="3.5"
              strokeDasharray="16 12"
              opacity="0.85"
            />

            {/* Deep Central Blast Shield */}
            <ellipse cx="250" cy="170" rx="210" ry="125" fill="#04070d" opacity="0.94" />
          </g>
        )}

        {/* ========================================================================= */}
        {/* THEME 4: NEON CYBERPUNK (GLITCH CIRCUIT MATRIX)                           */}
        {/* ========================================================================= */}
        {theme === 'cyber-glitch' && (
          <g>
            {/* Deep Phosphor Circuit Matrix Hull */}
            <polygon
              points="55,20 445,20 480,55 486,170 480,285 445,320 55,320 20,285 14,170 20,55"
              fill="#030712"
              stroke={`url(#cyberBorderGrad-${side})`}
              strokeWidth="2.5"
              className="filter drop-shadow-[0_0_30px_rgba(0,240,255,0.4)]"
            />

            {/* PCB Glowing Conduits & Bus Traces */}
            <g stroke={p.primary} strokeWidth="1.4" opacity="0.55" fill="none">
              {/* Top Circuit Bus */}
              <path d="M 70,36 L 150,36 L 180,66 L 320,66 L 350,36 L 430,36" />
              {/* Bottom Circuit Bus */}
              <path d="M 70,304 L 150,304 L 180,274 L 320,274 L 350,304 L 430,304" />
              {/* Flank Nodes */}
              <path d="M 28,120 L 55,147 L 55,193 L 28,220" />
              <path d="M 472,120 L 445,147 L 445,193 L 472,220" />
            </g>

            {/* Glowing Solder Connection Nodes */}
            <circle cx="150" cy="36" r="3" fill="#00f0ff" className="animate-ping" opacity="0.75" />
            <circle cx="350" cy="36" r="3" fill="#ff007f" />
            <circle cx="150" cy="304" r="3" fill="#ff007f" />
            <circle cx="350" cy="304" r="3" fill="#00f0ff" className="animate-ping" opacity="0.75" />

            {/* Digital Hexadecimal Micro-Readouts */}
            <text x="75" y="48" fill={p.primary} fontSize="9" fontFamily="monospace" opacity="0.75" letterSpacing="2">
              0x{score.toString(16).padStart(2, '0').toUpperCase()} // NODE_A
            </text>
            <text x="365" y="48" fill="#ffffff" fontSize="9" fontFamily="monospace" opacity="0.65" letterSpacing="2">
              SYS:SYNC
            </text>

            {/* Inner Dark Vignette for Score Clarity */}
            <ellipse cx="250" cy="170" rx="205" ry="120" fill="#020409" opacity="0.92" />
          </g>
        )}

        {/* ========================================================================= */}
        {/* THEME 5: APEX CHAMPIONSHIP (ROYAL GRAND ARENA)                            */}
        {/* ========================================================================= */}
        {theme === 'apex-gold' && (
          <g>
            {/* Grand Polished Gold Outer Hull */}
            <polygon
              points="55,18 445,18 480,53 486,170 480,287 445,322 55,322 20,287 14,170 20,53"
              fill="#060913"
              stroke="url(#apexGoldGrad-left)"
              strokeWidth="3.4"
              className="filter drop-shadow-[0_20px_50px_rgba(245,158,11,0.35)]"
            />

            {/* Diamond Cut Corner Facets */}
            <polygon points="55,18 70,33 40,33 20,53 28,45" fill="#fbbf24" opacity="0.8" />
            <polygon points="445,18 430,33 460,33 480,53 472,45" fill="#fbbf24" opacity="0.8" />
            <polygon points="55,322 70,307 40,307 20,287 28,295" fill="#fbbf24" opacity="0.8" />
            <polygon points="445,322 430,307 460,307 480,287 472,295" fill="#fbbf24" opacity="0.8" />

            {/* Royal Obsidian Chamber & Feathered Vignette */}
            <ellipse cx="250" cy="170" rx="225" ry="135" fill={`url(#apexRoyalVignette-${side})`} />

            {/* 5-Star Championship Micro Laurel Crest (Top Center) */}
            <g transform="translate(250, 36)" fill="#fbbf24" opacity="0.85">
              {[-36, -18, 0, 18, 36].map((starX, i) => (
                <polygon
                  key={`star-${starX}`}
                  points="0,-4 1.2,-1 4.5,-1 1.8,1 2.8,4.2 0,2.2 -2.8,4.2 -1.8,1 -4.5,-1 -1.2,-1"
                  transform={`translate(${starX}, ${i === 2 ? -2 : 0}) scale(${i === 2 ? 1.4 : 1})`}
                />
              ))}
            </g>

            {/* Top & Bottom Double Polished Gold Rails */}
            <line x1="100" y1="24" x2="400" y2="24" stroke="#fef08a" strokeWidth="1.5" strokeOpacity="0.85" />
            <line x1="120" y1="316" x2="380" y2="316" stroke="#f59e0b" strokeWidth="2.2" strokeOpacity="0.9" />
          </g>
        )}
      </svg>

      {/* Sweeping Laser / Specular Scanner */}
      <div className="absolute inset-x-12 inset-y-6 overflow-hidden pointer-events-none opacity-30">
        <div className={`w-full h-[2px] ${p.scanGlow} absolute animate-cyber-scan shadow-[0_0_8px_${p.primary}]`} />
      </div>

      {/* Dynamic Score Surge Pulse Ring */}
      <AnimatePresence>
        {surgeKey > 0 && (
          <motion.div
            key={`reactor-surge-${surgeKey}`}
            initial={{ scale: 0.5, opacity: 0.95 }}
            animate={{ scale: isTitan ? 1.8 : 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isTitan ? 0.65 : 0.55, ease: 'easeOut' }}
            className={`absolute w-44 h-44 rounded-full border-2 ${isTitan ? 'border-solid' : 'border-dashed'} pointer-events-none z-10`}
            style={{
              borderColor: p.primary,
              boxShadow: `0 0 35px ${p.primary}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Snap Score Numeral - Centered with generous breathing room */}
      <div className="relative z-20 flex items-center justify-center select-none px-6 sm:px-10 py-1 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={score}
            initial={{
              scale: isTitan ? 1.35 : 1.25,
              opacity: 0.4,
              filter: 'brightness(2.2) contrast(1.2)',
            }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: 'brightness(1) contrast(1)',
            }}
            exit={{
              scale: 0.88,
              opacity: 0,
              filter: 'brightness(0.5)',
            }}
            transition={{
              duration: isTitan ? 0.28 : 0.22,
              ease: [0.2, 0.9, 0.3, 1.1],
            }}
            className={`font-display font-black ${
              fontSize ? '' : 'text-[100px] sm:text-[135px] xl:text-[165px]'
            } leading-none tabular-nums tracking-normal text-transparent bg-clip-text bg-gradient-to-b ${
              p.scoreGrad
            } ${p.scoreShadow} group-hover/score:scale-[1.03] transition-transform duration-200`}
            style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
          >
            {score}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
