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
      case 'MessageCircle': return <MessageCircle className="w-5 h-5 text-emerald-600" />;
      case 'Instagram': return <Instagram className="w-5 h-5 text-purple-600" />;
      case 'Music2': return <Music2 className="w-5 h-5 text-rose-600" />;
      case 'Wifi': return <Wifi className="w-5 h-5 text-amber-600" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-slate-600" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5 text-cyan-600" />;
      default: return <Sliders className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBadgeClass = (color) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cyan': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-sm text-slate-900">Pilih Mode Preset FFmpeg</h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">100% Identik Bot WA</span>
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
              onClick={() => onSelectPreset(preset.id)}
              className={`relative rounded-xl p-4 cursor-pointer transition-all duration-150 text-left flex flex-col justify-between min-w-0 ${
                isSelected
                  ? 'bg-rose-50/50 border-2 border-rose-500 shadow-sm ring-2 ring-rose-500/10'
                  : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm'
              }`}
            >
              <div className="min-w-0 w-full">
                <div className="flex items-start justify-between gap-2 mb-2 min-w-0 w-full">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                      {getIcon(preset.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm tracking-tight leading-snug truncate text-slate-900" title={preset.name}>
                        {preset.name}
                      </h4>
                      <span className="text-[10px] font-mono font-medium text-slate-400 block truncate">
                        {preset.commandRef}
                      </span>
                    </div>
                  </div>

                  {/* Active Radio Box */}
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    isSelected 
                      ? 'border-rose-600 bg-rose-600 text-white' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-[11px] font-medium text-slate-600 leading-relaxed mb-3">
                  {preset.description}
                </p>
              </div>

              {/* Badges Footer */}
              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-[10px] min-w-0 w-full">
                <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${getBadgeClass(preset.badgeColor)}`}>
                  {preset.badge}
                </span>
                <span className="text-slate-500 font-medium truncate min-w-0">
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
            className={`relative rounded-xl p-4 cursor-pointer transition-all duration-150 text-left flex flex-col justify-between min-w-0 ${
              selectedPresetId === 'custom'
                ? 'bg-blue-50/50 border-2 border-blue-500 shadow-sm ring-2 ring-blue-500/10'
                : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm'
            }`}
          >
            <div className="min-w-0 w-full">
              <div className="flex items-start justify-between gap-2 mb-2 min-w-0 w-full">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm tracking-tight leading-snug truncate text-slate-900">
                      Mode Kustom (Manual)
                    </h4>
                    <span className="text-[10px] font-mono font-medium text-slate-400 block truncate">
                      Parameter Bebas
                    </span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  selectedPresetId === 'custom' 
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : 'border-slate-300 bg-white'
                }`}>
                  {selectedPresetId === 'custom' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <p className="text-[11px] font-medium text-slate-600 leading-relaxed mb-3">
                Atur nilai CRF, resolusi kustom, frame rate, dan audio bitrate sesuai kebutuhan spesifik Anda.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-[10px] min-w-0 w-full">
              <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-blue-200 bg-blue-50 text-blue-700">
                Lanjutan
              </span>
              <span className="text-slate-500 font-medium truncate min-w-0">
                Fleksibel Penuh
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
