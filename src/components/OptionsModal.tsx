import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Keyboard,
  Users,
  Sliders,
  Monitor,
  RotateCcw,
  Volume2,
  ShieldCheck,
  Check,
  Layout,
  Move,
  Maximize2,
  Sparkles,
  Type,
  Link2,
  Unlink,
  Eye,
  Copy,
  ArrowLeftRight,
  Play,
  Palette,
  AlertCircle,
  Zap,
  Shield,
  Cpu,
  Crown,
  Radio,
} from 'lucide-react';
import { ScoreboardSettings, KeyBindings, ScoreboardThemeId } from '../types';
import { DEFAULT_SETTINGS } from '../utils/storage';
import { DEFAULT_LAYOUT } from '../utils/defaultLayout';
import { soundManager } from '../utils/audio';
import { KeyBindingRow } from './KeyBindingRow';
import { KeybindingTable } from './KeybindingTable';
import { ARENA_THEMES, ARENA_THEME_LIST } from '../utils/themes';
import { ObsSettingsTab } from './ObsSettingsTab';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ScoreboardSettings;
  onSaveSettings: (newSettings: ScoreboardSettings) => void;
  onResetMatchScores: () => void;
  onResetRaidTimer: () => void;
  onEnterUIEditor?: () => void;
  initialTab?: 'themes' | 'teams' | 'text' | 'layout' | 'keys' | 'match' | 'obs' | 'desktop';
  onCapturingStateChange?: (isCapturing: boolean) => void;
}

