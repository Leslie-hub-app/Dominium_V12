import React, { useState } from 'react';
import { GameState, DynastyTimelineEvent, DynastyTimelineCategory } from '../../types';
import { 
  Clock, 
  Crown, 
  Building2, 
  Coins, 
  Landmark, 
  Heart, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';

interface DynastyTimelineViewProps {
  state: GameState;
}

export const DynastyTimelineView: React.FC<DynastyTimelineViewProps> = ({ state }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const timeline = state.dynastyProfile?.timeline || [];

  const getCategoryIcon = (cat: DynastyTimelineCategory) => {
    switch (cat) {
      case 'FOUNDING': return <Crown className="w-4 h-4 text-amber-400" />;
      case 'ACQUISITION': return <Coins className="w-4 h-4 text-emerald-400" />;
      case 'PROJECT': return <Building2 className="w-4 h-4 text-cyan-400" />;
      case 'POLITICAL': return <Landmark className="w-4 h-4 text-indigo-400" />;
      case 'FAMILY_MILESTONE': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'SCANDAL': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'SUCCESSION': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'PHILANTHROPY': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'CRISIS': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Sparkles className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getSignificanceColor = (sig?: string) => {
    switch (sig) {
      case 'Historic': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Major': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Milestone': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const filteredTimeline = timeline.filter(event => {
    const matchesCategory = selectedCategory === 'ALL' || event.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.characterName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-zinc-300">
      {/* Header & Controls */}
      <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Living Historical Annals
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{timeline.length} Registered Events</span>
          </div>
          <h3 className="text-xl font-black text-zinc-100 font-serif">
            The Dynasty Timeline
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            A permanent chronological chronicle documenting founding milestones, corporate conquests, political triumphs, scandals, and successions.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chronicle..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-400/60"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
        {[
          { key: 'ALL', label: 'All Chronicles' },
          { key: 'FOUNDING', label: 'Founding' },
          { key: 'ACQUISITION', label: 'Acquisitions & Wealth' },
          { key: 'PROJECT', label: 'Megaprojects' },
          { key: 'POLITICAL', label: 'Politics & Governance' },
          { key: 'FAMILY_MILESTONE', label: 'Family Milestones' },
          { key: 'SCANDAL', label: 'Scandals & Crises' },
          { key: 'SUCCESSION', label: 'Succession Transitions' },
          { key: 'PHILANTHROPY', label: 'Philanthropy' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedCategory === tab.key
                ? 'bg-amber-400 text-zinc-950 shadow'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      {filteredTimeline.length > 0 ? (
        <div className="relative border-l-2 border-zinc-800 ml-4 sm:ml-6 space-y-6 pl-6 sm:pl-8 py-2">
          {filteredTimeline.map(event => (
            <div key={event.id} className="relative group">
              {/* Node Icon on Timeline Axis */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-700 flex items-center justify-center shadow-lg group-hover:border-amber-400 transition-colors">
                {getCategoryIcon(event.category)}
              </div>

              {/* Event Card */}
              <div className="bg-zinc-900/80 hover:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800/90 shadow-md space-y-2.5 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Month {event.month}, Year {event.year}
                    </span>
                    <span className="text-[10px] font-extrabold text-zinc-400">
                      Gen {event.generation} • {event.characterName}
                    </span>
                  </div>

                  {event.significance && (
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getSignificanceColor(event.significance)}`}>
                      {event.significance}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-zinc-100">{event.title}</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed mt-1">{event.description}</p>
                </div>

                {event.metricsChange && (
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{event.metricsChange}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/60 p-10 rounded-2xl border border-zinc-800 text-center space-y-2">
          <Clock className="w-8 h-8 text-zinc-500 mx-auto" />
          <h4 className="font-bold text-sm text-zinc-300">No Historical Records Found</h4>
          <p className="text-xs text-zinc-500">
            No events match the selected category filter or search term.
          </p>
        </div>
      )}
    </div>
  );
};
