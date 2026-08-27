import React, { useRef, useEffect } from 'react';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { DominiumIcon, SemanticIconKey } from '../icons';

export type PrimaryTabType = 'feed' | 'life' | 'family' | 'wealth' | 'empire' | 'world' | 'more';

export interface NavItemConfig {
  id: string;
  label: string;
  iconKey?: SemanticIconKey;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

export interface GlobalSecondaryNavProps {
  primaryTab: PrimaryTabType | string;
  activeSubTab: string;
  onSelectSubTab: (subTabId: string) => void;
  state?: any;
  // Contextual counts & badges
  pendingDecisionsCount?: number;
  completedObjectivesRatio?: string;
  activeEventChainsCount?: number;
  activeCooldownsCount?: number;
  currentJobTitle?: string;
  allocatedHours?: string;
  relationshipsCount?: number;
  dynastyGeneration?: number;
  dynastyTimelineCount?: number;
  companiesCount?: number;
  activeProjectsCount?: number;
  ownedTeamsCount?: number;
  inOfficeTitle?: string;
  activePoliticalChainsCount?: number;
  unreadNewsCount?: number;
  powerTier?: string;
}

export const GlobalSecondaryNav: React.FC<GlobalSecondaryNavProps> = ({
  primaryTab,
  activeSubTab,
  onSelectSubTab,
  state,
  pendingDecisionsCount: explicitPendingDecisions,
  completedObjectivesRatio: explicitCompletedObjectivesRatio,
  activeEventChainsCount: explicitActiveEventChainsCount,
  activeCooldownsCount: explicitActiveCooldownsCount,
  currentJobTitle: explicitCurrentJobTitle,
  allocatedHours: explicitAllocatedHours,
  relationshipsCount: explicitRelationshipsCount,
  dynastyGeneration: explicitDynastyGeneration,
  dynastyTimelineCount: explicitDynastyTimelineCount,
  companiesCount: explicitCompaniesCount,
  activeProjectsCount: explicitActiveProjectsCount,
  ownedTeamsCount: explicitOwnedTeamsCount,
  inOfficeTitle: explicitInOfficeTitle,
  activePoliticalChainsCount: explicitActivePoliticalChainsCount,
  unreadNewsCount: explicitUnreadNewsCount,
  powerTier: explicitPowerTier
}) => {
  // Derive counts from state if available
  const pendingDecisionsCount = explicitPendingDecisions ?? (state?.pendingDecisions?.length || 0);
  const activeEventChainsCount = explicitActiveEventChainsCount ?? (state?.activeEventChains?.length || 0);
  const activeCooldownsCount = explicitActiveCooldownsCount ?? (state?.cooldowns ? Object.keys(state.cooldowns).length : 0);
  const currentJobTitle = explicitCurrentJobTitle ?? (state?.currentJob?.title || (state?.character?.occupation !== 'Unemployed' ? state?.character?.occupation : undefined));
  const allocatedHours = explicitAllocatedHours ?? (state?.lifeSystem?.timeAllocation ? `${state.lifeSystem.timeAllocation.workHours + state.lifeSystem.timeAllocation.overtimeHours}h` : undefined);
  const relationshipsCount = explicitRelationshipsCount ?? (state?.relationships?.length || 0);
  const dynastyGeneration = explicitDynastyGeneration ?? (state?.dynastyGeneration || 1);
  const dynastyTimelineCount = explicitDynastyTimelineCount ?? (state?.dynastyTimeline?.length || 0);
  const companiesCount = explicitCompaniesCount ?? (state?.companies?.length || 0);
  const activeProjectsCount = explicitActiveProjectsCount ?? ((state?.projects || state?.megaProjects || []).filter((p: any) => p.status === 'In Progress' || p.status === 'Active Construction').length);
  const ownedTeamsCount = explicitOwnedTeamsCount ?? (state?.sports?.ownedTeams?.length || state?.sportsClubs?.length || 0);
  const inOfficeTitle = explicitInOfficeTitle ?? (state?.politics?.currentOffice?.inOffice ? state.politics.currentOffice.title : undefined);
  const activePoliticalChainsCount = explicitActivePoliticalChainsCount ?? ((state?.activeEventChains || []).filter((c: any) => c.category === 'POLITICS' || c.id?.includes('pol_')).length);
  const unreadNewsCount = explicitUnreadNewsCount ?? (state?.newsArchive?.length || state?.newsFeed?.length || 0);
  const powerTier = explicitPowerTier ?? (state?.playerPowerProfile?.powerTier || 'UNKNOWN');
  const completedObjectivesRatio = explicitCompletedObjectivesRatio;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Define secondary navigation items for each primary game system
  const getNavItems = (): NavItemConfig[] => {
    switch (primaryTab) {
      case 'feed':
      case 'inbox':
      case 'objectives':
        return [
          {
            id: 'chronology',
            label: 'Chronology',
            iconKey: 'nav.chronology'
          },
          {
            id: 'inbox',
            label: 'Decisions',
            iconKey: 'nav.inbox',
            badge: pendingDecisionsCount > 0 ? pendingDecisionsCount : undefined,
            badgeColor: 'bg-rose-500 text-white animate-pulse'
          },
          {
            id: 'objectives',
            label: 'Objectives',
            iconKey: 'nav.objectives',
            badge: completedObjectivesRatio,
            badgeColor: 'bg-amber-400/20 text-amber-300'
          },
          {
            id: 'decision_history',
            label: 'History',
            iconKey: 'nav.history'
          },
          {
            id: 'event_chains',
            label: 'Event Chains',
            iconKey: 'nav.event_chains',
            badge: activeEventChainsCount > 0 ? activeEventChainsCount : undefined,
            badgeColor: 'bg-indigo-500/20 text-indigo-300'
          },
          {
            id: 'event_control',
            label: 'Event Monitor',
            iconKey: 'nav.event_monitor',
            badge: activeCooldownsCount > 0 ? activeCooldownsCount : undefined,
            badgeColor: 'bg-zinc-800 text-zinc-300'
          }
        ];

      case 'life':
        return [
          {
            id: 'overview',
            label: 'Overview',
            iconKey: 'nav.event_monitor'
          },
          {
            id: 'profile',
            label: 'Me & Timeline',
            iconKey: 'nav.life'
          },
          {
            id: 'schedule',
            label: 'Schedule',
            iconKey: 'career.workload',
            badge: allocatedHours,
            badgeColor: 'bg-blue-500/20 text-blue-300'
          },
          {
            id: 'career',
            label: 'Career & Jobs',
            iconKey: 'career.general',
            badge: currentJobTitle ? currentJobTitle.split(' ')[0] : undefined,
            badgeColor: 'bg-emerald-500/20 text-emerald-300'
          },
          {
            id: 'education',
            label: 'Education',
            iconKey: 'edu.degree'
          },
          {
            id: 'dating',
            label: 'Dating',
            iconKey: 'rel.love'
          },
          {
            id: 'relationships',
            label: 'Relationships',
            iconKey: 'family.family',
            badge: relationshipsCount > 0 ? relationshipsCount : undefined,
            badgeColor: 'bg-purple-500/20 text-purple-300'
          },
          {
            id: 'marketplace',
            label: 'Marketplace',
            iconKey: 'action.buy'
          },
          {
            id: 'social',
            label: 'Social Media',
            iconKey: 'media.social'
          },
          {
            id: 'wellness',
            label: 'Wellness',
            iconKey: 'govt.healthcare'
          }
        ];

      case 'family':
        return [
          {
            id: 'household',
            label: 'Household & Kin',
            iconKey: 'family.family',
            badge: relationshipsCount > 0 ? relationshipsCount : undefined,
            badgeColor: 'bg-amber-400/20 text-amber-300'
          },
          {
            id: 'profile',
            label: `Dynasty Gen ${dynastyGeneration}`,
            iconKey: 'family.dynasty'
          },
          {
            id: 'succession',
            label: 'Succession Studio',
            iconKey: 'family.succession'
          },
          {
            id: 'timeline',
            label: 'Heritage Timeline',
            iconKey: 'story.timeline',
            badge: dynastyTimelineCount > 0 ? dynastyTimelineCount : undefined,
            badgeColor: 'bg-zinc-800 text-zinc-300'
          },
          {
            id: 'chronicles',
            label: 'Chronicles',
            iconKey: 'story.chronicle'
          }
        ];

      case 'wealth':
        return [
          {
            id: 'overview',
            label: 'Financial Overview',
            iconKey: 'finance.wealth'
          },
          {
            id: 'stocks',
            label: 'Stocks & Crypto',
            iconKey: 'investment.stock'
          },
          {
            id: 'properties',
            label: 'Real Estate',
            iconKey: 'property.general'
          },
          {
            id: 'banking',
            label: 'Banking & Credit',
            iconKey: 'banking.bank'
          },
          {
            id: 'leaderboard',
            label: 'Billionaires Ranking',
            iconKey: 'event.achievement'
          }
        ];

      case 'empire':
      case 'projects':
      case 'sports':
        return [
          {
            id: 'companies',
            label: 'Corporate Command',
            iconKey: 'business.company',
            badge: companiesCount > 0 ? companiesCount : undefined,
            badgeColor: 'bg-amber-400/20 text-amber-300'
          },
          {
            id: 'projects',
            label: 'Mega-Projects',
            iconKey: 'nav.projects',
            badge: activeProjectsCount > 0 ? activeProjectsCount : undefined,
            badgeColor: 'bg-purple-500/20 text-purple-300'
          },
          {
            id: 'sports',
            label: 'Sports Franchises',
            iconKey: 'nav.sports',
            badge: ownedTeamsCount > 0 ? ownedTeamsCount : undefined,
            badgeColor: 'bg-orange-500/20 text-orange-300'
          }
        ];

      case 'world':
      case 'politics':
      case 'economy':
      case 'news':
        return [
          {
            id: 'overview',
            label: 'World Intelligence',
            iconKey: 'world.globe',
            badge: (state?.livingWorld?.activeWorldEvents?.length || 0) > 0 ? `${state.livingWorld.activeWorldEvents.length}` : undefined,
            badgeColor: 'bg-amber-400/20 text-amber-300'
          },
          {
            id: 'competitors',
            label: 'Competitors & Dynasties',
            iconKey: 'business.competition',
            badge: state?.livingWorld?.competitors?.length || undefined,
            badgeColor: 'bg-purple-500/20 text-purple-300'
          },
          {
            id: 'politics',
            label: 'Politics & Governance',
            iconKey: 'politics.politics',
            badge: inOfficeTitle || (activePoliticalChainsCount > 0 ? activePoliticalChainsCount : undefined),
            badgeColor: inOfficeTitle ? 'bg-amber-400/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
          },
          {
            id: 'economy',
            label: 'Economy & Cities',
            iconKey: 'govt.economy'
          },
          {
            id: 'news',
            label: 'Global Intelligence',
            iconKey: 'media.news',
            badge: unreadNewsCount > 0 ? unreadNewsCount : undefined,
            badgeColor: 'bg-cyan-500/20 text-cyan-300'
          },
          {
            id: 'history',
            label: 'World Chronicles',
            iconKey: 'story.chronicle',
            badge: (state?.livingWorld?.worldHistory?.length || 0) > 0 ? `${state.livingWorld.worldHistory.length}` : undefined,
            badgeColor: 'bg-zinc-800 text-zinc-300'
          }
        ];

      case 'more':
      case 'settings':
        return [
          {
            id: 'hub_overview',
            label: 'System Hub',
            iconKey: 'nav.home'
          },
          {
            id: 'inbox',
            label: 'Decisions',
            iconKey: 'nav.inbox',
            badge: pendingDecisionsCount > 0 ? pendingDecisionsCount : undefined,
            badgeColor: 'bg-rose-500 text-white'
          },
          {
            id: 'objectives',
            label: 'Objectives',
            iconKey: 'nav.objectives'
          },
          {
            id: 'power_profile',
            label: 'Power Hierarchy',
            iconKey: 'nav.power',
            badge: powerTier,
            badgeColor: 'bg-amber-400/20 text-amber-300'
          },
          {
            id: 'settings',
            label: 'Settings & Saves',
            iconKey: 'nav.settings'
          },
          {
            id: 'tests',
            label: 'Diagnostics',
            iconKey: 'nav.tests'
          }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Scroll active item into view smoothly on change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeSubTab, primaryTab]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (navItems.length === 0) return null;

  return (
    <nav 
      aria-label="Secondary contextual navigation"
      className="bg-[#0f0f13]/95 backdrop-blur-md border-b border-[rgba(236,236,232,0.08)] sticky top-[53px] sm:top-[57px] md:top-[61px] z-20 px-1 sm:px-2 py-1.5 shadow-md select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-1 relative group">
        {/* Left Scroll Float Button */}
        <button
          onClick={() => handleScroll('left')}
          className="shrink-0 h-8 w-7 rounded-lg bg-[#16161a]/90 hover:bg-[#23232b] text-zinc-400 hover:text-amber-400 border border-[rgba(236,236,232,0.08)] flex items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95 shadow-sm"
          title="Scroll tabs left"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontally floatable / scrollable items list (strictly left to right) */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5 scroll-smooth whitespace-nowrap"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {navItems.map(item => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                data-active={isActive}
                onClick={() => onSelectSubTab(item.id)}
                className={`min-h-[34px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer select-none shrink-0 touch-manipulation active:scale-95 ${
                  isActive
                    ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                    : 'bg-[#16161a] text-[rgba(236,236,232,0.65)] hover:text-[#ececec] hover:bg-[#1f1f25] border border-[rgba(236,236,232,0.06)]'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-zinc-950' : 'text-[rgba(236,236,232,0.6)]'}`}>
                  {item.iconKey ? (
                    <DominiumIcon 
                      name={item.iconKey} 
                      size="sm" 
                      variant={isActive ? 'default' : 'muted'} 
                      decorative 
                    />
                  ) : (
                    item.icon
                  )}
                </span>
                <span className="leading-none tracking-tight">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded-full leading-none shrink-0 ${
                    isActive 
                      ? 'bg-zinc-950 text-amber-300' 
                      : (item.badgeColor || 'bg-zinc-800 text-zinc-300')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Float Button */}
        <button
          onClick={() => handleScroll('right')}
          className="shrink-0 h-8 w-7 rounded-lg bg-[#16161a]/90 hover:bg-[#23232b] text-zinc-400 hover:text-amber-400 border border-[rgba(236,236,232,0.08)] flex items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95 shadow-sm"
          title="Scroll tabs right"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
