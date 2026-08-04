/**
 * Render Free Tier Keep-Alive Service
 * Render free web services spin down after 50 seconds of inactivity.
 * This service pings the host endpoint every 40 seconds (40000ms) to reset
 * the inactivity timer while the web application is active.
 */

const DEFAULT_INTERVAL_MS = 40000; // 40 seconds (safely under 50s spin down limit)

let keepAliveIntervalId: ReturnType<typeof setInterval> | null = null;
let isStarted = false;

export async function sendKeepAlivePing(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const targetUrl = `${window.location.origin}/ping?t=${Date.now()}`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'X-Keep-Alive-Ping': 'render-40s',
      },
    });

    if (response.ok) {
      console.debug(`[KeepAlive] 40s ping successful at ${new Date().toLocaleTimeString()}`);
      return true;
    }
  } catch {
    // Static host or fallback route
    try {
      await fetch(`/?ping=${Date.now()}`, { method: 'HEAD', mode: 'no-cors' });
      console.debug(`[KeepAlive] Fallback static ping sent at ${new Date().toLocaleTimeString()}`);
      return true;
    } catch (e) {
      console.debug('[KeepAlive] Ping fetch encountered network error:', e);
    }
  }
  return false;
}

export function startKeepAlive(intervalMs: number = DEFAULT_INTERVAL_MS) {
  if (typeof window === 'undefined' || isStarted) return;

  isStarted = true;
  console.log(`[KeepAlive] Service initialized — auto-pinging host every 40 seconds to prevent Render 50-second spin down.`);

  // Initial warmth ping after 3 seconds
  setTimeout(() => {
    sendKeepAlivePing();
  }, 3000);

  // Set recurring 40-second timer
  keepAliveIntervalId = setInterval(() => {
    if (document.visibilityState === 'visible') {
      sendKeepAlivePing();
    }
  }, intervalMs);

  // Reactivate ping when tab gains visibility
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sendKeepAlivePing();
    }
  });
}

export function stopKeepAlive() {
  if (keepAliveIntervalId !== null) {
    clearInterval(keepAliveIntervalId);
    keepAliveIntervalId = null;
  }
  isStarted = false;
}
