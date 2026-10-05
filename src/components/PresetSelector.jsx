import React from 'react';
import { 
  MessageCircle, 
  Instagram, 
  Music2, 
  Wifi, 
  HardDrive, 
  UserCheck, 
  Sliders, 
  Check, 
  Zap,
  Sparkles
} from 'lucide-react';
import { PRESETS } from '../constants/presets';

export default function PresetSelector({ 
  selectedPresetId, 
  onSelectPreset,
  isImageFile = false,
  onOpenTikTokGuide
}) {
  const getIcon = (name) => {
    switch (name) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-600 fill-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-300" />;
      case 'MessageCircle': return <MessageCircle className="w-5 h-5 text-emerald-700" />;
      case 'Instagram': return <Instagram className="w-5 h-5 text-purple-700" />;
      case 'Music2': return <Music2 className="w-5 h-5 text-rose-700" />;
      case 'Wifi': return <Wifi className="w-5 h-5 text-amber-700" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-slate-800" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5 text-cyan-700" />;
      default: return <Sliders className="w-5 h-5 text-blue-700" />;
    }
  };

  const getBadgeClass = (color) => {
    switch (color) {
      case 'emerald': return 'bg-[#d0fae5] text-emerald-950 border-slate-900';
      case 'purple': return 'bg-[#f3e8ff] text-purple-950 border-slate-900';
      case 'rose': return 'bg-[#ffe4e6] text-rose-950 border-slate-900';
      case 'amber': return 'bg-[#fef08a] text-amber-950 border-slate-900';
      case 'cyan': return 'bg-[#cffafe] text-cyan-950 border-slate-900';
      default: return 'bg-slate-100 text-slate-900 border-slate-900';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-slate-900" />
          <h3 className="font-heading text-base sm:text-lg text-slate-900 uppercase tracking-wide">Pilih Mode Preset FFmpeg</h3>
        </div>
        <span className="text-xs font-black uppercase text-slate-500">100% Identik Bot WA</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          // If user uploaded an image, hide video presets
          if (isImageFile && !preset.isImageOnly) {
            return null;
          }

          return (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset.id);
                if (preset.id === 'tiktok' && onOpenTikTokGuide) {
                  onOpenTikTokGuide();
                }
              }}
              className={`relative rounded-xl p-4 cursor-pointer transition-all duration-150 text-left flex flex-col justify-between min-w-0 border-3 border-slate-900 ${
                isSelected
                  ? 'bg-[#fef08a] shadow-[4px_4px_0px_0px_#111827] ring-2 ring-slate-900 -translate-y-0.5'
                  : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_0px_#111827] hover:shadow-[4px_4px_0px_0px_#111827]'
              }`}
            >
              <div className="min-w-0 w-full">
                <div className="flex items-start justify-between gap-2 mb-2 min-w-0 w-full">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#111827] shrink-0">
                      {getIcon(preset.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-xs sm:text-sm tracking-tight leading-snug truncate text-slate-900" title={preset.name}>
                        {preset.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-slate-600 block truncate">
                        {preset.commandRef}
                      </span>
                    </div>
                  </div>

                  {/* Active Radio Box (Blocky arcade style) */}
                  <div className={`w-5 h-5 rounded-md border-2 border-slate-900 flex items-center justify-center shrink-0 transition-all shadow-[1px_1px_0px_0px_#111827] ${
                    isSelected 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-white'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-[11px] font-bold text-slate-700 leading-relaxed mb-3">
                  {preset.description}
                </p>

                {/* Khusus Preset TikTok: Tombol Cepat Buka Panduan Ekstensi */}
                {preset.id === 'tiktok' && (
                  <div className="mb-3 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenTikTokGuide) onOpenTikTokGuide();
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-[#ffe4e6] hover:bg-[#fecdd3] border-2 border-slate-900 text-rose-950 text-[10px] font-black uppercase flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                      title="Buka panduan upload browser Quetta/Lemur/Kiwi + ekstensi"
                    >
                      <Sparkles className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>Panduan Upload Browser + Ekstensi</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Badges Footer */}
              <div className="flex items-center justify-between gap-2 pt-2.5 border-t-2 border-dashed border-slate-300 text-[10px] min-w-0 w-full">
                <span className={`px-2 py-0.5 rounded-md font-black uppercase tracking-wider border-2 shadow-[1px_1px_0px_0px_#111827] ${getBadgeClass(preset.badgeColor)}`}>
                  {preset.badge}
                </span>
                <span className="text-slate-700 font-bold truncate min-w-0 font-mono">
                  {preset.resolutionLabel}
                </span>
              </div>
            </div>
          );
        })}

        {/* Custom Preset Card */}
        {!isImageFile && (
          <div
            onClick={() => onSelectPreset('custom')}
            className={`relative rounded-xl p-4 cursor-pointer transition-all duration-150 text-left flex flex-col justify-between min-w-0 border-3 border-slate-900 ${
              selectedPresetId === 'custom'
                ? 'bg-[#dbeafe] shadow-[4px_4px_0px_0px_#111827] ring-2 ring-slate-900 -translate-y-0.5'
                : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_0px_#111827] hover:shadow-[4px_4px_0px_0px_#111827]'
            }`}
          >
            <div className="min-w-0 w-full">
              <div className="flex items-start justify-between gap-2 mb-2 min-w-0 w-full">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#111827] text-blue-700 shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-xs sm:text-sm tracking-tight leading-snug truncate text-slate-900">
                      Mode Kustom (Manual)
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-slate-600 block truncate">
                      Parameter Bebas
                    </span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-md border-2 border-slate-900 flex items-center justify-center shrink-0 transition-all shadow-[1px_1px_0px_0px_#111827] ${
                  selectedPresetId === 'custom' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white'
                }`}>
                  {selectedPresetId === 'custom' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <p className="text-[11px] font-bold text-slate-700 leading-relaxed mb-3">
                Atur nilai CRF, resolusi kustom, frame rate, dan audio bitrate sesuai kebutuhan spesifik Anda.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2.5 border-t-2 border-dashed border-slate-300 text-[10px] min-w-0 w-full">
              <span className="px-2 py-0.5 rounded-md font-black uppercase tracking-wider border-2 border-slate-900 bg-[#dbeafe] text-blue-950 shadow-[1px_1px_0px_0px_#111827]">
                Lanjutan
              </span>
              <span className="text-slate-700 font-bold truncate min-w-0 font-mono">
                Fleksibel Penuh
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
