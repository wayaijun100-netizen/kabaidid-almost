import { ScoreboardActionId } from '../types';
import { saveAudioBlob, getAllAudioBlobs, deleteAudioBlob } from './audioStorage';
import { soundManager, setExternalAudioStopper } from './audio';

export interface ActionAudioItem {
  fileName: string | null;
  url: string | null;
}

type AudioChangeListener = (audios: Record<ScoreboardActionId, ActionAudioItem>) => void;

class AudioEngine {
  private audios: Record<ScoreboardActionId, ActionAudioItem> = {
    addPointTeam1: { fileName: null, url: null },
    minusPointTeam1: { fileName: null, url: null },
    resetScoreTeam1: { fileName: null, url: null },
    addPointTeam2: { fileName: null, url: null },
    minusPointTeam2: { fileName: null, url: null },
    resetScoreTeam2: { fileName: null, url: null },
    startTimer: { fileName: null, url: null },
    resetTimer: { fileName: null, url: null },
    thirdRaid: { fileName: null, url: null },
    thirdRaidReset: { fileName: null, url: null },
    stopAllAudio: { fileName: null, url: null },
  };

  private activeInstances: Set<HTMLAudioElement> = new Set();
  private currentPreview: HTMLAudioElement | null = null;
  private previewActionId: ScoreboardActionId | null = null;
  private listeners: Set<AudioChangeListener> = new Set();
  private isInitialized = false;

  /**
   * Initialize audio engine by loading saved files from IndexedDB
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const stored = await getAllAudioBlobs();
      for (const [actionId, item] of Object.entries(stored)) {
        const id = actionId as ScoreboardActionId;
        if (this.audios[id]) {
          const url = URL.createObjectURL(item.blob);
          this.audios[id] = {
            fileName: item.fileName,
            url,
          };
        }
      }
      this.notifyListeners();
    } catch (err) {
      console.error('Error initializing AudioEngine:', err);
    }
  }

  /**
   * Subscribe to audio config changes
   */
  public subscribe(listener: AudioChangeListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.audios });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const copy = { ...this.audios };
    this.listeners.forEach((fn) => fn(copy));
  }

  public getAudios(): Record<ScoreboardActionId, ActionAudioItem> {
    return { ...this.audios };
  }

  public hasAudio(actionId: ScoreboardActionId): boolean {
    return Boolean(this.audios[actionId]?.url);
  }

  public getAudioItem(actionId: ScoreboardActionId): ActionAudioItem {
    return this.audios[actionId] || { fileName: null, url: null };
  }

  /**
   * Assign and persist a local audio file for an action
   */
  public async setAudioFile(actionId: ScoreboardActionId, file: File): Promise<void> {
    if (actionId === 'stopAllAudio') return; // Stop all audio doesn't need an audio file

    // Revoke previous url if any
    const prev = this.audios[actionId];
    if (prev?.url) {
      URL.revokeObjectURL(prev.url);
    }

    const url = URL.createObjectURL(file);
    this.audios[actionId] = {
      fileName: file.name,
      url,
    };

    this.notifyListeners();
    await saveAudioBlob(actionId, file);
  }

  /**
   * Clear and delete audio file for an action
   */
  public async clearAudio(actionId: ScoreboardActionId): Promise<void> {
    const prev = this.audios[actionId];
    if (prev?.url) {
      URL.revokeObjectURL(prev.url);
    }

    if (this.previewActionId === actionId) {
      this.stopPreview();
    }

    this.audios[actionId] = {
      fileName: null,
      url: null,
    };

    this.notifyListeners();
    await deleteAudioBlob(actionId);
  }

  /**
   * Stop all playing HTMLAudioElement instances and previews
   */
  public stopAudioElements(): void {
    this.activeInstances.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
    this.activeInstances.clear();

    if (this.currentPreview) {
      try {
        this.currentPreview.pause();
        this.currentPreview.currentTime = 0;
      } catch {}
      this.currentPreview = null;
      this.previewActionId = null;
    }
  }

  /**
   * Play the custom audio configured for an action
   * Returns true if custom audio was played, false otherwise
   */
  public playAction(actionId: ScoreboardActionId): boolean {
    const item = this.audios[actionId];
    if (!item?.url) return false;

    // AT A TIME ONLY ONE AUDIO ONLY PLAYED:
    // Instantly cut off all playing sounds (files and synthesizers)
    this.stopAll();

    try {
      const audio = new Audio(item.url);
      this.activeInstances.add(audio);

      const cleanup = () => {
        this.activeInstances.delete(audio);
      };

      audio.addEventListener('ended', cleanup);
      audio.addEventListener('error', cleanup);
      audio.addEventListener('pause', cleanup);

      audio.play().catch((err) => {
        this.activeInstances.delete(audio);
        console.warn(`Could not play audio for ${actionId}:`, err);
      });

      return true;
    } catch (err) {
      console.warn(`Audio playback error for ${actionId}:`, err);
      return false;
    }
  }

  /**
   * Preview an audio file in the settings UI
   */
  public preview(actionId: ScoreboardActionId, onEnded?: () => void): void {
    // AT A TIME ONLY ONE AUDIO ONLY PLAYED:
    this.stopAll();

    const item = this.audios[actionId];
    if (!item?.url) return;

    try {
      const audio = new Audio(item.url);
      this.currentPreview = audio;
      this.previewActionId = actionId;
      this.activeInstances.add(audio);

      const handleEnd = () => {
        if (this.currentPreview === audio) {
          this.currentPreview = null;
          this.previewActionId = null;
        }
        this.activeInstances.delete(audio);
        if (onEnded) onEnded();
      };

      audio.addEventListener('ended', handleEnd);
      audio.addEventListener('pause', handleEnd);
      audio.addEventListener('error', handleEnd);

      audio.play().catch(handleEnd);
    } catch {
      this.currentPreview = null;
      this.previewActionId = null;
      if (onEnded) onEnded();
    }
  }

  /**
   * Stop any current preview playback
   */
  public stopPreview(): void {
    if (this.currentPreview) {
      try {
        this.currentPreview.pause();
        this.currentPreview.currentTime = 0;
      } catch {}
      this.activeInstances.delete(this.currentPreview);
      this.currentPreview = null;
      this.previewActionId = null;
    }
  }

  public getPreviewingActionId(): ScoreboardActionId | null {
    return this.previewActionId;
  }

  /**
   * STOP ALL AUDIO:
   * Immediately stops all currently playing audio instances and synthesizer/horns
   */
  public stopAll(): void {
    // 1. Stop all playing HTMLAudioElement instances
    this.activeInstances.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
    this.activeInstances.clear();

    // 2. Stop preview if active
    if (this.currentPreview) {
      try {
        this.currentPreview.pause();
        this.currentPreview.currentTime = 0;
      } catch {}
      this.currentPreview = null;
      this.previewActionId = null;
    }

    // 3. Stop synthesizer sounds & buzzers
    soundManager.stopAll();
  }
}

export const audioEngine = new AudioEngine();

// Ensure when soundManager plays any sound, any running audio element is also stopped immediately
setExternalAudioStopper(() => {
  audioEngine.stopAudioElements();
});
