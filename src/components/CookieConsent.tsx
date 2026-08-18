import React, { useState, useEffect } from 'react';
import { Shield, Check, Settings, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('browserkit_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('browserkit_cookie_consent', 'accepted_all');
    setShow(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('browserkit_cookie_consent', 'necessary_only');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-xl mx-auto p-4 md:p-5 wobbly-sm bg-white/95 dark:bg-[#332e29]/95 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-lg backdrop-blur-md text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] text-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] shrink-0 mt-0.5 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-tight">Privacy & Ad Cookie Notice</h4>
            <p className="text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] mt-1 leading-relaxed">
              BrowserKit Studio PRO is 100% free with no account required. We use essential local storage for cookie preferences and standard display ad cookies to monetize hosting. Your images and files are processed locally in your browser and are never uploaded or stored on any server.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShow(false)}
          aria-label="Close notification"
          className="text-[#2d2d2d]/[0.7] hover:text-black dark:hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] space-y-2 text-[11px] font-mono text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">
          <div className="flex items-center justify-between">
            <span>Essential Local Storage (Theme preferences)</span>
            <span className="text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] font-bold">Always Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Google AdSense Display Ads Cookies</span>
            <span className="text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] font-bold">Ad Personalization</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2d2d2d]/[0.15] dark:border-[#f3ede2]">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[#2d2d2d]/[0.7] hover:text-black dark:hover:text-white font-mono text-[11px] flex items-center gap-1"
        >
          <Settings className="w-3.5 h-3.5" /> {showDetails ? 'Hide Details' : 'Manage Preferences'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAcceptNecessary}
            className="px-3 py-1.5 wobbly-sm font-bold text-xs uppercase tracking-wider text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55] bg-[#e5e0d8] dark:bg-[#332e29] hover:bg-[#e5e0d8] dark:hover:bg-[#332e29] transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-1.5 wobbly-sm font-bold text-xs uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-[#2d2d2d] dark:hover:bg-[#3a352f] shadow-hand-sm flex items-center gap-1 transition-all"
          >
            <Check className="w-3.5 h-3.5" /> Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
