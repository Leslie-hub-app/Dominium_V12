import React, { useState } from 'react';
import { GameState, LivingWorldProfile } from '../../types';
import { 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Eye, 
  Users, 
  Building2, 
  Award,
  Zap,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { ensureLivingWorldProfile } from '../../engine/livingWorldEngine';

interface LivingWorldOverviewProps {
  state: GameState;
  onNavigateSubTab?: (tab: string) => void;
}

export const LivingWorldOverview: React.FC<LivingWorldOverviewProps> = ({ state, onNavigateSubTab }) => {
  const lw: LivingWorldProfile = ensureLivingWorldProfile(state);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    lw.activeWorldEvents?.[0]?.id || null
  );

  const cycleColors: Record<string, { bg: string; text: string; border: string }> = {
    EXPANSION: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    STABLE_GROWTH: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    OVERHEATING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    SLOWDOWN: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    RECESSION: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    RECOVERY: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' }
  };

  const currentCycleColor = cycleColors[lw.economy.currentCycle] || {
    bg: 'bg-zinc-800',
    text: 'text-zinc-300',
    border: 'border-zinc-700'
  };

  const selectedEvent = lw.activeWorldEvents.find(e => e.id === selectedEventId);

  return (
    <div className="space-y-4">
      {/* 1. Monthly Ecosystem Intelligence Digest */}
      <div className="bg-gradient-to-br from-[#18181c] to-[#121216] border border-amber-500/20 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider">Living World Intelligence</h3>
              <p className="text-[11px] text-zinc-400">Autonomous Macroeconomic & Corporate Ecosystem</p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${currentCycleColor.bg} ${currentCycleColor.text} ${currentCycleColor.border}`}>
            {lw.economy.currentCycle.replace(/_/g, ' ')}
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-3">
          {lw.monthlyEcosystemDigest.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80">
          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3" /> Key Ecosystem Moves
            </span>
            <ul className="text-[11px] text-zinc-300 space-y-1">
              {lw.monthlyEcosystemDigest.keyMoves.length > 0 ? (
                lw.monthlyEcosystemDigest.keyMoves.map((m, i) => (
                  <li key={i} className="truncate">• {m}</li>
                ))
              ) : (
                <li className="text-zinc-500 italic">No disruptive moves recorded this month.</li>
              )}
            </ul>
          </div>

          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3" /> Threat Alerts
            </span>
            <ul className="text-[11px] text-zinc-300 space-y-1">
              {lw.monthlyEcosystemDigest.threatAlerts.length > 0 ? (
                lw.monthlyEcosystemDigest.threatAlerts.map((t, i) => (
                  <li key={i} className="truncate">• {t}</li>
                ))
              ) : (
                <li className="text-zinc-500 italic">No acute systemic threats detected.</li>
              )}
            </ul>
          </div>

          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" /> Opportunity Windows
            </span>
            <ul className="text-[11px] text-zinc-300 space-y-1">
              {lw.monthlyEcosystemDigest.opportunityWindows.length > 0 ? (
                lw.monthlyEcosystemDigest.opportunityWindows.map((o, i) => (
                  <li key={i} className="truncate">• {o}</li>
                ))
              ) : (
                <li className="text-zinc-500 italic">Standard market opportunities active.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Macroeconomic Indicators Panel */}
      <div className="bg-[#16161a] border border-zinc-800/80 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider">Macroeconomic Dashboard</h4>
          </div>
          <span className="text-[10px] text-zinc-400">
            Cycle Duration: {lw.economy.monthsInCurrentCycle} months
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Annual GDP</span>
            <div className="text-sm font-black text-emerald-400 mt-0.5">
              +{lw.economy.nationalGdpGrowth.toFixed(1)}%
            </div>
            <span className="text-[9px] text-zinc-500">National Output</span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Inflation</span>
            <div className={`text-sm font-black mt-0.5 ${lw.economy.inflationRate > 4.0 ? 'text-rose-400' : 'text-zinc-200'}`}>
              {lw.economy.inflationRate.toFixed(1)}%
            </div>
            <span className="text-[9px] text-zinc-500">Consumer Price Index</span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Benchmark Rate</span>
            <div className="text-sm font-black text-amber-400 mt-0.5">
              {lw.economy.benchmarkInterestRate.toFixed(2)}%
            </div>
            <span className="text-[9px] text-zinc-500">Central Bank Rate</span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Unemployment</span>
            <div className="text-sm font-black text-zinc-200 mt-0.5">
              {lw.economy.unemploymentRate.toFixed(1)}%
            </div>
            <span className="text-[9px] text-zinc-500">Labor Surplus</span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Market Index</span>
            <div className="text-sm font-black text-cyan-400 mt-0.5">
              {lw.economy.marketConfidenceIndex}/100
            </div>
            <span className="text-[9px] text-zinc-500">Investor Sentiment</span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Credit Stance</span>
            <div className={`text-sm font-black mt-0.5 ${
              lw.economy.creditAvailability === 'Loose' ? 'text-emerald-400' :
              lw.economy.creditAvailability === 'Tight' ? 'text-amber-400' :
              lw.economy.creditAvailability === 'Frozen' ? 'text-rose-400' : 'text-cyan-400'
            }`}>
              {lw.economy.creditAvailability}
            </div>
            <span className="text-[9px] text-zinc-500">Lender Liquidity</span>
          </div>
        </div>
      </div>

      {/* 3. Active World Events with Ripple Tracker */}
      <div className="bg-[#16161a] border border-zinc-800/80 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider">
              Active World Events ({lw.activeWorldEvents.length})
            </h4>
          </div>
          <span className="text-[10px] text-zinc-500">Autonomous Ripple Propagation</span>
        </div>

        {lw.activeWorldEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Event List */}
            <div className="lg:col-span-1 space-y-2">
              {lw.activeWorldEvents.map(wev => {
                const isSel = wev.id === selectedEventId;
                return (
                  <button
                    key={wev.id}
                    onClick={() => setSelectedEventId(wev.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSel 
                        ? 'bg-amber-400/10 border-amber-400/50 text-zinc-100' 
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {wev.category}
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        {wev.monthsElapsed}/{wev.durationMonths} mo
                      </span>
                    </div>
                    <div className="text-xs font-bold text-zinc-200 truncate">{wev.title}</div>
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">{wev.headline}</div>
                  </button>
                );
              })}
            </div>

            {/* Event Details & Ripple Effects */}
            <div className="lg:col-span-2 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
              {selectedEvent ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-sm font-black text-zinc-100">{selectedEvent.title}</h5>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        selectedEvent.severity === 'Major' ? 'bg-rose-500/20 text-rose-300' :
                        selectedEvent.severity === 'Notable' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {selectedEvent.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-amber-400/90 font-medium mt-1 italic">
                      "{selectedEvent.headline}"
                    </p>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedEvent.description}
                  </p>

                  {selectedEvent.affectedIndustries && selectedEvent.affectedIndustries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-zinc-400">Affected Sectors:</span>
                      {selectedEvent.affectedIndustries.map((ind, i) => (
                        <span key={i} className="text-[9.5px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {ind}
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedEvent.rippleSummary && selectedEvent.rippleSummary.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                        Systemic Ripple Consequences
                      </span>
                      <ul className="text-xs text-zinc-300 space-y-1">
                        {selectedEvent.rippleSummary.map((rip, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{rip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-500">
                  Select an event to inspect its simulation impacts and ripple effects.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-zinc-900/40 rounded-xl border border-zinc-800/50 text-xs text-zinc-400">
            No severe global events currently active. The world is experiencing steady operational conditions.
          </div>
        )}
      </div>

      {/* 4. Player World Standing & Reputation Matrix */}
      <div className="bg-[#16161a] border border-zinc-800/80 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider">Player World Standing & Perceptions</h4>
          </div>
          <span className="text-[10px] text-zinc-500">How the autonomous living world views you</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Respect</span>
            <div className="text-sm font-black text-cyan-400 mt-0.5">
              {lw.playerWorldReputation.respectScore}/100
            </div>
            <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${lw.playerWorldReputation.respectScore}%` }} />
            </div>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Fear</span>
            <div className="text-sm font-black text-rose-400 mt-0.5">
              {lw.playerWorldReputation.fearScore}/100
            </div>
            <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-rose-400 h-full rounded-full" style={{ width: `${lw.playerWorldReputation.fearScore}%` }} />
            </div>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Trustworthiness</span>
            <div className="text-sm font-black text-emerald-400 mt-0.5">
              {lw.playerWorldReputation.trustworthinessScore}/100
            </div>
            <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${lw.playerWorldReputation.trustworthinessScore}%` }} />
            </div>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Notoriety</span>
            <div className="text-sm font-black text-amber-400 mt-0.5">
              {lw.playerWorldReputation.notorietyScore}/100
            </div>
            <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${lw.playerWorldReputation.notorietyScore}%` }} />
            </div>
          </div>
        </div>

        {/* Reaction Log */}
        {lw.worldReactionLog.length > 0 && (
          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Recent World Reactions to Your Moves
            </span>
            <div className="space-y-1.5">
              {lw.worldReactionLog.map((r, i) => (
                <div key={i} className="text-xs text-zinc-300 flex items-start gap-2 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800/60">
                  <span className="font-bold text-amber-400 whitespace-nowrap">[{r.actorName}]:</span>
                  <span className="text-zinc-300">{r.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
