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
  title,
  description,
  icon,
  children,
}) => {
  return (
    <div className="w-full space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="relative bg-white dark:bg-[#2d2822] p-6 sm:p-8 wobbly-md border-[3px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand space-y-4">
        <div className="tape-strip" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            {icon && (
              <div className="p-3.5 wobbly-sm bg-[#fff9c4] dark:bg-[#3a352f] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shrink-0 shadow-hand-sm -rotate-2">
                {icon}
              </div>
            )}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 wobbly-pill border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] text-[#2d2d2d] dark:text-[#f3ede2] bg-[#fdfbf7] dark:bg-[#262220] rotate-1 inline-block">
                  {categoryBadge}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2d2d2d] dark:text-[#f3ede2] leading-snug">
                {title}
              </h1>
              <p className="text-[#2d2d2d]/70 dark:text-[#f3ede2]/70 text-sm sm:text-base leading-relaxed max-w-2xl">
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
      <div className="bg-white dark:bg-[#2d2822] p-6 sm:p-8 wobbly-md border-[3px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand-lg space-y-6">
        {children}
        <LocalSandboxMonitor />
      </div>
    </div>
  );
};
