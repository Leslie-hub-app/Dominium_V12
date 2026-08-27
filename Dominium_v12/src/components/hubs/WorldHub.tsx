import React, { useState } from 'react';
import { GameState } from '../../types';
import { Landmark, TrendingUp, Newspaper, Globe, Briefcase, BookOpen, Users } from 'lucide-react';
import { PoliticsHub } from './PoliticsHub';
import { EconomyHub } from './EconomyHub';
import { NewsHub } from './NewsHub';
import { LivingWorldOverview } from '../world/LivingWorldOverview';
import { LivingCompetitorsHub } from '../world/LivingCompetitorsHub';
import { LivingHistoryHub } from '../world/LivingHistoryHub';
import { AutonomousNpcHub } from '../world/AutonomousNpcHub';
import { WorldGovernorMonitor } from '../world/WorldGovernorMonitor';
import { WorldTaxJusticeHub } from '../world/WorldTaxJusticeHub';

export type WorldSubTab = 'overview' | 'npcs' | 'competitors' | 'politics' | 'economy' | 'news' | 'history' | 'institutions';

interface WorldHubProps {
  state: GameState;
  activeSubTab?: WorldSubTab;
  onSelectSubTab?: (tab: WorldSubTab) => void;
  onJoinParty: (partyId: string) => void;
  onRunCampaign: (targetOffice: any, budget: number) => void;
  onLaunchInteractiveCampaign?: (targetOffice: string) => void;
  onEnactPolicy: (policyKey: string, newValue: any) => void;
  onAppointMinister?: (ministryKey: string, candidateId: string) => void;
  onNavigateToInbox?: () => void;
  onRelocateCity: (countryName: string, cityName: string) => void;
  onUpdateState?: (state: GameState) => void;
  initialTab?: WorldSubTab;
}

export const WorldHub: React.FC<WorldHubProps> = ({
  state,
  activeSubTab: controlledSubTab,
  onSelectSubTab,
  onJoinParty,
  onRunCampaign,
  onLaunchInteractiveCampaign,
  onEnactPolicy,
  onAppointMinister,
  onNavigateToInbox,
  onRelocateCity,
  onUpdateState,
  initialTab = 'overview'
}) => {
  const [internalSubTab, setInternalSubTab] = useState<WorldSubTab>(initialTab);
  const activeSubTab = (controlledSubTab as WorldSubTab) || internalSubTab;
  
  const setActiveSubTab = (newTab: WorldSubTab) => {
    setInternalSubTab(newTab);
    if (onSelectSubTab) onSelectSubTab(newTab);
  };

  const subTabs = [
    {
      id: 'overview' as const,
      label: 'World Intelligence',
      icon: <Globe className="w-4 h-4" />,
      badge: state.livingWorld?.activeWorldEvents?.length 
        ? `${state.livingWorld.activeWorldEvents.length} Events` 
        : undefined,
    },
    {
      id: 'npcs' as const,
      label: 'Living NPCs & Society',
      icon: <Users className="w-4 h-4" />,
      badge: state.livingWorld?.npcs?.length 
        ? `${state.livingWorld.npcs.length}` 
        : undefined,
    },
    {
      id: 'competitors' as const,
      label: 'Competitors & Ecosystem',
      icon: <Briefcase className="w-4 h-4" />,
      badge: state.livingWorld?.competitors?.length 
        ? `${state.livingWorld.competitors.length}` 
        : undefined,
    },
    {
      id: 'politics' as const,
      label: 'Politics & Office',
      icon: <Landmark className="w-4 h-4" />,
      badge: state.politics?.currentOffice?.inOffice ? 'In Office' : undefined,
    },
    {
      id: 'economy' as const,
      label: 'Economy & Cities',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'news' as const,
      label: 'Global News',
      icon: <Newspaper className="w-4 h-4" />,
      badge: (state.newsArchive?.length || (state as any).newsFeed?.length || 0) > 0 
        ? `${state.newsArchive?.length || (state as any).newsFeed?.length}` 
        : undefined,
    },
    {
      id: 'history' as const,
      label: 'World Chronicles',
      icon: <BookOpen className="w-4 h-4" />,
      badge: state.livingWorld?.worldHistory?.length 
        ? `${state.livingWorld.worldHistory.length}` 
        : undefined,
    },
    {
      id: 'institutions' as const,
      label: 'Tax & Justice',
      icon: <Landmark className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Segmented Switcher for World Destination */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 bg-[#16161a] p-1.5 rounded-2xl border border-[rgba(236,236,232,0.08)] shadow-md">
        {subTabs.map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`min-h-[44px] py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer touch-manipulation ${
                isActive
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
              {tab.badge && (
                <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded-full hidden sm:inline ${
                  isActive ? 'bg-zinc-950 text-amber-300' : 'bg-amber-400/20 text-amber-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Selected Sub Hub */}
      {activeSubTab === 'overview' && (
        <>
          <WorldGovernorMonitor state={state} />
          <LivingWorldOverview 
          state={state} 
          onNavigateSubTab={(t) => setActiveSubTab(t as WorldSubTab)} 
        />
        </>
      )}

      {activeSubTab === 'npcs' && (
        <AutonomousNpcHub state={state} />
      )}

      {activeSubTab === 'competitors' && (
        <LivingCompetitorsHub state={state} />
      )}

      {activeSubTab === 'politics' && (
        <PoliticsHub
          state={state}
          onJoinParty={onJoinParty}
          onRunCampaign={onRunCampaign}
          onLaunchInteractiveCampaign={onLaunchInteractiveCampaign}
          onEnactPolicy={onEnactPolicy}
          onAppointMinister={onAppointMinister || (() => {})}
          onNavigateToInbox={onNavigateToInbox || (() => {})}
        />
      )}

      {activeSubTab === 'economy' && (
        <EconomyHub
          state={state}
          onRelocateCity={onRelocateCity}
        />
      )}

      {activeSubTab === 'news' && (
        <NewsHub state={state} />
      )}

      {activeSubTab === 'history' && (
        <LivingHistoryHub state={state} />
      )}

      {activeSubTab === 'institutions' && (
        <WorldTaxJusticeHub state={state} onUpdateState={onUpdateState} />
      )}
    </div>
  );
};
