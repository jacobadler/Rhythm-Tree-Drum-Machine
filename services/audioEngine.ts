import { NoteValue } from '../types';

// Constants
const LOOKAHEAD = 25.0; // ms
const SCHEDULE_AHEAD_TIME = 0.1; // seconds

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private isPlaying: boolean = false;
  
  // 0 to 31 (one measure of 32nd notes)
  private current32ndNote: number = 0;

  // State
  private bpm: number = 100;
  private activeLayers: Set<NoteValue> = new Set();
  private masterVolume: number = 0.5;

  constructor() {
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public setBpm(bpm: number) {
    this.bpm = bpm;
  }

  public setVolume(vol: number) {
    this.masterVolume = vol;
  }

  public updateActiveLayers(layers: Set<NoteValue>) {
    this.activeLayers = layers;
  }

  public start() {
    this.initContext();
    if (this.isPlaying) return;

    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.current32ndNote = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.1;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
    // We don't need to strictly disconnect nodes because our lookahead is now very short (0.1s).
    // The "delay" complaint was due to scheduling whole measures (4s) ahead.
  }

  public getCurrentTime() {
    return this.ctx?.currentTime || 0;
  }

  // Returns the normalized progress (0.0 to 1.0) of the current measure
  public getProgress(): number {
    if (!this.isPlaying || !this.ctx) return 0;
    // Use the discrete step for reliability with the new scheduler. 
    return this.current32ndNote / 32;
  }

  private scheduler() {
    if (!this.ctx) return;

    // While there are notes that will need to play before the next interval, schedule them
    while (this.nextNoteTime < this.ctx.currentTime + SCHEDULE_AHEAD_TIME) {
      this.scheduleNote(this.current32ndNote, this.nextNoteTime);
      this.advanceNote();
    }

    if (this.isPlaying) {
      this.timerID = window.setTimeout(() => this.scheduler(), LOOKAHEAD);
    }
  }

  private advanceNote() {
    // Advance time by a 32nd note duration
    const secondsPerBeat = 60.0 / this.bpm;
    // 32nd note = 1/8 of a beat
    const secondsPer32nd = secondsPerBeat / 8;
    
    this.nextNoteTime += secondsPer32nd;
    
    this.current32ndNote++;
    if (this.current32ndNote === 32) {
      this.current32ndNote = 0;
    }
  }

  private scheduleNote(noteIndex: number, time: number) {
    // Check each active layer to see if it triggers on this 32nd note index
    
    // Whole: index 0 only
    if (this.activeLayers.has('whole') && noteIndex === 0) {
      this.playSound(time, 'whole');
    }
    
    // Half: index 0, 16
    if (this.activeLayers.has('half') && noteIndex % 16 === 0) {
      this.playSound(time, 'half');
    }

    // Quarter: index 0, 8, 16, 24
    if (this.activeLayers.has('quarter') && noteIndex % 8 === 0) {
      this.playSound(time, 'quarter');
    }

    // 8th: index 0, 4, 8, 12...
    if (this.activeLayers.has('8th') && noteIndex % 4 === 0) {
      this.playSound(time, '8th');
    }

    // 16th: index 0, 2, 4...
    if (this.activeLayers.has('16th') && noteIndex % 2 === 0) {
      this.playSound(time, '16th');
    }

    // 32nd: every index
    if (this.activeLayers.has('32nd')) {
      this.playSound(time, '32nd');
    }
  }

  private playSound(time: number, layer: NoteValue) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vol = this.masterVolume;

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    switch (layer) {
      case 'whole':
        // Crash Cymbal / Gong type sound
        // Metallic, noisy, long decay
        this.createCymbal(time, vol * 0.7);
        break;

      case 'half':
        // Snare Drum (Triangle Tone + Noise)
        // More percussive and distinct than previous Tom
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, time);
        gain.gain.setValueAtTime(vol, time); // Full volume
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.start(time);
        osc.stop(time + 0.2);
        
        // Add snappy noise layer
        this.playNoise(time, vol, 0.2, 1000);
        break;

      case 'quarter':
        // Kick Drum
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        osc.start(time);
        osc.stop(time + 0.5);
        break;

      case '8th':
        // Woodblock
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, time);
        gain.gain.setValueAtTime(vol * 0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
        break;

      case '16th':
        // Closed Hi-Hat
        this.playNoise(time, vol * 0.4, 0.05, 5000);
        break;

      case '32nd':
        // Click / Shaker
        this.playNoise(time, vol * 0.25, 0.02, 8000);
        break;
    }
  }

  private createCymbal(time: number, vol: number) {
     if (!this.ctx) return;
     // Ratio of frequencies for metal sound
     const ratios = [1, 1.342, 1.2312, 1.6532, 1.9523, 2.1523];
     
     const bandpass = this.ctx.createBiquadFilter();
     bandpass.type = "bandpass";
     bandpass.frequency.value = 1000;
     bandpass.Q.value = 0.5;

     const highpass = this.ctx.createBiquadFilter();
     highpass.type = "highpass";
     highpass.frequency.value = 2000;

     const masterGain = this.ctx.createGain();
     masterGain.gain.setValueAtTime(vol, time);
     masterGain.gain.exponentialRampToValueAtTime(0.01, time + 1.5);

     masterGain.connect(this.ctx.destination);
     
     // Noise part
     this.playNoiseThroughNode(time, 1.5, masterGain, highpass);
  }

  private playNoiseThroughNode(time: number, duration: number, dest: AudioNode, filter?: AudioNode) {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      if (filter) {
          noise.connect(filter);
          filter.connect(dest);
      } else {
          noise.connect(dest);
      }
      
      noise.start(time);
      noise.stop(time + duration);
  }

  private playNoise(time: number, vol: number, duration: number, freq: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = freq;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start(time);
    noise.stop(time + duration);
  }
}

export const audioEngine = new AudioEngine();