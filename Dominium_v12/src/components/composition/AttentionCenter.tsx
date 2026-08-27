import React from 'react';
import { DominiumIcon, SemanticIconKey } from '../icons';
import { AlertCircle, AlertTriangle, Zap, ChevronRight, Bell, Clock } from 'lucide-react';

export interface AttentionItem {
  id: string;
  title: string;
  description: string;
  level: 'critical' | 'warning' | 'opportunity' | 'info';
  category?: string;
  iconKey?: SemanticIconKey;
  actionLabel?: string;
  onAction?: () => void;
}

export interface AttentionCenterProps {
  items: AttentionItem[];
  onOpenInbox?: () => void;
  className?: string;
}

export const AttentionCenter: React.FC<AttentionCenterProps> = ({
  items,
  onOpenInbox,
  className = ''
}) => {
  if (items.length === 0) {
    return null;
  }

  const getLevelStyles = (level: AttentionItem['level']) => {
    switch (level) {
      case 'critical':
        return {
          container: 'bg-rose-950/40 border-rose-500/40 hover:border-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />,
          btn: 'bg-rose-500 hover:bg-rose-400 text-white'
        };
      case 'warning':
        return {
          container: 'bg-amber-950/30 border-amber-500/30 hover:border-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          btn: 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold'
        };
      case 'opportunity':
        return {
          container: 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: <Zap className="w-4 h-4 text-emerald-400 shrink-0" />,
          btn: 'bg-emerald-500 hover:bg-emerald-400 text-white font-bold'
        };
      case 'info':
      default:
        return {
          container: 'bg-[#18181e] border-[rgba(236,236,232,0.1)] hover:border-amber-400/40',
          badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          icon: <Bell className="w-4 h-4 text-blue-400 shrink-0" />,
          btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
        };
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-[rgba(236,236,232,0.9)]">
            Attention Required
          </span>
          <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {items.length}
          </span>
        </div>

        {onOpenInbox && (
          <button
            onClick={onOpenInbox}
            className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
          >
            <span>View Inbox</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {items.slice(0, 3).map((item) => {
          const styles = getLevelStyles(item.level);
          return (
            <div
              key={item.id}
              className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${styles.container}`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5">{styles.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-[#ececec] truncate">
                      {item.title}
                    </span>
                    {item.category && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${styles.badge}`}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[rgba(236,236,232,0.7)] line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {item.onAction && (
                <button
                  onClick={item.onAction}
                  className={`px-3 py-1.5 rounded-lg text-xs shrink-0 cursor-pointer transition-all active:scale-95 touch-manipulation self-end sm:self-auto ${styles.btn}`}
                >
                  {item.actionLabel || 'Respond'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
