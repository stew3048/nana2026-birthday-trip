import React, { useState } from 'react';
import { Heart, X, Edit3, Check, Sparkles, Feather } from 'lucide-react';
import { LoveLetter } from '../types';

interface LoveLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  loveLetter: LoveLetter;
  onUpdateLoveLetter: (newLetter: LoveLetter) => void;
}

export const LoveLetterModal: React.FC<LoveLetterModalProps> = ({
  isOpen,
  onClose,
  loveLetter,
  onUpdateLoveLetter
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LoveLetter>({ ...loveLetter });

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateLoveLetter(formData);
    setIsEditing(false);
  };

  const handleParagraphChange = (index: number, value: string) => {
    const updated = [...formData.bodyParagraphs];
    updated[index] = value;
    setFormData({ ...formData, bodyParagraphs: updated });
  };

  const handleAddParagraph = () => {
    setFormData({
      ...formData,
      bodyParagraphs: [...formData.bodyParagraphs, '']
    });
  };

  const handleRemoveParagraph = (index: number) => {
    const updated = formData.bodyParagraphs.filter((_, i) => i !== index);
    setFormData({ ...formData, bodyParagraphs: updated });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-amber-50/95 rounded-3xl shadow-2xl border-2 border-rose-200/80 p-6 sm:p-10 text-stone-850 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Action Toggle (Edit / View) */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setFormData({ ...loveLetter });
                setIsEditing(true);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isEditing
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-white/80 hover:bg-white text-stone-700 border border-stone-200'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>完成編輯</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>修改手寫信內容</span>
              </>
            )}
          </button>
        </div>

        {/* Letter Container */}
        <div className="mt-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold mb-2">
              <Feather className="w-3.5 h-3.5 text-rose-500" />
              <span>A Love Letter For Your Special Day</span>
            </div>

            {!isEditing ? (
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {loveLetter.title}
              </h2>
            ) : (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-center font-serif text-2xl font-bold text-stone-900 border-b border-rose-300 bg-transparent focus:outline-hidden pb-1"
              />
            )}
          </div>

          {/* Letter Body */}
          <div className="bg-white/90 rounded-2xl p-6 sm:p-8 border border-rose-200/80 shadow-sm font-serif leading-relaxed text-stone-800 space-y-4">
            
            {/* Opening */}
            {!isEditing ? (
              <p className="font-bold text-rose-700 text-lg">
                {loveLetter.openingText}
              </p>
            ) : (
              <div>
                <label className="block text-[11px] font-sans font-semibold text-stone-400 mb-1">稱呼 (開頭)</label>
                <input
                  type="text"
                  value={formData.openingText}
                  onChange={(e) => setFormData({ ...formData, openingText: e.target.value })}
                  className="w-full font-bold text-rose-700 text-lg border-b border-stone-200 bg-transparent focus:outline-hidden"
                />
              </div>
            )}

            {/* Paragraphs */}
            {!isEditing ? (
              loveLetter.bodyParagraphs.map((para, idx) => (
                <p key={idx} className="text-stone-700 leading-loose text-sm sm:text-base indent-4">
                  {para}
                </p>
              ))
            ) : (
              <div className="space-y-3 font-sans">
                <label className="block text-[11px] font-semibold text-stone-400">信件正文段落</label>
                {formData.bodyParagraphs.map((para, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <textarea
                      value={para}
                      onChange={(e) => handleParagraphChange(idx, e.target.value)}
                      rows={2}
                      className="flex-1 p-2 rounded-xl border border-stone-200 text-sm focus:outline-rose-400 font-serif leading-relaxed"
                    />
                    <button
                      onClick={() => handleRemoveParagraph(idx)}
                      className="p-2 text-stone-400 hover:text-rose-600 text-xs"
                      title="刪除此段"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={handleAddParagraph}
                  className="px-3 py-1.5 rounded-xl border border-dashed border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                >
                  + 新增一個段落
                </button>
              </div>
            )}

            {/* Closing & Signature */}
            <div className="pt-6 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {!isEditing ? (
                <>
                  <span className="italic text-rose-600 font-medium text-sm sm:text-base">
                    {loveLetter.closingText}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                    <span className="font-bold text-stone-850">
                      {loveLetter.authorName}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full grid grid-cols-2 gap-3 font-sans">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">祝福結尾語</label>
                    <input
                      type="text"
                      value={formData.closingText}
                      onChange={(e) => setFormData({ ...formData, closingText: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">落款署名</label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-stone-700">
            💖 每次她點開這封手寫信，都能感受到你最深情的祝福與用心
          </div>

        </div>

      </div>
    </div>
  );
};
