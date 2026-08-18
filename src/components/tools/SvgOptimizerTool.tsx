import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Code, Download, Copy, Check, Trash2 } from 'lucide-react';
import { ToolPageShell } from './ToolPageShell';

export const SvgOptimizerTool: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [cleanedSvg, setCleanedSvg] = useState<string>('');
  const [fileName, setFileName] = useState<string>('graphic.svg');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSvgSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    const text = await file.text();
    setSvgContent(text);
    optimizeSvgText(text);
  };

  const optimizeSvgText = (text: string) => {
    let cleaned = text
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\?xml[\s\S]*?\?>/i, '')
      .replace(/<!DOCTYPE[\s\S]*?>/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    setCleanedSvg(cleaned);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([cleanedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRasterizePng = () => {
    const blob = new Blob([cleanedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = (img.naturalWidth || 800) * 2;
      canvas.height = (img.naturalHeight || 800) * 2;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${fileName.replace('.svg', '')}_rasterized.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    };
  };

  const clearAll = () => {
    setSvgContent('');
    setCleanedSvg('');
  };

  return (
    <ToolPageShell
      categoryBadge="Vector & Code"
      categoryBadgeColor="cyan"
      title="SVG Vector Code Minifier & Optimizer"
      description="Strip comments, sanitize SVG markup, and reduce vector file sizes 100% in-browser."
      icon={<Code className="w-6 h-6 text-[#2d5da1]" />}
    >
      <div className="space-y-6">
        {!svgContent ? (
          <Dropzone
            onFilesSelected={handleSvgSelected}
            title="Drop SVG File to Clean & Minify Code"
            subtitle="Strip comments, optimize XML vector code, and rasterize to 2x PNG"
            accept=".svg,image/svg+xml"
            multiple={false}
          />
        ) : (
          <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 wobbly-sm bg-[#2d5da1] dark:bg-[#2d5da1]/60 text-[#2d5da1] dark:text-[#2d5da1]">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white truncate max-w-md">
                    {fileName}
                  </h3>
                  <p className="text-xs font-mono text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">
                    Original: {svgContent.length} chars | Optimized: {cleanedSvg.length} chars
                  </p>
                </div>
              </div>
              <button
                onClick={clearAll}
                className="p-2 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] hover:bg-[#ff4d4d] dark:hover:bg-[#ff4d4d]/40 transition-colors cursor-pointer"
                title="Clear SVG"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block">
                  Rendered Vector Preview
                </span>
                <div className="p-6 wobbly-sm bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] min-h-64 flex items-center justify-center overflow-hidden">
                  <div
                    dangerouslySetInnerHTML={{ __html: cleanedSvg }}
                    className="max-w-full max-h-64 flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-64 [&_svg]:h-auto"
                  />
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
                    Cleaned Minified Markup
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-xs font-mono font-bold flex items-center gap-1 text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] hover:text-[#2d5da1] dark:hover:text-[#2d5da1] cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Code!' : 'Copy SVG'}
                  </button>
                </div>
                <textarea
                  value={cleanedSvg}
                  onChange={(e) => setCleanedSvg(e.target.value)}
                  className="w-full h-64 p-3 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29] text-[11px] font-mono text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5da1] resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-end gap-3">
              <button
                onClick={handleRasterizePng}
                className="px-4 py-2.5 wobbly-sm text-xs font-bold uppercase tracking-wider bg-[#e5e0d8] dark:bg-[#332e29] text-[#2d2d2d] dark:text-white hover:bg-[#d8d2c4] dark:hover:bg-[#332e29] transition-all cursor-pointer"
              >
                Convert to High-DPI PNG
              </button>
              <button
                onClick={handleDownloadSvg}
                className="px-6 py-2.5 wobbly-sm text-xs font-bold uppercase tracking-wider bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] shadow-hand flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#2f7a4f] dark:text-white" /> Download Clean SVG
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
