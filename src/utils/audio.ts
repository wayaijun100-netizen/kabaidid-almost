/**
 * Web Audio API synthesizer for arena scoreboard sound effects
 */

type AudioStopper = () => void;
let externalAudioStopper: AudioStopper | null = null;

export function setExternalAudioStopper(fn: AudioStopper) {
  externalAudioStopper = fn;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.8;
  private masterGain: GainNode | null = null;
  private activeOscillators: Set<OscillatorNode> = new Set();

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  private registerAndStart(osc: OscillatorNode, startTime: number, stopTime: number) {
    this.activeOscillators.add(osc);
    const cleanup = () => {
      this.activeOscillators.delete(osc);
    };
    osc.addEventListener('ended', cleanup);
    try {
      osc.start(startTime);
      osc.stop(stopTime);
    } catch {
      cleanup();
    }
  }

  /**
   * Stadium Klaxon Horn (Raid buzzer at 0s)
   */
  public playBuzzer() {
    if (!this.enabled) return;
    this.stopAll();
    if (externalAudioStopper) externalAudioStopper();

    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const duration = 1.2;

    const localGain = ctx.createGain();
    localGain.gain.setValueAtTime(0.001, now);
    localGain.gain.exponentialRampToValueAtTime(0.7, now + 0.05);
    localGain.gain.setValueAtTime(0.7, now + duration - 0.2);
    localGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    localGain.connect(this.masterGain);

    // Multi-oscillator stadium horn
    const freqs = [150, 155, 300, 450];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.25;
      osc.connect(oscGain);
      oscGain.connect(localGain);

      this.registerAndStart(osc, now, now + duration);
    });
  }

  /**
   * Countdown warning tick (last 10 seconds of raid)
   */
  public playTick(frequency: number = 900) {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const duration = 0.08;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    this.registerAndStart(osc, now, now + duration);
  }

  /**
   * Normal Raid Timer Start Blip (Stadium whistle/alert)
   */
  public playTimerStartSound() {
    if (!this.enabled) return;
    this.stopAll();
    if (externalAudioStopper) externalAudioStopper();

    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const duration = 0.22;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    this.registerAndStart(osc, now, now + duration);
  }

  /**
   * Reset confirmation blip
   */
  public playResetSound() {
    if (!this.enabled) return;
    this.stopAll();
    if (externalAudioStopper) externalAudioStopper();

    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    [0, 0.09].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 0 ? 520 : 780, now + offset);

      gain.gain.setValueAtTime(0.35, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.registerAndStart(osc, now + offset, now + offset + 0.07);
    });
  }

  /**
   * 3rd Raid (Do-or-Die) Intense Alert Siren
   */
  public playDoOrDieSound() {
    if (!this.enabled) return;
    this.stopAll();
    if (externalAudioStopper) externalAudioStopper();

    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const duration = 0.9;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(440, now + duration);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    this.registerAndStart(osc, now, now + duration);
  }

  /**
   * Point Scoring Stadium Chime
   */
  public playPointSound() {
    if (!this.enabled) return;
    this.stopAll();
    if (externalAudioStopper) externalAudioStopper();

    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio / chord

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.04;
      const noteDuration = 0.5;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.registerAndStart(osc, startTime, startTime + noteDuration);
    });
  }

  /**
   * Stop all active synthesized sounds immediately
   */
  public stopAll() {
    // 1. Force stop all active oscillators immediately
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators.clear();

    // 2. Mute master gain instantly to kill any in-flight transitions
    if (this.ctx && this.masterGain) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(0, now);
        // Ramp back up quickly for immediate new sounds
        this.masterGain.gain.setValueAtTime(this.volume, now + 0.005);
      } catch {}
    }
  }
}

export const soundManager = new SoundManager();
