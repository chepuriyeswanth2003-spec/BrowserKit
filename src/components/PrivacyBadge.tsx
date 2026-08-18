import React from 'react';
import { Lock } from 'lucide-react';

interface PrivacyBadgeProps {
  compact?: boolean;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ compact = false }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 wobbly-pill text-xs font-mono font-bold bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand-sm select-none whitespace-nowrap shrink-0 transition-transform duration-100 hover:-rotate-1">
      <span className="size-2 wobbly-pill bg-white animate-pulse shrink-0" />
      <Lock className="size-3.5 text-white shrink-0" />
      <span className="text-white">{compact ? '100% Private' : '100% Client-Side Private'}</span>
    </div>
  );
};
