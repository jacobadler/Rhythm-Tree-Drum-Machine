import React from 'react';
import { RhythmBlock } from './RhythmBlock';
import { NoteValue } from '../types';
import { NoteIcon } from './NoteIcons';

interface RhythmRowProps {
  type: NoteValue;
  subdivisions: number;
  label: string;
  isActive: boolean;
  onToggle: (type: NoteValue) => void;
  progress: number; // 0.0 to 1.0
  color: string;
}

export const RhythmRow: React.FC<RhythmRowProps> = ({
  type,
  subdivisions,
  label,
  isActive,
  onToggle,
  progress,
  color
}) => {
  
  // Calculate index 0..subdivisions-1
  // We want to handle discrete 32nd note steps correctly.
  const currentBlockIndex = Math.floor(progress * subdivisions);

  // Determine group size for beaming
  let groupSize = 1;
  if (type === '8th') groupSize = 2;
  if (type === '16th') groupSize = 4;
  if (type === '32nd') groupSize = 8;

  // Chunk the subdivisions into groups
  const groups = [];
  for (let i = 0; i < subdivisions; i += groupSize) {
    groups.push(Array.from({ length: groupSize }, (_, j) => i + j));
  }

  return (
    <div className="flex items-center gap-4 mb-2">
      {/* Toggle Control */}
      <button 
        onClick={() => onToggle(type)}
        className={`
          w-24 md:w-32 h-14 md:h-16 flex items-center justify-between px-2 md:px-4 rounded-lg
          transition-all duration-200 border border-slate-700 group shrink-0
          ${isActive 
            ? 'bg-slate-800 text-white shadow-lg border-l-4' 
            : 'bg-slate-900/50 text-slate-500 border-l-4 border-l-transparent hover:bg-slate-800/50'}
        `}
        style={{ borderLeftColor: isActive ? color : undefined }}
      >
        <div className="flex flex-col items-start min-w-0">
           <div className="flex items-center gap-1 md:gap-2 mb-0.5">
              <NoteIcon type={type} className="w-4 h-4 md:w-5 md:h-5 opacity-80" />
              <span className="font-bold text-xs md:text-sm uppercase tracking-wider truncate">{label}</span>
           </div>
           <div className="text-[10px] md:text-xs opacity-50 font-mono pl-0.5">1/{subdivisions}</div>
        </div>
        
        {/* Status Light */}
        <div className={`
          w-2 h-2 rounded-full shrink-0 ml-1
          ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-700'}
        `}></div>
      </button>

      {/* Rhythm Blocks Container */}
      <div className="flex-1 flex rounded-lg overflow-hidden border border-slate-700/50 bg-slate-950 shadow-inner">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-1 relative">
             {/* Beam Bar */}
             {groupSize > 1 && (
               <div className={`
                 absolute top-0 left-0 right-0 h-1.5 z-10 
                 ${isActive ? 'opacity-80' : 'opacity-30'}
                 transition-opacity duration-300
               `}
               style={{ backgroundColor: color }}
               ></div>
             )}
             
             {group.map((idx) => (
               <RhythmBlock
                 key={idx}
                 isActive={isActive}
                 isCurrent={isActive && idx === currentBlockIndex}
                 subdivisionIndex={idx}
                 totalSubdivisions={subdivisions}
                 type={type}
                 colorClass={`bg-[${color}]`}
               />
             ))}
          </div>
        ))}
      </div>
    </div>
  );
};