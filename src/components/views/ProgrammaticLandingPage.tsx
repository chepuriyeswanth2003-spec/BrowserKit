import React, { useEffect } from 'react';
import { ProgrammaticToolRoute } from '../../data/toolsData';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { ShieldCheck, Cpu, HardDrive, ArrowRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';

// Tool components
import { FormatConverterTool } from '../tools/FormatConverterTool';
import { CompressorTool } from '../tools/CompressorTool';
import { BackgroundRemoverTool } from '../tools/BackgroundRemoverTool';
import { PdfMergerTool } from '../tools/PdfMergerTool';
import { PdfSplitterTool } from '../tools/PdfSplitterTool';
import { ImagesToPdfTool } from '../tools/ImagesToPdfTool';
import { ZipArchiverTool } from '../tools/ZipArchiverTool';
import { ZipExtractorTool } from '../tools/ZipExtractorTool';
import { AudioToolsTool } from '../tools/AudioToolsTool';
import { FileEncryptorTool } from '../tools/FileEncryptorTool';
import { ResizerCropperTool } from '../tools/ResizerCropperTool';
import { VideoFrameExtractorTool } from '../tools/VideoFrameExtractorTool';
import { MemeGeneratorTool } from '../tools/MemeGeneratorTool';
import { SvgOptimizerTool } from '../tools/SvgOptimizerTool';

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
      name: `BrowserKit - ${route.h1}`,
      operatingSystem: 'Any',
      applicationCategory: 'MultimediaApplication',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
      },
      featureList: route.primaryBenefits.join(', '),
      description: route.metaDescription,
    };

    let scriptTag = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    window.scrollTo(0, 0);
  }, [route]);

  // Render corresponding interactive tool based on route.toolType
  const renderInteractiveUtility = () => {
    switch (route.toolType) {
      case 'converter':
        return <FormatConverterTool onDownloadTrigger={onDownloadTrigger} />;
      case 'compressor':
        return <CompressorTool onDownloadTrigger={onDownloadTrigger} />;
      case 'bg-remover':
        return <BackgroundRemoverTool onDownloadTrigger={onDownloadTrigger} />;
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
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Dynamic SEO Header */}
      <header className="space-y-4 text-center max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
          <span>100% Client-Side Execution • Zero Server Uploads</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {route.h1}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
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
              <div className="w-8 h-8 rounded-xl bg-white text-slate-900 font-mono font-bold text-sm flex items-center justify-center shadow-md">
                {idx + 1}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Related Programmatic Intent Tools */}
      <section className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
          Explore Related On-Device Tools
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'HEIC to JPG', slug: 'heic-to-jpg' },
            { label: 'PNG to WebP', slug: 'png-to-webp' },
            { label: 'Merge PDF Offline', slug: 'merge-pdf-offline' },
            { label: 'Compress PNG', slug: 'compress-png-online' },
            { label: 'Remove BG Free', slug: 'remove-bg-free' },
            { label: 'Extract Audio', slug: 'extract-audio-mp4' },
            { label: 'Password Encrypt', slug: 'encrypt-file-password' },
            { label: 'Images to PDF', slug: 'convert-images-to-pdf' },
          ]
            .filter((item) => item.slug !== route.slug)
            .slice(0, 4)
            .map((item) => (
              <button
                key={item.slug}
                onClick={() => onNavigateRoute(item.slug)}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white">
                    {item.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
        </div>
      </section>
    </div>
  );
};
