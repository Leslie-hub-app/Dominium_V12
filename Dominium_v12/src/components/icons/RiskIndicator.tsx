import React from 'react';
import { DominiumIcon } from './DominiumIcon';
import { getRiskIcon } from './entityIconMappers';
import { IconSizeToken } from './iconRegistry';

export interface RiskIndicatorProps {
  risk: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'EMERGENCY' | string;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  risk,
  label,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const iconKey = getRiskIcon(risk);
  const displayLabel = label || `${risk.toUpperCase()} RISK`;

  const val = risk.toLowerCase();
  let containerStyle = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
  let iconVariant: 'default' | 'success' | 'warning' | 'danger' | 'info' = 'default';

  if (val.includes('safe') || val.includes('low')) {
    containerStyle = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
    iconVariant = 'success';
  } else if (val.includes('moderate') || val.includes('medium')) {
    containerStyle = 'bg-amber-950/40 text-amber-300 border-amber-800/40';
    iconVariant = 'warning';
  } else if (val.includes('high') || val.includes('elevated')) {
    containerStyle = 'bg-orange-950/50 text-orange-300 border-orange-800/50';
    iconVariant = 'warning';
  } else if (val.includes('critical') || val.includes('emergency') || val.includes('severe')) {
    containerStyle = 'bg-rose-950/60 text-rose-300 border-rose-800/60 animate-pulse';
    iconVariant = 'danger';
  }

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[10.5px] px-2 py-0.5 gap-1.5',
    lg: 'text-xs px-2.5 py-1 gap-2'
  }[size];

  const iconSize: IconSizeToken = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  return (
    <span 
      className={`inline-flex items-center font-bold rounded-md border tracking-wider select-none ${sizeClasses} ${containerStyle} ${className}`}
      role="status"
      title={`Risk Assessment: ${risk}`}
    >
      <DominiumIcon 
        name={iconKey} 
        size={iconSize} 
        variant={iconVariant} 
        decorative 
      />
      {showLabel && <span className="leading-none">{displayLabel}</span>}
    </span>
  );
};
