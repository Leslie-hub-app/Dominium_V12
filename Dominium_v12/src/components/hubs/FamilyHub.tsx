import React, { useState } from 'react';
import { GameState, RelationshipPerson, DynastySuccessionPlan } from '../../types';
import { 
  Users, 
  Heart, 
  Gift, 
  MessageCircle, 
  Crown, 
  UserPlus, 
  Sparkles, 
  ShieldCheck,
  Award,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Brain,
  AlertTriangle,
  Plane,
  Coins,
  Smile,
  Landmark,
  Clock,
  History,
  FileText,
  Building2,
  Calendar
} from 'lucide-react';
import { DynastyProfileSection } from '../dynasty/DynastyProfileSection';
import { SuccessionPlanningStudio } from '../dynasty/SuccessionPlanningStudio';
import { DynastyTimelineView } from '../dynasty/DynastyTimelineView';
import { SuccessionChroniclesView } from '../dynasty/SuccessionChroniclesView';

interface FamilyHubProps {
  state: GameState;
  activeSubTab?: 'household' | 'profile' | 'succession' | 'timeline' | 'chronicles';
  onSelectSubTab?: (tab: 'household' | 'profile' | 'succession' | 'timeline' | 'chronicles') => void;
  onInteractRelationship: (
    personId: string, 
    actionType: 'spend_time' | 'give_gift' | 'deep_talk' | 'set_heir' | 'fund_tutoring' | 'set_allowance' | 'appoint_executive' | 'family_vacation'
  ) => void;
  onFindDate: () => void;
  onProposeMarriage: (personId: string) => void;
  onHaveChild: () => void;
  onUpdateSuccessionPlan?: (plan: DynastySuccessionPlan) => void;
  onExecuteSuccession?: (plan?: DynastySuccessionPlan) => void;
  onOpenLegacyReport?: () => void;
}