const COLOR_PRESETS = [
  { name: 'Electric Blue', hex: '#2563eb' },
  { name: 'Sky Cyan', hex: '#0284c7' },
  { name: 'Fiery Orange', hex: '#ea580c' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Golden Amber', hex: '#d97706' },
  { name: 'Royal Purple', hex: '#7c3aed' },
  { name: 'Hot Pink', hex: '#db2777' },
];

export const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetMatchScores,
  onResetRaidTimer,
  onEnterUIEditor,
  initialTab,
  onCapturingStateChange,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'teams' | 'text' | 'layout' | 'keys' | 'match' | 'obs' | 'desktop'>(initialTab || 'themes');
  const [localSettings, setLocalSettings] = useState<ScoreboardSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);
  const [syncTextSizes, setSyncTextSizes] = useState<boolean>(true);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync if initialTab changes or modal opens
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Sync if parent updates
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const team1NameSize = localSettings.team1NameFontSize ?? localSettings.teamNameFontSize ?? 26;
  const team2NameSize = localSettings.team2NameFontSize ?? localSettings.teamNameFontSize ?? 26;
  const team1ScoreSize = localSettings.team1ScoreFontSize ?? localSettings.scoreFontSize ?? 180;
  const team2ScoreSize = localSettings.team2ScoreFontSize ?? localSettings.scoreFontSize ?? 180;

  const showNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  const handleSelectTheme = (themeId: ScoreboardThemeId) => {
    const updated: ScoreboardSettings = {
      ...localSettings,
      theme: themeId,
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    showNotice();
  };

  const handleUpdateNameFontSize = (size: number, team?: 'team1' | 'team2') => {
    const clamped = Math.max(14, Math.min(64, size));
    let updated: ScoreboardSettings;
    if (!team || syncTextSizes) {
      updated = {
        ...localSettings,
        teamNameFontSize: clamped,
        team1NameFontSize: clamped,
        team2NameFontSize: clamped,
      };
    } else if (team === 'team1') {
      updated = {
        ...localSettings,
        team1NameFontSize: clamped,
      };
    } else {
      updated = {
        ...localSettings,
        team2NameFontSize: clamped,
      };
    }
    setLocalSettings(updated);
    onSaveSettings(updated);
    showNotice();
  };

  const handleUpdateScoreFontSize = (size: number, team?: 'team1' | 'team2') => {
    const clamped = Math.max(70, Math.min(560, size));
    let updated: ScoreboardSettings;
    if (!team || syncTextSizes) {
      updated = {
        ...localSettings,
        scoreFontSize: clamped,
        team1ScoreFontSize: clamped,
        team2ScoreFontSize: clamped,
      };
    } else if (team === 'team1') {
      updated = {
        ...localSettings,
        team1ScoreFontSize: clamped,
      };
    } else {
      updated = {
        ...localSettings,
        team2ScoreFontSize: clamped,
      };
    }
    setLocalSettings(updated);
    onSaveSettings(updated);
    showNotice();
  };

  const handleResetTextSizes = () => {
    const updated: ScoreboardSettings = {
      ...localSettings,
      teamNameFontSize: 26,
      scoreFontSize: 180,
      team1NameFontSize: 26,
      team2NameFontSize: 26,
      team1ScoreFontSize: 180,
      team2ScoreFontSize: 180,
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    showNotice();
  };

  const handleUpdateKey = (action: keyof KeyBindings, newKey: string) => {
    const updated: ScoreboardSettings = {
      ...localSettings,
      keyBindings: {
        ...localSettings.keyBindings,
        [action]: newKey,
      },
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    showNotice();
  };

  const handleUpdateTeam = (
    teamKey: 'team1' | 'team2',
    field: 'name' | 'color' | 'score',
    value: string | number
  ) => {
    const updated: ScoreboardSettings = {
      ...localSettings,
      [teamKey]: {
        ...localSettings[teamKey],
        [field]: value,
      },
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    showNotice();
  };

  const handleSwapTeams = () => {
    const updated: ScoreboardSettings = {
      ...localSettings,
      team1: { ...localSettings.team2 },
      team2: { ...localSettings.team1 },
      team1NameFontSize: localSettings.team2NameFontSize,
      team2NameFontSize: localSettings.team1NameFontSize,
      team1ScoreFontSize: localSettings.team2ScoreFontSize,
      team2ScoreFontSize: localSettings.team1ScoreFontSize,
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    showNotice();
  };

  const handleUpdateRaidDuration = (duration: number) => {
    const updated = {
      ...localSettings,
      raidDuration: duration,
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    onResetRaidTimer();
    showNotice();
  };

  const handleResetDefaultKeys = () => {
    const updated: ScoreboardSettings = {
      ...localSettings,
      keyBindings: { ...DEFAULT_SETTINGS.keyBindings },
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    showNotice();
  };

  const handleFactoryReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    onSaveSettings(DEFAULT_SETTINGS);
    onResetMatchScores();
    onResetRaidTimer();
    setShowResetConfirm(false);
    showNotice();
  };

  const handleCopyCli = () => {
    const commands = 'npm install\nnpm run package:win';
    navigator.clipboard?.writeText(commands);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const tabs = [
    {
      id: 'themes' as const,
      label: 'Arena Themes',
      desc: '5 distinct styles: Obsidian, Turbo, Titan, Cyber & Apex',
      icon: Palette,
    },
    {
      id: 'teams' as const,
      label: 'Teams & Colors',
      desc: 'Names, jerseys, score adjustments & side swap',
      icon: Users,
    },
    {
      id: 'text' as const,
      label: 'Text & Font Sizes',
      desc: 'Score size up to 560px & team name scale',
      icon: Type,
    },
    {
      id: 'layout' as const,
      label: 'Screen & UI Layout',
      desc: 'Interactive free-drag & box repositioning',
      icon: Layout,
    },
    {
      id: 'keys' as const,
      label: 'Keybinding Settings',
      desc: 'Table hotkeys and custom action sound files',
      icon: Keyboard,
    },
    {
      id: 'match' as const,
      label: 'Match & Stadium Audio',
      desc: 'Raid countdown, horn volume & warning beeps',
      icon: Volume2,
    },
    {
      id: 'obs' as const,
      label: 'OBS / Live Output',
      desc: 'WebSocket server & 5 individual browser overlays',
      icon: Radio,
    },
    {
      id: 'desktop' as const,
      label: 'TV Setup & Desktop App',
      desc: 'Arena HDMI display guide & standalone EXE',
      icon: Monitor,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-5xl h-[92vh] max-h-[860px] flex flex-col bg-[#0b0f19] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-200"
        >
          {/* ================= MODAL TOP HEADER ================= */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0e1424] shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
                    SCOREBOARD SETTINGS
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
                    BROADCAST CONSOLE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {tabs.find((t) => t.id === activeTab)?.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {savedNotice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-1.5 font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-saved</span>
                </motion.div>
              )}

              <button
                id="btn-close-options"
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close settings (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ================= MAIN SPLIT CONTENT BODY ================= */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* LEFT SIDEBAR NAVIGATION */}
            <div className="w-full md:w-64 bg-[#090d16] border-b md:border-b-0 md:border-r border-white/10 flex md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 p-2 md:p-3 gap-1.5">
              <div className="hidden md:block px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                Categories
              </div>

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer whitespace-nowrap md:whitespace-normal group ${
                      isActive
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs md:text-sm tracking-tight truncate">
                        {tab.label}
                      </div>
                      <div className="hidden md:block text-[11px] text-slate-500 truncate">
                        {tab.desc.split('&')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Sidebar Quick Status & Fullscreen Hint */}
              <div className="hidden md:flex flex-col mt-auto p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Fullscreen:</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                    F or F11
                  </kbd>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Quick Close:</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                    ESC
                  </kbd>
                </div>
              </div>
            </div>

            {/* RIGHT DETAIL CONTENT PANEL */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-[#0c111e]">
              {/* ================= TAB: ARENA THEMES (5 DISTINCT STYLES) ================= */}
              {activeTab === 'themes' && (
                <div className="space-y-6">
                  {/* Category Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-indigo-400" />
                        Arena Themes & Broadcast Visual Styles
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select from 5 fully realized visual identities. Each theme features custom score chassis geometry, matching team name banners, distinct particle energy, and unique scoring behavior.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono self-start sm:self-auto">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        ACTIVE:{' '}
                        <strong className="text-white uppercase">
                          {(ARENA_THEMES[localSettings.theme || 'sleek-obsidian'] || ARENA_THEMES['sleek-obsidian']).name}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* 5 Distinct Themes Selection Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {ARENA_THEME_LIST.map((th) => {
                      const isActive = (localSettings.theme || 'sleek-obsidian') === th.id;
                      const isTurbo = th.id === 'turbo-velocity';
                      const isApex = th.id === 'apex-gold';
                      const isTitan = th.id === 'titan-mech';
                      const isCyber = th.id === 'cyber-glitch';

                      return (
                        <div
                          key={th.id}
                          id={`theme-card-${th.id}`}
                          onClick={() => handleSelectTheme(th.id)}
                          className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                            isActive
                              ? 'bg-indigo-950/40 border-2 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.3)] ring-1 ring-indigo-400'
                              : 'bg-white/[0.03] border border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                          }`}
                        >
                          {/* Accent Top Light Line */}
                          <div
                            className="absolute top-0 left-0 right-0 h-1 transition-opacity"
                            style={{
                              backgroundColor: isApex
                                ? '#fbbf24'
                                : isCyber
                                ? '#00f0ff'
                                : isTitan
                                ? '#38bdf8'
                                : isTurbo
                                ? '#ff1753'
                                : '#38bdf8',
                              opacity: isActive ? 1 : 0.4,
                            }}
                          />

                          <div className="space-y-4">
                            {/* Card Header: Icon, Name, Badge */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                                    isActive
                                      ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                                      : 'bg-white/10 text-slate-300 group-hover:text-white'
                                  }`}
                                >
                                  {isApex && <Crown className="w-5 h-5 text-amber-300" />}
                                  {isCyber && <Cpu className="w-5 h-5 text-cyan-300" />}
                                  {isTitan && <Shield className="w-5 h-5 text-sky-300" />}
                                  {isTurbo && <Zap className="w-5 h-5 text-rose-400" />}
                                  {!isApex && !isCyber && !isTitan && !isTurbo && (
                                    <Sparkles className="w-5 h-5 text-cyan-300" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-display font-bold text-base text-white">
                                      {th.name}
                                    </h4>
                                    {isTurbo && (
                                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
                                        PREVIOUS HUD
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400">{th.subtitle}</p>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 border ${
                                  isActive
                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'
                                    : 'bg-white/5 text-slate-400 border-white/10'
                                }`}
                              >
                                {th.badge}
                              </span>
                            </div>

                            {/* Mini Vector Chassis Visual Preview */}
                            <div className="relative w-full h-20 rounded-xl bg-black/70 border border-white/10 flex items-center justify-center overflow-hidden px-4">
                              {/* Sleek Obsidian Mini Preview */}
                              {th.id === 'sleek-obsidian' && (
                                <div className="relative w-full max-w-[240px] h-12 rounded-lg border border-cyan-400/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between px-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                                  <div className="w-2 h-2 border-l border-t border-cyan-400" />
                                  <div className="text-center">
                                    <span className="font-display font-black text-xs text-white tracking-widest">
                                      OBSIDIAN HULL
                                    </span>
                                    <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-0.5" />
                                  </div>
                                  <div className="w-2 h-2 border-r border-t border-cyan-400" />
                                </div>
                              )}

                              {/* Turbo Velocity Mini Preview */}
                              {th.id === 'turbo-velocity' && (
                                <div className="relative w-full max-w-[240px] h-12 rounded-lg border border-rose-500/70 bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/60 flex items-center justify-between px-3 shadow-[0_0_15px_rgba(255,23,83,0.25)]">
                                  <span className="text-rose-400 font-mono font-bold text-xs">«««</span>
                                  <div className="text-center">
                                    <span className="font-display font-black text-xs text-rose-100 tracking-wider">
                                      VELOCITY SPEED PLATE
                                    </span>
                                    <div className="flex justify-center gap-1 mt-0.5">
                                      <span className="w-3 h-1 bg-rose-500 rounded-sm" />
                                      <span className="w-3 h-1 bg-rose-400 rounded-sm" />
                                      <span className="w-3 h-1 bg-white rounded-sm" />
                                    </div>
                                  </div>
                                  <span className="text-rose-400 font-mono font-bold text-xs">»»»</span>
                                </div>
                              )}

                              {/* Titan Mech Mini Preview */}
                              {th.id === 'titan-mech' && (
                                <div className="relative w-full max-w-[240px] h-12 rounded-lg border-2 border-slate-600 bg-slate-950 flex items-center justify-between px-3 shadow-inner">
                                  <div className="flex flex-col gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  </div>
                                  <div className="text-center">
                                    <span className="font-display font-black text-xs text-sky-200 tracking-wider">
                                      TITAN ARMOR PLATE
                                    </span>
                                    <div className="text-[9px] font-mono text-amber-400 tracking-widest mt-0.5">
                                      /// HAZARD WEAVE ///
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  </div>
                                </div>
                              )}

                              {/* Cyber Glitch Mini Preview */}
                              {th.id === 'cyber-glitch' && (
                                <div className="relative w-full max-w-[240px] h-12 rounded-lg border border-cyan-400 bg-black flex items-center justify-between px-3 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                                  <span className="text-[10px] font-mono text-cyan-400">0x4B</span>
                                  <div className="text-center">
                                    <span className="font-display font-black text-xs text-white tracking-widest">
                                      CYBER CIRCUIT
                                    </span>
                                    <div className="text-[9px] font-mono text-pink-500 tracking-tight mt-0.5">
                                      PCB:NODE_SYNC
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono text-pink-400">0x8F</span>
                                </div>
                              )}

                              {/* Apex Gold Mini Preview */}
                              {th.id === 'apex-gold' && (
                                <div className="relative w-full max-w-[240px] h-12 rounded-lg border-2 border-amber-400 bg-gradient-to-r from-amber-950/80 via-black to-amber-950/80 flex items-center justify-between px-3 shadow-[0_0_15px_rgba(251,191,36,0.25)]">
                                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                                  <div className="text-center">
                                    <span className="font-display font-black text-xs text-amber-200 tracking-widest">
                                      APEX CHAMPIONSHIP
                                    </span>
                                    <div className="text-[9px] font-mono text-amber-300 tracking-widest mt-0.5">
                                      ★ ★ ★ ★ ★
                                    </div>
                                  </div>
                                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                              )}
                            </div>

                            {/* Bullet Points: Identity & Behavior */}
                            <div className="space-y-1.5 text-xs text-slate-300">
                              <div className="flex items-start gap-2">
                                <span className="text-indigo-400 font-bold shrink-0">Design:</span>
                                <span className="text-slate-400">{th.identity}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-indigo-400 font-bold shrink-0">Behavior:</span>
                                <span className="text-slate-400">{th.behavior}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
                            {isActive ? (
                              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                </div>
                                <span>CURRENTLY ACTIVE</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 group-hover:text-slate-200">
                                Click card or button to apply
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTheme(th.id);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                              }`}
                            >
                              {isActive ? 'Selected' : 'Apply Theme'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= TAB 1: TEAMS & COLORS ================= */}
              {activeTab === 'teams' && (
                <div className="space-y-6">
                  {/* Category Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        Team Identity & Court Sides
                      </h3>
                      <p className="text-xs text-slate-400">
                        Configure team names, jersey colors, and live scores for both arena chambers.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSwapTeams}
                      className="px-3.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
                      title="Swap Court Sides (Left <-> Right) for Half-Time"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Swap Sides (Half-Time)</span>
                    </button>
                  </div>

                  {/* Dual Team Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left Team (Team 1) */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 relative overflow-hidden">
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: localSettings.team1.color }}
                      />

                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                            style={{
                              backgroundColor: localSettings.team1.color,
                              color: localSettings.team1.color,
                            }}
                          />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Left Court (Team 1)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          {localSettings.team1.name.length}/15 chars
                        </span>
                      </div>

                      {/* Team Name Input */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Team Name
                        </label>
                        <input
                          type="text"
                          value={localSettings.team1.name}
                          onChange={(e) =>
                            handleUpdateTeam('team1', 'name', e.target.value.slice(0, 15))
                          }
                          placeholder="BLUE RAIDERS"
                          maxLength={15}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-bold text-sm sm:text-base focus:outline-none focus:border-indigo-500 transition-colors uppercase tracking-wider"
                        />
                      </div>

                      {/* Direct Score Stepper */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Score Numerals
                        </label>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTeam(
                                'team1',
                                'score',
                                Math.max(0, localSettings.team1.score - 1)
                              )
                            }
                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={localSettings.team1.score}
                            onChange={(e) =>
                              handleUpdateTeam(
                                'team1',
                                'score',
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            }
                            className="flex-1 text-center py-2 rounded-xl bg-black/50 border border-white/15 text-white font-mono font-black text-xl focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTeam('team1', 'score', localSettings.team1.score + 1)
                            }
                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Color Presets & Custom Picker */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Theme / Jersey Color
                          </label>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            {localSettings.team1.color}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {COLOR_PRESETS.map((col) => (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => handleUpdateTeam('team1', 'color', col.hex)}
                              title={col.name}
                              className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                                localSettings.team1.color.toLowerCase() === col.hex.toLowerCase()
                                  ? 'scale-125 border-white shadow-lg'
                                  : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: col.hex }}
                            />
                          ))}

                          {/* Custom Color Input */}
                          <label
                            className="w-7 h-7 rounded-full border-2 border-white/30 flex items-center justify-center cursor-pointer hover:border-white transition-colors relative overflow-hidden"
                            title="Custom Hex Color"
                          >
                            <Palette className="w-3.5 h-3.5 text-slate-200" />
                            <input
                              type="color"
                              value={localSettings.team1.color}
                              onChange={(e) => handleUpdateTeam('team1', 'color', e.target.value)}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Team (Team 2) */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 relative overflow-hidden">
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: localSettings.team2.color }}
                      />

                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                            style={{
                              backgroundColor: localSettings.team2.color,
                              color: localSettings.team2.color,
                            }}
                          />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Right Court (Team 2)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          {localSettings.team2.name.length}/15 chars
                        </span>
                      </div>

                      {/* Team Name Input */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Team Name
                        </label>
                        <input
                          type="text"
                          value={localSettings.team2.name}
                          onChange={(e) =>
                            handleUpdateTeam('team2', 'name', e.target.value.slice(0, 15))
                          }
                          placeholder="RED WARRIORS"
                          maxLength={15}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-bold text-sm sm:text-base focus:outline-none focus:border-indigo-500 transition-colors uppercase tracking-wider"
                        />
                      </div>

                      {/* Direct Score Stepper */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Score Numerals
                        </label>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTeam(
                                'team2',
                                'score',
                                Math.max(0, localSettings.team2.score - 1)
                              )
                            }
                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={localSettings.team2.score}
                            onChange={(e) =>
                              handleUpdateTeam(
                                'team2',
                                'score',
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            }
                            className="flex-1 text-center py-2 rounded-xl bg-black/50 border border-white/15 text-white font-mono font-black text-xl focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateTeam('team2', 'score', localSettings.team2.score + 1)
                            }
                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Color Presets & Custom Picker */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Theme / Jersey Color
                          </label>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            {localSettings.team2.color}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {COLOR_PRESETS.map((col) => (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => handleUpdateTeam('team2', 'color', col.hex)}
                              title={col.name}
                              className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                                localSettings.team2.color.toLowerCase() === col.hex.toLowerCase()
                                  ? 'scale-125 border-white shadow-lg'
                                  : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: col.hex }}
                            />
                          ))}

                          {/* Custom Color Input */}
                          <label
                            className="w-7 h-7 rounded-full border-2 border-white/30 flex items-center justify-center cursor-pointer hover:border-white transition-colors relative overflow-hidden"
                            title="Custom Hex Color"
                          >
                            <Palette className="w-3.5 h-3.5 text-slate-200" />
                            <input
                              type="color"
                              value={localSettings.team2.color}
                              onChange={(e) => handleUpdateTeam('team2', 'color', e.target.value)}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Operations & Reset Scores Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-rose-300 text-sm flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-rose-400" />
                        Reset Match Scores (0 - 0)
                      </div>
                      <div className="text-xs text-slate-300">
                        Zero out both team scores for the start of a new match or overtime period.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onResetMatchScores}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-colors shadow-sm shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Scores (0 - 0)
                    </button>
                  </div>

                  {/* Typography Navigation Helper */}
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                        <Type className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-cyan-200 text-sm">Need to resize Team Names or Score text?</div>
                        <div className="text-xs text-slate-400">
                          Adjust font sizes inside team name banners and score numerals up to 560px with real-time sliders.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('text')}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Adjust Font Sizes</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: TEXT & FONT SIZES ================= */}
              {activeTab === 'text' && (
                <div className="space-y-6">
                  {/* Category Header & Sync Toggle */}
                  <div className="p-5 rounded-2xl bg-[#111728] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                        <Type className="w-5 h-5 text-cyan-400" />
                        Typography & Font Sizing
                      </h3>
                      <p className="text-xs text-slate-300">
                        Fine-tune team banner font sizes (14-64px) and score numerals up to 560px for stadium readability.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        id="btn-toggle-sync-text-sizes"
                        type="button"
                        onClick={() => setSyncTextSizes(!syncTextSizes)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          syncTextSizes
                            ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200 shadow-sm'
                            : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {syncTextSizes ? (
                          <>
                            <Link2 className="w-4 h-4 text-cyan-400" />
                            <span>Sync Both Teams: ON</span>
                          </>
                        ) : (
                          <>
                            <Unlink className="w-4 h-4 text-amber-400" />
                            <span>Independent Teams: ON</span>
                          </>
                        )}
                      </button>

                      <button
                        id="btn-reset-text-sizes"
                        type="button"
                        onClick={handleResetTextSizes}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. SCORE NUMERAL FONT SIZE (UP TO 560PX) */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-emerald-400" />
                          Team Score Numeral Size (Max 560px)
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Font size of the giant scoring numbers in the arena chambers.
                        </div>
                      </div>

                      {/* Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
                        {[
                          { label: 'Compact', size: 120 },
                          { label: 'Standard', size: 180 },
                          { label: 'XL', size: 260 },
                          { label: 'Jumbo', size: 360 },
                          { label: 'Mega', size: 460 },
                          { label: 'Max', size: 560 },
                        ].map((p) => {
                          const isActive = team1ScoreSize === p.size;
                          return (
                            <button
                              key={p.size}
                              type="button"
                              onClick={() => handleUpdateScoreFontSize(p.size)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20'
                                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {p.label} ({p.size}px)
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {syncTextSizes ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-semibold">Both Teams Score Size</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono font-bold text-xs">
                            {team1ScoreSize}px
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={70}
                            max={560}
                            step={2}
                            value={team1ScoreSize}
                            onChange={(e) => handleUpdateScoreFontSize(Number(e.target.value))}
                            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                          />
                          <input
                            type="number"
                            min={70}
                            max={560}
                            value={team1ScoreSize}
                            onChange={(e) => handleUpdateScoreFontSize(Number(e.target.value))}
                            className="w-24 px-3 py-1.5 bg-black/60 border border-white/20 rounded-xl text-center text-sm font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                        {/* Left Team Score Slider */}
                        <div className="p-4 rounded-xl bg-blue-950/25 border border-blue-500/25 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-blue-300 font-semibold">
                              {localSettings.team1.name || 'Team 1 (Left)'} Score
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                              {team1ScoreSize}px
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={70}
                              max={560}
                              step={2}
                              value={team1ScoreSize}
                              onChange={(e) => handleUpdateScoreFontSize(Number(e.target.value), 'team1')}
                              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                            />
                            <input
                              type="number"
                              min={70}
                              max={560}
                              value={team1ScoreSize}
                              onChange={(e) => handleUpdateScoreFontSize(Number(e.target.value), 'team1')}
                              className="w-20 px-2 py-1.5 bg-black/60 border border-white/20 rounded-xl text-center text-xs font-mono font-bold text-blue-300 focus:outline-none focus:border-blue-400 shrink-0"
                            />
                          </div>
                        </div>

                        {/* Right Team Score Slider */}
                        <div className="p-4 rounded-xl bg-red-950/25 border border-red-500/25 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-red-300 font-semibold">
                              {localSettings.team2.name || 'Team 2 (Right)'} Score
                            </span>
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">
                              {team2ScoreSize}px
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={70}
                              max={560}
                              step={2}
                              value={team2ScoreSize}
                              onChange={(e) => handleUpdateScoreFontSize(Number(e.target.value), 'team2')}
                              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
                            />
                            <input
                              type="number"
                              min={70}
                              max={560}
                              value={team2ScoreSize}
                              onChange={(e) => handleUpdateScoreFontSize(Number(e.target.value), 'team2')}
                              className="w-20 px-2 py-1.5 bg-black/60 border border-white/20 rounded-xl text-center text-xs font-mono font-bold text-red-300 focus:outline-none focus:border-red-400 shrink-0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. TEAM NAME FONT SIZE */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <Type className="w-4 h-4 text-cyan-400" />
                          Team Name Banner Text Size
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Font size inside the top team name holographic banners.
                        </div>
                      </div>

                      {/* Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
                        {[
                          { label: 'Compact', size: 18 },
                          { label: 'Medium', size: 22 },
                          { label: 'Standard', size: 26 },
                          { label: 'Large', size: 34 },
                          { label: 'XL', size: 42 },
                        ].map((p) => {
                          const isActive = team1NameSize === p.size;
                          return (
                            <button
                              key={p.size}
                              type="button"
                              onClick={() => handleUpdateNameFontSize(p.size)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/20'
                                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {p.label} ({p.size}px)
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {syncTextSizes ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-semibold">Both Teams Name Size</span>
                          <span className="px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-mono font-bold text-xs">
                            {team1NameSize}px
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={14}
                            max={64}
                            step={1}
                            value={team1NameSize}
                            onChange={(e) => handleUpdateNameFontSize(Number(e.target.value))}
                            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                          <input
                            type="number"
                            min={14}
                            max={64}
                            value={team1NameSize}
                            onChange={(e) => handleUpdateNameFontSize(Number(e.target.value))}
                            className="w-24 px-3 py-1.5 bg-black/60 border border-white/20 rounded-xl text-center text-sm font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                        {/* Left Team Name Slider */}
                        <div className="p-4 rounded-xl bg-blue-950/25 border border-blue-500/25 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-blue-300 font-semibold">
                              {localSettings.team1.name || 'Team 1 (Left)'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                              {team1NameSize}px
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={14}
                              max={64}
                              step={1}
                              value={team1NameSize}
                              onChange={(e) => handleUpdateNameFontSize(Number(e.target.value), 'team1')}
                              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                            />
                            <input
                              type="number"
                              min={14}
                              max={64}
                              value={team1NameSize}
                              onChange={(e) => handleUpdateNameFontSize(Number(e.target.value), 'team1')}
                              className="w-20 px-2 py-1.5 bg-black/60 border border-white/20 rounded-xl text-center text-xs font-mono font-bold text-blue-300 focus:outline-none focus:border-blue-400 shrink-0"
                            />
                          </div>
                        </div>

                        {/* Right Team Name Slider */}
                        <div className="p-4 rounded-xl bg-red-950/25 border border-red-500/25 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-red-300 font-semibold">
                              {localSettings.team2.name || 'Team 2 (Right)'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">
                              {team2NameSize}px
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={14}
                              max={64}
                              step={1}
                              value={team2NameSize}
                              onChange={(e) => handleUpdateNameFontSize(Number(e.target.value), 'team2')}
                              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
                            />
                            <input
                              type="number"
                              min={14}
                              max={64}
                              value={team2NameSize}
                              onChange={(e) => handleUpdateNameFontSize(Number(e.target.value), 'team2')}
                              className="w-20 px-2 py-1.5 bg-black/60 border border-white/20 rounded-xl text-center text-xs font-mono font-bold text-red-300 focus:outline-none focus:border-red-400 shrink-0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. LIVE INTERACTIVE TYPOGRAPHY PREVIEW */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        Live Typography Arena Preview
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>
                          Left: <b className="text-cyan-300">{team1NameSize}px / {team1ScoreSize}px</b>
                        </span>
                        <span>
                          Right: <b className="text-pink-300">{team2NameSize}px / {team2ScoreSize}px</b>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#080c14] border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Left Team Preview Card */}
                      <div
                        className="p-4 rounded-xl border bg-black/40 flex flex-col items-center justify-center space-y-3 overflow-hidden"
                        style={{ borderColor: `${localSettings.team1.color}50` }}
                      >
                        <div
                          className="font-team-name font-black uppercase tracking-wider text-center truncate w-full text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-white"
                          style={{ fontSize: `${Math.min(team1NameSize, 36)}px` }}
                        >
                          {localSettings.team1.name || 'BLUE RAIDERS'}
                        </div>
                        <div
                          className="font-display font-black leading-none tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300"
                          style={{
                            fontSize: `${Math.min(team1ScoreSize * 0.28, 120)}px`,
                            color: localSettings.team1.color,
                          }}
                        >
                          {localSettings.team1.score}
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: localSettings.team1.color }}>
                          Scoreboard Height: {team1ScoreSize}px
                        </span>
                      </div>

                      {/* Right Team Preview Card */}
                      <div
                        className="p-4 rounded-xl border bg-black/40 flex flex-col items-center justify-center space-y-3 overflow-hidden"
                        style={{ borderColor: `${localSettings.team2.color}50` }}
                      >
                        <div
                          className="font-team-name font-black uppercase tracking-wider text-center truncate w-full text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-white"
                          style={{ fontSize: `${Math.min(team2NameSize, 36)}px` }}
                        >
                          {localSettings.team2.name || 'RED WARRIORS'}
                        </div>
                        <div
                          className="font-display font-black leading-none tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300"
                          style={{
                            fontSize: `${Math.min(team2ScoreSize * 0.28, 120)}px`,
                            color: localSettings.team2.color,
                          }}
                        >
                          {localSettings.team2.score}
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: localSettings.team2.color }}>
                          Scoreboard Height: {team2ScoreSize}px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: SCREEN & UI LAYOUT ================= */}
              {activeTab === 'layout' && (
                <div className="space-y-6">
                  {/* Category Header */}
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <Layout className="w-5 h-5 text-yellow-400" />
                      Visual Drag & Resize Screen Layout
                    </h3>
                    <p className="text-xs text-slate-400">
                      Freely drag elements, pull edge anchors, and customize box dimensions directly on the arena screen.
                    </p>
                  </div>

                  {/* Main Launch UI Editor Action Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/15 via-amber-500/5 to-black border border-yellow-400/40 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_#facc15]" />
                          <h4 className="font-display font-black text-lg text-white tracking-wide uppercase flex items-center gap-2">
                            Interactive Visual Layout Editor
                          </h4>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Position the <strong className="text-white">Name Banners</strong>,{' '}
                          <strong className="text-white">Score Boxes</strong>, and the{' '}
                          <strong className="text-white">30s Raid Clock</strong> anywhere on the stadium screen. Includes magnetic grid snapping and symmetric team sizing.
                        </p>
                      </div>

                      <button
                        id="btn-launch-ui-editor"
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onEnterUIEditor) {
                            onEnterUIEditor();
                          }
                        }}
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black font-display font-black text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_25px_rgba(250,204,21,0.4)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Sparkles className="w-4 h-4 text-black" />
                        <span>LAUNCH UI EDITOR</span>
                      </button>
                    </div>

                    {/* Feature Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-yellow-400/20">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="w-6 h-6 rounded bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                          <Move className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className="text-white block font-semibold">Center Drag</strong>
                          Click and drag anywhere inside any box to reposition.
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="w-6 h-6 rounded bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className="text-white block font-semibold">Edge Anchors</strong>
                          Pull left, right, top or bottom edges to adjust dimensions.
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="w-6 h-6 rounded bg-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className="text-white block font-semibold">Grid Snapping</strong>
                          Lock box coordinates and handles directly onto stadium grid lines.
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="w-6 h-6 rounded bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className="text-white block font-semibold">Opposite Sync</strong>
                          Resizing Team 1 automatically matches Team 2's size.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reset Placement Action */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-slate-400" />
                        Restore Standard Arena Placement
                      </div>
                      <div className="text-xs text-slate-400">
                        Reset all box coordinates back to the factory balanced broadcast placement (Left Team, Center Timer, Right Team).
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...localSettings,
                          customLayout: DEFAULT_LAYOUT,
                        };
                        setLocalSettings(updated);
                        onSaveSettings(updated);
                        showNotice();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      Reset to Default Placement
                    </button>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: KEYBINDING SETTINGS ================= */}
              {activeTab === 'keys' && (
                <div className="space-y-6">
                  {/* Category Header */}
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <Keyboard className="w-5 h-5 text-indigo-400" />
                      Keybinding Settings
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure keyboard hotkeys and independent sound files for all 11 scoreboard operations.
                    </p>
                  </div>

                  <KeybindingTable
                    settings={localSettings}
                    onUpdateSettings={(updated) => {
                      setLocalSettings(updated);
                      onSaveSettings(updated);
                      showNotice();
                    }}
                    onCapturingStateChange={onCapturingStateChange}
                  />
                </div>
              )}

              {/* ================= TAB 5: MATCH & AUDIO RULES ================= */}
              {activeTab === 'match' && (
                <div className="space-y-6">
                  {/* Category Header */}
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-emerald-400" />
                      Match Rules & Stadium Audio
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure official raid time limits, stadium klaxon buzzer volume, and warning beeps.
                    </p>
                  </div>

                  {/* Raid Duration Card */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">Official Raid Timer Duration</h4>
                        <p className="text-xs text-slate-400">
                          Standard Pro Kabaddi raid limit is 30 seconds.
                        </p>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 font-display font-black text-xl text-emerald-400">
                        {localSettings.raidDuration}s
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap pt-1">
                      {[15, 20, 25, 30, 45, 60].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => handleUpdateRaidDuration(dur)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            localSettings.raidDuration === dur
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md'
                              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {dur}s {dur === 30 && '(Standard)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stadium Audio & Sound Effects Card */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                          Stadium Horn & Sound Effects
                        </h4>
                        <p className="text-xs text-slate-400">
                          High-intensity klaxon horn when raid timer hits 0s and point scoring chimes.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => soundManager.playBuzzer()}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Test stadium klaxon buzzer"
                        >
                          <Play className="w-3 h-3 fill-emerald-300" />
                          <span>Test Horn</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => soundManager.playPointSound()}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Test point scoring chime"
                        >
                          <Play className="w-3 h-3" />
                          <span>Test Point</span>
                        </button>
                      </div>
                    </div>

                    {/* Master Audio Toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5">
                      <div>
                        <div className="text-sm font-semibold text-white">Enable Stadium Audio FX</div>
                        <div className="text-xs text-slate-400">
                          Toggle all buzzer horns, scoring sounds, and countdown beeps
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.soundEnabled}
                          onChange={(e) => {
                            const updated = { ...localSettings, soundEnabled: e.target.checked };
                            setLocalSettings(updated);
                            onSaveSettings(updated);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {/* Volume Slider */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Stadium Master Volume</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {Math.round((localSettings.soundVolume ?? 0.8) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={localSettings.soundVolume ?? 0.8}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          const updated = { ...localSettings, soundVolume: val };
                          setLocalSettings(updated);
                          onSaveSettings(updated);
                        }}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    {/* Low Time Warning Beeps */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5">
                      <div>
                        <div className="text-sm font-semibold text-white">Warning Beeps (Under 5s)</div>
                        <div className="text-xs text-slate-400">
                          Audible warning ticks at 5, 4, 3, 2, 1 seconds to alert raider and defense
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.beepOnLowTime}
                          onChange={(e) => {
                            const updated = { ...localSettings, beepOnLowTime: e.target.checked };
                            setLocalSettings(updated);
                            onSaveSettings(updated);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB: OBS / LIVE OUTPUT (WEBSOCKET SERVER & OVERLAYS) ================= */}
              {activeTab === 'obs' && <ObsSettingsTab />}

              {/* ================= TAB 6: TV SETUP & DESKTOP APP ================= */}
              {activeTab === 'desktop' && (
                <div className="space-y-6">
                  {/* Category Header */}
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-indigo-400" />
                      Arena TV Presentation &amp; Desktop App
                    </h3>
                    <p className="text-xs text-slate-400">
                      Instructions for connecting to big TV arena monitors and building standalone offline Windows software.
                    </p>
                  </div>

                  {/* TV Connection Card */}
                  <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                      <Monitor className="w-4 h-4" />
                      Connecting to TV for Stadium Audience
                    </div>
                    <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                      <p>
                        <strong className="text-white">1. Connect Screen:</strong> Connect your PC or laptop to your stadium TV or projector via HDMI cable or Wireless Cast.
                      </p>
                      <p>
                        <strong className="text-white">2. Fullscreen Mode:</strong> Press{' '}
                        <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono font-bold">F</kbd>{' '}
                        (or <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono font-bold">F11</kbd> in browser) to engage 100% borderless fullscreen without browser tabs.
                      </p>
                      <p>
                        <strong className="text-white">3. Remote Operator Control:</strong> The operator can control all points and raid timer countdowns from the laptop keyboard without touching the stadium TV.
                      </p>
                    </div>
                  </div>

                  {/* Windows .EXE Standalone Guide */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        Package as Standalone Windows .EXE App
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCli}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedScript ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Commands</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      To run this scoreboard offline as an installed desktop software without needing internet:
                    </p>

                    <div className="bg-black/60 p-3.5 rounded-xl font-mono text-xs text-slate-300 space-y-1.5 border border-white/10">
                      <div className="text-slate-500"># 1. Click AI Studio top menu &gt; Settings &gt; Export to ZIP</div>
                      <div className="text-slate-500"># 2. Extract folder on your Windows PC, open Command Prompt or PowerShell:</div>
                      <div className="text-emerald-400 font-bold">npm install</div>
                      <div className="text-emerald-400 font-bold">npm run package:win</div>
                      <div className="text-slate-500"># 3. Your standalone .exe installer is generated inside the /dist folder!</div>
                    </div>
                  </div>

                  {/* Factory Reset Danger Zone */}
                  <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        Factory Reset All Settings
                      </div>
                      <div className="text-xs text-slate-400">
                        Restore all colors, font sizes, screen layout, key bindings, and timers back to factory defaults.
                      </div>
                    </div>

                    {showResetConfirm ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleFactoryReset}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
                        >
                          Confirm Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        Reset All Settings
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= MODAL BOTTOM FOOTER ================= */}
          <div className="px-6 py-4 border-t border-white/10 bg-[#0e1424] flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="hidden sm:inline">Settings save automatically.</span>
              <span>
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">ESC</kbd> to return.
              </span>
            </div>

            <button
              id="btn-done-settings"
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              Done / Return to Stadium
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
