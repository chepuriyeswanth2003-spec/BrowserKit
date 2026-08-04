import React, { useEffect, useState } from 'react';
import { pushAdSenseSlot, getAdSenseClientId } from '../lib/adManager';

interface AdSlotProps {
  type: 'header-banner' | 'sidebar' | 'below-tool' | 'in-flow' | 'modal';
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  layoutKey?: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  type,
  client,
  slot,
  format = 'auto',
  responsive = true,
  layoutKey,
  className = '',
}) => {
  const [adBlocked, setAdBlocked] = useState<boolean>(false);

  // Environment fallback resolution
  const resolvedClient = client || getAdSenseClientId();

  const getFallbackSlotId = () => {
    if (slot) return slot;
    if (typeof window !== 'undefined' && import.meta.env) {
      switch (type) {
        case 'header-banner':
          return import.meta.env.VITE_ADSENSE_SLOT_HEADER || '1234567890';
        case 'sidebar':
          return import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '2345678901';
        case 'below-tool':
          return import.meta.env.VITE_ADSENSE_SLOT_BELOW_TOOL || '3456789012';
        case 'modal':
          return import.meta.env.VITE_ADSENSE_SLOT_MODAL || '4567890123';
        case 'in-flow':
        default:
          return import.meta.env.VITE_ADSENSE_SLOT_INFLOW || '5678901234';
      }
    }
    return '1234567890';
  };

  const resolvedSlot = getFallbackSlotId();

  useEffect(() => {
    const timer = setTimeout(() => {
      pushAdSenseSlot();
    }, 150);

    return () => clearTimeout(timer);
  }, [type, resolvedSlot]);

  const getContainerStyle = () => {
    switch (type) {
      case 'header-banner':
        return 'w-full max-w-4xl min-h-[90px] my-3 mx-auto';
      case 'sidebar':
        return 'w-full min-h-[250px] lg:min-h-[600px] my-4';
      case 'below-tool':
        return 'w-full max-w-4xl min-h-[120px] my-6 mx-auto';
      case 'modal':
        return 'w-full min-h-[180px] my-3';
      case 'in-flow':
      default:
        return 'w-full min-h-[100px] my-4';
    }
  };

  const isDemoClient = resolvedClient === 'ca-pub-0000000000000000';

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-3 text-center transition-all ${getContainerStyle()} ${className}`}
      aria-label="Advertisement"
    >
      <span className="absolute top-1.5 right-2 text-[9px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-500 z-10 select-none">
        Advertisement
      </span>

      {/* Production Google AdSense Ins element */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={resolvedClient}
        data-ad-slot={resolvedSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      ></ins>

      {/* Visual Ad Unit Placeholder for Dev / Unconfigured AdSense state */}
      {isDemoClient && (
        <div className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-slate-400 dark:text-slate-500 select-none">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AdSense Display Ad Slot ({type})
          </div>
          <p className="text-[11px] max-w-xs opacity-75 leading-tight">
            Configured for <code className="font-mono text-[10px] text-emerald-500">{resolvedClient}</code>. Helps keep BrowserKit 100% free with unlimited client processing.
          </p>
        </div>
      )}
    </div>
  );
};
