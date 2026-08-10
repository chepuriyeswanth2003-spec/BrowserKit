import React from 'react';
import { Lock, ShieldCheck, Cpu } from 'lucide-react';

interface PrivacyBadgeProps {
  compact?: boolean;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ compact = false }) => {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs">
      <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>100% Client-Side Private WASM / Canvas Execution</span>
    </div>
  );
};
