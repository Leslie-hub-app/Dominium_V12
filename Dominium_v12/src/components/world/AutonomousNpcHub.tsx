import React, { useState } from 'react';
import { GameState, LivingNpc, NPCRequestToPlayer } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  Target, 
  Building2, 
  TrendingUp, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  DollarSign, 
  Clock, 
  ChevronRight, 
  Crown, 
  Flame,
  Globe,
  SlidersHorizontal,
  Mail
} from 'lucide-react';
import { ensureLivingWorldProfile } from '../../engine/livingWorldEngine';
import { respondToNpcRequest } from '../../engine/npcActionEngine';
import { NpcProfileModal } from './NpcProfileModal';

interface AutonomousNpcHubProps {
  state: GameState;
  onNavigateToCompany?: (companyId: string) => void;
}

export const AutonomousNpcHub: React.FC<AutonomousNpcHubProps> = ({
  state,
  onNavigateToCompany
}) => {
  const lw = ensureLivingWorldProfile(state);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'MAJOR' | 'ACTIVE' | 'BACKGROUND'>('ALL');
  const [strategyFilter, setStrategyFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'netWorth' | 'salary' | 'influence' | 'relationship' | 'age'>('netWorth');
  const [selectedNpc, setSelectedNpc] = useState<LivingNpc | null>(null);
  const [activeSubView, setActiveSubView] = useState<'directory' | 'requests' | 'opportunities' | 'chronicle'>('directory');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4500);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRequestResponse = (requestId: string, response: 'ACCEPT' | 'DECLINE') => {
    const res = respondToNpcRequest(state, requestId, response);
    showMsg(res.message);
  };

  // Filter & Sort NPCs
  const npcs = (lw.npcs || []).filter(npc => {
    if (tierFilter !== 'ALL' && npc.simulationTier !== tierFilter) return false;
    if (strategyFilter !== 'ALL') {
      if (strategyFilter === 'ENTREPRENEUR' && npc.ambition !== 'ENTREPRENEURSHIP') return false;
      if (strategyFilter === 'CAREER' && npc.ambition !== 'CAREER_SUCCESS') return false;
      if (strategyFilter === 'WEALTH' && npc.ambition !== 'WEALTH') return false;
      if (strategyFilter === 'POLITICS' && npc.ambition !== 'POLITICAL_POWER') return false;
      if (strategyFilter === 'ALLIES' && !npc.isAlly && npc.relationshipScore < 20) return false;
      if (strategyFilter === 'RIVALS' && !npc.isRival && npc.relationshipScore > -15) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = `${npc.firstName} ${npc.lastName}`.toLowerCase();
      const occ = (npc.career?.occupation || '').toLowerCase();
      const emp = (npc.career?.employerName || '').toLowerCase();
      const city = (npc.locationCity || '').toLowerCase();
      if (!name.includes(q) && !occ.includes(q) && !emp.includes(q) && !city.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Sort
  npcs.sort((a, b) => {
    if (sortBy === 'netWorth') return (b.netWorth || 0) - (a.netWorth || 0);
    if (sortBy === 'salary') return (b.career?.monthlySalary || 0) - (a.career?.monthlySalary || 0);
    if (sortBy === 'influence') return (b.influence || 0) - (a.influence || 0);
    if (sortBy === 'relationship') return (b.relationshipScore || 0) - (a.relationshipScore || 0);
    if (sortBy === 'age') return (b.age || 0) - (a.age || 0);
    return 0;
  });

  const pendingRequests = (lw.npcRequestsToPlayer || []).filter(r => r.status === 'PENDING');
  const openOpportunities = (lw.activeOpportunities || []).filter(o => o.status === 'OPEN');

  return (
    <div className="space-y-4">
      {/* Top Statistical Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#16161a] border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Living Population</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{lw.npcs?.length || 0}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {(lw.npcs || []).filter(n => n.simulationTier === 'MAJOR').length} Major Figures
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#16161a] border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Autonomous Ventures</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-blue-400 mt-1">{lw.businesses?.length || 0}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Active competing firms</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#16161a] border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Societal Opportunities</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 mt-1">{openOpportunities.length}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Jobs, ventures & deals</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#16161a] border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Proposals to Player</span>
            <Mail className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400 mt-1">{pendingRequests.length}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Pending inbox decisions</p>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-300 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Sub-View Navigation Segmented Control */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#16161a] p-1.5 rounded-2xl border border-zinc-800 shadow-md">
        <button
          onClick={() => setActiveSubView('directory')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeSubView === 'directory'
              ? 'bg-amber-400 text-zinc-950 font-black shadow'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Society Directory ({npcs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('requests')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeSubView === 'requests'
              ? 'bg-amber-400 text-zinc-950 font-black shadow'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Proposals Inbox {pendingRequests.length > 0 && `(${pendingRequests.length})`}</span>
        </button>

        <button
          onClick={() => setActiveSubView('opportunities')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeSubView === 'opportunities'
              ? 'bg-amber-400 text-zinc-950 font-black shadow'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Market Opportunities ({openOpportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('chronicle')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeSubView === 'chronicle'
              ? 'bg-amber-400 text-zinc-950 font-black shadow'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Living Chronicle</span>
        </button>
      </div>

      {/* VIEW 1: SOCIETY DIRECTORY */}
      {activeSubView === 'directory' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="p-3 bg-[#16161a] border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, occupation, company, or city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="MAJOR">Major Figures</option>
                  <option value="ACTIVE">Active Professionals</option>
                  <option value="BACKGROUND">Background</option>
                </select>

                <select
                  value={strategyFilter}
                  onChange={e => setStrategyFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="ALL">All Ambitions</option>
                  <option value="CAREER">Career Climbers</option>
                  <option value="ENTREPRENEUR">Entrepreneurs</option>
                  <option value="WEALTH">Wealth Investors</option>
                  <option value="POLITICS">Politicians</option>
                  <option value="ALLIES">Trusted Allies</option>
                  <option value="RIVALS">Competitors & Rivals</option>
                </select>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="netWorth">Sort: Net Worth</option>
                  <option value="salary">Sort: Salary</option>
                  <option value="influence">Sort: Influence</option>
                  <option value="relationship">Sort: Sentiment</option>
                  <option value="age">Sort: Age</option>
                </select>
              </div>
            </div>
          </div>

          {/* NPC Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {npcs.map(npc => {
              const isMajor = npc.simulationTier === 'MAJOR';
              return (
                <div
                  key={npc.id}
                  className="p-4 rounded-2xl bg-[#16161a] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-extrabold text-sm shrink-0">
                          {npc.firstName[0]}{npc.lastName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">
                              {npc.firstName} {npc.lastName}
                            </h4>
                            {isMajor && (
                              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1">
                            {npc.career?.occupation || 'Professional'} • {npc.age} yrs
                          </p>
                        </div>
                      </div>

                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                        isMajor
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {npc.simulationTier || 'ACTIVE'}
                      </span>
                    </div>

                    {/* Employer and Net worth */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/60">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block">Net Worth</span>
                        <span className="text-emerald-400 font-extrabold">${(npc.netWorth || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block">Monthly Income</span>
                        <span className="text-zinc-200 font-bold">${(npc.career?.monthlySalary || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Ambition & Sentiment */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-semibold text-zinc-300">{npc.ambition}</span>
                      <span className={npc.relationshipScore >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {npc.relationshipScore > 0 ? `+${npc.relationshipScore}` : npc.relationshipScore} Sentiment
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-500 truncate">{npc.locationCity}</span>
                    <button
                      onClick={() => setSelectedNpc(npc)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Inspect Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {npcs.length === 0 && (
            <div className="p-8 text-center bg-[#16161a] border border-zinc-800 rounded-2xl text-zinc-500 text-xs">
              No living figures match your filter parameters.
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PROPOSALS INBOX */}
      {activeSubView === 'requests' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#16161a] border border-zinc-800 rounded-2xl">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              Incoming Requests & Proposals from Society Figures
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Autonomous NPCs generate authentic career applications, venture funding pitches, and political alliances based on their ambitions and relationship with you.
            </p>
          </div>

          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-[#16161a] border border-amber-400/30 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        {req.requestType}
                      </span>
                      <h4 className="text-sm font-bold text-white">{req.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1.5">{req.description}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Submitted by <strong className="text-zinc-300">{req.npcName}</strong> ({req.npcRole}) • {req.month}/{req.year}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleRequestResponse(req.id, 'DECLINE')}
                    className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleRequestResponse(req.id, 'ACCEPT')}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-black text-zinc-950 transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Accept Proposal</span>
                  </button>
                </div>
              </div>
            ))}

            {pendingRequests.length === 0 && (
              <div className="p-8 text-center bg-[#16161a] border border-zinc-800 rounded-2xl text-zinc-500 text-xs">
                No pending proposals at this time. Advance months to receive new inbound executive applications and venture pitches.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: MARKET OPPORTUNITIES */}
      {activeSubView === 'opportunities' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#16161a] border border-zinc-800 rounded-2xl">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Open Market & Societal Opportunities
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Autonomous NPCs actively contest open executive openings, startup funding rounds, distressed real estate parcels, and political elections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {openOpportunities.map(opp => (
              <div
                key={opp.id}
                className="p-4 rounded-2xl bg-[#16161a] border border-zinc-800 space-y-3 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      {opp.type}
                    </span>
                    <span className="text-xs text-zinc-500 font-semibold">{opp.domain}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">{opp.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{opp.description}</p>

                  <div className="mt-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block">Reward Potential</span>
                      <span className="text-emerald-400 font-black">${opp.potentialReward.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block">Execution Risk</span>
                      <span className="text-amber-400 font-bold">{opp.risk}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-500 flex justify-between items-center">
                  <span>{opp.npcParticipants?.length || 0} NPC Contenders</span>
                  <span className="text-zinc-400 font-semibold">Open Contest</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: LIVING CHRONICLE */}
      {activeSubView === 'chronicle' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#16161a] border border-zinc-800 rounded-2xl">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Living World & Society Historical Log
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Historical ledger of all major autonomous decisions, startup foundings, acquisitions, and executive transitions across society.
            </p>
          </div>

          <div className="space-y-2.5">
            {(lw.worldHistory || []).map((hist, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#16161a] border border-zinc-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-bold">
                  <span>{hist.category} • {hist.month}/{hist.year}</span>
                  <span className="text-amber-400 font-extrabold uppercase">{hist.significance}</span>
                </div>
                <h5 className="font-extrabold text-white text-sm">{hist.headline}</h5>
                <p className="text-zinc-400">{hist.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NPC Profile Modal */}
      {selectedNpc && (
        <NpcProfileModal
          npc={selectedNpc}
          state={state}
          onClose={() => setSelectedNpc(null)}
          onStateChange={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  );
};
