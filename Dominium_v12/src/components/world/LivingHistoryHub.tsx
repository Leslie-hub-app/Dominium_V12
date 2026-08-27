import React, { useState } from 'react';
import { GameState, LivingWorldProfile, WorldHistoryEntry } from '../../types';
import { BookOpen, Calendar, Filter, Sparkles, Award, Globe, Landmark, Building2 } from 'lucide-react';
import { ensureLivingWorldProfile } from '../../engine/livingWorldEngine';

interface LivingHistoryHubProps {
  state: GameState;
}

export const LivingHistoryHub: React.FC<LivingHistoryHubProps> = ({ state }) => {
  const lw: LivingWorldProfile = ensureLivingWorldProfile(state);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const historyEntries = [...(lw.worldHistory || [])].reverse();

  const filteredEntries = filterCategory === 'ALL'
    ? historyEntries
    : historyEntries.filter(e => e.category?.toUpperCase() === filterCategory);

  const categories = ['ALL', 'ECONOMY', 'BUSINESS', 'POLITICS', 'DYNASTY', 'GLOBAL', 'SOCIETY'];

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-[#16161a] border border-zinc-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider">World History & Chronicles</h3>
            <p className="text-xs text-zinc-400">Historical records of major global, economic, and dynastic milestones</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                filterCategory === cat
                  ? 'bg-amber-400 text-zinc-950 font-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* History Timeline Stream */}
      <div className="space-y-2.5">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry, idx) => (
            <div
              key={idx}
              className="bg-[#16161a] border border-zinc-800/80 rounded-2xl p-4 shadow hover:border-zinc-700 transition-all space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                    entry.significance === 'Historical' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                    entry.significance === 'Major' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {entry.significance}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    {entry.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>Month {entry.month}, {entry.year} (Tick {entry.tick})</span>
                </div>
              </div>

              <h4 className="text-sm font-black text-zinc-100">{entry.headline}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{entry.summary}</p>

              {entry.affectedDomains && entry.affectedDomains.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {entry.affectedDomains.map((dom, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {dom}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-[#16161a] rounded-2xl border border-zinc-800 text-zinc-500 text-xs">
            No history entries match the selected category.
          </div>
        )}
      </div>
    </div>
  );
};
