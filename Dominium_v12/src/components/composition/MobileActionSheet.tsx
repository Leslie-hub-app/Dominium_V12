import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { DominiumIcon, SemanticIconKey } from '../icons';

export interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  iconKey?: SemanticIconKey;
  children: React.ReactNode;
}

export const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  iconKey,
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="flex-1 w-full" onClick={onClose} />

      <div className="w-full max-h-[85vh] bg-[#141418] border-t border-[rgba(236,236,232,0.12)] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up safe-bottom-pad">
        {/* Drag handle bar */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mt-2 mb-1 shrink-0" />

        {/* Sheet Header */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[rgba(236,236,232,0.08)] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {iconKey && (
              <div className="w-8 h-8 rounded-xl bg-[#1e1e24] border border-[rgba(236,236,232,0.08)] flex items-center justify-center shrink-0">
                <DominiumIcon name={iconKey} size="md" variant="active" decorative />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-black text-[#ececec] truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[10.5px] font-mono text-[rgba(236,236,232,0.55)] truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#1a1a20] hover:bg-[#25252e] text-zinc-400 hover:text-zinc-200 border border-[rgba(236,236,232,0.08)] flex items-center justify-center cursor-pointer transition-all active:scale-95"
            aria-label="Close sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable sheet body */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-[calc(85vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
