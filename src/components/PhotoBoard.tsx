import React, { useState } from 'react';
import { Camera, Heart, Plus, Trash2, MapPin, Calendar, Sparkles, Upload, Edit3, X, Check, Loader2, Image as ImageIcon, Smile } from 'lucide-react';
import { PhotoMemory } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { savePhotoToFirestore, deletePhotoFromFirestore } from '../lib/firebase';

export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  activeColor: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'happy', label: '開心', emoji: '😊', color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100', activeColor: 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300' },
  { id: 'blessed', label: '幸福', emoji: '🥰', color: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100', activeColor: 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300' },
  { id: 'angry', label: '生氣', emoji: '😤', color: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100', activeColor: 'bg-red-500 text-white border-red-600 ring-2 ring-red-300' },
  { id: 'hurried', label: '著急', emoji: '🏃‍♀️', color: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100', activeColor: 'bg-orange-500 text-white border-orange-600 ring-2 ring-orange-300' },
  { id: 'sad', label: '難過', emoji: '🥺', color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100', activeColor: 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300' },
  { id: 'nervous', label: '緊張', emoji: '💓', color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100', activeColor: 'bg-purple-500 text-white border-purple-600 ring-2 ring-purple-300' },
  { id: 'foodie', label: '貪吃', emoji: '😋', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100', activeColor: 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300' },
  { id: 'surprise', label: '驚喜', emoji: '✨', color: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100', activeColor: 'bg-yellow-500 text-white border-yellow-600 ring-2 ring-yellow-300' },
];

interface PhotoBoardProps {
  photos: PhotoMemory[];
  onUpdatePhotos: (newPhotos: PhotoMemory[]) => void | Promise<any>;
}

export const PhotoBoard: React.FC<PhotoBoardProps> = ({
  photos,
  onUpdatePhotos
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoMemory | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  const [formData, setFormData] = useState<PhotoMemory>({
    id: '',
    title: '',
    date: '2026-10-16 (Day 1)',
    caption: '',
    imageUrl: '',
    location: '',
    tag: '🥰 幸福'
  });

  const datePresets = [
    '2026-10-16 (Day 1)',
    '2026-10-17 (Day 2 晴寶生日)',
    '2026-10-18 (Day 3 行程尾聲)',
    '2026-10-16 16:30 煙波入住',
    '2026-10-17 18:00 法式慶生大餐'
  ];

  const handleOpenAdd = () => {
    setFormData({
      id: '',
      title: '',
      date: '2026-10-16 (Day 1)',
      caption: '',
      imageUrl: '',
      location: '',
      tag: '🥰 幸福'
    });
    setUploadError(null);
    setIsAdding(true);
    setEditingPhoto(null);
  };

  const filteredPhotos = (photos || []).filter(item => {
    if (selectedMoodFilter === 'all') return true;
    if (!item.tag) return false;
    return item.tag.includes(selectedMoodFilter);
  });

  const handleOpenEdit = (photo: PhotoMemory) => {
    setFormData({ ...photo });
    setUploadError(null);
    setEditingPhoto(photo);
    setIsAdding(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setUploadError(null);
      
      // Automatically compress and resize client-side to ensure rapid upload & stay well within Firestore 1MB limits
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.75
      });

      setFormData(prev => ({
        ...prev,
        imageUrl: compressed
      }));
    } catch (err: any) {
      console.error('Image compression error:', err);
      setUploadError(err.message || '圖片壓縮處理失敗，請嘗試其他相片');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      setUploadError('請提供照片網址或上傳圖片檔案');
      return;
    }

    try {
      setIsSaving(true);
      setUploadError(null);

      const item: PhotoMemory = {
        ...formData,
        id: 'photo-' + Date.now(),
        title: formData.title.trim() || '浪漫瞬間',
        date: formData.date.trim() || '2026-10-16 (Day 1)'
      };

      // 1. Sync directly to Firestore dedicated collection
      await savePhotoToFirestore(item);

      // 2. Update local state and overall trip store
      await onUpdatePhotos([item, ...photos]);

      setIsAdding(false);
      setFormData({
        id: '',
        title: '',
        date: '2026-10-16 (Day 1)',
        caption: '',
        imageUrl: '',
        location: '',
        tag: '甜蜜日常'
      });
    } catch (err: any) {
      console.error('Failed to save polaroid:', err);
      setUploadError(err.message || '儲存拍立得失敗，請檢查網路連線或是否已授權登入');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    if (!formData.imageUrl.trim()) {
      setUploadError('請提供照片網址或上傳圖片檔案');
      return;
    }

    try {
      setIsSaving(true);
      setUploadError(null);

      const updatedItem: PhotoMemory = {
        ...formData,
        id: editingPhoto.id,
        title: formData.title.trim() || '浪漫瞬間',
        date: formData.date.trim() || '2026-10-16 (Day 1)'
      };

      // 1. Sync directly to Firestore dedicated collection
      await savePhotoToFirestore(updatedItem);

      // 2. Update state
      const updated = photos.map(p => p.id === editingPhoto.id ? updatedItem : p);
      await onUpdatePhotos(updated);

      setEditingPhoto(null);
    } catch (err: any) {
      console.error('Failed to update polaroid:', err);
      setUploadError(err.message || '更新拍立得失敗，請檢查網路連線或是否已授權登入');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeletePhoto = async () => {
    if (!deletingPhotoId) return;
    try {
      setIsDeleting(true);
      // 1. Delete from Firestore collection
      await deletePhotoFromFirestore(deletingPhotoId);

      // 2. Delete from state
      const updated = photos.filter(p => p.id !== deletingPhotoId);
      await onUpdatePhotos(updated);

      setDeletingPhotoId(null);
    } catch (err: any) {
      console.error('Failed to delete photo from Firestore:', err);
      // Fallback: still delete locally
      const updated = photos.filter(p => p.id !== deletingPhotoId);
      onUpdatePhotos(updated);
      setDeletingPhotoId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-[var(--romantic-ink,#0F172A)] pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--romantic-border,#BAE6FD)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]">
              <Camera className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-[var(--romantic-ink,#0F172A)]">
              📸 專屬拍立得回憶牆
            </h2>
          </div>
          <p className="text-[var(--romantic-muted,#64748B)] text-xs sm:text-sm mt-1">
            記錄旅程中所有心動瞬間與可愛笑容，支援上傳照片與編輯回憶筆記。
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl btn-romantic-primary text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>新增拍立得相片</span>
        </button>
      </div>

      {/* Mood Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-[var(--romantic-border,#BAE6FD)] shadow-xs flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-[var(--romantic-muted,#64748B)] shrink-0 mr-1 flex items-center space-x-1">
          <Smile className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
          <span>心情分類：</span>
        </span>
        <button
          type="button"
          onClick={() => setSelectedMoodFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            selectedMoodFilter === 'all'
              ? 'btn-romantic-primary text-white shadow-xs font-bold'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-[var(--romantic-border,#BAE6FD)]'
          }`}
        >
          全部回憶 ({photos.length})
        </button>
        {MOOD_OPTIONS.map((mood) => {
          const count = photos.filter(p => p.tag && (p.tag.includes(mood.label) || p.tag.includes(mood.emoji))).length;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelectedMoodFilter(mood.label)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center space-x-1 border ${
                selectedMoodFilter === mood.label
                  ? `${mood.activeColor} shadow-xs font-bold scale-102`
                  : `${mood.color} border-[var(--romantic-border,#BAE6FD)]`
              }`}
            >
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
              {count > 0 && <span className="opacity-80 text-[10px]">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Polaroid Grid or Empty State */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-[var(--romantic-border,#BAE6FD)] text-center space-y-3">
          <Smile className="w-10 h-10 mx-auto text-[var(--romantic-muted,#64748B)] opacity-50" />
          <h4 className="font-serif text-base font-bold text-[var(--romantic-ink,#0F172A)]">
            尚無「{selectedMoodFilter}」心情的拍立得照片
          </h4>
          <p className="text-xs text-[var(--romantic-muted,#64748B)]">
            點擊上方「新增拍立得相片」，為這個心情留下專屬的浪漫回憶吧！
          </p>
          <button
            type="button"
            onClick={() => {
              const matched = MOOD_OPTIONS.find(m => m.label === selectedMoodFilter);
              setFormData({
                id: '',
                title: '',
                date: '2026-10-16 (Day 1)',
                caption: '',
                imageUrl: '',
                location: '',
                tag: matched ? `${matched.emoji} ${matched.label}` : selectedMoodFilter
              });
              setIsAdding(true);
            }}
            className="px-4 py-2 rounded-xl btn-romantic-primary text-white text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>立即新增「{selectedMoodFilter}」相片</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[var(--romantic-card-warm,#F8FAFC)] rounded-3xl p-5 border border-[var(--romantic-border,#BAE6FD)] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative group flex flex-col justify-between"
              style={{
                transform: idx % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'
              }}
            >
              <div>
                {/* Photo Container styled like classic Polaroid */}
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-inner border border-[var(--romantic-border,#BAE6FD)]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {item.tag && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20 shadow-md flex items-center space-x-1">
                      <span>{item.tag}</span>
                    </span>
                  )}

                  {/* Card Action Buttons (Edit & Delete) */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(item);
                      }}
                      className="p-1.5 rounded-full bg-white/90 hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-ink,#0F172A)] hover:text-[var(--romantic-rose,#0284C7)] shadow-md cursor-pointer transition-colors"
                      title="編輯這張相片"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingPhotoId(item.id);
                      }}
                      className="p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-[var(--romantic-ink,#0F172A)] hover:text-red-500 shadow-md cursor-pointer transition-colors"
                      title="刪除這張拍立得"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Caption & Metadata */}
                <div className="space-y-1.5 px-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[var(--romantic-ink,#0F172A)]">
                      {item.title}
                    </h3>
                    <Heart className="w-4 h-4 text-[var(--romantic-rose,#0284C7)] fill-[var(--romantic-rose,#0284C7)] animate-pulse" />
                  </div>

                  {item.caption && (
                    <p className="font-serif italic text-[var(--romantic-muted,#64748B)] text-xs sm:text-sm leading-relaxed">
                      「{item.caption}」
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--romantic-muted,#64748B)] pt-3 mt-3 border-t border-[var(--romantic-border,#BAE6FD)] px-1">
                <span className="flex items-center space-x-1 font-mono">
                  <Calendar className="w-3 h-3 text-[var(--romantic-rose,#0284C7)]" />
                  <span className="text-[var(--romantic-ink,#0F172A)] font-medium">{item.date}</span>
                </span>
                {item.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[var(--romantic-gold,#F59E0B)]" />
                    <span className="text-[var(--romantic-ink,#0F172A)]">{item.location}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add or Edit Photo Modal */}
      {(isAdding || editingPhoto) && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-8">
          <form 
            onSubmit={isAdding ? handleSaveAdd : handleSaveEdit} 
            className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] animate-in fade-in duration-150 space-y-4 max-h-[88vh] overflow-y-auto text-xs text-[var(--romantic-ink,#0F172A)] my-auto relative"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--romantic-border,#BAE6FD)] sticky top-0 bg-white z-20">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
                {isAdding ? '📸 新增浪漫拍立得' : '✏️ 編輯拍立得相片'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingPhoto(null);
                }}
                className="p-1.5 rounded-full text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                ⚠️ {uploadError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                相片標題 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：在奇美博物館前的甜蜜合照"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
              />
            </div>

            {/* Date Field & Presets */}
            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                拍攝時間 / 日期 *
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="例如：2026-10-16 (Day 1)"
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)] mb-1.5"
              />
              <div className="flex items-center flex-wrap gap-1">
                {datePresets.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setFormData({ ...formData, date: preset })}
                    className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                圖片來源 (上傳相片或輸入圖片網址) *
              </label>
              <div className="space-y-2">
                {/* Image Preview if available */}
                {formData.imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--romantic-border,#BAE6FD)] bg-slate-50 p-2 flex items-center space-x-3">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-[var(--romantic-rose,#0284C7)]">
                        <Check className="w-3.5 h-3.5" />
                        <span>相片已準備就緒 (最佳化壓縮)</span>
                      </div>
                      <p className="text-[11px] text-[var(--romantic-muted,#64748B)] truncate mt-0.5">
                        支援雲端即時同步與離線快取
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                      title="移除相片"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... 或貼上相片網址"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />

                <label className={`flex items-center justify-center space-x-2 py-2.5 px-3 border border-dashed border-[var(--romantic-border,#BAE6FD)] rounded-xl ${isCompressing ? 'bg-slate-100 cursor-not-allowed opacity-75' : 'bg-[var(--romantic-rose-light,#F0F9FF)] hover:brightness-95 cursor-pointer'} text-[var(--romantic-rose,#0284C7)] text-xs font-semibold transition-colors`}>
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--romantic-rose,#0284C7)]" />
                      <span>正在為手機最佳化相片壓縮中...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>從電腦 / 手機選取相片上傳 (自動高畫質壓縮)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isCompressing || isSaving}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                浪漫寄語 / 心情小語
              </label>
              <textarea
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                rows={3}
                placeholder="寫下當時的心動與感動..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                拍攝地點
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="例如：煙波大飯店、奇美博物館、國華街"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
              />
            </div>

            {/* Mood / Tag selection with Presets & Custom Input */}
            <div className="bg-[var(--romantic-card-warm,#F8FAFC)] p-3.5 rounded-2xl border border-[var(--romantic-border,#BAE6FD)] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--romantic-ink,#0F172A)] flex items-center space-x-1.5">
                  <Smile className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />
                  <span>拍照心情 / 標籤分類 *</span>
                </label>
                <span className="text-[10px] text-[var(--romantic-rose,#0284C7)] font-medium">
                  點選心情或自行手填
                </span>
              </div>

              {/* Mood Option Chips */}
              <div className="grid grid-cols-4 gap-1.5">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = formData.tag === `${mood.emoji} ${mood.label}` || 
                                     formData.tag === mood.label || 
                                     (Boolean(formData.tag) && (formData.tag.includes(mood.label) || formData.tag.includes(mood.emoji)));

                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          tag: `${mood.emoji} ${mood.label}`
                        }));
                      }}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                        isSelected
                          ? `${mood.activeColor} shadow-xs scale-102 font-bold`
                          : `${mood.color}`
                      }`}
                    >
                      <span className="text-sm">{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Manual Input field for custom typing */}
              <div className="relative pt-1">
                <input
                  type="text"
                  value={formData.tag || ''}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="可點選上方心情，或手填自訂標籤（如：感動大哭、手牽手散步）"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-xs font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)] pr-8"
                />
                {formData.tag && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tag: '' }))}
                    className="absolute right-2 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="清除文字"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--romantic-border,#BAE6FD)]">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setIsAdding(false);
                  setEditingPhoto(null);
                }}
                className="px-4 py-2 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSaving || isCompressing}
                className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>同步雲端儲存中...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isAdding ? '確認儲存相片' : '確認更新相片'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* In-app Delete Confirmation Modal */}
      {deletingPhotoId && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
              確認刪除這張拍立得？
            </h3>
            <p className="text-[var(--romantic-muted,#64748B)] text-xs mb-5">
              刪除後將會即時同步至雲端 Firebase，無法復原哦。
            </p>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingPhotoId(null)}
                className="flex-1 py-2.5 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] text-xs font-medium cursor-pointer border border-[var(--romantic-border,#BAE6FD)]"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeletePhoto}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-md cursor-pointer flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>刪除中...</span>
                  </>
                ) : (
                  <span>確認刪除</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
