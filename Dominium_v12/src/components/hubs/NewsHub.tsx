import React, { useState } from 'react';
import { GameState, NewsItem, NewsImportance } from '../../types';
import { Newspaper, Globe, TrendingUp, Landmark, Award, Cpu, Filter, Link2, Flame, AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';

interface NewsHubProps {
  state: GameState;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const NewsHub: React.FC<NewsHubProps> = ({ state }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedImportance, setSelectedImportance] = useState<string>('All');

  const categories = ['All', 'Business', 'Economy', 'Politics', 'Sports', 'Celebrity', 'Tech', 'World'];
  const importanceFilters: ('All' | NewsImportance)[] = ['All', 'BREAKING', 'MAJOR', 'NORMAL', 'MINOR'];

  const filteredNews = state.newsArchive.filter(n => {
    const categoryMatch = selectedCategory === 'All' || n.category.toLowerCase() === selectedCategory.toLowerCase();
    const importanceMatch = selectedImportance === 'All' || (n.importance || 'NORMAL').toUpperCase() === selectedImportance.toUpperCase();
    return categoryMatch && importanceMatch;
  });

  const getImportanceBadge = (importance: NewsImportance = 'NORMAL') => {
    switch (importance) {
      case 'BREAKING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-950/90 border border-red-600/80 text-red-300 shadow-sm animate-pulse">
            <Flame className="w-3 h-3 text-red-400" />
            BREAKING
          </span>
        );
      case 'MAJOR':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/70 text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            MAJOR
          </span>
        );
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-950/60 border border-sky-700/50 text-sky-300">
            <Info className="w-3 h-3 text-sky-400" />
            NORMAL
          </span>
        );
      case 'MINOR':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400">
            MINOR
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col gap-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-400">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dominium Global Gazette</span>
              <h3 className="text-base sm:text-lg font-black text-zinc-100 mt-0.5">Live Global Media & Consequence Dispatches</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-500 font-bold">Total Articles:</span>
            <span className="font-black text-zinc-200">{state.newsArchive.length}</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-zinc-500 uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Sector:
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Importance Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-zinc-500 uppercase mr-1">
              Priority:
            </span>
            {importanceFilters.map(imp => (
              <button
                key={imp}
                onClick={() => setSelectedImportance(imp)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  selectedImportance === imp
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-zinc-950/80 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {imp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Articles Stream */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800 text-center text-xs text-zinc-500">
            No media dispatches recorded for category '{selectedCategory}' and importance '{selectedImportance}'. Advance simulation to generate factual market dispatches.
          </div>
        ) : (
          filteredNews.map(item => (
            <article 
              key={item.id}
              className={`p-5 rounded-2xl border transition-all shadow-md space-y-3 ${
                item.importance === 'BREAKING'
                  ? 'bg-zinc-900/95 border-red-800/60 shadow-red-950/20'
                  : item.importance === 'MAJOR'
                  ? 'bg-zinc-900/90 border-amber-800/40'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  {getImportanceBadge(item.importance || (item.severity === 'Breaking' ? 'BREAKING' : 'NORMAL'))}
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 uppercase tracking-wider">
                    {item.category}
                  </span>
                  {item.source && (
                    <span className="text-[10px] text-zinc-500 font-medium hidden sm:inline">
                      • {item.source}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {(item.relatedEventId || item.relatedDecisionId) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/40 text-amber-400">
                      <Link2 className="w-2.5 h-2.5" /> Linked Event
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-400 font-bold">
                    {MONTH_NAMES[item.month - 1]} {item.year}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h4 className="text-sm sm:text-base font-black text-zinc-100 leading-snug">
                {item.headline}
              </h4>

              {/* Body */}
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                {item.body}
              </p>

              {/* Impact / Link Detail */}
              {item.impactExplanation && (
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/90 text-[11px] text-zinc-300 font-medium flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span><b className="text-zinc-200">Consequence Analysis:</b> {item.impactExplanation}</span>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
};
