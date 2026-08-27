import React from 'react';
import { DominiumIcon } from './DominiumIcon';
import { getStatusIcon } from './entityIconMappers';
import { IconSizeToken } from './iconRegistry';

export interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const iconKey = getStatusIcon(status);
  const displayLabel = label || status.replace(/_/g, ' ');

  // Color mapping based on semantic status
  const val = status.toLowerCase();
  let badgeStyle = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
  let iconVariant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'active' | 'muted' = 'default';

  if (val.includes('active') || val.includes('approved') || val.includes('completed') || val.includes('success') || val.includes('profitable') || val.includes('unlocked')) {
    badgeStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50';
    iconVariant = 'success';
  } else if (val.includes('pending') || val.includes('progress') || val.includes('review') || val.includes('paused')) {
    badgeStyle = 'bg-amber-950/60 text-amber-300 border-amber-800/50';
    iconVariant = 'warning';
  } else if (val.includes('failed') || val.includes('rejected') || val.includes('loss') || val.includes('error') || val.includes('cancelled') || val.includes('default') || val.includes('locked')) {
    badgeStyle = 'bg-rose-950/60 text-rose-300 border-rose-800/50';
    iconVariant = 'danger';
  } else if (val.includes('info') || val.includes('operating')) {
    badgeStyle = 'bg-blue-950/60 text-blue-300 border-blue-800/50';
    iconVariant = 'info';
  }

  const sizeClasses = {
    sm: 'text-[9.5px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2 py-0.5 gap-1.5',
    lg: 'text-xs px-2.5 py-1 gap-2'
  }[size];

  const iconSize: IconSizeToken = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  return (
    <span 
      className={`inline-flex items-center font-medium rounded-md border tracking-tight uppercase select-none ${sizeClasses} ${badgeStyle} ${className}`}
      role="status"
    >
      {showIcon && (
        <DominiumIcon 
          name={iconKey} 
          size={iconSize} 
          variant={iconVariant} 
          decorative 
        />
      )}
      <span className="truncate leading-none">{displayLabel}</span>
    </span>
  );
};
