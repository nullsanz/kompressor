import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import Navbar from './components/Navbar';
import FileDropzone from './components/FileDropzone';
import VideoTrimmer from './components/VideoTrimmer';
import PresetSelector from './components/PresetSelector';
import CustomSettings from './components/CustomSettings';
import ProgressCard from './components/ProgressCard';
import ResultComparison from './components/ResultComparison';
import Footer from './components/Footer';

import { PRESETS, getPresetById } from './constants/presets';
import { getFFmpegInstance, processVideo, processPPHD, processInstantPatch } from './services/ffmpegEngine';

export default function App() {
  // Engine States
  const [engineStatus, setEngineStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  
  // File & Config States
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [trimRange, setTrimRange] = useState({ start: 0, end: 30, duration: 30 });
  const [selectedPresetId, setSelectedPresetId] = useState('hdrbrutalsilau');
  const [liveStats, setLiveStats] = useState({ fps: '', speed: '' });
  const [customSettings, setCustomSettings] = useState({
    crf: 23,
    preset: 'veryfast',
    resolution: '1080p',
    fps: 'asli',
    audioBitrate: '64k',
    scaleFilter: "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'"
  });

  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [logs, setLogs] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState(null);

  // Result State
  const [result, setResult] = useState(null);

  const timerRef = useRef(null);

  // Pre-load FFmpeg Engine gracefully in background
  useEffect(() => {
    let mounted = true;
    setEngineStatus('loading');
    getFFmpegInstance(
      (msg) => {},
      ({ progress }) => {}
    )
      .then(() => {
        if (mounted) setEngineStatus('ready');
      })
      .catch((err) => {
        console.warn('Preload WASM background notice:', err.message);
        if (mounted) setEngineStatus('ready'); // will retry on demand
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleFileSelected = (file, metadata) => {
    setSelectedFile(file);
    setFileMetadata(metadata);
    setError(null);
    setResult(null);

    // Default trim range
    if (metadata.type === 'video' && metadata.duration > 0) {
      const defaultEnd = Math.min(metadata.duration, 60);
      setTrimRange({
        start: 0,
        end: defaultEnd,
        duration: metadata.duration
      });
      // Jika HEVC (H.265), otomatis pilih 'fastpatch' untuk Layar Silau EDR 4000 Nits
      if (metadata.isHevc) {
        setSelectedPresetId('fastpatch');
      } else {
        setSelectedPresetId('hdrbrutalsilau');
      }
    } else {
      setSelectedPresetId('pphd');
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileMetadata(null);
    setResult(null);
    setError(null);
  };

  const appendLog = (message) => {
    setLogs(prev => [...prev.slice(-80), message]);
  };

  const handleStartCompression = async () => {
    if (!selectedFile) return;

    // Guard: Mencegah user menjalankan fastpatch pada video H.264
    if (selectedPresetId === 'fastpatch' && fileMetadata?.type === 'video' && !fileMetadata?.isHevc) {
      setError(
        'Format video ini adalah H.264 (bukan HEVC). Layar HP (iPhone & Android AMOLED) hanya memicu peningkatan kecerahan Layar Silau EDR (4000 Nits) pada format HEVC / H.265. Silakan export video Anda dari CapCut dengan memilih Codec "H.265 / HEVC", atau pilih preset "TikTok JJ Ultra HD 60 FPS" untuk kompresi biasa.'
      );
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    setElapsedSeconds(0);
    setLiveStats({ fps: '', speed: '' });
    setStatusText('Mempersiapkan engine WebAssembly...');

    // Start Timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);

    try {
      const activePreset = getPresetById(selectedPresetId) || { id: 'custom', name: 'Mode Kustom' };
      const isImage = fileMetadata?.type === 'image';
      let res = null;

      if (selectedPresetId === 'fastpatch') {
        // Mode Instan Patch Dolby Vision Profile 8.4 (0 Detik / Tanpa Render)
        setStatusText('Menyuntikkan atom Dolby Vision Profile 8.4 ke file MP4...');
        res = await processInstantPatch({
          file: selectedFile,
          onProgress: ({ ratio, text }) => {
            if (typeof ratio === 'number') setProgress(ratio);
            if (text) setStatusText(text);
          },
          onLog: (msg) => {
            appendLog(msg);
          }
        });
      } else if (selectedPresetId === 'pphd' && (isImage || fileMetadata?.type === 'video')) {
        // Foto Profil WA 1:1
        setStatusText('Memproses foto profil 1080x1080 Lanczos Pre-Sharpening...');
        res = await processPPHD({
          file: selectedFile,
          isVideo: fileMetadata?.type === 'video',
          onProgress: ({ ratio, progress, text }) => {
            const p = typeof ratio === 'number' ? ratio : (typeof progress === 'number' ? progress : 0);
            setProgress(p);
            if (text) setStatusText(text);
          },
          onLog: (msg) => {
            appendLog(msg);
          }
        });
      } else {
        // Video Compression
        setStatusText('Mengompres video dengan libx264...');
        res = await processVideo({
          file: selectedFile,
          preset: activePreset,
          customSettings,
          trimRange,
          totalDuration: fileMetadata?.duration || 0,
          onProgress: ({ ratio, progress, text, fps, speed }) => {
            const currentRatio = typeof ratio === 'number' ? ratio : (typeof progress === 'number' ? progress : 0);
            if (currentRatio >= 0 && currentRatio <= 1) {
              setProgress(currentRatio);
            }
            if (fps || speed) {
              setLiveStats({ fps: fps || '', speed: speed || '' });
            }
            if (text) {
              setStatusText(text);
            } else {
              const pct = Math.round(currentRatio * 100);
              let status = `Sedang merender video (${pct}%)...`;
              if (fps) status += ` • ${fps} FPS`;
              if (speed) status += ` • Speed ${speed}`;
              setStatusText(status);
            }
          },
          onLog: (msg) => {
            appendLog(msg);
          }
        });
      }

      setResult(res);
      setStatusText('Selesai!');
      setProgress(1);
    } catch (err) {
      console.error('[Compression Error]', err);
      setError(err.message || 'Terjadi kesalahan saat memproses video.');
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsProcessing(false);
    }
  };

  const activePresetObj = getPresetById(selectedPresetId) || { id: 'custom', name: 'Mode Kustom' };

  return (
    <div className="min-h-screen flex flex-col font-sans tetris-grid-bg text-slate-900 selection:bg-[#fef08a] selection:text-slate-900">
      {/* Navigation Bar */}
      <Navbar engineStatus={engineStatus} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 min-w-0">
        
        {/* Hero Section */}
        {!selectedFile && !result && (
          <div className="text-center space-y-4 max-w-4xl mx-auto pt-2 sm:pt-6 animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#ffe4e6] text-rose-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>FFmpeg WebAssembly • Identik Setting Bot WA 100%</span>
            </div>

            <h2 className="font-heading text-4xl sm:text-6xl text-slate-900 tracking-wide uppercase leading-tight">
              Kompres Video Status WA &amp; Story IG <br />
              <span className="bg-[#fef08a] px-3 py-0.5 border-3 border-slate-900 rounded-md shadow-[3px_3px_0px_0px_#111827] inline-block">
                Ultra HD &amp; Dolby Vision 8.4 Silau
              </span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-medium max-w-2xl mx-auto">
              Bypass algoritma kompresi WhatsApp, Instagram &amp; TikTok langsung di browser Anda. Monster bitrate 30 Mbps, 60 FPS murni, injeksi Dolby Vision Profile 8.4 EDR (Layar Silau), dan 100% diproses di perangkat lokal tanpa upload ke server.
            </p>

            {/* Badges Strip (Blocky arcade style) */}
            <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap text-xs font-black uppercase">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fef08a] border-2 border-slate-900 text-amber-950 rounded-md shadow-[2px_2px_0px_0px_#111827]">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Dolby Vision 8.4 (Layar Silau)</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#cffafe] border-2 border-slate-900 text-cyan-950 rounded-md shadow-[2px_2px_0px_0px_#111827]">
                <Zap className="w-4 h-4 text-cyan-700" />
                <span>Instan Patch 0 Detik</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f3e8ff] border-2 border-slate-900 text-purple-950 rounded-md shadow-[2px_2px_0px_0px_#111827]">
                <CheckCircle2 className="w-4 h-4 text-purple-700" />
                <span>Story IG 15M &amp; 30k</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffe4e6] border-2 border-slate-900 text-rose-950 rounded-md shadow-[2px_2px_0px_0px_#111827]">
                <CheckCircle2 className="w-4 h-4 text-rose-700" />
                <span>TikTok 30 Mbps Monster</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d0fae5] border-2 border-slate-900 text-emerald-950 rounded-md shadow-[2px_2px_0px_0px_#111827]">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Status WA Pseudo-HDR</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dbeafe] border-2 border-slate-900 text-blue-950 rounded-md shadow-[2px_2px_0px_0px_#111827]">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>100% Privasi Lokal</span>
              </span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-[#ffe4e6] border-2 border-slate-900 text-rose-950 text-xs sm:text-sm font-black flex items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#111827]">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-700" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="font-black text-xs text-rose-900 hover:text-black cursor-pointer uppercase underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Stage 1: Upload Dropzone */}
        {!isProcessing && !result && (
          <div className="w-full max-w-5xl mx-auto">
            <FileDropzone
              selectedFile={selectedFile}
              fileMetadata={fileMetadata}
              onFileSelected={handleFileSelected}
              onClearFile={handleClearFile}
            />
          </div>
        )}

        {/* Stage 2: Configuration & Preview (When File is Selected) */}
        {!isProcessing && !result && selectedFile && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full min-w-0">
            
            {/* Left Column: Trimmer / Video Player Preview */}
            <div className="lg:col-span-5 space-y-5 w-full min-w-0">
              {fileMetadata?.type === 'video' ? (
                <VideoTrimmer
                  videoUrl={fileMetadata.previewUrl}
                  duration={fileMetadata.duration}
                  trimRange={trimRange}
                  onTrimChange={setTrimRange}
                />
              ) : (
                /* Photo Preview for PPHD */
                <div className="p-5 rounded-2xl border-2 border-slate-900 bg-white shadow-[3px_3px_0px_0px_#111827] text-center space-y-4 w-full min-w-0">
                  <h4 className="font-black text-sm text-slate-900 flex items-center justify-center gap-2 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 shrink-0 text-cyan-600" />
                    <span>Pratinjau Foto Profil 1:1</span>
                  </h4>
                  <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border-2 border-dashed border-slate-900 p-1 bg-slate-50 shadow-[2px_2px_0px_0px_#111827]">
                    <img
                      src={fileMetadata?.previewUrl}
                      alt="Pratinjau Foto"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-600">
                    Foto akan di-crop otomatis bujur sangkar 1080x1080 dengan filter penajaman Lanczos.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Preset Chooser & Action */}
            <div className="lg:col-span-7 space-y-5 w-full min-w-0">
              {/* Preset Selector */}
              <PresetSelector
                selectedPresetId={selectedPresetId}
                onSelectPreset={setSelectedPresetId}
                isImageFile={fileMetadata?.type === 'image'}
              />

              {/* Custom Settings Panel (If selected) */}
              {selectedPresetId === 'custom' && (
                <CustomSettings
                  customSettings={customSettings}
                  onSettingsChange={setCustomSettings}
                />
              )}

              {/* Action Submit Button */}
              <div className="pt-2 w-full min-w-0">
                <button
                  type="button"
                  onClick={handleStartCompression}
                  className="tetris-btn tetris-btn--brand w-full py-4 px-6 text-sm sm:text-base font-black flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_0px_#111827] hover:shadow-[4px_4px_0px_0px_#111827] active:shadow-none"
                >
                  <Zap className="w-5 h-5 fill-slate-900 shrink-0" />
                  <span className="truncate max-w-full">
                    Mulai Kompresi {activePresetObj.name}
                  </span>
                  <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
                </button>

                <p className="text-center text-xs font-bold text-slate-500 mt-2.5">
                  ⚡ Diproses instan oleh WebAssembly di browser Anda tanpa antrean server
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: Processing Loading State */}
        {isProcessing && (
          <div className="w-full max-w-xl mx-auto">
            <ProgressCard
              progress={progress}
              statusText={statusText}
              logs={logs}
              elapsedSeconds={elapsedSeconds}
              liveStats={liveStats}
            />
          </div>
        )}

        {/* Stage 4: Result & Comparison */}
        {!isProcessing && result && (
          <div className="w-full max-w-3xl mx-auto">
            <ResultComparison
              originalFile={selectedFile}
              fileMetadata={fileMetadata}
              result={result}
              preset={activePresetObj}
              onReset={() => {
                setResult(null);
                setSelectedFile(null);
                setFileMetadata(null);
              }}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
