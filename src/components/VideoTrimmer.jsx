import React, { useRef, useEffect } from 'react';
import { Scissors, Play, Pause, Clock } from 'lucide-react';

export default function VideoTrimmer({ 
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
    <div className="w-full rounded-[4px] border-2 border-slate-900 bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#0f172a] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3 min-w-0 w-full">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-[4px] bg-rose-600 border-2 border-slate-900 text-white flex items-center justify-center shadow-[2px_2px_0px_#0f172a] shrink-0">
            <Scissors className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-sm uppercase tracking-wide text-slate-900 truncate">Pemotong Durasi</h3>
            <p className="text-[11px] font-semibold text-slate-500 truncate">Sesuaikan durasi Status WhatsApp atau Story</p>
          </div>
        </div>

        {/* Selected Duration Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 border-2 border-slate-900 text-rose-900 rounded-[4px] text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#0f172a] shrink-0">
          <Clock className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          <span>{trimmedDuration.toFixed(1)}s Dipilih</span>
        </div>
      </div>

      {/* Video Preview with Player */}
      <div className="relative rounded-[4px] overflow-hidden bg-black aspect-video max-h-[300px] sm:max-h-[360px] mx-auto flex items-center justify-center mb-4 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]">
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
          className="absolute inset-0 m-auto w-14 h-14 rounded-[4px] bg-rose-600 border-2 border-slate-900 text-white flex items-center justify-center shadow-[3px_3px_0px_#0f172a] transition-all hover:scale-105 active:scale-95 z-20 cursor-pointer"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
        </button>
      </div>

      {/* Quick Trim Preset Chips */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-xs font-black uppercase text-slate-500 shrink-0">Preset:</span>
        <button
          type="button"
          onClick={() => applyQuickPreset(30)}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-black uppercase tracking-wider border-2 border-slate-900 transition-all ${
            trimmedDuration <= 30.1 && trimRange.start === 0 && duration > 30
              ? 'bg-rose-600 text-white shadow-[2px_2px_0px_#0f172a]'
              : 'bg-white text-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_#0f172a]'
          }`}
        >
          ⚡ 0 - 30s (Status WA)
        </button>

        <button
          type="button"
          onClick={() => applyQuickPreset(60)}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-black uppercase tracking-wider border-2 border-slate-900 transition-all ${
            trimmedDuration <= 60.1 && trimmedDuration > 30.1 && trimRange.start === 0 && duration > 60
              ? 'bg-rose-600 text-white shadow-[2px_2px_0px_#0f172a]'
              : 'bg-white text-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_#0f172a]'
          }`}
        >
          ⚡ 0 - 60s (Story IG & WA)
        </button>

        <button
          type="button"
          onClick={() => applyQuickPreset(0)}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-black uppercase tracking-wider border-2 border-slate-900 transition-all ${
            trimmedDuration >= duration - 0.5 && trimRange.start === 0
              ? 'bg-slate-900 text-white shadow-[2px_2px_0px_#0f172a]'
              : 'bg-white text-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_#0f172a]'
          }`}
        >
          🎬 Penuh ({duration.toFixed(0)}s)
        </button>
      </div>

      {/* Range Slider Controls */}
      <div className="space-y-3 bg-slate-50 p-3.5 rounded-[4px] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-slate-600">Titik Mulai (Start):</span>
            <span className="font-mono text-rose-600 font-black">{formatSec(trimRange.start)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={trimRange.start}
            onChange={(e) => handleSeekToStart(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-[2px] cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-slate-600">Titik Selesai (End):</span>
            <span className="font-mono text-rose-600 font-black">{formatSec(trimRange.end || duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={trimRange.end || duration}
            onChange={(e) => handleSeekToEnd(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-[2px] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
