import React from 'react';
import { NoteValue } from '../types';

interface NoteIconProps {
  type: NoteValue;
  className?: string;
}

export const NoteIcon: React.FC<NoteIconProps> = ({ type, className = "w-6 h-6" }) => {
  const commonProps = {
    fill: "currentColor",
    stroke: "currentColor",
    strokeWidth: "1.5",
    className: className
  };

  switch (type) {
    case 'whole':
      return (
        <svg viewBox="0 0 24 24" {...commonProps} fill="none">
          <ellipse cx="12" cy="12" rx="8" ry="5" transform="rotate(-15 12 12)" strokeWidth="2" />
        </svg>
      );
    case 'half':
      return (
        <svg viewBox="0 0 24 24" {...commonProps} fill="none">
          <ellipse cx="9" cy="18" rx="6" ry="4" transform="rotate(-15 9 18)" strokeWidth="2" />
          <line x1="14.5" y1="16" x2="14.5" y2="2" strokeWidth="2" />
        </svg>
      );
    case 'quarter':
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <ellipse cx="9" cy="18" rx="6" ry="4" transform="rotate(-15 9 18)" />
          <line x1="14.5" y1="16" x2="14.5" y2="2" strokeWidth="2" />
        </svg>
      );
    case '8th':
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <ellipse cx="8" cy="19" rx="5" ry="3.5" transform="rotate(-15 8 19)" />
          <path d="M12.5 18 V 3" strokeWidth="2" />
          <path d="M12.5 3 C 16.5 6, 18.5 10, 18.5 14" fill="none" strokeWidth="2.5" />
        </svg>
      );
    case '16th':
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <ellipse cx="8" cy="19" rx="5" ry="3.5" transform="rotate(-15 8 19)" />
          <path d="M12.5 18 V 2" strokeWidth="2" />
          <path d="M12.5 2 C 16.5 5, 18.5 9, 18.5 12" fill="none" strokeWidth="2.5" />
          <path d="M12.5 7 C 16.5 10, 18.5 14, 18.5 17" fill="none" strokeWidth="2.5" />
        </svg>
      );
    case '32nd':
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
           <ellipse cx="8" cy="19" rx="5" ry="3.5" transform="rotate(-15 8 19)" />
          <path d="M12.5 18 V 1" strokeWidth="2" />
          <path d="M12.5 1 C 16.5 3.5, 18.5 7, 18.5 10" fill="none" strokeWidth="2.5" />
          <path d="M12.5 5.5 C 16.5 8, 18.5 11.5, 18.5 14.5" fill="none" strokeWidth="2.5" />
          <path d="M12.5 10 C 16.5 12.5, 18.5 16, 18.5 19" fill="none" strokeWidth="2.5" />
        </svg>
      );
    default:
      return null;
  }
};
