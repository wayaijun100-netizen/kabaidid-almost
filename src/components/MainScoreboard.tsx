import React, { useEffect, useState, useRef } from 'react';
import { Palette } from 'lucide-react';
import { ScoreboardSettings, ScoreboardUILayout, ElementLayout } from '../types';
import { Arena3DCanvas } from './Arena3DCanvas';
import { RaidClock } from './RaidClock';
import { TeamNameBanner } from './TeamNameBanner';
import { TeamScoreBox } from './TeamScoreBox';
import { FreeTransformBox } from './FreeTransformBox';
import { UIEditorToolbar } from './UIEditorToolbar';
import { DEFAULT_LAYOUT } from '../utils/defaultLayout';
import { DoOrDieOverlay } from './DoOrDieOverlay';
import { ARENA_THEMES } from '../utils/themes';
import { getActionKey, formatKeyDisplay } from '../utils/actionKeybindings';

interface MainScoreboardProps {
  settings: ScoreboardSettings;
  raidTime: number;
  isRaidRunning: boolean;
  isThirdRaid?: boolean;
  showDoOrDieWarning?: boolean;
  onDismissDoOrDieWarning?: () => void;
  onResetRaidTimerAndThirdRaid?: () => void;
  isEditorActive?: boolean;
  onAdjustTeam1?: (delta: number) => void;
  onAdjustTeam2?: (delta: number) => void;
  onResetTeam1?: () => void;
  onResetTeam2?: () => void;
  onOpenOptions?: () => void;
  onOpenObs?: () => void;
  onSaveLayout?: (layout: ScoreboardUILayout) => void;
  onExitEditor?: () => void;
}

