'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import UploadMediaModal from '@/components/UploadMediaModal';
import { STOCK_MEDIA_CATALOG, StockMediaItem } from '@/lib/stock-media';
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
  LayoutGrid,
  List,
  Check,
  Folder,
  FolderOpen,
  ArrowUpDown,
  FileText,
  Edit3,
  AlertTriangle,
  Music,
  Download,
  Sparkles,
  Layers,
  Send,
  Monitor,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
  Utensils,
  Stethoscope,
  Building2,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function MediaPage() {
  const [mainTab, setMainTab] = useState<'my_media' | 'stock_catalog'>('my_media');

  // My Media State
  const [media, setMedia] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editFolder, setEditFolder] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Stock Catalog State
  const [stockCategory, setStockCategory] = useState<string>('all');
  const [stockSearch, setStockSearch] = useState<string>('');
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');

  // Quick Assign Modal
  const [assignMediaItem, setAssignMediaItem] = useState<any | null>(null);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string>('');

  const defaultFolders = ['الكل', 'عام', 'فيديو ترويجي', 'مطاعم وكافيهات', 'متاجر وتجزئة', 'عيادات وصحة', 'شركات وعقارات', 'روابط ويب', 'نصوص إعلانية'];

  const loadMedia = async () => {
    try {
      const [mediaRes, screensRes] = await Promise.all([
        fetch('/api/media'),
        fetch('/api/screens'),
      ]);

      if (mediaRes.ok) {
        const data = await mediaRes.json();
        setMedia(data.media || []);
      }
      if (screensRes.ok) {
        const d = await screensRes.json();
        setScreens(d.screens || []);
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

  const deleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadMedia();
        setPreviewItem(null);
        setDeleteConfirmId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/media/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, folder: editFolder }),
      });
      if (res.ok) {
        await loadMedia();
        setEditingItem(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const importStockItem = async (stockItem: StockMediaItem) => {
    setImportingId(stockItem.id);
    try {
      const res = await fetch('/api/media/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockId: stockItem.id }),
      });

      if (res.ok) {
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        } catch (e) {}
        setImportSuccessMsg(`تم استيراد "${stockItem.name}" إلى مكتبتك بنجاح! 🎉`);
        await loadMedia();
        setTimeout(() => setImportSuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImportingId(null);
    }
  };

  const assignToScreen = async (screenId: string) => {
    if (!assignMediaItem) return;
    try {
      const res = await fetch(`/api/screens/${screenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeContentType: 'media',
          activeContentId: assignMediaItem.id,
        }),
      });

      if (res.ok) {
        setAssignSuccessMsg(`تم إرسال "${assignMediaItem.name}" للشاشة وبدء العرض فوراً! 📺`);
        setTimeout(() => {
          setAssignMediaItem(null);
          setAssignSuccessMsg('');
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const folders = useMemo(() => {
    const folderCounts: Record<string, number> = {};
    media.forEach((m) => {
      const folder = m.folder || 'عام';
      folderCounts[folder] = (folderCounts[folder] || 0) + 1;
    });
    return defaultFolders.map((f) => ({
      name: f,
      count: f === 'الكل' ? media.length : (folderCounts[f] || 0),
    }));
  }, [media]);

  const filteredMedia = useMemo(() => {
    let items = media.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterType !== 'all' && item.fileType !== filterType) return false;
      if (selectedFolder !== 'الكل' && selectedFolder !== 'all') {
        const itemFolder = item.folder || 'عام';
        if (itemFolder !== selectedFolder) return false;
      }
      return true;
    });

    items.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'ar');
          break;
        case 'date':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'size':
          comparison = (a.fileSizeBytes || 0) - (b.fileSizeBytes || 0);
          break;
        case 'type':
          comparison = (a.fileType || '').localeCompare(b.fileType || '');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [media, searchQuery, filterType, selectedFolder, sortBy, sortOrder]);

  const filteredStockMedia = useMemo(() => {
    let items = [...STOCK_MEDIA_CATALOG];
    if (stockCategory !== 'all') {
      items = items.filter((item) => item.category === stockCategory);
    }
    if (stockSearch.trim()) {
      const q = stockSearch.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return items;
  }, [stockCategory, stockSearch]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditFolder(item.folder || 'عام');
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Film className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'youtube_video':
        return <YoutubeIcon className="w-4 h-4 text-red-500" />;
      case 'ticker_text':
        return <Type className="w-4 h-4" />;
      case 'web_url':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <Header
        title="مكتبة الوسائط والمحتوى"
        subtitle="إدارة ورفع وتصفح محتوى الشاشات الرقمية، الفيديوهات الترويجية، والقوائم الجاهزة"
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Global Success Notification */}
      {importSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {/* Main Switcher: My Media vs Online Stock Catalog */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-2 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setMainTab('my_media')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'my_media'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>مكتبة وسائطي ({media.length})</span>
          </button>

          <button
            onClick={() => setMainTab('stock_catalog')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'stock_catalog'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>محتوى جاهز من الإنترنت (Stock Media)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-700 font-extrabold">
              جديد
            </span>
          </button>
        </div>

        {mainTab === 'my_media' ? (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>رفع وسائط مخصصة</span>
          </button>
        ) : (
          <div className="text-xs text-slate-500 hidden md:block">
            ✨ تصفح واستورد أي تصميم أو فيديو بضغطة زر واحدة إلى شاشاتك
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY UPLOADED MEDIA ASSETS                                           */}
      {/* ========================================================================= */}
      {mainTab === 'my_media' && (
        <div className="flex gap-6">
          {/* Folders Sidebar */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="glass-panel rounded-2xl p-3 space-y-1 sticky top-24">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
                التصنيفات والمجلدات
              </h4>
              {folders.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFolder(f.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedFolder === f.name
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {selectedFolder === f.name ? (
                      <FolderOpen className="w-4 h-4" />
                    ) : (
                      <Folder className="w-4 h-4" />
                    )}
                    <span>{f.name}</span>
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedFolder === f.name
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Media Content */}
          <div className="flex-1 space-y-4">
            {/* Control Bar: Search & Type Filter & View Mode */}
            <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في وسائطك المرفوعة..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  الكل ({media.length})
                </button>

                <button
                  onClick={() => setFilterType('image')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterType === 'image'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>الصور ({media.filter((m) => m.fileType === 'image').length})</span>
                </button>

                <button
                  onClick={() => setFilterType('video')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterType === 'video'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>الفيديو ({media.filter((m) => m.fileType === 'video').length})</span>
                </button>

                <button
                  onClick={() => setFilterType('ticker_text')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterType === 'ticker_text'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>أشرطة متحركة ({media.filter((m) => m.fileType === 'ticker_text').length})</span>
                </button>

                <button
                  onClick={() => setFilterType('web_url')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterType === 'web_url'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>صفحات ويب ({media.filter((m) => m.fileType === 'web_url').length})</span>
                </button>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="عرض الشبكة"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="عرض القائمة"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all group"
                  >
                    {/* Media Thumbnail */}
                    <div
                      onClick={() => setPreviewItem(item)}
                      className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      {item.fileType === 'image' && (
                        <img
                          src={item.fileUrl || item.thumbnailUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}

                      {item.fileType === 'video' && (
                        <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                          <video src={item.fileUrl} className="w-full h-full object-cover opacity-80" muted />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-600/90 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                              <Film className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      )}

                      {item.fileType === 'ticker_text' && (
                        <div className="p-4 w-full h-full bg-gradient-to-br from-indigo-950 to-slate-900 flex flex-col justify-center text-center">
                          <Type className="w-6 h-6 mx-auto mb-2 text-indigo-400 opacity-80" />
                          <p className="text-xs text-indigo-200 line-clamp-2 leading-relaxed font-semibold">
                            {item.customTickerText}
                          </p>
                        </div>
                      )}

                      {item.fileType === 'web_url' && (
                        <div className="p-4 w-full h-full bg-slate-900 flex flex-col items-center justify-center text-center">
                          <Globe className="w-8 h-8 mb-2 text-cyan-400 opacity-80" />
                          <p className="text-xs text-slate-300 font-mono truncate max-w-[200px]">
                            {item.fileUrl}
                          </p>
                        </div>
                      )}

                      {/* Duration Badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] text-white flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>{item.durationSeconds}s</span>
                      </div>

                      {/* Folder Tag */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-white font-medium">
                        {item.folder}
                      </div>
                    </div>

                    {/* Media Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{formatSize(item.fileSizeBytes)}</span>
                          <span className="capitalize">{item.fileType}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة</span>
                          </button>

                          <button
                            onClick={() => setAssignMediaItem(item)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer font-bold"
                            title="إرسال للشاشة مباشرة"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>بث لشاشة</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="تعديل الاسم والتصنيف"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteMedia(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List Mode */
              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">الملف</th>
                      <th className="p-3.5">النوع</th>
                      <th className="p-3.5">المجلد</th>
                      <th className="p-3.5">المدة</th>
                      <th className="p-3.5">الحجم</th>
                      <th className="p-3.5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMedia.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 overflow-hidden">
                            {item.fileType === 'image' ? (
                              <img src={item.fileUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              getFileIcon(item.fileType)
                            )}
                          </div>
                          <span className="truncate max-w-[220px]">{item.name}</span>
                        </td>
                        <td className="p-3.5 text-slate-600 capitalize">{item.fileType}</td>
                        <td className="p-3.5 text-slate-600">{item.folder}</td>
                        <td className="p-3.5 font-mono text-slate-600">{item.durationSeconds}s</td>
                        <td className="p-3.5 font-mono text-slate-500">{formatSize(item.fileSizeBytes)}</td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setPreviewItem(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                              title="معاينة"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAssignMediaItem(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 cursor-pointer"
                              title="بث لشاشة"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMedia(item.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: READY-MADE ONLINE STOCK CONTENT CATALOG (استعراض واستيراد)        */}
      {/* ========================================================================= */}
      {mainTab === 'stock_catalog' && (
        <div className="space-y-6">
          {/* Category Filter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 'all', label: 'الكل (30+ عنصر)', icon: Compass },
              { id: 'restaurants', label: 'مطاعم ومقاهي', icon: Utensils },
              { id: 'retail', label: 'متاجر وتجزئة', icon: ShoppingBag },
              { id: 'clinics', label: 'عيادات وصحة', icon: Stethoscope },
              { id: 'corporate', label: 'شركات وعقارات', icon: Building2 },
              { id: 'widgets', label: 'أدوات ويب وبث', icon: Globe },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = stockCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setStockCategory(cat.id)}
                  className={`p-3.5 rounded-2xl border text-right flex flex-col justify-between space-y-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'glass-panel hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                  <span className="font-bold text-xs">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar for stock */}
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="ابحث في التصاميم والفيديوهات الجاهزة (قهوة، برجر، أزياء، عيادات، عقارات)..."
                className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold shrink-0">
              {filteredStockMedia.length} عنصر جاهز
            </span>
          </div>

          {/* Stock Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredStockMedia.map((item) => {
              const isImporting = importingId === item.id;

              return (
                <div
                  key={item.id}
                  className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all group"
                >
                  {/* Thumbnail / Media Preview */}
                  <div
                    onClick={() => setPreviewItem(item)}
                    className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    {item.fileType === 'image' && (
                      <img
                        src={item.fileUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}

                    {item.fileType === 'video' && (
                      <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <Film className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    )}

                    {item.fileType === 'ticker_text' && (
                      <div className="p-4 w-full h-full bg-gradient-to-br from-indigo-950 to-slate-900 flex flex-col justify-center text-center">
                        <Type className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                        <p className="text-xs text-indigo-200 line-clamp-2 leading-relaxed font-semibold">
                          {item.customTickerText}
                        </p>
                      </div>
                    )}

                    {item.fileType === 'web_url' && (
                      <div className="p-4 w-full h-full bg-slate-900 flex flex-col items-center justify-center text-center">
                        <Globe className="w-8 h-8 mb-2 text-cyan-400" />
                        <p className="text-xs text-slate-300 font-mono truncate max-w-[200px]">
                          {item.fileUrl}
                        </p>
                      </div>
                    )}

                    {/* Category Label */}
                    <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] text-white font-bold">
                      {item.categoryLabel}
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] text-white font-mono">
                      {item.durationSeconds}s
                    </div>
                  </div>

                  {/* Info & One-Click Import Button */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </button>

                      <button
                        onClick={() => importStockItem(item)}
                        disabled={isImporting}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isImporting ? 'جاري الاستيراد...' : 'استيراد لمكتبتي'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK ASSIGN TO SCREEN MODAL                                              */}
      {/* ========================================================================= */}
      {assignMediaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  بث "{assignMediaItem.name}" على شاشة
                </h3>
              </div>
              <button
                onClick={() => setAssignMediaItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold text-center">
                {assignSuccessMsg}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {screens.map((scr) => (
                  <button
                    key={scr.id}
                    onClick={() => assignToScreen(scr.id)}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-right flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-900">{scr.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">كود: {scr.registrationCode}</div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      scr.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {scr.status === 'online' ? 'متصل الآن' : 'غير متصل'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX / FULL MEDIA PREVIEW MODAL                                      */}
      {/* ========================================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl text-white">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{previewItem.name}</h3>
                <p className="text-[11px] text-slate-400">
                  النوع: {previewItem.fileType} • المدة: {previewItem.durationSeconds} ثانية
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[70vh] bg-black">
              {previewItem.fileType === 'image' && (
                <img
                  src={previewItem.fileUrl}
                  alt={previewItem.name}
                  className="max-h-[60vh] object-contain rounded-xl"
                />
              )}

              {previewItem.fileType === 'video' && (
                <video
                  src={previewItem.fileUrl}
                  controls
                  autoPlay
                  className="max-h-[60vh] rounded-xl w-full"
                />
              )}

              {previewItem.fileType === 'ticker_text' && (
                <div className="p-8 text-center bg-indigo-950/60 rounded-2xl w-full">
                  <span className="text-xs text-indigo-400 font-bold block mb-2">النص الإعلاني:</span>
                  <p className="text-xl font-bold text-white leading-relaxed">
                    {previewItem.customTickerText}
                  </p>
                </div>
              )}

              {previewItem.fileType === 'web_url' && (
                <div className="w-full h-96">
                  <iframe
                    src={previewItem.fileUrl}
                    className="w-full h-full rounded-xl border-0"
                    title={previewItem.name}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">تعديل بيانات الملف</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">اسم الملف</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">المجلد / التصنيف</label>
                <select
                  value={editFolder}
                  onChange={(e) => setEditFolder(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {defaultFolders.filter((f) => f !== 'الكل').map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveEdit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Media Modal */}
      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => loadMedia()}
      />
    </div>
  );
}
