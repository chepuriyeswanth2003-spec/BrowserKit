import React, { useState, useRef } from 'react';
import { Dropzone } from '../Dropzone';
import { Video, Play, Pause, VolumeX, Volume2, Download, Trash2, Loader2 } from 'lucide-react';
import { ToolPageShell } from './ToolPageShell';
import { ffmpegTrimVideo } from '../../lib/ffmpegEngine';

export const VideoTrimmerTool: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isTrimming, setIsTrimming] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoaded = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(10, dur));
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
          videoRef.current.currentTime = startTime;
        }
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);
      if (curr >= endTime) {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime = startTime;
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  const [progress, setProgress] = useState<number>(0);

  const handleDownload = async () => {
    if (!videoFile) return;
    setIsTrimming(true);
    setProgress(0);

    try {
      const blob = await ffmpegTrimVideo(
        videoFile,
        startTime,
        endTime,
        (ratio) => setProgress(Math.round(ratio * 100)),
        isMuted
      );
      const url = URL.createObjectURL(blob);
      const ext = blob.type.includes('mp4') ? 'mp4' : videoFile.name.split('.').pop() || 'mp4';
      const a = document.createElement('a');
      a.href = url;
      a.download = `trimmed_${isMuted ? 'muted_' : ''}${videoFile.name.replace(/\.[^/.]+$/, '')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsTrimming(false);
    } catch (err) {
      console.error('Trim failed:', err);
      setIsTrimming(false);
    }
  };

  const clearFile = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setDuration(0);
    setIsPlaying(false);
  };

  return (
    <ToolPageShell
      categoryBadge="Video Suite"
      categoryBadgeColor="blue"
      title="Video Trimmer & Audio Cutter"
      description="Trim start/end timestamps, mute audio, or slice video clips 100% locally."
      icon={<Video className="w-6 h-6 text-[#2d5da1]" />}
    >
      {!videoFile ? (
        <Dropzone
          onFilesSelected={handleVideoLoaded}
          title="Drop Video File to Trim or Mute"
          subtitle="Supports MP4, WebM, MOV, AVI (100% Client-Side Processing)"
          accept="video/*"
          multiple={false}
        />
      ) : (
        <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 wobbly-sm bg-[#2d5da1] dark:bg-[#2d5da1]/60 text-[#2d5da1] dark:text-[#2d5da1] border border-[2px] border-[#2d5da1] dark:border-[#2d5da1]">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white truncate max-w-xs sm:max-w-md">
                  {videoFile.name}
                </h3>
                <p className="text-xs font-mono text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55]">
                  Duration: {formatTime(duration)} | Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] dark:hover:text-[#ff4d4d] hover:bg-[#ff4d4d] dark:hover:bg-[#ff4d4d]/40 transition-colors cursor-pointer"
              title="Remove File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Video Player */}
          <div className="relative wobbly-md overflow-hidden bg-black flex items-center justify-center max-h-96 shadow-hand">
            <video
              ref={videoRef}
              src={videoUrl || undefined}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              muted={isMuted}
              className="max-h-96 w-auto mx-auto"
            />
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 wobbly-pill bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
          </div>

          {/* Timeline Trimmer Controls */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55]">
              <span>Current: {formatTime(currentTime)}</span>
              <span>Selection: {formatTime(startTime)} — {formatTime(endTime)} ({formatTime(endTime - startTime)})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] flex items-center justify-between">
                  <span>Start Timestamp</span>
                  <span className="font-mono text-[#2d2d2d]/[0.7]">{formatTime(startTime)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, endTime - 0.5)}
                  step={0.1}
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setStartTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] flex items-center justify-between">
                  <span>End Timestamp</span>
                  <span className="font-mono text-[#2d2d2d]/[0.7]">{formatTime(endTime)}</span>
                </label>
                <input
                  type="range"
                  min={startTime + 0.5}
                  max={duration || 100}
                  step={0.1}
                  value={endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setEndTime(val);
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Mute toggle and action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`px-4 py-2.5 wobbly-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-[#2d2d2d] text-white dark:bg-white dark:text-[#f3ede2] border-transparent'
                    : 'bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isMuted ? 'Muted' : 'Audio On'}
              </button>

              <button
                onClick={handleDownload}
                disabled={isTrimming}
                className="px-6 py-3 wobbly-sm text-xs font-bold uppercase tracking-wider bg-[#2d2d2d] hover:bg-[#2d2d2d] dark:bg-[#2f7a4f] dark:hover:bg-[#2f7a4f] text-white shadow-hand flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isTrimming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-[#2f7a4f] dark:text-white" />}
                {isTrimming ? `Processing Trim${progress > 0 ? ` (${progress}%)` : '...'}` : 'Download Trimmed Clip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolPageShell>
  );
};
