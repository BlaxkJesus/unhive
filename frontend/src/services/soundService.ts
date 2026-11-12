/**
 * UniHive™ Web Audio Notification Sound Synthesizer
 * Generates clear, resonant, and harmonious notification chimes
 * using standard browser Web Audio API oscillators.
 * Zero external audio asset dependencies, works 100% offline.
 */

class SoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    // Check localStorage preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unihive_sound_enabled');
      if (saved !== null) {
        this.isMuted = saved === 'false';
      }

      // Auto-unlock Web Audio on first user interaction per browser policy
      const unlockAudio = () => {
        this.ensureContext();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        this.isUnlocked = true;
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('unihive_sound_enabled', (!muted).toString());
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Soft Bell Chime: Melodic 2-tone pleasant bell (D5 -> A5)
   * Perfect for order status updates, in-transit notices, and porter desk arrivals.
   */
  public playChime(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    this.playTone(ctx, 587.33, now, 0.35, 'sine', 0.2);

    // Tone 2: 880.00 Hz (A5)
    this.playTone(ctx, 880.0, now + 0.12, 0.45, 'sine', 0.22);
  }

  /**
   * Triumphant Escrow Payout & Delivery Complete Arpeggio (C5 -> E5 -> G5)
   * Plays when payment is settled, PIN is verified, or funds credited.
   */
  public playSuccess(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Fast ascending major triad: C5 (523.25) -> E5 (659.25) -> G5 (783.99)
    this.playTone(ctx, 523.25, now, 0.2, 'triangle', 0.18);
    this.playTone(ctx, 659.25, now + 0.08, 0.22, 'triangle', 0.2);
    this.playTone(ctx, 783.99, now + 0.16, 0.45, 'sine', 0.25);
  }

  /**
   * Attention Alert / Proctor Ping: Dual soft bell
   * Used for dispute mediation notices or action-required prompts.
   */
  public playAlert(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    this.playTone(ctx, 698.46, now, 0.15, 'sine', 0.22);
    this.playTone(ctx, 587.33, now + 0.15, 0.35, 'sine', 0.24);
  }

  /**
   * Helper to synthesize individual harmonic tones with smooth exponential decay.
   */
  private playTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine',
    maxGain: number = 0.2
  ): void {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Fast attack & natural exponential decay to avoid popping clicks
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn('[SoundService] Could not play synthesized tone:', e);
    }
  }
}

export const soundService = new SoundService();
