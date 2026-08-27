import React, { useState } from 'react';
import { GameState, JobRecord, ColleaguePerson } from '../../types';
import { getCorporateJobVacancies, applyForCorporateVacancy, answerCorporateInterview } from '../../engine/corporateSimulationEngine';
import { CAREER_CATALOG } from '../../data/catalogs';
import { ensureLifeSystemState, recordLifeBiography } from '../../engine/lifeEngine';
import { recordWorldPlayerAction } from '../../engine/worldGovernorCoordinator';
import { 
  Briefcase, 
  UserCheck, 
  Users, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Coffee, 
  ThumbsUp, 
  MessageSquare, 
  DollarSign, 
  ArrowUpRight, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  Building,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { ExpandedCareerSection } from '../expansion2/ExpandedCareerSection';

interface LifeCareerWorkplaceViewProps {
  state: GameState;
  onApplyJob: (job: any) => void;
  onResignJob?: () => void;
  onUpdateState?: (state: GameState) => void;
}

export const LifeCareerWorkplaceView: React.FC<LifeCareerWorkplaceViewProps> = ({
  state,
  onApplyJob,
  onResignJob,
  onUpdateState
}) => {
  const life = ensureLifeSystemState(state);
  const { character, currentJob, finances } = state;
  const workplace = life.workplace;
  const employerCompany = currentJob?.companyId ? state.companies.find(c => c.id === currentJob.companyId) : state.companies.find(c => c.name === currentJob?.companyName);

  const [activeTab, setActiveTab] = useState<'workplace' | 'market' | 'licensing'>('workplace');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [activeInterview, setActiveInterview] = useState<any | null>(null);
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Manager 1-on-1 actions
  const handleManagerAction = (action: 'raise' | 'promotion' | 'mentorship') => {
    if (!workplace || !currentJob) return;
    life.socialInteractionHistory = life.socialInteractionHistory || [];
    life.socialInteractionHistory.unshift({tick: state.simulationTick, action: `MANAGER_${action.toUpperCase()}`, summary: `Workplace interaction with manager ${workplace.managerName}: ${action.replace('_',' ')}.`});
    recordWorldPlayerAction(state,'WORKPLACE_INTERACTION',`Interacted with manager ${workplace.managerName}: ${action.replace('_',' ')}.`,['npc','career','companies'],60);

    if (action === 'raise') {
      if (currentJob.performance >= 75 && workplace.managerPerception >= 65) {
        const raiseAmount = Math.round(currentJob.monthlySalary * 0.12);
        currentJob.monthlySalary += raiseAmount;
        workplace.managerPerception = Math.max(40, workplace.managerPerception - 10);
        showFeedback(`🎉 Raise Approved! Your monthly salary increased by $${raiseAmount.toLocaleString()}/mo.`);
        recordLifeBiography(state, {
          category: 'Career',
          title: `Negotiated 12% Salary Raise at ${currentJob.companyName}`,
          description: `Secured $${currentJob.monthlySalary.toLocaleString()}/mo compensation.`,
          iconName: 'DollarSign',
          significance: 'Notable'
        });
      } else {
        workplace.managerPerception = Math.max(30, workplace.managerPerception - 5);
        showFeedback(`❌ Raise Denied: Performance (${Math.round(currentJob.performance)}%) or manager favor (${workplace.managerPerception}%) below required threshold.`);
      }
    } else if (action === 'promotion') {
      if (currentJob.performance >= 85 && workplace.managerPerception >= 75) {
        currentJob.performance = 60; // Reset after bump
        const bump = Math.round(currentJob.monthlySalary * 0.25);
        currentJob.monthlySalary += bump;
        currentJob.title = `Senior ${currentJob.title.replace(/^Senior /, '')}`;
        state.character.attributes.reputation = Math.min(100, state.character.attributes.reputation + 6);
        showFeedback(`🚀 Promoted to ${currentJob.title}! Compensation increased by $${bump.toLocaleString()}/mo.`);
        recordLifeBiography(state, {
          category: 'Career',
          title: `Promoted to ${currentJob.title}`,
          description: `Recognized for superior performance at ${currentJob.companyName}.`,
          iconName: 'Award',
          significance: 'Major'
        });
      } else {
        showFeedback(`⚠️ Not yet eligible: Manager noted you need ≥85% performance and ≥75% favor.`);
      }
    } else if (action === 'mentorship') {
      workplace.managerTrust = Math.min(100, workplace.managerTrust + 4);
      workplace.managerPerception = Math.min(100, workplace.managerPerception + 3);
      state.character.attributes.intelligence = Math.min(100, state.character.attributes.intelligence + 1);
      showFeedback(`💡 Insightful 1-on-1 with ${workplace.managerName}. Manager favor and intelligence increased.`);
    }
  };

  // Workplace social interaction layer
  const handleColleagueAction = (colleague: ColleaguePerson, action: 'coffee' | 'praise' | 'lunch' | 'gift' | 'complain' | 'date') => {
    life.socialInteractionHistory = life.socialInteractionHistory || [];
    life.socialInteractionHistory.unshift({tick: state.simulationTick, withNpcId: colleague.id, action: `COLLEAGUE_${action.toUpperCase()}`, summary: `Interacted with colleague ${colleague.name}: ${action}.`});
    recordWorldPlayerAction(state,'WORKPLACE_INTERACTION',`Interacted with colleague ${colleague.name}: ${action}.`,['npc','career','companies'],55);
    if (action === 'coffee') {
      colleague.relationshipWithPlayer = Math.min(100, colleague.relationshipWithPlayer + 4); colleague.trust = Math.min(100, colleague.trust + 3); state.character.attributes.happiness = Math.min(100, state.character.attributes.happiness + 2);
      showFeedback(`☕ Spent time with ${colleague.name}. Workplace relationship improved.`);
    } else if (action === 'praise') {
      colleague.relationshipWithPlayer = Math.min(100, colleague.relationshipWithPlayer + 3); colleague.respect = Math.min(100, colleague.respect + 5); state.character.attributes.reputation = Math.min(100, state.character.attributes.reputation + 0.5); showFeedback(`👏 Praised ${colleague.name}'s contribution. Respect improved.`);
    } else if (action === 'lunch') {
      colleague.relationshipWithPlayer = Math.min(100, colleague.relationshipWithPlayer + 6); state.finances.cash = Math.max(0, state.finances.cash - 40); showFeedback(`🥗 Lunch with ${colleague.name} strengthened your professional alliance.`);
    } else if (action === 'gift') {
      if (state.finances.cash < 100) { showFeedback('❌ You need at least $100 for a workplace gift.'); return; }
      state.finances.cash -= 100; colleague.relationshipWithPlayer = Math.min(100, colleague.relationshipWithPlayer + 5); colleague.trust = Math.min(100, colleague.trust + 2); showFeedback(`🎁 Gift given to ${colleague.name}. Be mindful of company ethics and conflicts of interest.`);
    } else if (action === 'complain') {
      colleague.relationshipWithPlayer = Math.max(0, colleague.relationshipWithPlayer - 4); workplace && (workplace.managerPerception = Math.max(0, workplace.managerPerception - 2)); showFeedback(`⚠️ Complaint recorded about ${colleague.name}. Office politics may follow.`);
    } else if (action === 'date') {
      if (colleague.tier === 'Manager' || colleague.tier === 'Supervisor' || colleague.tier === 'Executive') { showFeedback('⚠️ Dating a direct power-holder carries workplace policy and conflict-of-interest risk.'); return; }
      colleague.relationshipWithPlayer = Math.min(100, colleague.relationshipWithPlayer + 8); state.character.attributes.happiness = Math.min(100, state.character.attributes.happiness + 3);
      const existingRelationship = state.relationships.find(r => r.name === colleague.name);
      if (existingRelationship) { existingRelationship.love = Math.min(100, existingRelationship.love + 4); existingRelationship.trust = Math.min(100, existingRelationship.trust + 2); }
      else { state.relationships.push({ id: `work_rel_${colleague.id}`, name: colleague.name, relation: 'Friend', age: colleague.age, gender: 'Non-binary', occupation: colleague.role, wealth: 0, trust: 55, love: 25, respect: colleague.respect, loyalty: 45, influence: 30, alive: true, avatarSeed: colleague.avatarSeed }); }
      showFeedback(`❤️ You asked ${colleague.name} on a date. The relationship has entered the wider social system; workplace boundaries still matter.`);
    }
  };

  const vacancies = getCorporateJobVacancies(state, selectedIndustry === 'All' ? undefined : selectedIndustry);
  const startInterview = (vacancyId: string) => {
    const result = applyForCorporateVacancy(state, vacancyId);
    if (result.success && result.interview) { setActiveInterview(result.interview); showFeedback(result.message); onUpdateState?.(state); } else showFeedback(result.message);
  };
  const answerInterview = (choiceIndex: number) => {
    if (!activeInterview) return;
    const result = answerCorporateInterview(state, activeInterview.applicationId, choiceIndex);
    if (result.completed) {
      setActiveInterview(null);
    } else {
      const liveInterview = state.corporateSystem?.activeInterviews?.find(i => i.applicationId === activeInterview.applicationId);
      setActiveInterview(liveInterview ? { ...liveInterview } : null);
    }
    showFeedback(result.message); onUpdateState?.({...state});
  };

  const industriesList = ['All', ...CAREER_CATALOG.map(c => c.field)];
  const filteredCareers = selectedIndustry === 'All'
    ? CAREER_CATALOG
    : CAREER_CATALOG.filter(c => c.field === selectedIndustry);

  return (
    <div className="space-y-4">
      {/* Sub tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('workplace')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'workplace'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>My Workplace & Team</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'market'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Market & Career Ladders</span>
          </button>

          <button
            onClick={() => setActiveTab('licensing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'licensing'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Executive Track & Licenses</span>
          </button>
        </div>

        {currentJob && onResignJob && (
          <button
            onClick={onResignJob}
            className="px-2.5 py-1 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold border border-red-500/20 transition-all flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Resign Position</span>
          </button>
        )}
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div className="p-3 bg-zinc-900 border border-amber-400/40 rounded-xl text-xs font-bold text-amber-300 shadow-lg flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 1. WORKPLACE TAB */}
      {activeTab === 'workplace' && (
        <div className="space-y-4">
          {/* Current Job Banner */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Active Employment</span>
                <h3 className="text-lg sm:text-xl font-black text-zinc-100">
                  {currentJob ? currentJob.title : 'Unemployed / Independent Consultant'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {currentJob ? `${currentJob.companyName} • ${currentJob.field}` : 'Search job market below to apply.'}
                </p>
                {employerCompany && <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold"><span className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">Revenue ${(employerCompany.monthlyRevenue / 1e6).toFixed(1)}M/mo</span><span className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">Employees {employerCompany.employeesCount.toLocaleString()}</span><span className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-300">{employerCompany.isPublic ? `${employerCompany.ticker} $${employerCompany.sharePrice.toFixed(2)}` : 'Private Company'}</span></div>}
              </div>

              {currentJob && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Monthly Compensation</span>
                  <div className="text-lg font-black text-emerald-400">
                    ${(currentJob.monthlySalary || 0).toLocaleString()}/mo
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Annual: ${((currentJob.monthlySalary || 0) * 12).toLocaleString()}/yr
                  </div>
                </div>
              )}
            </div>

            {currentJob && workplace && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Performance</span>
                  <div className="font-black text-emerald-400 text-sm mt-0.5">{Math.round(currentJob.performance)}%</div>
                </div>
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Work Stress</span>
                  <div className="font-black text-orange-400 text-sm mt-0.5">{currentJob.stressLevel}/100</div>
                </div>
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Work Culture</span>
                  <div className="font-bold text-zinc-200 text-xs mt-0.5 truncate">{workplace.workplaceCulture}</div>
                </div>
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Team Morale</span>
                  <div className="font-black text-sky-400 text-sm mt-0.5">{workplace.teamMorale}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Manager 1-on-1 Card */}
          {currentJob && workplace && (
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black">
                    {workplace.managerName[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-zinc-100">{workplace.managerName}</h4>
                    <span className="text-[11px] text-zinc-400 font-medium">Direct Line Manager • Favor: {workplace.managerPerception}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleManagerAction('mentorship')}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    1-on-1 Sync
                  </button>
                  <button
                    onClick={() => handleManagerAction('raise')}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Request Raise
                  </button>
                  <button
                    onClick={() => handleManagerAction('promotion')}
                    className="px-3 py-1.5 bg-amber-400 text-zinc-950 hover:bg-amber-300 rounded-xl text-xs font-black transition-all cursor-pointer"
                  >
                    Seek Promotion
                  </button>
                </div>
              </div>

              <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-3">
                <div><div className="text-[10px] text-zinc-500 uppercase font-bold">Supervisor</div><div className="text-sm font-black text-zinc-100">{workplace.supervisorName}</div><div className="text-[10px] text-zinc-500">Operational oversight • use your performance and team relationships to build trust.</div></div>
                <button onClick={() => { workplace.managerTrust = Math.min(100, workplace.managerTrust + 2); workplace.teamPerformance = Math.min(100, workplace.teamPerformance + 1); showFeedback(`🧭 Supervisor check-in completed with ${workplace.supervisorName}.`); }} className="px-3 py-2 bg-zinc-800 rounded-xl text-xs font-bold">Supervisor Check-in</button>
              </div>

              {/* Colleague Roster */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Colleagues & Department Peers
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {workplace.colleagues.map(colleague => (
                    <div key={colleague.id} className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-extrabold text-xs text-zinc-100">{colleague.name}</div>
                          <div className="text-[10px] text-zinc-400">{colleague.role} ({colleague.tier})</div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {colleague.relationshipWithPlayer}% Rel
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {(['coffee','praise','lunch','gift','complain','date'] as const).map(action => <button key={action} onClick={() => handleColleagueAction(colleague, action)} className="py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[9px] font-bold capitalize">{action}</button>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. JOB MARKET & LADDERS TAB */}
      {activeTab === 'market' && (
        <div className="space-y-4">
          {/* Industry Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {industriesList.map(ind => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedIndustry === ind
                    ? 'bg-amber-400 text-zinc-950 font-black shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Live ASX Job Market */}
          {vacancies.length > 0 && <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between"><div><h4 className="text-sm font-black text-zinc-100">Live Company Vacancies</h4><p className="text-[10px] text-zinc-500">Vacancies are generated by company growth and liquidity conditions, not by a static list.</p></div><span className="text-[10px] font-bold text-emerald-400">{vacancies.length} OPEN</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">{vacancies.slice(0, 12).map(v => <div key={v.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="flex justify-between gap-2"><div><div className="text-xs font-black text-zinc-100">{v.title}</div><div className="text-[10px] text-amber-400">{v.companyName} • {v.field}</div></div><span className="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded">Tier {v.tier}</span></div><div className="grid grid-cols-3 gap-2 mt-2 text-[10px]"><span>Salary<br/><b className="text-emerald-400">${v.salaryMonthly.toLocaleString()}</b></span><span>Hours<br/><b>{v.workingHoursWeekly}/wk</b></span><span>Req.<br/><b>Int {v.requiredIntelligence}</b></span></div><button onClick={() => startInterview(v.id)} className="w-full mt-2 py-2 rounded-lg bg-amber-400 text-zinc-950 text-[10px] font-black">Start 3-Question Interview</button></div>)}</div>
          </div>}

          {activeInterview && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"><div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4"><div className="flex items-start justify-between"><div><div className="text-[10px] text-amber-400 uppercase font-bold">Corporate Interview</div><h3 className="text-lg font-black text-zinc-100">Question {activeInterview.currentQuestionIndex + 1} of {activeInterview.questions.length}</h3><div className="text-[10px] text-zinc-500 mt-1">The interview adapts to your career, reputation and living-world experience.</div></div><button onClick={()=>setActiveInterview(null)} className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-bold">Close</button></div><p className="text-sm font-bold text-zinc-200">{activeInterview.questions[activeInterview.currentQuestionIndex]?.prompt}</p><div className="space-y-2">{activeInterview.questions[activeInterview.currentQuestionIndex]?.options.map((option: any, i: number) => <button key={i} onClick={() => answerInterview(i)} className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-400/50 text-left text-xs font-bold text-zinc-200">{option.text}</button>)}</div></div></div>}

          {/* Career Ladders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCareers.map(career => (
              <div key={career.field} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3.5 shadow-md">
                <button onClick={() => setExpandedFields(prev => ({...prev, [career.field]: !(prev[career.field] ?? true)}))} className="w-full flex items-center justify-between border-b border-zinc-800 pb-2.5 text-left">
                  <h4 className="font-black text-sm text-zinc-100 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    {career.field}
                  </h4>
                  <span className="text-[11px] text-zinc-400 font-bold">{career.levels.length} Tiers · {(expandedFields[career.field] ?? true) ? 'Collapse' : 'Expand'}</span>
                </button>

                {(expandedFields[career.field] ?? true) && <div className="space-y-2">
                  {career.levels.map(tier => {
                    const isCurrent = currentJob?.title === tier.title;
                    const hasIntel = character.attributes.intelligence >= tier.intelligenceReq;
                    const hasRep = character.attributes.reputation >= tier.reputationReq;
                    const canApply = hasIntel && hasRep && !isCurrent;

                    return (
                      <div
                        key={tier.title}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-zinc-200">{tier.title}</span>
                            <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">{tier.level}</span>
                          </div>
                          <div className="text-[11px] font-mono text-emerald-400 font-bold">
                            ${tier.salaryMonthly.toLocaleString()}/mo • {tier.hours}h/wk
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Reqs: Intellect ≥{tier.intelligenceReq} • Reputation ≥{tier.reputationReq} • Edu: {tier.educationReq}
                          </div>
                        </div>

                        <div>
                          {isCurrent ? (
                            <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg">
                              Current
                            </span>
                          ) : (
                            <button
                              disabled={!canApply}
                              onClick={() => {
                                onApplyJob({
                                  title: tier.title,
                                  field: career.field,
                                  level: tier.level,
                                  companyName: `${career.field.split(' ')[0]} Holdings`,
                                  monthlySalary: tier.salaryMonthly,
                                  monthlyBonusPotential: Math.round(tier.salaryMonthly * 0.2),
                                  stressLevel: tier.stress,
                                  workingHoursWeekly: tier.hours,
                                  reputationRequired: tier.reputationReq,
                                  intelligenceRequired: tier.intelligenceReq,
                                  educationRequired: tier.educationReq,
                                  startAge: character.age,
                                  performance: 70
                                });
                                showFeedback(`Hired as ${tier.title}! Welcome to your new role.`);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                canApply
                                  ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black shadow'
                                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                              }`}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'licensing' && (
        <ExpandedCareerSection state={state} />
      )}
    </div>
  );
};
