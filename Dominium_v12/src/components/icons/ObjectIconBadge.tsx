import React from 'react';
import { DominiumIcon } from './DominiumIcon';
import { SemanticIconKey, IconVariant } from './iconRegistry';

export interface ObjectIconBadgeProps {
  icon: SemanticIconKey;
  variant?: IconVariant;
  category?: 
    | 'career' 
    | 'banking' 
    | 'credit' 
    | 'investment' 
    | 'property' 
    | 'company' 
    | 'legal' 
    | 'politics' 
    | 'world' 
    | 'family' 
    | 'event' 
    | 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; border: string; defaultVariant: IconVariant }> = {
  career: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', defaultVariant: 'success' },
  banking: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', defaultVariant: 'info' },
  credit: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', defaultVariant: 'accent' },
  investment: { bg: 'bg-amber-400/10', border: 'border-amber-400/20', defaultVariant: 'gold' },
  property: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', defaultVariant: 'warning' },
  company: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', defaultVariant: 'purple' },
  legal: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', defaultVariant: 'danger' },
  politics: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', defaultVariant: 'cyan' },
  world: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', defaultVariant: 'info' },
  family: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', defaultVariant: 'active' },
  event: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', defaultVariant: 'gold' },
  default: { bg: 'bg-zinc-800/60', border: 'border-zinc-700/50', defaultVariant: 'default' }
};

const SIZE_CONTAINERS = {
  sm: { box: 'w-7 h-7 rounded-lg', iconSize: 'xs' as const },
  md: { box: 'w-9 h-9 rounded-xl', iconSize: 'sm' as const },
  lg: { box: 'w-11 h-11 rounded-xl', iconSize: 'md' as const },
  xl: { box: 'w-14 h-14 rounded-2xl', iconSize: 'lg' as const }
};

export const ObjectIconBadge: React.FC<ObjectIconBadgeProps> = ({
  icon,
  variant,
  category = 'default',
  size = 'md',
  className = '',
  label
}) => {
  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;
  const resolvedVariant = variant || catStyle.defaultVariant;
  const sizeConfig = SIZE_CONTAINERS[size] || SIZE_CONTAINERS.md;

  return (
    <div 
      className={`shrink-0 flex items-center justify-center border shadow-xs select-none ${sizeConfig.box} ${catStyle.bg} ${catStyle.border} ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      title={label}
    >
      <DominiumIcon 
        name={icon} 
        size={sizeConfig.iconSize} 
        variant={resolvedVariant} 
        decorative={!label}
      />
    </div>
  );
};
