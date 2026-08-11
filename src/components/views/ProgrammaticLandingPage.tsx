import React, { useEffect, Suspense, lazy } from 'react';
import { ProgrammaticToolRoute } from '../../data/toolsData';
import { ProcessedFileItem } from '../PostDownloadAdModal';
import { ShieldCheck, Cpu, HardDrive, ArrowRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';

// Dynamic lazy imports for tools
const FormatConverterTool = lazy(() => import('../tools/FormatConverterTool').then((m) => ({ default: m.FormatConverterTool })));
const CompressorTool = lazy(() => import('../tools/CompressorTool').then((m) => ({ default: m.CompressorTool })));
const PdfMergerTool = lazy(() => import('../tools/PdfMergerTool').then((m) => ({ default: m.PdfMergerTool })));
const PdfSplitterTool = lazy(() => import('../tools/PdfSplitterTool').then((m) => ({ default: m.PdfSplitterTool })));
const PdfPasswordRemoverTool = lazy(() => import('../tools/PdfPasswordRemoverTool').then((m) => ({ default: m.PdfPasswordRemoverTool })));
const ImagesToPdfTool = lazy(() => import('../tools/ImagesToPdfTool').then((m) => ({ default: m.ImagesToPdfTool })));
const PdfSuiteTools = lazy(() => import('../tools/PdfSuiteTools').then((m) => ({ default: m.PdfSuiteTools })));
const ZipArchiverTool = lazy(() => import('../tools/ZipArchiverTool').then((m) => ({ default: m.ZipArchiverTool })));
const ZipExtractorTool = lazy(() => import('../tools/ZipExtractorTool').then((m) => ({ default: m.ZipExtractorTool })));
const ZipPasswordRemoverTool = lazy(() => import('../tools/ZipPasswordRemoverTool').then((m) => ({ default: m.ZipPasswordRemoverTool })));
const AudioToolsTool = lazy(() => import('../tools/AudioToolsTool').then((m) => ({ default: m.AudioToolsTool })));
const FileEncryptorTool = lazy(() => import('../tools/FileEncryptorTool').then((m) => ({ default: m.FileEncryptorTool })));
const ResizerCropperTool = lazy(() => import('../tools/ResizerCropperTool').then((m) => ({ default: m.ResizerCropperTool })));
const VideoTrimmerTool = lazy(() => import('../tools/VideoTrimmerTool').then((m) => ({ default: m.VideoTrimmerTool })));
const VideoFrameExtractorTool = lazy(() => import('../tools/VideoFrameExtractorTool').then((m) => ({ default: m.VideoFrameExtractorTool })));
const MediaSuiteTools = lazy(() => import('../tools/MediaSuiteTools').then((m) => ({ default: m.MediaSuiteTools })));
const ImageSuiteTools = lazy(() => import('../tools/ImageSuiteTools').then((m) => ({ default: m.ImageSuiteTools })));
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
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 my-8 shadow-xs">
            <div className="w-10 h-10 border-4 border-slate-900 dark:border-slate-100 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">Loading Tool Workspace...</p>
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
            case 'pdf-password-remover':
              return <PdfPasswordRemoverTool onDownloadTrigger={onDownloadTrigger} />;
            case 'pdf-compressor':
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
            case 'pdf-to-markdown':
              return <PdfSuiteTools toolType={route.toolType} onDownloadTrigger={onDownloadTrigger} />;
            case 'images-to-pdf':
              return <ImagesToPdfTool />;
            case 'zip-archiver':
              return <ZipArchiverTool />;
            case 'zip-extractor':
              return <ZipExtractorTool />;
            case 'zip-password-remover':
              return <ZipPasswordRemoverTool onDownloadTrigger={onDownloadTrigger} />;
            case 'audio-tools':
              return <AudioToolsTool />;
            case 'file-encryptor':
              return <FileEncryptorTool />;
            case 'resizer':
              return <ResizerCropperTool onDownloadTrigger={onDownloadTrigger} />;
            case 'video-trimmer':
              return <VideoTrimmerTool />;
            case 'video-to-gif':
              return <VideoFrameExtractorTool />;
            case 'aspect-ratio-resizer':
            case 'video-to-audio':
            case 'audio-cutter':
            case 'thumbnail-grabber':
            case 'social-video-downloader':
            case 'social-audio-extractor':
            case 'social-batch-downloader':
            case 'video-format-swapper':
            case 'gif-maker':
            case 'video-codec-transcoder':
              return <MediaSuiteTools toolType={route.toolType} onDownloadTrigger={onDownloadTrigger} />;
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
              return <ImageSuiteTools toolType={route.toolType} onDownloadTrigger={onDownloadTrigger} />;
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
      </header>

      {/* Embedded Tool Component Workspace */}
      <section className="w-full">
        {renderInteractiveUtility()}
      </section>

      {/* Key Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {route.primaryBenefits.map((benefit, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              0{idx + 1}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {benefit}
            </p>
          </div>
        ))}
      </section>

      {/* Step-by-Step Instructions */}
      <section className="p-8 rounded-3xl bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white space-y-6 shadow-md">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            How to use this tool
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            3 simple steps to process your files 100% locally
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {route.steps.map((step, idx) => (
            <div key={idx} className="space-y-2 border-l-2 border-emerald-500/40 pl-4">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Step {idx + 1}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
