import React, { useState, useEffect } from 'react';
import { 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  TrendingDown, 
  Film,
  MessageCircle,
  Instagram,
  Music2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultComparison({ 
  originalFile, 
  fileMetadata,
  result, 
  preset,
  onReset,
  onOpenTikTokGuide
}) {
  const [activeTab, setActiveTab] = useState('result'); // 'result' | 'original'

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const originalSize = originalFile?.size || 1;
  const compressedSize = result?.size || 1;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercent = Math.min(99, Math.max(0, Math.round((savedBytes / originalSize) * 100)));
  const isImageResult = result?.blob?.type?.startsWith('image/');

  const handleDownload = () => {
    if (!result?.url) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.name || (isImageResult ? 'foto_profil_hd.jpg' : 'video_kompres_hd.mp4');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareWhatsApp = async () => {
    // 1. Download file otomatis ke perangkat
    handleDownload();

    // 2. Coba Web Share API dengan file langsung (membuka native share sheet Android/iOS)
    if (result?.blob && navigator.canShare) {
      try {
        const fileToShare = new File(
          [result.blob], 
          result.name || (isImageResult ? 'foto_profil_hd.jpg' : 'video_kompres_hd.mp4'), 
          { type: result.blob.type || (isImageResult ? 'image/jpeg' : 'video/mp4') }
        );
        if (navigator.canShare({ files: [fileToShare] })) {
          await navigator.share({
            files: [fileToShare],
            title: 'Kirim ke WhatsApp',
            text: 'Video HD siap untuk Status WhatsApp!'
          });
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('Web Share API fallback:', err);
      }
    }

    // 3. Fallback aman tanpa broken parameter (mencegah error "Tautan tidak ditemukan")
    alert('✅ File sudah otomatis terunduh ke Galeri / Download HP Anda!\n\nLangkah pasang Status WhatsApp HD:\n1. Buka aplikasi WhatsApp\n2. Masuk ke tab Pembaruan / Status\n3. Buat status baru dan pilih video yang baru didownload.');

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = 'whatsapp://';
    } else {
      window.open('https://web.whatsapp.com', '_blank');
    }
  };

  const handleShareInstagram = async () => {
    // 1. Download file otomatis ke perangkat
    handleDownload();

    // 2. Web Share API jika didukung (pilihan Story / Reels di share dialog HP)
    if (result?.blob && navigator.canShare) {
      try {
        const fileToShare = new File(
          [result.blob], 
          result.name || (isImageResult ? 'foto_profil_hd.jpg' : 'video_kompres_hd.mp4'), 
          { type: result.blob.type || (isImageResult ? 'image/jpeg' : 'video/mp4') }
        );
        if (navigator.canShare({ files: [fileToShare] })) {
          await navigator.share({
            files: [fileToShare],
            title: 'Kirim ke Instagram',
            text: 'Video HD siap untuk Story / Reels Instagram!'
          });
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('Web Share Instagram fallback:', err);
      }
    }

    // 3. Fallback: Buka Instagram
    alert('✅ File sudah otomatis terunduh ke Galeri / Download HP Anda!\n\nBuka aplikasi Instagram > Buat Story atau Reels > Pilih video dari galeri.');
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = 'instagram://app';
    } else {
      window.open('https://www.instagram.com', '_blank');
    }
  };

  return (
    <div className="w-full rounded-xl border-3 border-slate-900 bg-white p-5 sm:p-8 space-y-6 shadow-[4px_4px_0px_0px_#111827] transition-all overflow-hidden min-w-0 animate-in fade-in duration-200">
      {/* Success Badge Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-slate-300 w-full min-w-0">
        <div className="flex items-center gap-3 text-center sm:text-left min-w-0 flex-1">
          <div className="w-12 h-12 rounded-lg bg-[#d0fae5] border-2 border-slate-900 text-emerald-950 flex items-center justify-center shadow-[2px_2px_0px_0px_#111827] shrink-0">
            <CheckCircle2 className="w-7 h-7 text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-xl sm:text-2xl text-slate-900 truncate uppercase tracking-wide">
              Kompresi Selesai dengan Sempurna!
            </h3>
            <p className="text-xs font-bold text-slate-500 truncate">
              Preset: <strong className="text-slate-900 font-black">{preset?.name || 'Kustom'}</strong>
            </p>
          </div>
        </div>

        {/* Savings Badge */}
        {savedPercent > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#d0fae5] border-2 border-slate-900 text-emerald-950 rounded-md shadow-[2px_2px_0px_0px_#111827] shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[2.5] text-emerald-700" />
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-black block text-emerald-900">Hemat Ukuran</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-950">-{savedPercent}% Lebih Ringan</span>
            </div>
          </div>
        )}
      </div>

      {/* File Details Bar */}
      <div className="p-3.5 rounded-lg border-2 border-slate-900 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0 w-full shadow-[2px_2px_0px_0px_#111827]">
        <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-[#ffe4e6] border-2 border-slate-900 text-rose-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#111827] shrink-0">
            <Film className="w-4 h-4 text-slate-900" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 w-full">
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-500 shrink-0">Hasil:</span>
              <p className="text-xs font-black truncate min-w-0 flex-1 text-slate-900" title={result?.name || 'video_kompres_hd.mp4'}>
                {result?.name || 'video_kompres_hd.mp4'}
              </p>
            </div>
            {originalFile?.name && (
              <p className="text-[11px] font-bold text-slate-500 truncate min-w-0" title={originalFile.name}>
                Asli: <span className="font-mono text-slate-700">{originalFile.name}</span>
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#d0fae5] text-emerald-950 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#111827]">
          Siap Download
        </span>
      </div>

      {/* Metrics Cards: Original vs Result */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full min-w-0">
        <div className="p-3.5 rounded-lg border-2 border-slate-900 bg-slate-50 min-w-0 shadow-[2px_2px_0px_0px_#111827]">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1 truncate">
            Ukuran Asli
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-400 line-through truncate font-mono">
            {formatBytes(originalSize)}
          </p>
        </div>

        <div className="p-3.5 rounded-lg border-2 border-slate-900 bg-[#fef08a] text-slate-900 min-w-0 shadow-[2px_2px_0px_0px_#111827]">
          <span className="text-[10px] font-black uppercase tracking-wider block mb-1 truncate text-slate-800">
            Ukuran Hasil
          </span>
          <p className="text-base sm:text-lg font-black font-mono truncate text-slate-950">
            {formatBytes(compressedSize)}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-lg border-2 border-slate-900 bg-[#d0fae5] text-emerald-950 min-w-0 shadow-[2px_2px_0px_0px_#111827]">
          <span className="text-[10px] font-black uppercase tracking-wider block mb-1 truncate text-emerald-900">
            Total Dihemat
          </span>
          <p className="text-base sm:text-lg font-black font-mono truncate text-emerald-950">
            {formatBytes(savedBytes)}
          </p>
        </div>
      </div>

      {/* View Switcher (Hasil vs Asli) */}
      {!isImageResult && (
        <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-100 rounded-lg border-2 border-slate-900 max-w-xs mx-auto text-xs font-black shadow-[2px_2px_0px_0px_#111827] w-full">
          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`flex-1 py-2 px-3 rounded-md transition-all uppercase tracking-wider truncate cursor-pointer ${
              activeTab === 'result'
                ? 'bg-[#fef08a] text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#111827]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            ✨ Hasil Kompres
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('original')}
            className={`flex-1 py-2 px-3 rounded-md transition-all uppercase tracking-wider truncate cursor-pointer ${
              activeTab === 'original'
                ? 'bg-white text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#111827]'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            📁 Video Asli
          </button>
        </div>
      )}

      {/* Preview Player */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[360px] sm:max-h-[420px] mx-auto flex items-center justify-center border-3 border-slate-900 shadow-[3px_3px_0px_0px_#111827] w-full">
        {isImageResult ? (
          <img
            src={result.url}
            alt="Hasil Foto Profil HD 1:1"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            key={activeTab}
            src={activeTab === 'result' ? result.url : URL.createObjectURL(originalFile)}
            controls
            playsInline
            autoPlay
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Ultra HD Verification Banner */}
      {!isImageResult ? (
        preset?.id === 'tiktok' ? (
          <div className="p-4 bg-[#fdf2f8] border-2 border-slate-900 rounded-xl text-xs text-rose-950 font-bold flex items-start gap-3 shadow-[2px_2px_0px_0px_#111827]">
            <span className="text-2xl shrink-0 mt-0.5">🎵</span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <strong className="font-heading text-sm text-rose-950 uppercase tracking-wide">
                  Video TikTok HD Siap Diunggah!
                </strong>
                {onOpenTikTokGuide && (
                  <button
                    type="button"
                    onClick={onOpenTikTokGuide}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-900 shadow-[1px_1px_0px_0px_#111827]"
                  >
                    <Music2 className="w-3.5 h-3.5" />
                    Panduan Upload Ekstensi
                  </button>
                )}
              </div>
              <p className="text-[11px] text-rose-900 leading-snug">
                <strong>ATURAN MUTLAK:</strong> JANGAN upload lewat aplikasi TikTok HP langsung karena server TikTok otomatis mengompres paksa jadi 720p 30fps! Gunakan browser <strong>Quetta, Lemur, atau Kiwi</strong> dengan ekstensi <strong>Nullsanz TikTok Studio</strong> aktif di Mode Desktop.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-[#d0fae5] border-2 border-slate-900 rounded-lg text-xs text-emerald-950 font-bold flex items-start gap-3 shadow-[2px_2px_0px_0px_#111827]">
            <span className="text-xl shrink-0 mt-0.5">🚀</span>
            <div className="flex-1 min-w-0">
              <strong className="font-heading text-sm text-emerald-950 block uppercase tracking-wide">
                Video Ultra HD Siap untuk Status WA &amp; Story IG!
              </strong>
              <p className="text-[11px] text-emerald-900 leading-snug mt-0.5">
                Encoding libx264 High Profile, faststart atom, dan tuned bitrate aktif. Kualitas video terjaga tajam dan 100% bebas pecah saat diunggah ke WhatsApp, Instagram Story, maupun TikTok.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="p-3.5 bg-[#cffafe] border-2 border-slate-900 rounded-lg text-xs text-cyan-950 font-bold flex items-start gap-3 shadow-[2px_2px_0px_0px_#111827]">
          <span className="text-xl shrink-0 mt-0.5">✨</span>
          <div className="flex-1 min-w-0">
            <strong className="font-heading text-sm text-cyan-950 block uppercase tracking-wide">
              Foto Profil 1:1 HD Siap Pakai!
            </strong>
            <p className="text-[11px] text-cyan-900 leading-snug mt-0.5">
              Resolusi 1080x1080 bujur sangkar dengan filter Lanczos Pre-Sharpening siap dijadikan foto profil WhatsApp tanpa terpotong atau buram.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons: Download, WhatsApp Share, Instagram Share, TikTok Guide, Reset */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full min-w-0">
        <div className="tetris-btn-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownload}
            className="tetris-btn-clip w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="truncate">Download ({formatBytes(compressedSize)})</span>
          </button>
        </div>

        {preset?.id === 'tiktok' && onOpenTikTokGuide && (
          <div className="tetris-btn-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenTikTokGuide}
              className="tetris-btn-clip w-full sm:w-auto px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider bg-black hover:bg-slate-800 text-rose-300 border-2 border-slate-900 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#111827]"
              title="Buka panduan upload TikTok HD tanpa kompresi"
            >
              <Music2 className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">Panduan Upload TikTok</span>
            </button>
          </div>
        )}

        <div className="tetris-btn-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="tetris-btn-clip w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider bg-[#10b981] hover:bg-[#059669] text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
            title="Download dan buka WhatsApp untuk langsung dijadikan Status / Chat"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Kirim ke WA</span>
          </button>
        </div>

        <div className="tetris-btn-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={handleShareInstagram}
            className="tetris-btn-clip w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
            title="Download dan buka Instagram untuk Story / Reels"
          >
            <Instagram className="w-4 h-4 shrink-0" />
            <span className="truncate">Kirim ke IG</span>
          </button>
        </div>

        <div className="tetris-btn-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="tetris-btn-clip w-full sm:w-auto px-4 py-3 text-xs font-black uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="truncate">Kompres Lagi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
