import React, { useRef, useEffect } from 'react';
import { Scissors, Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';

export default function VideoTrimmer({ 
  isDark, 
  videoUrl, 
  duration, 
  trimRange, 
  onTrimChange 
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Loop playback inside trim range
      if (trimRange.end > 0 && video.currentTime >= trimRange.end) {
        video.currentTime = trimRange.start;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [trimRange]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      if (video.currentTime < trimRange.start || (trimRange.end > 0 && video.currentTime >= trimRange.end)) {
        video.currentTime = trimRange.start;
      }
      video.play();
      setIsPlaying(true);
    }
  };

  const handleSeekToStart = (val) => {
    const startVal = Math.max(0, Math.min(val, trimRange.end - 1));
    onTrimChange({ ...trimRange, start: startVal });
    if (videoRef.current) {
      videoRef.current.currentTime = startVal;
    }
  };

  const handleSeekToEnd = (val) => {
    const endVal = Math.min(duration, Math.max(val, trimRange.start + 1));
    onTrimChange({ ...trimRange, end: endVal });
  };

  const applyQuickPreset = (maxSec) => {
    if (maxSec === 0 || maxSec >= duration) {
      onTrimChange({ start: 0, end: duration, duration });
    } else {
      onTrimChange({ start: 0, end: maxSec, duration });
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const formatSec = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  const trimmedDuration = Math.max(0, (trimRange.end || duration) - trimRange.start);

  return (
    <div className={`w-full rounded-3xl border p-4 sm:p-5 transition-all ${
      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Pemotong Durasi (Trimmer)</h3>
            <p className="text-[11px] text-slate-400">Sesuaikan durasi Status WhatsApp atau Story</p>
          </div>
        </div>

        {/* Selected Duration Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full text-xs font-black">
          <Clock className="w-3.5 h-3.5" />
          <span>{trimmedDuration.toFixed(1)}s Dipilih</span>
        </div>
      </div>

      {/* Video Preview with Player */}
      <div className="relative rounded-2xl overflow-hidden bg-black/90 aspect-video max-h-[300px] sm:max-h-[360px] mx-auto flex items-center justify-center mb-4 border border-slate-800">
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          className="w-full h-full object-contain"
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
        
        {/* Play/Pause Overlay Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 transition-all hover:scale-110 active:scale-95 z-20 backdrop-blur-xs"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
        </button>
      </div>

      {/* Quick Trim Preset Chips */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-xs font-bold text-slate-400 shrink-0">Preset Cepat:</span>
        <button
          type="button"
          onClick={() => applyQuickPreset(30)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            trimmedDuration <= 30.1 && trimRange.start === 0 && duration > 30
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          ⚡ 0 - 30 Detik (Status WA)
        </button>

        <button
          type="button"
          onClick={() => applyQuickPreset(60)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            trimmedDuration <= 60.1 && trimmedDuration > 30.1 && trimRange.start === 0 && duration > 60
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          ⚡ 0 - 60 Detik (Story IG & WA Baru)
        </button>

        <button
          type="button"
          onClick={() => applyQuickPreset(0)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            trimmedDuration >= duration - 0.5 && trimRange.start === 0
              ? 'bg-slate-700 text-white border-slate-600'
              : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          🎬 Penuh ({duration.toFixed(0)}s)
        </button>
      </div>

      {/* Range Slider Controls */}
      <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-slate-400">Titik Mulai (Start):</span>
            <span className="font-mono text-rose-400">{formatSec(trimRange.start)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={trimRange.start}
            onChange={(e) => handleSeekToStart(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-rose-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-slate-400">Titik Selesai (End):</span>
            <span className="font-mono text-rose-400">{formatSec(trimRange.end || duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={trimRange.end || duration}
            onChange={(e) => handleSeekToEnd(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-rose-500"
          />
        </div>
      </div>
    </div>
  );
}
