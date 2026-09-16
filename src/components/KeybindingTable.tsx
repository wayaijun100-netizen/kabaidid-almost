import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Trash2, FolderOpen, RotateCcw, Volume2, VolumeX, Keyboard } from 'lucide-react';
import { KeyBindings, ScoreboardActionId, ScoreboardSettings } from '../types';
import {
  ACTION_DEFINITIONS,
  ActionDefinition,
  getActionKey,
  formatKeyDisplay,
  captureKeyFromEvent,
} from '../utils/actionKeybindings';
import { audioEngine, ActionAudioItem } from '../utils/audioEngine';

interface KeybindingTableProps {
  settings: ScoreboardSettings;
  onUpdateSettings: (newSettings: ScoreboardSettings) => void;
  onCapturingStateChange?: (isCapturing: boolean) => void;
}

export const KeybindingTable: React.FC<KeybindingTableProps> = ({
  settings,
  onUpdateSettings,
  onCapturingStateChange,
}) => {
  // State for which row is currently listening for keypress
  const [listeningActionId, setListeningActionId] = useState<ScoreboardActionId | null>(null);

  // Audio files state from AudioEngine
  const [audios, setAudios] = useState<Record<ScoreboardActionId, ActionAudioItem>>(() =>
    audioEngine.getAudios()
  );

  // Preview state (which action is currently previewing)
  const [previewingId, setPreviewingId] = useState<ScoreboardActionId | null>(null);

  // File input refs for each row
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Notify parent whether key capture is active so scoreboard keys are suppressed
  useEffect(() => {
    onCapturingStateChange?.(Boolean(listeningActionId));
  }, [listeningActionId, onCapturingStateChange]);

  // Subscribe to audio engine changes
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((newAudios) => {
      setAudios(newAudios);
    });
    return unsubscribe;
  }, []);

  // Keyboard capture event listener - Duplicate keys are allowed!
  useEffect(() => {
    if (!listeningActionId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default and stop propagation so scoreboard doesn't trigger
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      const capturedKey = captureKeyFromEvent(e);
      if (!capturedKey) return;

      const currentDef = ACTION_DEFINITIONS.find((d) => d.id === listeningActionId);
      if (!currentDef) {
        setListeningActionId(null);
        return;
      }

      // Duplicate keys are allowed for multiple actions (e.g. 'R' for both timer resets)
      applyKeyAssignment(listeningActionId, capturedKey);
      setListeningActionId(null);
    };

    // Use capturing phase so we intercept before any other listener
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [listeningActionId, settings.keyBindings]);

  // Apply a key assignment and update settings (keeps other actions intact)
  const applyKeyAssignment = (
    actionId: ScoreboardActionId,
    newKey: string
  ) => {
    const updatedBindings: KeyBindings = {
      ...settings.keyBindings,
      [actionId]: newKey,
    };

    // Keep legacy aliases in sync
    if (actionId === 'addPointTeam1') updatedBindings.team1Add = newKey;
    if (actionId === 'minusPointTeam1') updatedBindings.team1Sub = newKey;
    if (actionId === 'resetScoreTeam1') updatedBindings.team1Reset = newKey;
    if (actionId === 'addPointTeam2') updatedBindings.team2Add = newKey;
    if (actionId === 'minusPointTeam2') updatedBindings.team2Sub = newKey;
    if (actionId === 'resetScoreTeam2') updatedBindings.team2Reset = newKey;
    if (actionId === 'startTimer') updatedBindings.raidTimerToggle = newKey;
    if (actionId === 'resetTimer') updatedBindings.raidTimerReset = newKey;
    if (actionId === 'thirdRaid') updatedBindings.thirdRaidToggle = newKey;
    if (actionId === 'thirdRaidReset') updatedBindings.thirdRaidReset = newKey;
    if (actionId === 'stopAllAudio') updatedBindings.stopAllAudio = newKey;

    const updatedSettings: ScoreboardSettings = {
      ...settings,
      keyBindings: updatedBindings,
    };

    onUpdateSettings(updatedSettings);
  };

  // Reset all keys to default
  const handleResetDefaultKeys = () => {
    const updated: ScoreboardSettings = {
      ...settings,
      keyBindings: {
        ...settings.keyBindings,
        addPointTeam1: 'F1',
        minusPointTeam1: 'F2',
        resetScoreTeam1: 'F3',
        addPointTeam2: 'F4',
        minusPointTeam2: 'F5',
        resetScoreTeam2: 'F6',
        startTimer: 'Space',
        resetTimer: 'R',
        thirdRaid: 'D',
        thirdRaidReset: 'R',
        stopAllAudio: 'F11',
        team1Add: 'F1',
        team1Sub: 'F2',
        team1Reset: 'F3',
        team2Add: 'F4',
        team2Sub: 'F5',
        team2Reset: 'F6',
        raidTimerToggle: 'Space',
        raidTimerReset: 'R',
        thirdRaidToggle: 'D',
      },
    };
    onUpdateSettings(updated);
  };

  // Handle audio file selection
  const handleFileSelected = async (actionId: ScoreboardActionId, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    await audioEngine.setAudioFile(actionId, file);

    // Save filename to settings for persistence
    const updatedAudios = {
      ...settings.actionAudios,
      [actionId]: { fileName: file.name },
    };
    onUpdateSettings({
      ...settings,
      actionAudios: updatedAudios as any,
    });

    // Reset input value so same file can be picked again if desired
    e.target.value = '';
  };

  // Clear audio file
  const handleClearAudio = async (actionId: ScoreboardActionId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingId === actionId) {
      audioEngine.stopPreview();
      setPreviewingId(null);
    }
    await audioEngine.clearAudio(actionId);

    const updatedAudios = {
      ...settings.actionAudios,
      [actionId]: { fileName: null },
    };
    onUpdateSettings({
      ...settings,
      actionAudios: updatedAudios as any,
    });
  };

  // Toggle audio preview
  const handleTogglePreview = (actionId: ScoreboardActionId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingId === actionId) {
      audioEngine.stopPreview();
      setPreviewingId(null);
    } else {
      setPreviewingId(actionId);
      audioEngine.preview(actionId, () => {
        setPreviewingId(null);
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Help / Instruction bar at the top */}
      <div
        id="keybinding-help-bar"
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-950/70 via-slate-900/80 to-blue-950/70 border border-blue-500/30 rounded-xl shadow-inner text-blue-100"
      >
        <div className="flex items-center space-x-3 text-sm font-medium">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">Click on Keybinding cell to set key (duplicate keys allowed).</span>{' '}
            <span className="text-blue-200">Click on Sound File cell to select custom sound.</span>
          </div>
        </div>

        <button
          id="btn-reset-default-keys"
          type="button"
          onClick={handleResetDefaultKeys}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 hover:border-slate-600 transition-colors shadow-sm shrink-0 ml-4"
          title="Restore default keybindings (R for timer resets, D for 3rd raid, Space for timer)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Full-width Keybinding & Sound File Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-xl backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <th className="py-3 px-4 w-14 text-center">#</th>
              <th className="py-3 px-4 w-1/3">Action</th>
              <th className="py-3 px-4 w-1/4">Keybinding</th>
              <th className="py-3 px-4 w-5/12">Sound File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-sm">
            {ACTION_DEFINITIONS.map((row) => {
              const currentKey = getActionKey(row.id, settings.keyBindings);
              const isListening = listeningActionId === row.id;
              const audioItem = audios[row.id];
              const hasAudio = Boolean(audioItem?.url);
              const isPreviewing = previewingId === row.id;

              return (
                <tr
                  key={row.id}
                  id={`keybinding-row-${row.rowNumber}`}
                  className="hover:bg-slate-900/50 transition-colors group"
                >
                  {/* Column 1: # */}
                  <td className="py-3 px-4 text-center font-mono text-xs font-bold text-slate-400">
                    {row.rowNumber}
                  </td>

                  {/* Column 2: Action */}
                  <td className="py-3 px-4">
                    <div className="font-bold tracking-wide text-slate-100 flex items-center space-x-2">
                      <span>{row.label}</span>
                      {row.id === 'stopAllAudio' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                          Stops Playback
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 3: Keybinding Cell */}
                  <td className="py-3 px-4">
                    <div
                      id={`cell-keybinding-${row.id}`}
                      onClick={() => {
                        setListeningActionId(isListening ? null : row.id);
                      }}
                      className={`cursor-pointer select-none px-3.5 py-2 rounded-lg border text-center font-mono font-bold text-xs sm:text-sm tracking-wider transition-all duration-200 shadow-sm flex items-center justify-between ${
                        isListening
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 animate-pulse'
                          : 'bg-slate-900 border-slate-700 hover:border-blue-400 hover:bg-slate-800/90 text-blue-300'
                      }`}
                      title="Click to change shortcut key"
                    >
                      <span className="mx-auto">
                        {isListening ? 'PRESS A KEY...' : formatKeyDisplay(currentKey)}
                      </span>
                      {isListening && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setListeningActionId(null);
                          }}
                          className="ml-2 text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                          title="Cancel key capture"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Column 4: Sound File Cell */}
                  <td className="py-3 px-4">
                    {row.allowAudio ? (
                      <div className="flex items-center space-x-2">
                        {/* Hidden file input for native file dialog */}
                        <input
                          type="file"
                          accept="audio/*,.wav,.mp3,.ogg,.m4a,.aac"
                          ref={(el) => {
                            fileInputRefs.current[row.id] = el;
                          }}
                          onChange={(e) => handleFileSelected(row.id, e)}
                          className="hidden"
                          id={`file-input-${row.id}`}
                        />

                        {/* Sound file display / selector */}
                        <div
                          id={`cell-soundfile-${row.id}`}
                          onClick={() => fileInputRefs.current[row.id]?.click()}
                          className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            hasAudio
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-950/50'
                              : 'bg-slate-900/80 border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          }`}
                          title="Click to choose an audio file (.wav, .mp3, .ogg)"
                        >
                          <div className="flex items-center space-x-2 truncate mr-2">
                            <FolderOpen className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span className="truncate font-medium">
                              {hasAudio
                                ? audioItem.fileName || 'Custom Sound Configured'
                                : 'Click to select audio file...'}
                            </span>
                          </div>

                          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 hover:text-blue-300 bg-slate-800/80 px-1.5 py-0.5 rounded shrink-0">
                            {hasAudio ? 'Change' : 'Browse'}
                          </span>
                        </div>

                        {/* Controls: Preview / Stop / Clear */}
                        {hasAudio && (
                          <div className="flex items-center space-x-1 shrink-0">
                            {/* Play / Stop Preview */}
                            <button
                              type="button"
                              id={`btn-preview-${row.id}`}
                              onClick={(e) => handleTogglePreview(row.id, e)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isPreviewing
                                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md animate-pulse'
                                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white'
                              }`}
                              title={isPreviewing ? 'Stop Preview' : 'Play / Test Sound'}
                            >
                              {isPreviewing ? (
                                <Square className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current" />
                              )}
                            </button>

                            {/* Clear Audio */}
                            <button
                              type="button"
                              id={`btn-clear-audio-${row.id}`}
                              onClick={(e) => handleClearAudio(row.id, e)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-300 transition-colors"
                              title="Clear / Remove audio file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Row 11: STOP ALL AUDIO -> No audio file */
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-slate-400 text-xs font-medium italic">
                        <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>No sound required (Stops all active audio immediately)</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
