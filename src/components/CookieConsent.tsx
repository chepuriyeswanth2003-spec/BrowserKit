import React, { useState, useEffect } from 'react';
import { Shield, Check, Settings, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('imagetoolkit_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('imagetoolkit_cookie_consent', 'accepted_all');
    setShow(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('imagetoolkit_cookie_consent', 'necessary_only');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-xl mx-auto p-4 md:p-5 rounded-xl bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-800 shadow-2xl backdrop-blur-md text-neutral-900 dark:text-neutral-100 text-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5 border border-neutral-200 dark:border-neutral-700">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-tight">Privacy & Ad Cookie Notice</h4>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              ImageToolkit is 100% free with no account required. We use essential local storage to save your dark mode preference and standard display ad cookies to monetize our hosting. Your images are processed 100% locally in your browser and are never uploaded or stored on any server.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-neutral-400 hover:text-black dark:hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center justify-between">
            <span>Essential Local Storage (Theme preferences)</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-bold">Always Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Google AdSense Display Ads Cookies</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-bold">Ad Personalization</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-neutral-500 hover:text-black dark:hover:text-white font-mono text-[11px] flex items-center gap-1"
        >
          <Settings className="w-3.5 h-3.5" /> {showDetails ? 'Hide Details' : 'Manage Preferences'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAcceptNecessary}
            className="px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-1 transition-all"
          >
            <Check className="w-3.5 h-3.5" /> Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
