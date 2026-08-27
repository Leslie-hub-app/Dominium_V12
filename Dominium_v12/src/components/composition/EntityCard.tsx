import React from 'react';
import { DominiumIcon, SemanticIconKey } from '../icons';
import { ChevronRight } from 'lucide-react';

export interface EntityCardProps {
  title: string;
  subtitle?: string;
  iconKey: SemanticIconKey;
  statusBadge?: {
    label: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  metrics?: {
    label: string;
    value: string | number;
    color?: string;
  }[];
  tags?: string[];
  actionLabel?: string;
  onAction?: () => void;
  onClick?: () => void;
  className?: string;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  iconKey,
  statusBadge,
  metrics = [],
  tags = [],
  actionLabel,
  onAction,
  onClick,
  className = ''
}) => {
  const getBadgeClass = (variant: string = 'neutral') => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
      case 'warning':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      case 'danger':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
      case 'info':
        return 'bg-blue-950/70 text-blue-300 border-blue-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 sm:p-3.5 rounded-xl bg-[#141418] border border-[rgba(236,236,232,0.08)] hover:border-amber-400/30 transition-all flex flex-col justify-between gap-2.5 ${
        onClick ? 'cursor-pointer active:scale-99' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1a1a20] border border-[rgba(236,236,232,0.08)] flex items-center justify-center shrink-0">
            <DominiumIcon name={iconKey} size="lg" variant="active" decorative />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-[#ececec] truncate">
                {title}
              </h3>
              {statusBadge && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${getBadgeClass(statusBadge.variant)}`}>
                  {statusBadge.label}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[10.5px] text-[rgba(236,236,232,0.55)] font-mono truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {onAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="px-2.5 py-1 rounded-lg bg-[#1e1e26] hover:bg-amber-400 hover:text-zinc-950 text-amber-300 text-[10.5px] font-mono font-bold border border-[rgba(236,236,232,0.1)] transition-all cursor-pointer shrink-0 flex items-center gap-1 active:scale-95"
          >
            <span>{actionLabel || 'Manage'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-[rgba(236,236,232,0.06)]">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-[#1a1a20] p-1.5 rounded-lg border border-[rgba(236,236,232,0.05)]">
              <span className="text-[9.5px] font-mono text-[rgba(236,236,232,0.5)] block truncate">
                {m.label}
              </span>
              <span
                className="text-xs font-mono font-black truncate block mt-0.5"
                style={{ color: m.color || '#ececec' }}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap pt-1">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/60"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
