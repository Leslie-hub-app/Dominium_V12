import React from 'react';
import { DominiumIcon, SemanticIconKey } from '../icons';

export interface DominiumScreenProps {
  id?: string;
  title?: string;
  subtitle?: string;
  iconKey?: SemanticIconKey;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const DominiumScreen: React.FC<DominiumScreenProps> = ({
  id,
  title,
  subtitle,
  iconKey,
  badge,
  actions,
  className = '',
  children
}) => {
  return (
    <div id={id} className={`w-full space-y-4 animate-fade-in ${className}`}>
      {(title || iconKey || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[rgba(236,236,232,0.08)]">
          <div className="flex items-center gap-2.5 min-w-0">
            {iconKey && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1a1a20] border border-[rgba(236,236,232,0.08)] flex items-center justify-center shrink-0 shadow-sm">
                <DominiumIcon name={iconKey} size="lg" variant="active" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#ececec] truncate">
                  {title}
                </h1>
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && (
                <p className="text-xs text-[rgba(236,236,232,0.6)] font-mono truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
              {actions}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
};
