import React, { useState } from 'react';
import { GameState, DecisionHistoryEntry, ConsequenceHistoryEntry, DecisionCategory, DecisionImportance } from '../types';
import { 
  History, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Building2, 
  Landmark, 
  DollarSign, 
  Users, 
  HeartPulse, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Award
} from 'lucide-react';

interface DecisionHistoryViewProps {
  state: GameState;
  onClose?: () => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const DecisionHistoryView: React.FC<DecisionHistoryViewProps> = ({ state, onClose }) => {
  const [activeTab, setActiveTab] = useState<'decisions' | 'consequences'>('decisions');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [importanceFilter, setImportanceFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const decisions = state.decisionHistory || [];
  const consequences = state.consequenceHistory || [];

  // Filter decisions
  const filteredDecisions = decisions.filter(d => {
    if (categoryFilter !== 'All' && d.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (importanceFilter !== 'All' && (d.importance || 'Moderate').toLowerCase() !== importanceFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchOption = d.optionLabel?.toLowerCase().includes(q);
      const matchEntity = d.affectedEntities?.some(e => e.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchOption && !matchEntity) return false;
    }
    return true;
  });

  // Filter consequences
  const filteredConsequences = consequences.filter(c => {
    if (categoryFilter !== 'All' && c.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchSource = c.source.toLowerCase().includes(q);
      const matchEntity = c.affectedEntity?.toLowerCase().includes(q);
      if (!matchDesc && !matchSource && !matchEntity) return false;
    }
    return true;
  });

  // Computed metrics
  const totalDecisions = decisions.length;
  const majorDecisionsCount = decisions.filter(d => d.importance === 'Major' || d.importance === 'Historic' || d.importance === 'Critical').length;
  const successfulDecisions = decisions.filter(d => d.success === true).length;
  const evaluatedDecisions = decisions.filter(d => d.success !== undefined).length;
  const successRate = evaluatedDecisions > 0 ? Math.round((successfulDecisions / evaluatedDecisions) * 100) : 100;

  const categories = ['All', 'Business', 'Politics', 'Wealth', 'Family', 'Projects', 'Health', 'Succession', 'Career'];
  const importances = ['All', 'Historic', 'Critical', 'Major', 'Moderate', 'Minor'];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'business': return <Building2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'politics': return <Landmark className="w-3.5 h-3.5 text-violet-400" />;
      case 'wealth':
      case 'investment': return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'family':
      case 'relationships': return <Users className="w-3.5 h-3.5 text-rose-400" />;
      case 'health': return <HeartPulse className="w-3.5 h-3.5 text-red-400" />;
      case 'projects': return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      case 'succession': return <Award className="w-3.5 h-3.5 text-amber-300" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getImportanceBadge = (importance?: string) => {
    switch (importance?.toLowerCase()) {
      case 'historic':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">Historic Milestone</span>;
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">Critical Pivot</span>;
      case 'major':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/30">Major Strategic</span>;
      case 'minor':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">Minor</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">Moderate</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Metrics Dashboard */}
      <div className="bg-[#16161a] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <History className="w-3.5 h-3.5" /> Immutable Chronicle
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-100 mt-0.5">
              Strategic Decision History
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Persistent, tamper-proof audit trail of leadership decisions and their lasting consequences.
            </p>
          </div>

          {/* Sub-tab selector */}
          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('decisions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'decisions'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Decisions ({decisions.length})
            </button>
            <button
              onClick={() => setActiveTab('consequences')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'consequences'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Consequences ({consequences.length})
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Recorded</span>
            <div className="text-base sm:text-lg font-black text-zinc-100 mt-0.5">{totalDecisions}</div>
          </div>
          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Major Strategic Moves</span>
            <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">{majorDecisionsCount}</div>
          </div>
          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Resolution Success Rate</span>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">{successRate}%</div>
          </div>
          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Impact Log Entries</span>
            <div className="text-base sm:text-lg font-black text-violet-400 mt-0.5">{consequences.length}</div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search historical records, companies, political decrees..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-1">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-zinc-800 text-amber-400 border border-amber-400/30'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {activeTab === 'decisions' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-1">Importance:</span>
              {importances.map(imp => (
                <button
                  key={imp}
                  onClick={() => setImportanceFilter(imp)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    importanceFilter === imp
                      ? 'bg-zinc-800 text-amber-400 border border-amber-400/30'
                      : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {imp}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main List */}
      {activeTab === 'decisions' ? (
        <div className="space-y-3">
          {filteredDecisions.length === 0 ? (
            <div className="bg-[#16161a] p-8 rounded-2xl border border-zinc-800 text-center space-y-2">
              <History className="w-8 h-8 text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-300">No decisions match current filter criteria</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Major milestones such as corporate acquisitions, political elections, investments, and dynastic heir designations will be permanently logged here.
              </p>
            </div>
          ) : (
            filteredDecisions.map(d => {
              const isExpanded = expandedId === d.id;
              const relatedConsequences = consequences.filter(c => c.relatedDecisionId === d.id);

              return (
                <div 
                  key={d.id}
                  className="bg-[#16161a] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 shadow-lg transition-all space-y-3"
                >
                  {/* Top line: Category, Date, Importance, Outcome */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/70 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        {getCategoryIcon(d.category)}
                      </span>
                      <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider font-mono">
                        {d.category}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        • {MONTH_NAMES[d.month - 1]} {d.year}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {d.success !== undefined && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.success 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {d.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {d.success ? 'Success' : 'Defeat'}
                        </span>
                      )}
                      {getImportanceBadge(d.importance)}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base font-bold text-zinc-100">{d.title}</h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{d.description}</p>
                  </div>

                  {/* Chosen Option / Parameters */}
                  {d.optionLabel && (
                    <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
                      <span className="text-zinc-400 font-mono text-[11px]">
                        Chosen Resolution: <strong className="text-amber-400">{d.optionLabel}</strong>
                      </span>
                      {d.risk && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          d.risk === 'High' || d.risk === 'Extreme'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          Risk Profile: {d.risk}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Immediate Consequences Tags */}
                  {d.immediateConsequences && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {d.immediateConsequences.cashChange !== undefined && d.immediateConsequences.cashChange !== 0 && (
                        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md ${
                          d.immediateConsequences.cashChange > 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                          {d.immediateConsequences.cashChange > 0 ? '+' : ''}${Math.abs(d.immediateConsequences.cashChange).toLocaleString()} Cash
                        </span>
                      )}
                      {d.immediateConsequences.reputationChange !== undefined && d.immediateConsequences.reputationChange !== 0 && (
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {d.immediateConsequences.reputationChange > 0 ? '+' : ''}{d.immediateConsequences.reputationChange} Reputation
                        </span>
                      )}
                      {d.immediateConsequences.worldInfluenceChange !== undefined && d.immediateConsequences.worldInfluenceChange !== 0 && (
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          {d.immediateConsequences.worldInfluenceChange > 0 ? '+' : ''}{d.immediateConsequences.worldInfluenceChange} Influence
                        </span>
                      )}
                      {d.immediateConsequences.stressChange !== undefined && d.immediateConsequences.stressChange !== 0 && (
                        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md ${
                          d.immediateConsequences.stressChange < 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {d.immediateConsequences.stressChange > 0 ? '+' : ''}{d.immediateConsequences.stressChange} Stress
                        </span>
                      )}
                      {d.immediateConsequences.happinessChange !== undefined && d.immediateConsequences.happinessChange !== 0 && (
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20">
                          {d.immediateConsequences.happinessChange > 0 ? '+' : ''}{d.immediateConsequences.happinessChange} Happiness
                        </span>
                      )}
                    </div>
                  )}

                  {/* Affected Entities & Details Toggle */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50 text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      {d.affectedEntities && d.affectedEntities.length > 0 && (
                        <span>Entities: <b className="text-zinc-200">{d.affectedEntities.join(', ')}</b></span>
                      )}
                    </div>

                    {relatedConsequences.length > 0 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : d.id)}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{relatedConsequences.length} Consequence Log{relatedConsequences.length === 1 ? '' : 's'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Nested Consequences Drawer */}
                  {isExpanded && relatedConsequences.length > 0 && (
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2 mt-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                        Consequence Chain Resolution:
                      </span>
                      {relatedConsequences.map(csq => (
                        <div key={csq.id} className="text-xs text-zinc-300 border-l-2 border-amber-400/50 pl-2.5 py-1">
                          <div>{csq.description}</div>
                          {csq.change !== undefined && (
                            <span className="text-[10px] font-mono text-amber-400 font-bold mt-0.5 block">
                              Delta Impact: {String(csq.change)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Consequences List View */
        <div className="space-y-3">
          {filteredConsequences.length === 0 ? (
            <div className="bg-[#16161a] p-8 rounded-2xl border border-zinc-800 text-center space-y-2">
              <TrendingUp className="w-8 h-8 text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-300">No consequence records logged yet</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Consequential impacts resulting from strategic leadership actions will be permanently tracked here.
              </p>
            </div>
          ) : (
            filteredConsequences.map(c => (
              <div
                key={c.id}
                className="bg-[#16161a] border border-zinc-800 rounded-xl p-4 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] font-mono border-b border-zinc-800/80 pb-1.5">
                  <span className="text-amber-400 font-bold uppercase">{c.source}</span>
                  <span className="text-zinc-500">{MONTH_NAMES[c.month - 1]} {c.year}</span>
                </div>
                <p className="text-xs text-zinc-200">{c.description}</p>
                
                <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1 text-zinc-400">
                  {c.affectedEntity && (
                    <span>Affected: <b className="text-zinc-200">{c.affectedEntity}</b></span>
                  )}
                  {c.valueBefore !== undefined && c.valueAfter !== undefined && (
                    <span className="font-mono">
                      State Shift: <span className="text-zinc-400">{String(c.valueBefore)}</span> → <strong className="text-emerald-400">{String(c.valueAfter)}</strong>
                    </span>
                  )}
                  {c.change !== undefined && (
                    <span className="font-mono text-amber-400 font-bold">
                      Change: {String(c.change)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
