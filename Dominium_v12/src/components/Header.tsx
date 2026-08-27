import React from 'react';
import { GameState, PowerTier } from '../types';
import { calculateNetWorth } from '../engine/simulationEngine';
import { Inbox, Target, Save, ChevronRight, BarChart2 } from 'lucide-react';
import { evaluateAllObjectives } from '../engine/objectiveEngine';

interface HeaderProps {
  state: GameState;
  onSave?: () => void;
  onAdvanceMonth?: () => void;
  isSimulating?: boolean;
  onOpenStatusDetail: (attrName: string) => void;
  onOpenPowerProfile?: () => void;
  onOpenProgressionProfile?: () => void;
  onOpenDecisionInbox?: () => void;
  onOpenObjectives?: () => void;
  onOpenInstallModal?: () => void;
  pendingDecisionsCount?: number;
  saveStatusText?: string;
  advanceSpeed?: number;
  onSetAdvanceSpeed?: (speed: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onSave,
  onAdvanceMonth,
  isSimulating = false,
  onOpenStatusDetail,
  onOpenPowerProfile,
  onOpenProgressionProfile,
  onOpenDecisionInbox,
  onOpenObjectives,
  onOpenInstallModal,
  pendingDecisionsCount = 0,
}) => {
  const { character, finances } = state;
  const netWorth = calculateNetWorth(state);
  const powerTier: PowerTier = state.playerPowerProfile?.powerTier || 'UNKNOWN';
  const powerScore = state.playerPowerProfile?.powerScore || 0;

  const objectives = evaluateAllObjectives(state);
  const pinnedObj = state.pinnedObjectiveId ? objectives.find(o => o.id === state.pinnedObjectiveId) : null;
  const completedCount = objectives.filter(o => o.status === 'Completed').length;

  const getTierBadgeStyle = (tier: PowerTier) => {
    switch (tier) {
      case 'UNKNOWN': return 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-500';
      case 'LOCAL': return 'bg-blue-950/70 text-blue-300 border-blue-800/60 hover:border-blue-500';
      case 'SUCCESSFUL': return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60 hover:border-emerald-500';
      case 'PROMINENT': return 'bg-purple-950/70 text-purple-300 border-purple-800/60 hover:border-purple-500';
      case 'ELITE': return 'bg-amber-950/80 text-amber-300 border-amber-700/70 hover:border-amber-400';
      case 'POWERFUL': return 'bg-orange-950/80 text-orange-300 border-orange-700/70 hover:border-orange-400';
      case 'GLOBAL': return 'bg-rose-950/90 text-rose-300 border-rose-700/80 hover:border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]';
    }
  };

  const allStats = [
    { name: 'Health', value: Math.round(character.attributes.health), color: 'var(--rose)' },
    { name: 'Happiness', value: Math.round(character.attributes.happiness), color: 'var(--accent)' },
    { name: 'Reputation', value: Math.round(character.attributes.reputation), color: 'var(--emerald)' },
    { name: 'Stress', value: Math.round(character.attributes.stress), color: 'var(--orange)' },
    { name: 'Charm', value: Math.round(character.attributes.charm), color: 'var(--cyan)' },
    { name: 'Intelligence', value: Math.round(character.attributes.intelligence), color: 'var(--violet)' },
    { name: 'Attractiveness', value: Math.round(character.attributes.attractiveness), color: 'var(--fuchsia)' },
    { name: 'Influence', value: Math.round(character.attributes.worldInfluence), color: 'var(--ink-dim)' },
  ];

  const topMobileStats = allStats.slice(0, 3);

  return (
    <header className="bg-[#0c0c0e] border-b border-[rgba(236,236,232,0.08)] sticky top-0 z-30 px-3 sm:px-4 py-2 select-none shrink-0 shadow-md">
      <div className="max-w-7xl mx-auto">
        {/* Main Identity & Financial Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Left: Avatar & Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#16161a] border border-[rgba(236,236,232,0.08)] rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] shrink-0">
              {character.gender === 'Female' ? '👩' : character.gender === 'Male' ? '👨' : '🧑'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs sm:text-sm font-black tracking-tight text-[#ececec] leading-none truncate">
                  {character.firstName} {character.lastName}
                </h1>
                <span className="text-[10px] font-mono text-[rgba(236,236,232,0.6)]">
                  Age {character.age}
                </span>
                {state.politics.currentOffice.inOffice && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono leading-none">
                    {state.politics.currentOffice.title}
                  </span>
                )}
              </div>

              {/* Financials Row */}
              <div className="font-mono text-[11px] sm:text-xs flex items-center gap-2 mt-1 leading-none">
                <span className="text-[#10b981] font-bold">
                  ${(finances?.cash || 0).toLocaleString()}
                </span>
                <span className="text-[rgba(236,236,232,0.5)]">
                  NW ${((netWorth || 0) / 1_000_000 >= 1 ? ((netWorth || 0) / 1_000_000).toFixed(1) + 'M' : ((netWorth || 0) / 1_000).toFixed(0) + 'k')}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions (Goals, Decisions, Save) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenObjectives && (
              <button
                onClick={onOpenObjectives}
                title={pinnedObj ? `Pinned Goal: ${pinnedObj.title} (${pinnedObj.percentage}%)` : `Objectives: ${completedCount}/${objectives.length} Mastered`}
                className="h-8 sm:h-9 bg-[#16161a] hover:bg-[#1f1f25] border border-[rgba(236,236,232,0.08)] text-[rgba(236,236,232,0.7)] hover:text-amber-300 hover:border-amber-400/40 px-2 sm:px-2.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 text-xs touch-manipulation"
              >
                <Target className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-amber-300 hidden xs:inline">
                  {pinnedObj ? `${pinnedObj.percentage}%` : `${completedCount}/${objectives.length}`}
                </span>
              </button>
            )}

            {onOpenDecisionInbox && (
              <button
                onClick={onOpenDecisionInbox}
                title={`Decision Inbox: ${pendingDecisionsCount} unresolved items`}
                className="h-8 sm:h-9 bg-[#16161a] hover:bg-[#1f1f25] border border-[rgba(236,236,232,0.08)] text-[rgba(236,236,232,0.6)] hover:text-[#ececec] px-2 sm:px-2.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 text-xs relative touch-manipulation"
              >
                <Inbox className="w-4 h-4 text-blue-400" />
                {pendingDecisionsCount > 0 ? (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse font-mono">
                    {pendingDecisionsCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">0</span>
                )}
              </button>
            )}

            {onSave && (
              <button
                onClick={onSave}
                title="Save Game"
                className="h-8 sm:h-9 w-8 sm:w-9 bg-[#16161a] hover:bg-[#1f1f25] border border-[rgba(236,236,232,0.08)] text-[rgba(236,236,232,0.6)] hover:text-[#ececec] rounded-xl flex items-center justify-center cursor-pointer transition-colors touch-manipulation"
                aria-label="Save Game"
              >
                <Save className="w-3.5 h-3.5 text-zinc-300" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile View: Compact Top 3 Attributes + "View All" Button (Screens < 640px) */}
        <div className="flex sm:hidden items-center justify-between gap-1.5 pt-1 border-t border-[rgba(236,236,232,0.05)]">
          <div className="flex-1 grid grid-cols-3 gap-1.5">
            {topMobileStats.map(stat => (
              <button
                key={stat.name}
                onClick={() => onOpenStatusDetail(stat.name)}
                className="bg-[#16161a] border border-[rgba(236,236,232,0.08)] py-1 px-1.5 rounded-lg text-left transition-all active:scale-95"
              >
                <div className="flex justify-between font-mono text-[8px] uppercase tracking-wider text-[rgba(236,236,232,0.6)] mb-0.5">
                  <span className="truncate">{stat.name}</span>
                  <span className="text-[#ececec] font-bold">{stat.value}%</span>
                </div>
                <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, stat.value))}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenStatusDetail('Health')}
            className="h-[34px] px-2 bg-[#16161a] hover:bg-[#1f1f25] border border-[rgba(236,236,232,0.08)] text-[rgba(236,236,232,0.7)] text-[9px] font-mono font-bold rounded-lg flex items-center gap-1 shrink-0 active:scale-95"
          >
            <span>All Stats</span>
            <ChevronRight className="w-3 h-3 text-amber-400" />
          </button>
        </div>

        {/* Desktop View: Full 8 Attributes Grid (Screens >= 640px) */}
        <div className="hidden sm:block pt-1 border-t border-[rgba(236,236,232,0.05)]">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
            {allStats.map(stat => (
              <div
                key={stat.name}
                onClick={() => onOpenStatusDetail(stat.name)}
                className="bg-[#16161a] border border-[rgba(236,236,232,0.08)] py-1 px-1.5 rounded-lg cursor-pointer hover:border-amber-400/40 transition-all"
              >
                <div className="flex justify-between font-mono text-[8px] uppercase tracking-wider mb-0.5 text-[rgba(236,236,232,0.6)] leading-none">
                  <span className="truncate">{stat.name}</span>
                  <span className="text-[#ececec] font-bold">{stat.value}%</span>
                </div>
                <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, stat.value))}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
