import React from 'react';
import { FileText } from 'lucide-react';

export const TermsView: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in py-6">
      <div className="space-y-3 text-center">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-slate-500">
          Last Updated: August 2026
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using BrowserKit, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our web application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Free Unlimited License
          </h2>
          <p>
            BrowserKit is provided free of charge for personal, commercial, and educational use. All processing is unlimited and performed on-device in your web browser sandbox.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            3. Disclaimer of Warranty
          </h2>
          <p>
            BrowserKit is provided "as is" without warranties of any kind. You assume sole responsibility for all media files processed and downloaded through the service.
          </p>
        </section>
      </div>
    </div>
  );
};
