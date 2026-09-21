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
  Zap
} from 'lucide-react';
import { PRESETS } from '../constants/presets';

export default function PresetSelector({ 
  selectedPresetId, 
  onSelectPreset,
  isImageFile = false 
}) {
  const getIcon = (name) => {
    switch (name) {
      case 'MessageCircle': return <MessageCircle className="w-5 h-5 text-emerald-700" />;
      case 'Instagram': return <Instagram className="w-5 h-5 text-purple-700" />;
      case 'Music2': return <Music2 className="w-5 h-5 text-rose-700" />;
      case 'Wifi': return <Wifi className="w-5 h-5 text-amber-700" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-slate-700" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5 text-cyan-700" />;
      default: return <Sliders className="w-5 h-5 text-blue-700" />;
    }
  };

  const getBadgeClass = (color) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-100 text-emerald-900 border-emerald-900';
      case 'purple': return 'bg-purple-100 text-purple-900 border-purple-900';
      case 'rose': return 'bg-rose-100 text-rose-900 border-rose-900';
      case 'amber': return 'bg-amber-100 text-amber-900 border-amber-900';
      case 'cyan': return 'bg-cyan-100 text-cyan-900 border-cyan-900';
      default: return 'bg-slate-100 text-slate-900 border-slate-900';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-rose-600" />
          <h3 className="font-black text-sm uppercase tracking-wide text-slate-900">Pilih Mode Preset FFmpeg</h3>
        </div>
        <span className="text-[11px] font-black uppercase text-slate-500">100% Identik Bot WA</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          // If user uploaded an image, hide video presets
          if (isImageFile && !preset.isImageOnly) {
            return null;
          }

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`relative rounded-[4px] p-3.5 border-2 border-slate-900 cursor-pointer transition-all duration-150 text-left flex flex-col justify-between min-w-0 ${
                isSelected
                  ? 'bg-rose-50 shadow-[4px_4px_0px_#e11d48] translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-white shadow-[3px_3px_0px_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#0f172a]'
              }`}
            >
              <div className="min-w-0 w-full">
                <div className="flex items-start justify-between gap-2 mb-2 min-w-0 w-full">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-1.5 rounded-[4px] bg-slate-100 border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a] shrink-0">
                      {getIcon(preset.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-xs sm:text-sm tracking-tight leading-snug truncate text-slate-900" title={preset.name}>
                        {preset.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-slate-500 block truncate">
                        {preset.commandRef}
                      </span>
                    </div>
                  </div>

                  {/* Active Radio Box */}
                  <div className={`w-5 h-5 rounded-[4px] border-2 border-slate-900 flex items-center justify-center shrink-0 ${
                    isSelected 
                      ? 'bg-rose-600 text-white shadow-[1px_1px_0px_#0f172a]' 
                      : 'bg-white'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-slate-600 leading-relaxed mb-3">
                  {preset.description}
                </p>
              </div>

              {/* Badges Footer */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-slate-900 text-[10px] min-w-0 w-full">
                <span className={`px-2 py-0.5 rounded-[4px] font-black uppercase tracking-wider border shadow-[1px_1px_0px_#0f172a] shrink-0 ${getBadgeClass(preset.badgeColor)}`}>
                  {preset.badge}
                </span>
                <span className="text-slate-600 font-bold truncate min-w-0">
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
            className={`relative rounded-[4px] p-3.5 border-2 border-slate-900 cursor-pointer transition-all duration-150 text-left flex flex-col justify-between min-w-0 ${
              selectedPresetId === 'custom'
                ? 'bg-blue-50 shadow-[4px_4px_0px_#2563eb] translate-x-[-1px] translate-y-[-1px]'
                : 'bg-white shadow-[3px_3px_0px_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#0f172a]'
            }`}
          >
            <div className="min-w-0 w-full">
              <div className="flex items-start justify-between gap-2 mb-2 min-w-0 w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="p-1.5 rounded-[4px] bg-blue-100 border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a] text-blue-700 shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-xs sm:text-sm tracking-tight leading-snug truncate text-slate-900">
                      Mode Kustom (Manual)
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-slate-500 block truncate">
                      Parameter Bebas
                    </span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-[4px] border-2 border-slate-900 flex items-center justify-center shrink-0 ${
                  selectedPresetId === 'custom' 
                    ? 'bg-blue-600 text-white shadow-[1px_1px_0px_#0f172a]' 
                    : 'bg-white'
                }`}>
                  {selectedPresetId === 'custom' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <p className="text-[11px] font-semibold text-slate-600 leading-relaxed mb-3">
                Atur nilai CRF, resolusi kustom, frame rate, dan audio bitrate sesuai kebutuhan spesifik Anda.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-slate-900 text-[10px] min-w-0 w-full">
              <span className="px-2 py-0.5 rounded-[4px] font-black uppercase tracking-wider border border-blue-900 shadow-[1px_1px_0px_#0f172a] bg-blue-100 text-blue-900 shrink-0">
                Lanjutan
              </span>
              <span className="text-slate-600 font-bold truncate min-w-0">
                Fleksibel Penuh
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
