import React from 'react';
import { GameState, ConditionGroup, StateCondition } from '../types';
import { getSystemicConditionalRules } from '../engine/conditionalRules';
import { evaluateConditionLogic, extractStateValue } from '../engine/consequenceEngine';
import { ShieldAlert, CheckCircle2, AlertTriangle, Cpu, ArrowRight, Zap } from 'lucide-react';

interface ConditionalRulesMonitorProps {
  state: GameState;
}

export const ConditionalRulesMonitor: React.FC<ConditionalRulesMonitorProps> = ({ state }) => {
  const rules = getSystemicConditionalRules(state);

  return (
    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-black text-zinc-100">Conditional Consequence Engine (Phase 5)</h4>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
          Real Game State Rules
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rules.map((rule) => {
          const isActive = evaluateConditionLogic(state, rule.condition);
          const isGroup = 'conditions' in rule.condition;
          const conditionsList: StateCondition[] = isGroup ? (rule.condition as ConditionGroup).conditions : [rule.condition as StateCondition];
          const groupLogic = isGroup ? (rule.condition as ConditionGroup).logic : 'AND';

          return (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                isActive
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                  : 'bg-zinc-950/70 border-zinc-800/80 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                    {rule.name}
                  </h5>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{rule.description}</p>
                </div>
                <div
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 border shrink-0 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Zap className="w-3 h-3 text-amber-400" />
                      Condition Met
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-zinc-500" />
                      Inactive
                    </>
                  )}
                </div>
              </div>

              {/* Condition Expressions Breakdown */}
              <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-[11px] space-y-1.5 font-mono">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block font-sans">
                  Logical Criteria ({groupLogic}):
                </span>
                {conditionsList.map((cond, idx) => {
                  const currVal = extractStateValue(state, cond);
                  let formattedCurrVal = String(currVal ?? '');
                  if (typeof currVal === 'number' && !isNaN(currVal)) {
                    if (cond.property.toLowerCase().includes('debt') || cond.property.toLowerCase().includes('cash') || cond.property.toLowerCase().includes('networth') || cond.property.toLowerCase().includes('revenue')) {
                      formattedCurrVal = `$${(currVal || 0).toLocaleString()}`;
                    } else if (cond.property.toLowerCase().includes('rate')) {
                      formattedCurrVal = `${currVal}%`;
                    }
                  }

                  let formattedTarget = String(cond.value ?? '');
                  if (typeof cond.value === 'number' && !isNaN(cond.value)) {
                    if (cond.property.toLowerCase().includes('debt') || cond.property.toLowerCase().includes('cash') || cond.property.toLowerCase().includes('networth') || cond.property.toLowerCase().includes('revenue')) {
                      formattedTarget = `$${(cond.value || 0).toLocaleString()}`;
                    } else if (cond.property.toLowerCase().includes('rate')) {
                      formattedTarget = `${cond.value}%`;
                    }
                  }

                  return (
                    <div key={idx} className="flex items-center justify-between text-zinc-300">
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-amber-400 font-semibold">{cond.target}.{cond.property}</span>
                        <span className="text-zinc-500">{cond.operator}</span>
                        <span className="text-zinc-200">{formattedTarget}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-sans ml-2 shrink-0">
                        Current: <b className="text-zinc-200">{formattedCurrVal}</b>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Consequences */}
              {rule.consequences.length > 0 && (
                <div className="text-[11px] space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                    Triggered Consequence Impact:
                  </span>
                  <div className="space-y-1">
                    {rule.consequences.map((c, cIdx) => (
                      <div key={cIdx} className="text-[10px] text-zinc-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>{c.description || `${c.target} ${c.type} (${c.operation} ${c.value})`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
