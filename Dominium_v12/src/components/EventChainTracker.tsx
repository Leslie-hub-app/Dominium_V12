import React, { useState } from 'react';
import { 
  GameState, 
  EventChain, 
  EventChainStage, 
  EventChainHistoryEntry 
} from '../types';
import { 
  GitBranch, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Building2, 
  Landmark, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  History,
  Play
} from 'lucide-react';
import { createBusinessCrisisChain, createPoliticalCampaignChain, startEventChain } from '../engine/eventChainEngine';

interface EventChainTrackerProps {
  state: GameState;
  onUpdateState?: (newState: GameState) => void;
}

export const EventChainTracker: React.FC<EventChainTrackerProps> = ({ state, onUpdateState }) => {
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  const activeChains = state.activeEventChains || [];
  const completedChains = state.completedEventChains || [];
  const displayList = tab === 'active' ? activeChains : completedChains;

  const selectedChain = [...activeChains, ...completedChains].find(c => c.id === selectedChainId) || displayList[0] || null;

  const handleLaunchPoliticalCampaign = () => {
    if (!onUpdateState) return;
    const party = state.politics.parties[0] || { id: 'party_mod', name: 'National Modernity Coalition' };
    const chain = createPoliticalCampaignChain(party.id, party.name, 'City Mayor', state.currentMonth, state.currentYear);
    const { nextState } = startEventChain(state, chain);
    onUpdateState(nextState);
  };

  const handleLaunchBusinessTurnaround = () => {
    if (!onUpdateState) return;
    const company = state.companies[0] || { id: 'comp_demo', name: 'Apex Enterprises' };
    const chain = createBusinessCrisisChain(company.id, company.name, state.currentMonth, state.currentYear);
    const { nextState } = startEventChain(state, chain);
    onUpdateState(nextState);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'POLITICS':
        return <Landmark className="w-4 h-4 text-purple-400" />;
      case 'BUSINESS':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      default:
        return <GitBranch className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60">ACTIVE</span>;
      case 'Completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">COMPLETED</span>;
      case 'Failed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60">FAILED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">PAUSED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Launchers */}
      <div className="bg-[#16161a] border border-amber-400/20 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-black text-zinc-100 uppercase tracking-wider font-mono">
                Multi-Stage Event Chains
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Persistent, branching narrative sagas that evolve across multi-month strategic decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                tab === 'active'
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Active ({activeChains.length})
            </button>
            <button
              onClick={() => setTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                tab === 'completed'
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Completed ({completedChains.length})
            </button>
          </div>
        </div>

        {/* Action Triggers to Initiate Demonstration Chains */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">Available Initiatives:</span>
          
          <button
            onClick={handleLaunchPoliticalCampaign}
            disabled={activeChains.some(c => c.category === 'POLITICS')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/60 text-purple-300 text-xs font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Launch Mayoral Campaign Chain</span>
          </button>

          {state.companies.length > 0 && (
            <button
              onClick={handleLaunchBusinessTurnaround}
              disabled={activeChains.some(c => c.category === 'BUSINESS')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/60 text-amber-300 text-xs font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Initiate Enterprise Turnaround Chain</span>
            </button>
          )}
        </div>
      </div>

      {displayList.length === 0 ? (
        <div className="bg-[#16161a] border border-zinc-800/80 rounded-2xl p-10 text-center space-y-3">
          <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-300">No {tab === 'active' ? 'Active' : 'Completed'} Event Chains</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {tab === 'active' 
              ? 'Multi-stage event chains trigger dynamically upon corporate crises, market shocks, political nominations, and strategic milestones.' 
              : 'Completed event chains will archive here with their historical stage choices and final outcomes.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Chain List */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 px-1">
              {tab === 'active' ? 'Ongoing Event Sagas' : 'Archived Event Chains'}
            </h3>

            {displayList.map(chain => {
              const isSelected = selectedChain?.id === chain.id;
              const stagesCount = chain.stages?.length || 0;
              const completedStagesCount = chain.history?.length || 0;

              return (
                <div
                  key={chain.id}
                  onClick={() => setSelectedChainId(chain.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-400/80 shadow-md'
                      : 'bg-[#16161a] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getCategoryIcon(chain.category)}
                      <span className="font-bold text-xs text-zinc-100 truncate">{chain.name}</span>
                    </div>
                    {getStatusBadge(chain.status)}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
                    <span>Started: M{chain.startedMonth} {chain.startedYear}</span>
                    <span className="text-amber-400 font-bold">Progress: {completedStagesCount}/{stagesCount} Stages</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Chain Detail View */}
          {selectedChain && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#16161a] border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(selectedChain.category)}
                      <h3 className="text-sm font-black text-zinc-100 font-mono uppercase">{selectedChain.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Chain ID: {selectedChain.id}</span>
                  </div>
                  {getStatusBadge(selectedChain.status)}
                </div>

                {/* Stages Flowchart */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Stage Sequence Progression</span>
                  </h4>

                  <div className="space-y-2.5">
                    {(selectedChain.stages || []).map((stage, idx) => {
                      const historyRecord = (selectedChain.history || []).find(h => h.stageId === stage.id || h.stageSequence === stage.sequence);
                      const isCurrent = selectedChain.currentStage === stage.id && selectedChain.status === 'Active';
                      const isPast = !!historyRecord;

                      return (
                        <div 
                          key={stage.id} 
                          className={`p-3.5 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-amber-950/30 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                              : isPast
                              ? 'bg-zinc-900/90 border-emerald-800/60'
                              : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-black ${
                                isPast
                                  ? 'bg-emerald-500 text-zinc-950'
                                  : isCurrent
                                  ? 'bg-amber-400 text-zinc-950 animate-pulse'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {stage.sequence}
                              </span>
                              <span className="text-xs font-bold text-zinc-200">{stage.title}</span>
                            </div>

                            {isPast && (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Resolved</span>
                              </span>
                            )}
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-400 font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Current Active Stage</span>
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">{stage.description}</p>

                          {/* Recorded Choice from History */}
                          {historyRecord && (
                            <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-[11px] font-mono text-emerald-200">
                              <div className="font-bold text-emerald-400 text-[10px] uppercase">
                                Action Chosen (M{historyRecord.month} {historyRecord.year}):
                              </div>
                              <div>{historyRecord.choiceLabel}</div>
                              {historyRecord.outcomeDescription && (
                                <div className="text-[10px] text-zinc-400 mt-0.5">Outcome: {historyRecord.outcomeDescription}</div>
                              )}
                            </div>
                          )}

                          {/* Delay Horizon Info */}
                          {stage.delayMonths && !isPast && (
                            <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Timeline: Evaluates {stage.delayMonths} month(s) after stage resolution</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stored Chain Variables */}
                {Object.keys(selectedChain.variables || {}).length > 0 && (
                  <div className="pt-3 border-t border-zinc-800 space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase text-zinc-400">Chain State & Decision Memory</h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                      {Object.entries(selectedChain.variables).map(([k, v]) => (
                        <div key={k} className="flex flex-col">
                          <span className="text-zinc-500 uppercase">{k}</span>
                          <span className="text-zinc-200 font-bold truncate">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
