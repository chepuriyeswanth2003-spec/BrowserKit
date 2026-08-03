import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Film, Image as ImageIcon, Download, Loader2, Trash2 } from 'lucide-react';
import { extractVideoFrames } from '../../lib/videoProcessor';
import { PrivacyBadge } from '../PrivacyBadge';

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
    <div className="space-y-6">
      {!videoFile ? (
        <Dropzone
          onFilesSelected={handleVideoSelected}
          title="Drop Video File to Extract Photo Frames"
          subtitle="Supports MP4, WebM, MOV (High-Resolution Frame Snapshots)"
          accept="video/*"
          multiple={false}
        />
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-md">
                  {videoFile.name}
                </span>
              </div>
              <button
                onClick={clearAll}
                className="text-xs text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
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
                  className="w-full accent-black dark:accent-white cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Max Frame Count: {maxFrames} Snapshots
                </label>
                <input
                  type="range"
                  min={4}
                  max={24}
                  step={2}
                  value={maxFrames}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMaxFrames(val);
                    if (videoFile) processExtract(videoFile, sampleFps, val);
                  }}
                  className="w-full accent-black dark:accent-white cursor-pointer"
                />
              </div>
            </div>
          </div>

          {isProcessing ? (
            <div className="p-12 text-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-700 dark:text-neutral-300" />
              <p className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400">
                Extracting high-resolution canvas frames from video...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {frames.map((frame, index) => (
                <div
                  key={`frame-${index}`}
                  className="group relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 shadow-xs transition-all hover:scale-[1.02]"
                >
                  <img
                    src={frame.dataUrl}
                    alt={`Frame ${index + 1}`}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-2 bg-white dark:bg-neutral-900 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] font-mono font-bold text-neutral-500">
                      {frame.timestamp.toFixed(1)}s
                    </span>
                    <button
                      onClick={() => handleDownloadSingle(frame.dataUrl, index)}
                      className="p-1.5 rounded-md bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity"
                      title="Download frame PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <PrivacyBadge />
    </div>
  );
};
