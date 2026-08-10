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
      <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
        <FileQuestion className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold tracking-widest text-rose-600 dark:text-rose-400 uppercase">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Page or Tool Not Found
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          The requested tool route or page URL does not exist or has been moved.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-center gap-4">
        <button
          onClick={onGoHome}
          className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Back to Homepage
        </button>
      </div>
    </div>
  );
};
