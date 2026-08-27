import React, { useState } from 'react';
import { GameState, DelayedConsequence } from '../types';
import { Clock, Calendar, CheckCircle2, AlertCircle, XCircle, ChevronRight, Layers, ArrowUpRight, Zap } from 'lucide-react';

interface DelayedConsequencesTrackerProps {
  state: GameState;
}

export const DelayedConsequencesTracker: React.FC<DelayedConsequencesTrackerProps> = ({ state }) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Executed' | 'Failed'>('Pending');
  const delayedList = state.delayedConsequences || [];

  const filteredList = delayedList.filter(item => {
    if (filter === 'All') return true;
    return item.status === filter;
  });

  const pendingCount = delayedList.filter(i => i.status === 'Pending').length;
  const executedCount = delayedList.filter(i => i.status === 'Executed').length;

  return (
    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-black text-zinc-100">Delayed Consequences Scheduler (Phase 6)</h4>
          <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
            {pendingCount} Scheduled
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          {(['Pending', 'Executed', 'Failed', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                filter === tab
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="text-center py-8 bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800">
          <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-60" />
          <p className="text-xs font-semibold text-zinc-400">No {filter.toLowerCase()} delayed consequences.</p>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
            Strategic M&A investments, leveraged buyouts, R&D projects, and angel syndications schedule downstream consequences that mature after 1, 3, 6, or 12 months.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredList.map((item) => {
            const monthsLeft = Math.max(0, item.executeTick - state.simulationTick);
            const isDueNow = monthsLeft === 0 && item.status === 'Pending';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                  item.status === 'Executed'
                    ? 'bg-zinc-950/60 border-zinc-800 opacity-80'
                    : item.status === 'Failed'
                    ? 'bg-red-950/10 border-red-900/30 opacity-70'
                    : isDueNow
                    ? 'bg-emerald-950/30 border-emerald-500/50 animate-pulse'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-100">{item.source}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          item.status === 'Pending'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : item.status === 'Executed'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {item.status === 'Pending' ? (monthsLeft === 0 ? 'Due Next Month' : `In ${monthsLeft} Month${monthsLeft > 1 ? 's' : ''}`) : item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{item.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono text-zinc-300 font-semibold flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      Month {item.executeAtMonth}, {item.executeAtYear}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Scheduled: Tick #{item.scheduledTick}
                    </div>
                  </div>
                </div>

                {/* Consequences breakdown */}
                {item.consequences.length > 0 && (
                  <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800/80 space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Scheduled Impact:
                    </span>
                    {item.consequences.map((c, idx) => (
                      <div key={idx} className="text-[10px] text-emerald-400/90 flex items-center gap-1 font-mono">
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                        <span>{c.description || `${c.target} ${c.type} (${c.operation} ${c.value})`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
