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
      icon={<Film className="w-6 h-6 text-[#2d5da1]" />}
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
          <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#2d5da1] dark:text-[#2d5da1]" />
                <span className="text-sm font-bold text-[#2d2d2d] dark:text-white truncate max-w-md">
                  {videoFile.name}
                </span>
              </div>
              <button
                onClick={clearAll}
                className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
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
                <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
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
                <Loader2 className="w-8 h-8 text-[#2d5da1] dark:text-[#2d5da1] animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">Decoding Video Frames...</p>
              </div>
            )}

            {!isProcessing && frames.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-4 border-t border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]">
                {frames.map((frame, index) => (
                  <div
                    key={index}
                    className="group relative wobbly-sm overflow-hidden border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29]"
                  >
                    <img
                      src={frame.dataUrl}
                      alt={`Frame ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1a1a1a]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <button
                        onClick={() => handleDownloadSingle(frame.dataUrl, index)}
                        className="p-2 wobbly-sm bg-[#2f7a4f] text-white hover:bg-[#2f7a4f] transition-colors shadow-hand cursor-pointer"
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
