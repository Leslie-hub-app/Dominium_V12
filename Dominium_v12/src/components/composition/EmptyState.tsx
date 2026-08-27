import React from 'react';
import { DominiumIcon, SemanticIconKey } from '../icons';

export interface EmptyStateProps {
  title: string;
  description: string;
  iconKey?: SemanticIconKey;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  iconKey = 'action.info',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 rounded-2xl bg-[#141418] border border-[rgba(236,236,232,0.08)] flex flex-col items-center justify-center text-center space-y-3.5 shadow-md ${className}`}>
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1c1c22] border border-[rgba(236,236,232,0.1)] flex items-center justify-center shadow-inner">
        <DominiumIcon name={iconKey} size="xl" variant="active" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-sm sm:text-base font-extrabold text-[#ececec] tracking-tight">{title}</h3>
        <p className="text-xs text-[rgba(236,236,232,0.6)] leading-relaxed font-mono">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 touch-manipulation"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Simulating world state...',
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 rounded-2xl bg-[#141418] border border-[rgba(236,236,232,0.08)] flex flex-col items-center justify-center text-center space-y-3 shadow-md ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-[#1c1c22] border border-amber-400/30 flex items-center justify-center animate-spin">
        <DominiumIcon name="system.simulation" size="lg" variant="active" />
      </div>
      <p className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">{message}</p>
    </div>
  );
};
