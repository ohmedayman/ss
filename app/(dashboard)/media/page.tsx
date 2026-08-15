'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  LayoutGrid,
  List,
  Check,
  Folder,
  FolderOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Edit3,
  AlertTriangle,
} from 'lucide-react';

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([]);
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
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const defaultFolders = ['الكل', 'عام', 'إعلانات', 'فيديو', 'قوائم الطعام', 'نصوص'];

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

  const bulkDelete = async () => {
    try {
      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        await loadMedia();
        setSelectedIds(new Set());
        setBulkDeleteConfirm(false);
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

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMedia.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMedia.map((item) => item.id)));
    }
  };

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
      <Header
        title="مكتبة الوسائط والمحتوى"
        subtitle="إدارة ورفع الصور ومقاطع الفيديو وصفحات الويب وأشرطة الأخبار"
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      <div className="flex gap-6">
        {/* Folder Sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="glass-panel rounded-2xl p-3 space-y-1 sticky top-24">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
              المجلدات
            </h4>
            {folders.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFolder(f.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedFolder === f.name
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  {selectedFolder === f.name ? (
                    <FolderOpen className="w-4 h-4" />
                  ) : (
                    <Folder className="w-4 h-4" />
                  )}
                  {f.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedFolder === f.name
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Mobile Folder Tabs */}
          <div className="lg:hidden overflow-x-auto flex gap-2 pb-1">
            {folders.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFolder(f.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                  selectedFolder === f.name
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
              >
                {f.name} ({f.count})
              </button>
            ))}
          </div>

          {/* Control Bar */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في ملفات الوسائط..."
                className="input pl-3 pr-9"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    filterType === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                  }`}
                >
                  الكل
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
                  صور
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
                  فيديو
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
                  نصوص
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
                  ويب
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 cursor-pointer"
              >
                <option value="date">التاريخ</option>
                <option value="name">الاسم</option>
                <option value="size">الحجم</option>
                <option value="type">النوع</option>
              </select>

              <button
                onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
              </button>

              {/* View Toggle */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <div className="glass-panel rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  selectedIds.size === filteredMedia.length && filteredMedia.length > 0
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 ${
                    selectedIds.size === filteredMedia.length && filteredMedia.length > 0
                      ? 'text-white'
                      : 'text-slate-400'
                  }`}
                />
                تحديد الكل
              </button>
              {selectedIds.size > 0 && (
                <span className="text-xs text-indigo-600 font-semibold">
                  {selectedIds.size} محدد
                </span>
              )}
            </div>
            {selectedIds.size > 0 && (
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف المحدد ({selectedIds.size})
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredMedia.length === 0 && (
            <div className="text-center py-20 glass-panel rounded-2xl">
              <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-400 font-medium">لا توجد ملفات وسائط</p>
            </div>
          )}

          {/* Grid View */}
          {!loading && viewMode === 'grid' && filteredMedia.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-slate-200 group"
                >
                  {/* Checkbox */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        selectedIds.has(item.id)
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white/80 border-slate-300 text-transparent group-hover:border-slate-400'
                      }`}
                    >
                      {selectedIds.has(item.id) && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {/* Thumbnail */}
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

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <div className="w-full">
                          <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-300 capitalize">{item.fileType}</span>
                            {item.durationSeconds > 0 && (
                              <span className="text-[10px] text-slate-300">{item.durationSeconds} ث</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      {item.durationSeconds > 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] text-slate-300 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{item.durationSeconds} ثانية</span>
                        </div>
                      )}

                      {/* Folder Tag */}
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300">
                        {item.folder || 'عام'}
                      </div>
                    </div>
                  </div>

                  {/* Media Info */}
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
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
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
          )}

          {/* List View */}
          {!loading && viewMode === 'list' && filteredMedia.length > 0 && (
            <div className="glass-panel rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-3 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer ${
                          selectedIds.size === filteredMedia.length && filteredMedia.length > 0
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 text-transparent'
                        }`}
                      >
                        {selectedIds.size === filteredMedia.length && filteredMedia.length > 0 && (
                          <Check className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="p-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      الملف
                    </th>
                    <th className="p-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="p-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      الحجم
                    </th>
                    <th className="p-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      المدة
                    </th>
                    <th className="p-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      المجلد
                    </th>
                    <th className="p-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedia.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelect(item.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer ${
                            selectedIds.has(item.id)
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 text-transparent hover:border-slate-400'
                          }`}
                        >
                          {selectedIds.has(item.id) && <Check className="w-3 h-3" />}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewItem(item)}
                            className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center cursor-pointer shrink-0"
                          >
                            {item.fileType === 'image' && (
                              <img
                                src={item.fileUrl || item.thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                            {item.fileType === 'video' && <Film className="w-4 h-4 text-indigo-400" />}
                            {item.fileType === 'ticker_text' && <Type className="w-4 h-4 text-indigo-400" />}
                            {item.fileType === 'web_url' && <Globe className="w-4 h-4 text-cyan-400" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={item.name}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{formatSize(item.fileSizeBytes)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-slate-600 capitalize">{item.fileType}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-slate-600">{formatSize(item.fileSizeBytes)}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-slate-600">{item.durationSeconds || 0} ث</span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-slate-600">{item.folder || 'عام'}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="معاينة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="relative max-w-4xl w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(previewItem.fileType)}
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{previewItem.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                    <span>النوع: {previewItem.fileType}</span>
                    <span>•</span>
                    <span>{formatSize(previewItem.fileSizeBytes)}</span>
                    {previewItem.durationSeconds > 0 && (
                      <>
                        <span>•</span>
                        <span>{previewItem.durationSeconds} ثانية</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(previewItem)}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
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

            {/* File Details */}
            <div className="p-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-1">الحجم</p>
                <p className="text-xs font-bold text-slate-800">{formatSize(previewItem.fileSizeBytes)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-1">النوع</p>
                <p className="text-xs font-bold text-slate-800 capitalize">{previewItem.fileType}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-1">المجلد</p>
                <p className="text-xs font-bold text-slate-800">{previewItem.folder || 'عام'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-1">المدة</p>
                <p className="text-xs font-bold text-slate-800">{previewItem.durationSeconds || 0} ثانية</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">تعديل الملف</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">الاسم</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">المجلد</label>
                <select
                  value={editFolder}
                  onChange={(e) => setEditFolder(e.target.value)}
                  className="input w-full cursor-pointer"
                >
                  {defaultFolders
                    .filter((f) => f !== 'الكل')
                    .map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">تأكيد الحذف</h3>
            <p className="text-xs text-slate-500 mb-5">هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => deleteMedia(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">تأكيد حذف المحدد</h3>
            <p className="text-xs text-slate-500 mb-5">
              هل أنت متأكد من حذف {selectedIds.size} ملف؟ لا يمكن التراجع.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={bulkDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
              >
                حذف الكل ({selectedIds.size})
              </button>
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
