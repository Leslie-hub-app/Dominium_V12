import React, { useState } from 'react';
import { GameState, DynastySuccessionPlan } from '../types';
import { 
  Crown, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  Award, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Building2, 
  Landmark, 
  Users, 
  Coins, 
  Scale, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { 
  calculateNetWorth, 
  generateLegacyReport, 
  simulateSuccessionDynamics 
} from '../engine/simulationEngine';
import { LegacyReportModal } from './LegacyReportModal';

interface DynastySuccessionModalProps {
  state: GameState;
  onContinueAsHeir: (customPlan?: DynastySuccessionPlan) => void;
}

export const DynastySuccessionModal: React.FC<DynastySuccessionModalProps> = ({
  state,
  onContinueAsHeir
}) => {
  const [showFullLegacy, setShowFullLegacy] = useState(false);
  const [activePlan, setActivePlan] = useState<DynastySuccessionPlan>(
    state.dynastyProfile?.successionPlan || {
      primaryHeirId: state.dynastyHeirId,
      businessSuccessorId: state.dynastyHeirId,
      politicalSuccessorId: state.dynastyHeirId,
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

  const netWorth = calculateNetWorth(state);
  const legacyReport = generateLegacyReport(state);
  const { scores } = legacyReport;

  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const selectedHeir = children.find(r => r.id === (activePlan.primaryHeirId || state.dynastyHeirId)) || children[0];

  const dynamics = simulateSuccessionDynamics(state, activePlan);

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'S+': return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950';
      case 'S': return 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950';
      case 'A': return 'bg-gradient-to-r from-emerald-400 to-teal-500 text-zinc-950';
      case 'B': return 'bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950';
      case 'C': return 'bg-gradient-to-r from-violet-400 to-purple-500 text-zinc-950';
      default: return 'bg-zinc-700 text-zinc-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#121215] border border-amber-500/40 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[94vh] overflow-y-auto">
        {/* Header Crown */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-600/30 border border-amber-500/50 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
            <Crown className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
              Dynastic Succession • Generation {state.dynastyGeneration + 1}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 font-serif">
              The Passing of the Sovereign Mantle
            </h2>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
              The era of <b className="text-zinc-200">{state.character.firstName} {state.character.lastName}</b> concludes. A lifetime of enterprise, lineage, and power is now bestowed upon the next generation.
            </p>
          </div>
        </div>

        {/* Predecessor Legacy Summary Banner */}
        <div className="bg-zinc-900/90 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`px-2.5 py-1 rounded-lg font-black text-sm font-mono shadow ${getGradeBadge(scores.legacyGrade)}`}>
                Grade {scores.legacyGrade}
              </div>
              <div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Predecessor Epitaph</div>
                <div className="text-xs sm:text-sm font-black text-amber-300">"{scores.legacyTitle}"</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">Legacy Score</div>
              <div className="text-base sm:text-lg font-black text-zinc-100 font-mono">
                {scores.totalLegacyScore} <span className="text-xs text-zinc-500">/ 1000</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-300 italic line-clamp-2">
            "{legacyReport.lifeSummary}"
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
            <span className="text-zinc-400">
              Final Estate: <b className="text-emerald-400 font-mono">${netWorth.toLocaleString()}</b>
            </span>
            <button
              onClick={() => setShowFullLegacy(true)}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Full Legacy Report</span>
            </button>
          </div>
        </div>

        {/* Succession Forecast & Risk Card */}
        <div className={`p-4 sm:p-5 rounded-2xl border ${
          dynamics.outcome === 'Triumphant Coronation' || dynamics.outcome === 'Smooth Transition'
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            : dynamics.outcome === 'Contested Will'
            ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
            : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
        } space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              {dynamics.outcome === 'Triumphant Coronation' || dynamics.outcome === 'Smooth Transition' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
              Succession Forecast: {dynamics.outcome}
            </span>
            <span className="text-xs font-mono font-black">
              Stability: {dynamics.stabilityScore}%
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {dynamics.summaryExplanation}
          </p>
          {dynamics.contestedReasons.length > 0 && (
            <div className="text-[11px] text-rose-300/90 pt-1.5 border-t border-zinc-800/60 space-y-1">
              <span className="font-bold">Friction Points:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {dynamics.contestedReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Designated Heir Card */}
        {selectedHeir ? (
          <div className="bg-zinc-950/90 p-5 rounded-2xl border border-zinc-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Chosen Successor
                </span>
                <h3 className="font-black text-base text-zinc-100">{selectedHeir.name}</h3>
                <div className="text-xs text-zinc-400">
                  {selectedHeir.relation} • Age {selectedHeir.age} • {selectedHeir.occupation || 'Heir Apparent'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Heir Key Attributes */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Leadership</span>
                <span className="font-bold font-mono text-zinc-200">{selectedHeir.leadership || 75}/100</span>
              </div>
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Business</span>
                <span className="font-bold font-mono text-cyan-300">{selectedHeir.businessAbility || 70}/100</span>
              </div>
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block uppercase">Loyalty</span>
                <span className="font-bold font-mono text-emerald-400">{selectedHeir.loyalty || 80}/100</span>
              </div>
            </div>

            {/* Inheritance Distribution Breakdown */}
            <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 text-[11px] space-y-1.5 text-zinc-300">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Will Financial Split
              </span>
              <div className="flex items-center justify-between">
                <span>Primary Heir ({selectedHeir.name}):</span>
                <b className="font-mono text-emerald-400">{activePlan.financialInheritance.primaryHeirPercent}%</b>
              </div>
              <div className="flex items-center justify-between">
                <span>Other Children & Siblings:</span>
                <b className="font-mono text-zinc-300">{activePlan.financialInheritance.otherChildrenPercent}%</b>
              </div>
              <div className="flex items-center justify-between">
                <span>Charity & Philanthropic Foundation:</span>
                <b className="font-mono text-fuchsia-400">{activePlan.financialInheritance.philanthropyPercent}%</b>
              </div>
              <div className="flex items-center justify-between">
                <span>Family Trust Liquidity Reserve:</span>
                <b className="font-mono text-cyan-400">{activePlan.financialInheritance.familyTrustReservePercent}%</b>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 text-xs text-zinc-400 text-center">
            No direct descendant designated. A junior branch collateral heir will step forward to preserve the bloodline.
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onContinueAsHeir(activePlan)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-[0.99] text-zinc-950 font-black text-sm sm:text-base shadow-2xl transition-all flex items-center justify-center gap-2.5"
        >
          <span>Coronate & Assume Control as Generation {state.dynastyGeneration + 1}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Full Legacy Report Modal */}
      {showFullLegacy && (
        <LegacyReportModal
          state={state}
          report={legacyReport}
          onClose={() => setShowFullLegacy(false)}
        />
      )}
    </div>
  );
};
