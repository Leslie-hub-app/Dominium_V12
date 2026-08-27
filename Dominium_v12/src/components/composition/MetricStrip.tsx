import React from 'react';
import { TrendIndicator, DominiumIcon, SemanticIconKey } from '../icons';

export interface MetricItem {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  iconKey?: SemanticIconKey;
  color?: string;
  badge?: string;
  badgeVariant?: 'active' | 'success' | 'warning' | 'info' | 'neutral';
  onClick?: () => void;
}

export interface MetricStripProps {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export const MetricStrip: React.FC<MetricStripProps> = ({
  metrics,
  columns = 4,
  className = ''
}) => {
  const getGridColsClass = () => {
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2 sm:grid-cols-3';
      case 4: return 'grid-cols-2 sm:grid-cols-4';
      case 5: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5';
      case 6: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
      default: return 'grid-cols-2 sm:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getGridColsClass()} gap-2 sm:gap-2.5 ${className}`}>
      {metrics.map((metric, idx) => {
        const isClickable = Boolean(metric.onClick);
        return (
          <div
            key={idx}
            onClick={metric.onClick}
            className={`p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[rgba(236,236,232,0.08)] flex flex-col justify-between transition-all ${
              isClickable 
                ? 'hover:bg-[#1c1c22] hover:border-amber-400/30 cursor-pointer active:scale-98 shadow-sm' 
                : ''
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10.5px] sm:text-xs text-[rgba(236,236,232,0.6)] font-mono font-medium truncate">
                  {metric.label}
                </span>
                {metric.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                    metric.badgeVariant === 'warning'
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                      : metric.badgeVariant === 'neutral'
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {metric.badge}
                  </span>
                )}
              </div>
              {metric.iconKey && (
                <DominiumIcon name={metric.iconKey} size="sm" decorative />
              )}
            </div>

            <div className="flex items-baseline justify-between gap-1 flex-wrap">
              <span 
                className="text-sm sm:text-base font-black font-mono tracking-tight text-[#ececec] truncate"
                style={{ color: metric.color }}
              >
                {metric.value}
              </span>

              {(metric.trend || metric.trendText) && (
                <div className="flex items-center gap-0.5 text-[9.5px] font-mono">
                  {metric.trend && <TrendIndicator trend={metric.trend} size="sm" />}
                  {metric.trendText && (
                    <span className={metric.trend === 'up' ? 'text-emerald-400' : metric.trend === 'down' ? 'text-rose-400' : 'text-zinc-400'}>
                      {metric.trendText}
                    </span>
                  )}
                </div>
              )}
            </div>

            {metric.subValue && (
              <span className="text-[9.5px] text-[rgba(236,236,232,0.45)] font-mono mt-0.5 truncate">
                {metric.subValue}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
