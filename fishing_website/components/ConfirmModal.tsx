'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  isPrompt?: boolean;
  promptPlaceholder?: string;
  promptValue?: string;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  isPrompt = false,
  promptPlaceholder = 'Nhập lý do...',
  promptValue = '',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  const [val, setVal] = useState(promptValue);

  useEffect(() => {
    if (isOpen) {
      setVal(promptValue);
    }
  }, [isOpen, promptValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left font-sans">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-outline-variant/20 flex justify-between items-center">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-bold text-on-surface text-body-lg">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-on-surface-variant/70 hover:text-on-surface p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-body-sm text-on-surface-variant/90 font-medium leading-relaxed">
            {message}
          </p>

          {isPrompt && (
            <textarea
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={promptPlaceholder}
              rows={3}
              className="w-full p-3 bg-[#f8f9fa] border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-primary text-body-sm font-medium text-on-surface"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-outline-variant/20 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 rounded-lg text-body-sm font-bold text-on-surface-variant hover:bg-slate-100 cursor-pointer transition-colors bg-white"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(isPrompt ? val : undefined)}
            className="px-5 py-2 bg-[#00288e] hover:bg-[#1e40af] text-white text-body-sm font-bold rounded-lg cursor-pointer transition-colors border-none"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
