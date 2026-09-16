import React from 'react';
import {
  Grid,
  Link2,
  Unlink,
  RotateCcw,
  Save,
  X,
  Move,
  Check,
} from 'lucide-react';

interface UIEditorToolbarProps {
  onSave: () => void;
  onExit: () => void;
  onResetDefault: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  syncTeamSizes: boolean;
  onToggleSyncSizes: () => void;
}

export const UIEditorToolbar: React.FC<UIEditorToolbarProps> = ({
  onSave,
  onExit,
  onResetDefault,
  snapToGrid,
  onToggleSnap,
  syncTeamSizes,
  onToggleSyncSizes,
}) => {
  return (
    <aside
      aria-label="UI Layout Editor Controls"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl bg-[#090d16]/95 backdrop-blur-md border-2 border-sky-500/60 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(56,189,248,0.25)] text-white select-none max-w-[95vw] overflow-x-auto"
    >
      {/* Mode Badge */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300 shrink-0">
        <Move className="w-4 h-4 text-sky-400 animate-pulse" />
        <span className="text-xs font-mono font-black tracking-wider uppercase">
          UI Editor Mode
        </span>
      </div>

      <div className="w-[1px] h-6 bg-white/15 shrink-0 hidden sm:block" />

      {/* Snap to Grid Toggle */}
      <button
        type="button"
        id="btn-toggle-snap-grid"
        onClick={onToggleSnap}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border ${
          snapToGrid
            ? 'bg-sky-600/30 text-sky-200 border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
        }`}
        title="Toggle Snap to 20px Alignment Grid"
      >
        <Grid className="w-3.5 h-3.5 text-sky-400" />
        <span>Snap Grid {snapToGrid ? 'ON' : 'OFF'}</span>
      </button>

      {/* Sync Team Sizes Toggle */}
      <button
        type="button"
        id="btn-toggle-sync-sizes"
        onClick={onToggleSyncSizes}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border ${
          syncTeamSizes
            ? 'bg-indigo-600/30 text-indigo-200 border-indigo-400/60 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
        }`}
        title="Keep Team 1 and Team 2 widths & heights symmetrically synchronized"
      >
        {syncTeamSizes ? (
          <Link2 className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <Unlink className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span>Sync Team Sizes</span>
      </button>

      {/* Reset Default Layout */}
      <button
        type="button"
        id="btn-reset-default-layout"
        onClick={onResetDefault}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer shrink-0"
        title="Reset all elements to default television broadcast positions"
      >
        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
        <span>Reset Layout</span>
      </button>

      <div className="w-[1px] h-6 bg-white/15 shrink-0" />

      {/* Save Layout Button */}
      <button
        type="button"
        id="btn-save-layout"
        onClick={onSave}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/50 transition-all cursor-pointer shrink-0"
      >
        <Save className="w-3.5 h-3.5" />
        <span>Save Layout</span>
      </button>

      {/* Exit Editor Button */}
      <button
        type="button"
        id="btn-exit-editor"
        onClick={onExit}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-red-100 border border-red-500/40 transition-all cursor-pointer shrink-0"
        title="Exit layout editor (or press Esc)"
      >
        <X className="w-4 h-4" />
        <span className="hidden sm:inline">Exit</span>
      </button>
    </aside>
  );
};
