// ==========================================================================
// AUTHENTIC RETRO CRT & 1984 MACINTOSH SOUND ENGINE
// Powered by browser native Web Audio API (zero external assets/MP3s)
// Provides authentic CRT terminal, cathode ray flyback, and vintage hardware acoustics:
// 1. Classic CRT Terminal Click / Cathode Discharge Snap
// 2. High-Voltage Flyback Transformer Coil Pulse
// 3. CRT De-Gauss & Power Supply Resonance
// 4. 1984 Macintosh Square Wave Beep & Chimes
// 5. Heavy Hardware Lever / Relay Latch Clack
// 6. Stepper Motor Floppy Disk Head Seeks
// ==========================================================================

class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;

  constructor() {
    this.isMuted = localStorage.getItem('retro_sound_muted') === 'true';
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('retro_sound_muted', String(this.isMuted));
    if (!this.isMuted) {
      this.playCrtClick();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- 1. Mechanical Keyboard Engine (Tactile Blue Switch — optimized for rapid fire typing) ---
  public playMechanicalKey(key: string = '', code: string = '') {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const lowerKey = key.toLowerCase();

      // Route special keys to their dedicated sounds
      if (lowerKey === ' ' || code === 'Space') { this.playSpacebarClack(); return; }
      if (lowerKey === 'backspace' || lowerKey === 'delete' || code === 'Backspace' || code === 'Delete') { this.playBackspaceClack(); return; }
      if (lowerKey === 'enter' || code === 'Enter' || code === 'NumpadEnter') { this.playEnterClack(); return; }
      if (lowerKey === 'tab' || lowerKey === 'escape' || code === 'Tab' || code === 'Escape') { this.playModifierClack(20, 1.05); return; }
      if (lowerKey === 'shift' || lowerKey === 'control' || lowerKey === 'alt' || lowerKey === 'meta') { this.playModifierClack(-10, 0.9); return; }

      // Skip non-character keys (arrows, F-keys, etc.) with a subtle tick
      if (key.length > 1) {
        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        tickOsc.type = 'square';
        tickOsc.frequency.setValueAtTime(1800, now);
        tickGain.gain.setValueAtTime(0.12, now);
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
        tickOsc.connect(tickGain);
        tickGain.connect(ctx.destination);
        tickOsc.start(now);
        tickOsc.stop(now + 0.015);
        return;
      }

      // --- Alphanumeric / Symbol Key ---
      // Each character gets a unique pitch derived from its char code
      const charCode = key.charCodeAt(0);
      // Spread pitch across ~240Hz range for distinct per-key acoustics
      const pitchVar  = ((charCode % 24) - 12) * 10 + (Math.random() - 0.5) * 15;
      // Randomise volume slightly so rapid fire sounds organic, not robotic
      const volVar    = 0.72 + Math.random() * 0.18;

      const master = ctx.createGain();
      master.gain.setValueAtTime(volVar, now);
      master.connect(ctx.destination);

      // --- Layer 1: Leaf-Spring Actuation Snap (sharp burst ~3400Hz) ---
      // Ultra-short: 6ms — fully gone before next keystroke at 40ms interval
      const snapLen = Math.floor(ctx.sampleRate * 0.006);
      const snapBuf = ctx.createBuffer(1, snapLen, ctx.sampleRate);
      const snapData = snapBuf.getChannelData(0);
      for (let i = 0; i < snapLen; i++) {
        snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapLen * 0.10));
      }
      const snapSrc = ctx.createBufferSource();
      snapSrc.buffer = snapBuf;

      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(3400 + pitchVar * 5, now);
      snapFilter.Q.setValueAtTime(3.0, now);

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(1.0, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.006);

      snapSrc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(master);
      snapSrc.start(now);
      snapSrc.stop(now + 0.007);

      // --- Layer 2: Stem Bottom-Out Clack (pitched impact thud) ---
      // Tight 18ms decay — clearly audible but never overlaps with next snap
      const clackOsc = ctx.createOscillator();
      const clackGain = ctx.createGain();
      clackOsc.type = 'triangle';
      clackOsc.frequency.setValueAtTime(720 + pitchVar * 2.5, now);
      clackOsc.frequency.exponentialRampToValueAtTime(120, now + 0.018);
      clackGain.gain.setValueAtTime(0.65, now);
      clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
      clackOsc.connect(clackGain);
      clackGain.connect(master);
      clackOsc.start(now);
      clackOsc.stop(now + 0.020);

      // --- Layer 3: Keycap Body Resonance (very short warm thud, 22ms) ---
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(260 + pitchVar, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(70, now + 0.022);
      bodyGain.gain.setValueAtTime(0.38, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(master);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.025);
    } catch {}
  }


  // Backspace Key: Heavier, lower-pitched solid clack with distinct return snap
  public playBackspaceClack() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.85, now);
      master.connect(ctx.destination);

      // Heavier bottom-out impact
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(450, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(90, now + 0.035);

      bodyGain.gain.setValueAtTime(0.7, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(master);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.04);

      // Rebound spring snap
      const snapLen = Math.floor(ctx.sampleRate * 0.01);
      const snapBuf = ctx.createBuffer(1, snapLen, ctx.sampleRate);
      const snapData = snapBuf.getChannelData(0);
      for (let i = 0; i < snapLen; i++) {
        snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapLen * 0.18));
      }
      const snapSrc = ctx.createBufferSource();
      snapSrc.buffer = snapBuf;

      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(2200, now);

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.6, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);

      snapSrc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(master);
      snapSrc.start(now);
      snapSrc.stop(now + 0.012);
    } catch {}
  }

  // Enter Key: Stabilized heavy keycap clack with dual-housing reverberation
  public playEnterClack() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.9, now);
      master.connect(ctx.destination);

      // Deep stabilized thud
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(280, now);
      thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

      thudGain.gain.setValueAtTime(0.8, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      thudOsc.connect(thudGain);
      thudGain.connect(master);
      thudOsc.start(now);
      thudOsc.stop(now + 0.055);

      // Metallic wire stabilizer tick
      const wireOsc = ctx.createOscillator();
      const wireGain = ctx.createGain();
      wireOsc.type = 'square';
      wireOsc.frequency.setValueAtTime(1800, now);
      wireOsc.frequency.exponentialRampToValueAtTime(320, now + 0.015);

      wireGain.gain.setValueAtTime(0.45, now);
      wireGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      wireOsc.connect(wireGain);
      wireGain.connect(master);
      wireOsc.start(now);
      wireOsc.stop(now + 0.018);
    } catch {}
  }

  // Modifier Key Clack (Shift, Ctrl, Alt, Tab)
  public playModifierClack(pitchOffset: number = 0, volumeScale: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.7 * volumeScale, now);
      master.connect(ctx.destination);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520 + pitchOffset, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.02);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch {}
  }

  // --- 2. Classic Retro CRT Terminal Click (Cathode Ray & Flyback Pulse) ---
  public playCrtClick(pitchOffset: number = 0, volumeScale: number = 1.0) {
    this.playMechanicalKey();
  }

  public playMechanicalKeyboardClick(pitchOffset: number = 0, volumeScale: number = 1.0) {
    this.playMechanicalKey();
  }

  // --- 2. Stabilized Spacebar & Heavy CRT Key Clack ---
  public playSpacebarClack() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.85, now);
      master.connect(ctx.destination);

      // Deep CRT phosphor impact
      const lowOsc = ctx.createOscillator();
      const lowGain = ctx.createGain();
      lowOsc.type = 'sine';
      lowOsc.frequency.setValueAtTime(160, now);
      lowOsc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

      lowGain.gain.setValueAtTime(0.75, now);
      lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      lowOsc.connect(lowGain);
      lowGain.connect(master);
      lowOsc.start(now);
      lowOsc.stop(now + 0.065);

      // CRT wire snap
      const snapLen = Math.floor(ctx.sampleRate * 0.015);
      const snapBuf = ctx.createBuffer(1, snapLen, ctx.sampleRate);
      const snapOut = snapBuf.getChannelData(0);
      for (let i = 0; i < snapLen; i++) {
        snapOut[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapLen * 0.2));
      }
      const snapSource = ctx.createBufferSource();
      snapSource.buffer = snapBuf;

      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(2400, now);
      snapFilter.Q.setValueAtTime(3.5, now);

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.6, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      snapSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(master);
      snapSource.start(now);
      snapSource.stop(now + 0.018);
    } catch {}
  }

  // --- 3. Button Click (Calls CRT Click) ---
  public playButtonClick(pitchMod: number = 1.0) {
    this.playCrtClick(pitchMod === 1.0 ? 0 : 40, 1.0);
  }

  // --- 4. Heavy Hardware Lever / Relay Latch Clack ---
  public playLeverClack() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(280, now);
      osc1.frequency.exponentialRampToValueAtTime(45, now + 0.05);

      gain1.gain.setValueAtTime(0.45, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.055);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(560, now + 0.025);
      osc2.frequency.exponentialRampToValueAtTime(80, now + 0.065);

      gain2.gain.setValueAtTime(0.3, now + 0.025);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.025);
      osc2.stop(now + 0.07);
    } catch {}
  }

  // --- 5. CRT De-Gauss & Flyback Coil Ping ---
  public playCrtDegauss() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const humOsc = ctx.createOscillator();
      const humGain = ctx.createGain();
      humOsc.type = 'sawtooth';
      humOsc.frequency.setValueAtTime(110, now);
      humOsc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

      humGain.gain.setValueAtTime(0.45, now);
      humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      const humFilter = ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(280, now);
      humFilter.frequency.linearRampToValueAtTime(80, now + 0.28);

      humOsc.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start(now);
      humOsc.stop(now + 0.3);

      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();
      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(2400, now);
      pingOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

      pingGain.gain.setValueAtTime(0.12, now);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      pingOsc.connect(pingGain);
      pingGain.connect(ctx.destination);
      pingOsc.start(now);
      pingOsc.stop(now + 0.14);
    } catch {}
  }

  // --- 6. 1984 Macintosh Square Wave Beep ---
  public playCrtBeep(freq: number = 880, duration: number = 0.09) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0.15, now + duration - 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch {}
  }

  // --- 7. Stepper Motor Floppy Seek ---
  public playFloppySeek() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const stepTime = now + (i * 0.045);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320 + (i % 2) * 120, stepTime);
        osc.frequency.exponentialRampToValueAtTime(60, stepTime + 0.025);

        gain.gain.setValueAtTime(0.18, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.025);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(stepTime);
        osc.stop(stepTime + 0.03);
      }
    } catch {}
  }

  // --- 8. Typing in Textareas & Inputs ---
  public playKeyType() {
    this.playMechanicalKeyboardClick(0, 0.95);
  }

  // --- 9. Task Success 1984 Tri-Tone Chime ---
  public playSuccessChime() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const time = now + (idx * 0.075);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.28);
      });
    } catch {}
  }

  // --- 10. Error / Stop Buzzer ---
  public playErrorBuzz() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.setValueAtTime(90, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // --- Global Click & Keystroke Listener ---
  public attachGlobalInteractivity() {
    if (this.initialized) return;
    this.initialized = true;

    // Instant unlock of browser Web Audio context on first user gesture
    const unlockAudio = () => { this.initCtx(); };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('mousedown', unlockAudio);

    // Global tactile click dispatcher: every clickable element triggers a sound
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const btn = target.closest('button, .retro-btn, .btn-ws-tab, .session-item, .file-item, input, select, [role="button"], a');
      if (btn) {
        if (btn.id === 'btnSubmitTask' || btn.id === 'btnHeaderRun') {
          this.playCrtDegauss();
        } else if (btn.id === 'btnStopExecution' || btn.classList.contains('retro-btn-danger')) {
          this.playErrorBuzz();
        } else if (btn.id === 'btnSaveFile' || btn.id === 'btnExportProjectZip') {
          this.playFloppySeek();
        } else if (btn.id === 'btnDockModeAgent' || btn.id === 'btnDockModeAsk' || btn.id === 'btnToggleSidePanel') {
          this.playLeverClack();
        } else {
          this.playCrtClick();
        }
      } else {
        this.playCrtClick(-20, 0.65);
      }
    }, true);

    // -----------------------------------------------------------------------
    // GLOBAL MECHANICAL KEYBOARD — fires on EVERY keydown including repeats
    // Throttle: max one sound per key per 40ms to prevent Web Audio overload
    // while sounding like a full mechanical keyboard typewriter rattle.
    // -----------------------------------------------------------------------
    const keyLastFired: Record<string, number> = {};
    const REPEAT_THROTTLE_MS = 40; // ~25 clicks/sec max per key

    document.addEventListener('keydown', (e) => {
      const now = performance.now();
      const key = e.code || e.key;
      const lastTime = keyLastFired[key] ?? 0;

      // On first press (not repeat): fire immediately, no throttle
      // On repeat: fire only if enough time has passed
      if (!e.repeat || (now - lastTime) >= REPEAT_THROTTLE_MS) {
        keyLastFired[key] = now;
        this.playMechanicalKey(e.key, e.code);
      }
    }, true);
  }
}

export const soundEngine = new RetroSoundEngine();
