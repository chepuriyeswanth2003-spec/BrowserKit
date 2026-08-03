import React, { useState, useEffect } from 'react';
import { Dropzone } from '../Dropzone';
import { PrivacyBadge } from '../PrivacyBadge';
import { AdSlot } from '../AdSlot';
import { TOOL_METADATA } from '../../lib/seoData';
import { MemeTemplate, TextLayer } from '../../types';
import { POPULAR_MEME_TEMPLATES, renderMemeCanvas } from '../../lib/memeGenerator';
import { Smile, Plus, Trash2, Download, Type, Sliders, Image as ImageIcon } from 'lucide-react';
import { trackEvent } from '../../lib/analyticsSentry';

interface MemeGeneratorToolProps {
  onDownloadTrigger: (filename?: string) => void;
}

export const MemeGeneratorTool: React.FC<MemeGeneratorToolProps> = ({
  onDownloadTrigger,
}) => {
  const meta = TOOL_METADATA.meme;
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(POPULAR_MEME_TEMPLATES[0]);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);

  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    {
      id: 't1',
      text: 'WHEN CODE COMPILES ON FIRST TRY',
      x: 50,
      y: 15,
      fontSize: 32,
      fontFamily: 'Impact',
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 4,
      isUppercase: true,
      shadowColor: '#000000',
      shadowBlur: 5,
      align: 'center',
    },
    {
      id: 't2',
      text: 'IT FEELS LIKE MAGIC',
      x: 50,
      y: 85,
      fontSize: 32,
      fontFamily: 'Impact',
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 4,
      isUppercase: true,
      shadowColor: '#000000',
      shadowBlur: 5,
      align: 'center',
    },
  ]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const currentImageSrc = customImageSrc || selectedTemplate.url;

  useEffect(() => {
    renderCurrentMeme();
  }, [currentImageSrc, textLayers]);

  const renderCurrentMeme = async () => {
    try {
      const res = await renderMemeCanvas(currentImageSrc, textLayers);
      setPreviewUrl(res.url);
    } catch (e) {
      console.error('Meme render error:', e);
    }
  };

  const handleCustomUpload = (files: File[]) => {
    if (files.length === 0) return;
    trackEvent('meme_custom_upload', { name: files[0].name });

    const src = URL.createObjectURL(files[0]);
    setCustomImageSrc(src);
  };

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: Math.random().toString(36).substring(2, 9),
      text: 'NEW TEXT HERE',
      x: 50,
      y: 50,
      fontSize: 30,
      fontFamily: 'Impact',
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 3,
      isUppercase: true,
      shadowColor: '#000000',
      shadowBlur: 4,
      align: 'center',
    };
    setTextLayers((prev) => [...prev, newLayer]);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const removeTextLayer = (id: string) => {
    setTextLayers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDownloadMeme = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `imagetoolkit_meme_${Date.now()}.png`;
    a.click();
    onDownloadTrigger('imagetoolkit_meme.png');
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {meta.title}
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
          {meta.subtitle}
        </p>
        <PrivacyBadge compact />
      </div>

      {/* Template Gallery Picker */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Select Template or Upload Photo
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_MEME_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                setSelectedTemplate(tmpl);
                setCustomImageSrc(null);
              }}
              className={`p-2 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                selectedTemplate.id === tmpl.id && !customImageSrc
                  ? 'border-orange-500 bg-orange-500/10 shadow-md ring-2 ring-orange-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/50'
              }`}
            >
              <img
                src={tmpl.url}
                alt={tmpl.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {tmpl.name}
              </span>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Dropzone
            onFilesSelected={handleCustomUpload}
            multiple={false}
            title="Upload Custom Meme Image"
            subtitle="Or drag your own photo here to create text overlay"
          />
        </div>
      </div>

      {/* Controls & Canvas Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Preview Canvas */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Smile className="w-4 h-4 text-orange-600" /> Meme Canvas Preview
            </h3>
            <button
              onClick={addTextLayer}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Text Layer
            </button>
          </div>

          <div className="w-full h-[450px] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Meme Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="text-xs text-slate-400">Rendering meme canvas...</div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleDownloadMeme}
              disabled={!previewUrl}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download High-Res PNG Meme
            </button>
          </div>
        </div>

        {/* Right Col: Text Layers Controls */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Type className="w-4 h-4 text-orange-600" /> Text Controls ({textLayers.length})
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {textLayers.map((layer, idx) => (
              <div
                key={layer.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Text #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeTextLayer(layer.id)}
                    className="text-rose-500 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={layer.text}
                  onChange={(e) => updateTextLayer(layer.id, { text: e.target.value })}
                  placeholder="Enter meme text"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold uppercase text-slate-900 dark:text-white"
                />

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block text-slate-500 mb-0.5">Vertical Y %</label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={layer.y}
                      onChange={(e) => updateTextLayer(layer.id, { y: parseInt(e.target.value) })}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-0.5">Font Size ({layer.fontSize})</label>
                    <input
                      type="range"
                      min="16"
                      max="72"
                      value={layer.fontSize}
                      onChange={(e) => updateTextLayer(layer.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Fill Color</label>
                    <input
                      type="color"
                      value={layer.fillColor}
                      onChange={(e) => updateTextLayer(layer.id, { fillColor: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer border-0"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Outline Color</label>
                    <input
                      type="color"
                      value={layer.strokeColor}
                      onChange={(e) => updateTextLayer(layer.id, { strokeColor: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer border-0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdSlot type="below-tool" />

      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {meta.faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {faq.question}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
