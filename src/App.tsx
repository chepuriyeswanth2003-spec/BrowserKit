import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ActivePage, ToolType } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdSlot } from './components/AdSlot';
import { CookieConsent } from './components/CookieConsent';
import { PostDownloadAdModal, ProcessedFileItem } from './components/PostDownloadAdModal';
import { initGoogleAdSense } from './lib/adManager';
import { startKeepAlive } from './lib/keepAlive';

// Core views loaded immediately
import { HomeView } from './components/views/HomeView';
import { GuidesView } from './components/views/GuidesView';
import { PrivacyView } from './components/views/PrivacyView';
import { TermsView } from './components/views/TermsView';
import { ProgrammaticLandingPage } from './components/views/ProgrammaticLandingPage';
import { CategorySuiteView } from './components/views/CategorySuiteView';

// Dynamic React.lazy imports for heavy tools to eliminate unused JavaScript on home load
const CompressorTool = lazy(() => import('./components/tools/CompressorTool').then((m) => ({ default: m.CompressorTool })));
const FormatConverterTool = lazy(() => import('./components/tools/FormatConverterTool').then((m) => ({ default: m.FormatConverterTool })));
const ResizerCropperTool = lazy(() => import('./components/tools/ResizerCropperTool').then((m) => ({ default: m.ResizerCropperTool })));
const ColorPaletteTool = lazy(() => import('./components/tools/ColorPaletteTool').then((m) => ({ default: m.ColorPaletteTool })));
const MemeGeneratorTool = lazy(() => import('./components/tools/MemeGeneratorTool').then((m) => ({ default: m.MemeGeneratorTool })));
const ImageSuiteTools = lazy(() => import('./components/tools/ImageSuiteTools').then((m) => ({ default: m.ImageSuiteTools })));

const PdfMergerTool = lazy(() => import('./components/tools/PdfMergerTool').then((m) => ({ default: m.PdfMergerTool })));
const PdfSplitterTool = lazy(() => import('./components/tools/PdfSplitterTool').then((m) => ({ default: m.PdfSplitterTool })));
const PdfPasswordRemoverTool = lazy(() => import('./components/tools/PdfPasswordRemoverTool').then((m) => ({ default: m.PdfPasswordRemoverTool })));
const ImagesToPdfTool = lazy(() => import('./components/tools/ImagesToPdfTool').then((m) => ({ default: m.ImagesToPdfTool })));
const PdfSuiteTools = lazy(() => import('./components/tools/PdfSuiteTools').then((m) => ({ default: m.PdfSuiteTools })));

