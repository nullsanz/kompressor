import React from 'react';
import { Sliders, Gauge, Volume2, Film } from 'lucide-react';

export default function CustomSettings({ 
  customSettings, 
  onSettingsChange 
}) {
  const handleChange = (key, val) => {
    onSettingsChange({
      ...customSettings,
      [key]: val
    });
  };

  const getCrfQualityLabel = (crf) => {
    if (crf <= 16) return 'Kualitas Studio / Lossless (Ukuran Besar)';
    if (crf <= 20) return 'Sangat Tajam & Jernih (Rekomendasi)';
    if (crf <= 24) return 'Standar Seimbang WhatsApp';
    if (crf <= 28) return 'Hemat Kuota Tinggi';
    return 'Ekstrem Kompres (Ukuran Minimum)';
  };

  return (
    <div className="rounded-2xl p-4 sm:p-5 border-2 border-slate-900 bg-white shadow-[3px_3px_0px_0px_#111827] space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b-2 border-dashed border-slate-300">
        <Sliders className="w-4 h-4 text-blue-700" />
        <h4 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide">Konfigurasi Kompresi Kustom</h4>
      </div>

      {/* CRF Slider */}
      <div className="min-w-0 w-full bg-slate-50 p-3.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-2 min-w-0">
          <span className="font-black text-slate-900 truncate">
            Nilai CRF: <strong className="text-rose-600 font-mono font-black text-sm ml-1">{customSettings.crf}</strong>
          </span>
          <span className="text-[11px] font-bold text-slate-600 truncate">
            {getCrfQualityLabel(customSettings.crf)}
          </span>
        </div>
        <input
          type="range"
          min={14}
          max={32}
          step={1}
          value={customSettings.crf}
          onChange={(e) => handleChange('crf', parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-slate-900"
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1.5 min-w-0">
          <span className="truncate">14 (Lossless)</span>
          <span className="text-emerald-700 font-black truncate">20-23 (Ideal)</span>
          <span className="truncate">32 (Kecil)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Resolusi */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1">
            <Film className="w-3.5 h-3.5 text-blue-700" />
            <span>Resolusi Maks:</span>
          </label>
          <select
            value={customSettings.resolution || '1080p'}
            onChange={(e) => {
              const res = e.target.value;
              let scale = '';
              if (res === '1080p') scale = "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'";
              else if (res === '720p') scale = "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'";
              else if (res === '560p') scale = "scale='if(gt(iw,ih),min(996,iw),-2)':'if(gt(iw,ih),-2,min(996,ih))'";
              else scale = "scale=trunc(iw/2)*2:trunc(ih/2)*2";
              
              onSettingsChange({
                ...customSettings,
                resolution: res,
                scaleFilter: scale
              });
            }}
            className="w-full px-3 py-2.5 rounded-xl text-xs font-bold border-2 border-slate-900 bg-white text-slate-900 outline-none shadow-[2px_2px_0px_0px_#111827] focus:shadow-[3px_3px_0px_0px_#111827]"
          >
            <option value="1080p">1080p Full HD</option>
            <option value="720p">720p HD</option>
            <option value="560p">560p Hemat</option>
            <option value="asli">Resolusi Asli (Genap)</option>
          </select>
        </div>

        {/* Frame Rate */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-purple-700" />
            <span>Frame Rate (FPS):</span>
          </label>
          <select
            value={customSettings.fps || 'asli'}
            onChange={(e) => handleChange('fps', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-xs font-bold border-2 border-slate-900 bg-white text-slate-900 outline-none shadow-[2px_2px_0px_0px_#111827] focus:shadow-[3px_3px_0px_0px_#111827]"
          >
            <option value="asli">Asli (Tanpa Ubah)</option>
            <option value="60">60 FPS Murni</option>
            <option value="30">30 FPS Standar</option>
          </select>
        </div>

        {/* Audio Bitrate */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Kualitas Audio:</span>
          </label>
          <select
            value={customSettings.audioBitrate || '64k'}
            onChange={(e) => handleChange('audioBitrate', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-xs font-bold border-2 border-slate-900 bg-white text-slate-900 outline-none shadow-[2px_2px_0px_0px_#111827] focus:shadow-[3px_3px_0px_0px_#111827]"
          >
            <option value="64k">64 kbps (Status WA)</option>
            <option value="128k">128 kbps (Standar Musik)</option>
            <option value="256k">256 kbps (High Quality)</option>
            <option value="320k">320 kbps (Studio Hi-Fi)</option>
            <option value="32k">32 kbps (Ultra Mini)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
