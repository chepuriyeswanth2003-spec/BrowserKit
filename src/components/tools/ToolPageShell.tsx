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
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800/80',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800/80',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/80',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/80',
    cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/80',
  };

  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner Card with Subtle Minimalist Ambient Gradient */}
      <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        {/* Decorative Minimalist Ambient Glow Background Accent */}
        <div className="absolute -top-24 -right-24 size-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-64 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            {icon && (
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shrink-0 shadow-xs transition-transform duration-200 hover:scale-105">
                {icon}
              </div>
            )}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border shadow-2xs ${colorMap[categoryBadgeColor]}`}>
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

      {/* Main Workspace Surface Card */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
        {children}
        <LocalSandboxMonitor />
      </div>
    </div>
  );
};
