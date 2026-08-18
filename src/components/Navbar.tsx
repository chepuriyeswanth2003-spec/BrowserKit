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
        { id: 'compressor' as ToolType, label: 'Image Compressor', icon: <Minimize2 className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'target-kb-compressor' as ToolType, label: 'Reduce KB Size', icon: <Minimize2 className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'passport-photo-maker' as ToolType, label: 'Passport Photo Maker', icon: <UserCheck className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'add-name-and-dob' as ToolType, label: 'Add Name & DOB', icon: <Calendar className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'signature-resizer' as ToolType, label: 'Resize Signature', icon: <PenTool className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'image-dpi-converter' as ToolType, label: 'Convert DPI (300 DPI)', icon: <Sliders className="size-4 text-[#6b4fa0] dark:text-[#6b4fa0]" /> },
        { id: 'converter' as ToolType, label: 'Format Converter', icon: <RefreshCw className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'resizer' as ToolType, label: 'Resize & Crop', icon: <Crop className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'circle-crop' as ToolType, label: 'Circle Crop', icon: <Crop className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'merge-photo-signature' as ToolType, label: 'Merge Photo & Sign', icon: <Layers className="size-4 text-[#b8860b] dark:text-[#b8860b]" /> },
        { id: 'palette' as ToolType, label: 'Color Extractor', icon: <Palette className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'meme' as ToolType, label: 'Meme Generator', icon: <Smile className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
      ],
    },
    {
      title: 'Video Tools',
      tools: [
        { id: 'video-trimmer' as ToolType, label: 'Video Trimmer', icon: <Video className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'aspect-ratio-resizer' as ToolType, label: 'Aspect Ratio 9:16', icon: <Crop className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'video-to-audio' as ToolType, label: 'Video to MP3 Audio', icon: <Music className="size-4 text-[#6b4fa0] dark:text-[#6b4fa0]" /> },
        { id: 'audio-cutter' as ToolType, label: 'Audio Cutter / Ringtone', icon: <Scissors className="size-4 text-[#ff4d4d] dark:text-[#ff4d4d]" /> },
        { id: 'thumbnail-grabber' as ToolType, label: 'Thumbnail Grabber', icon: <ImageIcon className="size-4 text-[#b8860b] dark:text-[#b8860b]" /> },
        { id: 'social-video-downloader' as ToolType, label: 'Social Video Downloader', icon: <Video className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'video-format-swapper' as ToolType, label: 'MOV to MP4 Swapper', icon: <RefreshCw className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'gif-maker' as ToolType, label: 'Video to Animated GIF', icon: <Sparkles className="size-4 text-[#b8860b] dark:text-[#b8860b]" /> },
        { id: 'video-to-gif' as ToolType, label: 'Frame Extractor', icon: <Film className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
      ],
    },
    {
      title: 'PDF Suite',
      tools: [
        { id: 'pdf-to-word' as ToolType, label: 'PDF to Word (.docx)', icon: <FileText className="size-4 text-[#ff4d4d] dark:text-[#ff4d4d]" /> },
        { id: 'pdf-to-ppt' as ToolType, label: 'PDF to PowerPoint (.pptx)', icon: <FileText className="size-4 text-[#b8860b] dark:text-[#b8860b]" /> },
        { id: 'word-to-pdf' as ToolType, label: 'Word to PDF', icon: <FileText className="size-4 text-[#ff4d4d] dark:text-[#ff4d4d]" /> },
        { id: 'excel-to-pdf' as ToolType, label: 'Excel to PDF', icon: <FileText className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'ppt-to-pdf' as ToolType, label: 'PowerPoint to PDF', icon: <FileText className="size-4 text-[#b8860b] dark:text-[#b8860b]" /> },
        { id: 'html-to-pdf' as ToolType, label: 'HTML to PDF', icon: <Code className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'pdf-to-excel' as ToolType, label: 'PDF to Excel / CSV', icon: <FileText className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'pdf-to-markdown' as ToolType, label: 'PDF to Markdown', icon: <FileText className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'pdf-ocr' as ToolType, label: 'PDF OCR Text Extractor', icon: <Wand2 className="size-4 text-[#6b4fa0] dark:text-[#6b4fa0]" /> },
        { id: 'pdf-compare' as ToolType, label: 'Compare 2 PDFs', icon: <FileText className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'pdf-merger' as ToolType, label: 'Merge PDF Documents', icon: <FilePlus className="size-4 text-[#ff4d4d] dark:text-[#ff4d4d]" /> },
        { id: 'pdf-splitter' as ToolType, label: 'Split PDF Pages', icon: <Scissors className="size-4 text-[#ff4d4d] dark:text-[#ff4d4d]" /> },
        { id: 'images-to-pdf' as ToolType, label: 'Images to PDF', icon: <FileText className="size-4 text-[#ff4d4d] dark:text-[#ff4d4d]" /> },
        { id: 'pdf-password-remover' as ToolType, label: 'Remove PDF Password', icon: <Unlock className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'pdf-compressor' as ToolType, label: 'Compress PDF File', icon: <Minimize2 className="size-4 text-[#ff4d4d] dark:text-[#ff4d4d]" /> },
      ],
    },
    {
      title: 'Archives & Vault',
      tools: [
        { id: 'zip-archiver' as ToolType, label: 'Zip Archiver', icon: <Archive className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'zip-extractor' as ToolType, label: 'Zip Extractor', icon: <FolderArchive className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
        { id: 'zip-password-remover' as ToolType, label: 'Unlock Zip File', icon: <Unlock className="size-4 text-[#2f7a4f] dark:text-[#2f7a4f]" /> },
        { id: 'file-encryptor' as ToolType, label: 'AES-256 File Encryptor', icon: <Lock className="size-4 text-[#2d5da1] dark:text-[#2d5da1]" /> },
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
    <header className="sticky top-0 z-40 w-full border-b-[3px] border-[#2d2d2d] dark:border-[#f3ede2] bg-[#fdfbf7] dark:bg-[#262220] transition-colors">
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
            <div className="p-2 wobbly-sm bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand-sm group-hover:-rotate-3 transition-transform">
              <Wrench className="size-5" />
            </div>
            <div>
              <span className="font-bold text-xl text-[#2d2d2d] dark:text-[#f3ede2] tracking-tight block leading-none">
                Browser<span className="text-[#ff4d4d]">Kit</span>
              </span>
              <span className="text-[10px] font-mono font-semibold text-[#2d2d2d]/70 dark:text-[#f3ede2]/60 block tracking-wider uppercase mt-0.5">
                Studio PRO
              </span>
            </div>
          </button>
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="size-4 text-[#2d2d2d]/50 dark:text-[#f3ede2]/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 30+ browser utilities (e.g. compress pdf, heic to jpg)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-9 pr-4 py-2 wobbly-pill bg-white dark:bg-[#2d2822] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] text-xs text-[#2d2d2d] dark:text-[#f3ede2] placeholder-[#2d2d2d]/40 dark:placeholder-[#f3ede2]/40 focus:outline-none focus:border-[#2d5da1] transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2d2d2d]/50 dark:text-[#f3ede2]/50 hover:text-[#2d2d2d] dark:hover:text-[#f3ede2]"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 wobbly-md bg-white dark:bg-[#2d2822] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand max-h-80 overflow-y-auto space-y-1 z-50 animate-fade-in">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2d2d2d]/70 dark:text-[#f3ede2]/60 px-2 py-1">
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
                  className="w-full text-left p-2.5 wobbly-sm hover:bg-[#fff9c4] dark:hover:bg-[#3a352f] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-[#2d2d2d] dark:text-[#f3ede2]">{res.h1}</div>
                    <div className="text-[11px] text-[#2d2d2d]/70 dark:text-[#f3ede2]/60 truncate max-w-xs">{res.metaDescription}</div>
                  </div>
                  <span className="text-[10px] font-mono text-[#2d5da1] bg-[#e5e0d8] dark:bg-[#3a352f] px-2 py-0.5 wobbly-pill border-[1px] border-[2px] border-[#2d2d2d]/30 dark:border-[#f3ede2]/30 shrink-0">
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
              <button className="px-3 py-2 wobbly-sm text-xs font-bold text-[#2d2d2d] dark:text-[#f3ede2] hover:bg-[#fff9c4] dark:hover:bg-[#3a352f] transition-colors flex items-center gap-1 cursor-pointer">
                <span>{cat.title}</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </button>

              {/* Dropdown Card */}
              {activeDropdown === cat.title && (
                <div className="absolute top-full left-0 mt-1 w-64 p-2 wobbly-md bg-white dark:bg-[#2d2822] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand z-50 animate-fade-in">
                  <div className="flex flex-col gap-1">
                    {cat.tools.filter((t) => isPublicTool(t.id)).map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          if (onNavigateRoute) onNavigateRoute('');
                          setActivePage(tool.id);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 wobbly-sm text-xs font-medium transition-colors cursor-pointer ${
                          activePage === tool.id
                            ? 'bg-[#ff4d4d] text-white font-bold border-[2px] border-[#2d2d2d] dark:border-[#f3ede2]'
                            : 'text-[#2d2d2d] dark:text-[#f3ede2] hover:bg-[#fff9c4] dark:hover:bg-[#3a352f]'
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
            className={`px-3 py-2 wobbly-sm text-xs font-medium transition-colors cursor-pointer ${
              activePage === 'guides'
                ? 'bg-[#ff4d4d] text-white font-bold border-[2px] border-[#2d2d2d] dark:border-[#f3ede2]'
                : 'text-[#2d2d2d] dark:text-[#f3ede2] hover:bg-[#fff9c4] dark:hover:bg-[#3a352f]'
            }`}
          >
            Guides
          </button>
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2">
          {/* Privacy Indicator Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 wobbly-pill text-xs font-mono font-bold bg-[#2d2d2d] text-[#fdfbf7] dark:bg-[#f3ede2] dark:text-[#f3ede2] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand-sm select-none whitespace-nowrap">
            <Lock className="size-3.5 text-[#ff4d4d] shrink-0" />
            <span>Zero Uploads</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 wobbly-sm bg-white dark:bg-[#2d2822] text-[#2d2d2d] dark:text-[#f3ede2] border-[2px] border-[#2d2d2d] dark:border-[#f3ede2] shadow-hand-sm hover:bg-[#fff9c4] dark:hover:bg-[#3a352f] transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-[3px] border-[#2d2d2d] dark:border-[#f3ede2] bg-[#fdfbf7] dark:bg-[#262220] px-4 py-3 flex flex-col gap-3 animate-fade-in max-h-[80vh] overflow-y-auto">
          {categories.map((cat) => ({ ...cat, tools: cat.tools.filter((tool) => isPublicTool(tool.id)) })).map((cat) => (
            <div key={cat.title} className="flex flex-col gap-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2d2d2d]/70 dark:text-[#f3ede2]/60 px-2">
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
                  className={`w-full flex items-center gap-3 px-3 py-2 wobbly-sm text-xs font-medium text-left transition-colors cursor-pointer ${
                    activePage === tool.id
                      ? 'bg-[#ff4d4d] text-white font-bold border-[2px] border-[#2d2d2d] dark:border-[#f3ede2]'
                      : 'text-[#2d2d2d] dark:text-[#f3ede2] hover:bg-[#fff9c4] dark:hover:bg-[#3a352f]'
                  }`}
                >
                  {tool.icon}
                  <span className="truncate">{tool.label}</span>
                </button>
              ))}
            </div>
          ))}

          <div className="pt-2 border-t-2 border-dashed border-[#2d2d2d]/30 dark:border-[#f3ede2]/30 flex flex-col gap-1">
            <button
              onClick={() => {
                if (onNavigateRoute) onNavigateRoute('');
                setActivePage('guides');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-[#2d2d2d] dark:text-[#f3ede2] hover:bg-[#fff9c4] dark:hover:bg-[#3a352f] wobbly-sm cursor-pointer"
            >
              SEO Guides & Tutorials
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
