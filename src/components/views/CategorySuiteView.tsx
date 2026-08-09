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
} from 'lucide-react';
import { ActivePage, ToolCategory, ToolType } from '../../types';
import { TOOL_METADATA } from '../../lib/seoData';
import { PrivacyBadge } from '../PrivacyBadge';

interface CategorySuiteViewProps {
  category: ToolCategory;
  setActivePage: (page: ActivePage) => void;
}

export const CategorySuiteView: React.FC<CategorySuiteViewProps> = ({
  category,
  setActivePage,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const toolIcons: Record<ToolType, React.ReactNode> = {
    compressor: <Minimize2 className="w-5 h-5 text-emerald-600" />,
    converter: <RefreshCw className="w-5 h-5 text-blue-600" />,
    resizer: <Crop className="w-5 h-5 text-purple-600" />,
    palette: <Palette className="w-5 h-5 text-amber-600" />,
    meme: <Smile className="w-5 h-5 text-rose-600" />,
    'passport-photo-maker': <UserCheck className="w-5 h-5 text-emerald-600" />,
    'add-name-and-dob': <Calendar className="w-5 h-5 text-blue-600" />,
    'signature-resizer': <PenTool className="w-5 h-5 text-indigo-600" />,
    'image-dpi-converter': <SlidersHorizontal className="w-5 h-5 text-purple-600" />,
    'circle-crop': <Crop className="w-5 h-5 text-emerald-600" />,
    'merge-photo-signature': <Layers className="w-5 h-5 text-amber-600" />,
    'join-images': <FilePlus className="w-5 h-5 text-indigo-600" />,
    'image-watermark': <FileText className="w-5 h-5 text-rose-600" />,
    'image-rotate-flip': <RotateCw className="w-5 h-5 text-sky-600" />,
    'image-effects': <Eye className="w-5 h-5 text-purple-600" />,
    'official-size-resizer': <UserCheck className="w-5 h-5 text-emerald-600" />,
    'social-media-resizer': <Crop className="w-5 h-5 text-blue-600" />,
    'target-kb-compressor': <Minimize2 className="w-5 h-5 text-emerald-600" />,
    'video-trimmer': <Video className="w-5 h-5 text-blue-600" />,
    'video-to-gif': <Film className="w-5 h-5 text-indigo-600" />,
    'pdf-merger': <FileText className="w-5 h-5 text-red-600" />,
    'pdf-splitter': <Scissors className="w-5 h-5 text-red-600" />,
    'pdf-compressor': <Minimize2 className="w-5 h-5 text-emerald-600" />,
    'pdf-password-remover': <Unlock className="w-5 h-5 text-rose-600" />,
    'pdf-protector': <Lock className="w-5 h-5 text-emerald-600" />,
    'images-to-pdf': <FilePlus className="w-5 h-5 text-red-600" />,
    'pdf-to-jpg': <ImageIcon className="w-5 h-5 text-rose-600" />,
    'pdf-to-word': <FileText className="w-5 h-5 text-blue-600" />,
    'pdf-to-ppt': <FileText className="w-5 h-5 text-amber-600" />,
    'pdf-to-excel': <FileText className="w-5 h-5 text-emerald-600" />,
    'word-to-pdf': <FilePlus className="w-5 h-5 text-blue-600" />,
    'ppt-to-pdf': <FilePlus className="w-5 h-5 text-amber-600" />,
    'excel-to-pdf': <FilePlus className="w-5 h-5 text-emerald-600" />,
    'html-to-pdf': <Code className="w-5 h-5 text-cyan-600" />,
    'pdf-editor': <FileText className="w-5 h-5 text-purple-600" />,
    'pdf-signer': <PenTool className="w-5 h-5 text-indigo-600" />,
    'pdf-watermark': <FileText className="w-5 h-5 text-rose-600" />,
    'pdf-rotator': <RotateCw className="w-5 h-5 text-sky-600" />,
    'pdf-organizer': <Layers className="w-5 h-5 text-indigo-600" />,
    'pdf-to-pdfa': <CheckCircle className="w-5 h-5 text-teal-600" />,
    'pdf-repair': <Sparkles className="w-5 h-5 text-amber-600" />,
    'pdf-page-numbers': <FileText className="w-5 h-5 text-blue-600" />,
    'pdf-ocr': <Search className="w-5 h-5 text-purple-600" />,
    'pdf-compare': <Eye className="w-5 h-5 text-indigo-600" />,
    'pdf-redact': <Lock className="w-5 h-5 text-rose-600" />,
    'pdf-cropper': <Crop className="w-5 h-5 text-emerald-600" />,
    'pdf-forms': <CheckCircle className="w-5 h-5 text-cyan-600" />,
    'pdf-ai-summarizer': <Sparkles className="w-5 h-5 text-amber-600" />,
    'pdf-translate': <Sparkles className="w-5 h-5 text-blue-600" />,
    'pdf-to-markdown': <Code className="w-5 h-5 text-slate-800" />,
    'zip-archiver': <Archive className="w-5 h-5 text-amber-600" />,
    'zip-extractor': <FolderArchive className="w-5 h-5 text-amber-600" />,
    'zip-password-remover': <Unlock className="w-5 h-5 text-rose-600" />,
    'audio-tools': <Music className="w-5 h-5 text-purple-600" />,
    'svg-optimizer': <Code className="w-5 h-5 text-indigo-600" />,
    'file-encryptor': <Lock className="w-5 h-5 text-emerald-600" />,
  };

  const suiteInfo = {
    pdf: {
      title: 'PDF Tools Suite',
      subtitle: 'All 27+ PDF tools for merging, splitting, compressing, converting, signing, protecting, and editing PDF files.',
      icon: <FileText className="w-8 h-8 text-red-600" />,
      color: 'from-red-600 to-rose-700',
    },
    image: {
      title: 'Image & Photo Suite',
      subtitle: 'All image editing tools for compressing under 100KB, Passport photos, HEIC conversion, resizing & signature editing.',
      icon: <ImageIcon className="w-8 h-8 text-emerald-600" />,
      color: 'from-emerald-600 to-teal-700',
    },
    video: {
      title: 'Video & Audio Suite',
      subtitle: 'All media utilities for video trimming, frame extractions, GIF creation, and audio track conversion.',
      icon: <Video className="w-8 h-8 text-blue-600" />,
      color: 'from-blue-600 to-indigo-700',
    },
    zip: {
      title: 'Archive & Security Vault',
      subtitle: 'All archive utilities for ZIP creation, extraction, ZIP password unlock, and AES-256 military-grade file encryption.',
      icon: <Archive className="w-8 h-8 text-amber-600" />,
      color: 'from-amber-600 to-orange-700',
    },
    audio: {
      title: 'Audio Tools Suite',
      subtitle: 'Convert audio formats and extract sound tracks.',
      icon: <Music className="w-8 h-8 text-purple-600" />,
      color: 'from-purple-600 to-indigo-700',
    },
  }[category];

  const categoryTools = Object.values(TOOL_METADATA).filter((t) =>
    category === 'video' ? t.category === 'video' || t.category === 'audio' : t.category === category
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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-slate-500" /> Back to Dashboard
      </button>

      {/* Hero Header Section */}
      <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${suiteInfo.color} text-white p-8 sm:p-12 shadow-xl`}>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
              {suiteInfo.icon}
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">
                {categoryTools.length} Tools Available
              </span>
              <h1 className="text-3xl sm:text-4xl font-black mt-1">
                {suiteInfo.title}
              </h1>
            </div>
          </div>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            {suiteInfo.subtitle}
          </p>
        </div>
      </section>

      {/* Tools Filter Bar & Grid */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Browse {suiteInfo.title}
            </h2>
            <p className="text-xs text-slate-500">
              Select any tool to process your files 100% locally on device
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter tools..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 transition-all"
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
                className="group relative p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      {toolIcons[tool.id]}
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {tool.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center space-y-3">
              <p className="text-sm font-bold text-slate-800">
                No tools match "{searchFilter}"
              </p>
              <button
                onClick={() => setSearchFilter('')}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
