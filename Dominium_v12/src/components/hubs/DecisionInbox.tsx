import React, { useState } from 'react';
import { GameState, PendingDecision } from '../../types';
import { 
  Inbox, 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ChevronRight, 
  Filter, 
  Search, 
  Layers, 
  X, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  DecisionInboxSection, 
  EnrichedDecision, 
  groupDecisionsBySection, 
  enrichDecision, 
  postponeDecision 
} from '../../engine/decisionInboxEngine';
import { calculateStateAwareRiskProbability } from '../../engine/riskEngine';

interface DecisionInboxProps {
  state: GameState;
  onClose?: () => void;
  onMakeDecision: (decisionId: string, optionId: string) => void;
  onUpdateState: (newState: GameState) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const DecisionInbox: React.FC<DecisionInboxProps> = ({
  state,
  onClose,
  onMakeDecision,
  onUpdateState,
  onNavigateToTab
}) => {
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<'ALL' | DecisionInboxSection>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals / expanded review
  const [reviewingDecision, setReviewingDecision] = useState<EnrichedDecision | null>(null);
  const [resolvingDecision, setResolvingDecision] = useState<EnrichedDecision | null>(null);
  const [postponeMessage, setPostponeMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Group decisions by section
  const groupedDecisions = groupDecisionsBySection(state);
  const allEnrichedDecisions: EnrichedDecision[] = [
    ...groupedDecisions.CRITICAL,
    ...groupedDecisions.HIGH,
    ...groupedDecisions.NORMAL,
    ...groupedDecisions.LOW
  ];

  const totalCount = allEnrichedDecisions.length;
  const criticalCount = groupedDecisions.CRITICAL.length;
  const highCount = groupedDecisions.HIGH.length;
  const normalCount = groupedDecisions.NORMAL.length;
  const lowCount = groupedDecisions.LOW.length;

  // Filter decisions
  const filteredDecisions = allEnrichedDecisions.filter(dec => {
    // Section filter
    if (selectedSectionFilter !== 'ALL' && dec.section !== selectedSectionFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'All' && dec.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = dec.title.toLowerCase().includes(q);
      const matchDesc = dec.description.toLowerCase().includes(q);
      const matchEntity = dec.resolvedAffectedEntity.toLowerCase().includes(q);
      const matchCategory = dec.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchEntity || matchCategory;
    }

    return true;
  });

  const categories = ['All', 'Business', 'Finance', 'Politics', 'Career', 'Family', 'Investment', 'Sports', 'Health', 'Ethics'];

  const handlePostpone = (decision: EnrichedDecision) => {
    const result = postponeDecision(state, decision.id, 1);
    if (result.success) {
      onUpdateState(result.nextState);
      setPostponeMessage({ text: result.message, type: 'success' });
      setTimeout(() => setPostponeMessage(null), 4000);
      
      // If currently reviewing this decision, update its state
      if (reviewingDecision && reviewingDecision.id === decision.id) {
        const refreshed = result.nextState.pendingDecisions.find(d => d.id === decision.id);
        if (refreshed) {
          setReviewingDecision(enrichDecision(refreshed, result.nextState));
        } else {
          setReviewingDecision(null);
        }
      }
    } else {
      setPostponeMessage({ text: result.message, type: 'error' });
      setTimeout(() => setPostponeMessage(null), 4000);
    }
  };

  const handleExecuteOption = (decisionId: string, optionId: string) => {
    onMakeDecision(decisionId, optionId);
    setReviewingDecision(null);
    setResolvingDecision(null);
  };

  const getSectionBadgeStyle = (section: DecisionInboxSection) => {
    switch (section) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'NORMAL':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'LOW':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'LOW':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  Decision Inbox
                  {totalCount > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-600 text-white">
                      {totalCount} Active
                    </span>
                  )}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Aggregate repository of unresolved strategic choices, executive dilemmas, and high-impact interventions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700" aria-label="Close inbox">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <div className="text-left">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Critical</div>
                <div className="text-sm font-bold text-rose-400">{criticalCount}</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="text-left">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">High</div>
                <div className="text-sm font-bold text-amber-400">{highCount}</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div className="text-left">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Normal</div>
                <div className="text-sm font-bold text-blue-400">{normalCount}</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <div className="text-left">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Low</div>
                <div className="text-sm font-bold text-slate-400">{lowCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback notification if postponement occurred */}
        {postponeMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm border flex items-center justify-between ${
            postponeMessage.type === 'success' 
              ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {postponeMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              <span>{postponeMessage.text}</span>
            </div>
            <button 
              onClick={() => setPostponeMessage(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Section Tabs & Search Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        {/* Section Priority Tabs */}
        <div className="flex items-center gap-2 flex-wrap border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setSelectedSectionFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedSectionFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            All Decisions
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-950/60 text-slate-300">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedSectionFilter('CRITICAL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedSectionFilter === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            CRITICAL
            {criticalCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-rose-950 text-rose-300 border border-rose-500/30">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSelectedSectionFilter('HIGH')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedSectionFilter === 'HIGH'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            HIGH
            {highCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-950 text-amber-300 border border-amber-500/30">
                {highCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSelectedSectionFilter('NORMAL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedSectionFilter === 'NORMAL'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-400" />
            NORMAL
            {normalCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-950 text-blue-300 border border-blue-500/30">
                {normalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSelectedSectionFilter('LOW')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedSectionFilter === 'LOW'
                ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/20'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            LOW
            {lowCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-950 text-slate-400 border border-slate-700">
                {lowCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter bar and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search decisions or entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Decision Cards List */}
      {filteredDecisions.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-1">
            {totalCount === 0 ? 'Inbox Zero — No Pending Decisions' : 'No decisions match your filter criteria'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            {totalCount === 0 
              ? 'Your executive agenda is clear. As market fluctuations, company operations, and political events unfold, strategic dilemmas will appear here.'
              : 'Try clearing the search query or selecting a different section/category filter.'}
          </p>
          {totalCount > 0 && (
            <button
              onClick={() => {
                setSelectedSectionFilter('ALL');
                setCategoryFilter('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* If viewing ALL, we can group visually by section headings */}
          {(['CRITICAL', 'HIGH', 'NORMAL', 'LOW'] as DecisionInboxSection[]).map(sectionKey => {
            const sectionDecisions = filteredDecisions.filter(d => d.section === sectionKey);
            if (sectionDecisions.length === 0) return null;

            return (
              <div key={sectionKey} className="space-y-3">
                {/* Section Header */}
                <div className="flex items-center gap-2 px-1 pt-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getSectionBadgeStyle(sectionKey)}`}>
                    {sectionKey} PRIORITY ({sectionDecisions.length})
                  </span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {sectionDecisions.map(decision => (
                    <DecisionCard
                      key={decision.id}
                      decision={decision}
                      onReview={() => setReviewingDecision(decision)}
                      onResolve={() => setResolvingDecision(decision)}
                      onPostpone={() => handlePostpone(decision)}
                      getRiskBadgeStyle={getRiskBadgeStyle}
                      getSectionBadgeStyle={getSectionBadgeStyle}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal (Deep Dive) */}
      {reviewingDecision && (
        <DecisionReviewModal
          decision={reviewingDecision}
          state={state}
          onClose={() => setReviewingDecision(null)}
          onExecuteOption={(optId) => handleExecuteOption(reviewingDecision.id, optId)}
          onPostpone={() => handlePostpone(reviewingDecision)}
          getRiskBadgeStyle={getRiskBadgeStyle}
          getSectionBadgeStyle={getSectionBadgeStyle}
        />
      )}

      {/* Quick Resolve Modal */}
      {resolvingDecision && (
        <DecisionResolveModal
          decision={resolvingDecision}
          state={state}
          onClose={() => setResolvingDecision(null)}
          onExecuteOption={(optId) => handleExecuteOption(resolvingDecision.id, optId)}
          getRiskBadgeStyle={getRiskBadgeStyle}
        />
      )}
    </div>
  );
};

// ==========================================
// DECISION CARD SUBCOMPONENT
// ==========================================

interface DecisionCardProps {
  decision: EnrichedDecision;
  onReview: () => void;
  onResolve: () => void;
  onPostpone: () => void;
  getRiskBadgeStyle: (risk: string) => string;
  getSectionBadgeStyle: (section: DecisionInboxSection) => string;
}

const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  onReview,
  onResolve,
  onPostpone,
  getRiskBadgeStyle,
  getSectionBadgeStyle
}) => {
  const [expanded, setExpanded] = useState(false);
  const isCritical = decision.section === 'CRITICAL';
  const isHigh = decision.section === 'HIGH';
  return (
    <div className={`rounded-xl border transition-all duration-200 bg-slate-900/95 overflow-hidden shadow-lg ${isCritical?'border-rose-500/40 shadow-rose-950/20':isHigh?'border-amber-500/40 shadow-amber-950/20':'border-slate-800'}`}>
      <button onClick={()=>setExpanded(v=>!v)} className="w-full text-left px-5 py-4 bg-slate-950/70 hover:bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-bold uppercase tracking-wider text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded">{decision.category}</span><span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getSectionBadgeStyle(decision.section)}`}>{decision.resolvedUrgency}</span>{decision.isExpiringSoon&&<span className="text-[10px] text-rose-400">Expiring soon</span>}</div><h3 className="text-sm font-bold text-slate-100 truncate">{decision.title}</h3></div>
        <div className="flex items-center gap-3 shrink-0"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getRiskBadgeStyle(decision.resolvedRisk)}`}>{decision.resolvedRisk}</span><ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded?'rotate-180':''}`}/></div>
      </button>
      {!expanded ? <div className="px-5 py-3 flex items-center justify-between text-[10px] text-slate-500"><span>Folded for attention control.</span><span className="text-blue-400 font-bold">Unfold to read & decide</span></div> : <div className="p-5 space-y-4">
        <p className="text-sm text-slate-300 leading-relaxed">{decision.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"><div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800"><span className="text-slate-500 uppercase font-semibold">Affected</span><div className="font-bold text-slate-200 mt-1 truncate">{decision.resolvedAffectedEntity}</div></div><div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800"><span className="text-slate-500 uppercase font-semibold">Expires</span><div className="font-bold text-slate-200 mt-1">{decision.resolvedExpiration}</div></div><div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800"><span className="text-slate-500 uppercase font-semibold">Upside</span><div className="font-medium text-emerald-300 mt-1 line-clamp-2">{decision.resolvedPotentialUpside}</div></div><div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800"><span className="text-slate-500 uppercase font-semibold">Downside</span><div className="font-medium text-rose-300 mt-1 line-clamp-2">{decision.resolvedPotentialDownside}</div></div></div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-800 pt-3">{decision.isPostponeAllowed&&<button onClick={onPostpone} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5"/>Postpone</button>}<button onClick={onReview} className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-blue-300 border border-blue-500/30 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5"/>Review</button><button onClick={onResolve} className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/>Resolve</button></div>
      </div>}
    </div>
  );
};

// ==========================================
// DECISION REVIEW MODAL (Deep Analysis View)
// ==========================================

interface DecisionReviewModalProps {
  decision: EnrichedDecision;
  state: GameState;
  onClose: () => void;
  onExecuteOption: (optionId: string) => void;
  onPostpone: () => void;
  getRiskBadgeStyle: (risk: string) => string;
  getSectionBadgeStyle: (section: DecisionInboxSection) => string;
}

const DecisionReviewModal: React.FC<DecisionReviewModalProps> = ({
  decision,
  state,
  onClose,
  onExecuteOption,
  onPostpone,
  getRiskBadgeStyle,
  getSectionBadgeStyle
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(decision.options[0]?.id || '');
  const selectedOption = decision.options.find(o => o.id === selectedOptionId) || decision.options[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold uppercase tracking-wider text-xs text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                {decision.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getSectionBadgeStyle(decision.section)}`}>
                {decision.section} Priority
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getRiskBadgeStyle(decision.resolvedRisk)}`}>
                {decision.resolvedRisk} Risk
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">{decision.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Executive Briefing */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              Executive Situation Assessment
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {decision.description}
            </p>
          </div>

          {/* Core Decision Attributes Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-slate-400 uppercase font-semibold">Affected Entity:</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{decision.resolvedAffectedEntity}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-slate-400 uppercase font-semibold">Expiration Timeline:</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{decision.resolvedExpiration}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-slate-400 uppercase font-semibold">Potential Upside:</span>
              <div className="text-sm font-medium text-emerald-300 mt-0.5">{decision.resolvedPotentialUpside}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-slate-400 uppercase font-semibold">Potential Downside:</span>
              <div className="text-sm font-medium text-rose-300 mt-0.5">{decision.resolvedPotentialDownside}</div>
            </div>
          </div>

          {/* Strategic Options Evaluation */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Select Strategic Course of Action
            </h4>

            <div className="space-y-3">
              {decision.options.map(option => {
                const isSelected = option.id === selectedOption?.id;
                const canAfford = !option.cost || state.finances.cash >= option.cost;
                const riskEval = (option.risk === 'High' || option.risk === 'Medium')
                  ? calculateStateAwareRiskProbability(state, decision, option)
                  : null;

                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedOptionId(option.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/30 border-blue-500 shadow-md shadow-blue-950/30'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <h5 className="font-bold text-slate-100">{option.label}</h5>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {option.cost ? (
                          <span className={`font-semibold px-2 py-0.5 rounded border ${
                            canAfford ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-rose-950 text-rose-400 border-rose-500/30'
                          }`}>
                            Cost: ${option.cost.toLocaleString()}
                          </span>
                        ) : null}

                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${getRiskBadgeStyle(option.risk)}`}>
                          {option.risk} Risk
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 pl-6 mb-2">
                      {option.description}
                    </p>

                    {riskEval && (
                      <div className="ml-6 mb-2 p-2 rounded bg-slate-900/90 text-xs border border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Calculated Success Probability:</span>
                          <span className={`font-bold ${
                            riskEval.successProbability >= 0.7 ? 'text-emerald-400' :
                            riskEval.successProbability >= 0.45 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {Math.round(riskEval.successProbability * 100)}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 italic">
                          Base {Math.round(riskEval.baseProbability * 100)}% {riskEval.positiveFactors && riskEval.positiveFactors.length > 0 ? `+ ${riskEval.positiveFactors[0]}` : ''} {riskEval.negativeFactors && riskEval.negativeFactors.length > 0 ? `- ${riskEval.negativeFactors[0]}` : ''}
                        </div>
                      </div>
                    )}

                    {option.projectedOutcome && (
                      <div className="ml-6 p-2 rounded bg-slate-900 text-xs text-blue-300 border border-slate-800">
                        <strong>Projected Impact:</strong> {option.projectedOutcome}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
          <div>
            {decision.isPostponeAllowed ? (
              <button
                onClick={() => {
                  onPostpone();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Postpone Decision (+1 mo)
              </button>
            ) : (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
                Requires immediate resolution
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => {
                if (selectedOption) {
                  onExecuteOption(selectedOption.id);
                }
              }}
              disabled={selectedOption && selectedOption.cost && state.finances.cash < selectedOption.cost}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              Execute Resolution ({selectedOption?.label || 'Option'})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// QUICK RESOLVE MODAL SUBCOMPONENT
// ==========================================

interface DecisionResolveModalProps {
  decision: EnrichedDecision;
  state: GameState;
  onClose: () => void;
  onExecuteOption: (optionId: string) => void;
  getRiskBadgeStyle: (risk: string) => string;
}

const DecisionResolveModal: React.FC<DecisionResolveModalProps> = ({
  decision,
  state,
  onClose,
  onExecuteOption,
  getRiskBadgeStyle
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              Resolve Decision • {decision.category}
            </div>
            <h3 className="text-lg font-bold text-slate-100">{decision.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs text-slate-400 mb-2">
            Select an action to resolve this matter immediately. Consequences will be recorded in historical ledger.
          </p>

          {decision.options.map(option => {
            const canAfford = !option.cost || state.finances.cash >= option.cost;

            return (
              <div
                key={option.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-100">{option.label}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getRiskBadgeStyle(option.risk)}`}>
                    {option.risk} Risk
                  </span>
                </div>

                <p className="text-xs text-slate-300">{option.description}</p>

                {option.projectedOutcome && (
                  <div className="text-xs text-blue-300/90 bg-slate-900/90 p-2 rounded border border-slate-800/80">
                    {option.projectedOutcome}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {option.cost ? `Required Outlay: $${option.cost.toLocaleString()}` : 'No Capital Outlay'}
                  </span>

                  <button
                    onClick={() => onExecuteOption(option.id)}
                    disabled={!canAfford}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    Select Option
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
