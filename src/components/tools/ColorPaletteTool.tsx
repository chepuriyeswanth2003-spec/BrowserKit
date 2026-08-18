import React, { useState, useRef } from 'react';
import { Dropzone } from '../Dropzone';
import { TOOL_METADATA } from '../../lib/seoData';
import { ColorSwatch } from '../../types';
import {
  extractColorPalette,
  generateFaviconPackZip,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
} from '../../lib/colorPaletteExtractor';
import { Palette, Copy, Check, Pipette, Archive, Download, Sparkles } from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';
import { ToolPageShell } from './ToolPageShell';

interface ColorPaletteToolProps {
  onDownloadTrigger: (filename?: string) => void;
}

export const ColorPaletteTool: React.FC<ColorPaletteToolProps> = ({ onDownloadTrigger }) => {
  const meta = TOOL_METADATA.palette;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<ColorSwatch[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Eyedropper Loupe state
  const [hoveredColor, setHoveredColor] = useState<{
    hex: string;
    rgb: string;
    hsl: string;
    cmyk: string;
  } | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    trackEvent('palette_file_uploaded', { name: file.name });

    const src = URL.createObjectURL(file);
    setImageSrc(src);

    const extracted = await extractColorPalette(src, 6);
    setSwatches(extracted);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    setMousePos({ x: e.clientX, y: e.clientY });

    // Draw image onto canvas to sample pixel color
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const pixelX = Math.floor(x * scaleX);
    const pixelY = Math.floor(y * scaleY);

    const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data;
    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    setHoveredColor({
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    });
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleDownloadFaviconPack = async () => {
    if (!imageSrc) return;
    const zipBlob = await generateFaviconPackZip(imageSrc);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'browserkit_favicon_pack.zip';
    a.click();
    URL.revokeObjectURL(url);
    onDownloadTrigger('browserkit_favicon_pack.zip');
  };

  return (
    <ToolPageShell
      categoryBadge="Color & Design"
      categoryBadgeColor="purple"
      title={meta.title}
      description={meta.subtitle}
      icon={<Palette className="w-6 h-6 text-[#6b4fa0] dark:text-[#6b4fa0]" />}
    >
      <div className="space-y-6">
        {!imageSrc ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            multiple={false}
            title="Upload image to inspect colors & extract palette"
            subtitle="Extract dominant swatches, copy HEX/RGB/CMYK codes, and build website Favicon icon packs."
          />
        ) : (
          <div className="space-y-8">
            {/* Eyedropper Photo Inspection Canvas */}
            <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
                <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white flex items-center gap-2">
                  <Pipette className="w-4 h-4 text-[#6b4fa0] dark:text-[#6b4fa0]" /> Interactive Eyedropper Pixel Inspector
                </h3>
                <span className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] font-medium">
                  Hover over image to inspect • Click to copy HEX
                </span>
              </div>

              <div className="relative flex items-center justify-center p-4 bg-white dark:bg-[#332e29] wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] overflow-hidden">
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Color inspection"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoveredColor(null)}
                  onClick={() => hoveredColor && handleCopyHex(hoveredColor.hex)}
                  className="max-h-96 w-auto object-contain cursor-crosshair wobbly-sm"
                />

                {/* Eyedropper Live Tooltip */}
                {hoveredColor && mousePos && (
                  <div
                    style={{
                      position: 'fixed',
                      left: mousePos.x + 15,
                      top: mousePos.y + 15,
                      pointerEvents: 'none',
                      zIndex: 50,
                    }}
                    className="p-3 wobbly-sm bg-[#2d2d2d] text-white shadow-hand-lg border border-[2px] border-[#2d2d2d] text-xs font-mono space-y-1 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 wobbly-pill border border-white/40 shadow-hand-sm"
                        style={{ backgroundColor: hoveredColor.hex }}
                      />
                      <span className="font-bold text-[#2f7a4f]">{hoveredColor.hex}</span>
                    </div>
                    <div className="text-[10px] text-[#2d2d2d]/[0.7]">{hoveredColor.rgb}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Swatches List */}
            <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
                <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#6b4fa0] dark:text-[#6b4fa0]" /> Extracted Color Palette ({swatches.length} Swatches)
                </h3>
                <button
                  onClick={handleDownloadFaviconPack}
                  className="px-4 py-2 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#2d2d2d] dark:hover:bg-[#2f7a4f] shadow-hand-sm transition-all cursor-pointer"
                >
                  <Archive className="w-4 h-4" /> Download Favicon Icon Pack
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {swatches.map((swatch, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopyHex(swatch.hex)}
                    className="group p-3 wobbly-md bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] space-y-2 cursor-pointer hover:shadow-hand transition-all"
                  >
                    <div
                      className="w-full h-20 wobbly-sm shadow-inner border border-black/10 flex items-end justify-end p-2 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: swatch.hex }}
                    >
                      <span className="p-1 wobbly-sm bg-black/40 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedHex === swatch.hex ? <Check className="w-3.5 h-3.5 text-[#2f7a4f]" /> : <Copy className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-center">
                      <div className="text-xs font-mono font-bold text-[#2d2d2d] dark:text-white">{swatch.hex}</div>
                      <div className="text-[10px] font-mono text-[#2d2d2d]/[0.7]">{swatch.population}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
