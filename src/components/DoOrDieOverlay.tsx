import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Flame } from 'lucide-react';

interface DoOrDieOverlayProps {
  isActive?: boolean;
  showGraphic?: boolean;
  showWarning?: boolean;
  onDismiss?: () => void;
  onDismissWarning?: () => void;
  onResetBoth?: () => void;
  resetKeyLabel?: string;
  thirdRaidKeyLabel?: string;
}

export const DoOrDieOverlay: React.FC<DoOrDieOverlayProps> = ({
  showGraphic = false,
  showWarning = false,
}) => {
  const isVisible = Boolean(showGraphic || showWarning);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="do-or-die-broadcast-graphic"
          initial={{ opacity: 0, scale: 0.85, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4"
        >
          {/* Subtle Arena Ambient Glow */}
          <div className="absolute w-[500px] h-[260px] rounded-full bg-red-600/25 blur-3xl pointer-events-none" />

          {/* Stadium Broadcast Championship Badge Banner */}
          <div className="relative w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-b from-[#180505] via-black to-[#140404] border-2 border-red-500/90 shadow-[0_0_60px_rgba(239,68,68,0.7),0_0_20px_rgba(245,158,11,0.4)] overflow-hidden">
            {/* Top & Bottom Fiery Laser Accent Lines */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b]" />
            <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444]" />

            {/* Left & Right Glowing Bevel Blocks */}
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-b from-amber-400 via-red-600 to-amber-400 shadow-[0_0_12px_#ef4444]" />
            <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-b from-amber-400 via-red-600 to-amber-400 shadow-[0_0_12px_#ef4444]" />

            {/* Subtle Stadium Angled Stripes */}
            <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.08)_10px,rgba(255,255,255,0.08)_20px)] pointer-events-none" />

            <div className="relative px-6 sm:px-10 py-6 sm:py-7 flex flex-col items-center justify-center text-center select-none">
              {/* Top Athletic Category Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/90 border border-amber-400/80 text-amber-200 text-[11px] sm:text-xs font-mono font-black tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.8)] mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>3RD RAID</span>
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              </div>

              {/* Bold Athletic Broadcast Title */}
              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-300 to-red-500 uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.9)] leading-tight">
                DO OR DIE
              </h1>

              {/* Athletic Sub-ribbon */}
              <div className="mt-2.5 flex items-center justify-center gap-3 text-red-200 text-xs sm:text-sm font-mono font-bold tracking-[0.25em] uppercase">
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-400" />
                <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                  MUST SCORE • POINT OR OUT
                </span>
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-400" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
