import React from 'react';
import { DominiumIcon, SemanticIconKey } from '../icons';

export interface QuickActionItem {
  id: string;
  label: string;
  subLabel?: string;
  iconKey: SemanticIconKey;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  badge?: string | number;
  disabled?: boolean;
}

export interface QuickActionBarProps {
  actions: QuickActionItem[];
  title?: string;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  actions,
  title,
  columns = 4,
  className = ''
}) => {
  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2 sm:grid-cols-3';
      case 4: return 'grid-cols-2 sm:grid-cols-4';
      case 5: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
      default: return 'grid-cols-2 sm:grid-cols-4';
    }
  };

  const getVariantStyles = (variant: QuickActionItem['variant'] = 'secondary') => {
    switch (variant) {
      case 'primary':
        return 'bg-amber-400 text-zinc-950 hover:bg-amber-300 border-amber-300 font-black shadow-md';
      case 'accent':
        return 'bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60 border-emerald-500/40';
      case 'danger':
        return 'bg-rose-950/50 text-rose-300 hover:bg-rose-900/60 border-rose-500/40';
      case 'outline':
        return 'bg-transparent text-[rgba(236,236,232,0.8)] hover:bg-[#1a1a20] border-[rgba(236,236,232,0.15)]';
      case 'secondary':
      default:
        return 'bg-[#18181e] text-[rgba(236,236,232,0.85)] hover:bg-[#22222a] hover:text-[#ececec] border-[rgba(236,236,232,0.08)]';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[rgba(236,236,232,0.5)]">
            {title}
          </span>
        </div>
      )}

      <div className={`grid ${getGridCols()} gap-1.5 sm:gap-2`}>
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={act.onClick}
            disabled={act.disabled}
            className={`min-h-[44px] py-2 px-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer select-none touch-manipulation active:scale-95 text-left relative ${getVariantStyles(
              act.variant
            )} ${act.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
          >
            <div className="shrink-0">
              <DominiumIcon 
                name={act.iconKey} 
                size="md" 
                variant={act.variant === 'primary' ? 'active' : 'default'} 
                decorative 
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold leading-tight truncate">
                {act.label}
              </div>
              {act.subLabel && (
                <div className="text-[9.5px] opacity-60 font-mono leading-none truncate mt-0.5">
                  {act.subLabel}
                </div>
              )}
            </div>

            {act.badge !== undefined && (
              <span className="shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {act.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
