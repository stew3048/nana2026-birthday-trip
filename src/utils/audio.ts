// Web Audio API ambient romantic music generator
// Gentle acoustic piano / celestial music box chords progression for romantic birthday atmosphere

class RomanticMusicSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private masterGain: GainNode | null = null;
  private currentStep = 0;

  // Chord progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4 -> Cmaj7
  private chords = [
    [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
    [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
    [174.61, 261.63, 329.63, 349.23, 440.00], // Fmaj7
    [196.00, 261.63, 349.23, 392.00, 587.33], // Gsus4/add9
    [261.63, 329.63, 392.00, 493.88, 659.25], // Cmaj7/high
    [220.00, 293.66, 329.63, 440.00, 523.25], // Dm9/Am
    [174.61, 220.00, 261.63, 329.63, 392.00], // Fadd9
    [196.00, 246.94, 293.66, 392.00, 493.88], // G7
  ];

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  private playTone(freq: number, delay: number, duration: number, volume = 0.25) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Warm soft bell / electric piano tone using triangle wave + slight sine blend
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

    // Subtle gentle vibrato
    const startTime = this.ctx.currentTime + delay;
    noteGain.gain.setValueAtTime(0.001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(volume, startTime + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(volume * 0.4, startTime + duration * 0.4);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  private playArpeggio() {
    if (!this.isPlaying || !this.ctx) return;

    const chord = this.chords[this.currentStep % this.chords.length];
    
    // Play warm root bass note
    this.playTone(chord[0] / 2, 0, 3.8, 0.22);

    // Arpeggiate the romantic notes like a soft music box
    chord.forEach((freq, idx) => {
      const noteDelay = idx * 0.45;
      this.playTone(freq, noteDelay, 2.4, 0.18);
    });

    // Add a gentle high sparkle note
    if (this.currentStep % 2 === 0) {
      this.playTone(chord[3] * 1.5, 2.2, 1.8, 0.12);
    }

    this.currentStep++;
    this.timerId = window.setTimeout(() => {
      this.playArpeggio();
    }, 2800);
  }

  public start() {
    if (this.isPlaying) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
    this.playArpeggio();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const romanticMusic = new RomanticMusicSynth();
