import React, { useState } from 'react';
import { Camera, Heart, Plus, Trash2, MapPin, Calendar, Sparkles, Upload } from 'lucide-react';
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
  const [newPhoto, setNewPhoto] = useState<PhotoMemory>({
    id: '',
    title: '',
    date: '美好回憶',
    caption: '',
    imageUrl: '',
    location: '',
    tag: '甜蜜日常'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setNewPhoto({
          ...newPhoto,
          imageUrl: evt.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.imageUrl.trim()) {
      alert('請提供照片網址或上傳圖片');
      return;
    }

    const item: PhotoMemory = {
      ...newPhoto,
      id: 'photo-' + Date.now(),
      title: newPhoto.title.trim() || '浪漫瞬間',
      date: newPhoto.date || '生日旅程'
    };

    onUpdatePhotos([item, ...photos]);
    setIsAdding(false);
    setNewPhoto({
      id: '',
      title: '',
      date: '美好回憶',
      caption: '',
      imageUrl: '',
      location: '',
      tag: '甜蜜日常'
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這張拍立得照片嗎？')) {
      onUpdatePhotos(photos.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Camera className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-850">
              📸 專屬拍立得回憶牆
            </h2>
          </div>
          <p className="text-stone-700 text-xs sm:text-sm mt-1">
            記錄旅程中所有心動瞬間與可愛笑容，旅途結束後也能永遠珍藏。
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs shadow-rose-200 flex items-center space-x-1.5 cursor-pointer"
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
            className="bg-white rounded-3xl p-5 border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative group flex flex-col justify-between"
            style={{
              transform: idx % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'
            }}
          >
            <div>
              {/* Photo Container styled like classic Polaroid */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 mb-4 shadow-inner">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {item.tag && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs text-white text-[10px] font-medium border border-white/20">
                    {item.tag}
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-10"
                  title="刪除這張拍立得"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Caption & Metadata */}
              <div className="space-y-1.5 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-stone-850">
                    {item.title}
                  </h3>
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                </div>

                {item.caption && (
                  <p className="font-serif italic text-stone-600 text-xs sm:text-sm leading-relaxed">
                    「{item.caption}」
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3 mt-3 border-t border-stone-100 px-1">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-rose-400" />
                <span>{item.date}</span>
              </span>
              {item.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{item.location}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Photo Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-4">
            <h3 className="font-serif text-xl font-bold text-stone-850">
              📸 新增浪漫拍立得相片
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                相片標題
              </label>
              <input
                type="text"
                value={newPhoto.title}
                onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                placeholder="例如：在東京鐵塔下的第一個約定"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                圖片來源 (上傳相片或輸入圖片網址) *
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newPhoto.imageUrl}
                  onChange={(e) => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 text-xs"
                />

                <label className="flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-rose-300 rounded-xl bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-medium cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>從電腦/手機上傳圖片檔案</span>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                浪漫寄語 / 心情小語
              </label>
              <textarea
                value={newPhoto.caption}
                onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                rows={2}
                placeholder="寫下當時的心動與感動..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  地點
                </label>
                <input
                  type="text"
                  value={newPhoto.location || ''}
                  onChange={(e) => setNewPhoto({ ...newPhoto, location: e.target.value })}
                  placeholder="六本木之丘"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  標籤分類
                </label>
                <input
                  type="text"
                  value={newPhoto.tag || ''}
                  onChange={(e) => setNewPhoto({ ...newPhoto, tag: e.target.value })}
                  placeholder="甜蜜回憶"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs shadow-rose-200 cursor-pointer"
              >
                儲存相片
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
