'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import UploadMediaModal from '@/components/UploadMediaModal';
import {
  Image as ImageIcon,
  Film,
  Globe,
  Type,
  Trash2,
  Search,
  Plus,
  Clock,
  Eye,
  X,
} from 'lucide-react';

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const loadMedia = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const deleteMedia = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}" من المكتبة؟`)) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadMedia();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const folders = Array.from(new Set(media.map((m) => m.folder || 'عام')));

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType !== 'all' && item.fileType !== filterType) return false;
    if (selectedFolder !== 'all' && item.folder !== selectedFolder) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <Header
        title="مكتبة الوسائط والمحتوى"
        subtitle="إدارة ورفع الصور ومقاطع الفيديو وصفحات الويب وأشرطة الأخبار"
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Control Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في ملفات الوسائط..."
            className="input pl-3 pr-9"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            الكل ({media.length})
          </button>

          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              filterType === 'image'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>الصور ({media.filter((m) => m.fileType === 'image').length})</span>
          </button>

          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              filterType === 'video'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>الفيديو ({media.filter((m) => m.fileType === 'video').length})</span>
          </button>

          <button
            onClick={() => setFilterType('ticker_text')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              filterType === 'ticker_text'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>أشرطة متحركة ({media.filter((m) => m.fileType === 'ticker_text').length})</span>
          </button>

          <button
            onClick={() => setFilterType('web_url')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              filterType === 'web_url'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>صفحات ويب ({media.filter((m) => m.fileType === 'web_url').length})</span>
          </button>
        </div>

        {/* Upload Trigger */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة وسائط</span>
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia.map((item) => {
          return (
            <div
              key={item.id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-slate-200 group"
            >
              {/* Media Thumbnail */}
              <div
                onClick={() => setPreviewItem(item)}
                className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
              >
                {item.fileType === 'image' && (
                  <img
                    src={item.fileUrl || item.thumbnailUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {item.fileType === 'video' && (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                    <video
                      src={item.fileUrl}
                      className="w-full h-full object-cover opacity-80"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-600/80 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Film className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                )}

                {item.fileType === 'ticker_text' && (
                  <div className="p-4 w-full h-full bg-gradient-to-br from-indigo-950 to-slate-900 flex flex-col justify-center text-center">
                    <Type className="w-6 h-6 mx-auto mb-2 text-indigo-400 opacity-60" />
                    <p className="text-xs text-indigo-200 line-clamp-2 leading-relaxed">
                      {item.customTickerText}
                    </p>
                  </div>
                )}

                {item.fileType === 'web_url' && (
                  <div className="p-4 w-full h-full bg-slate-900 flex flex-col items-center justify-center text-center">
                    <Globe className="w-8 h-8 mb-2 text-cyan-400 opacity-60" />
                    <p className="text-xs text-slate-300 font-mono truncate max-w-[200px]">
                      {item.fileUrl}
                    </p>
                  </div>
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] text-slate-300 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>{item.durationSeconds} ثانية</span>
                </div>

                {/* Folder Tag */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300">
                  {item.folder}
                </div>
              </div>

              {/* Media Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {item.fileSizeBytes > 1024 * 1024
                        ? `${(item.fileSizeBytes / 1024 / 1024).toFixed(1)} MB`
                        : `${(item.fileSizeBytes / 1024).toFixed(0)} KB`}
                    </span>
                    <span className="capitalize">{item.fileType}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة</span>
                  </button>

                  <button
                    onClick={() => deleteMedia(item.id, item.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="relative max-w-4xl w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{previewItem.name}</h3>
                <p className="text-[11px] text-slate-400">
                  النوع: {previewItem.fileType} • المدة: {previewItem.durationSeconds} ثانية
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[70vh] bg-slate-950">
              {previewItem.fileType === 'image' && (
                <img
                  src={previewItem.fileUrl}
                  alt={previewItem.name}
                  className="max-h-[60vh] object-contain rounded-lg"
                />
              )}

              {previewItem.fileType === 'video' && (
                <video
                  src={previewItem.fileUrl}
                  controls
                  autoPlay
                  className="max-h-[60vh] rounded-lg"
                />
              )}

              {previewItem.fileType === 'ticker_text' && (
                <div className="p-8 text-center bg-indigo-950/40 rounded-xl w-full">
                  <span className="text-xs text-indigo-400 font-bold block mb-2">النص الإعلاني:</span>
                  <p className="text-lg font-bold text-white">{previewItem.customTickerText}</p>
                </div>
              )}

              {previewItem.fileType === 'web_url' && (
                <div className="w-full h-96">
                  <iframe
                    src={previewItem.fileUrl}
                    className="w-full h-full rounded-lg border-0"
                    title={previewItem.name}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => loadMedia()}
      />
    </div>
  );
}