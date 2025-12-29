import React from 'react';
import { NoteValue } from '../types';
import { NoteIcon } from './NoteIcons';

interface RhythmBlockProps {
  isActive: boolean;
  isCurrent: boolean;
  type: NoteValue;
  subdivisionIndex: number;
  totalSubdivisions: number;
  colorClass: string;
}

export const RhythmBlock: React.FC<RhythmBlockProps> = ({ 
  isActive, 
  isCurrent, 
  type,
  colorClass 
}) => {
  // Determine icon size based on note type to ensure 32nd notes fit
  const getIconSize = () => {
    if (type === 'whole' || type === 'half') return "w-8 h-8 md:w-10 md:h-10";
    if (type === '32nd') return "w-2.5 h-2.5 md:w-3 md:h-3"; // Significantly smaller for 32nd
    return "w-5 h-5 md:w-7 md:h-7";
  };

  return (
    <div 
      className={`
        relative flex-1 h-14 md:h-16 border-r border-slate-800/50 last:border-r-0
        transition-all duration-100 ease-out
        flex items-center justify-center
        group overflow-hidden
        ${isActive 
          ? `bg-slate-800/80 hover:bg-slate-800` 
          : 'bg-slate-900/50 opacity-40'}
      `}
    >
      {/* Active flash effect when current */}
      {isActive && isCurrent && (
        <div className={`absolute inset-0 animate-pulse ${colorClass} opacity-60 mix-blend-screen`}></div>
      )}
      
      {/* Permanent highlight if active (Bottom Bar) */}
      {isActive && (
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${colorClass} opacity-50`}></div>
      )}

      {/* Note Icon */}
      <div className={`
        transition-all duration-75
        ${isCurrent ? 'scale-125 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : isActive ? 'text-slate-300 scale-100' : 'text-slate-600 scale-75'}
      `}>
         <NoteIcon type={type} className={getIconSize()} />
      </div>
    </div>
  );
};