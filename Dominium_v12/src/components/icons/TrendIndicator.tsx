import React from 'react';
import { DominiumIcon } from './DominiumIcon';
import { getTrendIcon } from './entityIconMappers';
import { IconSizeToken } from './iconRegistry';

export interface TrendIndicatorProps {
  trend: 'UP' | 'DOWN' | 'STABLE' | 'VOLATILE' | number | string;
  value?: string | number;
  showValue?: boolean;
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  trend,
  value,
  showValue = true,
  prefix = '',
  suffix = '',
  size = 'md',
  className = ''
}) => {
  const iconKey = getTrendIcon(trend);

  let iconVariant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'active' = 'default';
  let textClass = 'text-zinc-400';

  if (iconKey === 'trend.up') {
    iconVariant = 'success';
    textClass = 'text-emerald-400 font-semibold';
  } else if (iconKey === 'trend.down') {
    iconVariant = 'danger';
    textClass = 'text-rose-400 font-semibold';
  } else if (iconKey === 'trend.volatile') {
    iconVariant = 'warning';
    textClass = 'text-amber-400 font-semibold';
  }

  const iconSize: IconSizeToken = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';
  const textSizeClass = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm'
  }[size];

  // Format value
  let formattedValue = '';
  if (value !== undefined) {
    if (typeof value === 'number') {
      formattedValue = `${value >= 0 && iconKey === 'trend.up' ? '+' : ''}${value.toLocaleString()}`;
    } else {
      formattedValue = value;
    }
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 ${textSizeClass} ${textClass} ${className}`}
      role="status"
    >
      <DominiumIcon 
        name={iconKey} 
        size={iconSize} 
        variant={iconVariant} 
        decorative 
      />
      {showValue && formattedValue && (
        <span className="leading-none tracking-tight">
          {prefix}{formattedValue}{suffix}
        </span>
      )}
    </span>
  );
};
