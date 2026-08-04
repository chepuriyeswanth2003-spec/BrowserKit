import React, { useEffect, useRef, useState } from 'react';
import { pushAdSenseSlot, getAdSenseClientId } from '../lib/adManager';

interface AdSlotProps {
  type: 'header-banner' | 'sidebar' | 'below-tool' | 'in-flow' | 'modal';
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  layoutKey?: string;
  className?: string;
  showPlaceholderInDev?: boolean;
  onStatusChange?: (isFilled: boolean) => void;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  type,
  client,
  slot,
  format = 'auto',
  responsive = true,
  layoutKey,
  className = '',
  showPlaceholderInDev = false,
  onStatusChange,
}) => {
  const insRef = useRef<HTMLModElement | null>(null);
  const [adStatus, setAdStatus] = useState<'loading' | 'filled' | 'unfilled' | 'blocked'>('loading');

  // Environment fallback resolution
  const resolvedClient = client || getAdSenseClientId();
  const isDemoClient = resolvedClient === 'ca-pub-0000000000000000';

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
    // Push ad slot after DOM render
    const timer = setTimeout(() => {
      pushAdSenseSlot();
    }, 150);

    const insNode = insRef.current;
    if (!insNode) return () => clearTimeout(timer);

    const updateStatus = (newStatus: 'filled' | 'unfilled' | 'blocked') => {
      setAdStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus === 'filled');
      }
    };

    // Observe Google AdSense data-ad-status attribute changes
    const observer = new MutationObserver(() => {
      const status = insNode.getAttribute('data-ad-status');
      if (status === 'filled') {
        updateStatus('filled');
      } else if (status === 'unfilled') {
        updateStatus('unfilled');
      } else if (insNode.children.length > 0 && insNode.offsetHeight > 0) {
        updateStatus('filled');
      }
    });

    observer.observe(insNode, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'style'],
      childList: true,
      subtree: true,
    });

    // Fallback status check after 2.5 seconds
    const fallbackTimer = setTimeout(() => {
      const currentStatus = insNode.getAttribute('data-ad-status');
      if (currentStatus === 'filled' || (insNode.children.length > 0 && insNode.offsetHeight > 0)) {
        updateStatus('filled');
      } else {
        updateStatus('unfilled');
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [type, resolvedSlot, isDemoClient, showPlaceholderInDev, onStatusChange]);

  const isFilled = adStatus === 'filled' || (isDemoClient && showPlaceholderInDev);

  // If ad is not filled and showPlaceholderInDev is false, return null (completely hide element & margins)
  if (!isFilled) {
    return (
      <div className="hidden" aria-hidden="true">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'none' }}
          data-ad-client={resolvedClient}
          data-ad-slot={resolvedSlot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
          {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
        ></ins>
      </div>
    );
  }

  const getContainerStyle = () => {
    switch (type) {
      case 'header-banner':
        return 'w-full max-w-4xl my-3 mx-auto min-h-[90px]';
      case 'sidebar':
        return 'w-full my-4 min-h-[250px]';
      case 'below-tool':
        return 'w-full max-w-4xl my-6 mx-auto min-h-[100px]';
      case 'modal':
        return 'w-full my-3 min-h-[150px]';
      case 'in-flow':
      default:
        return 'w-full my-4 min-h-[90px]';
    }
  };

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
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={resolvedClient}
        data-ad-slot={resolvedSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      ></ins>

      {/* Visual placeholder only shown if explicitly requested via showPlaceholderInDev */}
      {isDemoClient && showPlaceholderInDev && (
        <div className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-slate-400 dark:text-slate-500 select-none">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AdSense Display Ad Slot ({type})
          </div>
          <p className="text-[11px] max-w-xs opacity-75 leading-tight">
            Configured for <code className="font-mono text-[10px] text-emerald-500">{resolvedClient}</code>.
          </p>
        </div>
      )}
    </div>
  );
};
