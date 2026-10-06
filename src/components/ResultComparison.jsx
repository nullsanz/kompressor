import React, { useState, useEffect } from 'react';
import { 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  TrendingDown, 
  Film,
  MessageCircle,
  Instagram,
  Music2,
  Sparkles,
  Sliders,
  ArrowRight,
  FolderPlus,
  Forward,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultComparison({ 
  originalFile, 
  fileMetadata,
  result, 
  preset,
  onReset,
  onResetNewFile,
  onChangePreset,
  onOpenTikTokGuide
}) {
  const [activeTab, setActiveTab] = useState('result'); // 'result' | 'original'
  const [showWAGuideModal, setShowWAGuideModal] = useState(false);

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

  const handleShareWhatsApp = () => {
    // Tampilkan panduan trik rahasia forward bypass terlebih dahulu agar tidak kena re-encode di WhatsApp
    setShowWAGuideModal(true);
  };

  const handleExecuteShareWhatsApp = async () => {
    setShowWAGuideModal(false);
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
            title: 'Kirim ke WhatsApp (Pilih Chat Sendiri)',
            text: '💡 Kirim ke Chat Sendiri, lalu klik Teruskan (Forward ➡️) ke Status Saya agar bebas kompresi editing!'
          });
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('Web Share API fallback:', err);
      }
    }

    // 3. Fallback jika browser desktop atau tanpa Web Share API
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

    // 2. Web Share API jika didukung
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

  // Quick preset shortcuts list for the same footage
  const PRESET_SHORTCUTS = [
    { id: 'khususwa', label: 'Status WA 1080p', icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> },
    { id: 'hdrwa', label: 'WA Kinclong (Luminescence)', icon: <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" /> },
    { id: 'khususig30k', label: 'Story IG 30k 60FPS', icon: <Instagram className="w-3.5 h-3.5 text-purple-700 shrink-0" /> },
    { id: 'tiktok', label: 'TikTok 9:16 Anti-Blur', icon: <Music2 className="w-3.5 h-3.5 text-rose-700 shrink-0" /> },
    { id: '720p', label: 'Hemat Kuota 720p', icon: <Film className="w-3.5 h-3.5 text-blue-700 shrink-0" /> },
    { id: 'pphd', label: 'Foto Profil 1:1', icon: <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" /> },
  ];

  const handleTriggerChangePreset = (newPresetId = null) => {
    if (onChangePreset) {
      onChangePreset(newPresetId);
    } else if (onReset) {
      onReset();
    }
  };

  const handleTriggerResetNew = () => {
    if (onResetNewFile) {
      onResetNewFile();
    } else if (onReset) {
      onReset();
    }
  };

  return (
    <div className="w-full rounded-2xl border-3 border-slate-900 bg-white p-5 sm:p-8 space-y-6 shadow-[5px_5px_0px_0px_#111827] transition-all overflow-hidden min-w-0 animate-in fade-in duration-200">
      
      {/* Success Badge Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-slate-300 w-full min-w-0">
        <div className="flex items-center gap-3 text-center sm:text-left min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl bg-[#d0fae5] border-2 border-slate-900 text-emerald-950 flex items-center justify-center shadow-[2px_2px_0px_0px_#111827] shrink-0">
            <CheckCircle2 className="w-7 h-7 text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-xl sm:text-2xl text-slate-900 truncate uppercase tracking-wide">
              Kompresi Selesai dengan Sempurna!
            </h3>
            <p className="text-xs font-bold text-slate-500 truncate">
              Preset Aktif: <strong className="text-slate-900 font-black">{preset?.name || 'Kustom'}</strong>
            </p>
          </div>
        </div>

        {/* Savings Badge */}
        {savedPercent > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#d0fae5] border-2 border-slate-900 text-emerald-950 rounded-lg shadow-[2px_2px_0px_0px_#111827] shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[2.5] text-emerald-700" />
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-black block text-emerald-900">Hemat Ukuran</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-950">-{savedPercent}% Lebih Ringan</span>
            </div>
          </div>
        )}
      </div>

      {/* File Details Bar */}
      <div className="p-3.5 rounded-xl border-2 border-slate-900 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0 w-full shadow-[2px_2px_0px_0px_#111827]">
        <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#ffe4e6] border-2 border-slate-900 text-rose-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#111827] shrink-0">
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

        {/* Size Stat Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-slate-900 bg-white font-mono text-xs font-black shadow-[1.5px_1.5px_0px_0px_#111827] shrink-0 self-end sm:self-auto">
          <span className="text-slate-400 line-through text-[11px]">{formatBytes(originalSize)}</span>
          <span className="text-slate-400">➔</span>
          <span className="text-emerald-700 text-sm">{formatBytes(compressedSize)}</span>
        </div>
      </div>

      {/* Comparison Tabs (Hasil vs Asli) */}
      <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 border-2 border-slate-900 rounded-xl max-w-xs mx-auto shadow-[2px_2px_0px_0px_#111827]">
        <button
          type="button"
          onClick={() => setActiveTab('result')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'result'
              ? 'bg-slate-900 text-white shadow-[1px_1px_0px_0px_#111827]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hasil Kompres ({formatBytes(compressedSize)})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('original')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'original'
              ? 'bg-slate-900 text-white shadow-[1px_1px_0px_0px_#111827]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Asli ({formatBytes(originalSize)})
        </button>
      </div>

      {/* Video / Photo Preview Container */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[360px] sm:max-h-[440px] mx-auto flex items-center justify-center border-3 border-slate-900 shadow-[4px_4px_0px_0px_#111827]">
        {isImageResult ? (
          <img
            src={activeTab === 'result' ? result.url : URL.createObjectURL(originalFile)}
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
                <strong>ATURAN MUTLAK:</strong> JANGAN upload lewat aplikasi TikTok HP biasa karena server TikTok otomatis mengompres paksa jadi 720p 30fps! Gunakan browser <strong>Quetta, Lemur, atau Kiwi</strong> dengan ekstensi <strong>Nullsanz TikTok Studio</strong> aktif di Mode Desktop.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-[#d0fae5] border-2 border-slate-900 rounded-xl text-xs text-emerald-950 font-bold flex items-start gap-3 shadow-[2px_2px_0px_0px_#111827]">
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
        <div className="p-3.5 bg-[#cffafe] border-2 border-slate-900 rounded-xl text-xs text-cyan-950 font-bold flex items-start gap-3 shadow-[2px_2px_0px_0px_#111827]">
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

      {/* QUICK PRESET SWITCH BAR (FOOTAGE SAMA) */}
      <div className="p-4 sm:p-5 rounded-2xl border-3 border-slate-900 bg-[#fef08a] shadow-[4px_4px_0px_0px_#111827] space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#111827] shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-400" />
            </div>
            <div>
              <h4 className="font-heading text-sm uppercase tracking-wide text-slate-900 leading-tight">
                Mau Kompres Footage Ini ke Format Lain?
              </h4>
              <p className="text-[11px] font-bold text-amber-950">
                Gunakan video yang sama langsung tanpa repot upload ulang!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTriggerChangePreset()}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_#111827] cursor-pointer self-stretch sm:self-auto"
            title="Kembali ke pemilihan preset dengan video ini"
          >
            <Sliders className="w-3.5 h-3.5 text-rose-600" />
            <span>Atur Ulang Preset</span>
          </button>
        </div>

        {/* 1-Click Quick Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {PRESET_SHORTCUTS.filter(p => p.id !== preset?.id).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleTriggerChangePreset(p.id)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              {p.icon}
              <span>{p.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons: Download, WhatsApp Share, Instagram Share, TikTok Guide, Reset */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full min-w-0">
        
        {/* Download Button */}
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

        {/* TikTok Guide Button if TikTok preset */}
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

        {/* WhatsApp Share Button */}
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

        {/* Instagram Share Button */}
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

        {/* Change Preset (Same Footage) */}
        <div className="tetris-btn-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTriggerChangePreset()}
            className="tetris-btn-clip w-full sm:w-auto px-4 py-3 text-xs font-black uppercase tracking-wider bg-[#fef08a] hover:bg-[#fde047] text-slate-900 border-2 border-slate-900 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            title="Ganti preset kompresi menggunakan footage yang sama"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate">Ganti Preset (File Sama)</span>
          </button>
        </div>

        {/* Upload New File Button */}
        <div className="tetris-btn-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={handleTriggerResetNew}
            className="tetris-btn-clip w-full sm:w-auto px-4 py-3 text-xs font-black uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            title="Pilih file video atau foto lain dari perangkat"
          >
            <FolderPlus className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="truncate">Pilih File Baru</span>
          </button>
        </div>

      </div>

      {/* WhatsApp Status Forward Bypass Guide Modal */}
      {showWAGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border-3 border-slate-900 rounded-2xl p-5 shadow-[6px_6px_0px_0px_#111827] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border-2 border-slate-900 flex items-center justify-center text-emerald-800">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Trik Status WA 1080p</h3>
                  <p className="text-[11px] font-bold text-emerald-700">Bypass Kompresi Halaman Editing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWAGuideModal(false)}
                className="p-1 rounded-lg border-2 border-slate-900 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-3">
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-900 font-medium">
                <p className="font-black text-amber-950 flex items-center gap-1.5 mb-1">
                  ⚠️ JANGAN LANGSUNG PILIH "STATUS SAYA"!
                </p>
                Jika langsung pilih Status Saya di daftar WhatsApp, WA akan membuka halaman editing preview dan mengompres ulang video lu jadi buram.
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-black uppercase text-slate-700">Langkah Rahasia (Anti-Pecah 100%):</p>
                
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                  <div className="text-xs text-slate-800">
                    <strong className="block text-slate-900 font-black">Kirim ke Chat Sendiri</strong>
                    Saat daftar WhatsApp terbuka, pilih <strong>Chat Nomor Sendiri</strong> (Pesan ke diri sendiri / <em>You</em>) atau chat teman/grup.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                  <div className="text-xs text-slate-800">
                    <strong className="block text-slate-900 font-black">Tekan Tombol "Teruskan" (Forward)</strong>
                    Buka ruang chat tersebut, lalu klik icon tanda panah <strong>Teruskan (➡️)</strong> pada video yang baru dikirim.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                  <div className="text-xs text-slate-800">
                    <strong className="block text-slate-900 font-black">Pilih "Status Saya"</strong>
                    Centang <strong>Status Saya</strong> lalu kirim. Halaman editing dilewati 100% dan video terbit jernih murni tanpa re-encode!
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t-2 border-slate-900 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleExecuteShareWhatsApp}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 border-2 border-slate-900 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#111827] flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <Forward className="w-4 h-4" />
                <span>Buka WhatsApp Sekarang</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWAGuideModal(false);
                  handleDownload();
                }}
                className="py-3 px-4 bg-white hover:bg-slate-100 border-2 border-slate-900 rounded-xl text-slate-800 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#111827] cursor-pointer"
              >
                Download Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
