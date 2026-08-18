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
  const [isFilled, setIsFilled] = useState<boolean>(false);
  const [isUnfilled, setIsUnfilled] = useState<boolean>(false);
  const pushedRef = useRef<boolean>(false);

  const resolvedClient = client || getAdSenseClientId();
  const isDemoClient = resolvedClient === 'ca-pub-0000000000000000';

  const getFallbackSlotId = () => {
    if (slot) return slot;
    if (typeof window !== 'undefined' && import.meta.env) {
      switch (type) {
        case 'header-banner':
          return import.meta.env.VITE_ADSENSE_SLOT_HEADER;
        case 'sidebar':
          return import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR;
        case 'below-tool':
          return import.meta.env.VITE_ADSENSE_SLOT_BELOW_TOOL;
        case 'modal':
          return import.meta.env.VITE_ADSENSE_SLOT_MODAL;
        case 'in-flow':
        default:
          return import.meta.env.VITE_ADSENSE_SLOT_INFLOW;
      }
    }
    return undefined;
  };

  const resolvedSlot = getFallbackSlotId();
  const hasValidAdSlot = Boolean(resolvedSlot && !/^(1234567890|2345678901|3456789012|4567890123|5678901234)$/.test(resolvedSlot));

  useEffect(() => {
    // 1. Push AdSense slot once when mounted and container is visible (offsetWidth > 0)
    if (hasValidAdSlot && !pushedRef.current) {
      if (insRef.current && insRef.current.offsetWidth === 0) {
        return;
      }
      pushedRef.current = true;
      const timer = setTimeout(() => {
        pushAdSenseSlot();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasValidAdSlot, resolvedSlot]);

  useEffect(() => {
    const insNode = insRef.current;
    if (!insNode) return;

    // Observe Google AdSense data-ad-status attribute & child iframe insertion
    const observer = new MutationObserver(() => {
      const status = insNode.getAttribute('data-ad-status');
      const hasIframe = insNode.getElementsByTagName('iframe').length > 0;
      const hasHeight = insNode.offsetHeight > 10;

      if (status === 'filled' || hasIframe || hasHeight) {
        setIsFilled(true);
        setIsUnfilled(false);
        if (onStatusChange) onStatusChange(true);
      } else if (status === 'unfilled') {
        setIsFilled(false);
        setIsUnfilled(true);
        if (onStatusChange) onStatusChange(false);
      }
    });

    observer.observe(insNode, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'style'],
      childList: true,
      subtree: true,
    });

    // Check after 2.5s if ad is unfilled or unrendered
    const checkTimer = setTimeout(() => {
      const status = insNode.getAttribute('data-ad-status');
      const hasIframe = insNode.getElementsByTagName('iframe').length > 0;
      if (status === 'unfilled' || (!hasIframe && insNode.offsetHeight < 10)) {
        setIsUnfilled(true);
        if (onStatusChange) onStatusChange(false);
      }
    }, 2500);

    return () => {
      observer.disconnect();
      clearTimeout(checkTimer);
    };
  }, [onStatusChange]);

  // Hide container completely if marked unfilled by Google AdSense or AdBlocker
  if (!hasValidAdSlot || (isUnfilled && !showPlaceholderInDev)) {
    return null;
  }

  const getWidthConstraint = () => {
    if (type === 'sidebar') return 'w-full';
    return 'w-full max-w-3xl mx-auto';
  };

  return (
    <div
      className={`transition-all duration-300 ${getWidthConstraint()} ${
        isFilled || (isDemoClient && showPlaceholderInDev)
          ? 'my-4 p-2.5 bg-[#fdfbf7] dark:bg-[#262220] wobbly-sm border-[2px] border-dashed border-[#2d2d2d]/40 dark:border-[#f3ede2]/40 flex flex-col items-center justify-center relative overflow-hidden'
          : 'my-0 p-0 border-0 bg-transparent overflow-hidden'
      } ${className}`}
    >
      {/* Show Advertisement label ONLY when an ad is actively loaded and filled */}
      {(isFilled || (isDemoClient && showPlaceholderInDev)) && (
        <span className="text-[9px] font-mono tracking-wider uppercase text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.65] mb-1 select-none">
          Advertisement
        </span>
      )}

      {/* Production Google AdSense Ins element */}
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={resolvedClient}
        data-ad-slot={resolvedSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      ></ins>

      {/* Visual placeholder only shown in dev if explicitly requested */}
      {isDemoClient && showPlaceholderInDev && (
        <div className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.65] select-none">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
            <span className="w-2 h-2 wobbly-pill bg-[#2f7a4f] animate-pulse" />
            AdSense Display Ad Slot ({type})
          </div>
        </div>
      )}
    </div>
  );
};
