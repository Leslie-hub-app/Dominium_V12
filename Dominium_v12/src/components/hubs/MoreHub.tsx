import React from 'react';
import { GameState } from '../../types';
import { 
  Inbox, 
  Target, 
  Landmark, 
  TrendingUp, 
  BookOpen, 
  Trophy, 
  Newspaper, 
  Settings, 
  Crown, 
  Zap, 
  ShieldCheck, 
  Save, 
  Users, 
  UserCheck, 
  FileText,
  ChevronRight,
  Sparkles,
  DollarSign,
  Building2,
  Heart
} from 'lucide-react';
import { evaluateAllObjectives } from '../../engine/objectiveEngine';
import { calculateNetWorth } from '../../engine/simulationEngine';

interface MoreHubProps {
  state: GameState;
  onNavigateTab: (tab: string) => void;
  onOpenDecisionInbox?: () => void;
  onOpenObjectives?: () => void;
  onOpenPowerProfile?: () => void;
  onOpenProgressionProfile?: () => void;
  onOpenDynastySuccession?: () => void;
  onOpenTestModal?: () => void;
  onSave?: () => void;
}

export const MoreHub: React.FC<MoreHubProps> = ({
  state,
  onNavigateTab,
  onOpenDecisionInbox,
  onOpenObjectives,
  onOpenPowerProfile,
  onOpenProgressionProfile,
  onOpenDynastySuccession,
  onOpenTestModal,
  onSave
}) => {
  const pendingDecisionsCount = (state.pendingDecisions || []).length;
  const objectives = evaluateAllObjectives(state);
  const completedObjectivesCount = objectives.filter(o => o.status === 'Completed').length;
  const netWorth = calculateNetWorth(state);
  const powerTier = state.playerPowerProfile?.powerTier || 'UNKNOWN';
  const powerScore = state.playerPowerProfile?.powerScore || 0;
  const relationshipsCount = (state.relationships || []).length;
  const activeProjectsCount = (state.projects || (state as any).megaProjects || []).filter((p: any) => p.status === 'In Progress' || p.status === 'Active Construction').length;
  const ownedTeamsCount = (state.sports?.ownedTeams || (state as any).sportsClubs || []).length;

  const currentCountry = state.world?.[state.currentCountryIndex || 0] || null;
  const currentCityName = state.character?.residenceCity || currentCountry?.cities?.[0]?.name || 'Capital City';
  const currentCountryName = currentCountry?.name || state.character?.residenceCountry || 'Republic';

  const coreSystems = [
    {
      id: 'inbox',
      title: 'Decision Inbox',
      desc: 'Strategic dilemmas, executive choices, and emergency responses',
      icon: <Inbox className="w-5 h-5 text-blue-400" />,
      badge: pendingDecisionsCount > 0 ? `${pendingDecisionsCount} PENDING` : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      action: () => (onOpenDecisionInbox ? onOpenDecisionInbox() : onNavigateTab('inbox'))
    },
    {
      id: 'objectives',
      title: 'Objectives & Milestones',
      desc: `${completedObjectivesCount}/${Math.max(1, objectives.length)} Mastered • Lifetime dynastic roadmap`,
      icon: <Target className="w-5 h-5 text-amber-400" />,
      badge: `${Math.round((completedObjectivesCount / Math.max(1, objectives.length)) * 100)}%`,
      badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
      action: () => (onOpenObjectives ? onOpenObjectives() : onNavigateTab('objectives'))
    },
    {
      id: 'progression_profile',
      title: 'Life Progression & 8 Tiers',
      desc: `Tier: ${state.lifeProgression?.currentTier || 'FOUNDATION'} (${state.lifeProgression?.overallProgressionScore || 0} pts) • 10-domain standing & perks`,
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      badge: state.lifeProgression?.currentTier ? `${state.lifeProgression.currentTier.replace('_', ' ')}` : undefined,
      badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
      action: () => (onOpenProgressionProfile ? onOpenProgressionProfile() : onNavigateTab('progression_profile'))
    },
    {
      id: 'family',
      title: 'Dynasty & Succession',
      desc: `Gen ${state.dynastyGeneration || 1} • ${relationshipsCount} Household members & heirs`,
      icon: <Crown className="w-5 h-5 text-yellow-400" />,
      badge: state.dynastyHeirId ? 'HEIR DESIGNATED' : 'SUCCESSION OPEN',
      badgeColor: state.dynastyHeirId ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60' : 'bg-amber-950/80 text-amber-300 border border-amber-700/60',
      action: () => onNavigateTab('family')
    },
    {
      id: 'power_profile',
      title: 'Player Power Hierarchy',
      desc: `Tier: ${powerTier} (${powerScore} pts) • Global sovereignty & influence profile`,
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      action: () => (onOpenPowerProfile ? onOpenPowerProfile() : onNavigateTab('empire'))
    }
  ];

  const empireAndWorld = [
    {
      id: 'politics',
      title: 'Politics & Governance',
      desc: state.politics?.currentOffice?.inOffice 
        ? `${state.politics.currentOffice.title} • Term ${state.politics.currentOffice.termMonthsRemaining || 0}m remaining`
        : 'Run for public office, manage parties & enact legislation',
      icon: <Landmark className="w-5 h-5 text-indigo-400" />,
      badge: state.politics?.currentOffice?.inOffice ? 'IN OFFICE' : undefined,
      badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
      action: () => onNavigateTab('politics')
    },
    {
      id: 'economy',
      title: 'World Economy & Relocation',
      desc: `${currentCityName}, ${currentCountryName} • GDP & Markets`,
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      action: () => onNavigateTab('economy')
    },
    {
      id: 'projects',
      title: 'Mega-Projects & R&D',
      desc: `${activeProjectsCount} Active • Space, Infrastructure & Foundations`,
      icon: <BookOpen className="w-5 h-5 text-purple-400" />,
      action: () => onNavigateTab('projects')
    },
    {
      id: 'sports',
      title: 'Sports Franchises',
      desc: `${ownedTeamsCount} Teams Owned • Club management & league championships`,
      icon: <Trophy className="w-5 h-5 text-orange-400" />,
      action: () => onNavigateTab('sports')
    },
    {
      id: 'news',
      title: 'Global Intelligence & News',
      desc: 'Market updates, political developments, and investigative reporting',
      icon: <Newspaper className="w-5 h-5 text-cyan-400" />,
      action: () => onNavigateTab('news')
    }
  ];

  const systemAndSettings = [
    {
      id: 'settings',
      title: 'Game Settings & Saves',
      desc: 'Save/load slots, simulation configurations, and difficulty options',
      icon: <Settings className="w-5 h-5 text-zinc-400" />,
      action: () => onNavigateTab('settings')
    },
    {
      id: 'tests',
      title: 'System Integration Test Suite',
      desc: 'Automated 12-turn engine verification & regression benchmarks',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      action: () => (onOpenTestModal ? onOpenTestModal() : onNavigateTab('settings'))
    }
  ];

  return (
    <div className="max-w-[700px] w-full mx-auto space-y-6">
      {/* Overview Header Summary */}
      <div className="bg-[#16161a] border border-[rgba(236,236,232,0.08)] p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0c0c0e] border border-[rgba(236,236,232,0.08)] rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0">
              {state.character.gender === 'Female' ? '👩' : state.character.gender === 'Male' ? '👨' : '🧑'}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">Command Center Index</span>
              <h2 className="text-base sm:text-lg font-black text-[#ececec] leading-tight">
                {state.character.firstName} {state.character.lastName}
              </h2>
              <div className="font-mono text-xs text-[rgba(236,236,232,0.6)] flex items-center gap-2 mt-0.5">
                <span>Age {state.character.age}</span>
                <span>•</span>
                <span className="text-[#10b981] font-bold">${(netWorth / 1_000_000 >= 1 ? (netWorth / 1_000_000).toFixed(1) + 'M' : (netWorth / 1_000).toFixed(0) + 'k')} NW</span>
              </div>
            </div>
          </div>

          {onSave && (
            <button
              onClick={onSave}
              className="h-11 px-3.5 bg-[#16161a] hover:bg-[#0c0c0e] active:scale-95 border border-[rgba(236,236,232,0.08)] hover:border-amber-400/40 text-amber-400 font-bold rounded-xl flex items-center gap-2 text-xs transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Game</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Core Strategic Systems */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-mono font-bold text-[rgba(236,236,232,0.6)] uppercase tracking-wider px-1">
          Core Strategic Systems
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {coreSystems.map(item => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full bg-[#16161a] hover:bg-[#1f1f25] active:scale-[0.99] border border-[rgba(236,236,232,0.08)] hover:border-amber-400/30 p-4 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer min-h-[56px] shadow-sm group"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                <div className="w-10 h-10 bg-[#0c0c0e] border border-[rgba(236,236,232,0.08)] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[#ececec] group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[rgba(236,236,232,0.6)] truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[rgba(236,236,232,0.4)] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 2. Governance, Empire & World */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-mono font-bold text-[rgba(236,236,232,0.6)] uppercase tracking-wider px-1">
          Empire & World Simulation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {empireAndWorld.map(item => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full bg-[#16161a] hover:bg-[#1f1f25] active:scale-[0.99] border border-[rgba(236,236,232,0.08)] hover:border-amber-400/30 p-3.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer min-h-[56px] shadow-sm group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-1.5">
                <div className="w-9 h-9 bg-[#0c0c0e] border border-[rgba(236,236,232,0.08)] rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-[#ececec] group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[rgba(236,236,232,0.6)] line-clamp-1 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[rgba(236,236,232,0.4)] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. System Management & Settings */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-mono font-bold text-[rgba(236,236,232,0.6)] uppercase tracking-wider px-1">
          Settings & Infrastructure
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {systemAndSettings.map(item => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full bg-[#16161a] hover:bg-[#1f1f25] active:scale-[0.99] border border-[rgba(236,236,232,0.08)] hover:border-amber-400/30 p-3.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer min-h-[52px] shadow-sm group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-8 h-8 bg-[#0c0c0e] border border-[rgba(236,236,232,0.08)] rounded-lg flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-[#ececec] group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </span>
                  <p className="text-[11px] text-[rgba(236,236,232,0.6)] truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[rgba(236,236,232,0.4)] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
