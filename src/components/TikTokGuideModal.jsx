import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone, 
  Laptop, 
  Zap, 
  Copy, 
  Check,
  ShieldCheck,
  Music2
} from 'lucide-react';

export default function TikTokGuideModal({ isOpen, onClose }) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const githubUrl = 'https://github.com/nullsanz/tiktok';
  const downloadZipUrl = 'https://github.com/nullsanz/tiktok/archive/refs/heads/main.zip';
  const studioUrl = 'https://www.tiktok.com/tiktokstudio/upload';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(githubUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white border-3 border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_#111827] overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#ffe4e6] border-b-3 border-slate-900 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-rose-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-[1.5px_1.5px_0px_0px_#111827] shrink-0">
              <Music2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading text-lg sm:text-xl text-slate-900 uppercase tracking-wide truncate">
                Panduan Upload TikTok HD Anti-Kompres
              </h3>
              <p className="text-[11px] font-bold text-rose-950 truncate">
                Bypass Server TikTok via Ekstensi Nullsanz Studio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-[1.5px_1.5px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0 ml-2"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          
          {/* CRITICAL WARNING BANNER */}
          <div className="p-4 rounded-xl bg-[#fef08a] border-3 border-slate-900 shadow-[3px_3px_0px_0px_#111827] space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 fill-amber-300" />
              <span>ATURAN MUTLAK AGAR VIDEO TIDAK EROR &amp; TIDAK KEKOMPRES</span>
            </div>
            <p className="text-xs font-bold leading-relaxed text-amber-950">
              <strong>GUNAKAN BROWSER QUETTA, LEMUR, ATAU KIWI (DI ANDROID)</strong> DAN UPLOAD MELALUI <strong>TIKTOK STUDIO MODE DESKTOP</strong> YANG TERPASANG EKSTENSI NULLSANZ.
            </p>
            <p className="text-[11px] font-medium leading-relaxed text-amber-900">
              ⚠️ <em>Catatan:</em> Jika diunggah langsung dari aplikasi TikTok HP biasa, server TikTok otomatis mengompres video Anda jadi buram 720p 30 FPS dan merusak jedag-jedug 60 FPS.
            </p>
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href={downloadZipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-[#d0fae5] hover:bg-[#a7f3d0] border-2 border-slate-900 text-emerald-950 font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs uppercase"
            >
              <Download className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Download Ekstensi (.ZIP)</span>
            </a>

            <div className="flex items-center gap-2">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-3.5 rounded-xl bg-[#dbeafe] hover:bg-[#bfdbfe] border-2 border-slate-900 text-blue-950 font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs uppercase truncate"
              >
                <ExternalLink className="w-4 h-4 text-blue-800 shrink-0" />
                <span className="truncate">GitHub Nullsanz</span>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 font-black flex items-center justify-center shadow-[2px_2px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                title="Salin Link GitHub"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700" />}
              </button>
            </div>
          </div>

          {/* STEP BY STEP TUTORIAL */}
          <div className="space-y-3 pt-2">
            <h4 className="font-heading text-base sm:text-lg text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Langkah-Langkah Pemasangan &amp; Upload di HP / PC</span>
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 rounded-xl border-2 border-slate-900 bg-slate-50 space-y-1.5 shadow-[2px_2px_0px_0px_#111827]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#ffe4e6] border-2 border-slate-900 font-black text-xs text-rose-950 flex items-center justify-center shrink-0">
                  1
                </span>
                <strong className="text-slate-900 text-xs sm:text-sm font-black uppercase">
                  Download Ekstensi dari GitHub
                </strong>
              </div>
              <p className="text-xs font-bold text-slate-600 pl-8 leading-relaxed">
                Buka link repository <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-rose-600 underline font-black">github.com/nullsanz/tiktok</a>. Klik tombol hijau <strong>Code</strong> ➔ pilih <strong>Download ZIP</strong>, atau klik tombol <em>Download Ekstensi (.ZIP)</em> di atas.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl border-2 border-slate-900 bg-slate-50 space-y-1.5 shadow-[2px_2px_0px_0px_#111827]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#ffe4e6] border-2 border-slate-900 font-black text-xs text-rose-950 flex items-center justify-center shrink-0">
                  2
                </span>
                <strong className="text-slate-900 text-xs sm:text-sm font-black uppercase">
                  Siapkan Browser Khusus (Android / PC)
                </strong>
              </div>
              <div className="text-xs font-bold text-slate-600 pl-8 space-y-1.5 leading-relaxed">
                <div className="flex items-start gap-1.5">
                  <Smartphone className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pengguna HP Android:</strong> Pasang salah satu browser yang mendukung ekstensi Chrome di Google Play Store: <strong>Quetta Browser</strong> (Paling Direkomendasikan), <strong>Lemur Browser</strong>, atau <strong>Kiwi Browser</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Laptop className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pengguna Laptop / PC:</strong> Cukup gunakan Google Chrome, Microsoft Edge, atau Brave biasa.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl border-2 border-slate-900 bg-slate-50 space-y-1.5 shadow-[2px_2px_0px_0px_#111827]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#ffe4e6] border-2 border-slate-900 font-black text-xs text-rose-950 flex items-center justify-center shrink-0">
                  3
                </span>
                <strong className="text-slate-900 text-xs sm:text-sm font-black uppercase">
                  Pasang Ekstensi di Browser
                </strong>
              </div>
              <ul className="text-xs font-bold text-slate-600 pl-8 space-y-1 list-disc list-inside leading-relaxed">
                <li>Buka menu ekstensi (ketik <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900">chrome://extensions</code> di address bar atau lewat menu browser).</li>
                <li>Aktifkan toggle <strong>Developer mode (Mode Pengembang)</strong> di pojok kanan atas.</li>
                <li>Klik tombol <strong>Load unpacked (Muat yang belum dibongkar)</strong> atau <strong>(from .zip)</strong> ➔ pilih file zip yang sudah didownload tadi (atau ekstrak foldernya).</li>
                <li>Ekstensi <strong>Nullsanz TikTok Studio v3.0</strong> akan aktif seketika!</li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl border-2 border-slate-900 bg-slate-50 space-y-1.5 shadow-[2px_2px_0px_0px_#111827]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#ffe4e6] border-2 border-slate-900 font-black text-xs text-rose-950 flex items-center justify-center shrink-0">
                  4
                </span>
                <strong className="text-slate-900 text-xs sm:text-sm font-black uppercase">
                  Masuk TikTok Studio &amp; Aktifkan Mode Desktop
                </strong>
              </div>
              <p className="text-xs font-bold text-slate-600 pl-8 leading-relaxed">
                Di HP Android, buka menu titik tiga browser dan centang <strong>Situs Desktop (Desktop Site)</strong>. Kemudian buka situs <a href={studioUrl} target="_blank" rel="noopener noreferrer" className="text-rose-600 underline font-black">tiktok.com/tiktokstudio/upload</a> dan login ke akun TikTok Anda.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-3.5 rounded-xl border-2 border-slate-900 bg-[#d0fae5] space-y-1.5 shadow-[2px_2px_0px_0px_#111827]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-white border-2 border-slate-900 font-black text-xs text-emerald-950 flex items-center justify-center shrink-0">
                  5
                </span>
                <strong className="text-emerald-950 text-xs sm:text-sm font-black uppercase">
                  Upload Video Hasil Kompresi
                </strong>
              </div>
              <p className="text-xs font-bold text-emerald-950 pl-8 leading-relaxed">
                Pilih video hasil kompresi website ini di kotak upload berlogo <strong>Nullsanz TikTok Studio</strong>. Ekstensi otomatis mengunci 60 FPS 30 Mbps, memotong proses re-kompresi TikTok, dan video terbit jernih kristal 100%!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Bebas Watermark • Akun Aman Anti-Shadowflag</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Paham, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}
