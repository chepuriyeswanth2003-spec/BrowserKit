import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Film, Download, Loader2, Trash2 } from 'lucide-react';
import { extractVideoFrames } from '../../lib/videoProcessor';
import { ToolPageShell } from './ToolPageShell';

export const VideoFrameExtractorTool: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<{ timestamp: number; dataUrl: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sampleFps, setSampleFps] = useState<number>(1);
  const [maxFrames, setMaxFrames] = useState<number>(12);

  const handleVideoSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setVideoFile(file);
    await processExtract(file, sampleFps, maxFrames);
  };

  const processExtract = async (file: File, fps: number, maxCount: number) => {
    setIsProcessing(true);
    try {
      const extracted = await extractVideoFrames(file, fps, maxCount);
      setFrames(extracted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (dataUrl: string, idx: number) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `frame_${idx + 1}_${videoFile?.name || 'snapshot'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearAll = () => {
    setVideoFile(null);
    setFrames([]);
  };

  return (
    <ToolPageShell
      categoryBadge="Video Suite"
      categoryBadgeColor="indigo"
      title="Video Frame Extractor & Snapshots"
      description="Extract high-resolution video frame snapshots at any FPS rate 100% locally in your browser."
      icon={<Film className="w-6 h-6 text-indigo-600" />}
    >
      <div className="space-y-6">
        {!videoFile ? (
          <Dropzone
            onFilesSelected={handleVideoSelected}
            title="Drop Video File to Extract Snapshots"
            subtitle="Supports MP4, WebM, MOV. Convert video frames to PNG/JPG snapshots."
            accept="video/*"
            multiple={false}
          />
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
                  {videoFile.name}
                </span>
              </div>
              <button
                onClick={clearAll}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sampling FPS Rate: {sampleFps} FPS
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={sampleFps}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSampleFps(val);
                    if (videoFile) processExtract(videoFile, val, maxFrames);
                  }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Max Frame Limit: {maxFrames} Frames
                </label>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={maxFrames}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setMaxFrames(val);
                    if (videoFile) processExtract(videoFile, sampleFps, val);
                  }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {isProcessing && (
              <div className="py-8 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Decoding Video Frames...</p>
              </div>
            )}

            {!isProcessing && frames.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                {frames.map((frame, index) => (
                  <div
                    key={index}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <img
                      src={frame.dataUrl}
                      alt={`Frame ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <button
                        onClick={() => handleDownloadSingle(frame.dataUrl, index)}
                        className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-md cursor-pointer"
                        title="Download frame PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};
