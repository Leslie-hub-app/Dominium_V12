import React from 'react';
import { DominiumIcon, SemanticIconKey } from './icons';

export type ActiveHubType = 
  | 'feed' 
  | 'inbox'
  | 'objectives'
  | 'life' 
  | 'family' 
  | 'wealth' 
  | 'empire' 
  | 'politics' 
  | 'economy' 
  | 'projects' 
  | 'sports' 
  | 'news' 
  | 'settings'
  | 'more'
  | 'world';

interface BottomNavProps {
  activeHub?: ActiveHubType;
  activeTab?: ActiveHubType;
  onSelectHub?: (hub: ActiveHubType) => void;
  onChangeTab?: (hub: ActiveHubType) => void;
  onAdvanceMonth?: () => void;
  isSimulating?: boolean;
  pendingDecisionsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeHub,
  activeTab,
  onSelectHub,
  onChangeTab,
  onAdvanceMonth,
  isSimulating = false,
  pendingDecisionsCount = 0
}) => {
  const currentTab = activeTab || activeHub || 'feed';
  const handleSelect = onSelectHub || onChangeTab || (() => {});

  // Determine active primary destination
  const isHomeActive = currentTab === 'feed' || currentTab === 'inbox' || currentTab === 'objectives';
  const isLifeActive = currentTab === 'life' || currentTab === 'family';
  const isWealthActive = currentTab === 'wealth';
  const isEmpireActive = currentTab === 'empire' || currentTab === 'projects' || currentTab === 'sports';
  const isWorldActive = currentTab === 'world' || currentTab === 'politics' || currentTab === 'economy' || currentTab === 'news';
  const isMoreActive = currentTab === 'more' || currentTab === 'settings';

  const primaryMobileNav: { id: ActiveHubType; label: string; iconKey: SemanticIconKey; isActive: boolean; badge?: number | string }[] = [
    {
      id: 'feed',
      label: 'Home',
      iconKey: 'nav.home',
      isActive: isHomeActive,
      badge: pendingDecisionsCount > 0 ? pendingDecisionsCount : undefined,
    },
    {
      id: 'life',
      label: 'Life',
      iconKey: 'nav.life',
      isActive: isLifeActive,
    },
    {
      id: 'wealth',
      label: 'Wealth',
      iconKey: 'nav.wealth',
      isActive: isWealthActive,
    },
    {
      id: 'empire',
      label: 'Empire',
      iconKey: 'nav.empire',
      isActive: isEmpireActive,
    },
    {
      id: 'world',
      label: 'World',
      iconKey: 'nav.world',
      isActive: isWorldActive,
    },
    {
      id: 'more',
      label: 'More',
      iconKey: 'nav.more',
      isActive: isMoreActive,
      badge: pendingDecisionsCount > 0 ? '!' : undefined,
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#141418] border-t border-[rgba(236,236,232,0.08)] select-none shadow-[0_-10px_25px_rgba(0,0,0,0.6)] safe-nav-bottom">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1 flex items-center justify-between gap-1 sm:gap-2">
        {/* Primary navigation plus a persistent authoritative world simulation control. */}
        <div className="flex-1 grid grid-cols-6 gap-0.5 sm:gap-1">
          {primaryMobileNav.map(item => {
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`min-h-[48px] sm:min-h-[52px] py-1 px-0.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative touch-manipulation active:scale-95 ${
                  item.isActive
                    ? 'bg-[rgba(236,236,232,0.09)] text-amber-400 font-bold shadow-sm'
                    : 'bg-transparent text-[rgba(236,236,232,0.6)] hover:bg-[rgba(236,236,232,0.05)] hover:text-[#ececec]'
                }`}
                aria-label={item.label}
              >
                <div className="relative">
                  <DominiumIcon 
                    name={item.iconKey} 
                    size="lg" 
                    variant={item.isActive ? 'active' : 'default'} 
                    decorative 
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 bg-rose-500 text-white text-[8.5px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] tracking-tight leading-none truncate max-w-full">
                  {item.label}
                </span>
                {item.isActive && (
                  <div className="w-3 h-0.5 bg-amber-400 rounded-full absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom-right simulation control. It calls the same authoritative monthly
            pipeline as every other advance control and is locked during execution. */}
        <button
          type="button"
          onClick={() => onAdvanceMonth?.()}
          disabled={!onAdvanceMonth || isSimulating}
          className={`shrink-0 min-h-[48px] sm:min-h-[52px] min-w-[58px] sm:min-w-[68px] rounded-xl flex flex-col items-center justify-center gap-0.5 touch-manipulation transition-all border ${
            isSimulating
              ? 'bg-[rgba(236,236,232,0.05)] border-[rgba(236,236,232,0.08)] text-[rgba(236,236,232,0.35)] cursor-wait'
              : 'bg-amber-400 text-[#141418] border-amber-300 shadow-lg hover:bg-amber-300 active:scale-95 cursor-pointer'
          }`}
          aria-label={isSimulating ? 'Simulating world' : 'Advance to next month'}
          title={isSimulating ? 'Simulating world…' : 'Advance one month'}
        >
          <DominiumIcon
            name="action.advance"
            size="lg"
            variant={isSimulating ? 'muted' : 'active'}
            decorative
          />
          <span className="text-[9px] sm:text-[10px] font-black leading-none">
            {isSimulating ? 'SIM' : 'NEXT'}
          </span>
        </button>
      </div>
    </footer>
  );
};
