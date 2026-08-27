import React, { useState } from 'react';
import { GameState, LifeEvent, PendingDecision } from '../types';
import { 
  Filter,
  AlertCircle, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  Award, 
  Info, 
  Sparkles, 
  Clock, 
  Target, 
  ArrowRight,
  HelpCircle,
  Briefcase,
  DollarSign,
  Users,
  Building2,
  Globe,
  ChevronRight,
  ShieldAlert,
  Play,
  Activity,
  CheckCircle2,
  Compass,
  TrendingDown
} from 'lucide-react';
import { generateEventExplanation } from '../engine/aiEngine';
import { DecisionHistoryView } from './DecisionHistoryView';
import { EventChainTracker } from './EventChainTracker';
import { EventControlMonitor } from './EventControlMonitor';
import { calculateNetWorth } from '../engine/simulationEngine';
import { DominiumIcon, SemanticIconKey } from './icons';
import { MetricStrip, AttentionCenter, AttentionItem, QuickActionBar } from './composition';

interface LifeEventFeedProps {
  state?: GameState;
  events?: LifeEvent[];
  pendingDecisions?: PendingDecision[];
  activeFeedMode?: 'chronology' | 'decision_history' | 'event_chains' | 'event_control';
  onSelectFeedMode?: (mode: 'chronology' | 'decision_history' | 'event_chains' | 'event_control') => void;
  onSelectDecisionOption?: (decision: PendingDecision, optionId: string) => void;
  onMakeDecision?: (decisionId: string, optionId: string) => void;
  onOpenDecisionModal?: (decision: PendingDecision) => void;
  onOpenModule?: (module: string) => void;
  onUpdateState?: (newState: GameState) => void;
  onAdvanceMonth?: () => void;
  isSimulating?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const LifeEventFeed: React.FC<LifeEventFeedProps> = ({
  state,
  events,
  pendingDecisions,
  activeFeedMode: controlledFeedMode,
  onSelectFeedMode,
  onSelectDecisionOption,
  onMakeDecision,
  onOpenDecisionModal,
  onOpenModule,
  onUpdateState,
  onAdvanceMonth,
  isSimulating = false
}) => {
  const [internalFeedMode, setInternalFeedMode] = useState<'chronology' | 'decision_history' | 'event_chains' | 'event_control'>('chronology');
  const feedMode = controlledFeedMode || internalFeedMode;
  const setFeedMode = (newMode: 'chronology' | 'decision_history' | 'event_chains' | 'event_control') => {
    setInternalFeedMode(newMode);
    if (onSelectFeedMode) onSelectFeedMode(newMode);
  };
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedExplanation, setSelectedExplanation] = useState<{ title: string; text: string } | null>(null);
  const [expandedTriggerEvents, setExpandedTriggerEvents] = useState<Record<string, boolean>>({});
  const [quickActionFeedback, setQuickActionFeedback] = useState<string | null>(null);

  const feedEvents = events || state?.eventsFeed || [];
  const activeDecisions = pendingDecisions || state?.pendingDecisions || [];

