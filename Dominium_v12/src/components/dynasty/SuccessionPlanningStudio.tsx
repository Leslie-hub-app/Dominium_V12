import React, { useState } from 'react';
import { 
  GameState, 
  DynastySuccessionPlan, 
  RelationshipPerson, 
  BusinessSuccessionStrategy, 
  PropertyDistributionStrategy, 
  PoliticalHandoverStrategy 
} from '../../types';
import { 
  Crown, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Coins, 
  Landmark, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  UserCheck, 
  FileText,
  Sliders,
  Scale
} from 'lucide-react';
import { simulateSuccessionDynamics } from '../../engine/simulationEngine';

interface SuccessionPlanningStudioProps {
  state: GameState;
  onUpdatePlan: (plan: DynastySuccessionPlan) => void;
  onExecuteSuccession: (plan: DynastySuccessionPlan) => void;
  onOpenLegacyReport: () => void;
}

export const SuccessionPlanningStudio: React.FC<SuccessionPlanningStudioProps> = ({
  state,
  onUpdatePlan,
  onExecuteSuccession,
  onOpenLegacyReport
}) => {
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');

  const [plan, setPlan] = useState<DynastySuccessionPlan>(
    state.dynastyProfile?.successionPlan || {
      primaryHeirId: state.dynastyHeirId || (children[0]?.id || null),
      businessSuccessorId: state.dynastyHeirId || (children[0]?.id || null),
      politicalSuccessorId: state.dynastyHeirId || (children[0]?.id || null),
      businessStrategy: 'Sole Executive Control',
      propertyStrategy: 'Primary Heir Inherits All',
      financialInheritance: {
        primaryHeirPercent: 65,
        otherChildrenPercent: 20,
        philanthropyPercent: 10,
        familyTrustReservePercent: 5
      },
      politicalStrategy: 'Direct Dynastic Endorsement'
    }
  );

  const [savedFeedback, setSavedFeedback] = useState(false);

  // Dynamic simulation evaluation
  const dynamics = simulateSuccessionDynamics(state, plan);
  const primaryHeir = children.find(c => c.id === plan.primaryHeirId) || children[0];

  const handleFinancialChange = (key: keyof DynastySuccessionPlan['financialInheritance'], val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    const newFin = { ...plan.financialInheritance, [key]: clamped };

    // Normalize remainder to sum to 100
    const total = newFin.primaryHeirPercent + newFin.otherChildrenPercent + newFin.philanthropyPercent + newFin.familyTrustReservePercent;
    if (total !== 100 && key !== 'primaryHeirPercent') {
      const diff = 100 - total;
      newFin.primaryHeirPercent = Math.max(0, Math.min(100, newFin.primaryHeirPercent + diff));
    }

    const updatedPlan = { ...plan, financialInheritance: newFin };
    setPlan(updatedPlan);
    onUpdatePlan(updatedPlan);
  };

  const handleSavePlan = () => {
    onUpdatePlan(plan);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const getConflictBadge = (person: RelationshipPerson) => {
    switch (person.conflictStatus) {
      case 'Loyal':
        return <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Loyal Devotee</span>;
      case 'Content':
        return <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Content</span>;
      case 'Disgruntled':
        return <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">Disgruntled</span>;
      case 'Openly Rival':
        return <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">Open Rival</span>;
      case 'Litigious':
        return <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/40">Litigious Threat</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-300">
      {/* Succession Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest flex items-center gap-1">
              <Scale className="w-3 h-3 text-amber-400" /> Dynastic Will & Testament
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              Generation {state.dynastyGeneration} Transition Planning
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-100 font-serif">
            Succession Planning Studio
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Draft your sovereign succession directives. Designate the primary heir, distribute enterprise equity, allocate properties, and guard against family rivalries and corporate fragmentation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenLegacyReport}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Legacy Preview</span>
          </button>

          <button
            onClick={handleSavePlan}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs shadow transition-all flex items-center gap-1.5"
          >
            {savedFeedback ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{savedFeedback ? 'Will Notarized!' : 'Notarize Will'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Succession Forecast Box */}
      <div className={`p-5 rounded-2xl border ${
        dynamics.outcome === 'Triumphant Coronation' || dynamics.outcome === 'Smooth Transition'
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
          : dynamics.outcome === 'Contested Will'
          ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
          : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
      } space-y-2.5`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
            {dynamics.outcome === 'Triumphant Coronation' || dynamics.outcome === 'Smooth Transition' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            Simulated Succession Outcome: {dynamics.outcome}
          </span>
          <span className="text-xs font-mono font-bold">
            Stability Score: {dynamics.stabilityScore}%
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          {dynamics.summaryExplanation}
        </p>

        {dynamics.businessFragmentationRiskPercent > 0 && (
          <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <span>Corporate Fragmentation Risk:</span>
            <b className="font-mono">-{dynamics.businessFragmentationRiskPercent}% Enterprise Value Discount</b>
          </div>
        )}

        {dynamics.contestedReasons.length > 0 && (
          <div className="text-[11px] text-rose-300/90 pt-1 space-y-0.5">
            <span className="font-bold">Risk Factors Detected:</span>
            <ul className="list-disc list-inside space-y-0.5">
              {dynamics.contestedReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Heirs Roster & Attribute Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Heirs Evaluation Roster ({children.length})
          </h4>
          <span className="text-[11px] text-zinc-500">Select torchbearers for dynastic inheritance</span>
        </div>

        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map(child => {
              const isPrimary = plan.primaryHeirId === child.id;
              const isBizSuccessor = plan.businessSuccessorId === child.id;
              const isPolSuccessor = plan.politicalSuccessorId === child.id;

              return (
                <div
                  key={child.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                    isPrimary 
                      ? 'bg-zinc-900 border-amber-500/60 ring-1 ring-amber-500/30 shadow-lg' 
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-sm sm:text-base text-zinc-100">{child.name}</h5>
                        {isPrimary && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" /> PRIMARY HEIR
                          </span>
                        )}
                        {getConflictBadge(child)}
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-cyan-400 font-semibold">{child.relation}</span>
                        <span>•</span>
                        <span>Age {child.age}</span>
                        <span>•</span>
                        <span>{child.occupation || 'Private Citizen'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500 uppercase">Personal Wealth</div>
                      <div className="text-xs font-mono font-bold text-amber-300">
                        ${(child.wealth || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* 4 Core Heir Attributes */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400 block text-[9px]">Leadership</span>
                      <b className="text-amber-400 font-mono font-bold">{child.leadership || 70}/100</b>
                    </div>
                    <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400 block text-[9px]">Business</span>
                      <b className="text-cyan-400 font-mono font-bold">{child.businessAbility || 65}/100</b>
                    </div>
                    <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400 block text-[9px]">Politics</span>
                      <b className="text-indigo-400 font-mono font-bold">{child.politicalAbility || 60}/100</b>
                    </div>
                    <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400 block text-[9px]">Loyalty</span>
                      <b className={`font-mono font-bold ${(child.loyalty || 70) >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {child.loyalty || 70}%
                      </b>
                    </div>
                  </div>

                  {/* Designation Toggles */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-800/80 text-[11px]">
                    <button
                      onClick={() => {
                        const updated = { ...plan, primaryHeirId: child.id };
                        setPlan(updated);
                        onUpdatePlan(updated);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                        isPrimary
                          ? 'bg-amber-400 text-zinc-950 shadow'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      <Crown className="w-3 h-3" />
                      <span>{isPrimary ? 'Primary Heir' : 'Set as Primary'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const updated = { ...plan, businessSuccessorId: child.id };
                        setPlan(updated);
                        onUpdatePlan(updated);
                      }}
                      className={`py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                        isBizSuccessor
                          ? 'bg-cyan-500 text-zinc-950 shadow'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      <Building2 className="w-3 h-3" />
                      <span>{isBizSuccessor ? 'CEO Successor' : 'Appoint CEO'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const updated = { ...plan, politicalSuccessorId: child.id };
                        setPlan(updated);
                        onUpdatePlan(updated);
                      }}
                      className={`py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                        isPolSuccessor
                          ? 'bg-indigo-500 text-zinc-950 shadow'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      <Landmark className="w-3 h-3" />
                      <span>{isPolSuccessor ? 'Political Heir' : 'Political Heir'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 text-center space-y-2">
            <Users className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">
              No children or direct heirs registered. In the event of sudden demise, a junior collateral branch will inherit control.
            </p>
          </div>
        )}
      </div>

      {/* Succession Strategy Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Business Succession Strategy */}
        <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-3">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
            <Building2 className="w-3 h-3 text-cyan-400" /> Corporate Governance
          </span>
          <div className="space-y-1.5">
            {[
              'Sole Executive Control',
              'Shared Board Stewardship',
              'Appoint External Professional CEO',
              'Liquidate & Distribute Cash'
            ].map(strat => (
              <button
                key={strat}
                onClick={() => {
                  const updated = { ...plan, businessStrategy: strat as BusinessSuccessionStrategy };
                  setPlan(updated);
                  onUpdatePlan(updated);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  plan.businessStrategy === strat
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 font-bold'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                {strat}
              </button>
            ))}
          </div>
        </div>

        {/* Real Estate Property Strategy */}
        <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-3">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-400" /> Real Estate Properties
          </span>
          <div className="space-y-1.5">
            {[
              'Primary Heir Inherits All',
              'Equally Distributed Among Children',
              'Liquidated into Cash Estate',
              'Placed in Family Trust'
            ].map(strat => (
              <button
                key={strat}
                onClick={() => {
                  const updated = { ...plan, propertyStrategy: strat as PropertyDistributionStrategy };
                  setPlan(updated);
                  onUpdatePlan(updated);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  plan.propertyStrategy === strat
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 font-bold'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                {strat}
              </button>
            ))}
          </div>
        </div>

        {/* Political Legacy Strategy */}
        <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-3">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
            <Landmark className="w-3 h-3 text-indigo-400" /> Political Legacy
          </span>
          <div className="space-y-1.5">
            {[
              'Direct Dynastic Endorsement',
              'Split Bipartisan Assets',
              'Renounce Political Empire'
            ].map(strat => (
              <button
                key={strat}
                onClick={() => {
                  const updated = { ...plan, politicalStrategy: strat as PoliticalHandoverStrategy };
                  setPlan(updated);
                  onUpdatePlan(updated);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  plan.politicalStrategy === strat
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/50 font-bold'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                {strat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Inheritance Sliders */}
      <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            Financial Inheritance Allocation ({plan.financialInheritance.primaryHeirPercent + plan.financialInheritance.otherChildrenPercent + plan.financialInheritance.philanthropyPercent + plan.financialInheritance.familyTrustReservePercent}%)
          </span>
          <span className="text-[11px] text-zinc-500">Liquid Cash & Accounts Split</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-bold">Primary Heir ({primaryHeir?.name || 'Torchbearer'})</span>
              <span className="font-mono font-bold text-emerald-400">{plan.financialInheritance.primaryHeirPercent}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={plan.financialInheritance.primaryHeirPercent}
              onChange={e => handleFinancialChange('primaryHeirPercent', parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-bold">Other Children & Siblings</span>
              <span className="font-mono font-bold text-cyan-400">{plan.financialInheritance.otherChildrenPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={plan.financialInheritance.otherChildrenPercent}
              onChange={e => handleFinancialChange('otherChildrenPercent', parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-bold">Philanthropic Foundation</span>
              <span className="font-mono font-bold text-fuchsia-400">{plan.financialInheritance.philanthropyPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={plan.financialInheritance.philanthropyPercent}
              onChange={e => handleFinancialChange('philanthropyPercent', parseInt(e.target.value))}
              className="w-full accent-fuchsia-500 cursor-pointer"
            />
          </div>

          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-bold">Family Trust Reserve</span>
              <span className="font-mono font-bold text-amber-400">{plan.financialInheritance.familyTrustReservePercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={5}
              value={plan.financialInheritance.familyTrustReservePercent}
              onChange={e => handleFinancialChange('familyTrustReservePercent', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Step Down and Execute Succession CTA */}
      <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 p-5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
            Executive Dynastic Transition
          </span>
          <h4 className="font-bold text-sm text-zinc-100">
            Step Down & Inaugurate Generation {state.dynastyGeneration + 1}
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Execute the notarized testament now, transferring state leadership to {primaryHeir?.name || 'the chosen heir'}.
          </p>
        </div>

        <button
          onClick={() => onExecuteSuccession(plan)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 active:scale-[0.98] text-zinc-950 font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <span>Coronate Heir Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
