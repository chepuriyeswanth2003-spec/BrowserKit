import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in py-6">
      <div className="space-y-3 text-center">
        <div className="p-3 wobbly-md bg-[#2f7a4f]/10 text-[#2f7a4f] dark:text-[#2f7a4f] w-fit mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2d2d2d] dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-[#2f7a4f] dark:text-[#2f7a4f] font-bold uppercase">
          Zero Server Upload Guarantee
        </p>
      </div>

      <div className="p-8 wobbly-md bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6 text-sm text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] leading-relaxed font-medium">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#2d2d2d] dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#2f7a4f]" /> 1. Client-Side Processing Architecture
          </h2>
          <p>
            BrowserKit is designed from the ground up as a purely static, client-side web application. All image compression, background removal, format conversions, PDF merging, video trimming, ZIP archiving, and file encryption execute exclusively inside your web browser’s sandbox memory (RAM) via JavaScript Canvas API, WebCrypto, and WebAssembly (WASM).
          </p>
          <p className="font-semibold text-[#2f7a4f] dark:text-[#2f7a4f]">
            Your files are NEVER transmitted, uploaded, or saved to any remote server or third-party cloud storage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#2d2d2d] dark:text-white">
            2. Cookies & Local Storage
          </h2>
          <p>
            BrowserKit uses standard browser local storage (`localStorage`) solely to store your preferred visual theme (dark vs. light mode) and cookie consent preferences.
          </p>
          <p>
            Display advertisements on this site are served by Google AdSense and advertising partners. These third-party vendors may use cookies to serve non-intrusive ads based on your visit to this and other websites on the Internet.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#2d2d2d] dark:text-white">
            3. No Account Required
          </h2>
          <p>
            We do not collect names, email addresses, passwords, or personal credentials. There are no registration forms, account systems, or databases associated with BrowserKit.
          </p>
        </section>
      </div>
    </div>
  );
};
