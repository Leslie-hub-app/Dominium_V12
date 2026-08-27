import React, { useState } from 'react';
import { GameState, LivingWorldProfile, CompetitorProfile, AutonomousBusiness, LivingDynasty, PoliticalFaction, LivingNpc } from '../../types';
import { 
  Building2, 
  Crown, 
  Landmark, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Award, 
  Briefcase, 
  Activity, 
  ChevronRight, 
  Sparkles,
  Zap,
  DollarSign,
  User
} from 'lucide-react';
import { ensureLivingWorldProfile } from '../../engine/livingWorldEngine';
import { NpcProfileModal } from './NpcProfileModal';

interface LivingCompetitorsHubProps {
  state: GameState;
}

export const LivingCompetitorsHub: React.FC<LivingCompetitorsHubProps> = ({ state }) => {
  const lw: LivingWorldProfile = ensureLivingWorldProfile(state);
  const [subTab, setSubTab] = useState<'competitors' | 'businesses' | 'dynasties' | 'factions'>('competitors');
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(
    lw.competitors?.[0]?.id || null
  );
  const [inspectedNpc, setInspectedNpc] = useState<LivingNpc | null>(null);

  const selectedCompetitor = lw.competitors.find(c => c.id === selectedCompetitorId);
  const leadNpc = selectedCompetitor?.leadPersonId 
    ? lw.npcs.find(n => n.id === selectedCompetitor.leadPersonId)
    : null;

  return (
    <div className="space-y-4">
      {/* Category Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#16161a] p-1.5 rounded-2xl border border-zinc-800 shadow-md">
        <button
          onClick={() => setSubTab('competitors')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            subTab === 'competitors'
              ? 'bg-amber-400 text-zinc-950 font-black shadow'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Competitors ({lw.competitors.length})</span>
        </button>

        <button
          onClick={() => setSubTab('businesses')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            subTab === 'businesses'
              ? 'bg-amber-400 text-zinc-950 font-black shadow'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Autonomous Firms ({lw.businesses.length})</span>
        </button>

        <button
          onClick={() => setSubTab('dynasties')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            subTab === 'dynasties'
              ? 'bg-amber-400 text-zinc-950 font-black shadow'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Dynasties ({lw.dynasties.length})</span>
        </button>

        <button
          onClick={() => setSubTab('factions')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            subTab === 'factions'
              ? 'bg-amber-400 text-zinc-950 font-black shadow'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Political Factions ({lw.politicalFactions.length})</span>
        </button>
      </div>

      {/* 1. COMPETITORS SUB-TAB */}
      {subTab === 'competitors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Competitor list */}
          <div className="lg:col-span-1 space-y-2">
            {lw.competitors.map(comp => {
              const isSel = comp.id === selectedCompetitorId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetitorId(comp.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSel
                      ? 'bg-amber-400/10 border-amber-400/50 text-zinc-100'
                      : 'bg-zinc-900/70 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {comp.domain}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      comp.threatLevel === 'Predatory' ? 'bg-rose-500/20 text-rose-300' :
                      comp.threatLevel === 'Formidable' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {comp.threatLevel}
                    </span>
                  </div>
                  <div className="text-xs font-black text-zinc-200 truncate">{comp.name}</div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Strategy: {comp.strategy.replace(/_/g, ' ')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Competitor Profile Details */}
          <div className="lg:col-span-2 bg-[#16161a] p-4 rounded-2xl border border-zinc-800 shadow-lg">
            {selectedCompetitor ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <h4 className="text-base font-black text-zinc-100">{selectedCompetitor.name}</h4>
                    <p className="text-xs text-amber-400 font-semibold mt-0.5">
                      Domain: {selectedCompetitor.domain} • HQ: {selectedCompetitor.headquartersCity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {leadNpc && (
                      <button
                        onClick={() => setInspectedNpc(leadNpc)}
                        className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
                      >
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>Lead NPC Dossier</span>
                      </button>
                    )}
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      selectedCompetitor.threatLevel === 'Predatory' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                      selectedCompetitor.threatLevel === 'Formidable' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {selectedCompetitor.threatLevel} Threat
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Capital Resources</span>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">
                      ${(selectedCompetitor.currentResources / 1000000).toFixed(0)}M
                    </div>
                  </div>

                  <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Market Power</span>
                    <div className="text-sm font-black text-amber-400 mt-0.5">
                      {Math.round(selectedCompetitor.marketPower)}/100
                    </div>
                  </div>

                  <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Rivalry Tension</span>
                    <div className="text-sm font-black text-rose-400 mt-0.5">
                      {selectedCompetitor.rivalryIntensity}/100
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Current Strategic Initiative
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedCompetitor.activeInitiative}
                  </p>
                </div>

                {selectedCompetitor.recentMoves && selectedCompetitor.recentMoves.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
                      Autonomous Intelligence Log (Recent Moves)
                    </span>
                    <ul className="text-xs text-zinc-300 space-y-1.5 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80">
                      {selectedCompetitor.recentMoves.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-zinc-500">
                Select a competitor to review their strategic dossier.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. AUTONOMOUS BUSINESSES SUB-TAB */}
      {subTab === 'businesses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {lw.businesses.map(biz => (
            <div key={biz.id} className="bg-[#16161a] p-4 rounded-2xl border border-zinc-800 shadow-md space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="text-sm font-black text-zinc-100 truncate">{biz.name}</h5>
                  <span className="text-[10px] text-zinc-400 font-medium">{biz.industry}</span>
                </div>
                <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded ${
                  biz.status === 'Flourishing' ? 'bg-emerald-500/20 text-emerald-300' :
                  biz.status === 'Expanding' ? 'bg-cyan-500/20 text-cyan-300' :
                  biz.status === 'Struggling' ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {biz.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center bg-zinc-900/90 p-2 rounded-xl border border-zinc-800/60">
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase">Valuation</span>
                  <span className="text-xs font-black text-amber-400">
                    ${(biz.valuation / 1000000000).toFixed(1)}B
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase">Market Share</span>
                  <span className="text-xs font-black text-cyan-400">
                    {biz.marketShare.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase">Mo. Profit</span>
                  <span className="text-xs font-black text-emerald-400">
                    +${(biz.monthlyProfit / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 space-y-1">
                <div>Strategy: <span className="text-zinc-200 font-bold">{biz.currentStrategy.replace(/_/g, ' ')}</span></div>
                <div>Product Quality: <span className="text-emerald-400 font-bold">{Math.round(biz.productQuality)}/100</span></div>
              </div>

              {biz.recentCorporateEvents && biz.recentCorporateEvents.length > 0 && (
                <div className="pt-2 border-t border-zinc-800 text-[10.5px] text-zinc-300 truncate">
                  • {biz.recentCorporateEvents[biz.recentCorporateEvents.length - 1]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. DYNASTIES SUB-TAB */}
      {subTab === 'dynasties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {lw.dynasties.map(dyn => (
            <div key={dyn.id} className="bg-[#16161a] p-4 rounded-2xl border border-zinc-800 shadow-md space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="text-sm font-black text-zinc-100 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    {dyn.dynastyName}
                  </h5>
                  <span className="text-[10px] text-zinc-400">Est. {dyn.foundingYear} • Gen {dyn.currentGeneration}</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {dyn.prestigeRank}
                </span>
              </div>

              <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Generational Dynasty Capital</span>
                <div className="text-base font-black text-emerald-400 mt-0.5">
                  ${(dyn.totalDynastyWealth / 1000000000).toFixed(2)} Billion
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Legacy Pillars:</span>
                <div className="flex flex-wrap gap-1">
                  {dyn.legacyPillars.map((p, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Succession Stance:</span>
                <span className={`font-bold ${
                  dyn.successionRisk === 'Crisis' ? 'text-rose-400' :
                  dyn.successionRisk === 'Contested' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {dyn.successionRisk}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. POLITICAL FACTIONS SUB-TAB */}
      {subTab === 'factions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lw.politicalFactions.map(fac => (
            <div key={fac.id} className="bg-[#16161a] p-4 rounded-2xl border border-zinc-800 shadow-md space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="text-sm font-black text-zinc-100 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-cyan-400" />
                    {fac.name}
                  </h5>
                  <span className="text-[10px] text-zinc-400">{fac.parliamentarySeatsPercent}% Parliamentary Representation</span>
                </div>
                <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded ${
                  fac.stanceOnPlayer === 'Aligned Ally' ? 'bg-emerald-500/20 text-emerald-300' :
                  fac.stanceOnPlayer === 'Pragmatic Partner' ? 'bg-cyan-500/20 text-cyan-300' :
                  fac.stanceOnPlayer === 'Fierce Opposition' ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {fac.stanceOnPlayer}
                </span>
              </div>

              <p className="text-xs text-zinc-300 italic bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                "{fac.ideologicalFocus}"
              </p>

              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Key Policy Priorities:</span>
                <ul className="text-xs text-zinc-300 space-y-1">
                  {fac.policyPriorities.map((pol, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{pol}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Donor War Chest:</span>
                <span className="font-black text-emerald-400">${(fac.donorCapital / 1000000).toFixed(0)}M</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {inspectedNpc && (
        <NpcProfileModal
          npc={inspectedNpc}
          state={state}
          onClose={() => setInspectedNpc(null)}
        />
      )}
    </div>
  );
};
