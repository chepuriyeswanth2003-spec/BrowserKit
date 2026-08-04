import React, { useState, useEffect } from 'react';
import { ActivePage } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdSlot } from './components/AdSlot';
import { CookieConsent } from './components/CookieConsent';
import { PostDownloadAdModal, ProcessedFileItem } from './components/PostDownloadAdModal';
import { initGoogleAdSense } from './lib/adManager';
import { startKeepAlive } from './lib/keepAlive';

// Views and Tools
import { HomeView } from './components/views/HomeView';
import { GuidesView } from './components/views/GuidesView';
import { PrivacyView } from './components/views/PrivacyView';
import { TermsView } from './components/views/TermsView';
import { ProgrammaticLandingPage } from './components/views/ProgrammaticLandingPage';

import { CompressorTool } from './components/tools/CompressorTool';
import { BackgroundRemoverTool } from './components/tools/BackgroundRemoverTool';
import { FormatConverterTool } from './components/tools/FormatConverterTool';
import { ResizerCropperTool } from './components/tools/ResizerCropperTool';
import { ColorPaletteTool } from './components/tools/ColorPaletteTool';
import { MemeGeneratorTool } from './components/tools/MemeGeneratorTool';

// New Toolkits
import { VideoTrimmerTool } from './components/tools/VideoTrimmerTool';
import { VideoFrameExtractorTool } from './components/tools/VideoFrameExtractorTool';
import { PdfMergerTool } from './components/tools/PdfMergerTool';
import { PdfSplitterTool } from './components/tools/PdfSplitterTool';
import { ImagesToPdfTool } from './components/tools/ImagesToPdfTool';
import { ZipArchiverTool } from './components/tools/ZipArchiverTool';
import { ZipExtractorTool } from './components/tools/ZipExtractorTool';
import { AudioToolsTool } from './components/tools/AudioToolsTool';
import { SvgOptimizerTool } from './components/tools/SvgOptimizerTool';
import { FileEncryptorTool } from './components/tools/FileEncryptorTool';

import { findRouteBySlug } from './data/toolsData';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [currentSlug, setCurrentSlug] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(true);

  // Post Download Ad Modal
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const [downloadedFileName, setDownloadedFileName] = useState<string>('');
  const [downloadCount, setDownloadCount] = useState<number>(1);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileItem[]>([]);

  useEffect(() => {
    // Initialize Google AdSense
    initGoogleAdSense();

    // Start 40-second Keep-Alive auto-ping service (prevents Render 50s spin down)
    startKeepAlive(40000);

    // Read theme preference or default to dark theme
    const savedTheme = localStorage.getItem('browserkit_theme') || localStorage.getItem('mediacraft_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check URL path for programmatic route matching
    const path = window.location.pathname.replace(/^\/+/, '');
    if (path) {
      const route = findRouteBySlug(path);
      if (route) {
        setCurrentSlug(route.slug);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('browserkit_theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNavigateRoute = (slug: string) => {
    setCurrentSlug(slug);
    if (slug) {
      const route = findRouteBySlug(slug);
      if (route) {
        setActivePage(route.toolType);
      }
    }
  };

  const handleDownloadTrigger = (
    filename = 'download.png',
    count = 1,
    files?: ProcessedFileItem[]
  ) => {
    setDownloadedFileName(filename);
    setDownloadCount(count);
    setProcessedFiles(files || []);
    setDownloadModalOpen(true);
  };

  const activeProgrammaticRoute = currentSlug ? findRouteBySlug(currentSlug) : undefined;

  const renderCurrentPage = () => {
    if (activeProgrammaticRoute) {
      return (
        <ProgrammaticLandingPage
          route={activeProgrammaticRoute}
          onDownloadTrigger={handleDownloadTrigger}
          onNavigateRoute={handleNavigateRoute}
        />
      );
    }

    switch (activePage) {
      case 'compressor':
        return <CompressorTool onDownloadTrigger={handleDownloadTrigger} />;
      case 'bg-remover':
        return <BackgroundRemoverTool onDownloadTrigger={handleDownloadTrigger} />;
      case 'converter':
        return <FormatConverterTool onDownloadTrigger={handleDownloadTrigger} />;
      case 'resizer':
        return <ResizerCropperTool onDownloadTrigger={handleDownloadTrigger} />;
      case 'palette':
        return <ColorPaletteTool onDownloadTrigger={handleDownloadTrigger} />;
      case 'meme':
        return <MemeGeneratorTool onDownloadTrigger={handleDownloadTrigger} />;
      case 'video-trimmer':
        return <VideoTrimmerTool />;
      case 'video-to-gif':
        return <VideoFrameExtractorTool />;
      case 'pdf-merger':
        return <PdfMergerTool />;
      case 'pdf-splitter':
        return <PdfSplitterTool />;
      case 'images-to-pdf':
        return <ImagesToPdfTool />;
      case 'zip-archiver':
        return <ZipArchiverTool />;
      case 'zip-extractor':
        return <ZipExtractorTool />;
      case 'audio-tools':
        return <AudioToolsTool />;
      case 'svg-optimizer':
        return <SvgOptimizerTool />;
      case 'file-encryptor':
        return <FileEncryptorTool />;
      case 'guides':
        return <GuidesView setActivePage={(p) => { setCurrentSlug(''); setActivePage(p); }} />;
      case 'privacy':
        return <PrivacyView />;
      case 'terms':
        return <TermsView />;
      case 'home':
      default:
        return <HomeView setActivePage={(p) => { setCurrentSlug(''); setActivePage(p); }} onNavigateRoute={handleNavigateRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
      {/* Top Header Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={(p) => { setCurrentSlug(''); setActivePage(p); }}
        onNavigateRoute={handleNavigateRoute}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Main Layout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header Banner Ad Slot */}
        <AdSlot type="header-banner" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Workspace Column */}
          <main className="lg:col-span-9 w-full min-w-0 space-y-8">
            {renderCurrentPage()}
            {/* Below Tool Ad Slot */}
            {activePage !== 'home' && <AdSlot type="below-tool" />}
          </main>

          {/* Sidebar Column (Desktop Display Ads & Quick Tools) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-20">
            {/* Desktop Sidebar Ad Slot */}
            <AdSlot type="sidebar" />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <Footer
        setActivePage={(p) => { setCurrentSlug(''); setActivePage(p); }}
        onNavigateRoute={handleNavigateRoute}
      />

      {/* Dismissible Post Download Ad Modal */}
      <PostDownloadAdModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        fileName={downloadedFileName}
        itemCount={downloadCount}
        processedFiles={processedFiles}
      />

      {/* Cookie Consent Notice */}
      <CookieConsent />
    </div>
  );
}