  const handleQuickOptimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state || !onUpdateState) return;

    if (activeDecisions.length > 0) {
      const targetDecision = activeDecisions[0];
      const selectedOption = targetDecision.options[0];
      if (onSelectDecisionOption) {
        onSelectDecisionOption(targetDecision, selectedOption.id);
      } else if (onMakeDecision) {
        onMakeDecision(targetDecision.id, selectedOption.id);
      }
      setQuickActionFeedback('Decision Resolved');
      setTimeout(() => setQuickActionFeedback(null), 2500);
      return;
    }

    if (state.character.attributes.stress > 60 || state.character.attributes.health < 60) {
      const cost = Math.min(state.finances.cash * 0.05, 1200);
      const updatedState = {
        ...state,
        finances: {
          ...state.finances,
          cash: Math.max(0, state.finances.cash - cost)
        },
        character: {
          ...state.character,
          attributes: {
            ...state.character.attributes,
            stress: Math.max(0, state.character.attributes.stress - 20),
            health: Math.min(100, state.character.attributes.health + 12),
            happiness: Math.min(100, (state.character.attributes.happiness || 70) + 10)
          }
        },
        eventsFeed: [
          {
            id: `opt_wellness_${Date.now()}`,
            title: 'Executive Wellness Protocol Executed',
            description: `Rebalanced executive vitals: Stress reduced by 20%, Health enhanced by 12% ($${Math.round(cost).toLocaleString()} allocated).`,
            category: 'HEALTH' as const,
            year: state.currentYear,
            month: state.currentMonth,
            type: 'OPPORTUNITY' as const,
            severity: 'Low' as const
          },
          ...(state.eventsFeed || [])
        ]
      };
      onUpdateState(updatedState);
      setQuickActionFeedback('Vitals Rebalanced');
      setTimeout(() => setQuickActionFeedback(null), 2500);
      return;
    }

    const idleCash = state.finances.cash;
    const yieldBoost = Math.max(250, Math.round(idleCash * 0.008));
    const updatedState = {
      ...state,
      finances: {
        ...state.finances,
        cash: state.finances.cash + yieldBoost
      },
      character: {
        ...state.character,
        attributes: {
          ...state.character.attributes,
          worldInfluence: (state.character.attributes.worldInfluence || 50) + 1
        }
      },
      eventsFeed: [
        {
          id: `opt_treasury_${Date.now()}`,
          title: 'Treasury & Liquidity Yield Rebalanced',
          description: `Optimized liquid cash sweeps and short-term capital allocations, generating +$${yieldBoost.toLocaleString()} in treasury yields.`,
          category: 'FINANCE' as const,
          year: state.currentYear,
          month: state.currentMonth,
          type: 'OPPORTUNITY' as const,
          severity: 'Low' as const
        },
        ...(state.eventsFeed || [])
      ]
    };
    onUpdateState(updatedState);
    setQuickActionFeedback('Yield Optimized');
    setTimeout(() => setQuickActionFeedback(null), 2500);
  };

  const filters = [
    'All', 'Business', 'Finance', 'Career', 'Family', 'Politics', 'Sports', 'Health', 'Economy', 'World'
  ];

  const filteredEvents = feedEvents.filter(ev => {
    if (activeFilter === 'All') return true;
    return ev.category.toLowerCase() === activeFilter.toLowerCase();
  });

  const toggleTriggerReason = (eventId: string) => {
    setExpandedTriggerEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const handleDecisionClick = (decision: PendingDecision, optionId: string) => {
    if (onSelectDecisionOption) {
      onSelectDecisionOption(decision, optionId);
    } else if (onMakeDecision) {
      onMakeDecision(decision.id, optionId);
    }
  };

  const getCategorySemanticIcon = (category: string): SemanticIconKey => {
    switch (category.toLowerCase()) {
      case 'business': return 'business.company';
      case 'finance': return 'finance.wealth';
      case 'career': return 'career.general';
      case 'family': return 'family.family';
      case 'politics': return 'politics.government';
      case 'sports': return 'nav.sports';
      case 'health': return 'govt.healthcare';
      case 'economy': return 'economy.growth';
      case 'world': return 'world.globe';
      default: return 'nav.chronology';
    }
  };

  const getEventTypeIcon = (type?: string) => {
    switch (type) {
      case 'CRISIS':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'OPPORTUNITY':
        return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
      case 'MILESTONE':
        return <Award className="w-3.5 h-3.5 text-yellow-400" />;
      case 'DECISION':
        return <TrendingUp className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/80 animate-pulse';
      case 'High':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      case 'Medium':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/80';
      default:
        return 'bg-zinc-800/80 text-zinc-300 border-zinc-700';
    }
  };

  // Compile Dynamic Attention Items from Game State
  const attentionItems: AttentionItem[] = [];

  if (activeDecisions.length > 0) {
    attentionItems.push({
      id: 'pending_decisions_alert',
      title: `${activeDecisions.length} Pending Decision${activeDecisions.length > 1 ? 's' : ''}`,
      description: activeDecisions[0].title + (activeDecisions.length > 1 ? ` (and ${activeDecisions.length - 1} more)` : ''),
      level: 'critical',
      category: 'Decision',
      iconKey: 'nav.inbox',
      actionLabel: 'Resolve',
      onAction: () => onOpenModule && onOpenModule('inbox')
    });
  }

  const loansList = state?.finances?.loans || (state?.bankingProfile as any)?.loans || state?.loans || [];
  if (loansList.length > 0 && loansList.some((l: any) => (l.missedPayments || 0) > 0)) {
    const overdueLoan = loansList.find((l: any) => (l.missedPayments || 0) > 0);
    attentionItems.push({
      id: 'loan_arrears_alert',
      title: 'Loan Payment Arrears Alert',
      description: `You have overdue payments on ${(overdueLoan as any)?.name || 'an active facility'}. Settle to prevent credit score penalties.`,
      level: 'critical',
      category: 'Banking',
      iconKey: 'banking.loan',
      actionLabel: 'Pay Loan',
      onAction: () => onOpenModule && onOpenModule('wealth')
    });
  }

  if (state?.character && state.character.attributes.health < 40) {
    attentionItems.push({
      id: 'health_burnout_alert',
      title: 'Severe Health & Fatigue Risk',
      description: `Vital health is at ${Math.round(state.character.attributes.health)}%. Schedule wellness recovery or seek medical care.`,
      level: 'warning',
      category: 'Health',
      iconKey: 'govt.healthcare',
      actionLabel: 'Wellness',
      onAction: () => onOpenModule && onOpenModule('life')
    });
  }

  if (state?.character && state.character.attributes.stress > 80) {
    attentionItems.push({
      id: 'stress_overload_alert',
      title: 'Executive Burnout / High Stress',
      description: `Stress level is at ${Math.round(state.character.attributes.stress)}%. High stress reduces life longevity and executive clarity.`,
      level: 'warning',
      category: 'Wellness',
      iconKey: 'career.workload',
      actionLabel: 'De-Stress',
      onAction: () => onOpenModule && onOpenModule('life')
    });
  }

  const netWorth = state ? calculateNetWorth(state) : 0;
  const monthName = state ? MONTH_NAMES[(state.currentMonth - 1) % 12] : 'January';
  const powerTier = state?.playerPowerProfile?.powerTier || 'LOCAL';

  // Primary Next Action
  let primaryNextAction = {
    title: 'Advance Simulation Cycle',
    subtitle: `Proceed to ${state ? MONTH_NAMES[state.currentMonth % 12] : 'Next Month'}, ${state?.currentYear}`,
    category: 'Routine Advance',
    iconKey: 'system.simulation' as SemanticIconKey,
    onClick: () => onAdvanceMonth && onAdvanceMonth()
  };

  if (activeDecisions.length > 0) {
    primaryNextAction = {
      title: `Resolve Critical Choice: ${activeDecisions[0].title}`,
      subtitle: `${activeDecisions.length} pending decision${activeDecisions.length > 1 ? 's' : ''} awaiting executive review`,
      category: 'Decision Required',
      iconKey: 'nav.inbox' as SemanticIconKey,
      onClick: () => onOpenModule && onOpenModule('inbox')
    };
  } else if (state?.character && state.character.attributes.health < 30) {
    primaryNextAction = {
      title: 'Urgent Health & Medical Recovery',
      subtitle: `Health critically low at ${Math.round(state.character.attributes.health)}%. Engage wellness activities.`,
      category: 'Health Intervention',
      iconKey: 'govt.healthcare' as SemanticIconKey,
      onClick: () => onOpenModule && onOpenModule('life')
    };
  }

  const quickActionLabel = activeDecisions.length > 0
    ? '⚡ Auto-Resolve'
    : state?.character && (state.character.attributes.stress > 60 || state.character.attributes.health < 60)
    ? '🧘 Rebalance Vitals'
    : '📈 Optimize Yield';

  return (
    <div className="max-w-[850px] w-full mx-auto space-y-4 animate-fade-in">
      {feedMode === 'decision_history' && state ? (
        <DecisionHistoryView state={state} />
      ) : feedMode === 'event_chains' && state ? (
        <EventChainTracker state={state} onUpdateState={onUpdateState} />
      ) : feedMode === 'event_control' && state ? (
        <EventControlMonitor state={state} onUpdateState={onUpdateState} />
      ) : (
        <>
          {/* DOMINIUM COMMAND HOME HERO BANNER */}
          {state && (
            <div className="bg-[#141418] border border-[rgba(236,236,232,0.1)] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

              {/* Player Identity & Time Grid */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#1c1c22] border border-[rgba(236,236,232,0.12)] flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {state.character.gender === 'Female' ? '👩' : state.character.gender === 'Male' ? '👨' : '🧑'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-[#ececec]">
                        {state.character.firstName} {state.character.lastName}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        {powerTier} TIER
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[rgba(236,236,232,0.6)] mt-0.5">
                      Age {state.character.age} • {state.character.occupation || 'Private Citizen'} • {state.character.residenceCity}, {state.character.residenceCountry}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-right shrink-0">
                  <div className="p-2 rounded-xl bg-[#1a1a20] border border-[rgba(236,236,232,0.08)]">
                    <div className="text-[9px] uppercase tracking-wider text-[rgba(236,236,232,0.5)]">Simulation Time</div>
                    <div className="text-xs font-bold text-amber-400">{monthName} {state.currentYear}</div>
                  </div>
                </div>
              </div>

              {/* Primary Next Action Bar */}
              <div
                className="bg-[#1a1a20] hover:bg-[#22222a] border border-amber-400/30 rounded-xl p-3 flex items-center justify-between gap-3 transition-all group shadow-sm"
              >
                <div
                  onClick={primaryNextAction.onClick}
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 shadow-sm font-black">
                    <DominiumIcon name={primaryNextAction.iconKey} size="sm" variant="default" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-mono font-extrabold uppercase text-amber-400 tracking-wider">
                      Primary Next Action • {primaryNextAction.category}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#ececec] truncate group-hover:text-amber-300 transition-colors">
                      {primaryNextAction.title}
                    </h3>
                    <p className="text-[10.5px] font-mono text-[rgba(236,236,232,0.6)] truncate">
                      {primaryNextAction.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Context-Aware Quick Action Button */}
                  <button
                    type="button"
                    onClick={handleQuickOptimize}
                    disabled={!state || !onUpdateState}
                    title="Execute context-aware simulation action"
                    className="h-8 px-2.5 bg-amber-400/10 hover:bg-amber-400/25 active:scale-95 border border-amber-400/30 text-amber-300 font-mono font-bold text-[11px] rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{quickActionFeedback || quickActionLabel}</span>
                  </button>

                  <button
                    type="button"
                    onClick={primaryNextAction.onClick}
                    className="h-8 px-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-black text-xs rounded-lg flex items-center gap-1 shrink-0 group-hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Act</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Metric Strip */}
              <MetricStrip
                metrics={[
                  {
                    label: 'Net Worth',
                    value: `$${(netWorth / 1_000_000 >= 1 ? (netWorth / 1_000_000).toFixed(2) + 'M' : (netWorth / 1_000).toFixed(0) + 'k')}`,
                    iconKey: 'finance.wealth',
                    trend: 'up',
                    badge: 'Active',
                    badgeVariant: 'active',
                    subValue: `${powerTier} Standing`,
                    onClick: () => onOpenModule && onOpenModule('wealth')
                  },
                  {
                    label: 'Liquid Cash',
                    value: `$${(state.finances.cash / 1_000_000 >= 1 ? (state.finances.cash / 1_000_000).toFixed(2) + 'M' : (state.finances.cash / 1_000).toFixed(0) + 'k')}`,
                    iconKey: 'finance.cash',
                    badge: state.finances.cash > 25000 ? 'Solvent' : 'Low',
                    badgeVariant: state.finances.cash > 25000 ? 'active' : 'warning',
                    onClick: () => onOpenModule && onOpenModule('wealth')
                  },
                  {
                    label: 'Health & Vitals',
                    value: `${Math.round(state.character.attributes.health)}%`,
                    color: state.character.attributes.health < 40 ? '#f43f5e' : '#10b981',
                    badge: state.character.attributes.health >= 70 ? 'Prime' : state.character.attributes.health >= 40 ? 'Stable' : 'Warning',
                    badgeVariant: state.character.attributes.health >= 70 ? 'active' : 'warning',
                    iconKey: 'govt.healthcare',
                    onClick: () => onOpenModule && onOpenModule('life')
                  },
                  {
                    label: 'World Influence',
                    value: `${Math.round(state.character.attributes.worldInfluence)}`,
                    badge: 'Rating',
                    badgeVariant: 'neutral',
                    iconKey: 'world.globe',
                    onClick: () => onOpenModule && onOpenModule('world')
                  }
                ]}
                columns={4}
              />
            </div>
          )}

          {/* ATTENTION CENTER */}
          <AttentionCenter items={attentionItems} />

          {/* PENDING DECISIONS INBOX SECTION */}
          {activeDecisions.length > 0 && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#fbbf24] uppercase tracking-wider font-mono">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 animate-pulse" />
                  <span>Action Required: Pending Decisions ({activeDecisions.length})</span>
                </div>
                {onOpenModule && (
                  <button
                    onClick={() => onOpenModule('inbox')}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-950/60 hover:bg-blue-950 px-2.5 py-1 rounded-md border border-blue-500/30 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Open Decision Inbox</span>
                    <span className="text-xs">→</span>
                  </button>
                )}
              </div>

              {activeDecisions.map(decision => {
                const remainingMonths = (decision.expiresAtTick && state?.simulationTick) 
                  ? Math.max(0, decision.expiresAtTick - state.simulationTick) 
                  : undefined;
                const isExpiringSoon = remainingMonths !== undefined && remainingMonths <= 1;

                return (
                  <div 
                    key={decision.id}
                    className="bg-[#16161a] border border-[#fbbf24]/40 rounded-[16px] p-4 sm:p-5 shadow-2xl space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#fbbf24] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {decision.urgency} • {decision.category}
                        </span>
                        {decision.minPowerTier && (
                          <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-purple-400" />
                            {decision.minPowerTier}+ Tier
                          </span>
                        )}
                      </div>
                      {remainingMonths !== undefined && (
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          isExpiringSoon
                            ? 'bg-rose-950/90 text-rose-300 border border-rose-700 animate-pulse'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                        }`}>
                          <Clock className="w-3 h-3" />
                          Expires in {remainingMonths} month{remainingMonths !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#ececec]">{decision.title}</h3>
                      <p className="text-xs text-[rgba(236,236,232,0.8)] mt-1 leading-relaxed">{decision.description}</p>
                    </div>

                    {/* Decision Options */}
                    <div className="space-y-2 pt-2 border-t border-[rgba(236,236,232,0.08)]">
                      {decision.options.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => handleDecisionClick(decision, opt.id)}
                          className="w-full text-left p-3 rounded-[12px] bg-[#0c0c0e] hover:bg-[#1a1a20] border border-[rgba(236,236,232,0.1)] hover:border-[#fbbf24]/50 transition-all cursor-pointer group flex flex-col gap-1.5 touch-manipulation active:scale-99"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#ececec] group-hover:text-[#fbbf24] transition-colors">
                              {opt.label}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              opt.risk === 'High' ? 'text-[#f43f5e] bg-rose-500/10' : 'text-[#10b981] bg-emerald-500/10'
                            }`}>
                              Risk: {opt.risk}
                            </span>
                          </div>
                          <p className="text-[11px] text-[rgba(236,236,232,0.6)] leading-relaxed">{opt.description}</p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#fbbf24] pt-1">
                            <span>Timeline: {opt.timeHorizon}</span>
                            {opt.cost && <span>Cost: ${opt.cost.toLocaleString()}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CATEGORY FILTER STRIP FOR LIVE CHRONOLOGY FEED */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0 mr-1" />
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                    : 'bg-[#141418] text-[rgba(236,236,232,0.6)] hover:text-[#ececec] border border-[rgba(236,236,232,0.06)]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* EVENTS LIVE TIMELINE FEED */}
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="bg-[#16161a] p-8 rounded-[16px] border border-[rgba(236,236,232,0.08)] text-center text-xs text-[rgba(236,236,232,0.4)]">
                No chronological events recorded for this category yet. Advance the month to simulate life progression.
              </div>
            ) : (
              filteredEvents.map(event => (
                <div 
                  key={event.id}
                  className={`bg-[#16161a] border rounded-[16px] p-4 sm:p-5 shadow-lg transition-all space-y-2.5 relative ${
                    event.type === 'CRISIS' || event.severity === 'Critical'
                      ? 'border-rose-500/40 shadow-rose-950/20'
                      : 'border-[rgba(236,236,232,0.08)] hover:border-[rgba(236,236,232,0.2)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <DominiumIcon name={getCategorySemanticIcon(event.category)} size="sm" decorative />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#fbbf24] font-bold">
                        {event.category} • Month {event.timestampMonth || event.createdMonth}, {event.timestampYear || event.createdYear} (Age {event.age})
                      </span>
                      {event.type && (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {getEventTypeIcon(event.type)}
                          {event.type}
                        </span>
                      )}
                      {event.severity && (
                        <span className={`font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(event.severity)}`}>
                          {event.severity}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {event.triggerReason && (
                        <button
                          onClick={() => toggleTriggerReason(event.id)}
                          className="font-mono text-[10px] text-amber-400/90 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1"
                          title="View Causal Origin"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Causal Origin</span>
                        </button>
                      )}

                      {state && (
                        <button
                          onClick={() => setSelectedExplanation({
                            title: event.title,
                            text: generateEventExplanation(event.title, event.category, state)
                          })}
                          className="text-[rgba(236,236,232,0.4)] hover:text-[#fbbf24] transition-colors p-1 cursor-pointer"
                          title="AI Strategic Analysis"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#ececec]">{event.title}</h4>
                    <p className="text-xs text-[rgba(236,236,232,0.7)] mt-0.5 leading-relaxed">{event.description}</p>
                  </div>

                  {/* Expandable Causal Trigger Reason */}
                  {event.triggerReason && expandedTriggerEvents[event.id] && (
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200/90 font-mono space-y-1">
                      <div className="flex items-center gap-1 font-bold text-amber-400 uppercase text-[9px] tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        State Difference Trigger Reason:
                      </div>
                      <p>{event.triggerReason}</p>
                    </div>
                  )}

                  {/* Impact Pills */}
                  {event.consequences && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {event.consequences.cashChange !== undefined && event.consequences.cashChange !== 0 && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          event.consequences.cashChange > 0 ? 'text-[#10b981] bg-emerald-500/10' : 'text-[#f43f5e] bg-rose-500/10'
                        }`}>
                          {event.consequences.cashChange > 0 ? '+' : ''}${event.consequences.cashChange.toLocaleString()} Cash
                        </span>
                      )}
                      {event.consequences.reputationChange !== undefined && event.consequences.reputationChange !== 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded text-[#fbbf24] bg-amber-500/10">
                          {event.consequences.reputationChange > 0 ? '+' : ''}{event.consequences.reputationChange} Reputation
                        </span>
                      )}
                      {event.consequences.stressChange !== undefined && event.consequences.stressChange !== 0 && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          event.consequences.stressChange < 0 ? 'text-[#10b981] bg-emerald-500/10' : 'text-[#f43f5e] bg-rose-500/10'
                        }`}>
                          {event.consequences.stressChange > 0 ? '+' : ''}{event.consequences.stressChange} Stress
                        </span>
                      )}
                      {event.consequences.happinessChange !== undefined && event.consequences.happinessChange !== 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded text-[#d946ef] bg-pink-500/10">
                          {event.consequences.happinessChange > 0 ? '+' : ''}{event.consequences.happinessChange} Happiness
                        </span>
                      )}
                      {event.consequences.details && event.consequences.details.map((detail, dIdx) => (
                        <span key={dIdx} className="text-[10px] font-mono px-2 py-0.5 rounded text-zinc-400 bg-zinc-800/80 border border-zinc-700/60">
                          {detail}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {event.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* AI Explanation Modal */}
      {selectedExplanation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#16161a] border border-amber-400/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider font-mono">Causal AI Strategic Breakdown</h3>
              </div>
              <button 
                onClick={() => setSelectedExplanation(null)}
                className="text-zinc-500 hover:text-zinc-200 text-xs font-mono font-bold cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-amber-400">{selectedExplanation.title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">{selectedExplanation.text}</p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedExplanation(null)}
                className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
