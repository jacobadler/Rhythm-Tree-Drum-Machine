import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RhythmRow } from './components/RhythmRow';
import { audioEngine } from './services/audioEngine';
import { NoteValue, RhythmLayerConfig } from './types';
import { Play, Pause, RefreshCw, Volume2, Music } from 'lucide-react';

const LAYERS: RhythmLayerConfig[] = [
  { id: 'whole', label: 'Whole', subdivisions: 1, color: '#6366f1' },    // Indigo
  { id: 'half', label: 'Half', subdivisions: 2, color: '#8b5cf6' },     // Violet
  { id: 'quarter', label: 'Quarter', subdivisions: 4, color: '#ec4899' }, // Pink
  { id: '8th', label: '8th', subdivisions: 8, color: '#f43f5e' },       // Rose
  { id: '16th', label: '16th', subdivisions: 16, color: '#f97316' },     // Orange
  { id: '32nd', label: '32nd', subdivisions: 32, color: '#eab308' },     // Yellow
];

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [activeLayers, setActiveLayers] = useState<Set<NoteValue>>(new Set(['quarter', '16th']));
  const [volume, setVolume] = useState(0.5);
  
  // Animation state for the progress bar / active notes
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>();

  // Initialize Audio Engine settings
  useEffect(() => {
    audioEngine.setBpm(bpm);
    audioEngine.setVolume(volume);
    audioEngine.updateActiveLayers(activeLayers);
  }, [bpm, volume, activeLayers]);

  // Animation Loop
  const animate = useCallback(() => {
    const p = audioEngine.getProgress();
    setProgress(p);
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setProgress(0); // Reset visual cursor
    } else {
      audioEngine.start();
      requestRef.current = requestAnimationFrame(animate);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleLayer = (layerId: NoteValue) => {
    const newLayers = new Set(activeLayers);
    if (newLayers.has(layerId)) {
      newLayers.delete(layerId);
    } else {
      newLayers.add(layerId);
    }
    setActiveLayers(newLayers);
  };

  const handleReset = () => {
    setActiveLayers(new Set([]));
    if (isPlaying) togglePlay();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-rose-500/30">
      
      {/* Header / Nav */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Tree of Rhythm
            </h1>
          </div>
          
          <div className="text-xs text-slate-500 hidden sm:block">
            Interactive Drum Machine
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 pb-32">
        
        {/* Controls Bar */}
        <div className="mb-10 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            
            {/* Playback Controls */}
            <div className="flex items-center gap-6 w-full md:w-auto justify-center">
              <button 
                onClick={togglePlay}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl shrink-0
                  ${isPlaying 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40 ring-4 ring-rose-500/20' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/20'}
                `}
              >
                {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </button>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Tempo (BPM)</label>
                <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  <input 
                    type="range" 
                    min="40" 
                    max="200" 
                    value={bpm} 
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="w-24 md:w-32 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-xl font-mono w-10 text-right text-indigo-400">{bpm}</span>
                </div>
              </div>
            </div>

            <div className="h-12 w-px bg-slate-800 hidden md:block"></div>

            {/* Volume & Actions */}
            <div className="flex items-center gap-6 w-full md:w-auto justify-center md:justify-end">
               <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-xs text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-2">
                  <Volume2 className="w-3 h-3" /> Master Volume
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full md:w-40 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                />
              </div>

               <button 
                onClick={handleReset}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors mt-auto border border-slate-800 hover:border-slate-600"
                title="Reset Layers"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visualization Tree */}
        <div className="relative">
          {/* Progress Indicator Line (Overlay) */}
          <div className="flex gap-4 absolute inset-0 pointer-events-none z-30">
             <div className="w-24 md:w-32 shrink-0"></div> {/* Spacer for buttons */}
             <div className="flex-1 relative h-full">
                {/* The vertical cursor line */}
                <div 
                   className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.8)] will-change-transform"
                   style={{ 
                      left: `${progress * 100}%`,
                      display: isPlaying ? 'block' : 'none'
                   }}
                >
                  <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full shadow-lg"></div>
                  <div className="absolute -bottom-1 -left-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full shadow-lg"></div>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-1 relative z-10">
            {LAYERS.map((layer) => (
              <RhythmRow
                key={layer.id}
                type={layer.id}
                label={layer.label}
                subdivisions={layer.subdivisions}
                color={layer.color}
                isActive={activeLayers.has(layer.id)}
                onToggle={toggleLayer}
                progress={progress}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm max-w-2xl mx-auto space-y-2">
          <p>
            <strong>How it works:</strong> Each row represents the same amount of time (one measure), but divided into smaller chunks. 
            Activate different layers to hear how they interlock.
          </p>
          <div className="flex justify-center gap-4 text-xs opacity-60">
             <span>Whole: Pad</span>
             <span>Half: Snare</span>
             <span>Quarter: Kick</span>
             <span>8th: Woodblock</span>
             <span>16th: Hat</span>
             <span>32nd: Click</span>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;