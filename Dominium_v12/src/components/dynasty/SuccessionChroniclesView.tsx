import React from 'react';
import { GameState, SuccessionHistoryRecord } from '../../types';
import { 
  Crown, 
  Award, 
  Coins, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  History 
} from 'lucide-react';

interface SuccessionChroniclesViewProps {
  state: GameState;
}

export const SuccessionChroniclesView: React.FC<SuccessionChroniclesViewProps> = ({ state }) => {
  const history: SuccessionHistoryRecord[] = state.dynastyProfile?.successionHistory || [];

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'Triumphant Coronation':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Triumphant Coronation</span>;
      case 'Smooth Transition':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Smooth Transition</span>;
      case 'Contested Will':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">Contested Will</span>;
      case 'Corporate Fragmentation':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">Corporate Fragmentation</span>;
      case 'Litigious Crisis':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40">Litigious Crisis</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">{outcome}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-300">
      {/* Header */}
      <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest flex items-center gap-1">
            <History className="w-3 h-3 text-amber-400" /> Dynastic Succession Archives
          </span>
          <span className="text-[10px] font-mono text-zinc-400">{history.length} Transitions Logged</span>
        </div>
        <h3 className="text-xl font-black text-zinc-100 font-serif">
          Succession Chronicles
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Archived ledger of sovereign torch transfers across all dynasty generations.
        </p>
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map(record => (
            <div key={record.id} className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 shadow-lg space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
                    G{record.generation}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-zinc-100">{record.predecessorName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-extrabold text-sm sm:text-base text-amber-300">{record.successorName}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Month {record.month}, Year {record.year} • Generation {record.generation} Succession
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getOutcomeBadge(record.outcome)}
                  <div className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-amber-300">
                    Grade {record.legacyGrade} ({record.legacyScore} pts)
                  </div>
                </div>
              </div>

              {/* Transferred Assets Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase">Dynasty Wealth Transferred</span>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    ${(record?.dynastyWealth || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase">Companies Transferred</span>
                  <div className="font-mono font-bold text-indigo-300 mt-0.5">
                    {record.companiesTransferred} Corporations
                  </div>
                </div>
                <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase">Properties Transferred</span>
                  <div className="font-mono font-bold text-amber-300 mt-0.5">
                    {record.propertiesTransferred} Titles
                  </div>
                </div>
                <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase">Corporate Fragmentation</span>
                  <div className={`font-mono font-bold mt-0.5 ${record.businessFragmentationRate ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {record.businessFragmentationRate ? `-${record.businessFragmentationRate}% Discount` : 'None (0%)'}
                  </div>
                </div>
              </div>

              {/* Details & Disgruntled Heirs */}
              {record.details && record.details.length > 0 && (
                <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/80 text-xs space-y-1 text-zinc-300">
                  {record.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              )}

              {record.rivalHeirConflict && (
                <div className="text-[11px] text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Rival Heir Opposition: <b>{record.rivalHeirConflict}</b></span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/60 p-12 rounded-2xl border border-zinc-800 text-center space-y-3">
          <Crown className="w-10 h-10 text-amber-400/50 mx-auto" />
          <h4 className="font-bold text-base text-zinc-200">First Generation in Progress</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            You are currently playing as the founding sovereign of Generation 1. Once succession is executed, comprehensive historical transfer records will be logged here.
          </p>
        </div>
      )}
    </div>
  );
};
