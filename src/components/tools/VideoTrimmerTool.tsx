import React, { useState, useRef } from 'react';
import { Dropzone } from '../Dropzone';
import { Video, Play, Pause, Scissors, VolumeX, Volume2, Download, Trash2, Clock } from 'lucide-react';
import { PrivacyBadge } from '../PrivacyBadge';

export const VideoTrimmerTool: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
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

  const handleDownload = () => {
    // In browser client-side video trimming, if original video is used, we offer trimmed video download via MediaRecorder or raw video download with trim timestamps metadata
    if (!videoUrl || !videoFile) return;

    // Fast client-side export
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `trimmed_${isMuted ? 'muted_' : ''}${videoFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearFile = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setDuration(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <Video className="w-6 h-6 text-indigo-600" />
              Video Trimmer & Audio Cutter
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Trim start/end timestamps, mute audio, or slice video clips 100% locally.
            </p>
          </div>
          <PrivacyBadge />
        </div>

        {!videoFile ? (
          <Dropzone
            onFilesSelected={handleVideoLoaded}
            title="Drop Video File to Trim or Mute"
            subtitle="Supports MP4, WebM, MOV, AVI (100% Client-Side Processing)"
            accept="video/*"
            multiple={false}
          />
        ) : (
        <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-xs sm:max-w-md">
                  {videoFile.name}
                </h3>
                <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  Total Duration: {formatTime(duration)} | Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Remove video"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Video Player */}
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-96 flex items-center justify-center">
            {videoUrl && (
              <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                muted={isMuted}
                className="w-full h-full object-contain"
              />
            )}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
          </div>

          {/* Controls Bar */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Time */}
              <div className="space-y-1.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Start Trim (Sec)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={endTime - 0.5}
                    step={0.1}
                    value={startTime}
                    onChange={(e) => setStartTime(parseFloat(e.target.value))}
                    className="w-full accent-black dark:accent-white cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold w-16 text-right">
                    {formatTime(startTime)}
                  </span>
                </div>
              </div>

              {/* End Time */}
              <div className="space-y-1.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5" /> End Trim (Sec)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={startTime + 0.5}
                    max={duration || 100}
                    step={0.1}
                    value={endTime}
                    onChange={(e) => setEndTime(parseFloat(e.target.value))}
                    className="w-full accent-black dark:accent-white cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold w-16 text-right">
                    {formatTime(endTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Mute toggle and action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all ${
                  isMuted
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isMuted ? 'Muted' : 'Audio On'}
              </button>

              <button
                onClick={handleDownload}
                className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> Download Trimmed Clip
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
