import React, { useState } from 'react';
import { Heart, X, Edit3, Check, Sparkles, Feather, Plus } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[var(--romantic-card-warm,#F8FAFC)] rounded-3xl shadow-2xl border-2 border-[var(--romantic-border,#BAE6FD)] p-5 sm:p-8 text-[var(--romantic-ink,#0F172A)] animate-in fade-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto my-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[var(--romantic-muted,#64748B)] transition-colors cursor-pointer"
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
                ? 'btn-romantic-gold text-white'
                : 'bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-ink,#0F172A)] border border-[var(--romantic-border,#BAE6FD)]'
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
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] rounded-full text-xs font-semibold mb-2 border border-[var(--romantic-border,#BAE6FD)]">
              <Feather className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
              <span>A Love Letter For Your Special Day</span>
            </div>

            {!isEditing ? (
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--romantic-ink,#0F172A)]">
                {loveLetter.title}
              </h2>
            ) : (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-center font-serif text-2xl font-bold text-[var(--romantic-ink,#0F172A)] border-b border-[var(--romantic-border,#BAE6FD)] bg-transparent focus:outline-hidden pb-1"
              />
            )}
          </div>

          {/* Letter Body */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[var(--romantic-border,#BAE6FD)] shadow-sm font-serif leading-relaxed text-[var(--romantic-ink,#0F172A)] space-y-4">
            
            {/* Opening */}
            {!isEditing ? (
              <p className="font-bold text-[var(--romantic-rose,#0284C7)] text-lg">
                {loveLetter.openingText}
              </p>
            ) : (
              <div>
                <label className="block text-[11px] font-sans font-semibold text-[var(--romantic-muted,#64748B)] mb-1">稱呼 (開頭)</label>
                <input
                  type="text"
                  value={formData.openingText}
                  onChange={(e) => setFormData({ ...formData, openingText: e.target.value })}
                  className="w-full font-bold text-[var(--romantic-rose,#0284C7)] text-lg border-b border-[var(--romantic-border,#BAE6FD)] bg-transparent focus:outline-hidden"
                />
              </div>
            )}

            {/* Paragraphs */}
            {!isEditing ? (
              loveLetter.bodyParagraphs.map((para, idx) => (
                <p key={idx} className="text-[var(--romantic-ink,#0F172A)] leading-loose text-sm sm:text-base indent-4">
                  {para}
                </p>
              ))
            ) : (
              <div className="space-y-3 font-sans">
                <label className="block text-[11px] font-semibold text-[var(--romantic-muted,#64748B)]">信件正文段落</label>
                {formData.bodyParagraphs.map((para, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <textarea
                      value={para}
                      onChange={(e) => handleParagraphChange(idx, e.target.value)}
                      rows={2}
                      className="flex-1 p-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] text-sm focus:outline-[var(--romantic-rose,#0284C7)] font-serif leading-relaxed bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
                    />
                    <button
                      onClick={() => handleRemoveParagraph(idx)}
                      className="p-2 text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] text-xs cursor-pointer"
                      title="刪除此段"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddParagraph}
                  className="px-3 py-1.5 rounded-xl border border-dashed border-[var(--romantic-border,#BAE6FD)] text-[var(--romantic-rose,#0284C7)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增段落</span>
                </button>
              </div>
            )}

            {/* Closing */}
            {!isEditing ? (
              <div className="pt-4 text-right">
                <p className="text-sm font-semibold text-[var(--romantic-muted,#64748B)]">
                  {loveLetter.closingText}
                </p>
                <p className="text-lg font-bold text-[var(--romantic-rose,#0284C7)] mt-1 font-serif">
                  {loveLetter.signature} 💕
                </p>
              </div>
            ) : (
              <div className="pt-4 grid grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--romantic-muted,#64748B)] mb-1">結尾祝賀語</label>
                  <input
                    type="text"
                    value={formData.closingText}
                    onChange={(e) => setFormData({ ...formData, closingText: e.target.value })}
                    className="w-full text-sm font-semibold border-b border-[var(--romantic-border,#BAE6FD)] bg-transparent focus:outline-hidden text-[var(--romantic-ink,#0F172A)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--romantic-muted,#64748B)] mb-1">簽名</label>
                  <input
                    type="text"
                    value={formData.signature}
                    onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                    className="w-full text-sm font-bold text-[var(--romantic-rose,#0284C7)] border-b border-[var(--romantic-border,#BAE6FD)] bg-transparent focus:outline-hidden"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-[var(--romantic-muted,#64748B)] flex items-center justify-center space-x-1 font-serif">
            <Heart className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)] fill-[var(--romantic-rose,#0284C7)]" />
            <span>這是一封永遠珍藏的專屬手寫情書，陪伴晴寶渡過每一個美好生日。</span>
          </div>

        </div>

      </div>
    </div>
  );
};
