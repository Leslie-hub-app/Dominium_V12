import React, { useState } from 'react';
import { 
  GameState, 
  LifePressure, 
  Responsibility, 
  LifeOpportunity, 
  ActiveCrisisRecord,
  StrategyArchetype
} from '../../types';
import { ensureLifeSystemState, calculateMonthlyTimeBudget } from '../../engine/lifeEngine';
import { LIFE_TIER_DEFINITIONS, getLifeTierRank } from '../../engine/lifeProgressionEngine';
import { TIER_GAMEPLAY_PROFILES, STRATEGY_ARCHETYPE_DEFINITIONS } from '../../engine/lifeGameplayConfig';
import { 
  User,
  Users,
  Briefcase, 
  GraduationCap, 
  Heart, 
  HeartPulse, 
  Smile, 
  Brain, 
  Flame, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Share2, 
  Calendar, 
  Crown,
  Activity,
  Layers,
  Compass,
  AlertCircle,
  Award,
  Zap,
  Target,
  DollarSign,
  Building,
  Landmark,
  FileText
} from 'lucide-react';

interface LifeOverviewViewProps {
  state: GameState;
  onNavigateTab: (tab: string) => void;
  onAdvanceMonth?: () => void;
  onUpdateState?: (newState: GameState) => void;
}

