export type NoteValue = 'whole' | 'half' | 'quarter' | '8th' | '16th' | '32nd';

export interface RhythmLayerConfig {
  id: NoteValue;
  label: string;
  subdivisions: number;
  color: string;
}

export interface AudioState {
  isPlaying: boolean;
  bpm: number;
  volume: number;
}
