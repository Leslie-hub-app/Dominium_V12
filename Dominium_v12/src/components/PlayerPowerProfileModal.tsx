import React, { useState } from 'react';
import { GameState, PowerTier } from '../types';
import { 
  POWER_TIER_DEFINITIONS, 
  POWER_TIER_RANKS, 
  calculatePlayerPowerProfile 
} from '../engine/powerTierEngine';
import { 
  ShieldAlert, 
  Zap, 
  Award, 
  TrendingUp, 
  Landmark, 
  Building2, 
  Eye, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Layers,
  BarChart3,
  Globe2,
  ChevronRight
} from 'lucide-react';

interface PlayerPowerProfileModalProps {
  state: GameState;
  onClose: () => void;
}

export const PlayerPowerProfileModal: React.FC<PlayerPowerProfileModalProps> = ({ state, onClose }) => {
  const profile = state.playerPowerProfile || calculatePlayerPowerProfile(state);
  const currentTierDef = POWER_TIER_DEFINITIONS[profile.powerTier];
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'roadmap' | 'scrutiny'>('overview');

  const tierOrder: PowerTier[] = ['UNKNOWN', 'LOCAL', 'SUCCESSFUL', 'PROMINENT', 'ELITE', 'POWERFUL', 'GLOBAL'];

  const getTierColor = (tier: PowerTier) => {
    switch (tier) {
      case 'UNKNOWN': return { bg: 'bg-zinc-800/80', text: 'text-zinc-300', border: 'border-zinc-700', badge: 'bg-zinc-700/50 text-zinc-300' };
      case 'LOCAL': return { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-800/50', badge: 'bg-blue-900/40 text-blue-300' };
      case 'SUCCESSFUL': return { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/50', badge: 'bg-emerald-900/40 text-emerald-300' };
      case 'PROMINENT': return { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-800/50', badge: 'bg-purple-900/40 text-purple-300' };
      case 'ELITE': return { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-700/60', badge: 'bg-amber-900/40 text-amber-300' };
      case 'POWERFUL': return { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-700/60', badge: 'bg-orange-900/40 text-orange-300' };
      case 'GLOBAL': return { bg: 'bg-rose-950/50', text: 'text-rose-400', border: 'border-rose-700/70', badge: 'bg-rose-900/40 text-rose-300' };
    }
  };

  const currentColors = getTierColor(profile.powerTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="player-power-profile-modal"
        className="relative w-full max-w-4xl bg-[#0e0e12] border border-[rgba(236,236,232,0.12)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(236,236,232,0.08)] bg-[#14141a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#ecece8] tracking-tight">
                  Player Power & Systemic Influence
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentColors.border} ${currentColors.bg} ${currentColors.text}`}>
                  {profile.powerTier} TIER
                </span>
              </div>
              <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                Calculated from real net worth, enterprise footprint, political office, and media exposure.
              </p>
            </div>
          </div>

          <button
            id="close-power-profile-modal-btn"
            onClick={onClose}
            className="text-[rgba(236,236,232,0.5)] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[rgba(236,236,232,0.08)] bg-[#111116] px-5 gap-2 overflow-x-auto scrollbar-none">
          <button
            id="tab-power-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-[rgba(236,236,232,0.6)] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tier Overview
          </button>
          <button
            id="tab-power-breakdown"
            onClick={() => setActiveTab('breakdown')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'breakdown'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-[rgba(236,236,232,0.6)] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Power Score Breakdown ({profile.powerScore} pts)
          </button>
          <button
            id="tab-power-scrutiny"
            onClick={() => setActiveTab('scrutiny')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scrutiny'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-[rgba(236,236,232,0.6)] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Influence & Scrutiny Meters
          </button>
          <button
            id="tab-power-roadmap"
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-[rgba(236,236,232,0.6)] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            7-Tier Hierarchy Roadmap
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Active Tier Hero Card */}
              <div className={`p-4 sm:p-5 rounded-xl border ${currentColors.border} ${currentColors.bg} relative overflow-hidden`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[rgba(236,236,232,0.6)]">
                        Rank {profile.tierRank + 1} of 7 • Dominium Hierarchy
                      </span>
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${currentColors.text}`}>
                      {currentTierDef.label}
                    </h3>
                    <p className="text-xs text-[rgba(236,236,232,0.8)] mt-1 max-w-xl">
                      {currentTierDef.description}
                    </p>
                  </div>

                  <div className="sm:text-right bg-black/40 p-3 rounded-lg border border-white/5 shrink-0">
                    <span className="text-[10px] font-mono uppercase text-[rgba(236,236,232,0.6)] block">
                      Total Power Score
                    </span>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {profile.powerScore}
                    </span>
                    <span className="text-[10px] text-[rgba(236,236,232,0.5)] block">
                      Tier Range: {currentTierDef.minScore} - {currentTierDef.maxScore === Infinity ? '∞' : currentTierDef.maxScore} pts
                    </span>
                  </div>
                </div>

                {/* Progress to Next Tier */}
                {profile.nextTier ? (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[rgba(236,236,232,0.7)] flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        Progress to <strong className="text-white">{profile.nextTier} Tier</strong>
                      </span>
                      <span className="font-mono text-amber-300 font-bold">
                        {profile.progressToNextTierPercent}% ({profile.pointsToNextTier} pts needed)
                      </span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${profile.progressToNextTierPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-rose-300 font-medium flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4" />
                    Pinnacle reached: You operate at the highest Global sovereign power tier.
                  </div>
                )}
              </div>

              {/* Dynamic Perks vs Burdens Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Perks */}
                <div className="bg-[#14141a] border border-emerald-900/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Tier Unlocked Opportunities & Perks
                  </div>
                  <ul className="space-y-2">
                    {profile.tierPerks.map((perk, idx) => (
                      <li key={idx} className="text-xs text-[rgba(236,236,232,0.85)] flex items-start gap-2 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Systemic Burdens & Scrutiny */}
                <div className="bg-[#14141a] border border-rose-900/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    Heightened Burdens, Scrutiny & Opposition
                  </div>
                  <ul className="space-y-2">
                    {profile.tierBurdens.map((burden, idx) => (
                      <li key={idx} className="text-xs text-[rgba(236,236,232,0.85)] flex items-start gap-2 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{burden}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Gauges Summary */}
              <div className="bg-[#14141a] border border-[rgba(236,236,232,0.08)] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-[rgba(236,236,232,0.7)] uppercase tracking-wider mb-3">
                  Key Systemic Posture
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0e0e12] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-[rgba(236,236,232,0.5)] block">Visibility</span>
                    <span className="text-sm font-bold text-blue-400 font-mono">{profile.visibility}%</span>
                  </div>
                  <div className="bg-[#0e0e12] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-[rgba(236,236,232,0.5)] block">Media Attention</span>
                    <span className="text-sm font-bold text-purple-400 font-mono">{profile.mediaAttention}%</span>
                  </div>
                  <div className="bg-[#0e0e12] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-[rgba(236,236,232,0.5)] block">Public Scrutiny</span>
                    <span className={`text-sm font-bold font-mono ${profile.scrutiny > 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {profile.scrutiny}%
                    </span>
                  </div>
                  <div className="bg-[#0e0e12] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-[rgba(236,236,232,0.5)] block">Regulatory Watch</span>
                    <span className={`text-sm font-bold font-mono ${profile.regulatoryAttention > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {profile.regulatoryAttention}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BREAKDOWN */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <div className="bg-[#14141a] p-4 rounded-xl border border-[rgba(236,236,232,0.08)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Power Score Calculation (8 Pillars)</h3>
                    <p className="text-xs text-[rgba(236,236,232,0.6)]">
                      Total Power Score is deterministically derived from live simulation assets, influence, and achievements.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-[rgba(236,236,232,0.5)]">Total</span>
                    <span className="block text-xl font-bold text-amber-400 font-mono">{profile.powerScore} pts</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Net Worth */}
                  <div className="bg-[#0e0e12] p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Net Worth Pillar
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-300">
                        +{profile.breakdown.netWorthScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                      Net worth scales logarithmically from $100k up to $10B+.
                    </p>
                  </div>

                  {/* Business Empire */}
                  <div className="bg-[#0e0e12] p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Business Empire Pillar
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-300">
                        +{profile.breakdown.businessScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                      Enterprises owned ({state.companies.length}), employee headcount, revenue, and public listings.
                    </p>
                  </div>

                  {/* Political Influence */}
                  <div className="bg-[#0e0e12] p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5" /> Political Office & Influence
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-300">
                        +{profile.breakdown.politicsScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                      {state.politics.currentOffice.inOffice ? state.politics.currentOffice.title : 'No active office'} • Capital: {state.politics.currentOffice.politicalCapital || 0} pts.
                    </p>
                  </div>

                  {/* Reputation & World Influence */}
                  <div className="bg-[#0e0e12] p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Reputation & World Influence
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        +{profile.breakdown.reputationScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                      Reputation ({state.character.attributes.reputation}%) & World Influence ({state.character.attributes.worldInfluence}%).
                    </p>
                  </div>

                  {/* Media Exposure */}
                  <div className="bg-[#0e0e12] p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5" /> Media & Public Reach
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        +{profile.breakdown.mediaScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                      Derived from news archive mentions and high-profile public appearances.
                    </p>
                  </div>

                  {/* Mega-Projects */}
                  <div className="bg-[#0e0e12] p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Mega-Projects
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-300">
                        +{profile.breakdown.projectsScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                      Completed skyscrapers, aerospace facilities, and major research centers.
                    </p>
                  </div>

                  {/* Sports Franchises */}
                  <div className="bg-[#0e0e12] p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Sports Franchise Ownership
                      </span>
                      <span className="text-xs font-mono font-bold text-orange-300">
                        +{profile.breakdown.sportsScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                      Teams owned ({state.sports?.ownedTeams?.length || 0}) and franchise valuation.
                    </p>
                  </div>

                  {/* Philanthropy */}
                  <div className="bg-[#0e0e12] p-3.5 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Philanthropy & Foundations
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-300">
                        +{profile.breakdown.philanthropyScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(236,236,232,0.6)]">
                      Civic foundations established and major philanthropic grants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCRUTINY & INFLUENCE METERS */}
          {activeTab === 'scrutiny' && (
            <div className="space-y-4">
              <div className="bg-[#14141a] p-4 rounded-xl border border-[rgba(236,236,232,0.08)]">
                <h3 className="text-sm font-bold text-white mb-1">Systemic Influence & Pressure Gauges</h3>
                <p className="text-xs text-[rgba(236,236,232,0.6)] mb-4">
                  As power expands, public exposure and regulatory scrutiny rise in tandem, triggering unique causal challenges.
                </p>

                <div className="space-y-3.5">
                  {/* Visibility */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[rgba(236,236,232,0.8)] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-400" /> Public Visibility
                      </span>
                      <span className="font-mono text-blue-400 font-bold">{profile.visibility}%</span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${profile.visibility}%` }} />
                    </div>
                  </div>

                  {/* Media Attention */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[rgba(236,236,232,0.8)] flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-purple-400" /> Media Attention
                      </span>
                      <span className="font-mono text-purple-400 font-bold">{profile.mediaAttention}%</span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${profile.mediaAttention}%` }} />
                    </div>
                  </div>

                  {/* Political Influence */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[rgba(236,236,232,0.8)] flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-emerald-400" /> Political Influence
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">{profile.politicalInfluence}%</span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${profile.politicalInfluence}%` }} />
                    </div>
                  </div>

                  {/* Business Influence */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[rgba(236,236,232,0.8)] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" /> Business Influence
                      </span>
                      <span className="font-mono text-amber-400 font-bold">{profile.businessInfluence}%</span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${profile.businessInfluence}%` }} />
                    </div>
                  </div>

                  {/* Public Influence */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[rgba(236,236,232,0.8)] flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-cyan-400" /> Public Influence
                      </span>
                      <span className="font-mono text-cyan-400 font-bold">{profile.publicInfluence}%</span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${profile.publicInfluence}%` }} />
                    </div>
                  </div>

                  {/* Public Scrutiny */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[rgba(236,236,232,0.8)] flex items-center gap-1.5 font-semibold text-rose-300">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Public Scrutiny Level
                      </span>
                      <span className="font-mono text-rose-400 font-bold">
                        {profile.scrutiny}% ({profile.scrutiny > 65 ? 'Elevated Pressure' : profile.scrutiny > 35 ? 'Moderate' : 'Low'})
                      </span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${profile.scrutiny}%` }} />
                    </div>
                  </div>

                  {/* Regulatory Attention */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[rgba(236,236,232,0.8)] flex items-center gap-1.5 font-semibold text-orange-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Regulatory & Antitrust Attention
                      </span>
                      <span className="font-mono text-orange-400 font-bold">
                        {profile.regulatoryAttention}% ({profile.regulatoryAttention > 50 ? 'Audit Watch' : 'Clear'})
                      </span>
                    </div>
                    <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${profile.regulatoryAttention}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 7-TIER ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              <p className="text-xs text-[rgba(236,236,232,0.6)] mb-2">
                Every tier grants exclusive dealflow, institutional access, and prestige while demanding stricter governance and crisis readiness.
              </p>

              <div className="space-y-3">
                {tierOrder.map((tierKey) => {
                  const def = POWER_TIER_DEFINITIONS[tierKey];
                  const isCurrent = profile.powerTier === tierKey;
                  const isPast = POWER_TIER_RANKS[profile.powerTier] > def.rank;
                  const colors = getTierColor(tierKey);

                  return (
                    <div 
                      key={tierKey}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent 
                          ? `${colors.border} ${colors.bg} ring-1 ring-amber-400/40` 
                          : isPast
                          ? 'bg-[#121217] border-emerald-900/30 opacity-80'
                          : 'bg-[#101015] border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${colors.badge} border ${colors.border}`}>
                            TIER {def.rank + 1}
                          </span>
                          <h4 className={`text-sm font-bold ${isCurrent ? colors.text : 'text-white'}`}>
                            {def.label} ({tierKey})
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              Active Tier
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Achieved
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-[rgba(236,236,232,0.6)]">
                          Threshold: {def.minScore} - {def.maxScore === Infinity ? '∞' : def.maxScore} pts
                        </span>
                      </div>

                      <p className="text-xs text-[rgba(236,236,232,0.7)] mb-2.5">
                        {def.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-emerald-950/20 p-2 rounded border border-emerald-900/20">
                          <span className="font-semibold text-emerald-400 block mb-0.5">Perks:</span>
                          <span className="text-[rgba(236,236,232,0.8)]">{def.basePerks.join(', ')}</span>
                        </div>
                        <div className="bg-rose-950/20 p-2 rounded border border-rose-900/20">
                          <span className="font-semibold text-rose-400 block mb-0.5">Burdens:</span>
                          <span className="text-[rgba(236,236,232,0.8)]">{def.baseBurdens.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[rgba(236,236,232,0.08)] bg-[#111116]">
          <span className="text-[11px] text-[rgba(236,236,232,0.5)]">
            Dominium Power Matrix • Dynamic event gating enabled
          </span>
          <button
            id="close-power-profile-footer-btn"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#202028] hover:bg-[#2a2a34] text-white rounded-lg transition-colors cursor-pointer border border-white/10"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