export const FamilyHub: React.FC<FamilyHubProps> = ({
  state,
  activeSubTab: controlledSubTab,
  onSelectSubTab,
  onInteractRelationship,
  onFindDate,
  onProposeMarriage,
  onHaveChild,
  onUpdateSuccessionPlan,
  onExecuteSuccession,
  onOpenLegacyReport
}) => {
  const { relationships, dynastyGeneration, dynastyHeirId } = state;
  const partner = relationships.find(r => r.relation === 'Spouse' || r.relation === 'Partner');
  const children = relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const relatives = relationships.filter(r => r.relation !== 'Spouse' && r.relation !== 'Partner' && r.relation !== 'Son' && r.relation !== 'Daughter');

  // Main Family Hub Tab Navigation
  const [internalHubTab, setInternalHubTab] = useState<'household' | 'profile' | 'succession' | 'timeline' | 'chronicles'>('household');
  const hubTab = controlledSubTab || internalHubTab;
  const setHubTab = (newTab: 'household' | 'profile' | 'succession' | 'timeline' | 'chronicles') => {
    setInternalHubTab(newTab);
    if (onSelectSubTab) onSelectSubTab(newTab);
  };
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'children' | 'spouse' | 'relatives'>('all');

  // Calculate Family Harmony & Household Metrics
  const avgLove = relationships.length > 0
    ? Math.round(relationships.reduce((acc, r) => acc + r.love, 0) / relationships.length)
    : 100;
  const avgTrust = relationships.length > 0
    ? Math.round(relationships.reduce((acc, r) => acc + r.trust, 0) / relationships.length)
    : 100;
  const householdStability = Math.round((avgLove * 0.6) + (avgTrust * 0.4));

  const filteredMembers = relationships.filter(r => {
    if (activeTabFilter === 'children') return r.relation === 'Son' || r.relation === 'Daughter';
    if (activeTabFilter === 'spouse') return r.relation === 'Spouse' || r.relation === 'Partner';
    if (activeTabFilter === 'relatives') return r.relation !== 'Spouse' && r.relation !== 'Partner' && r.relation !== 'Son' && r.relation !== 'Daughter';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Dynastic Navigation Subtabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 border-b border-zinc-800">
        <button
          onClick={() => setHubTab('household')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            hubTab === 'household'
              ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Household & Kin ({relationships.length})</span>
        </button>

        <button
          onClick={() => setHubTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            hubTab === 'profile'
              ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Dynasty Profile (Gen {dynastyGeneration})</span>
        </button>

        <button
          onClick={() => setHubTab('succession')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            hubTab === 'succession'
              ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Succession Studio</span>
        </button>

        <button
          onClick={() => setHubTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            hubTab === 'timeline'
              ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Dynasty Timeline ({state.dynastyProfile?.timeline?.length || 0})</span>
        </button>

        <button
          onClick={() => setHubTab('chronicles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            hubTab === 'chronicles'
              ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Succession Chronicles</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {hubTab === 'profile' && (
        <DynastyProfileSection
          state={state}
          onOpenLegacyReport={onOpenLegacyReport || (() => {})}
          onOpenSuccessionModal={() => setHubTab('succession')}
        />
      )}

      {hubTab === 'succession' && (
        <SuccessionPlanningStudio
          state={state}
          onUpdatePlan={onUpdateSuccessionPlan || (() => {})}
          onExecuteSuccession={onExecuteSuccession || (() => {})}
          onOpenLegacyReport={onOpenLegacyReport || (() => {})}
        />
      )}

      {hubTab === 'timeline' && (
        <DynastyTimelineView state={state} />
      )}

      {hubTab === 'chronicles' && (
        <SuccessionChroniclesView state={state} />
      )}

      {hubTab === 'household' && (
        <div className="space-y-5 animate-fade-in">
          {/* Dynastic Header & Household Status */}
          <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 p-5 rounded-2xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Dynasty Gen {dynastyGeneration}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Stability: {householdStability}%
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-zinc-100 font-serif">
                The {state.character.lastName} Household & Succession
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Cultivate strong bonds with your spouse, mentor the next generation with elite education and careers, and prevent domestic fallout from professional burnout.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onInteractRelationship(partner?.id || relationships[0]?.id || '', 'family_vacation')}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 shadow-md transition-all flex items-center gap-1.5"
                title="Book a family vacation to restore harmony ($15,000)"
              >
                <Plane className="w-3.5 h-3.5 text-cyan-400" />
                <span>Family Vacation ($15k)</span>
              </button>

              {!partner ? (
                <button
                  onClick={onFindDate}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Find Romance</span>
                </button>
              ) : (
                <button
                  onClick={onHaveChild}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Have a Child</span>
                </button>
              )}
            </div>
          </div>

          {/* Household Harmony Vitals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 shadow-sm">
              <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" /> Spousal / Household Love
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-extrabold text-zinc-100">{avgLove}%</span>
                <span className={`text-[10px] font-bold ${avgLove >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {avgLove >= 80 ? 'Devoted' : (avgLove >= 50 ? 'Stable' : 'Strained')}
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 shadow-sm">
              <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> Dynastic Trust Index
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-extrabold text-zinc-100">{avgTrust}%</span>
                <span className="text-[10px] font-bold text-cyan-400">
                  {avgTrust >= 80 ? 'Unshakable' : 'Moderate'}
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 shadow-sm">
              <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-violet-400" /> Next Generation Heirs
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-extrabold text-zinc-100">{children.length} Children</span>
                <span className="text-[10px] font-bold text-amber-400">
                  {dynastyHeirId ? 'Heir Assigned' : 'No Heir'}
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 shadow-sm">
              <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" /> Children Combined Wealth
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-extrabold text-amber-300 font-mono">
                  ${children.reduce((acc, c) => acc + (c.wealth || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-zinc-500">Personal Assets</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabFilter === 'all' ? 'bg-zinc-800 text-cyan-400 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Members ({relationships.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('children')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabFilter === 'children' ? 'bg-zinc-800 text-cyan-400 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Children & Heirs ({children.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('spouse')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabFilter === 'spouse' ? 'bg-zinc-800 text-cyan-400 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Spouse & Partners ({partner ? 1 : 0})
            </button>
            <button
              onClick={() => setActiveTabFilter('relatives')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabFilter === 'relatives' ? 'bg-zinc-800 text-cyan-400 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Extended Family & Allies ({relatives.length})
            </button>
          </div>

          {/* Relationship Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMembers.map(person => {
              const isHeir = dynastyHeirId === person.id;
              const isChild = person.relation === 'Son' || person.relation === 'Daughter';
              const ticksSinceInteracted = state.simulationTick - (person.lastInteractedTick || 0);
              const isNeglected = ticksSinceInteracted >= 6;

              return (
                <div 
                  key={person.id}
                  className={`bg-zinc-900/90 p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 shadow-md ${
                    isHeir ? 'border-amber-500/60 ring-1 ring-amber-500/20' : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Header Info */}
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl shadow-inner">
                        {isChild ? (person.gender === 'Female' ? '👧' : '👦') : (person.gender === 'Female' ? '👩' : '👨')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-zinc-100">{person.name}</span>
                          {isHeir && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 flex items-center gap-0.5 shadow-sm">
                              <Crown className="w-2.5 h-2.5" /> HEIR
                            </span>
                          )}
                          {isChild && person.potential && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              {person.potential}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-cyan-400 font-semibold">{person.relation}</span>
                          <span>•</span>
                          <span>Age {person.age}</span>
                          <span>•</span>
                          <span className="text-zinc-300">{person.occupation || 'Private Citizen'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        person.alive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {person.alive ? 'Alive' : 'Deceased'}
                      </span>
                      {isNeglected && (
                        <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Needs Attention
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Child-Specific Dynamic Attributes & Skills */}
                  {isChild && (
                    <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate" title={person.education || 'Primary Education'}>
                            {person.education || 'Primary Education'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate" title={person.career || 'Student / Early Career'}>
                            {person.career || 'Student / Exploring'}
                          </span>
                        </div>
                      </div>

                      {/* 4 Core Competency Attributes */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                        <div className="bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                          <span className="text-zinc-400 block text-[9px]">Leadership</span>
                          <b className="text-amber-400 font-mono font-bold">{person.leadership || 70}/100</b>
                        </div>
                        <div className="bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                          <span className="text-zinc-400 block text-[9px]">Business</span>
                          <b className="text-cyan-400 font-mono font-bold">{person.businessAbility || 65}/100</b>
                        </div>
                        <div className="bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                          <span className="text-zinc-400 block text-[9px]">Politics</span>
                          <b className="text-indigo-400 font-mono font-bold">{person.politicalAbility || 60}/100</b>
                        </div>
                        <div className="bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                          <span className="text-zinc-400 block text-[9px]">Loyalty</span>
                          <b className="text-emerald-400 font-mono font-bold">{person.loyalty || 70}%</b>
                        </div>
                      </div>

                      {/* Wealth, Health & Allowance */}
                      <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-400">
                        <span>Personal Wealth: <b className="text-amber-300 font-mono">${(person.wealth || 0).toLocaleString()}</b></span>
                        <span>Health: <b className="text-emerald-400">{Math.round(person.health || 95)}%</b></span>
                        {person.monthlyAllowance ? (
                          <span className="text-cyan-400 font-mono">Allowance: ${person.monthlyAllowance}/mo</span>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* 5 Dynamic Relational Metrics */}
                  <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                    <div className="bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 block">Trust</span>
                      <b className="text-cyan-400 font-bold">{person.trust}%</b>
                    </div>
                    <div className="bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 block">Love</span>
                      <b className="text-rose-400 font-bold">{person.love}%</b>
                    </div>
                    <div className="bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 block">Respect</span>
                      <b className="text-violet-400 font-bold">{person.respect}%</b>
                    </div>
                    <div className="bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 block">Loyalty</span>
                      <b className="text-emerald-400 font-bold">{person.loyalty}%</b>
                    </div>
                    <div className="bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 block">Influence</span>
                      <b className="text-amber-400 font-bold">{person.influence}%</b>
                    </div>
                  </div>

                  {/* Interaction Action Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-800/80 text-xs">
                    <button
                      onClick={() => onInteractRelationship(person.id, 'spend_time')}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold border border-zinc-700 flex items-center justify-center gap-1 transition-all"
                    >
                      <Heart className="w-3 h-3 text-rose-400" />
                      <span>Spend Time</span>
                    </button>

                    <button
                      onClick={() => onInteractRelationship(person.id, 'give_gift')}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold border border-zinc-700 flex items-center justify-center gap-1 transition-all"
                    >
                      <Gift className="w-3 h-3 text-amber-400" />
                      <span>Gift ($500)</span>
                    </button>

                    <button
                      onClick={() => onInteractRelationship(person.id, 'deep_talk')}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold border border-zinc-700 flex items-center justify-center gap-1 transition-all"
                    >
                      <MessageCircle className="w-3 h-3 text-cyan-400" />
                      <span>Talk</span>
                    </button>

                    {isChild && (
                      <>
                        <button
                          onClick={() => onInteractRelationship(person.id, 'fund_tutoring')}
                          className="py-1.5 px-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-[11px] font-bold border border-indigo-700/50 flex items-center justify-center gap-1 transition-all"
                        >
                          <Brain className="w-3 h-3 text-indigo-400" />
                          <span>Tutoring ($3k)</span>
                        </button>

                        <button
                          onClick={() => onInteractRelationship(person.id, 'set_allowance')}
                          className="py-1.5 px-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 text-[11px] font-bold border border-emerald-700/50 flex items-center justify-center gap-1 transition-all"
                        >
                          <Coins className="w-3 h-3 text-emerald-400" />
                          <span>Allowance ($1k)</span>
                        </button>

                        {person.age >= 21 && state.companies.length > 0 && (
                          <button
                            onClick={() => onInteractRelationship(person.id, 'appoint_executive')}
                            className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/50 flex items-center justify-center gap-1 transition-all"
                          >
                            <Briefcase className="w-3 h-3 text-amber-400" />
                            <span>Executive</span>
                          </button>
                        )}
                      </>
                    )}

                    {isChild && (
                      <button
                        onClick={() => onInteractRelationship(person.id, 'set_heir')}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          isHeir 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>{isHeir ? 'Designated Heir' : 'Make Heir'}</span>
                      </button>
                    )}

                    {person.relation === 'Partner' && (
                      <button
                        onClick={() => onProposeMarriage(person.id)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 text-white font-bold text-[11px] shadow-sm transition-all"
                      >
                        Propose Marriage 💍
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
