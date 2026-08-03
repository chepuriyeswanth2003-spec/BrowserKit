export interface AdSlotConfig {
  id: string;
  slotType: 'header-banner' | 'sidebar' | 'below-tool' | 'post-download-modal' | 'in-flow';
  publisherId?: string; // e.g. ca-pub-XXXXXXXXXXXXXXXX
  adSlotId?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

export function initGoogleAdSense(publisherId = 'ca-pub-0000000000000000') {
  if (typeof window === 'undefined') return;
  if (document.getElementById('adsense-script')) return;

  const script = document.createElement('script');
  script.id = 'adsense-script';
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

export function pushAdSenseSlot() {
  if (typeof window !== 'undefined') {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log('AdSense slot init skipped in preview mode');
    }
  }
}
