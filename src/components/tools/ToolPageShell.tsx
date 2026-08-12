import React from 'react';
import { PrivacyBadge } from '../PrivacyBadge';
import { LocalSandboxMonitor } from '../LocalSandboxMonitor';

interface ToolPageShellProps {
  categoryBadge: string;
  categoryBadgeColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'indigo' | 'rose' | 'cyan';
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const ToolPageShell: React.FC<ToolPageShellProps> = ({
  categoryBadge,
  categoryBadgeColor = 'emerald',
  title,
  description,
  icon,
  children,
}) => {
  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto animate-fade-in bg-white dark:bg-slate-950">
      {/* Header Banner - Pure White Minimalist Surface */}
      <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            {icon && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs transition-transform duration-200 hover:scale-105">
                {icon}
              </div>
            )}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
                  {categoryBadge}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <PrivacyBadge />
          </div>
        </div>
      </div>

      {/* Main Workspace Surface Card - Pure White Minimalist */}
      <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-6">
        {children}
        <LocalSandboxMonitor />
      </div>
    </div>
  );
};
