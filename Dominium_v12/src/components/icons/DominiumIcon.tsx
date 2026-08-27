import React from 'react';
import { 
  DOMINIUM_ICON_REGISTRY, 
  IconSizeToken, 
  IconVariant, 
  SemanticIconKey 
} from './iconRegistry';
import { Sparkles, HelpCircle } from 'lucide-react';

export interface DominiumIconProps {
  name: SemanticIconKey;
  size?: IconSizeToken | number;
  variant?: IconVariant;
  className?: string;
  label?: string;
  ariaLabel?: string;
  decorative?: boolean;
  title?: string;
  style?: React.CSSProperties;
}

const SIZE_CLASSES: Record<IconSizeToken, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
  '2xl': 'w-8 h-8'
};

const VARIANT_CLASSES: Record<IconVariant, string> = {
  default: 'text-current',
  muted: 'text-zinc-400',
  active: 'text-amber-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-rose-400',
  info: 'text-blue-400',
  accent: 'text-indigo-400',
  gold: 'text-amber-300',
  purple: 'text-purple-400',
  cyan: 'text-cyan-400',
  disabled: 'text-zinc-600 opacity-50'
};

/**
 * Reusable Dominium Icon Component
 * Resolves semantic icon tokens to Lucide components with graceful fallbacks and accessibility support.
 */
export const DominiumIcon: React.FC<DominiumIconProps> = ({
  name,
  size = 'md',
  variant = 'default',
  className = '',
  label,
  ariaLabel,
  decorative,
  title,
  style
}) => {
  // Resolve icon component
  let IconComponent = DOMINIUM_ICON_REGISTRY[name];
  
  if (!IconComponent) {
    // Try to resolve domain fallback e.g. "career.unknown" -> "career.general"
    if (typeof name === 'string' && name.includes('.')) {
      const domain = name.split('.')[0];
      const domainFallback = DOMINIUM_ICON_REGISTRY[`${domain}.general`] || 
                             DOMINIUM_ICON_REGISTRY[`${domain}.default`] ||
                             DOMINIUM_ICON_REGISTRY[`nav.${domain}`];
      if (domainFallback) {
        IconComponent = domainFallback;
      }
    }
  }

  // Final fallback to generic spark/help
  if (!IconComponent) {
    IconComponent = DOMINIUM_ICON_REGISTRY['system.fallback'] || Sparkles || HelpCircle;
  }

  const effectiveLabel = label || ariaLabel;
  // If a label is provided, it's not purely decorative unless explicitly specified
  const isAriaHidden = decorative !== undefined ? decorative : !effectiveLabel;

  const sizeClass = typeof size === 'string' ? SIZE_CLASSES[size] || SIZE_CLASSES.md : '';
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.default;
  const customNumericSize = typeof size === 'number' ? size : undefined;

  return (
    <span 
      className={`inline-flex items-center justify-center shrink-0 ${variantClass} ${className}`}
      style={style}
      role={effectiveLabel ? 'img' : undefined}
      aria-label={effectiveLabel}
      aria-hidden={isAriaHidden}
      title={title || effectiveLabel}
    >
      <IconComponent 
        className={sizeClass} 
        size={customNumericSize}
        aria-hidden="true" 
      />
    </span>
  );
};
