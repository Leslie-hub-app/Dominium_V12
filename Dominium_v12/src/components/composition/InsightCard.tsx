import React from 'react';
import { DominiumIcon, SemanticIconKey } from '../icons';
import { ChevronRight } from 'lucide-react';

export interface InsightCardProps {
  title: string;
  category?: string;
  iconKey?: SemanticIconKey;
  description: string;
  importance?: 'low' | 'medium' | 'high' | 'critical';
  impactText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  category,
  iconKey,
  description,
  importance = 'medium',
  impactText,
  actionLabel,
  onAction,
  className = ''
}) => {
  const getImportanceBadge = () => {
    switch (importance) {
      case 'critical':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      case 'low':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      case 'medium':
      default:
        return 'bg-blue-950/70 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className={`p-3 rounded-xl bg-[#16161a] border border-[rgba(236,236,232,0.08)] hover:border-[rgba(236,236,232,0.2)] transition-all space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {iconKey && <DominiumIcon name={iconKey} size="md" decorative />}
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#ececec] truncate block">
              {title}
            </span>
            {category && (
              <span className="text-[9.5px] text-[rgba(236,236,232,0.5)] font-mono uppercase tracking-wider">
                {category}
              </span>
            )}
          </div>
        </div>

        {importance && (
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${getImportanceBadge()}`}>
            {importance.toUpperCase()}
          </span>
        )}
      </div>

      <p className="text-[11.5px] text-[rgba(236,236,232,0.7)] leading-relaxed line-clamp-3 font-sans">
        {description}
      </p>

      {(impactText || onAction) && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(236,236,232,0.05)]">
          {impactText ? (
            <span className="text-[10px] font-mono text-amber-300 truncate">
              {impactText}
            </span>
          ) : <div />}

          {onAction && (
            <button
              onClick={onAction}
              className="text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer ml-auto active:scale-95"
            >
              <span>{actionLabel || 'Details'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
