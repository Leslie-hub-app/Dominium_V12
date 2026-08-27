import React, { useState } from 'react';
import { 
  GameState, 
  GameObjective, 
  ObjectiveCategory, 
  ObjectiveStatus, 
  CampaignDefinition 
} from '../types';
import { 
  evaluateAllObjectives, 
  getAllCampaigns, 
  getActiveCampaign, 
  formatCurrency, 
  donateToPhilanthropy, 
  claimObjectiveReward, 
  pinObjective, 
  setCampaign, 
  setSandboxMode 
} from '../engine/objectiveEngine';
import { 
  Target, 
  Trophy, 
  Compass, 
  Sparkles, 
  DollarSign, 
  Building2, 
  Layers, 
  Landmark, 
  Globe, 
  Heart, 
  Crown, 
  CheckCircle2, 
  Clock, 
  Pin, 
  PinOff, 
  Gift, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  ShieldCheck, 
  Award,
  Zap,
  Building,
  HeartHandshake,
  Check
} from 'lucide-react';

interface ObjectivesHubProps {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
  onOpenModule?: (module: string) => void;
}

export const ObjectivesHub: React.FC<ObjectivesHubProps> = ({
  state,
  onUpdateState,
  onOpenModule
}) => {
  const [activeTab, setActiveTab] = useState<'objectives' | 'campaigns' | 'philanthropy'>('objectives');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSubGoals, setExpandedSubGoals] = useState<Record<string, boolean>>({
    obj_balanced_life: true,
    obj_globalist: true
  });
  
  // Philanthropy donation form state
  const [donationAmount, setDonationAmount] = useState<number>(1000000);
  const [selectedCause, setSelectedCause] = useState<string>('Global Clean Energy & Climate Research');
  const [donationFeedback, setDonationFeedback] = useState<string | null>(null);
  const [rewardFeedback, setRewardFeedback] = useState<string | null>(null);

  const objectives = evaluateAllObjectives(state);
  const campaigns = getAllCampaigns();
  const activeCampaign = getActiveCampaign(state);

  const completedCount = objectives.filter(o => o.status === 'Completed').length;
  const overallMasteryPct = Math.round(
    objectives.reduce((sum, o) => sum + o.percentage, 0) / objectives.length
  );
  const lifetimePhilanthropy = state.lifetimePhilanthropy || 0;

  const categories: ('All' | ObjectiveCategory)[] = [
    'All',
    'Wealth',
    'Business',
    'Projects',
    'Politics',
    'Global',
    'Philanthropy',
    'Dynasty',
    'Lifestyle',
    'Sports'
  ];

  const filteredObjectives = objectives.filter(obj => {
    if (selectedCategory !== 'All' && obj.category !== selectedCategory) return false;
    if (selectedStatus === 'Completed' && obj.status !== 'Completed') return false;
    if (selectedStatus === 'In Progress' && obj.status !== 'In Progress') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        obj.title.toLowerCase().includes(q) ||
        obj.description.toLowerCase().includes(q) ||
        obj.targetGoal.toLowerCase().includes(q) ||
        obj.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSubGoals = (id: string) => {
    setExpandedSubGoals(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePin = (id: string) => {
    const isCurrentlyPinned = state.pinnedObjectiveId === id;
    const newState = pinObjective(state, isCurrentlyPinned ? null : id);
    onUpdateState(newState);
  };

  const handleClaimReward = (id: string) => {
    try {
      const { nextState, rewardText } = claimObjectiveReward(state, id);
      onUpdateState(nextState);
      setRewardFeedback(`🎉 Claimed reward for ${id}: ${rewardText}`);
      setTimeout(() => setRewardFeedback(null), 4500);
    } catch (err: any) {
      setRewardFeedback(`⚠️ ${err.message}`);
      setTimeout(() => setRewardFeedback(null), 4500);
    }
  };

  const handleDonate = (amount: number) => {
    try {
      const { nextState } = donateToPhilanthropy(state, amount, selectedCause);
      onUpdateState(nextState);
      setDonationFeedback(`🕊️ Successfully endowed ${formatCurrency(amount)} to ${selectedCause}!`);
      setTimeout(() => setDonationFeedback(null), 4500);
    } catch (err: any) {
      setDonationFeedback(`⚠️ ${err.message}`);
      setTimeout(() => setDonationFeedback(null), 4500);
    }
  };

  const handleSelectCampaign = (campaignId: string) => {
    const newState = setCampaign(state, campaignId);
    onUpdateState(newState);
  };

  const handleToggleSandbox = () => {
    const newState = setSandboxMode(state, !state.isSandboxMode);
    onUpdateState(newState);
  };

  const getObjectiveIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign': return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'Layers': return <Layers className="w-4 h-4 text-amber-400" />;
      case 'Landmark': return <Landmark className="w-4 h-4 text-purple-400" />;
      case 'Globe': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Crown': return <Crown className="w-4 h-4 text-amber-300" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-yellow-300" />;
      case 'Zap': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Building': return <Building className="w-4 h-4 text-teal-400" />;
      case 'Trophy': return <Trophy className="w-4 h-4 text-amber-400" />;
      default: return <Target className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-[760px] w-full mx-auto space-y-4 pb-20">
      {/* Top Banner & Mode Summary */}
      <div className="bg-[#16161a] border border-[rgba(236,236,232,0.08)] p-4 sm:p-5 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2">
                Objectives & Campaigns
                {state.isSandboxMode ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    Sandbox Mode
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {activeCampaign?.title || 'Active Campaign'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Dynamic objectives calculate real-time progress from live game state.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSandbox}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                state.isSandboxMode 
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/60' 
                  : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700/60'
              }`}
              title="Toggle between Sandbox Free Play (no forced objectives) and Structured Campaign Mode"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{state.isSandboxMode ? 'Sandbox: Active' : 'Switch to Sandbox'}</span>
            </button>
          </div>
        </div>

        {/* Global Progress Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Objectives Mastered</span>
            <div className="text-lg font-black text-amber-400 mt-0.5 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>{completedCount} / {objectives.length}</span>
            </div>
          </div>

          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Overall Mastery</span>
            <div className="text-lg font-black text-zinc-100 mt-0.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-400" />
              <span>{overallMasteryPct}%</span>
            </div>
          </div>

          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Lifetime Philanthropy</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>{formatCurrency(lifetimePhilanthropy)}</span>
            </div>
          </div>

          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Active Mode</span>
            <div className="text-sm font-bold text-zinc-200 mt-1 truncate">
              {state.isSandboxMode ? 'Free Sandbox' : (activeCampaign?.badge || 'Campaign')}
            </div>
          </div>
        </div>

        {/* Sandbox Notice */}
        {state.isSandboxMode && (
          <div className="bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl text-xs text-emerald-200/90 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <b>Sandbox Mode:</b> Objectives act as voluntary achievements. You are completely unconstrained with no mandatory deadlines or forced failure conditions.
            </span>
          </div>
        )}

        {/* Reward or Action Feedback Banner */}
        {rewardFeedback && (
          <div className="bg-amber-950/40 border border-amber-500/50 p-2.5 rounded-xl text-xs text-amber-200 animate-fade-in flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{rewardFeedback}</span>
          </div>
        )}
      </div>

      {/* Hub Sub-navigation */}
      <div className="flex items-center gap-1.5 bg-[#16161a] p-1.5 rounded-xl border border-zinc-800">
        <button
          onClick={() => setActiveTab('objectives')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'objectives'
              ? 'bg-amber-400 text-zinc-950 shadow-md font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Dynamic Objectives ({objectives.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-amber-400 text-zinc-950 shadow-md font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Campaigns & Scenarios</span>
        </button>

        <button
          onClick={() => setActiveTab('philanthropy')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'philanthropy'
              ? 'bg-amber-400 text-zinc-950 shadow-md font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Philanthropy Center</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. DYNAMIC OBJECTIVES TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'objectives' && (
        <div className="space-y-3.5">
          {/* Filters & Search Toolbar */}
          <div className="bg-[#16161a] p-3 rounded-xl border border-zinc-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search objectives (e.g. Entrepreneur, Tycoon, Office)..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {['All', 'In Progress', 'Completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedStatus === status
                        ? 'bg-zinc-800 text-amber-400 border-zinc-600'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Objectives List */}
          <div className="space-y-3">
            {filteredObjectives.map(obj => {
              const isPinned = state.pinnedObjectiveId === obj.id;
              const isCompleted = obj.status === 'Completed';
              const hasSubGoals = obj.subGoals && obj.subGoals.length > 0;
              const isExpanded = expandedSubGoals[obj.id];

              return (
                <div
                  key={obj.id}
                  className={`bg-[#16161a] border rounded-2xl p-4 sm:p-5 transition-all shadow-md space-y-3.5 ${
                    isCompleted
                      ? 'border-emerald-500/40 bg-[#161a18]'
                      : isPinned
                      ? 'border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                      : 'border-[rgba(236,236,232,0.08)] hover:border-zinc-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        {getObjectiveIcon(obj.iconName)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-black text-zinc-100">
                            {obj.title}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {obj.category}
                          </span>
                          {isPinned && (
                            <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-mono">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-400 mt-0.5">
                          {obj.description}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10.5px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-amber-400" />}
                        <span>{obj.status}</span>
                      </span>

                      {/* Pin Toggle */}
                      <button
                        onClick={() => handlePin(obj.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isPinned
                            ? 'bg-amber-400 text-zinc-950 border-amber-400'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                        title={isPinned ? 'Unpin from header' : 'Pin to header quick tracker'}
                      >
                        {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Goal & Metrics Display */}
                  <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">Target Requirement</span>
                        <span className="text-zinc-200 font-bold">{obj.targetGoal}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">Current Progress</span>
                        <span className={`font-mono font-black ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {obj.formattedCurrent} <span className="text-zinc-500 font-normal">/ {obj.formattedTarget}</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">Progress</span>
                        <span className={`font-black ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {obj.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, obj.percentage))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Multi-Condition Sub-goals (e.g. THE BALANCED LIFE, THE GLOBALIST) */}
                  {hasSubGoals && (
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => toggleSubGoals(obj.id)}
                        className="w-full flex items-center justify-between py-1.5 px-3 bg-zinc-900/80 hover:bg-zinc-900 rounded-lg text-xs font-bold text-zinc-300 border border-zinc-800 cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          Detailed Component Goals ({obj.subGoals!.filter(s => s.isCompleted).length} / {obj.subGoals!.length} Achieved)
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-fade-in">
                          {obj.subGoals!.map(sub => (
                            <div
                              key={sub.id}
                              className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                                sub.isCompleted
                                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-100'
                                  : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11.5px] truncate pr-2">{sub.title}</span>
                                {sub.isCompleted ? (
                                  <span className="text-emerald-400 flex items-center gap-0.5 text-[10px] font-bold font-mono">
                                    <Check className="w-3 h-3" /> Met
                                  </span>
                                ) : (
                                  <span className="text-amber-400 text-[10px] font-mono font-bold">
                                    {sub.percentage}%
                                  </span>
                                )}
                              </div>

                              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                <span>{sub.formattedCurrent}</span>
                                <span>Goal: {sub.formattedTarget}</span>
                              </div>

                              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${sub.isCompleted ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                  style={{ width: `${Math.min(100, Math.max(0, sub.percentage))}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Footer: Reward & Claim */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-800/70 pt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px]">
                        <b>Reward:</b> {obj.rewardDescription || '+15 World Influence'}
                      </span>
                    </div>

                    {isCompleted && !obj.rewardClaimed && (
                      <button
                        onClick={() => handleClaimReward(obj.id)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Claim Reward</span>
                      </button>
                    )}

                    {isCompleted && obj.rewardClaimed && (
                      <span className="text-[10.5px] font-bold text-emerald-400/80 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reward Claimed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CAMPAIGNS & SCENARIOS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="bg-[#16161a] p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2">
            <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Campaign Narratives & Career Paths
            </h3>
            <p className="text-xs text-zinc-400">
              Select an active campaign to focus your gameplay. Each campaign pairs starting backgrounds with tailored primary and secondary victory objectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {campaigns.map(camp => {
              const isActive = (state.isSandboxMode && camp.id === 'camp_sandbox') || (!state.isSandboxMode && state.activeCampaignId === camp.id);
              const primaryObj = objectives.find(o => o.id === camp.primaryObjectiveId);

              return (
                <div
                  key={camp.id}
                  className={`bg-[#16161a] border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 transition-all shadow-md ${
                    isActive
                      ? 'border-amber-400/80 bg-[#191920] shadow-[0_0_15px_rgba(251,191,36,0.12)]'
                      : 'border-[rgba(236,236,232,0.08)] hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                          {camp.badge}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-zinc-100 mt-1">
                          {camp.title}
                        </h4>
                        <span className="text-[11px] text-zinc-400 font-semibold">{camp.subtitle}</span>
                      </div>

                      {isActive && (
                        <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {camp.description}
                    </p>

                    {/* Primary Goal Snippet */}
                    {primaryObj && (
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-zinc-400 text-[10.5px]">Primary Target:</span>
                          <span className="text-amber-400 text-[10.5px] font-mono">{primaryObj.percentage}%</span>
                        </div>
                        <span className="text-zinc-200 font-semibold block">{primaryObj.targetGoal}</span>
                      </div>
                    )}

                    {camp.specialPerk && (
                      <div className="text-[11px] text-amber-300/90 flex items-center gap-1.5 pt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><b>Perk:</b> {camp.specialPerk}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      Difficulty: <b className="text-zinc-300">{camp.difficulty}</b>
                    </span>

                    {!isActive ? (
                      <button
                        onClick={() => handleSelectCampaign(camp.id)}
                        className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
                      >
                        Set Active
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Current Focus
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. PHILANTHROPY CENTER TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'philanthropy' && (
        <div className="space-y-4">
          <div className="bg-[#16161a] p-5 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-100">
                  Global Philanthropy & Humanitarian Endowments
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Endow wealth toward scientific breakthroughs, clean energy, and civic institutions. Progresses <b>THE PHILANTHROPIST</b> ($50M goal).
                </p>
              </div>
            </div>

            {/* Philanthropy Progress Bar */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold">Total Donated to Date</span>
                <span className="text-emerald-400 font-black text-sm font-mono">
                  {formatCurrency(lifetimePhilanthropy)} <span className="text-zinc-500 font-normal">/ $50.0M</span>
                </span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((lifetimePhilanthropy / 50000000) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] text-zinc-500 font-mono">
                <span>0%</span>
                <span>{Math.min(100, Math.round((lifetimePhilanthropy / 50000000) * 100))}% toward Philanthropist Title</span>
                <span>100% ($50M)</span>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="bg-[#16161a] p-5 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Commission Philanthropic Gift
            </h4>

            {/* Cause Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold block">Select Humanitarian Cause</label>
              <select
                value={selectedCause}
                onChange={(e) => setSelectedCause(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Global Clean Energy & Climate Research">Global Clean Energy & Climate Research</option>
                <option value="Advanced Medical & Biopharma Foundation">Advanced Medical & Biopharma Foundation</option>
                <option value="Universal STEM & Youth Education Fund">Universal STEM & Youth Education Fund</option>
                <option value="Disaster Relief & Humanitarian Aid">Disaster Relief & Humanitarian Aid</option>
                <option value="Civic Arts, Museums & Classical Architecture">Civic Arts, Museums & Classical Architecture</option>
              </select>
            </div>

            {/* Donation Quick Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold block">Donation Amount</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[100000, 1000000, 5000000, 25000000].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setDonationAmount(amount)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      donationAmount === amount
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Message */}
            {donationFeedback && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{donationFeedback}</span>
              </div>
            )}

            {/* Confirm Donation Button */}
            <button
              onClick={() => handleDonate(donationAmount)}
              disabled={state.finances.cash < donationAmount}
              className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                state.finances.cash >= donationAmount
                  ? 'bg-rose-500 hover:bg-rose-400 text-zinc-950 active:scale-98'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>
                {state.finances.cash >= donationAmount
                  ? `Donate ${formatCurrency(donationAmount)} to ${selectedCause}`
                  : `Insufficient Cash Balance (${formatCurrency(state.finances.cash)} available)`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
