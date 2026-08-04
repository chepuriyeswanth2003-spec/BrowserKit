declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export interface AdSlotConfig {
  id: string;
  slotType: 'header-banner' | 'sidebar' | 'below-tool' | 'post-download-modal' | 'in-flow';
  publisherId?: string; // e.g. ca-pub-XXXXXXXXXXXXXXXX
  adSlotId?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

export function getAdSenseClientId(): string {
  if (typeof window !== 'undefined' && import.meta.env?.VITE_ADSENSE_CLIENT_ID) {
    return import.meta.env.VITE_ADSENSE_CLIENT_ID;
  }
  return 'ca-pub-0000000000000000';
}

export function initGoogleAdSense(publisherId?: string) {
  if (typeof window === 'undefined') return;
  if (document.getElementById('adsense-script')) return;

  const client = publisherId || getAdSenseClientId();

  const script = document.createElement('script');
  script.id = 'adsense-script';
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  script.crossOrigin = 'anonymous';
  script.onerror = () => {
    console.warn('[AdSense] Script failed to load (AdBlocker may be active).');
  };

  document.head.appendChild(script);
}

export function pushAdSenseSlot() {
  if (typeof window !== 'undefined') {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Safe handle for duplicate pushes or unrendered slots
      console.debug('[AdSense] Slot push skipped or already rendered');
    }
  }
}
