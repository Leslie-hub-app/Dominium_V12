import React from 'react';
import { GameState, PowerTier } from '../../types';
import { calculateNetWorth } from '../../engine/simulationEngine';
import { 
  ArrowLeftRight, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Inbox, 
  HeartPulse, 
  Smile, 
  Award, 
  Flame, 
  Sparkles, 
  Brain, 
  Eye, 
  Globe,
  Sliders,
  PanelLeftClose,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
  Activity,
  Crown
} from 'lucide-react';
import { evaluateAllObjectives } from '../../engine/objectiveEngine';

export type StatusBarPosition = 'left' | 'right';

interface FloatingStatusBarProps {
  state: GameState;
  position: StatusBarPosition;
  onTogglePosition: () => void;
  onOpenStatusDetail: (attrName: string) => void;
  onOpenPowerProfile?: () => void;
  onOpenProgressionProfile?: () => void;
  onOpenDecisionInbox?: () => void;
  onOpenObjectives?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const FloatingStatusBar: React.FC<FloatingStatusBarProps> = ({
  state,
  position,
  onTogglePosition,
  onOpenStatusDetail,
  onOpenPowerProfile,
  onOpenProgressionProfile,
  onOpenDecisionInbox,
  onOpenObjectives,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { character, finances } = state;
  const netWorth = calculateNetWorth(state);
  const powerTier: PowerTier = state.playerPowerProfile?.powerTier || 'UNKNOWN';
  const powerScore = state.playerPowerProfile?.powerScore || 0;
  const pendingDecisionsCount = (state.pendingDecisions || []).length;

  const objectives = evaluateAllObjectives(state);
  const pinnedObj = state.pinnedObjectiveId ? objectives.find(o => o.id === state.pinnedObjectiveId) : null;
  const completedObjectivesCount = objectives.filter(o => o.status === 'Completed').length;

  const allStats = [
    { name: 'Health', value: Math.round(character.attributes.health), color: 'var(--rose)', icon: <HeartPulse className="w-3 h-3 text-rose-400" /> },
    { name: 'Happiness', value: Math.round(character.attributes.happiness), color: 'var(--accent)', icon: <Smile className="w-3 h-3 text-amber-400" /> },
    { name: 'Reputation', value: Math.round(character.attributes.reputation), color: 'var(--emerald)', icon: <Award className="w-3 h-3 text-emerald-400" /> },
    { name: 'Stress', value: Math.round(character.attributes.stress), color: 'var(--orange)', icon: <Flame className="w-3 h-3 text-orange-400" /> },
    { name: 'Charm', value: Math.round(character.attributes.charm), color: 'var(--cyan)', icon: <Sparkles className="w-3 h-3 text-cyan-400" /> },
    { name: 'Intelligence', value: Math.round(character.attributes.intelligence), color: 'var(--violet)', icon: <Brain className="w-3 h-3 text-violet-400" /> },
    { name: 'Attractiveness', value: Math.round(character.attributes.attractiveness), color: 'var(--fuchsia)', icon: <Eye className="w-3 h-3 text-fuchsia-400" /> },
    { name: 'Influence', value: Math.round(character.attributes.worldInfluence), color: 'var(--ink-dim)', icon: <Globe className="w-3 h-3 text-zinc-400" /> },
  ];

  const getTierBadgeStyle = (tier: PowerTier) => {
    switch (tier) {
      case 'UNKNOWN': return 'bg-zinc-800/80 text-zinc-300 border-zinc-700';
      case 'LOCAL': return 'bg-blue-950/70 text-blue-300 border-blue-800/60';
      case 'SUCCESSFUL': return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
      case 'PROMINENT': return 'bg-purple-950/70 text-purple-300 border-purple-800/60';
      case 'ELITE': return 'bg-amber-950/80 text-amber-300 border-amber-700/70';
      case 'POWERFUL': return 'bg-orange-950/80 text-orange-300 border-orange-700/70';
      case 'GLOBAL': return 'bg-rose-950/90 text-rose-300 border-rose-700/80 shadow-[0_0_12px_rgba(244,63,94,0.25)]';
    }
  };

  return (
    <aside 
      aria-label="Player Status and HUD Panel"
      className={`bg-[#121216] border-[rgba(236,236,232,0.08)] flex flex-col shrink-0 select-none transition-all duration-300 shadow-xl ${
        position === 'left' ? 'border-r' : 'border-l'
      } ${
        isCollapsed 
          ? 'w-12 items-center py-3' 
          : 'w-64 sm:w-72 p-3 sm:p-3.5 space-y-3'
      }`}
    >
      {/* Top Header Controls: Position Switcher & Collapse */}
      <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between pb-2 border-b border-[rgba(236,236,232,0.08)]'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 min-w-0">
            <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[rgba(236,236,232,0.8)] truncate">
              Vitals & HUD
            </span>
          </div>
        )}

        <div className={`flex items-center gap-1 ${isCollapsed ? 'flex-col' : ''}`}>
          {/* Position Switcher Button */}
          <button
            onClick={onTogglePosition}
            title={position === 'right' ? 'Dock Status Bar to LEFT side' : 'Dock Status Bar to RIGHT side'}
            className="h-7 px-2 bg-[#1a1a20] hover:bg-[#25252e] text-[rgba(236,236,232,0.7)] hover:text-amber-300 border border-[rgba(236,236,232,0.08)] rounded-lg text-[9.5px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer touch-manipulation active:scale-95"
            aria-label="Toggle Status Bar Side"
          >
            {position === 'right' ? (
              <>
                <ChevronLeft className="w-3 h-3 text-amber-400 shrink-0" />
                {!isCollapsed && <span className="hidden sm:inline">Dock Left</span>}
              </>
            ) : (
              <>
                {!isCollapsed && <span className="hidden sm:inline">Dock Right</span>}
                <ChevronRight className="w-3 h-3 text-amber-400 shrink-0" />
              </>
            )}
          </button>

          {/* Collapse/Expand Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Status HUD' : 'Collapse Status HUD'}
              className="h-7 w-7 bg-[#1a1a20] hover:bg-[#25252e] text-[rgba(236,236,232,0.7)] hover:text-[#ececec] border border-[rgba(236,236,232,0.08)] rounded-lg flex items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95"
              aria-label={isCollapsed ? 'Expand HUD' : 'Collapse HUD'}
            >
              {isCollapsed ? (
                position === 'left' ? <PanelLeftOpen className="w-3.5 h-3.5 text-amber-400" /> : <PanelRightOpen className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                position === 'left' ? <PanelLeftClose className="w-3.5 h-3.5 text-zinc-400" /> : <PanelRightClose className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Collapsed Icon Bar */}
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-3 pt-2">
          <button 
            onClick={() => onOpenStatusDetail('Health')}
            title={`Health: ${Math.round(character.attributes.health)}%`}
            className="w-8 h-8 rounded-lg bg-[#1a1a20] border border-rose-500/30 flex items-center justify-center text-xs font-mono font-bold text-rose-400 cursor-pointer"
          >
            {Math.round(character.attributes.health)}
          </button>
          <button 
            onClick={() => onOpenStatusDetail('Happiness')}
            title={`Happiness: ${Math.round(character.attributes.happiness)}%`}
            className="w-8 h-8 rounded-lg bg-[#1a1a20] border border-amber-500/30 flex items-center justify-center text-xs font-mono font-bold text-amber-400 cursor-pointer"
          >
            {Math.round(character.attributes.happiness)}
          </button>
          <button 
            onClick={() => onOpenStatusDetail('Reputation')}
            title={`Reputation: ${Math.round(character.attributes.reputation)}%`}
            className="w-8 h-8 rounded-lg bg-[#1a1a20] border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 cursor-pointer"
          >
            {Math.round(character.attributes.reputation)}
          </button>
          {onOpenPowerProfile && (
            <button 
              id="hud-collapsed-power-tier-badge"
              onClick={onOpenPowerProfile}
              title={`Power Tier: ${powerTier} (${powerScore} pts)`}
              className="w-8 h-8 rounded-lg bg-[#1a1a20] border border-amber-400/40 flex items-center justify-center cursor-pointer hover:border-amber-300"
            >
              <Zap className="w-4 h-4 text-amber-400" />
            </button>
          )}
          {onOpenProgressionProfile && state.lifeProgression && (
            <button 
              id="hud-collapsed-life-progression-badge"
              onClick={onOpenProgressionProfile}
              title={`Life Progression: ${state.lifeProgression.currentTier}`}
              className="w-8 h-8 rounded-lg bg-[#1a1a20] border border-amber-500/40 flex items-center justify-center cursor-pointer hover:border-amber-400"
            >
              <Crown className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>
      ) : (
        /* Full Expanded Status HUD */
        <div className="space-y-3 overflow-y-auto scrollbar-none max-h-[calc(100vh-140px)]">
          {/* Financial & Power Card */}
          <div className="bg-[#18181f] p-2.5 rounded-xl border border-[rgba(236,236,232,0.07)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono text-[rgba(236,236,232,0.6)] uppercase">Capital</span>
              <span className="text-xs font-mono font-black text-[#10b981]">
                ${(finances?.cash ?? 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono text-[rgba(236,236,232,0.6)] uppercase">Net Worth</span>
              <span className="text-xs font-mono font-extrabold text-[rgba(236,236,232,0.9)]">
                ${(netWorth ?? 0).toLocaleString()}
              </span>
            </div>

            {/* Power Tier & Life Progression Badges placed here */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-[rgba(236,236,232,0.06)]">
              {onOpenPowerProfile && (
                <button
                  id="header-power-tier-badge"
                  onClick={onOpenPowerProfile}
                  title={`Power Tier: ${powerTier} (${powerScore} pts). Tap to view profile.`}
                  className={`w-full py-1 px-2 rounded-lg border flex items-center justify-between text-[9px] font-mono font-bold transition-all cursor-pointer hover:scale-[1.02] ${getTierBadgeStyle(powerTier)}`}
                >
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Tier: {powerTier}</span>
                  </div>
                  <span>{powerScore} pts</span>
                </button>
              )}

              {onOpenProgressionProfile && state.lifeProgression && (
                <button
                  id="header-life-progression-badge"
                  onClick={onOpenProgressionProfile}
                  title={`Life Tier: ${state.lifeProgression.currentTier} (${state.lifeProgression.overallProgressionScore} pts). Tap to view 10-domain profile.`}
                  className="w-full py-1 px-2 rounded-lg border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:border-amber-400 hover:bg-amber-900/40 flex items-center justify-between text-[9px] font-mono font-bold transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span className="truncate">{state.lifeProgression.currentTier.replace('_', ' ')}</span>
                  </div>
                  <span>{state.lifeProgression.overallProgressionScore} pts</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick HUD Directives (Decisions & Objectives) */}
          <div className="grid grid-cols-2 gap-1.5">
            {onOpenDecisionInbox && (
              <button
                onClick={onOpenDecisionInbox}
                className="bg-[#18181f] hover:bg-[#20202a] border border-[rgba(236,236,232,0.07)] p-2 rounded-xl text-left transition-all cursor-pointer active:scale-95"
              >
                <div className="flex items-center justify-between mb-1">
                  <Inbox className="w-3.5 h-3.5 text-blue-400" />
                  {pendingDecisionsCount > 0 ? (
                    <span className="bg-rose-500 text-white text-[8.5px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                      {pendingDecisionsCount}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-zinc-500">0</span>
                  )}
                </div>
                <div className="text-[9.5px] font-bold text-[rgba(236,236,232,0.85)] leading-tight">Decisions</div>
              </button>
            )}

            {onOpenObjectives && (
              <button
                onClick={onOpenObjectives}
                className="bg-[#18181f] hover:bg-[#20202a] border border-[rgba(236,236,232,0.07)] p-2 rounded-xl text-left transition-all cursor-pointer active:scale-95"
              >
                <div className="flex items-center justify-between mb-1">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[9px] font-mono font-bold text-amber-300">
                    {completedObjectivesCount}/{objectives.length}
                  </span>
                </div>
                <div className="text-[9.5px] font-bold text-[rgba(236,236,232,0.85)] leading-tight truncate">
                  {pinnedObj ? `${pinnedObj.percentage}% Goal` : 'Goals'}
                </div>
              </button>
            )}
          </div>

          {/* 8 Core Character Attributes */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-mono uppercase tracking-wider text-[rgba(236,236,232,0.5)] px-0.5">
              Character Attributes
            </div>

            <div className="space-y-1">
              {allStats.map(stat => (
                <button
                  key={stat.name}
                  onClick={() => onOpenStatusDetail(stat.name)}
                  className="w-full bg-[#18181f] hover:bg-[#20202a] border border-[rgba(236,236,232,0.06)] hover:border-amber-400/30 p-1.5 rounded-lg text-left transition-all cursor-pointer active:scale-95"
                >
                  <div className="flex items-center justify-between font-mono text-[9px] mb-1">
                    <div className="flex items-center gap-1.5">
                      {stat.icon}
                      <span className="text-[rgba(236,236,232,0.8)] font-semibold">{stat.name}</span>
                    </div>
                    <span className="text-[#ececec] font-bold">{stat.value}%</span>
                  </div>

                  <div className="h-1 bg-black/50 rounded-full overflow-hidden">
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
          </div>
        </div>
      )}
    </aside>
  );
};
