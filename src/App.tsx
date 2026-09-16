import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScoreboardSettings, ScoreboardUILayout } from './types';
import { loadSettings, saveSettings } from './utils/storage';
import { soundManager } from './utils/audio';
import { audioEngine } from './utils/audioEngine';
import { matchesKey, getActionKey } from './utils/actionKeybindings';
import { obsSyncClient } from './utils/obsSync';
import { MainScoreboard } from './components/MainScoreboard';
import { OptionsModal } from './components/OptionsModal';

export default function App() {
  const [settings, setSettings] = useState<ScoreboardSettings>(() => loadSettings());
  const [raidTime, setRaidTime] = useState<number>(settings.raidDuration || 30);
  const [isRaidRunning, setIsRaidRunning] = useState<boolean>(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [optionsInitialTab, setOptionsInitialTab] = useState<'themes' | 'teams' | 'text' | 'layout' | 'keys' | 'match' | 'obs' | 'desktop' | undefined>(undefined);
  const [isUIEditorActive, setIsUIEditorActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isThirdRaid, setIsThirdRaid] = useState<boolean>(false);
  const [showDoOrDieWarning, setShowDoOrDieWarning] = useState<boolean>(false);
  const [isCapturingKey, setIsCapturingKey] = useState<boolean>(false);

  // Broadcast scoreboard state to OBS WebSocket server whenever any value changes
  useEffect(() => {
    obsSyncClient.sendState({
      team1_name: settings.team1.name,
      team2_name: settings.team2.name,
      team1_score: settings.team1.score,
      team2_score: settings.team2.score,
      timer: raidTime,
      timer_running: isRaidRunning,
    });
  }, [
    settings.team1.name,
    settings.team2.name,
    settings.team1.score,
    settings.team2.score,
    raidTime,
    isRaidRunning,
  ]);

  const isCapturingKeyRef = useRef(isCapturingKey);
  isCapturingKeyRef.current = isCapturingKey;

  // Initialize custom audio engine on mount
  useEffect(() => {
    audioEngine.init().catch((err) => {
      console.warn('AudioEngine initialization notice:', err);
    });
  }, []);

  // Keep references to state for keyboard callbacks
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const isRaidRunningRef = useRef(isRaidRunning);
  isRaidRunningRef.current = isRaidRunning;
  const isOptionsOpenRef = useRef(isOptionsOpen);
  isOptionsOpenRef.current = isOptionsOpen;
  const isUIEditorActiveRef = useRef(isUIEditorActive);
  isUIEditorActiveRef.current = isUIEditorActive;
  const isThirdRaidRef = useRef(isThirdRaid);
  isThirdRaidRef.current = isThirdRaid;
  const raidTimeRef = useRef(raidTime);
  raidTimeRef.current = raidTime;

  // Sync sound settings with SoundManager
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
    soundManager.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // Handle Fullscreen state change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen might be blocked by browser iframe policies
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  // Raid Timer Countdown Loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRaidRunning) {
      timer = setInterval(() => {
        setRaidTime((prev) => {
          if (prev <= 1) {
            // Reached 0: Trigger Stadium Buzzer
            soundManager.playBuzzer();
            setIsRaidRunning(false);
            return 0;
          }

          const next = prev - 1;
          // Warning beeps on last 10 seconds (10, 9, 8... down to 1)
          if (next <= 10 && settingsRef.current.beepOnLowTime) {
            // Pitch increases as time runs out
            soundManager.playTick(next <= 3 ? 1200 : next <= 6 ? 1050 : 900);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRaidRunning]);

  const doOrDieTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerDoOrDieGraphic = useCallback(() => {
    if (doOrDieTimerRef.current) {
      clearTimeout(doOrDieTimerRef.current);
    }
    setShowDoOrDieWarning(true);
    doOrDieTimerRef.current = setTimeout(() => {
      setShowDoOrDieWarning(false);
      doOrDieTimerRef.current = null;
    }, 2000);
  }, []);

  const hideDoOrDieGraphic = useCallback(() => {
    if (doOrDieTimerRef.current) {
      clearTimeout(doOrDieTimerRef.current);
      doOrDieTimerRef.current = null;
    }
    setShowDoOrDieWarning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (doOrDieTimerRef.current) {
        clearTimeout(doOrDieTimerRef.current);
      }
    };
  }, []);

  // Timer controls
  // Timer controls: Row 7 START TIMER & 'T' key
  const handleToggleRaid = useCallback(() => {
    // If it was in 3rd raid (Do-or-Die), switch to normal raid immediately:
    // Cancel Do-or-Die, reset do-or-die audio immediately, reset timer to duration, and play normal timer sound
    if (isThirdRaidRef.current) {
      setIsThirdRaid(false);
      hideDoOrDieGraphic();
      setRaidTime(settingsRef.current.raidDuration);
      setIsRaidRunning(true);
      audioEngine.stopAll();
      const played = audioEngine.playAction('startTimer');
      if (!played && settingsRef.current.soundEnabled) {
        soundManager.playTimerStartSound();
      }
      return;
    }

    if (raidTimeRef.current <= 0) {
      // If expired, reset back to duration and start
      setRaidTime(settingsRef.current.raidDuration);
      setIsRaidRunning(true);
      audioEngine.stopAll();
      const played = audioEngine.playAction('startTimer');
      if (!played && settingsRef.current.soundEnabled) {
        soundManager.playTimerStartSound();
      }
    } else {
      setIsRaidRunning((prev) => {
        const next = !prev;
        if (next) {
          audioEngine.stopAll();
          const played = audioEngine.playAction('startTimer');
          if (!played && settingsRef.current.soundEnabled) {
            soundManager.playTimerStartSound();
          }
        } else {
          audioEngine.stopAll();
        }
        return next;
      });
    }
  }, [hideDoOrDieGraphic]);

  // Row 8: RESET TIMER (Normal timer reset)
  const handleResetTimerOnly = useCallback(() => {
    setIsRaidRunning(false);
    setRaidTime(settingsRef.current.raidDuration);
    if (isThirdRaidRef.current) {
      setIsThirdRaid(false);
      hideDoOrDieGraphic();
    }
    // Immediately stop any playing audio (siren, buzzer, ticks, custom audio files)
    audioEngine.stopAll();

    const played = audioEngine.playAction('resetTimer');
    if (!played && settingsRef.current.soundEnabled) {
      soundManager.playResetSound();
    }
  }, [hideDoOrDieGraphic]);

  // Shared Reset for both 30s Countdown Clock & 3rd Raid (Do-or-Die) on 'R' key
  const handleResetRaid = useCallback(() => {
    setIsRaidRunning(false);
    setRaidTime(settingsRef.current.raidDuration);
    setIsThirdRaid(false);
    hideDoOrDieGraphic();

    // Immediately stop all playing audio (3rd raid siren, horn buzzer, ticks, custom files)
    audioEngine.stopAll();

    const played = audioEngine.playAction('resetTimer');
    if (!played && settingsRef.current.soundEnabled) {
      soundManager.playResetSound();
    }
  }, [hideDoOrDieGraphic]);

  // Row 9: 3RD RAID (Start 3rd raid / Do-or-Die) on 'D' key
  const handleStartThirdRaid = useCallback(() => {
    if (raidTimeRef.current <= 0 || !isThirdRaidRef.current) {
      setRaidTime(settingsRef.current.raidDuration);
    }
    setIsRaidRunning(true);
    setIsThirdRaid(true);
    triggerDoOrDieGraphic();

    // Immediately stop prior audio so only one audio plays at a time
    audioEngine.stopAll();
    const played = audioEngine.playAction('thirdRaid');
    if (!played && settingsRef.current.soundEnabled) {
      soundManager.playDoOrDieSound();
    }
  }, [triggerDoOrDieGraphic]);

  // Row 10: 3RD RAID RESET (Cancel 3rd raid / Do-or-Die)
  const handleResetThirdRaid = useCallback(() => {
    setIsThirdRaid(false);
    hideDoOrDieGraphic();

    // Immediately stop 3rd raid siren and any other running audio
    audioEngine.stopAll();

    const played = audioEngine.playAction('thirdRaidReset');
    if (!played && settingsRef.current.soundEnabled) {
      soundManager.playResetSound();
    }
  }, [hideDoOrDieGraphic]);

  const handleDismissDoOrDieGraphic = useCallback(() => {
    hideDoOrDieGraphic();
  }, [hideDoOrDieGraphic]);

  // Legacy 3rd raid toggle
  const handleToggleThirdRaid = useCallback(() => {
    setIsThirdRaid((prev) => {
      const next = !prev;
      if (next) {
        if (raidTimeRef.current <= 0) {
          setRaidTime(settingsRef.current.raidDuration);
        }
        setIsRaidRunning(true);
        triggerDoOrDieGraphic();
        const played = audioEngine.playAction('thirdRaid');
        if (!played && settingsRef.current.soundEnabled) {
          soundManager.playDoOrDieSound();
        }
      } else {
        hideDoOrDieGraphic();
        audioEngine.stopAll();
        const played = audioEngine.playAction('thirdRaidReset');
        if (!played && settingsRef.current.soundEnabled) {
          soundManager.playResetSound();
        }
      }
      return next;
    });
  }, [triggerDoOrDieGraphic, hideDoOrDieGraphic]);

  // Row 11: STOP ALL AUDIO
  const handleStopAllAudio = useCallback(() => {
    audioEngine.stopAll();
  }, []);

  // Row 1 & Row 2: Team 1 score adjustments
  const handleAdjustTeam1 = useCallback((delta: number) => {
    setSettings((prev) => {
      const newScore = Math.max(0, prev.team1.score + delta);
      if (delta > 0) {
        const played = audioEngine.playAction('addPointTeam1');
        if (!played && prev.soundEnabled) soundManager.playPointSound();
      } else {
        audioEngine.playAction('minusPointTeam1');
      }
      const updated = {
        ...prev,
        team1: { ...prev.team1, score: newScore },
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Row 3: RESET SCORE TEAM 1
  const handleResetTeam1 = useCallback(() => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        team1: { ...prev.team1, score: 0 },
      };
      saveSettings(updated);
      return updated;
    });
    const played = audioEngine.playAction('resetScoreTeam1');
    if (!played && settingsRef.current.soundEnabled) {
      soundManager.playResetSound();
    }
  }, []);

  // Row 4 & Row 5: Team 2 score adjustments
  const handleAdjustTeam2 = useCallback((delta: number) => {
    setSettings((prev) => {
      const newScore = Math.max(0, prev.team2.score + delta);
      if (delta > 0) {
        const played = audioEngine.playAction('addPointTeam2');
        if (!played && prev.soundEnabled) soundManager.playPointSound();
      } else {
        audioEngine.playAction('minusPointTeam2');
      }
      const updated = {
        ...prev,
        team2: { ...prev.team2, score: newScore },
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Row 6: RESET SCORE TEAM 2
  const handleResetTeam2 = useCallback(() => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        team2: { ...prev.team2, score: 0 },
      };
      saveSettings(updated);
      return updated;
    });
    const played = audioEngine.playAction('resetScoreTeam2');
    if (!played && settingsRef.current.soundEnabled) {
      soundManager.playResetSound();
    }
  }, []);

  const handleUpdateTeam1Name = useCallback((name: string) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        team1: { ...prev.team1, name },
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const handleUpdateTeam2Name = useCallback((name: string) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        team2: { ...prev.team2, name },
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const handleResetMatchScores = useCallback(() => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        team1: { ...prev.team1, score: 0 },
        team2: { ...prev.team2, score: 0 },
      };
      saveSettings(updated);
      return updated;
    });
    handleResetRaid();
  }, [handleResetRaid]);

  const handleToggleSound = useCallback(() => {
    setSettings((prev) => {
      const updated = { ...prev, soundEnabled: !prev.soundEnabled };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const handleSaveSettings = useCallback((newSettings: ScoreboardSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleSaveLayout = useCallback((layout: ScoreboardUILayout) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        customLayout: layout,
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const handleEnterUIEditor = useCallback(() => {
    setIsOptionsOpen(false);
    setIsUIEditorActive(true);
  }, []);

  const handleExitUIEditor = useCallback(() => {
    setIsUIEditorActive(false);
  }, []);

  // Global Keyboard Navigation & Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // If in UI Editor mode and ESC is pressed, exit editor mode
      if (isUIEditorActiveRef.current && e.key === 'Escape') {
        e.preventDefault();
        setIsUIEditorActive(false);
        return;
      }

      const bindings = settingsRef.current.keyBindings;

      // ESCAPE key logic: open or close options
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOptionsOpen((prev) => !prev);
        return;
      }

      // If options modal, UI editor, or keybinding capture mode is active, ignore hotkeys
      if (isOptionsOpenRef.current || isUIEditorActiveRef.current || isCapturingKeyRef.current) {
        return;
      }

      // 1. STOP ALL AUDIO (Row 11) - Highest priority audio stop
      const stopAllKey = getActionKey('stopAllAudio', bindings);
      if (matchesKey(e, stopAllKey)) {
        e.preventDefault();
        handleStopAllAudio();
        return;
      }

      // 2. ADD POINT TEAM 1 + (Row 1)
      const addT1Key = getActionKey('addPointTeam1', bindings);
      if (matchesKey(e, addT1Key)) {
        e.preventDefault();
        handleAdjustTeam1(1);
        return;
      }

      // 3. MINUS POINT TEAM 1 - (Row 2)
      const subT1Key = getActionKey('minusPointTeam1', bindings);
      if (matchesKey(e, subT1Key)) {
        e.preventDefault();
        handleAdjustTeam1(-1);
        return;
      }

      // 4. RESET SCORE TEAM 1 (Row 3)
      const resetT1Key = getActionKey('resetScoreTeam1', bindings);
      if (matchesKey(e, resetT1Key)) {
        e.preventDefault();
        handleResetTeam1();
        return;
      }

      // 5. ADD POINT TEAM 2 + (Row 4)
      const addT2Key = getActionKey('addPointTeam2', bindings);
      if (matchesKey(e, addT2Key)) {
        e.preventDefault();
        handleAdjustTeam2(1);
        return;
      }

      // 6. MINUS POINT TEAM 2 - (Row 5)
      const subT2Key = getActionKey('minusPointTeam2', bindings);
      if (matchesKey(e, subT2Key)) {
        e.preventDefault();
        handleAdjustTeam2(-1);
        return;
      }

      // 7. RESET SCORE TEAM 2 (Row 6)
      const resetT2Key = getActionKey('resetScoreTeam2', bindings);
      if (matchesKey(e, resetT2Key)) {
        e.preventDefault();
        handleResetTeam2();
        return;
      }

      // 8. START TIMER (Row 7) & 'T' KEY (Sudden switch to normal raid timer)
      const startTimerKey = getActionKey('startTimer', bindings);
      const isTKey = e.key.toLowerCase() === 't' || e.code === 'KeyT';
      const isLegacyTimerToggle = bindings.raidTimerToggle ? matchesKey(e, bindings.raidTimerToggle) : false;
      if (matchesKey(e, startTimerKey) || isTKey || isLegacyTimerToggle) {
        e.preventDefault();
        handleToggleRaid();
        return;
      }

      // 9. RESET TIMER (Row 8) & 3RD RAID RESET (Row 10) & 'R' KEY (Shared timer and 3rd raid reset)
      const resetTimerKey = getActionKey('resetTimer', bindings);
      const thirdRaidResetKey = getActionKey('thirdRaidReset', bindings);
      const isRKey = e.key.toLowerCase() === 'r' || e.code === 'KeyR';
      const isResetTimerBound = matchesKey(e, resetTimerKey);
      const isThirdRaidResetBound = matchesKey(e, thirdRaidResetKey);
      const isLegacyRaidReset = bindings.raidTimerReset ? matchesKey(e, bindings.raidTimerReset) : false;

      if (isRKey || isResetTimerBound || isThirdRaidResetBound || isLegacyRaidReset) {
        e.preventDefault();
        // Immediately resets both normal countdown timer and 3rd raid, stopping all playing audio and sirens
        handleResetRaid();
        return;
      }

      // 10. 3RD RAID (Row 9) & 'D' KEY (Start Do-or-Die raid)
      const thirdRaidKey = getActionKey('thirdRaid', bindings);
      const isDKey = e.key.toLowerCase() === 'd' || e.code === 'KeyD';
      const isLegacyThirdRaid = bindings.thirdRaidToggle ? matchesKey(e, bindings.thirdRaidToggle) : false;
      if (matchesKey(e, thirdRaidKey) || isDKey || isLegacyThirdRaid) {
        e.preventDefault();
        handleStartThirdRaid();
        return;
      }

      // Fullscreen Toggle (f)
      if (bindings.toggleFullscreen && matchesKey(e, bindings.toggleFullscreen)) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Sound Mute / Unmute Toggle
      if (bindings.toggleSound && matchesKey(e, bindings.toggleSound)) {
        e.preventDefault();
        handleToggleSound();
        return;
      }

      // Reset Match Scores (x)
      if (bindings.resetScores && matchesKey(e, bindings.resetScores)) {
        e.preventDefault();
        handleResetMatchScores();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleToggleRaid,
    handleResetTimerOnly,
    handleResetRaid,
    handleStartThirdRaid,
    handleResetThirdRaid,
    handleStopAllAudio,
    handleAdjustTeam1,
    handleResetTeam1,
    handleAdjustTeam2,
    handleResetTeam2,
    handleResetMatchScores,
    toggleFullscreen,
    handleToggleSound,
  ]);

  return (
    <div className="w-screen h-screen bg-[#07090e] font-body">
      {/* Main Television / Stadium Screen: Only Left Team, 30s Raid Timer, Right Team */}
      <MainScoreboard
        settings={settings}
        raidTime={raidTime}
        isRaidRunning={isRaidRunning}
        isThirdRaid={isThirdRaid}
        showDoOrDieWarning={showDoOrDieWarning}
        onDismissDoOrDieWarning={handleDismissDoOrDieGraphic}
        onResetRaidTimerAndThirdRaid={handleResetRaid}
        isEditorActive={isUIEditorActive}
        onAdjustTeam1={handleAdjustTeam1}
        onAdjustTeam2={handleAdjustTeam2}
        onResetTeam1={handleResetTeam1}
        onResetTeam2={handleResetTeam2}
        onOpenOptions={() => {
          setOptionsInitialTab('themes');
          setIsOptionsOpen(true);
        }}
        onOpenObs={() => {
          setOptionsInitialTab('obs');
          setIsOptionsOpen(true);
        }}
        onSaveLayout={handleSaveLayout}
        onExitEditor={handleExitUIEditor}
      />

      {/* Options & Configuration Modal (Opened via ESC) */}
      <OptionsModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetMatchScores={handleResetMatchScores}
        onResetRaidTimer={handleResetRaid}
        onEnterUIEditor={handleEnterUIEditor}
        initialTab={optionsInitialTab}
        onCapturingStateChange={setIsCapturingKey}
      />
    </div>
  );
}
