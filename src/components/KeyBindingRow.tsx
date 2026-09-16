import React, { useState, useEffect } from 'react';
import { formatKeyLabel } from '../utils/storage';

interface KeyBindingRowProps {
  label: string;
  description: string;
  currentKey: string;
  onUpdateKey: (newKey: string) => void;
}

export const KeyBindingRow: React.FC<KeyBindingRowProps> = ({
  label,
  description,
  currentKey,
  onUpdateKey,
}) => {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // If user pressed Escape while listening, cancel rebind
      if (e.key === 'Escape') {
        setIsListening(false);
        return;
      }

      // Capture key: normalize space, letter, etc.
      let captured = e.key;
      if (e.code === 'Space') {
        captured = ' ';
      } else if (e.key.length === 1) {
        captured = e.key.toLowerCase();
      }

      onUpdateKey(captured);
      setIsListening(false);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isListening, onUpdateKey]);

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
      <div>
        <div className="font-semibold text-sm text-slate-100">{label}</div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>

      <button
        type="button"
        onClick={() => setIsListening(true)}
        className={`px-4 py-2 rounded-lg font-mono text-sm font-bold min-w-[120px] text-center transition-all cursor-pointer border ${
          isListening
            ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse ring-2 ring-amber-400/50'
            : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-indigo-400'
        }`}
      >
        {isListening ? 'PRESS KEY...' : formatKeyLabel(currentKey)}
      </button>
    </div>
  );
};
