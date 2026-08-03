import React, { useEffect } from 'react';
import { pushAdSenseSlot } from '../lib/adManager';

interface AdSlotProps {
  type: 'header-banner' | 'sidebar' | 'below-tool' | 'in-flow' | 'modal';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ type, className = '' }) => {
  useEffect(() => {
    pushAdSenseSlot();
  }, [type]);

  const getContainerStyle = () => {
    switch (type) {
      case 'header-banner':
        return 'w-full max-w-4xl min-h-[90px] my-3 mx-auto';
      case 'sidebar':
        return 'w-full min-h-[250px] lg:min-h-[600px] my-4';
      case 'below-tool':
        return 'w-full max-w-4xl min-h-[120px] my-6 mx-auto';
      case 'modal':
        return 'w-full min-h-[200px] my-3';
      case 'in-flow':
      default:
        return 'w-full min-h-[100px] my-4';
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center p-3 text-center transition-all ${getContainerStyle()} ${className}`}
      aria-label="Advertisement"
    >
      <span className="absolute top-1.5 right-2 text-[10px] font-mono tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
        Advertisement
      </span>

      {/* Real AdSense Ins tag container */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-0000000000000000"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>

      {/* Visual Ad Unit Placeholder for Dev / AdSense loading state */}
      <div className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-neutral-400 dark:text-neutral-500 select-none">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-600" />
          AdSense / Display Ad Unit
        </div>
        <p className="text-[11px] max-w-xs opacity-75">
          Sponsored placement — helps keep ImageToolkit 100% free with unlimited processing.
        </p>
      </div>
    </div>
  );
};
