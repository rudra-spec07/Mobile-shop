import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
  '3xl': 'max-w-5xl',
  '4xl': 'max-w-6xl',
  full: 'max-w-7xl',
};

const Modal = ({ isOpen, onClose, title, children, maxWidth, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedMaxWidth = maxWidth || sizeMap[size] || 'max-w-lg';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs anim-backdrop-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${resolvedMaxWidth} max-h-[88vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden anim-modal-in my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 rounded-xl hover:text-slate-700 hover:bg-slate-200/60 hover:rotate-90 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with internal scrolling */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