export const MainScoreboard: React.FC<MainScoreboardProps> = ({
  settings,
  raidTime,
  isRaidRunning,
  isThirdRaid = false,
  showDoOrDieWarning = false,
  onDismissDoOrDieWarning,
  onResetRaidTimerAndThirdRaid,
  isEditorActive = false,
  onAdjustTeam1,
  onAdjustTeam2,
  onResetTeam1,
  onResetTeam2,
  onOpenOptions,
  onOpenObs,
  onSaveLayout,
  onExitEditor,
}) => {
  const isUrgent = raidTime <= 10 && raidTime > 0;
  const isExpired = raidTime === 0;

  // Track score changes for pyrotechnics & panel pulse
  const [prevScore1, setPrevScore1] = useState(settings.team1.score);
  const [prevScore2, setPrevScore2] = useState(settings.team2.score);
  const [scoringTeam, setScoringTeam] = useState<'left' | 'right' | null>(null);
  const [scoreShockwave, setScoreShockwave] = useState(false);

  // Layout container ref for relative percentage & drag calculations
  const arenaContainerRef = useRef<HTMLDivElement>(null);

  const currentTheme = settings.theme || 'sleek-obsidian';
  const activeThemeMeta = ARENA_THEMES[currentTheme] || ARENA_THEMES['sleek-obsidian'];

  // Active editable layout state
  const [currentLayout, setCurrentLayout] = useState<ScoreboardUILayout>(
    () => settings.customLayout || DEFAULT_LAYOUT
  );
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [syncTeamSizes, setSyncTeamSizes] = useState<boolean>(true);

  // Keep local layout updated if settings change externally
  useEffect(() => {
    if (settings.customLayout) {
      setCurrentLayout(settings.customLayout);
    }
  }, [settings.customLayout]);

  useEffect(() => {
    if (settings.team1.score !== prevScore1) {
      setScoringTeam('left');
      setScoreShockwave(true);
      const t = setTimeout(() => {
        setScoreShockwave(false);
        setScoringTeam(null);
      }, 900);
      setPrevScore1(settings.team1.score);
      return () => clearTimeout(t);
    }
  }, [settings.team1.score, prevScore1]);

  useEffect(() => {
    if (settings.team2.score !== prevScore2) {
      setScoringTeam('right');
      setScoreShockwave(true);
      const t = setTimeout(() => {
        setScoreShockwave(false);
        setScoringTeam(null);
      }, 900);
      setPrevScore2(settings.team2.score);
      return () => clearTimeout(t);
    }
  }, [settings.team2.score, prevScore2]);

  const totalRaidSec = settings.raidDuration || 30;

  const boundResetKey = formatKeyDisplay(getActionKey('resetTimer', settings.keyBindings));
  const boundThirdRaidKey = formatKeyDisplay(getActionKey('thirdRaid', settings.keyBindings));
  const boundStartTimerKey = formatKeyDisplay(getActionKey('startTimer', settings.keyBindings));

  // Handler to update an individual element layout with optional size sync for opposite team
  const handleUpdateElementLayout = (
    key: keyof ScoreboardUILayout,
    updated: ElementLayout
  ) => {
    setCurrentLayout((prev) => {
      const next = {
        ...prev,
        [key]: updated,
      };

      // If Sync Team Sizes is enabled, apply width & height to opposite team box (without changing position)
      if (syncTeamSizes) {
        if (key === 'team1Score' && (prev.team1Score.width !== updated.width || prev.team1Score.height !== updated.height)) {
          next.team2Score = {
            ...prev.team2Score,
            width: updated.width,
            height: updated.height,
          };
        } else if (key === 'team2Score' && (prev.team2Score.width !== updated.width || prev.team2Score.height !== updated.height)) {
          next.team1Score = {
            ...prev.team1Score,
            width: updated.width,
            height: updated.height,
          };
        } else if (key === 'team1Name' && (prev.team1Name.width !== updated.width || prev.team1Name.height !== updated.height)) {
          next.team2Name = {
            ...prev.team2Name,
            width: updated.width,
            height: updated.height,
          };
        } else if (key === 'team2Name' && (prev.team2Name.width !== updated.width || prev.team2Name.height !== updated.height)) {
          next.team1Name = {
            ...prev.team1Name,
            width: updated.width,
            height: updated.height,
          };
        }
      }

      return next;
    });
  };

  const handleSaveEditor = () => {
    if (onSaveLayout) {
      onSaveLayout(currentLayout);
    }
  };

  const handleResetDefaultLayout = () => {
    setCurrentLayout(DEFAULT_LAYOUT);
  };

  return (
    <div
      id="titan-jumbotron-scoreboard"
      className="relative w-screen h-screen flex flex-col justify-between bg-[#04060d] text-white select-none overflow-hidden"
    >
      {/* UI Editor Mode Floating Control Toolbar */}
      {isEditorActive && (
        <UIEditorToolbar
          onSave={handleSaveEditor}
          onExit={onExitEditor || (() => {})}
          onResetDefault={handleResetDefaultLayout}
          snapToGrid={snapToGrid}
          onToggleSnap={() => setSnapToGrid((prev) => !prev)}
          syncTeamSizes={syncTeamSizes}
          onToggleSyncSizes={() => setSyncTeamSizes((prev) => !prev)}
        />
      )}

      {/* Dynamic 60FPS Stadium Arena Lighting & Pyrotechnic Canvas */}
      <Arena3DCanvas
        colorLeft={settings.team1.color || '#2563eb'}
        colorRight={settings.team2.color || '#dc2626'}
        isUrgent={isUrgent}
        isExpired={isExpired}
        scoreShockwave={scoreShockwave}
        scoringTeam={scoringTeam}
        raidTime={raidTime}
        isRaidRunning={isRaidRunning}
        theme={currentTheme}
      />

      {/* ================= SLEEK LIVE BROADCAST HEADER ================= */}
      <header className="relative z-20 w-full pt-3 px-8 flex flex-col items-center pointer-events-none">
        <div className="flex items-center gap-4 px-6 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">LIVE</span>
          </div>
          <div className="w-[1px] h-3 bg-white/20" />
          <span className="font-display font-black text-xs sm:text-sm tracking-[0.25em] text-white uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            PRO KABADDI CHAMPIONSHIP
          </span>
          {isThirdRaid && (
            <>
              <div className="w-[1px] h-3 bg-white/20" />
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 border border-red-400 text-[10px] font-mono font-bold tracking-wider text-amber-200 uppercase">
                ⚡ 3RD RAID (DO OR DIE)
              </span>
            </>
          )}
          <div className="w-[1px] h-3 bg-white/20" />
          <span className="text-[10px] font-mono tracking-wider text-slate-400">
            COURT ARENA 01
          </span>
          <div className="w-[1px] h-3 bg-white/20" />
          <button
            type="button"
            onClick={onOpenOptions}
            className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-[10px] font-mono font-bold tracking-wider text-cyan-300 hover:text-cyan-100 transition-all cursor-pointer border border-cyan-500/30"
            title="Active Arena Theme - Click to Change in Settings"
          >
            <Palette className="w-3 h-3 text-cyan-400" />
            <span className="uppercase">{activeThemeMeta.name}</span>
          </button>
          <div className="w-[1px] h-3 bg-white/20" />
          <button
            type="button"
            onClick={onOpenObs || onOpenOptions}
            className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-[10px] font-mono font-bold tracking-wider text-emerald-300 hover:text-emerald-100 transition-all cursor-pointer border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            title="OBS WebSocket Output & Overlays - Click to Configure"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase font-black">OBS LIVE : 8765</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN ARENA DISPLAY (FREE TRANSFORM / DRAGGABLE CANVAS) ================= */}
      <main
        ref={arenaContainerRef}
        onClick={() => setSelectedBoxId(null)}
        className={`relative z-20 w-full flex-1 mx-auto overflow-hidden ${
          isEditorActive ? 'bg-sky-950/20' : ''
        }`}
      >
        {/* Enhanced High-Visibility Alignment Grid (Active during UI Editor Mode) */}
        {isEditorActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Fine 20px Grid */}
            <div
              className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,rgba(56,189,248,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.22)_1px,transparent_1px)] bg-[size:20px_20px]"
            />
            {/* Major 100px Grid */}
            <div
              className="absolute inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(56,189,248,0.45)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(56,189,248,0.45)_1.5px,transparent_1.5px)] bg-[size:100px_100px]"
            />
            {/* Vertical Center Court Alignment Axis (X: 50%) */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-yellow-400/70 shadow-[0_0_12px_rgba(250,204,21,0.6)]" />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-black/90 border border-yellow-400/50 text-[10px] font-mono font-bold text-yellow-300 tracking-wider shadow-md">
              CENTER COURT AXIS (50%)
            </div>

            {/* Horizontal Alignment Guides */}
            <div className="absolute left-0 right-0 top-[35%] -translate-y-1/2 h-[1px] bg-sky-400/40 border-t border-dashed border-sky-300/60" />
            <div className="absolute left-0 right-0 top-[50%] -translate-y-1/2 h-[1px] bg-sky-400/50 border-t border-dashed border-sky-300/70" />

            {/* TV Broadcast Safe Area Outline */}
            <div className="absolute inset-4 sm:inset-8 border border-dashed border-yellow-400/30 rounded-2xl pointer-events-none">
              <span className="absolute top-2 left-3 text-[9px] font-mono tracking-widest text-yellow-400/60 uppercase">
                ARENA BROADCAST SAFE ZONE
              </span>
            </div>
          </div>
        )}

        {/* 1. TEAM 1 NAME BOX */}
        <FreeTransformBox
          id="free-transform-team1-name"
          title={`${settings.team1.name || 'Team 1'} Name`}
          layout={currentLayout.team1Name}
          isEditorActive={isEditorActive}
          isSelected={selectedBoxId === 'team1Name'}
          onSelect={() => setSelectedBoxId('team1Name')}
          onChange={(up) => handleUpdateElementLayout('team1Name', up)}
          minWidth={160}
          minHeight={50}
          snapToGrid={snapToGrid}
          gridSize={20}
          containerRef={arenaContainerRef}
        >
          <TeamNameBanner
            side="left"
            name={settings.team1.name}
            color={settings.team1.color}
            theme={currentTheme}
            width={currentLayout.team1Name.width}
            height={currentLayout.team1Name.height}
            fontSize={settings.team1NameFontSize ?? settings.teamNameFontSize}
          />
        </FreeTransformBox>

        {/* 2. TEAM 1 SCORE BOX */}
        <FreeTransformBox
          id="free-transform-team1-score"
          title={`${settings.team1.name || 'Team 1'} Score`}
          layout={currentLayout.team1Score}
          isEditorActive={isEditorActive}
          isSelected={selectedBoxId === 'team1Score'}
          onSelect={() => setSelectedBoxId('team1Score')}
          onChange={(up) => handleUpdateElementLayout('team1Score', up)}
          minWidth={180}
          minHeight={150}
          snapToGrid={snapToGrid}
          gridSize={20}
          containerRef={arenaContainerRef}
        >
          <TeamScoreBox
            side="left"
            score={settings.team1.score}
            color={settings.team1.color}
            theme={currentTheme}
            isScoring={scoringTeam === 'left'}
            onAdjustScore={onAdjustTeam1}
            width={currentLayout.team1Score.width}
            height={currentLayout.team1Score.height}
            fontSize={settings.team1ScoreFontSize ?? settings.scoreFontSize}
          />
        </FreeTransformBox>

        {/* 3. CENTER 30S RAID CLOCK (EDITABLE) */}
        <FreeTransformBox
          id="free-transform-raid-timer"
          title="Raid Clock"
          layout={currentLayout.timer}
          isEditorActive={isEditorActive}
          isSelected={selectedBoxId === 'timer'}
          onSelect={() => setSelectedBoxId('timer')}
          onChange={(up) => handleUpdateElementLayout('timer', up)}
          minWidth={180}
          minHeight={180}
          snapToGrid={snapToGrid}
          gridSize={20}
          containerRef={arenaContainerRef}
        >
          <div className="relative flex flex-col items-center justify-center">
            <RaidClock
              raidTime={raidTime}
              totalDuration={totalRaidSec}
              isRaidRunning={isRaidRunning}
              theme={currentTheme}
            />
          </div>
        </FreeTransformBox>

        {/* 4. TEAM 2 NAME BOX */}
        <FreeTransformBox
          id="free-transform-team2-name"
          title={`${settings.team2.name || 'Team 2'} Name`}
          layout={currentLayout.team2Name}
          isEditorActive={isEditorActive}
          isSelected={selectedBoxId === 'team2Name'}
          onSelect={() => setSelectedBoxId('team2Name')}
          onChange={(up) => handleUpdateElementLayout('team2Name', up)}
          minWidth={160}
          minHeight={50}
          snapToGrid={snapToGrid}
          gridSize={20}
          containerRef={arenaContainerRef}
        >
          <TeamNameBanner
            side="right"
            name={settings.team2.name}
            color={settings.team2.color}
            theme={currentTheme}
            width={currentLayout.team2Name.width}
            height={currentLayout.team2Name.height}
            fontSize={settings.team2NameFontSize ?? settings.teamNameFontSize}
          />
        </FreeTransformBox>

        {/* 5. TEAM 2 SCORE BOX */}
        <FreeTransformBox
          id="free-transform-team2-score"
          title={`${settings.team2.name || 'Team 2'} Score`}
          layout={currentLayout.team2Score}
          isEditorActive={isEditorActive}
          isSelected={selectedBoxId === 'team2Score'}
          onSelect={() => setSelectedBoxId('team2Score')}
          onChange={(up) => handleUpdateElementLayout('team2Score', up)}
          minWidth={180}
          minHeight={150}
          snapToGrid={snapToGrid}
          gridSize={20}
          containerRef={arenaContainerRef}
        >
          <TeamScoreBox
            side="right"
            score={settings.team2.score}
            color={settings.team2.color}
            theme={currentTheme}
            isScoring={scoringTeam === 'right'}
            onAdjustScore={onAdjustTeam2}
            width={currentLayout.team2Score.width}
            height={currentLayout.team2Score.height}
            fontSize={settings.team2ScoreFontSize ?? settings.scoreFontSize}
          />
        </FreeTransformBox>
      </main>

      {/* 3rd Raid (Do-or-Die) 2-Second Broadcast Graphical Representation */}
      <DoOrDieOverlay
        isActive={Boolean(isThirdRaid)}
        showGraphic={Boolean(showDoOrDieWarning)}
        onDismiss={onDismissDoOrDieWarning || (() => {})}
      />

      {/* ================= BOTTOM BROADCAST TELEMETRY ================= */}
      <footer className="relative z-20 w-full px-6 sm:px-8 py-3.5 flex items-center justify-between border-t border-white/10 bg-black/85 backdrop-blur-md text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          {isThirdRaid ? (
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] tracking-wider shadow-[0_0_10px_#ef4444]">
                ⚡ 3RD RAID (DO OR DIE) ACTIVE
              </span>
              <span className="text-slate-200">
                SHARED RESET: PRESS <kbd className="px-2 py-0.5 rounded bg-white/20 text-yellow-300 font-bold">R</kbd> {boundResetKey !== 'R' && <span className="text-slate-400 font-normal">or <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-yellow-300 font-bold">{boundResetKey}</kbd></span>} TO RESET CLOCK &amp; 3RD RAID (STOPS ALL AUDIO)
              </span>
            </div>
          ) : (
            <span className="text-slate-300 flex items-center gap-2 flex-wrap">
              <span>
                T1: <b className="text-blue-400">{formatKeyDisplay(getActionKey('addPointTeam1', settings.keyBindings))}</b> (+1) / <b className="text-blue-300">{formatKeyDisplay(getActionKey('minusPointTeam1', settings.keyBindings))}</b> (-1) / <b className="text-blue-200">{formatKeyDisplay(getActionKey('resetScoreTeam1', settings.keyBindings))}</b> (RST)
              </span>
              <span className="text-white/20">|</span>
              <span>
                T2: <b className="text-red-400">{formatKeyDisplay(getActionKey('addPointTeam2', settings.keyBindings))}</b> (+1) / <b className="text-red-300">{formatKeyDisplay(getActionKey('minusPointTeam2', settings.keyBindings))}</b> (-1) / <b className="text-red-200">{formatKeyDisplay(getActionKey('resetScoreTeam2', settings.keyBindings))}</b> (RST)
              </span>
              <span className="text-white/20">|</span>
              <span>
                RAID: <b className="text-yellow-400">{boundStartTimerKey}</b> (START/PAUSE) / <b className="text-orange-400">{boundThirdRaidKey}</b> (3RD RAID)
              </span>
              <span className="text-white/20">|</span>
              <span>
                RESET: <b className="text-white bg-white/20 px-1.5 py-0.5 rounded">R</b> {boundResetKey !== 'R' && <span className="text-slate-400 font-normal">/ <b className="text-white bg-white/20 px-1.5 py-0.5 rounded">{boundResetKey}</b></span>} (STOP AUDIO &amp; RESET)
              </span>
            </span>
          )}
        </div>

        <div
          onClick={onOpenOptions}
          className="flex items-center gap-2 cursor-pointer group hover:text-white transition-colors shrink-0"
          title="Click or press ESC to open Settings"
        >
          <span>PRESS</span>
          <kbd className="px-2.5 py-0.5 rounded bg-white/10 text-yellow-300 font-bold border border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.5)] group-hover:scale-105 transition-transform">
            ESC
          </kbd>
          <span className="group-hover:text-yellow-400 transition-colors hidden sm:inline">FOR SETTINGS</span>
        </div>
      </footer>
    </div>
  );
};
