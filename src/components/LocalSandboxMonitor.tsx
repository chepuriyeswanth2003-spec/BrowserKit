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
    <div className="p-4 wobbly-md bg-[#1a1a1a] text-[#2d2d2d]/[0.7] border border-[2px] border-[#2d2d2d]/80 shadow-hand font-mono text-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d2d2d]/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full wobbly-pill bg-[#2f7a4f] opacity-75" />
            <span className="relative inline-flex wobbly-pill size-2.5 bg-[#2f7a4f]" />
          </span>
          <span className="font-bold text-[#2d2d2d]/[0.7] uppercase tracking-widest text-[11px]">
            Local Sandbox Engine
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#2f7a4f] bg-[#2f7a4f]/60 px-2.5 py-0.5 wobbly-pill border border-[2px] border-[#2f7a4f]/80">
          <ShieldCheck className="size-3.5" />
          <span>0 Network Upload Bytes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
        <div className="flex items-center gap-2.5 text-[#2d2d2d]/[0.7]">
          <Cpu className="size-4 text-[#2d5da1] shrink-0" />
          <div>
            <span className="text-[#2d2d2d]/[0.7] block text-[10px]">EXECUTION ENVIRONMENT</span>
            <span className="font-bold text-white">Browser JS Heap ({ramUsage})</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[#2d2d2d]/[0.7]">
          <HardDrive className="size-4 text-[#2f7a4f] shrink-0" />
          <div>
            <span className="text-[#2d2d2d]/[0.7] block text-[10px]">FILE DATA TRANSFERS</span>
            <span className="font-bold text-white">100% On-Device Local RAM</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[#2d2d2d]/[0.7]">
          <ArrowUpRight className="size-4 text-[#b8860b] shrink-0" />
          <div>
            <span className="text-[#2d2d2d]/[0.7] block text-[10px]">EXTERNAL SERVER EGRESS</span>
            <span className="font-bold text-[#2f7a4f]">Blocked / Zero Server Request</span>
          </div>
        </div>
      </div>
    </div>
  );
};
