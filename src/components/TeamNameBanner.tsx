import React from 'react';
import { ScoreboardThemeId } from '../types';
import redPanelBg from '../assets/images/red_panel_bg.jpg';

interface TeamNameBannerProps {
  side: 'left' | 'right';
  name: string;
  color?: string;
  theme?: ScoreboardThemeId;
  width?: number;
  height?: number;
  fontSize?: number;
}

export const TeamNameBanner: React.FC<TeamNameBannerProps> = ({
  side,
  name,
  theme = 'sleek-obsidian',
  width,
  height,
  fontSize,
}) => {
  const isLeft = side === 'left';

  const isApex = theme === 'apex-gold';
  const isTitan = theme === 'titan-mech';
  const isCyber = theme === 'cyber-glitch';
  const isTurbo = theme === 'turbo-velocity';

  const primary = isApex
    ? '#fbbf24'
    : isTitan
    ? isLeft
      ? '#38bdf8'
      : '#f43f5e'
    : isCyber
    ? isLeft
      ? '#00f0ff'
      : '#ff007f'
    : isLeft
    ? '#00f0ff'
    : '#ff1753';

  const displayName = (name || (isLeft ? 'BLUE RAIDERS' : 'RED WARRIORS')).trim().slice(0, 16);
  const nameLen = displayName.length;

  const nameSize =
    nameLen <= 7
      ? 'text-2xl sm:text-3xl xl:text-4xl'
      : nameLen <= 10
      ? 'text-xl sm:text-2xl xl:text-3xl'
      : nameLen <= 13
      ? 'text-lg sm:text-xl xl:text-2xl'
      : 'text-base sm:text-lg xl:text-xl';

  return (
    <div
      id={`${side}-team-name-banner`}
      className="relative w-full h-full flex items-center justify-center select-none group/banner"
    >
      {/* Full Vector Chassis Matching Current Score Box & Theme */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        viewBox="0 0 500 96"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Base Metal Background Gradient */}
          <linearGradient id={`bannerMetalBg-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isLeft ? '#020814' : '#100105'} stopOpacity="0.99" />
            <stop offset="25%" stopColor={isLeft ? '#04132b' : '#22030b'} stopOpacity="0.99" />
            <stop offset="50%" stopColor={isLeft ? '#072044' : '#330512'} stopOpacity="1" />
            <stop offset="75%" stopColor={isLeft ? '#04132b' : '#22030b'} stopOpacity="0.99" />
            <stop offset="100%" stopColor={isLeft ? '#020814' : '#100105'} stopOpacity="0.99" />
          </linearGradient>

          {/* Neon Border Gradient */}
          <linearGradient id={`bannerBorderNeon-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primary} stopOpacity="0.45" />
            <stop offset="20%" stopColor={primary} stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="80%" stopColor={primary} stopOpacity="0.95" />
            <stop offset="100%" stopColor={primary} stopOpacity="0.45" />
          </linearGradient>

          {/* Natural Seamless Feather Radial Vignette (Exact Match to Current Score Box) */}
          <radialGradient id={`bannerNaturalFeather-${side}`} cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="#010307" stopOpacity="0.99" />
            <stop offset="40%" stopColor="#010307" stopOpacity="0.92" />
            <stop offset="75%" stopColor={isLeft ? '#030e24' : '#1d0209'} stopOpacity="0.65" />
            <stop offset="90%" stopColor={isLeft ? '#041538' : '#2d030c'} stopOpacity="0.25" />
            <stop offset="100%" stopColor={isLeft ? '#041538' : '#2d030c'} stopOpacity="0.0" />
          </radialGradient>

          {/* Soft Bloom Glow Filter */}
          <filter id={`bannerGlow-${side}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ================= THEME 2: TURBO VELOCITY DEFS ================= */}
          <linearGradient id={`bannerSpeedBeamGrad-${side}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primary} stopOpacity="0" />
            <stop offset="25%" stopColor={primary} stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="75%" stopColor={primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={primary} stopOpacity="0" />
          </linearGradient>

          {/* ================= THEME 3: TITAN HEAVY ARMOR DEFS ================= */}
          <pattern id={`bannerCarbonWeave-${side}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 4L4 0L8 4L4 8Z" fill="#181e29" opacity="0.4" />
          </pattern>

          <radialGradient id={`bannerRivetGrad`} cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#94a3b8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </radialGradient>

          {/* ================= THEME 4: NEON CYBERPUNK DEFS ================= */}
          <linearGradient id={`bannerCyberGrad-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ff007f" stopOpacity="0.9" />
          </linearGradient>

          {/* ================= THEME 5: APEX GOLD DEFS ================= */}
          <linearGradient id={`bannerGoldGrad-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="50%" stopColor="#fffbeb" stopOpacity="1" />
            <stop offset="75%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* ========================================================================= */}
        {/* THEME 1: SLEEK OBSIDIAN (EXACT MATCH TO CURRENT SCORE BOX BACKGROUND)     */}
        {/* ========================================================================= */}
        {theme === 'sleek-obsidian' && (
          <g>
            {/* Outer Neon Glow Aura */}
            <polygon
              points="38,8 462,8 492,48 462,88 38,88 8,48"
              fill="none"
              stroke={primary}
              strokeWidth="6"
              opacity="0.25"
              filter="blur(5px)"
            />

            {/* Armor Plating Hull */}
            <polygon
              points="38,8 462,8 492,48 462,88 38,88 8,48"
              fill={`url(#bannerMetalBg-${side})`}
              stroke={`url(#bannerBorderNeon-${side})`}
              strokeWidth="2.2"
              className="filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]"
            />

            {/* Natural Feather Radial Vignette (Matches Score Box with Zero Cutoff) */}
            <ellipse
              cx="250"
              cy="48"
              rx="225"
              ry="38"
              fill={`url(#bannerNaturalFeather-${side})`}
            />

            {/* Precision Chamfer Corner Brackets (Tucked cleanly inside corners) */}
            <path
              d="M 32,12 L 20,12 L 12,24 L 12,34"
              fill="none"
              stroke={primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <path
              d="M 468,12 L 480,12 L 488,24 L 488,34"
              fill="none"
              stroke={primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <path
              d="M 12,62 L 12,72 L 20,84 L 32,84"
              fill="none"
              stroke={primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <path
              d="M 488,62 L 488,72 L 480,84 L 468,84"
              fill="none"
              stroke={primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />

            {/* Continuous Specular Horizon Rails (Top & Bottom) */}
            <line
              x1="65"
              y1="8"
              x2="435"
              y2="8"
              stroke={`url(#bannerBorderNeon-${side})`}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="120"
              y1="8"
              x2="380"
              y2="8"
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />
            <line
              x1="65"
              y1="88"
              x2="435"
              y2="88"
              stroke={`url(#bannerBorderNeon-${side})`}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="120"
              y1="88"
              x2="380"
              y2="88"
              stroke={primary}
              strokeWidth="1.5"
              strokeOpacity="0.9"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ========================================================================= */}
        {/* THEME 2: TURBO VELOCITY (PREVIOUS RACING HUD WITH SPEED CHEVRONS)         */}
        {/* ========================================================================= */}
        {theme === 'turbo-velocity' && (
          <g>
            <clipPath id={`bannerClip-${side}`}>
              <polygon points="38,8 462,8 492,48 462,88 38,88 8,48" />
            </clipPath>
            {/* Outer Glow */}
            <polygon
              points="38,8 462,8 492,48 462,88 38,88 8,48"
              fill="none"
              stroke={primary}
              strokeWidth="6"
              opacity="0.32"
              filter="blur(5px)"
            />

            {/* Armor Plating Hull */}
            <polygon
              points="38,8 462,8 492,48 462,88 38,88 8,48"
              fill={`url(#bannerMetalBg-${side})`}
              stroke={`url(#bannerBorderNeon-${side})`}
              strokeWidth="2.4"
              className="filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]"
            />

            {/* Metallic Texture & 45-Degree Speed Streak Beams */}
            <g clipPath={`url(#bannerClip-${side})`} transform={isLeft ? 'translate(500, 0) scale(-1, 1)' : undefined} pointerEvents="none">
              <image
                href={redPanelBg}
                x="0"
                y="0"
                width="500"
                height="96"
                preserveAspectRatio="xMidYMid slice"
                opacity="0.24"
                style={{
                  filter: isLeft
                    ? 'hue-rotate(185deg) saturate(1.2) brightness(0.92)'
                    : 'brightness(0.92)',
                }}
              />
              <line
                x1="28"
                y1="76"
                x2="108"
                y2="-4"
                stroke={`url(#bannerSpeedBeamGrad-${side})`}
                strokeWidth="2.5"
              />
              <line
                x1="390"
                y1="84"
                x2="475"
                y2="-1"
                stroke={`url(#bannerSpeedBeamGrad-${side})`}
                strokeWidth="3"
              />
            </g>

            {/* Feathered Center Vignette */}
            <ellipse
              cx="250"
              cy="48"
              rx="180"
              ry="34"
              fill={`url(#bannerNaturalFeather-${side})`}
            />

            {/* Aerodynamic Flank Chevrons (Left <<< / Right >>>) */}
            <g opacity="0.9" filter={`url(#bannerGlow-${side})`}>
              <path
                d="M 28,30 L 16,48 L 28,66"
                fill="none"
                stroke={primary}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 40,30 L 28,48 L 40,66"
                fill="none"
                stroke={primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.75"
              />
            </g>
            <g opacity="0.9" filter={`url(#bannerGlow-${side})`}>
              <path
                d="M 460,30 L 472,48 L 460,66"
                fill="none"
                stroke={primary}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 448,30 L 460,48 L 448,66"
                fill="none"
                stroke={primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.75"
              />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* THEME 3: TITAN HEAVY ARMOR (INDUSTRIAL BATTLE PLATE)                      */}
        {/* ========================================================================= */}
        {theme === 'titan-mech' && (
          <g>
            {/* Carbon Weave Hull */}
            <polygon
              points="34,8 466,8 494,48 466,88 34,88 6,48"
              fill="#0a0e17"
              stroke="#475569"
              strokeWidth="4"
              className="filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.95)]"
            />
            <polygon
              points="34,8 466,8 494,48 466,88 34,88 6,48"
              fill={`url(#bannerCarbonWeave-${side})`}
            />

            {/* Inner Plate Bevel */}
            <polygon
              points="40,16 460,16 484,48 460,80 40,80 16,48"
              fill="#020408"
              stroke="#1e293b"
              strokeWidth="2"
            />

            {/* Industrial Corner Steel Rivet Bolts */}
            <circle cx="42" cy="22" r="5" fill="url(#bannerRivetGrad)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="458" cy="22" r="5" fill="url(#bannerRivetGrad)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="42" cy="74" r="5" fill="url(#bannerRivetGrad)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="458" cy="74" r="5" fill="url(#bannerRivetGrad)" stroke="#0f172a" strokeWidth="1.5" />

            {/* Flank Segmented Heavy Armor Brackets */}
            <rect x="12" y="32" width="8" height="32" rx="2" fill={primary} opacity="0.9" />
            <rect x="480" y="32" width="8" height="32" rx="2" fill={primary} opacity="0.9" />

            {/* Hazard Amber/Neon Tick Bars */}
            <line x1="80" y1="16" x2="420" y2="16" stroke={primary} strokeWidth="2.5" strokeDasharray="12 8" opacity="0.85" />
            <line x1="80" y1="80" x2="420" y2="80" stroke={primary} strokeWidth="2.5" strokeDasharray="12 8" opacity="0.85" />

            {/* Center Dark Plate */}
            <ellipse cx="250" cy="48" rx="200" ry="32" fill="#03060c" opacity="0.95" />
          </g>
        )}

        {/* ========================================================================= */}
        {/* THEME 4: NEON CYBERPUNK (GLITCH CIRCUIT MATRIX)                           */}
        {/* ========================================================================= */}
        {theme === 'cyber-glitch' && (
          <g>
            {/* Deep Phosphor Hull */}
            <polygon
              points="38,8 462,8 492,48 462,88 38,88 8,48"
              fill="#030712"
              stroke={`url(#bannerCyberGrad-${side})`}
              strokeWidth="2.4"
              className="filter drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            />

            {/* PCB Glowing Trace Lines */}
            <path
              d="M 50,18 L 130,18 L 145,34 L 355,34 L 370,18 L 450,18"
              fill="none"
              stroke={primary}
              strokeWidth="1.4"
              opacity="0.6"
            />
            <path
              d="M 50,78 L 130,78 L 145,62 L 355,62 L 370,78 L 450,78"
              fill="none"
              stroke={primary}
              strokeWidth="1.4"
              opacity="0.6"
            />

            {/* Glowing Solder Connection Nodes */}
            <circle cx="130" cy="18" r="2.5" fill="#00f0ff" />
            <circle cx="370" cy="18" r="2.5" fill="#ff007f" />
            <circle cx="130" cy="78" r="2.5" fill="#ff007f" />
            <circle cx="370" cy="78" r="2.5" fill="#00f0ff" />

            {/* Hexadecimal Telemetry Tag */}
            <text x="60" y="24" fill={primary} fontSize="8" fontFamily="monospace" opacity="0.75" letterSpacing="1.5">
              HEX:0x{isLeft ? '1A' : '8F'}
            </text>
            <text x="400" y="24" fill="#ffffff" fontSize="8" fontFamily="monospace" opacity="0.7" letterSpacing="1.5">
              BUS:CH_{isLeft ? 'L' : 'R'}
            </text>

            {/* Center Dark Vignette */}
            <ellipse cx="250" cy="48" rx="190" ry="32" fill="#020409" opacity="0.92" />
          </g>
        )}

        {/* ========================================================================= */}
        {/* THEME 5: APEX CHAMPIONSHIP (ROYAL GRAND ARENA)                            */}
        {/* ========================================================================= */}
        {theme === 'apex-gold' && (
          <g>
            {/* Grand Polished Gold Outer Hull */}
            <polygon
              points="38,8 462,8 492,48 462,88 38,88 8,48"
              fill="#060913"
              stroke="url(#bannerGoldGrad-left)"
              strokeWidth="3"
              className="filter drop-shadow-[0_10px_30px_rgba(245,158,11,0.35)]"
            />

            {/* Diamond Cut Corner Facets */}
            <polygon points="38,8 50,18 32,18 16,34 22,28" fill="#fbbf24" opacity="0.85" />
            <polygon points="462,8 450,18 468,18 484,34 478,28" fill="#fbbf24" opacity="0.85" />
            <polygon points="38,88 50,78 32,78 16,62 22,68" fill="#fbbf24" opacity="0.85" />
            <polygon points="462,88 450,78 468,78 484,62 478,68" fill="#fbbf24" opacity="0.85" />

            {/* 3-Star Micro Championship Laurel on Left & Right */}
            <g transform="translate(68, 48)" fill="#fbbf24" opacity="0.85">
              <polygon points="0,-3 1,-1 3.5,-1 1.5,1 2.2,3.5 0,1.8 -2.2,3.5 -1.5,1 -3.5,-1 -1,-1" />
            </g>
            <g transform="translate(432, 48)" fill="#fbbf24" opacity="0.85">
              <polygon points="0,-3 1,-1 3.5,-1 1.5,1 2.2,3.5 0,1.8 -2.2,3.5 -1.5,1 -3.5,-1 -1,-1" />
            </g>

            {/* Center Dark Royal Vignette */}
            <ellipse cx="250" cy="48" rx="210" ry="34" fill="#03050d" opacity="0.92" />

            {/* Gold Horizon Rails */}
            <line x1="75" y1="12" x2="425" y2="12" stroke="#fef08a" strokeWidth="1.2" strokeOpacity="0.8" />
            <line x1="75" y1="84" x2="425" y2="84" stroke="#f59e0b" strokeWidth="1.8" strokeOpacity="0.85" />
          </g>
        )}
      </svg>

      {/* Team Name Typography with Dynamic Theme Accent */}
      <div className="relative z-20 flex items-center justify-center px-8 sm:px-12 w-full text-center">
        <h2
          className={`font-display font-black tracking-wider uppercase text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] transition-all duration-300 ${
            fontSize ? '' : nameSize
          } ${
            isApex
              ? 'text-amber-100 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]'
              : isCyber
              ? 'text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]'
              : isTitan
              ? 'text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
              : 'text-white'
          }`}
          style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
        >
          {displayName}
        </h2>
      </div>
    </div>
  );
};
