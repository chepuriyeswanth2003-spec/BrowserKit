import React from 'react';
import { ShieldCheck, Lock, Cpu } from 'lucide-react';

interface PrivacyBadgeProps {
  compact?: boolean;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
        <Lock className="w-3.5 h-3.5 text-neutral-500" />
        <span>100% Client-Side — Photos Never Uploaded</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 my-4 text-neutral-800 dark:text-neutral-200">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            100% Browser-Based Processing
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
              <Cpu className="w-3 h-3" /> Private WASM/Canvas
            </span>
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Your images stay on your device and are processed locally using high-speed browser WebAssembly & Canvas. Zero server uploads.
          </p>
        </div>
      </div>
      <div className="shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" /> Private & Secure
      </div>
    </div>
  );
};
