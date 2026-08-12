import React from 'react';
import { Lock } from 'lucide-react';

interface PrivacyBadgeProps {
  compact?: boolean;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ compact = false }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border border-slate-800 dark:border-slate-700 shadow-xs select-none whitespace-nowrap shrink-0 transition-transform duration-200 hover:scale-[1.02]">
      <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <Lock className="size-3.5 text-emerald-400 shrink-0" />
      <span>{compact ? '100% Private' : '100% Client-Side Private'}</span>
    </div>
  );
};
