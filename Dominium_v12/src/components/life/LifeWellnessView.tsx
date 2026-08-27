import React, { useState } from 'react';
import { GameState } from '../../types';
import { WELLNESS_ACTIVITIES_CATALOG } from '../../data/lifeCatalogs';
import { ensureLifeSystemState, performWellnessAction } from '../../engine/lifeEngine';
import { 
  HeartPulse, 
  Smile, 
  Sparkles, 
  Flame, 
  Brain, 
  DollarSign, 
  CheckCircle2,
  Star
} from 'lucide-react';

interface LifeWellnessViewProps {
  state: GameState;
}

export const LifeWellnessView: React.FC<LifeWellnessViewProps> = ({
  state
}) => {
  ensureLifeSystemState(state);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePerform = (activityId: string) => {
    const res = performWellnessAction(state, activityId);
    showFeedback(res.message);
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 bg-zinc-900 border border-emerald-400/40 rounded-xl text-xs font-bold text-emerald-300 shadow-lg flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Health & Vitality</span>
            <h3 className="text-lg font-black text-zinc-100">Wellness & Psychological Regeneration</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Available Cash</span>
            <div className="text-sm font-black text-emerald-400">${state.finances.cash.toLocaleString()}</div>
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          Regular physical exercise, mental decompression, and image refinement directly protect against burnout and elevate life satisfaction.
        </p>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {WELLNESS_ACTIVITIES_CATALOG.map(act => (
          <div key={act.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-100">{act.name}</h4>
                  <span className="text-[10px] text-zinc-400">{act.category}</span>
                </div>
                <span className="text-xs font-black text-amber-400 font-mono">
                  ${act.cost.toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-zinc-400">{act.description}</p>

              {/* Stat Deltas Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {act.healthDelta > 0 && (
                  <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                    +{act.healthDelta} Health
                  </span>
                )}
                {act.happinessDelta > 0 && (
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                    +{act.happinessDelta} Happiness
                  </span>
                )}
                {act.stressDelta < 0 && (
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {act.stressDelta} Stress
                  </span>
                )}
                {act.attractivenessDelta && act.attractivenessDelta > 0 && (
                  <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
                    +{act.attractivenessDelta} Attractiveness
                  </span>
                )}
                {act.charmDelta && act.charmDelta > 0 && (
                  <span className="text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded">
                    +{act.charmDelta} Charm
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handlePerform(act.id)}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Engage (${act.cost.toLocaleString()})</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
