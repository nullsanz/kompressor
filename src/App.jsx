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

import { PRESETS } from './constants/presets';
import { getFFmpegInstance, processVideo, processPPHD } from './services/ffmpegEngine';

export default function App() {
  // Engine States
  const [engineStatus, setEngineStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  
  // File & Config States
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [trimRange, setTrimRange] = useState({ start: 0, end: 30, duration: 30 });
  const [selectedPresetId, setSelectedPresetId] = useState('khususwa');
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
      setSelectedPresetId('khususwa');
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

    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    setElapsedSeconds(0);
    setStatusText('Mempersiapkan engine WebAssembly...');

    // Start Timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);

    try {
      const activePreset = PRESETS.find(p => p.id === selectedPresetId) || { id: 'custom', name: 'Mode Kustom' };
      const isImage = fileMetadata?.type === 'image';
      let res = null;

      if (selectedPresetId === 'pphd' && (isImage || fileMetadata?.type === 'video')) {
        // Foto Profil WA 1:1
        setStatusText('Memproses foto profil 1080x1080 Lanczos Pre-Sharpening...');
        res = await processPPHD({
          file: selectedFile,
          isVideo: fileMetadata?.type === 'video',
          onProgress: ({ progress }) => {
            setProgress(progress);
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
          onProgress: ({ progress }) => {
            if (progress > 0 && progress <= 1) {
              setProgress(progress);
              setStatusText(`Sedang merender video (${Math.round(progress * 100)}%)...`);
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

  const activePresetObj = PRESETS.find(p => p.id === selectedPresetId) || { id: 'custom', name: 'Mode Kustom' };

  return (
    <div className="min-h-screen flex flex-col font-sans tetris-grid-bg text-slate-900 selection:bg-rose-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar engineStatus={engineStatus} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 min-w-0">
        
        {/* Hero Section */}
        {!selectedFile && !result && (
          <div className="text-center space-y-4 max-w-3xl mx-auto pt-2 sm:pt-6 animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>FFmpeg WebAssembly • Identik Setting Bot WA 100%</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
              Kompres Video Status WA & Story IG <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500">
                Ultra HD Tanpa Buram
              </span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-medium max-w-2xl mx-auto">
              Bypass algoritma kompresi WhatsApp & Instagram langsung di browser Anda. Hasil tajam, 60 FPS halus, warna BT.709 anti-pudar, dan 100% diproses di perangkat lokal tanpa upload ke server.
            </p>

            {/* Badges Strip */}
            <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap text-xs font-bold">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Status WA 1080p</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Story IG 60 FPS</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                <span>TikTok 30 Mbps</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>100% Privasi Lokal</span>
              </span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="font-bold text-xs text-rose-800 hover:text-rose-950 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Stage 1: Upload Dropzone */}
        {!isProcessing && !result && (
          <div className="w-full max-w-3xl mx-auto">
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
                <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm text-center space-y-4 w-full min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-cyan-600" />
                    <span>Pratinjau Foto Profil 1:1</span>
                  </h4>
                  <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border-2 border-dashed border-slate-200 p-1 bg-slate-50">
                    <img
                      src={fileMetadata?.previewUrl}
                      alt="Pratinjau Foto"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-500">
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
                  className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl shadow-sm hover:shadow-md font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-white shrink-0" />
                  <span className="truncate max-w-full">
                    Mulai Kompresi {activePresetObj.name}
                  </span>
                  <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
                </button>

                <p className="text-center text-xs font-medium text-slate-500 mt-2.5">
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
            />
          </div>
        )}

        {/* Stage 4: Result & Comparison */}
        {!isProcessing && result && (
          <div className="w-full max-w-3xl mx-auto">
            <ResultComparison
              originalFile={selectedFile}
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