export const LifeOverviewView: React.FC<LifeOverviewViewProps> = ({
  state,
  onNavigateTab,
  onUpdateState
}) => {
  const life = ensureLifeSystemState(state);
  const timeBudget = calculateMonthlyTimeBudget(life.timeAllocation);
  const { character, currentJob, education, relationships, lifeGameplay } = state;
  const [activeSection, setActiveSection] = useState<'summary' | 'pressures' | 'responsibilities' | 'opportunities' | 'strategy'>('summary');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Active degree
  const activeDegree = education.find(e => !e.completed);
  const partner = relationships.find(r => ['Spouse', 'Partner'].includes(r.relation));

  // Burnout status color
  const getBurnoutBadge = () => {
    switch (timeBudget.burnoutRisk) {
      case 'Critical':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Critical Burnout ({timeBudget.utilizationPercentage}%)</span>;
      case 'Severe':
        return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High Strain ({timeBudget.utilizationPercentage}%)</span>;
      case 'Moderate':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Busy ({timeBudget.utilizationPercentage}%)</span>;
      default:
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Balanced ({timeBudget.utilizationPercentage}%)</span>;
    }
  };

  const ownedAssetsCount = life.marketplaceInventory.filter(i => i.purchased).length;
  const totalFollowers = Object.values(life.socialAccounts).reduce((sum, acc) => sum + acc.followers, 0);

  // Data helpers
  const pressures = lifeGameplay?.activePressures || [];
  const responsibilities = lifeGameplay?.currentResponsibilities || [];
  const opportunities = (lifeGameplay?.activeOpportunities || []).filter(o => o.status === 'AVAILABLE');
  const crises = (lifeGameplay?.activeCrises || []).filter(c => !c.resolved);
  const strategy = lifeGameplay?.strategyProfile;
  const milestones = lifeGameplay?.milestones || [];
  const outlook = lifeGameplay?.strategicOutlook;

  // Handlers for Expansion 1B Interactive Gameplay
  const handleMitigatePressure = (pressure: LifePressure, opt: any) => {
    if (opt.cost && (state.finances?.cash ?? 0) < opt.cost) {
      setActionFeedback(`Insufficient cash: Requires $${(opt.cost || 0).toLocaleString()}`);
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }

    if (opt.cost) {
      state.finances.cash -= opt.cost;
    }

    pressure.intensity = Math.max(0, pressure.intensity - (opt.potentialRelief || 20));
    if (pressure.intensity < 65 && pressure.severity === 'Severe') pressure.severity = 'Moderate';
    if (pressure.intensity < 35) pressure.severity = 'Low';

    state.character.attributes.stress = Math.max(5, state.character.attributes.stress - 8);
    state.character.attributes.happiness = Math.min(100, state.character.attributes.happiness + 5);

    setActionFeedback(`Mitigation applied: ${opt.label} (-${opt.potentialRelief || 20} Pressure)`);
    setTimeout(() => setActionFeedback(null), 3500);

    if (onUpdateState) onUpdateState({ ...state });
  };

  const handleAcceptOpportunity = (opp: LifeOpportunity) => {
    const opt = opp.decisionOption;
    if (opt?.cost && (state.finances?.cash ?? 0) < opt.cost) {
      setActionFeedback(`Cannot accept: Requires $${(opt.cost || 0).toLocaleString()} cash.`);
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }

    if (opt?.cost) {
      state.finances.cash -= opt.cost;
    }

    // Apply any direct consequences
    if (opt?.consequences) {
      for (const c of opt.consequences) {
        if (c.property === 'intelligence') state.character.attributes.intelligence = Math.min(100, state.character.attributes.intelligence + Number(c.value));
        if (c.property === 'reputation') state.character.attributes.reputation = Math.min(100, state.character.attributes.reputation + Number(c.value));
      }
    }

    opp.status = 'ACCEPTED';
    state.character.attributes.happiness = Math.min(100, state.character.attributes.happiness + 6);

    setActionFeedback(`Opportunity Accepted: "${opp.title}"`);
    setTimeout(() => setActionFeedback(null), 3500);

    if (onUpdateState) onUpdateState({ ...state });
  };

  const handleDeclineOpportunity = (opp: LifeOpportunity) => {
    opp.status = 'DECLINED';
    setActionFeedback(`Opportunity Declined: "${opp.title}"`);
    setTimeout(() => setActionFeedback(null), 2500);
    if (onUpdateState) onUpdateState({ ...state });
  };

  const renderTrendIcon = (trend: string) => {
    if (trend === 'Escalating') return <TrendingUp className="w-3.5 h-3.5 text-rose-400" />;
    if (trend === 'Decreasing') return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
    return <Minus className="w-3.5 h-3.5 text-zinc-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback Notification */}
      {actionFeedback && (
        <div className="bg-amber-400 text-zinc-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-zinc-900 hover:text-black font-black text-sm ml-2">×</button>
        </div>
      )}

      {/* 1. TOP SEGMENTED SWITCHER FOR EXPANSION 1B LIFE SIMULATION */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-[#141418] p-1.5 rounded-2xl border border-zinc-800 shadow-md">
        <button
          onClick={() => setActiveSection('summary')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'summary'
              ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveSection('pressures')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'pressures'
              ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Pressures</span>
          {pressures.filter(p => p.severity === 'Severe' || p.severity === 'Crisis').length > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-black">
              {pressures.filter(p => p.severity === 'Severe' || p.severity === 'Crisis').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('responsibilities')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'responsibilities'
              ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Responsibilities</span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
            {responsibilities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('opportunities')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'opportunities'
              ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Opportunities</span>
          {opportunities.length > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-black">
              {opportunities.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('strategy')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            activeSection === 'strategy'
              ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Strategy</span>
        </button>
      </div>

      {/* 2. SECTION: SUMMARY / MAIN OVERVIEW */}
      {activeSection === 'summary' && (
        <div className="space-y-4">
          {/* HERO CHARACTER & TIME BUDGET SUMMARY */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-zinc-800 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-xl shadow-inner">
                  {character.firstName[0]}{character.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-zinc-100">
                      {character.firstName} {character.lastName}
                    </h2>
                    <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {character.lifeStage} ({character.age}y {((state.currentMonth - (character.birthMonth || 1) + 12) % 12)}m)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {character.residenceCity}, {character.residenceCountry} • {character.gender}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getBurnoutBadge()}
                <button
                  onClick={() => onNavigateTab('schedule')}
                  className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time Budget</span>
                </button>
              </div>
            </div>

            {/* Core Attributes Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Health</div>
                    <div className="text-sm font-black text-zinc-100">{Math.round(character.attributes.health)}/100</div>
                  </div>
                </div>
                <div className="w-10 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${character.attributes.health}%` }} />
                </div>
              </div>

              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Happiness</div>
                    <div className="text-sm font-black text-zinc-100">{Math.round(character.attributes.happiness)}/100</div>
                  </div>
                </div>
                <div className="w-10 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${character.attributes.happiness}%` }} />
                </div>
              </div>

              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Stress</div>
                    <div className="text-sm font-black text-orange-400">{Math.round(character.attributes.stress)}/100</div>
                  </div>
                </div>
                <div className="w-10 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${character.attributes.stress}%` }} />
                </div>
              </div>

              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Intellect</div>
                    <div className="text-sm font-black text-zinc-100">{Math.round(character.attributes.intelligence)}/100</div>
                  </div>
                </div>
                <div className="w-10 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: `${character.attributes.intelligence}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* LIFE PROGRESSION TIER CARD */}
          {state.lifeProgression && (
            <div className="bg-gradient-to-r from-amber-950/40 via-[#14141a] to-zinc-900 p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">Life Progression Tier</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                        Tier {getLifeTierRank(state.lifeProgression.currentTier) + 1}/8
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">
                      {LIFE_TIER_DEFINITIONS[state.lifeProgression.currentTier]?.displayName || state.lifeProgression.currentTier}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('progression_profile')}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Progression Score: <strong className="text-amber-300 font-mono">{state.lifeProgression.overallProgressionScore}/1,000 pts</strong></span>
                  {state.lifeProgression.nextTier && (
                    <span className="text-zinc-400 font-mono text-[11px]">
                      Next: {LIFE_TIER_DEFINITIONS[state.lifeProgression.nextTier]?.displayName} ({state.lifeProgression.progressToNextTier}%)
                    </span>
                  )}
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, state.lifeProgression.progressToNextTier))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STRATEGIC OUTLOOK & ACTIVE PRESSURES SUMMARY BANNER */}
          {outlook && (
            <div className="bg-[#121216] p-4 rounded-2xl border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-zinc-200 uppercase tracking-wide">Strategic Outlook</span>
                </div>
                <button
                  onClick={() => setActiveSection('pressures')}
                  className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
                >
                  <span>Manage Pressures ({pressures.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{outlook.summary}</p>
              {outlook.criticalWarnings.length > 0 && (
                <div className="space-y-1 pt-1">
                  {outlook.criticalWarnings.map((w, idx) => (
                    <div key={idx} className="text-xs text-rose-400 flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PILLARS OVERVIEW GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* CAREER */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-zinc-100">Career & Workplace</h3>
                </div>
                <button onClick={() => onNavigateTab('career')} className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer">
                  <span>Manage</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {currentJob ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-zinc-100 text-sm">{currentJob.title}</div>
                      <div className="text-xs text-zinc-400">{currentJob.companyName} • {currentJob.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-400">${(currentJob.monthlySalary || 0).toLocaleString()}/mo</div>
                      <div className="text-[10px] text-zinc-400">Performance: {Math.round(currentJob.performance)}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/80 text-center space-y-2">
                  <p className="text-xs text-zinc-400">No active employment.</p>
                  <button onClick={() => onNavigateTab('career')} className="px-3 py-1.5 bg-amber-400 text-zinc-950 rounded-lg text-xs font-black">Browse Job Market</button>
                </div>
              )}
            </div>

            {/* EDUCATION */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-sm text-zinc-100">Education & Academics</h3>
                </div>
                <button onClick={() => onNavigateTab('education')} className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {activeDegree ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-zinc-100 text-sm">{activeDegree.qualification} in {activeDegree.field}</div>
                      <div className="text-xs text-zinc-400">{activeDegree.institution}</div>
                    </div>
                    <div className="text-right text-xs font-bold text-sky-400">
                      {activeDegree.monthsCompleted} / {activeDegree.durationMonths} mos
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/80 text-center space-y-2">
                  <p className="text-xs text-zinc-400">No active degree in progress.</p>
                  <button onClick={() => onNavigateTab('education')} className="px-3 py-1.5 bg-sky-500 text-zinc-950 rounded-lg text-xs font-black">Apply to Degrees</button>
                </div>
              )}
            </div>

            {/* RELATIONSHIPS */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <h3 className="font-bold text-sm text-zinc-100">Romance & Social Circle</h3>
                </div>
                <button onClick={() => onNavigateTab('relationships')} className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer">
                  <span>View Circle</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400">Status:</span>
                  <span className="font-bold text-zinc-100">{partner ? `${partner.relation} (${partner.name})` : 'Single & Open'}</span>
                </div>
              </div>
            </div>

            {/* LIFESTYLE */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold text-sm text-zinc-100">Lifestyle & Assets</h3>
                </div>
                <button onClick={() => onNavigateTab('marketplace')} className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer">
                  <span>Marketplace</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Owned Assets</span>
                  <div className="font-black text-zinc-100 text-sm mt-0.5">{ownedAssetsCount} Items</div>
                </div>
                <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Social Followers</span>
                  <div className="font-black text-amber-400 text-sm mt-0.5">{totalFollowers.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECTION: PRESSURES & ACTIVE CRISES */}
      {activeSection === 'pressures' && (
        <div className="space-y-4">
          {/* Active Crises Banner if any */}
          {crises.length > 0 && (
            <div className="space-y-3">
              {crises.map(crisis => (
                <div key={crisis.id} className="bg-gradient-to-r from-red-950/80 via-zinc-900 to-zinc-900 p-4 rounded-2xl border-2 border-red-500/60 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-red-500 text-zinc-950">
                            {crisis.severity} Crisis • Month {crisis.monthsInCrisis}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-white mt-0.5">{crisis.title}</h4>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{crisis.description}</p>

                  <div className="bg-zinc-950/80 p-3 rounded-xl border border-red-500/20 space-y-2">
                    <div className="text-[11px] font-black text-red-400 uppercase tracking-wide">Crisis Action & Relief Options:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {crisis.mitigationChoices.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            const matchP = pressures.find(p => p.type === crisis.type);
                            if (matchP) handleMitigatePressure(matchP, opt);
                          }}
                          className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-red-400/50 rounded-xl text-left transition-all cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs font-black text-zinc-100">
                            <span>{opt.label}</span>
                            {opt.cost !== undefined && opt.cost !== null && opt.cost > 0 && <span className="text-amber-400 font-mono">${(opt.cost || 0).toLocaleString()}</span>}
                          </div>
                          <p className="text-[11px] text-zinc-400">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pressures Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Life Pressures & Mitigation Actions ({pressures.length})</span>
              </h3>
              <span className="text-xs text-zinc-400">Evaluated every month based on live state</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {pressures.map(pressure => {
                const isHigh = pressure.severity === 'Severe' || pressure.severity === 'Crisis';
                return (
                  <div 
                    key={pressure.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      pressure.severity === 'Crisis' ? 'bg-red-950/20 border-red-500/40 shadow-sm' :
                      pressure.severity === 'Severe' ? 'bg-orange-950/20 border-orange-500/40 shadow-sm' :
                      'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-white">{pressure.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            pressure.severity === 'Crisis' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            pressure.severity === 'Severe' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            pressure.severity === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {pressure.severity} ({pressure.intensity}/100)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{pressure.explainReason}</p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-950/70 px-2 py-1 rounded-lg border border-zinc-800">
                          <span>Trend:</span>
                          <span className="font-bold text-zinc-200">{pressure.trend}</span>
                          {renderTrendIcon(pressure.trend)}
                        </div>
                      </div>
                    </div>

                    {/* Intensity Meter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Pressure Intensity: {pressure.intensity}/100</span>
                        <span>Active for {pressure.durationMonths} months</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            pressure.intensity >= 85 ? 'bg-red-500' :
                            pressure.intensity >= 65 ? 'bg-orange-500' :
                            pressure.intensity >= 35 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${pressure.intensity}%` }}
                        />
                      </div>
                    </div>

                    {/* Mitigation Options */}
                    {pressure.mitigationOptions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Mitigation Direct Actions:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {pressure.mitigationOptions.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => handleMitigatePressure(pressure, opt)}
                              className="p-2.5 bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-400/40 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                                <span>{opt.label}</span>
                                {opt.cost ? (
                                  <span className="text-amber-400 font-mono text-[11px]">${opt.cost.toLocaleString()}</span>
                                ) : (
                                  <span className="text-emerald-400 text-[10px] uppercase">Free</span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-1">{opt.description}</p>
                              <div className="text-[10px] text-emerald-400 font-bold mt-1">Relief: -{opt.potentialRelief} Intensity</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION: RESPONSIBILITIES */}
      {activeSection === 'responsibilities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Active Life & Enterprise Responsibilities ({responsibilities.length})</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Duties requiring active maintenance to avoid penalty consequences.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {responsibilities.map(resp => (
              <div 
                key={resp.id}
                className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                  resp.status === 'Critical' ? 'bg-red-950/20 border-red-500/40' :
                  resp.status === 'Neglected' ? 'bg-orange-950/20 border-orange-500/40' :
                  'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                        {resp.category} • {resp.scale}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        resp.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        resp.status === 'Neglected' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {resp.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-zinc-100 mt-1.5">{resp.title}</h4>
                    <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{resp.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">Maintenance Requirement</span>
                    <p className="text-zinc-200 text-xs mt-0.5">{resp.maintenanceRequirements}</p>
                  </div>
                  <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">Consequence of Neglect</span>
                    <p className="text-rose-300 text-xs mt-0.5">{resp.neglectConsequencesDescription}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SECTION: OPPORTUNITIES */}
      {activeSection === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>State-Driven Life Opportunities ({opportunities.length})</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Dynamic opportunities generated by your Life Tier, assets, and network.</p>
            </div>
          </div>

          {opportunities.length === 0 ? (
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center space-y-2">
              <Zap className="w-8 h-8 text-zinc-500 mx-auto" />
              <h4 className="text-sm font-bold text-zinc-200">No Active Opportunities Available</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Advance the month or elevate your net worth, career stature, and relationships to trigger new strategic opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {opportunities.map(opp => (
                <div 
                  key={opp.id}
                  className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-amber-400/40 transition-all space-y-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold border border-amber-400/20">
                          {opp.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                          Risk: {opp.risk}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                          Expires in {opp.expiresInMonths} mos
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white mt-1">{opp.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptOpportunity(opp)}
                        className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        Accept Opportunity
                      </button>
                      <button
                        onClick={() => handleDeclineOpportunity(opp)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{opp.description}</p>
                  <div className="text-[11px] text-zinc-400 italic">“{opp.explainReason}”</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Potential Reward</span>
                      <p className="text-emerald-400 text-xs font-medium mt-0.5">{opp.potentialReward}</p>
                    </div>
                    <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Cost & Requirements</span>
                      <p className="text-zinc-200 text-xs font-mono mt-0.5">
                        {opp.decisionOption?.cost ? `Cost: $${(opp.decisionOption.cost || 0).toLocaleString()}` : 'Free'}
                        {opp.requiredResources?.intelligence ? ` • Intellect >= ${opp.requiredResources.intelligence}` : ''}
                        {opp.requiredResources?.minNetWorth ? ` • Net Worth >= $${(opp.requiredResources.minNetWorth || 0).toLocaleString()}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. SECTION: STRATEGY PROFILE & MILESTONES */}
      {activeSection === 'strategy' && (
        <div className="space-y-4">
          {strategy && (
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">Inferred Playstyle Archetype</span>
                    <h3 className="text-lg font-black text-white">
                      {STRATEGY_ARCHETYPE_DEFINITIONS[strategy.primaryTendency]?.name || strategy.primaryTendency}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-bold">
                  Secondary: {strategy.secondaryTendency}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                {strategy.recentBehaviorSummary}
              </p>

              {/* Tendency Breakdown Bars */}
              <div className="space-y-2">
                <div className="text-xs font-black text-zinc-200 uppercase tracking-wide">Tendency Scoring Radar:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(strategy.tendencyScores) as StrategyArchetype[]).map(arch => (
                    <div key={arch} className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-zinc-300">{arch}</span>
                        <span className="font-mono text-amber-400 font-bold">{strategy.tendencyScores[arch]}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${strategy.tendencyScores[arch]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Vulnerabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Playstyle Strengths</span>
                  <ul className="text-xs text-zinc-300 space-y-1">
                    {strategy.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Strategic Vulnerabilities</span>
                  <ul className="text-xs text-zinc-300 space-y-1">
                    {strategy.vulnerabilities.map((v, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Persistent Relationship & Interaction Chronicle */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-sky-400" /><h3 className="text-sm font-black text-zinc-100">Social & Relationship Chronicle ({(life.socialInteractionHistory || []).length})</h3></div>
              <span className="text-[10px] text-zinc-500">Persistent record of meaningful interactions</span>
            </div>
            {(life.socialInteractionHistory || []).length === 0 ? <p className="text-xs text-zinc-500 py-3">Your meaningful online, dating and relationship interactions will appear here.</p> : <div className="space-y-2 max-h-72 overflow-y-auto">{life.socialInteractionHistory.slice(0,30).map((h:any,i:number)=>{const person=relationships.find(r=>r.id===h.withNpcId);return <div key={i} className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/80"><div className="flex items-center justify-between gap-2"><b className="text-xs text-zinc-200">{h.action}</b><span className="text-[9px] text-zinc-500">Tick {h.tick}</span></div><div className="text-[10px] text-amber-300 mt-1">{person?.name || 'Social network'}</div><p className="text-[10px] text-zinc-400 mt-1">{h.summary}</p></div>})}</div>}
          </div>

          {/* Chronological Life Milestones */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-zinc-100">Life Narrative Milestones ({milestones.length})</h3>
              </div>
            </div>

            {milestones.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-4">No major life milestones recorded yet. Form companies, acquire properties, or achieve power milestones to write your biography.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {milestones.slice().reverse().map(m => (
                  <div key={m.id} className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-zinc-100">{m.title}</span>
                        <span className="text-[10px] font-mono text-zinc-400">Age {m.age} ({m.month}/{m.year})</span>
                      </div>
                      <p className="text-xs text-zinc-300">{m.description}</p>
                      <div className="text-[10px] text-amber-400 font-semibold">{m.impactSummary}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
