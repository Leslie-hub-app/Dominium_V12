import React, { useState } from 'react';
import { GameState, LivingNpc } from '../../types';
import { 
  X, 
  User, 
  Briefcase, 
  Target, 
  Building2, 
  TrendingUp, 
  Heart, 
  Clock, 
  Sparkles, 
  DollarSign, 
  Award, 
  Shield, 
  Coffee, 
  Gift, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Scale,
  Landmark
} from 'lucide-react';
import { offerJobToNpc, socializeWithLivingNpc } from '../../engine/npcActionEngine';

interface NpcProfileModalProps {
  npc: LivingNpc;
  state: GameState;
  onClose: () => void;
  onStateChange?: () => void;
}

export const NpcProfileModal: React.FC<NpcProfileModalProps> = ({
  npc,
  state,
  onClose,
  onStateChange
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'goals' | 'assets' | 'social' | 'biography'>('dossier');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [jobOfferRole, setJobOfferRole] = useState('Executive Vice President');
  const [jobOfferSalary, setJobOfferSalary] = useState(
    Math.round((npc.career?.monthlySalary || 12000) * 1.3)
  );
  const [showJobModal, setShowJobModal] = useState(false);

  const showMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4500);
    if (onStateChange) onStateChange();
  };

  const handleSocialize = (action: 'COFFEE' | 'DINNER' | 'GIFT' | 'STRATEGY_TALK') => {
    const res = socializeWithLivingNpc(state, npc.id, action);
    showMsg(res.message);
  };

  const handleOfferJob = () => {
    if (!state.companies || state.companies.length === 0) {
      showMsg('You must own an active company to hire executive talent.');
      return;
    }
    const targetComp = state.companies[0];
    const res = offerJobToNpc(state, npc.id, targetComp.id, jobOfferRole, jobOfferSalary);
    showMsg(res.message);
    setShowJobModal(false);
  };

  const p = npc.personality || {
    ambition: 60, intelligence: 65, discipline: 60, confidence: 60,
    sociability: 55, empathy: 50, integrity: 60, aggression: 40,
    loyalty: 65, patience: 55, greed: 45, generosity: 50,
    riskTolerance: 50, competitiveness: 55, entrepreneurialDrive: 50, politicalInterest: 35
  };

  const tierColor = npc.simulationTier === 'MAJOR' 
    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' 
    : (npc.simulationTier === 'ACTIVE' 
      ? 'bg-blue-400/20 text-blue-300 border-blue-400/40' 
      : 'bg-zinc-800 text-zinc-400 border-zinc-700');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100">
        
        {/* Modal Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-zinc-900 via-[#18181e] to-zinc-900 border-b border-zinc-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-amber-400 font-black text-xl shadow-inner">
              {npc.firstName[0]}{npc.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-white">{npc.firstName} {npc.lastName}</h2>
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${tierColor}`}>
                  {npc.simulationTier || 'ACTIVE'} FIGURE
                </span>
                {npc.isRetired && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Retired
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {npc.age} yrs • {npc.locationCity}, {npc.locationCountry} • {npc.career?.occupation || 'Independent Professional'}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className="text-emerald-400 font-bold">
                  Net Worth: ${(npc.netWorth || 0).toLocaleString()}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-300">
                  Salary: ${(npc.career?.monthlySalary || 0).toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className="px-6 py-2.5 bg-amber-400/10 border-b border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-zinc-800 bg-[#15151a] overflow-x-auto">
          {[
            { id: 'dossier', label: 'Dossier & Personality', icon: <User className="w-3.5 h-3.5" /> },
            { id: 'goals', label: `Life Ambitions (${npc.canonicalGoals?.length || 0})`, icon: <Target className="w-3.5 h-3.5" /> },
            { id: 'assets', label: 'Holdings & Assets', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'social', label: 'Sentiment & Interact', icon: <Heart className="w-3.5 h-3.5" /> },
            { id: 'biography', label: 'Chronicle History', icon: <Clock className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400 bg-zinc-800/50'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: DOSSIER & PERSONALITY */}
          {activeTab === 'dossier' && (
            <div className="space-y-6">
              {/* Strategic Archetype Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Primary Ambition</span>
                  <p className="text-sm font-extrabold text-amber-400 mt-0.5">{npc.ambition || 'CAREER_SUCCESS'}</p>
                  <p className="text-xs text-zinc-500 mt-1">Secondary: {npc.secondaryAmbition || 'WEALTH'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Life Strategy</span>
                  <p className="text-sm font-extrabold text-blue-400 mt-0.5">{npc.lifeStrategy || 'CAREER_CLIMBER'}</p>
                  <p className="text-xs text-zinc-500 mt-1">Tier: {npc.lifeTier}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Employer & Stature</span>
                  <p className="text-sm font-extrabold text-emerald-400 mt-0.5">{npc.career?.employerName || 'Independent'}</p>
                  <p className="text-xs text-zinc-500 mt-1">{npc.career?.careerTier} Level ({npc.career?.yearsInRole?.toFixed(1) || 1} yrs)</p>
                </div>
              </div>

              {/* 16 Personality Traits Grid */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  16-Trait Personality Matrix
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Ambition', val: p.ambition, color: 'bg-amber-400' },
                    { label: 'Intelligence', val: p.intelligence, color: 'bg-blue-400' },
                    { label: 'Discipline', val: p.discipline, color: 'bg-indigo-400' },
                    { label: 'Confidence', val: p.confidence, color: 'bg-purple-400' },
                    { label: 'Sociability', val: p.sociability, color: 'bg-pink-400' },
                    { label: 'Empathy', val: p.empathy, color: 'bg-rose-400' },
                    { label: 'Integrity', val: p.integrity, color: 'bg-teal-400' },
                    { label: 'Aggression', val: p.aggression, color: 'bg-red-500' },
                    { label: 'Loyalty', val: p.loyalty, color: 'bg-emerald-400' },
                    { label: 'Patience', val: p.patience, color: 'bg-cyan-400' },
                    { label: 'Greed', val: p.greed, color: 'bg-yellow-400' },
                    { label: 'Generosity', val: p.generosity, color: 'bg-green-400' },
                    { label: 'Risk Tolerance', val: p.riskTolerance, color: 'bg-orange-400' },
                    { label: 'Competitiveness', val: p.competitiveness, color: 'bg-violet-400' },
                    { label: 'Entrepreneurial', val: p.entrepreneurialDrive, color: 'bg-amber-500' },
                    { label: 'Political Interest', val: p.politicalInterest, color: 'bg-sky-400' },
                  ].map(trait => (
                    <div key={trait.label} className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-400 mb-1">
                        <span>{trait.label}</span>
                        <span className="text-zinc-200 font-bold">{trait.val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${trait.color}`} 
                          style={{ width: `${Math.min(100, Math.max(5, trait.val))}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Profile */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Professional & Executive Skills
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { label: 'Management', val: npc.skills?.management || 60 },
                    { label: 'Finance', val: npc.skills?.finance || 60 },
                    { label: 'Technical', val: npc.skills?.technical || 50 },
                    { label: 'Negotiation', val: npc.skills?.negotiation || 55 },
                    { label: 'Politics', val: npc.skills?.politics || 40 },
                  ].map(sk => (
                    <div key={sk.label} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-center">
                      <span className="text-[11px] font-bold text-zinc-400 block">{sk.label}</span>
                      <span className="text-base font-black text-zinc-100 mt-1 block">{sk.val} / 100</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOALS & AMBITIONS */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                Active Multi-Year Life Ambitions
              </h3>
              
              <div className="space-y-3">
                {(npc.canonicalGoals || []).map(goal => (
                  <div key={goal.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {goal.type}
                          </span>
                          <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{goal.description}</p>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        goal.status === 'COMPLETED' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}>
                        {goal.status}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-400 mb-1">
                        <span>Milestone Progress</span>
                        <span className="text-amber-400 font-extrabold">{goal.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500" 
                          style={{ width: `${Math.min(100, goal.progress || 0)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HOLDINGS & ASSETS */}
          {activeTab === 'assets' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Liquid Cash</span>
                  <p className="text-lg font-black text-emerald-400 mt-1">${(npc.cash || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Stock Portfolio</span>
                  <p className="text-lg font-black text-blue-400 mt-1">${(npc.stockPortfolioValue || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Owned Real Estate</span>
                  <p className="text-lg font-black text-amber-400 mt-1">{npc.ownedPropertyIds?.length || 0} Parcels</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Bank Debt</span>
                  <p className="text-lg font-black text-rose-400 mt-1">${(npc.bankDebt || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Owned Autonomous Businesses */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Autonomous Enterprise Holdings
                </h3>
                {npc.ownedBusinessIds && npc.ownedBusinessIds.length > 0 ? (
                  <div className="space-y-2">
                    {npc.ownedBusinessIds.map(bId => {
                      const biz = state.livingWorld?.businesses.find(b => b.id === bId);
                      return (
                        <div key={bId} className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-bold text-white">{biz?.name || bId}</h4>
                            <p className="text-xs text-zinc-400">{biz?.industry || 'Enterprise'} • Status: {biz?.status || 'Active'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-emerald-400">${(biz?.valuation || 500000).toLocaleString()}</span>
                            <p className="text-[10px] text-zinc-500">Valuation</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                    No active corporate equity stakes registered.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SENTIMENT & INTERACT */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              {/* Sentiment & Relationship Score */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Player Sentiment & Alliance</span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {npc.relationshipToPlayer || 'Acquaintance'}
                    {npc.isAlly && <span className="ml-2 text-xs text-emerald-400 font-bold">(Trusted Ally)</span>}
                    {npc.isRival && <span className="ml-2 text-xs text-rose-400 font-bold">(Bitter Rival)</span>}
                  </h4>
                </div>
                <div className="w-full sm:w-64">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-400 mb-1">
                    <span>Affection & Trust</span>
                    <span className={npc.relationshipScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {npc.relationshipScore > 0 ? `+${npc.relationshipScore}` : npc.relationshipScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${npc.relationshipScore >= 0 ? 'bg-emerald-400' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(5, (npc.relationshipScore + 100) / 2))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Direct Player Actions */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Interactive Diplomacy & Negotiations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialize('COFFEE')}
                    className="p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-3 text-left cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Informal Coffee Discussion ($50)</h5>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Discuss macro trends and build mutual rapport.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSocialize('DINNER')}
                    className="p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-3 text-left cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Private Fine-Dining Dinner ($450)</h5>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Host dinner at exclusive club to strengthen ties.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSocialize('GIFT')}
                    className="p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-3 text-left cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Luxury Curated Gift ($1,500)</h5>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Substantial boost to sentiment and loyalty.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowJobModal(true)}
                    className="p-3.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-all flex items-center gap-3 text-left cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-amber-300">Recruit to Player Company</h5>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Offer an executive leadership or director role.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Job Offer Form (Inline Drawer) */}
              {showJobModal && (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-400/40 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Executive Contract Proposal
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400">Offered Position Title</label>
                      <input
                        type="text"
                        value={jobOfferRole}
                        onChange={e => setJobOfferRole(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400">Monthly Compensation ($)</label>
                      <input
                        type="number"
                        value={jobOfferSalary}
                        onChange={e => setJobOfferSalary(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-emerald-400 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleOfferJob}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                    >
                      Dispatch Formal Offer
                    </button>
                    <button
                      onClick={() => setShowJobModal(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Shared Memories */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Recorded Shared Memories
                </h3>
                {npc.memories && npc.memories.length > 0 ? (
                  <div className="space-y-2">
                    {npc.memories.map(mem => (
                      <div key={mem.id} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs">
                        <div className="flex justify-between text-zinc-500 font-semibold text-[10px] mb-1">
                          <span>{mem.eventType}</span>
                          <span>{mem.month}/{mem.year}</span>
                        </div>
                        <p className="text-zinc-300">{mem.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                    No significant interaction history recorded yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BIOGRAPHY & CHRONICLE */}
          {activeTab === 'biography' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Chronological Life Chronicle
              </h3>
              <div className="space-y-2.5 border-l-2 border-zinc-800 ml-2 pl-4">
                {(npc.biographyTimeline || []).map((entry, idx) => (
                  <div key={idx} className="relative text-xs text-zinc-300 py-1">
                    <div className="absolute -left-[21px] top-2 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-zinc-950" />
                    <span>{entry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-semibold">
            Dominium Autonomous NPC Engine (Expansion 4)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
