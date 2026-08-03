export function trackEvent(eventName: string, props?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Track event in Plausible / GA4 if script injected
  // @ts-ignore
  if (window.plausible) {
    // @ts-ignore
    window.plausible(eventName, { props });
  }
  
  // @ts-ignore
  if (window.gtag) {
    // @ts-ignore
    window.gtag('event', eventName, props);
  }

  // Developer console logger
  if ((import.meta as any).env?.DEV) {
    console.log(`[Analytics Event] ${eventName}`, props);
  }
}

export function initMonitoring(sentryDsn?: string, ga4Id?: string) {
  if (typeof window === 'undefined') return;

  if (ga4Id) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(script);

    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      // @ts-ignore
      window.dataLayer.push(arguments);
    }
    // @ts-ignore
    gtag('js', new Date());
    // @ts-ignore
    gtag('config', ga4Id);
  }
}
