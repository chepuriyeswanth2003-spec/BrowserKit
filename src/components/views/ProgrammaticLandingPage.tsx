import React, { useEffect, Suspense, lazy } from 'react';
import { ProgrammaticToolRoute } from '../../data/toolsData';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { ShieldCheck, Cpu, HardDrive, ArrowRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';

// Dynamic lazy imports for tools
const FormatConverterTool = lazy(() => import('../tools/FormatConverterTool').then((m) => ({ default: m.FormatConverterTool })));
const CompressorTool = lazy(() => import('../tools/CompressorTool').then((m) => ({ default: m.CompressorTool })));
const PdfMergerTool = lazy(() => import('../tools/PdfMergerTool').then((m) => ({ default: m.PdfMergerTool })));
const PdfSplitterTool = lazy(() => import('../tools/PdfSplitterTool').then((m) => ({ default: m.PdfSplitterTool })));
const ImagesToPdfTool = lazy(() => import('../tools/ImagesToPdfTool').then((m) => ({ default: m.ImagesToPdfTool })));
const ZipArchiverTool = lazy(() => import('../tools/ZipArchiverTool').then((m) => ({ default: m.ZipArchiverTool })));
const ZipExtractorTool = lazy(() => import('../tools/ZipExtractorTool').then((m) => ({ default: m.ZipExtractorTool })));
const AudioToolsTool = lazy(() => import('../tools/AudioToolsTool').then((m) => ({ default: m.AudioToolsTool })));
const FileEncryptorTool = lazy(() => import('../tools/FileEncryptorTool').then((m) => ({ default: m.FileEncryptorTool })));
const ResizerCropperTool = lazy(() => import('../tools/ResizerCropperTool').then((m) => ({ default: m.ResizerCropperTool })));
const VideoFrameExtractorTool = lazy(() => import('../tools/VideoFrameExtractorTool').then((m) => ({ default: m.VideoFrameExtractorTool })));
const MemeGeneratorTool = lazy(() => import('../tools/MemeGeneratorTool').then((m) => ({ default: m.MemeGeneratorTool })));
const SvgOptimizerTool = lazy(() => import('../tools/SvgOptimizerTool').then((m) => ({ default: m.SvgOptimizerTool })));

interface ProgrammaticLandingPageProps {
  route: ProgrammaticToolRoute;
  onDownloadTrigger?: (filename?: string, count?: number, files?: ProcessedFileItem[]) => void;
  onNavigateRoute: (slug: string) => void;
}

export const ProgrammaticLandingPage: React.FC<ProgrammaticLandingPageProps> = ({
  route,
  onDownloadTrigger,
  onNavigateRoute,
}) => {
  useEffect(() => {
    // 1. Dynamic document title and meta tags update
    document.title = route.metaTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', route.metaDescription);

    // 2. Structured Data SoftwareApplication JSON-LD Schema
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: route.h1,
      operatingSystem: 'Any',
      applicationCategory: route.toolCategory,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: route.metaDescription,
    };

    let scriptTag = document.querySelector('#software-application-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('id', 'software-application-schema');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    window.scrollTo(0, 0);

    return () => {
      const scriptTag = document.querySelector('#software-application-schema');
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, [route]);

  // Render corresponding interactive tool based on route.toolType
  const renderInteractiveUtility = () => {
    return (
      <Suspense
        fallback={
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 my-8 shadow-xs">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-800">Loading Tool Workspace...</p>
          </div>
        }
      >
        {(() => {
          switch (route.toolType) {
            case 'converter':
              return <FormatConverterTool onDownloadTrigger={onDownloadTrigger} />;
            case 'compressor':
              return <CompressorTool onDownloadTrigger={onDownloadTrigger} />;
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
            case 'file-encryptor':
              return <FileEncryptorTool />;
            case 'resizer':
              return <ResizerCropperTool onDownloadTrigger={onDownloadTrigger} />;
            case 'video-to-gif':
              return <VideoFrameExtractorTool />;
            case 'meme':
              return <MemeGeneratorTool onDownloadTrigger={onDownloadTrigger} />;
            case 'svg-optimizer':
              return <SvgOptimizerTool />;
            default:
              return <FormatConverterTool onDownloadTrigger={onDownloadTrigger} />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Dynamic SEO Header */}
      <header className="space-y-4 text-center max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          100% PRIVATE • ZERO CLOUD UPLOADS
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {route.h1}
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Convert and process your <span className="font-bold text-slate-900 dark:text-white">{route.sourceFormat}</span> files to{' '}
          <span className="font-bold text-slate-900 dark:text-white">{route.targetFormat}</span> instantly inside your web browser. Enjoy complete data privacy with guaranteed zero remote server transfers.
        </p>

        {/* Feature Pill Indicators */}
        <div className="pt-1 flex flex-wrap justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md">
            <Cpu className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> Browser-Native Processing
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md">
            <HardDrive className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> On-Device Memory
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md">
            <Lock className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> AES-256 Vault Ready
          </span>
        </div>
      </header>

      {/* Main Interactive Utility Container */}
      <main id="app-root" className="w-full">
        {renderInteractiveUtility()}
      </main>

      {/* Dynamic Content & Feature Highlights */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <Sparkles className="w-5 h-5 text-slate-900 dark:text-slate-100" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Why Use BrowserKit for {route.sourceFormat} Conversions?
          </h2>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {route.primaryBenefits.map((benefit, idx) => (
            <li
              key={`benefit-${idx}`}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-900 dark:text-white shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
                {benefit}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* How-To Guide Block for Search Intent Relevance */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg border border-slate-800">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Step-by-Step Instructions
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            How to Convert {route.sourceFormat} to {route.targetFormat} On-Device
          </h2>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {route.steps.map((step, idx) => (
            <li key={`step-${idx}`} className="space-y-2 relative">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Step {idx + 1}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium pl-1">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Cross-Link Related Tools */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Explore Other Privacy-First Converter Utilities
          </h3>
          <span className="text-xs text-slate-500 font-medium">100% In-Browser Execution</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateRoute('heic-to-jpg')}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">HEIC to JPG</div>
              <div className="text-[10px] font-mono text-slate-500">iPhone Photo Convert</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigateRoute('compress-pdf-to-200kb')}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">Compress PDF</div>
              <div className="text-[10px] font-mono text-slate-500">Target Under 200KB</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigateRoute('passport-photo-maker')}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">Passport Photo Maker</div>
              <div className="text-[10px] font-mono text-slate-500">Official 3.5x4.5cm</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigateRoute('remove-pdf-password')}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">Unlock PDF</div>
              <div className="text-[10px] font-mono text-slate-500">Remove Restrictions</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};
