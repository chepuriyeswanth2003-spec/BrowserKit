import React, { useState, useEffect } from 'react';
import { ActivePage, ToolType } from './types';
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
import { FormatConverterTool } from './components/tools/FormatConverterTool';
import { ResizerCropperTool } from './components/tools/ResizerCropperTool';
import { ColorPaletteTool } from './components/tools/ColorPaletteTool';
import { MemeGeneratorTool } from './components/tools/MemeGeneratorTool';

// New Toolkits
import { VideoTrimmerTool } from './components/tools/VideoTrimmerTool';
import { VideoFrameExtractorTool } from './components/tools/VideoFrameExtractorTool';
import { PdfMergerTool } from './components/tools/PdfMergerTool';
import { PdfSplitterTool } from './components/tools/PdfSplitterTool';
import { PdfPasswordRemoverTool } from './components/tools/PdfPasswordRemoverTool';
import { ImagesToPdfTool } from './components/tools/ImagesToPdfTool';
import { ZipArchiverTool } from './components/tools/ZipArchiverTool';
import { ZipExtractorTool } from './components/tools/ZipExtractorTool';
import { ZipPasswordRemoverTool } from './components/tools/ZipPasswordRemoverTool';
import { AudioToolsTool } from './components/tools/AudioToolsTool';
import { SvgOptimizerTool } from './components/tools/SvgOptimizerTool';
import { FileEncryptorTool } from './components/tools/FileEncryptorTool';

import { findRouteBySlug } from './data/toolsData';

// Helper to map any URL path to ActivePage and currentSlug
function parsePathToState(rawPath: string): { page: ActivePage; slug: string } {
  const path = rawPath.replace(/^\/+/, '').replace(/\/$/, '').trim();

  if (!path || path === 'home') {
    return { page: 'home', slug: '' };
  }

  // 1. Check Programmatic SEO routes first
  const programmaticRoute = findRouteBySlug(path);
  if (programmaticRoute) {
    return { page: programmaticRoute.toolType, slug: programmaticRoute.slug };
  }

  // 2. Check direct ToolType or Static pages
  const validPages: ActivePage[] = [
    'compressor',
    'converter',
    'resizer',
    'palette',
    'meme',
    'video-trimmer',
    'video-to-gif',
    'pdf-merger',
    'pdf-splitter',
    'pdf-password-remover',
    'images-to-pdf',
    'zip-archiver',
    'zip-extractor',
    'zip-password-remover',
    'audio-tools',
    'svg-optimizer',
    'file-encryptor',
    'guides',
    'privacy',
    'terms',
  ];

  if (validPages.includes(path as ActivePage)) {
    return { page: path as ActivePage, slug: '' };
  }

  // 3. Check alias routes
  const aliases: Record<string, ActivePage> = {
    'compress-image': 'compressor',
    'convert-format': 'converter',
    'resize-image': 'resizer',
    'color-palette': 'palette',
    'meme-generator': 'meme',
    'unlock-pdf': 'pdf-password-remover',
    'unlock-zip': 'zip-password-remover',
  };

  if (aliases[path]) {
    return { page: aliases[path], slug: '' };
  }

  // Fallback to home
  return { page: 'home', slug: '' };
}

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [currentSlug, setCurrentSlug] = useState<string>('');
  const [sidebarAdFilled, setSidebarAdFilled] = useState<boolean>(false);

  // Post Download Ad Modal
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const [downloadedFileName, setDownloadedFileName] = useState<string>('');
  const [downloadCount, setDownloadCount] = useState<number>(1);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileItem[]>([]);

  useEffect(() => {
    // Initialize Google AdSense
    initGoogleAdSense();

    // Start 40-second Keep-Alive auto-ping service
    startKeepAlive(40000);

    // Clean up legacy dark mode
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';

    // Sync initial state from current window URL path
    const initialState = parsePathToState(window.location.pathname);
    setActivePage(initialState.page);
    setCurrentSlug(initialState.slug);

    // Listen to Browser Back / Forward button navigation
    const handlePopState = () => {
      const state = parsePathToState(window.location.pathname);
      setActivePage(state.page);
      setCurrentSlug(state.slug);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPage = (page: ActivePage, pushToHistory = true) => {
    setActivePage(page);
    setCurrentSlug('');

    const targetPath = page === 'home' ? '/' : `/${page}`;
    if (pushToHistory && window.location.pathname !== targetPath) {
      window.history.pushState({ page, slug: '' }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToRoute = (slug: string, pushToHistory = true) => {
    if (!slug) {
      navigateToPage('home', pushToHistory);
      return;
    }

    const route = findRouteBySlug(slug);
    if (route) {
      setCurrentSlug(route.slug);
      setActivePage(route.toolType);

      const targetPath = `/${route.slug}`;
      if (pushToHistory && window.location.pathname !== targetPath) {
        window.history.pushState({ page: route.toolType, slug: route.slug }, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Check if slug maps to a standard page
      const pageState = parsePathToState(slug);
      navigateToPage(pageState.page, pushToHistory);
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
          onNavigateRoute={navigateToRoute}
        />
      );
    }

    switch (activePage) {
      case 'compressor':
        return <CompressorTool onDownloadTrigger={handleDownloadTrigger} />;
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
      case 'pdf-password-remover':
        return <PdfPasswordRemoverTool onDownloadTrigger={handleDownloadTrigger} />;
      case 'images-to-pdf':
        return <ImagesToPdfTool />;
      case 'zip-archiver':
        return <ZipArchiverTool />;
      case 'zip-extractor':
        return <ZipExtractorTool />;
      case 'zip-password-remover':
        return <ZipPasswordRemoverTool onDownloadTrigger={handleDownloadTrigger} />;
      case 'audio-tools':
        return <AudioToolsTool />;
      case 'svg-optimizer':
        return <SvgOptimizerTool />;
      case 'file-encryptor':
        return <FileEncryptorTool />;
      case 'guides':
        return <GuidesView setActivePage={(p) => navigateToPage(p)} />;
      case 'privacy':
        return <PrivacyView />;
      case 'terms':
        return <TermsView />;
      case 'home':
      default:
        return (
          <HomeView
            setActivePage={(p) => navigateToPage(p)}
            onNavigateRoute={navigateToRoute}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={(p) => navigateToPage(p)}
        onNavigateRoute={navigateToRoute}
      />

      {/* Main Layout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header Banner Ad Slot */}
        <AdSlot type="header-banner" />

        <div className={sidebarAdFilled ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : "w-full"}>
          {/* Main Workspace Column */}
          <main className={sidebarAdFilled ? "lg:col-span-9 w-full min-w-0 space-y-8" : "w-full min-w-0 space-y-8"}>
            {renderCurrentPage()}
            {/* Below Tool Ad Slot */}
            {activePage !== 'home' && <AdSlot type="below-tool" />}
          </main>

          {/* Sidebar Column (Desktop Display Ads & Quick Tools) */}
          <aside className={sidebarAdFilled ? "hidden lg:block lg:col-span-3 space-y-6 sticky top-20" : "hidden"}>
            {/* Desktop Sidebar Ad Slot */}
            <AdSlot type="sidebar" onStatusChange={setSidebarAdFilled} />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <Footer
        setActivePage={(p) => navigateToPage(p)}
        onNavigateRoute={navigateToRoute}
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
