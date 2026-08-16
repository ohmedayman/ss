'use client';

import React, { useState, useRef } from 'react';
import {
  Image,
  Type,
  Clock,
  CloudSun,
  AlignLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  Settings,
} from 'lucide-react';
import { ScreenLayer, MediaItem } from '@/lib/types';

interface ScreenCanvasEditorProps {
  layers: ScreenLayer[];
  onChange: (layers: ScreenLayer[]) => void;
  background: string;
  onBackgroundChange: (color: string) => void;
  media: MediaItem[];
  orientation: 'landscape' | 'portrait';
}

const LAYER_TYPES = [
  { type: 'logo' as const, label: 'لوجو / صورة', icon: Image, color: 'text-violet-500' },
  { type: 'text' as const, label: 'نص مخصص', icon: Type, color: 'text-blue-500' },
  { type: 'clock' as const, label: 'ساعة', icon: Clock, color: 'text-amber-500' },
  { type: 'weather' as const, label: 'الطقس', icon: CloudSun, color: 'text-cyan-500' },
  { type: 'ticker' as const, label: 'شريط أخبار', icon: AlignLeft, color: 'text-emerald-500' },
];

function genId() {
  return 'lyr-' + Math.random().toString(36).substring(2, 9);
}

export default function ScreenCanvasEditor({
  layers,
  onChange,
  background,
  onBackgroundChange,
  media,
  orientation,
}: ScreenCanvasEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaPicker, setMediaPicker] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selected = layers.find((l) => l.id === selectedId);

  const addLayer = (type: ScreenLayer['type']) => {
    const newLayer: ScreenLayer = {
      id: genId(),
      type,
      x: 10,
      y: 10,
      width: type === 'ticker' ? 80 : type === 'clock' ? 20 : 25,
      height: type === 'ticker' ? 8 : type === 'clock' ? 10 : 25,
      zIndex: layers.length + 1,
      opacity: 1,
      visible: true,
      text: type === 'text' ? 'نص جديد' : type === 'ticker' ? 'شريط الأخبار يتحرك هنا...' : undefined,
      fontSize: type === 'text' ? 24 : type === 'ticker' ? 18 : undefined,
      fontColor: '#ffffff',
      backgroundColor: type === 'ticker' ? '#1e293b' : type === 'text' ? 'transparent' : undefined,
      tickerSpeed: type === 'ticker' ? 3 : undefined,
    };
    onChange([...layers, newLayer]);
    setSelectedId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<ScreenLayer>) => {
    onChange(layers.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeLayer = (id: string) => {
    onChange(layers.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const idx = layers.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const curIdx = sorted.findIndex((l) => l.id === id);
    if (direction === 'up' && curIdx < sorted.length - 1) {
      const temp = sorted[curIdx].zIndex;
      sorted[curIdx].zIndex = sorted[curIdx + 1].zIndex;
      sorted[curIdx + 1].zIndex = temp;
    } else if (direction === 'down' && curIdx > 0) {
      const temp = sorted[curIdx].zIndex;
      sorted[curIdx].zIndex = sorted[curIdx - 1].zIndex;
      sorted[curIdx - 1].zIndex = temp;
    }
    onChange(sorted);
  };

  const isLandscape = orientation === 'landscape';

  return (
    <div className="space-y-4">
      {/* Canvas Preview */}
      <div
        ref={canvasRef}
        className={`relative mx-auto border-2 border-dashed border-slate-300 rounded-xl overflow-hidden cursor-crosshair ${
          isLandscape ? 'aspect-video max-w-full' : 'aspect-[9/16] max-h-[500px]'
        }`}
        style={{ backgroundColor: background }}
        onClick={(e) => {
          if (e.target === canvasRef.current) setSelectedId(null);
        }}
      >
        {layers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 pointer-events-none">
            <Layers className="w-12 h-12 mb-2" />
            <p className="text-sm font-semibold">اضغط + لإضافة عنصر</p>
          </div>
        )}

        {layers
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((layer) => (
            <div
              key={layer.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(layer.id);
              }}
              className={`absolute border-2 transition-all ${
                selectedId === layer.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'border-transparent hover:border-white/30'
              } ${layer.visible === false ? 'opacity-30' : ''}`}
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                width: `${layer.width}%`,
                height: `${layer.height}%`,
                zIndex: layer.zIndex,
                opacity: layer.opacity ?? 1,
                backgroundColor: layer.backgroundColor || 'transparent',
                borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
              }}
            >
              {/* Layer Content Preview */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                {layer.type === 'logo' && layer.fileUrl ? (
                  <img src={layer.fileUrl} alt="" className="w-full h-full object-contain" />
                ) : layer.type === 'logo' ? (
                  <Image className="w-8 h-8 text-white/30" />
                ) : layer.type === 'text' ? (
                  <span
                    style={{
                      color: layer.fontColor || '#fff',
                      fontSize: layer.fontSize ? `${Math.min(layer.fontSize, 32)}px` : '16px',
                      fontWeight: layer.fontWeight || 'normal',
                    }}
                    className="px-2 text-center leading-tight"
                  >
                    {layer.text || 'نص'}
                  </span>
                ) : layer.type === 'clock' ? (
                  <div className="text-center">
                    <Clock className="w-6 h-6 text-white/50 mx-auto mb-1" />
                    <span className="text-white/60 text-xs font-mono">12:30</span>
                  </div>
                ) : layer.type === 'weather' ? (
                  <div className="text-center">
                    <CloudSun className="w-6 h-6 text-white/50 mx-auto mb-1" />
                    <span className="text-white/60 text-xs">الطقس</span>
                  </div>
                ) : layer.type === 'ticker' ? (
                  <div className="w-full h-full flex items-center px-3">
                    <AlignLeft className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
                    <span className="text-white/70 text-xs truncate">{layer.text || 'شريط أخبار'}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {LAYER_TYPES.map((lt) => (
          <button
            key={lt.type}
            onClick={() => addLayer(lt.type)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer hover:border-indigo-300"
          >
            <lt.icon className={`w-3.5 h-3.5 ${lt.color}`} />
            {lt.label}
          </button>
        ))}

        <div className="mr-auto flex items-center gap-2">
          <label className="text-xs text-slate-500">الخلفية:</label>
          <input
            type="color"
            value={background}
            onChange={(e) => onBackgroundChange(e.target.value)}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
          />
        </div>
      </div>

      {/* Layers List */}
      {layers.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-600 mb-2">الطبقات ({layers.length})</h4>
          {[...layers]
            .sort((a, b) => b.zIndex - a.zIndex)
            .map((layer) => {
              const lt = LAYER_TYPES.find((t) => t.type === layer.type);
              return (
                <div
                  key={layer.id}
                  onClick={() => setSelectedId(layer.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedId === layer.id
                      ? 'bg-indigo-50 border-indigo-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <GripVertical className="w-3 h-3 text-slate-300" />
                  {lt && <lt.icon className={`w-3.5 h-3.5 ${lt.color}`} />}
                  <span className="text-xs font-semibold text-slate-700 flex-1 truncate">
                    {layer.type === 'logo' && layer.fileUrl
                      ? media.find((m) => m.id === layer.mediaId)?.name || 'لوجو'
                      : layer.text?.substring(0, 20) || lt?.label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayer(layer.id, { visible: layer.visible === false ? true : false });
                    }}
                    className="p-1 rounded hover:bg-slate-100"
                  >
                    {layer.visible === false ? (
                      <EyeOff className="w-3 h-3 text-slate-400" />
                    ) : (
                      <Eye className="w-3 h-3 text-emerald-500" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(layer.id, 'up');
                    }}
                    className="p-1 rounded hover:bg-slate-100 text-[10px] text-slate-400"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(layer.id, 'down');
                    }}
                    className="p-1 rounded hover:bg-slate-100 text-[10px] text-slate-400"
                  >
                    ▼
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(layer.id);
                    }}
                    className="p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* Selected Layer Properties */}
      {selected && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3">
          <h4 className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            خصائص العنصر المحدد
          </h4>

          {/* Type-specific: media picker for logo */}
          {selected.type === 'logo' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">اختر صورة / لوجو</label>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {media
                  .filter((m) => m.fileType === 'image')
                  .map((m) => (
                    <button
                      key={m.id}
                      onClick={() =>
                        updateLayer(selected.id, { mediaId: m.id, fileUrl: m.fileUrl })
                      }
                      className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        selected.mediaId === m.id
                          ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <img src={m.thumbnailUrl || m.fileUrl} alt={m.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                {media.filter((m) => m.fileType === 'image').length === 0 && (
                  <p className="text-[11px] text-slate-400 col-span-4 text-center py-4">لا توجد صور. ارفع صورة أولاً من مكتبة الوسائط.</p>
                )}
              </div>
            </div>
          )}

          {/* Text content */}
          {(selected.type === 'text' || selected.type === 'ticker') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">النص</label>
              <input
                type="text"
                value={selected.text || ''}
                onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          )}

          {/* Position */}
          <div className="grid grid-cols-4 gap-2">
            {(['x', 'y', 'width', 'height'] as const).map((prop) => (
              <div key={prop}>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  {prop === 'x' ? 'X' : prop === 'y' ? 'Y' : prop === 'width' ? 'العرض' : 'الارتفاع'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(selected[prop])}
                  onChange={(e) => updateLayer(selected.id, { [prop]: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            ))}
          </div>

          {/* Style */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">الشفافية</label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((selected.opacity ?? 1) * 100)}
                onChange={(e) => updateLayer(selected.id, { opacity: Number(e.target.value) / 100 })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">حجم الخط</label>
              <input
                type="number"
                min={8}
                max={200}
                value={selected.fontSize || 24}
                onChange={(e) => updateLayer(selected.id, { fontSize: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">لون الخط</label>
              <input
                type="color"
                value={selected.fontColor || '#ffffff'}
                onChange={(e) => updateLayer(selected.id, { fontColor: e.target.value })}
                className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
