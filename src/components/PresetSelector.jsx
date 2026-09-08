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
  Sparkles,
  Zap
} from 'lucide-react';
import { PRESETS } from '../constants/presets';

export default function PresetSelector({ 
  isDark, 
  selectedPresetId, 
  onSelectPreset,
  isImageFile = false 
}) {
  const getIcon = (name) => {
    switch (name) {
      case 'MessageCircle': return <MessageCircle className="w-5 h-5 text-emerald-500" />;
      case 'Instagram': return <Instagram className="w-5 h-5 text-purple-400" />;
      case 'Music2': return <Music2 className="w-5 h-5 text-rose-400" />;
      case 'Wifi': return <Wifi className="w-5 h-5 text-amber-400" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-slate-400" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5 text-cyan-400" />;
      default: return <Sliders className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBadgeClass = (color) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'purple': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'rose': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'amber': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'cyan': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-rose-500" />
          <h3 className="font-bold text-sm">Pilih Mode Preset FFmpeg</h3>
        </div>
        <span className="text-[11px] text-slate-400">100% Identik Bot WA</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          // If user uploaded an image, highlight PPHD
          if (isImageFile && !preset.isImageOnly) {
            return null; // hide video presets for image files
          }

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`relative rounded-2xl p-3.5 border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between min-w-0 ${
                isSelected
                  ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/5 shadow-md shadow-rose-500/10'
                  : isDark
                  ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                  : 'border-slate-200 bg-white hover:bg-slate-50 shadow-xs'
              }`}
            >
              <div className="min-w-0 w-full">
                <div className="flex items-start justify-between gap-2 mb-2 min-w-0 w-full">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-1.5 rounded-xl bg-slate-950/40 border border-slate-800/80 shrink-0">
                      {getIcon(preset.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm tracking-tight leading-snug truncate" title={preset.name}>
                        {preset.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {preset.commandRef}
                      </span>
                    </div>
                  </div>

                  {/* Active Radio Pill */}
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected 
                      ? 'bg-rose-500 border-rose-500 text-white' 
                      : 'border-slate-600 bg-transparent'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <p className={`text-[11px] leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {preset.description}
                </p>
              </div>

              {/* Badges Footer */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-[10px] min-w-0 w-full">
                <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border shrink-0 ${getBadgeClass(preset.badgeColor)}`}>
                  {preset.badge}
                </span>
                <span className="text-slate-400 font-medium truncate min-w-0">
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
            className={`relative rounded-2xl p-3.5 border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between min-w-0 ${
              selectedPresetId === 'custom'
                ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/5 shadow-md shadow-blue-500/10'
                : isDark
                ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                : 'border-slate-200 bg-white hover:bg-slate-50 shadow-xs'
            }`}
          >
            <div className="min-w-0 w-full">
              <div className="flex items-start justify-between gap-2 mb-2 min-w-0 w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm tracking-tight leading-snug truncate">
                      Mode Kustom (Manual)
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      Parameter Bebas
                    </span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedPresetId === 'custom' 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-slate-600 bg-transparent'
                }`}>
                  {selectedPresetId === 'custom' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <p className={`text-[11px] leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Atur nilai CRF, resolusi kustom, kecepatan frame rate, dan audio bitrate sesuai kebutuhan spesifik kamu.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-[10px] min-w-0 w-full">
              <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border bg-blue-500/10 text-blue-400 border-blue-500/20 shrink-0">
                Lanjutan
              </span>
              <span className="text-slate-400 font-medium truncate min-w-0">
                Fleksibel Penuh
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
