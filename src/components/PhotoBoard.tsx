import React, { useState } from 'react';
import { Camera, Heart, Plus, Trash2, MapPin, Calendar, Sparkles, Upload, Edit3, X, Check } from 'lucide-react';
import { PhotoMemory } from '../types';

interface PhotoBoardProps {
  photos: PhotoMemory[];
  onUpdatePhotos: (newPhotos: PhotoMemory[]) => void;
}

export const PhotoBoard: React.FC<PhotoBoardProps> = ({
  photos,
  onUpdatePhotos
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoMemory | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PhotoMemory>({
    id: '',
    title: '',
    date: '2026-10-16 (Day 1)',
    caption: '',
    imageUrl: '',
    location: '',
    tag: '甜蜜日常'
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
      tag: '甜蜜日常'
    });
    setUploadError(null);
    setIsAdding(true);
    setEditingPhoto(null);
  };

  const handleOpenEdit = (photo: PhotoMemory) => {
    setFormData({ ...photo });
    setUploadError(null);
    setEditingPhoto(photo);
    setIsAdding(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFormData(prev => ({
          ...prev,
          imageUrl: evt.target?.result as string
        }));
        setUploadError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      setUploadError('請提供照片網址或上傳圖片檔案');
      return;
    }

    const item: PhotoMemory = {
      ...formData,
      id: 'photo-' + Date.now(),
      title: formData.title.trim() || '浪漫瞬間',
      date: formData.date.trim() || '2026-10-16 (Day 1)'
    };

    onUpdatePhotos([item, ...photos]);
    setIsAdding(false);
    setUploadError(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    if (!formData.imageUrl.trim()) {
      setUploadError('請提供照片網址或上傳圖片檔案');
      return;
    }

    const updated = photos.map(p => {
      if (p.id === editingPhoto.id) {
        return {
          ...formData,
          id: editingPhoto.id,
          title: formData.title.trim() || '浪漫瞬間',
          date: formData.date.trim() || '2026-10-16 (Day 1)'
        };
      }
      return p;
    });

    onUpdatePhotos(updated);
    setEditingPhoto(null);
    setUploadError(null);
  };

  const confirmDeletePhoto = () => {
    if (!deletingPhotoId) return;
    const updated = photos.filter(p => p.id !== deletingPhotoId);
    onUpdatePhotos(updated);
    setDeletingPhotoId(null);
  };

  return (
    <div className="space-y-6 text-[var(--romantic-ink,#0F172A)]">
      
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

      {/* Polaroid Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((item, idx) => (
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
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium border border-white/20">
                    {item.tag}
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

      {/* Add or Edit Photo Modal */}
      {(isAdding || editingPhoto) && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form 
            onSubmit={isAdding ? handleSaveAdd : handleSaveEdit} 
            className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] animate-in fade-in duration-150 space-y-4 max-h-[90vh] overflow-y-auto text-xs text-[var(--romantic-ink,#0F172A)] my-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--romantic-border,#BAE6FD)]">
              <h3 className="font-serif text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
                {isAdding ? '📸 新增浪漫拍立得相片' : '✏️ 編輯拍立得相片'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingPhoto(null);
                }}
                className="p-1 rounded-full text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] hover:bg-[var(--romantic-card-warm,#F8FAFC)]"
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
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />

                <label className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-dashed border-[var(--romantic-border,#BAE6FD)] rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] hover:brightness-95 text-[var(--romantic-rose,#0284C7)] text-xs font-semibold cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>從電腦 / 手機選取相片上傳</span>
                  <input
                    type="file"
                    accept="image/*"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  地點
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="例如：煙波大飯店、奇美博物館"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  標籤分類
                </label>
                <input
                  type="text"
                  value={formData.tag || ''}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="例如：甜蜜回憶、法式大餐"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--romantic-border,#BAE6FD)]">
              <button
                type="button"
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
                className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>{isAdding ? '確認儲存相片' : '確認更新相片'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* In-app Delete Confirmation Modal */}
      {deletingPhotoId && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                onClick={() => setDeletingPhotoId(null)}
                className="flex-1 py-2.5 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] text-xs font-medium cursor-pointer border border-[var(--romantic-border,#BAE6FD)]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDeletePhoto}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
