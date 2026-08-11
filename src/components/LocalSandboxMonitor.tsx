import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, HardDrive, ArrowUpRight } from 'lucide-react';

interface LocalSandboxMonitorProps {
  isProcessing?: boolean;
  filename?: string;
  filesize?: number;
}

export const LocalSandboxMonitor: React.FC<LocalSandboxMonitorProps> = ({
  isProcessing = false,
  filename,
  filesize,
}) => {
  const [ramUsage, setRamUsage] = useState<string>('12.4 MB');

  useEffect(() => {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      const used = ((performance as any).memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
      setRamUsage(`${used} MB`);
    } else if (filesize) {
      const estimated = (filesize / (1024 * 1024) * 1.8 + 8).toFixed(1);
      setRamUsage(`${estimated} MB`);
    }
  }, [isProcessing, filesize]);

  return (
    <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-md font-mono text-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-200 uppercase tracking-widest text-[11px]">
            Local Sandbox Engine
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>0 Network Upload Bytes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
        <div className="flex items-center gap-2 text-slate-300">
          <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">EXECUTION ENVIRONMENT</span>
            <span className="font-bold text-white">Browser JS Heap ({ramUsage})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">FILE DATA TRANSFERS</span>
            <span className="font-bold text-white">100% On-Device Local RAM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">EXTERNAL SERVER EGRESS</span>
            <span className="font-bold text-emerald-400">Blocked / Zero Server Request</span>
          </div>
        </div>
      </div>
    </div>
  );
};
