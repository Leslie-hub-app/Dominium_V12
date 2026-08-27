import React, { useState } from 'react';
import { GameState } from '../types';
import { X, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

interface StatusDetailModalProps {
  attributeName?: string | null;
  type?: string | null;
  state: GameState;
  onClose: () => void;
}

export const StatusDetailModal: React.FC<StatusDetailModalProps> = ({
  attributeName,
  type,
  state,
  onClose
}) => {
  const [selectedAttr, setSelectedAttr] = useState<string>(attributeName || type || 'Health');

  const allAttributes = [
    'Health', 'Happiness', 'Reputation', 'Stress',
    'Charm', 'Intelligence', 'Attractiveness', 'World Influence'
  ];

  const keyMap: Record<string, keyof typeof state.character.attributes> = {
    'Health': 'health',
    'Happiness': 'happiness',
    'Intelligence': 'intelligence',
    'Stress': 'stress',
    'Attractiveness': 'attractiveness',
    'Charm': 'charm',
    'Reputation': 'reputation',
    'World Influence': 'worldInfluence'
  };

  const attrKey = keyMap[selectedAttr];
  const value = attrKey ? Math.round(state.character.attributes[attrKey]) : 50;
  const isInverted = selectedAttr === 'Stress';

  const getTier = (val: number, inverted = false) => {
    if (inverted) {
      if (val <= 20) return { label: 'Optimal / Relaxed (Elite)', color: 'text-emerald-400', desc: 'No physiological or psychological strain. Decision clarity is peaked.' };
      if (val <= 45) return { label: 'Manageable (Good)', color: 'text-cyan-400', desc: 'Normal productive pressure.' };
      if (val <= 70) return { label: 'Elevated Pressure (Warning)', color: 'text-amber-400', desc: 'Sleep quality and happiness beginning to decay.' };
      if (val <= 85) return { label: 'Severe Strain (Danger)', color: 'text-orange-400', desc: 'Health deteriorating. Risk of major executive errors.' };
      return { label: 'Critical Burnout Risk', color: 'text-rose-400', desc: 'Forced hospitalization or breakdown imminent if unaddressed.' };
    }
    if (val >= 95) return { label: 'Exceptional / World Class', color: 'text-amber-300', desc: 'Top 1% global pinnacle performance.' };
    if (val >= 80) return { label: 'Elite', color: 'text-emerald-400', desc: 'Outstanding capability recognized by society.' };
    if (val >= 60) return { label: 'Good / Above Average', color: 'text-cyan-400', desc: 'Strong foundation for business and leadership.' };
    if (val >= 40) return { label: 'Average', color: 'text-zinc-300', desc: 'Standard baseline condition.' };
    if (val >= 20) return { label: 'Poor / Struggling', color: 'text-amber-400', desc: 'Requires immediate attention and improvement.' };
    return { label: 'Critical / Severely Affected', color: 'text-rose-400', desc: 'Severe impairments affecting all life systems.' };
  };

  const tier = getTier(value, isInverted);

  // Dynamic causal factors generator
  const getFactors = () => {
    const positive: string[] = [];
    const negative: string[] = [];

    if (selectedAttr === 'Health') {
      if ((state.character?.possessions?.vehicles || []).length > 0) positive.push('Private transport access (+2)');
      if ((state.finances?.cash || 0) > 10000) positive.push('Medical care access (+5)');
      if ((state.character?.attributes?.stress || 0) > 60) negative.push(`High mental stress wear (-${Math.round(state.character.attributes.stress * 0.1)})`);
      if ((state.character?.age || 18) > 45) negative.push(`Natural aging factor (-${Math.round((state.character.age - 45) * 0.3)})`);
    } else if (selectedAttr === 'Happiness') {
      if ((state.relationships || []).some(r => r.love > 75)) positive.push('Close loving relationships (+10)');
      if ((state.finances?.cash || 0) > 25000) positive.push('Financial security (+8)');
      if ((state.character?.attributes?.stress || 0) > 65) negative.push('Overwork & stress pressure (-12)');
      if ((state.character?.attributes?.health || 0) < 40) negative.push('Poor physical health (-10)');
    } else if (selectedAttr === 'Stress') {
      if (state.currentJob) positive.push(`Weekly workload (${state.currentJob.workingHoursWeekly}h/wk) (+${state.currentJob.stressLevel})`);
      if ((state.companies || []).length > 0) positive.push(`Corporate governance overhead (+${state.companies.length * 6})`);
      if ((state.finances?.cash || 0) < 0) positive.push('Overdraft & debt pressure (+15)');
      negative.push('Sleep and relaxation recovery (-5/mo)');
    } else if (selectedAttr === 'World Influence') {
      if (state.politics?.currentOffice?.inOffice) positive.push(`${state.politics.currentOffice.title} Authority (+35)`);
      if ((state.companies || []).length > 0) positive.push(`Business enterprise ownership (+${state.companies.length * 8})`);
      if ((state.sports?.ownedTeams || (state as any).sportsClubs || []).length > 0) positive.push('Sports franchise ownership (+15)');
      if ((state.character?.attributes?.reputation || 0) > 70) positive.push('High social reputation (+12)');
    } else if (selectedAttr === 'Reputation') {
      if (state.currentJob && state.currentJob.level !== 'Intern') positive.push(`${state.currentJob.title} standing (+${Math.round(state.currentJob.reputationRequired / 2)})`);
      if ((state.education || []).some(e => e.completed && e.qualification !== 'Secondary')) positive.push('Accredited degree credentials (+12)');
    } else {
      positive.push('Consistent daily lifestyle & experience (+3)');
    }

    return { positive, negative };
  };

  const { positive, negative } = getFactors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#16161a] border border-zinc-800 w-full max-w-lg rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-base sm:text-lg text-zinc-100">{selectedAttr} Analytics</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close status modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attribute Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {allAttributes.map(attr => (
            <button
              key={attr}
              onClick={() => setSelectedAttr(attr)}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedAttr === attr
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {attr}
            </button>
          ))}
        </div>

        {/* Current State & Value */}
        <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Current Metric</span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-100">{value} <span className="text-xs font-normal text-zinc-500">/ 100</span></div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Status Tier</span>
            <div className={`font-black text-xs sm:text-sm ${tier.color}`}>{tier.label}</div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80">
          {tier.desc}
        </p>

        {/* Causal Breakdown */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Simulation Drivers</h4>

          {positive.length > 0 && (
            <div className="space-y-1 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/60">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Positive Modifiers
              </span>
              <ul className="text-xs text-zinc-300 space-y-1 pl-4 list-disc marker:text-emerald-400">
                {positive.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          {negative.length > 0 && (
            <div className="space-y-1 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/60">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Negative / Strain Factors
              </span>
              <ul className="text-xs text-zinc-300 space-y-1 pl-4 list-disc marker:text-rose-400">
                {negative.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Actions Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] text-zinc-100 text-xs font-bold border border-zinc-700 shadow-md transition-all cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
