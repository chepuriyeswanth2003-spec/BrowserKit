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
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  };

  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            {icon && (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5 sm:mt-0">
                {icon}
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${colorMap[categoryBadgeColor]}`}>
                  {categoryBadge}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-center">
            <PrivacyBadge />
          </div>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {children}
        <LocalSandboxMonitor />
      </div>
    </div>
  );
};
