import React, { useState } from 'react';
import { GameState, LifeTier } from '../types';
import { 
  LIFE_TIER_DEFINITIONS, 
  LIFE_TIER_RANKS, 
  LIFE_TIER_ORDER, 
  PROGRESSION_DOMAIN_WEIGHTS,
  getLifeTierRank,
  getLifeTierDefinition
} from '../engine/lifeProgressionEngine';
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  Building2, 
  Landmark, 
  Globe2, 
  Heart, 
  Briefcase, 
  Crown, 
  Compass, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Clock,
  Zap
} from 'lucide-react';

interface LifeProgressionModalProps {
  state: GameState;
  onClose: () => void;
}

export const LifeProgressionModal: React.FC<LifeProgressionModalProps> = ({ state, onClose }) => {
  const profile = state.lifeProgression;
  const currentTier: LifeTier = profile?.currentTier || 'FOUNDATION';
  const currentDef = getLifeTierDefinition(currentTier);
  const [activeTab, setActiveTab] = useState<'overview' | 'domains' | 'roadmap' | 'maintenance'>('overview');

  const getTierTheme = (tier: LifeTier) => {
    switch (tier) {
      case 'FOUNDATION':
        return { bg: 'bg-zinc-800/80', text: 'text-zinc-300', border: 'border-zinc-700', badge: 'bg-zinc-700/50 text-zinc-300' };
      case 'INDEPENDENCE':
        return { bg: 'bg-emerald-950/50', text: 'text-emerald-400', border: 'border-emerald-700/60', badge: 'bg-emerald-900/50 text-emerald-300' };
      case 'PROFESSIONAL_BUILDER':
        return { bg: 'bg-cyan-950/50', text: 'text-cyan-400', border: 'border-cyan-700/60', badge: 'bg-cyan-900/50 text-cyan-300' };
      case 'ENTREPRENEUR_OWNER':
        return { bg: 'bg-purple-950/50', text: 'text-purple-400', border: 'border-purple-700/60', badge: 'bg-purple-900/50 text-purple-300' };
      case 'TYCOON':
        return { bg: 'bg-amber-950/50', text: 'text-amber-400', border: 'border-amber-700/60', badge: 'bg-amber-900/50 text-amber-300' };
      case 'POWER_INFLUENCE':
        return { bg: 'bg-orange-950/50', text: 'text-orange-400', border: 'border-orange-700/60', badge: 'bg-orange-900/50 text-orange-300' };
      case 'NATIONAL_GLOBAL_POWER':
        return { bg: 'bg-pink-950/50', text: 'text-pink-400', border: 'border-pink-700/60', badge: 'bg-pink-900/50 text-pink-300' };
      case 'LEGACY_DYNASTY':
        return { bg: 'bg-yellow-950/60', text: 'text-yellow-400', border: 'border-yellow-700/70', badge: 'bg-yellow-900/60 text-yellow-300' };
    }
  };

  const domainList = [
    { key: 'independenceScore', label: 'Personal Independence', icon: Compass, weight: PROGRESSION_DOMAIN_WEIGHTS.independence },
    { key: 'professionalScore', label: 'Career & Executive', icon: Briefcase, weight: PROGRESSION_DOMAIN_WEIGHTS.professional },
    { key: 'ownershipScore', label: 'Equity & Ownership', icon: Building2, weight: PROGRESSION_DOMAIN_WEIGHTS.ownership },
    { key: 'economicPowerScore', label: 'Capital & Financial Power', icon: TrendingUp, weight: PROGRESSION_DOMAIN_WEIGHTS.economicPower },
    { key: 'socialInfluenceScore', label: 'Social & Dynastic Influence', icon: Heart, weight: PROGRESSION_DOMAIN_WEIGHTS.socialInfluence },
    { key: 'politicalPowerScore', label: 'Statecraft & Political Office', icon: Landmark, weight: PROGRESSION_DOMAIN_WEIGHTS.politicalPower },
    { key: 'institutionalPowerScore', label: 'Institutional Scale & Megaprojects', icon: Layers, weight: PROGRESSION_DOMAIN_WEIGHTS.institutionalPower },
    { key: 'globalInfluenceScore', label: 'Global Footprint & World Reach', icon: Globe2, weight: PROGRESSION_DOMAIN_WEIGHTS.globalInfluence },
    { key: 'responsibilityScore', label: 'Civic Responsibility & Workforce', icon: ShieldCheck, weight: PROGRESSION_DOMAIN_WEIGHTS.responsibility },
    { key: 'legacyScore', label: 'Dynastic Continuity & Legacy', icon: Crown, weight: PROGRESSION_DOMAIN_WEIGHTS.legacy }
  ];

  const currentColors = getTierTheme(currentTier);
  const isUnstable = Boolean(profile?.isUnstable || (profile?.monthsBelowMaintenance && profile.monthsBelowMaintenance > 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="life-progression-modal"
        className="relative w-full max-w-4xl bg-[#0e0e12] border border-[rgba(236,236,232,0.12)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(236,236,232,0.08)] bg-[#14141a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#ecece8] tracking-tight">
                  Life Progression & Tier Hierarchy
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentColors.border} ${currentColors.bg} ${currentColors.text}`}>
                  {currentDef.displayName} (Tier {getLifeTierRank(currentTier)}/8)
                </span>
                {isUnstable && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-rose-600/60 bg-rose-950/60 text-rose-300 animate-pulse flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Tier Unstable ({profile?.monthsBelowMaintenance || 0}mo Below Maintenance)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                Multi-domain progression calculated across 10 authoritative life domains, enterprise assets, and systemic impact.
              </p>
            </div>
          </div>

          <button
            id="close-life-progression-modal-btn"
            onClick={onClose}
            className="text-[rgba(236,236,232,0.5)] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[rgba(236,236,232,0.08)] bg-[#111116] px-5 gap-2 overflow-x-auto scrollbar-none">
          <button
            id="tab-progression-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-[rgba(236,236,232,0.6)] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tier Status & Score</span>
          </button>

          <button
            id="tab-progression-domains"
            onClick={() => setActiveTab('domains')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'domains'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-[rgba(236,236,232,0.6)] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>10 Life Domains</span>
          </button>

          <button
            id="tab-progression-roadmap"
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-[rgba(236,236,232,0.6)] hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>8-Tier Roadmap</span>
          </button>

          <button
            id="tab-progression-maintenance"
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-[rgba(236,236,232,0.6)] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Maintenance & Stability</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-[#ecece8]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Primary Score & Status Banner */}
              <div className={`p-4 rounded-xl border ${currentColors.border} ${currentColors.bg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[rgba(236,236,232,0.6)]">
                    Current Progression Standing
                  </span>
                  <h3 className={`text-xl sm:text-2xl font-black ${currentColors.text} tracking-tight`}>
                    {currentDef.displayName}
                  </h3>
                  <p className="text-xs text-[rgba(236,236,232,0.8)] mt-1 max-w-xl">
                    {currentDef.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-black/40 px-4 py-3 rounded-lg border border-white/5 shrink-0">
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-[rgba(236,236,232,0.5)] block">Overall Score</span>
                    <span className="text-2xl font-mono font-black text-amber-400">
                      {profile?.overallProgressionScore ?? 0}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 block">/ 1,000 pts</span>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-[rgba(236,236,232,0.5)] block">Hierarchy Tier</span>
                    <span className="text-2xl font-mono font-black text-[#ecece8]">
                      {getLifeTierRank(currentTier)}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 block">of 8 Tiers</span>
                  </div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {profile?.nextTier && (
                <div className="p-4 bg-[#14141a] border border-[rgba(236,236,232,0.08)] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Ascension to Next Tier:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {LIFE_TIER_DEFINITIONS[profile.nextTier]?.displayName || profile.nextTier}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[rgba(236,236,232,0.6)]">
                      {profile.progressToNextTier}% Complete ({profile.pointsToNextTier} pts needed)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, profile.progressToNextTier))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Focus Areas & Unlocked Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#14141a] border border-emerald-900/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Unlocked Actions & Privileges</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[rgba(236,236,232,0.85)]">
                    {currentDef.unlockedActions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-[#14141a] border border-amber-900/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Core Focus Areas</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[rgba(236,236,232,0.85)]">
                    {currentDef.focusAreas.map((fa, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                        <span>{fa}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 10 LIFE DOMAINS */}
          {activeTab === 'domains' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[rgba(236,236,232,0.6)]">
                    10 Weighted Progression Domains
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Each domain scores from 0 to 100 and contributes toward the 1,000-point aggregate life progression score.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {domainList.map(dom => {
                  const Icon = dom.icon;
                  const score = (profile?.scores as any)?.[dom.key] ?? 0;
                  const weightedPoints = Math.round(score * dom.weight);

                  return (
                    <div 
                      key={dom.key}
                      className="p-3.5 bg-[#14141a] border border-[rgba(236,236,232,0.08)] rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/5 text-amber-400 border border-white/5">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-tight">{dom.label}</span>
                            <span className="text-[10px] font-mono text-zinc-500">Weight: {dom.weight}x</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-amber-300">{score}/100</span>
                          <span className="text-[9px] font-mono text-zinc-500 block">({weightedPoints} pts)</span>
                        </div>
                      </div>

                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 8-TIER ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[rgba(236,236,232,0.6)]">
                The 8-Tier Progression Hierarchy
              </h4>
              <div className="space-y-2">
                {LIFE_TIER_ORDER.map((t, idx) => {
                  const def = LIFE_TIER_DEFINITIONS[t];
                  const theme = getTierTheme(t);
                  const isCurrent = t === currentTier;
                  const isPast = getLifeTierRank(currentTier) > def.rank;

                  return (
                    <div 
                      key={t}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent 
                          ? `${theme.border} ${theme.bg} shadow-lg ring-1 ring-amber-400/40`
                          : isPast 
                            ? 'bg-[#121216] border-emerald-900/30 text-[rgba(236,236,232,0.6)]'
                            : 'bg-[#121216] border-[rgba(236,236,232,0.06)] text-[rgba(236,236,232,0.4)]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${
                            isCurrent ? 'bg-amber-400 text-black border-amber-300' : isPast ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-white">
                                {def.displayName}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono font-bold bg-amber-400 text-black px-1.5 py-0.2 rounded">
                                  CURRENT
                                </span>
                              )}
                              {isPast && (
                                <span className="text-[9px] font-mono text-emerald-400">
                                  ACHIEVED
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[rgba(236,236,232,0.7)] mt-0.5">
                              {def.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-[10px] font-mono text-zinc-400 block">Min Score Required</span>
                          <span className="text-xs font-mono font-bold text-amber-300">{def.promotionRequirements.minOverallScore} pts</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MAINTENANCE & STABILITY */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${isUnstable ? 'bg-rose-950/30 border-rose-700/60' : 'bg-emerald-950/30 border-emerald-700/60'}`}>
                <div className="flex items-center gap-2">
                  {isUnstable ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {isUnstable ? 'Tier Stability Under Threat' : 'Tier Maintenance Conditions Satisfied'}
                    </h4>
                    <p className="text-xs text-[rgba(236,236,232,0.8)] mt-0.5">
                      {isUnstable 
                        ? `You have fallen below the maintenance criteria for ${currentDef.displayName}. Months below maintenance: ${profile?.monthsBelowMaintenance || 0} / ${currentDef.maintenanceRequirements.gracePeriodMonths} months grace period.`
                        : `Your character comfortably satisfies the systemic maintenance thresholds for ${currentDef.displayName}.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#14141a] border border-[rgba(236,236,232,0.08)] rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[rgba(236,236,232,0.6)]">
                  Maintenance Rules for {currentDef.displayName}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Min Overall Score Floor</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {currentDef.maintenanceRequirements.minOverallScore} pts
                    </span>
                  </div>
                  <div className="p-3 bg-black/30 rounded-lg border border-white/5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Grace Period Allowance</span>
                    <span className="font-mono font-bold text-cyan-300 text-sm">
                      {currentDef.maintenanceRequirements.gracePeriodMonths} months
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">
                  {currentDef.maintenanceRequirements.description}
                </p>
              </div>

              {/* Qualifying paths for current tier */}
              <div className="p-4 bg-[#14141a] border border-[rgba(236,236,232,0.08)] rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[rgba(236,236,232,0.6)]">
                  Qualifying Advancement Paths
                </h4>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {currentDef.promotionRequirements.qualifyingPaths.map((path, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                      <span>{path}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[rgba(236,236,232,0.08)] bg-[#14141a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#0c0c0e] text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
