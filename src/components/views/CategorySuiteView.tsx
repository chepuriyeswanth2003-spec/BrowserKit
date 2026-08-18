import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  Search,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Minimize2,
  Scissors,
  RefreshCw,
  Crop,
  Palette,
  Smile,
  Film,
  FilePlus,
  FolderArchive,
  Music,
  Code,
  Lock,
  Unlock,
  UserCheck,
  Calendar,
  PenTool,
  RotateCw,
  Layers,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { ActivePage, ToolCategory, ToolType } from '../../types';
import { TOOL_METADATA } from '../../lib/seoData';
import { isPublicTool } from '../../lib/publicTools';
import { PrivacyBadge } from '../PrivacyBadge';

interface CategorySuiteViewProps {
  category?: ToolCategory;
  categoryPage?: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onNavigateRoute?: (slug: string) => void;
}

export const CategorySuiteView: React.FC<CategorySuiteViewProps> = ({
  category,
  categoryPage,
  setActivePage,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const resolvedCategory: ToolCategory = (() => {
    if (category) return category;
    if (categoryPage) {
      if (categoryPage === 'pdf-tools') return 'pdf';
      if (categoryPage === 'image-tools') return 'image';
      if (categoryPage === 'video-tools') return 'video';
      if (categoryPage === 'zip-tools') return 'zip';
    }
    return 'pdf';
  })();

  const toolIcons: Record<ToolType, React.ReactNode> = {
    compressor: <Minimize2 className="w-5 h-5 text-[#2f7a4f]" />,
    converter: <RefreshCw className="w-5 h-5 text-[#2d5da1]" />,
    resizer: <Crop className="w-5 h-5 text-[#6b4fa0]" />,
    palette: <Palette className="w-5 h-5 text-[#b8860b]" />,
    meme: <Smile className="w-5 h-5 text-[#ff4d4d]" />,
    'passport-photo-maker': <UserCheck className="w-5 h-5 text-[#2f7a4f]" />,
    'add-name-and-dob': <Calendar className="w-5 h-5 text-[#2d5da1]" />,
    'signature-resizer': <PenTool className="w-5 h-5 text-[#2d5da1]" />,
    'image-dpi-converter': <SlidersHorizontal className="w-5 h-5 text-[#6b4fa0]" />,
    'circle-crop': <Crop className="w-5 h-5 text-[#2f7a4f]" />,
    'merge-photo-signature': <Layers className="w-5 h-5 text-[#b8860b]" />,
    'join-images': <FilePlus className="w-5 h-5 text-[#2d5da1]" />,
    'image-watermark': <FileText className="w-5 h-5 text-[#ff4d4d]" />,
    'image-rotate-flip': <RotateCw className="w-5 h-5 text-[#2d5da1]" />,
    'image-effects': <Eye className="w-5 h-5 text-[#6b4fa0]" />,
    'official-size-resizer': <UserCheck className="w-5 h-5 text-[#2f7a4f]" />,
    'social-media-resizer': <Crop className="w-5 h-5 text-[#2d5da1]" />,
    'target-kb-compressor': <Minimize2 className="w-5 h-5 text-[#2f7a4f]" />,
    'social-video-downloader': <Video className="w-5 h-5 text-[#2d5da1]" />,
    'social-audio-extractor': <Music className="w-5 h-5 text-[#6b4fa0]" />,
    'social-batch-downloader': <Layers className="w-5 h-5 text-[#b8860b]" />,
    'thumbnail-grabber': <ImageIcon className="w-5 h-5 text-[#ff4d4d]" />,
    'video-to-audio': <Music className="w-5 h-5 text-[#6b4fa0]" />,
    'video-format-swapper': <RefreshCw className="w-5 h-5 text-[#2d5da1]" />,
    'gif-maker': <Sparkles className="w-5 h-5 text-[#b8860b]" />,
    'video-codec-transcoder': <Code className="w-5 h-5 text-teal-600" />,
    'video-trimmer': <Video className="w-5 h-5 text-[#2d5da1]" />,
    'video-to-gif': <Film className="w-5 h-5 text-[#2d5da1]" />,
    'audio-cutter': <Scissors className="w-5 h-5 text-[#ff4d4d]" />,
    'aspect-ratio-resizer': <Crop className="w-5 h-5 text-[#2f7a4f]" />,
    'pdf-merger': <FileText className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-splitter': <Scissors className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-compressor': <Minimize2 className="w-5 h-5 text-[#2f7a4f]" />,
    'pdf-password-remover': <Unlock className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-protector': <Lock className="w-5 h-5 text-[#2f7a4f]" />,
    'images-to-pdf': <FilePlus className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-to-jpg': <ImageIcon className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-to-word': <FileText className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-to-ppt': <FileText className="w-5 h-5 text-[#b8860b]" />,
    'pdf-to-excel': <FileText className="w-5 h-5 text-[#2f7a4f]" />,
    'word-to-pdf': <FilePlus className="w-5 h-5 text-[#2d5da1]" />,
    'ppt-to-pdf': <FilePlus className="w-5 h-5 text-[#b8860b]" />,
    'excel-to-pdf': <FilePlus className="w-5 h-5 text-[#2f7a4f]" />,
    'html-to-pdf': <Code className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-editor': <FileText className="w-5 h-5 text-[#6b4fa0]" />,
    'pdf-signer': <PenTool className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-metadata': <Info className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-watermark': <FileText className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-rotator': <RotateCw className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-organizer': <Layers className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-to-pdfa': <CheckCircle className="w-5 h-5 text-teal-600" />,
    'pdf-repair': <Sparkles className="w-5 h-5 text-[#b8860b]" />,
    'pdf-page-numbers': <FileText className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-ocr': <Sparkles className="w-5 h-5 text-[#6b4fa0]" />,
    'pdf-compare': <FileText className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-redact': <Lock className="w-5 h-5 text-[#ff4d4d]" />,
    'pdf-cropper': <Crop className="w-5 h-5 text-[#2f7a4f]" />,
    'pdf-forms': <CheckCircle className="w-5 h-5 text-[#2d5da1]" />,
    'pdf-to-markdown': <Code className="w-5 h-5 text-[#2d2d2d]/[0.92]" />,
    'zip-archiver': <Archive className="w-5 h-5 text-[#b8860b]" />,
    'zip-extractor': <FolderArchive className="w-5 h-5 text-[#b8860b]" />,
    'zip-password-remover': <Unlock className="w-5 h-5 text-[#ff4d4d]" />,
    'audio-tools': <Music className="w-5 h-5 text-[#6b4fa0]" />,
    'svg-optimizer': <Code className="w-5 h-5 text-[#2d5da1]" />,
    'file-encryptor': <Lock className="w-5 h-5 text-[#2f7a4f]" />,
  };

  const suiteInfoMap = {
    pdf: {
      title: 'PDF Tools Suite',
      subtitle: 'All 27+ PDF tools for merging, splitting, compressing, converting, signing, protecting, and editing PDF files.',
      icon: <FileText className="w-6 h-6 text-[#ff4d4d]" />,
    },
    image: {
      title: 'Image & Photo Suite',
      subtitle: 'All image editing tools for compressing under 100KB, Passport photos, HEIC conversion, resizing & signature editing.',
      icon: <ImageIcon className="w-6 h-6 text-[#2f7a4f]" />,
    },
    video: {
      title: 'Video & Audio Suite',
      subtitle: 'All media utilities for video trimming, frame extractions, GIF creation, and audio track conversion.',
      icon: <Video className="w-6 h-6 text-[#2d5da1]" />,
    },
    zip: {
      title: 'Archive & Security Vault',
      subtitle: 'All archive utilities for ZIP creation, extraction, ZIP password unlock, and AES-256 client-side file encryption.',
      icon: <Archive className="w-6 h-6 text-[#b8860b]" />,
    },
    audio: {
      title: 'Audio Tools Suite',
      subtitle: 'Convert audio formats and extract sound tracks.',
      icon: <Music className="w-6 h-6 text-[#6b4fa0]" />,
    },
  };

  const suiteInfo = suiteInfoMap[resolvedCategory] || suiteInfoMap.pdf;

  const categoryTools = Object.values(TOOL_METADATA).filter(
    (t) => isPublicTool(t.id) &&
      (resolvedCategory === 'video' ? t.category === 'video' || t.category === 'audio' : t.category === resolvedCategory)
  );

  const filteredTools = categoryTools.filter(
    (t) =>
      searchFilter.trim() === '' ||
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => setActivePage('home')}
        className="inline-flex items-center gap-2 px-4 py-2 wobbly-md bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] hover:bg-[#fdfbf7] dark:hover:bg-[#332e29] transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]" /> Back to Dashboard
      </button>

      {/* Hero Header Section */}
      <section className="bg-white dark:bg-[#332e29] p-6 sm:p-8 wobbly-md border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d2d2d]/[0.15] dark:border-[#f3ede2] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#e5e0d8] dark:bg-[#332e29] wobbly-md">
              {suiteInfo.icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2d2d2d] dark:text-white tracking-tight">
                {suiteInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] font-medium mt-0.5">
                {suiteInfo.subtitle}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 wobbly-pill text-xs font-mono font-bold bg-[#ff4d4d] text-white shadow-hand-sm border-[2px] border-[#2d2d2d]">
            {categoryTools.length} Tools Available
          </span>
        </div>
      </section>

      {/* Tools Filter Bar & Grid */}
      <section className="bg-white dark:bg-[#27272a] p-6 sm:p-8 wobbly-md border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2d2d]/20 dark:border-[#f3ede2]/30 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#2d2d2d] dark:text-white">
              Browse {suiteInfo.title}
            </h2>
            <p className="text-xs text-[#2d2d2d]/80 dark:text-[#f3ede2]/80 font-bold">
              Select any tool to process your files 100% locally on device
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2d2d2d]/70 dark:text-[#f3ede2]/70 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter tools..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#fafafa] dark:bg-[#3f3f46] wobbly-md border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] focus:bg-white dark:focus:bg-[#27272a] focus:outline-none focus:ring-2 focus:ring-[#2d5da1] text-[#2d2d2d] dark:text-white transition-all font-medium"
            />
          </div>
        </div>

        {/* High Density Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => setActivePage(tool.id)}
                className="group relative p-6 bg-[#fafafa] dark:bg-[#3f3f46] hover:bg-[#2d2d2d] dark:hover:bg-[#18181b] text-[#2d2d2d] dark:text-white hover:text-white wobbly-md border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] hover:border-[#2d2d2d] shadow-hand-sm hover:shadow-hand-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 wobbly-sm bg-white dark:bg-[#27272a] group-hover:bg-[#ff4d4d] transition-colors shadow-hand-sm border-[2px] border-[#2d2d2d]">
                      {toolIcons[tool.id]}
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 wobbly-pill bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d]">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2d2d2d] dark:text-white group-hover:text-[#2f7a4f] dark:group-hover:text-[#2f7a4f] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] mt-1 line-clamp-2 leading-relaxed">
                      {tool.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#2d2d2d]/[0.15] dark:border-[#f3ede2] flex items-center justify-between text-xs font-semibold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] group-hover:text-[#2f7a4f] dark:group-hover:text-[#2f7a4f]">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4 text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.65] group-hover:text-[#2f7a4f] dark:group-hover:text-[#2f7a4f] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] text-sm font-medium">
              No tools match your search criteria. Try a different query or clear the filter.
              <div className="mt-4">
                <button
                  onClick={() => setSearchFilter('')}
                  className="text-xs text-[#2f7a4f] dark:text-[#2f7a4f] hover:underline font-semibold cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
