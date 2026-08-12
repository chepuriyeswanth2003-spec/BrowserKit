import React, { useState } from 'react';
import {
  Wrench,
  Minimize2,
  Scissors,
  RefreshCw,
  Crop,
  Palette,
  Smile,
  Video,
  Film,
  FileText,
  FilePlus,
  Archive,
  FolderArchive,
  Music,
  Code,
  ChevronDown,
  Menu,
  X,
  Lock,
  Search,
  Sparkles,
  Image as ImageIcon,
  PenTool,
  Layers,
  Wand2,
  Sliders,
  Calendar,
  UserCheck,
  Unlock,
} from 'lucide-react';
import type { ActivePage, ToolType } from '../types';
import { TOOL_METADATA } from '../lib/seoData';
import { PROGRAMMATIC_ROUTES } from '../data/toolsData';
import { isPublicTool } from '../lib/publicTools';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onNavigateRoute?: (slug: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  onNavigateRoute,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = [
    {
      title: 'Image Suite',
      tools: [
        { id: 'compressor' as ToolType, label: 'Image Compressor', icon: <Minimize2 className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'target-kb-compressor' as ToolType, label: 'Reduce KB Size', icon: <Minimize2 className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'passport-photo-maker' as ToolType, label: 'Passport Photo Maker', icon: <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'add-name-and-dob' as ToolType, label: 'Add Name & DOB', icon: <Calendar className="size-4 text-blue-600 dark:text-blue-400" /> },
        { id: 'signature-resizer' as ToolType, label: 'Resize Signature', icon: <PenTool className="size-4 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'image-dpi-converter' as ToolType, label: 'Convert DPI (300 DPI)', icon: <Sliders className="size-4 text-purple-600 dark:text-purple-400" /> },
        { id: 'converter' as ToolType, label: 'Format Converter', icon: <RefreshCw className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'resizer' as ToolType, label: 'Resize & Crop', icon: <Crop className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'circle-crop' as ToolType, label: 'Circle Crop', icon: <Crop className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'merge-photo-signature' as ToolType, label: 'Merge Photo & Sign', icon: <Layers className="size-4 text-amber-600 dark:text-amber-400" /> },
        { id: 'palette' as ToolType, label: 'Color Extractor', icon: <Palette className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'meme' as ToolType, label: 'Meme Generator', icon: <Smile className="size-4 text-emerald-600 dark:text-emerald-400" /> },
      ],
    },
    {
      title: 'Video Tools',
      tools: [
        { id: 'video-trimmer' as ToolType, label: 'Video Trimmer', icon: <Video className="size-4 text-blue-600 dark:text-blue-400" /> },
        { id: 'aspect-ratio-resizer' as ToolType, label: 'Aspect Ratio 9:16', icon: <Crop className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'video-to-audio' as ToolType, label: 'Video to MP3 Audio', icon: <Music className="size-4 text-purple-600 dark:text-purple-400" /> },
        { id: 'audio-cutter' as ToolType, label: 'Audio Cutter / Ringtone', icon: <Scissors className="size-4 text-rose-600 dark:text-rose-400" /> },
        { id: 'thumbnail-grabber' as ToolType, label: 'Thumbnail Grabber', icon: <ImageIcon className="size-4 text-amber-600 dark:text-amber-400" /> },
        { id: 'social-video-downloader' as ToolType, label: 'Social Video Downloader', icon: <Video className="size-4 text-blue-600 dark:text-blue-400" /> },
        { id: 'video-format-swapper' as ToolType, label: 'MOV to MP4 Swapper', icon: <RefreshCw className="size-4 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'gif-maker' as ToolType, label: 'Video to Animated GIF', icon: <Sparkles className="size-4 text-amber-600 dark:text-amber-400" /> },
        { id: 'video-to-gif' as ToolType, label: 'Frame Extractor', icon: <Film className="size-4 text-sky-600 dark:text-sky-400" /> },
      ],
    },
    {
      title: 'PDF Suite',
      tools: [
        { id: 'pdf-to-word' as ToolType, label: 'PDF to Word (.docx)', icon: <FileText className="size-4 text-rose-600 dark:text-rose-400" /> },
        { id: 'pdf-to-ppt' as ToolType, label: 'PDF to PowerPoint (.pptx)', icon: <FileText className="size-4 text-amber-600 dark:text-amber-400" /> },
        { id: 'word-to-pdf' as ToolType, label: 'Word to PDF', icon: <FileText className="size-4 text-rose-600 dark:text-rose-400" /> },
        { id: 'excel-to-pdf' as ToolType, label: 'Excel to PDF', icon: <FileText className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'ppt-to-pdf' as ToolType, label: 'PowerPoint to PDF', icon: <FileText className="size-4 text-amber-600 dark:text-amber-400" /> },
        { id: 'html-to-pdf' as ToolType, label: 'HTML to PDF', icon: <Code className="size-4 text-blue-600 dark:text-blue-400" /> },
        { id: 'pdf-to-excel' as ToolType, label: 'PDF to Excel / CSV', icon: <FileText className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'pdf-to-markdown' as ToolType, label: 'PDF to Markdown', icon: <FileText className="size-4 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'pdf-ocr' as ToolType, label: 'PDF OCR Text Extractor', icon: <Wand2 className="size-4 text-purple-600 dark:text-purple-400" /> },
        { id: 'pdf-compare' as ToolType, label: 'Compare 2 PDFs', icon: <FileText className="size-4 text-sky-600 dark:text-sky-400" /> },
        { id: 'pdf-merger' as ToolType, label: 'Merge PDF Documents', icon: <FilePlus className="size-4 text-rose-600 dark:text-rose-400" /> },
        { id: 'pdf-splitter' as ToolType, label: 'Split PDF Pages', icon: <Scissors className="size-4 text-rose-600 dark:text-rose-400" /> },
        { id: 'images-to-pdf' as ToolType, label: 'Images to PDF', icon: <FileText className="size-4 text-rose-600 dark:text-rose-400" /> },
        { id: 'pdf-password-remover' as ToolType, label: 'Remove PDF Password', icon: <Unlock className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'pdf-compressor' as ToolType, label: 'Compress PDF File', icon: <Minimize2 className="size-4 text-rose-600 dark:text-rose-400" /> },
      ],
    },
    {
      title: 'Archives & Vault',
      tools: [
        { id: 'zip-archiver' as ToolType, label: 'Zip Archiver', icon: <Archive className="size-4 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'zip-extractor' as ToolType, label: 'Zip Extractor', icon: <FolderArchive className="size-4 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'zip-password-remover' as ToolType, label: 'Unlock Zip File', icon: <Unlock className="size-4 text-emerald-600 dark:text-emerald-400" /> },
        { id: 'file-encryptor' as ToolType, label: 'AES-256 File Encryptor', icon: <Lock className="size-4 text-indigo-600 dark:text-indigo-400" /> },
      ],
    },
  ];

  const searchResults = searchQuery.trim()
    ? PROGRAMMATIC_ROUTES.filter((r) =>
        r.h1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.metaDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 backdrop-blur-md transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onNavigateRoute) onNavigateRoute('');
              setActivePage('home');
            }}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
          >
            <div className="p-2 rounded-2xl bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs group-hover:scale-105 transition-transform">
              <Wrench className="size-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight block leading-none">
                Browser<span className="text-emerald-600 dark:text-emerald-400">Kit</span>
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 block tracking-wider uppercase mt-0.5">
                Studio PRO
              </span>
            </div>
          </button>
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 30+ browser utilities (e.g. compress pdf, heic to jpg)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-h-80 overflow-y-auto space-y-1 z-50 animate-fade-in">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
                Matching Tools ({searchResults.length})
              </div>
              {searchResults.map((res) => (
                <button
                  key={res.slug}
                  onClick={() => {
                    if (onNavigateRoute) onNavigateRoute(res.slug);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{res.h1}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{res.metaDescription}</div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                    /{res.slug}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation Category Links */}
        <nav className="hidden md:flex items-center gap-1">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="relative"
              onMouseEnter={() => setActiveDropdown(cat.title)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer">
                <span>{cat.title}</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </button>

              {/* Dropdown Card */}
              {activeDropdown === cat.title && (
                <div className="absolute top-full left-0 mt-1 w-64 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-fade-in">
                  <div className="flex flex-col gap-1">
                    {cat.tools.filter((t) => isPublicTool(t.id)).map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          if (onNavigateRoute) onNavigateRoute('');
                          setActivePage(tool.id);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          activePage === tool.id
                            ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tool.icon}
                        <span className="truncate">{tool.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              if (onNavigateRoute) onNavigateRoute('');
              setActivePage('guides');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activePage === 'guides'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Guides
          </button>
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2">
          {/* Privacy Indicator Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border border-slate-800 dark:border-slate-700 shadow-xs select-none whitespace-nowrap">
            <Lock className="size-3.5 text-emerald-400 shrink-0" />
            <span>Zero Uploads</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex flex-col gap-3 animate-fade-in max-h-[80vh] overflow-y-auto">
          {categories.map((cat) => ({ ...cat, tools: cat.tools.filter((tool) => isPublicTool(tool.id)) })).map((cat) => (
            <div key={cat.title} className="flex flex-col gap-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">
                {cat.title}
              </div>
              {cat.tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (onNavigateRoute) onNavigateRoute('');
                    setActivePage(tool.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                    activePage === tool.id
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tool.icon}
                  <span className="truncate">{tool.label}</span>
                </button>
              ))}
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
            <button
              onClick={() => {
                if (onNavigateRoute) onNavigateRoute('');
                setActivePage('guides');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              SEO Guides & Tutorials
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
