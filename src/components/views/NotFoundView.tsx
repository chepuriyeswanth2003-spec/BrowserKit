import React, { useEffect } from 'react';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { ActivePage } from '../../types';

interface NotFoundViewProps {
  onGoHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onGoHome }) => {
  useEffect(() => {
    document.title = '404 Page Not Found | BrowserKit Studio PRO';
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-20 h-20 wobbly-md bg-[#ff4d4d] dark:bg-[#ff4d4d]/50 border border-[2px] border-[#ff4d4d] dark:border-[#ff4d4d] text-[#ff4d4d] dark:text-[#ff4d4d] flex items-center justify-center mx-auto shadow-hand-sm">
        <FileQuestion className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold tracking-widest text-[#ff4d4d] dark:text-[#ff4d4d] uppercase">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2d2d2d] dark:text-white">
          Page or Tool Not Found
        </h1>
        <p className="text-sm sm:text-base text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] max-w-md mx-auto">
          The requested tool route or page URL does not exist or has been moved.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-center gap-4">
        <button
          onClick={onGoHome}
          className="px-6 py-3 wobbly-md bg-[#2d2d2d] hover:bg-[#2d2d2d] dark:bg-[#2f7a4f] dark:hover:bg-[#2f7a4f] text-white font-bold text-sm shadow-hand transition-all flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Back to Homepage
        </button>
      </div>
    </div>
  );
};