const VideoTrimmerTool = lazy(() => import('./components/tools/VideoTrimmerTool').then((m) => ({ default: m.VideoTrimmerTool })));
const VideoFrameExtractorTool = lazy(() => import('./components/tools/VideoFrameExtractorTool').then((m) => ({ default: m.VideoFrameExtractorTool })));
const MediaSuiteTools = lazy(() => import('./components/tools/MediaSuiteTools').then((m) => ({ default: m.MediaSuiteTools })));
const ZipArchiverTool = lazy(() => import('./components/tools/ZipArchiverTool').then((m) => ({ default: m.ZipArchiverTool })));
const ZipExtractorTool = lazy(() => import('./components/tools/ZipExtractorTool').then((m) => ({ default: m.ZipExtractorTool })));
const ZipPasswordRemoverTool = lazy(() => import('./components/tools/ZipPasswordRemoverTool').then((m) => ({ default: m.ZipPasswordRemoverTool })));
const AudioToolsTool = lazy(() => import('./components/tools/AudioToolsTool').then((m) => ({ default: m.AudioToolsTool })));
const SvgOptimizerTool = lazy(() => import('./components/tools/SvgOptimizerTool').then((m) => ({ default: m.SvgOptimizerTool })));
const FileEncryptorTool = lazy(() => import('./components/tools/FileEncryptorTool').then((m) => ({ default: m.FileEncryptorTool })));

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
    'pdf-tools',
    'image-tools',
    'video-tools',
    'zip-tools',
    'compressor',
    'converter',
    'resizer',
    'palette',
    'meme',
    'passport-photo-maker',
    'add-name-and-dob',
    'signature-resizer',
    'image-dpi-converter',
    'circle-crop',
    'merge-photo-signature',
    'join-images',
    'image-watermark',
    'image-rotate-flip',
    'image-effects',
    'official-size-resizer',
    'social-media-resizer',
    'target-kb-compressor',
    'social-video-downloader',
    'social-audio-extractor',
    'social-batch-downloader',
    'thumbnail-grabber',
    'video-to-audio',
    'video-format-swapper',
    'gif-maker',
    'video-codec-transcoder',
    'video-trimmer',
    'video-to-gif',
    'audio-cutter',
    'aspect-ratio-resizer',
    'pdf-merger',
    'pdf-splitter',
    'pdf-compressor',
    'pdf-password-remover',
    'pdf-protector',
    'images-to-pdf',
    'pdf-to-jpg',
    'pdf-to-word',
    'pdf-to-ppt',
    'pdf-to-excel',
    'word-to-pdf',
    'ppt-to-pdf',
    'excel-to-pdf',
    'html-to-pdf',
    'pdf-editor',
    'pdf-signer',
    'pdf-watermark',
    'pdf-rotator',
    'pdf-organizer',
    'pdf-to-pdfa',
    'pdf-repair',
    'pdf-page-numbers',
    'pdf-ocr',
    'pdf-compare',
    'pdf-redact',
    'pdf-cropper',
    'pdf-forms',
    'pdf-ai-summarizer',
    'pdf-translate',
    'pdf-to-markdown',
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

  return { page: 'home', slug: '' };
}

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [currentSlug, setCurrentSlug] = useState<string>('');

  // Post-download monetization modal state
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [downloadFileCount, setDownloadFileCount] = useState<number>(1);
  const [downloadFilesList, setDownloadFilesList] = useState<ProcessedFileItem[]>([]);
  const [sidebarAdFilled, setSidebarAdFilled] = useState<boolean>(false);

  // Sync initial URL path to React State
  useEffect(() => {
    const initialState = parsePathToState(window.location.pathname);
    setActivePage(initialState.page);
    setCurrentSlug(initialState.slug);
  }, []);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const state = parsePathToState(window.location.pathname);
      setActivePage(state.page);
      setCurrentSlug(state.slug);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize AdSense & Keep-Alive Service
  useEffect(() => {
    initGoogleAdSense();
    startKeepAlive();
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, currentSlug]);

  const navigateToPage = (page: ActivePage) => {
    setActivePage(page);
    setCurrentSlug('');

    const newPath = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  const navigateToRoute = (slug: string) => {
    const route = findRouteBySlug(slug);
    if (route) {
      setActivePage(route.toolType);
      setCurrentSlug(route.slug);
      const newPath = `/${slug}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    } else {
      navigateToPage('home');
    }
  };

  const handleDownloadTrigger = (
    filename: string,
    count: number = 1,
    files?: ProcessedFileItem[]
  ) => {
    setDownloadFilename(filename);
    setDownloadFileCount(count);
    if (files) setDownloadFilesList(files);
    setDownloadModalOpen(true);
  };

  const renderCurrentPage = () => {
    // 1. Standalone Category Suite pages
    if (
      activePage === 'pdf-tools' ||
      activePage === 'image-tools' ||
      activePage === 'video-tools' ||
      activePage === 'zip-tools'
    ) {
      return (
        <CategorySuiteView
          categoryPage={activePage}
          setActivePage={(p) => navigateToPage(p)}
          onNavigateRoute={navigateToRoute}
        />
      );
    }

    // 2. Programmatic landing pages
    if (currentSlug) {
      const route = findRouteBySlug(currentSlug);
      if (route) {
        return (
          <ProgrammaticLandingPage
            route={route}
            onLaunchTool={() => {
              setCurrentSlug('');
            }}
          />
        );
      }
    }

    // 3. Regular tool pages with lazy-loading boundary
    return (
      <Suspense
        fallback={
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 my-8 shadow-xs">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-800">Loading Tool Workspace...</p>
            <p className="text-xs text-slate-500 font-mono">Preparing 100% private in-browser environment</p>
          </div>
        }
      >
        {(() => {
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

            // Image Suite Tools
            case 'passport-photo-maker':
            case 'add-name-and-dob':
            case 'signature-resizer':
            case 'image-dpi-converter':
            case 'circle-crop':
            case 'merge-photo-signature':
            case 'join-images':
            case 'image-watermark':
            case 'image-rotate-flip':
            case 'image-effects':
            case 'official-size-resizer':
            case 'social-media-resizer':
            case 'target-kb-compressor':
              return <ImageSuiteTools toolType={activePage} onDownloadTrigger={handleDownloadTrigger} />;

            case 'video-trimmer':
              return <VideoTrimmerTool />;
            case 'video-to-gif':
              return <VideoFrameExtractorTool />;
            case 'social-video-downloader':
            case 'social-audio-extractor':
            case 'social-batch-downloader':
            case 'thumbnail-grabber':
            case 'video-to-audio':
            case 'video-format-swapper':
            case 'gif-maker':
            case 'video-codec-transcoder':
            case 'audio-cutter':
            case 'aspect-ratio-resizer':
              return <MediaSuiteTools toolType={activePage} onDownloadTrigger={handleDownloadTrigger} />;

            // PDF Tools Suite
            case 'pdf-merger':
              return <PdfMergerTool />;
            case 'pdf-splitter':
              return <PdfSplitterTool />;
            case 'pdf-password-remover':
              return <PdfPasswordRemoverTool onDownloadTrigger={handleDownloadTrigger} />;
            case 'images-to-pdf':
              return <ImagesToPdfTool />;
            case 'pdf-compressor':
            case 'pdf-protector':
            case 'pdf-to-jpg':
            case 'pdf-to-word':
            case 'pdf-to-ppt':
            case 'pdf-to-excel':
            case 'word-to-pdf':
            case 'ppt-to-pdf':
            case 'excel-to-pdf':
            case 'html-to-pdf':
            case 'pdf-editor':
            case 'pdf-signer':
            case 'pdf-watermark':
            case 'pdf-rotator':
            case 'pdf-organizer':
            case 'pdf-to-pdfa':
            case 'pdf-repair':
            case 'pdf-page-numbers':
            case 'pdf-ocr':
            case 'pdf-compare':
            case 'pdf-redact':
            case 'pdf-cropper':
            case 'pdf-forms':
            case 'pdf-ai-summarizer':
            case 'pdf-translate':
            case 'pdf-to-markdown':
              return <PdfSuiteTools toolType={activePage} onDownloadTrigger={handleDownloadTrigger} />;

            // Archives & Security
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
        })()}
      </Suspense>
    );
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Workspace Column */}
          <main className="lg:col-span-9 w-full min-w-0 space-y-8">
            {renderCurrentPage()}
            {/* Below Tool Ad Slot */}
            {activePage !== 'home' && <AdSlot type="below-tool" />}
          </main>

          {/* Desktop Side Ads Column (Laptop / Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-20">
            <AdSlot type="sidebar" />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <Footer setActivePage={(p) => navigateToPage(p)} onNavigateRoute={navigateToRoute} />

      {/* Privacy Notice Bar */}
      <CookieConsent />

      {/* Post-Download Ad Modal */}
      <PostDownloadAdModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        filename={downloadFilename}
        fileCount={downloadFileCount}
        files={downloadFilesList}
      />
    </div>
  );
}

export { App };
