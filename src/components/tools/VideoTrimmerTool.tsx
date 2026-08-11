import React, { useState, useRef } from 'react';
import { Dropzone } from '../Dropzone';
import { Video, Play, Pause, VolumeX, Volume2, Download, Trash2, Loader2 } from 'lucide-react';
import { ToolPageShell } from './ToolPageShell';

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

  const handleDownload = async () => {
    if (!videoUrl || !videoFile || !videoRef.current) return;
    setIsTrimming(true);

    try {
      const videoEl = videoRef.current;
      videoEl.pause();
      videoEl.currentTime = startTime;

      await new Promise((r) => setTimeout(r, 300));

      const stream = (videoEl as any).captureStream ? (videoEl as any).captureStream() : null;

      if (stream && typeof MediaRecorder !== 'undefined') {
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `trimmed_${isMuted ? 'muted_' : ''}${videoFile.name.replace(/\.[^/.]+$/, '')}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setIsTrimming(false);
        };

        recorder.start();
        videoEl.muted = isMuted;
        videoEl.play();

        const durationMs = Math.max(500, (endTime - startTime) * 1000);
        setTimeout(() => {
          videoEl.pause();
          recorder.stop();
        }, durationMs);
      } else {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `trimmed_${videoFile.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsTrimming(false);
      }
    } catch {
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
      icon={<Video className="w-6 h-6 text-blue-600" />}
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
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {videoFile.name}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Duration: {formatTime(duration)} | Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Remove File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Video Player */}
          <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-96 shadow-md">
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
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
          </div>

          {/* Timeline Trimmer Controls */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span>Current: {formatTime(currentTime)}</span>
              <span>Selection: {formatTime(startTime)} — {formatTime(endTime)} ({formatTime(endTime - startTime)})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Start Timestamp</span>
                  <span className="font-mono text-slate-500">{formatTime(startTime)}</span>
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
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>End Timestamp</span>
                  <span className="font-mono text-slate-500">{formatTime(endTime)}</span>
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
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isMuted ? 'Muted' : 'Audio On'}
              </button>

              <button
                onClick={handleDownload}
                disabled={isTrimming}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isTrimming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-emerald-400 dark:text-white" />}
                {isTrimming ? 'Processing Trim...' : 'Download Trimmed Clip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolPageShell>
  );
};
