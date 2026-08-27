import React, { useState } from 'react';
import { GameState, SportsTeam } from '../../types';
import { SPORTS_TEAMS_AVAILABLE } from '../../data/catalogs';
import { 
  Trophy, 
  Award, 
  DollarSign, 
  Users, 
  Plus, 
  Play, 
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface SportsHubProps {
  state: GameState;
  onBuySportsTeam: (teamTemplate: any) => void;
  onHireCoach: (teamId: string, coachName: string) => void;
  onSignStarPlayer: (teamId: string, playerName: string, fee: number) => void;
  onAdjustTicketPrice: (teamId: string, newPrice: number) => void;
}

export const SportsHub: React.FC<SportsHubProps> = ({
  state,
  onBuySportsTeam,
  onHireCoach,
  onSignStarPlayer,
  onAdjustTicketPrice
}) => {
  const { sports, finances } = state;
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(sports.ownedTeams[0]?.id || null);

  const selectedTeam = sports.ownedTeams.find(t => t.id === selectedTeamId) || sports.ownedTeams[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Sports Empire & Franchise Management
          </span>
          <h3 className="text-xl font-black text-zinc-100 mt-0.5">
            {sports.ownedTeams.length} Owned Sports Franchise{sports.ownedTeams.length === 1 ? '' : 's'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Acquire professional sports clubs, sign world-class athletes, upgrade stadiums, and win league championships.
          </p>
        </div>
      </div>

      {/* Owned Teams */}
      {sports.ownedTeams.length > 0 && selectedTeam && (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h4 className="text-lg font-black text-zinc-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  {selectedTeam.name}
                </h4>
                <span className="text-xs text-zinc-400 font-medium">
                  {selectedTeam.sport} • {selectedTeam.city} • Head Coach: <b className="text-zinc-200">{selectedTeam.headCoachName}</b>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Franchise Value</span>
                <div className="text-base sm:text-lg font-black text-amber-300">
                  ${(selectedTeam.valuation / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>

            {/* League Standings & Performance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">League Position</span>
                <div className="text-base font-black text-amber-400 mt-0.5">
                  #{selectedTeam.leaguePosition} / {selectedTeam.totalTeamsInLeague}
                </div>
              </div>

              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Match Record (W-D-L)</span>
                <div className="text-base font-black text-emerald-400 mt-0.5">
                  {selectedTeam.matchesWon} - {selectedTeam.matchesDrawn} - {selectedTeam.matchesLost}
                </div>
              </div>

              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Squad Performance</span>
                <div className="text-base font-black text-zinc-100 mt-0.5">
                  {Math.round(selectedTeam.teamPerformanceScore)}%
                </div>
              </div>

              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Monthly Net Income</span>
                <div className={`text-base font-black mt-0.5 ${(selectedTeam.monthlyNetIncome || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${(selectedTeam.monthlyNetIncome || 0).toLocaleString()}/mo
                </div>
              </div>
            </div>

            {selectedTeam.recentMatchResult && (
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span><b>Latest Fixture:</b> {selectedTeam.recentMatchResult}</span>
              </div>
            )}

            {/* Management Actions */}
            <div className="flex flex-wrap gap-2.5 pt-2 border-t border-zinc-800">
              <button
                onClick={() => onSignStarPlayer(selectedTeam.id, 'Julian Morales', 12000000)}
                disabled={finances.cash < 12000000}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 active:scale-[0.99] disabled:bg-zinc-950 disabled:text-zinc-600 text-zinc-100 font-bold text-xs border border-zinc-700 shadow-sm transition-all"
              >
                Sign Elite Star Player ($12M Fee • +Performance)
              </button>

              <button
                onClick={() => onHireCoach(selectedTeam.id, 'Jose Mancini')}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-zinc-100 font-bold text-xs border border-zinc-700 transition-all"
              >
                Appoint Master Coach
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Teams to Acquire */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Franchises Available for Acquisition
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SPORTS_TEAMS_AVAILABLE.map(team => {
            const isOwned = sports.ownedTeams.some(t => t.name === team.name);
            const canAfford = finances.cash >= team.valuation;

            return (
              <div key={team.name} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-black text-sm text-zinc-100">{team.name}</h5>
                    <span className="text-[11px] text-amber-400 font-bold">{team.sport} • {team.city}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">Valuation</span>
                    <div className="text-sm font-black text-amber-300">
                      ${(team.valuation / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <span>Fan Base: <b className="text-zinc-200">{(team.fanBaseThousands / 1000).toFixed(1)}M Fans</b></span>
                  <span>Projected Yield: <b className="text-emerald-400 font-bold">+${(team.monthlyNetIncome / 1000).toFixed(0)}k/mo</b></span>
                </div>

                <button
                  onClick={() => onBuySportsTeam(team)}
                  disabled={isOwned || !canAfford}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    !isOwned && canAfford
                      ? 'bg-zinc-800 hover:bg-zinc-750 active:scale-[0.99] text-zinc-100 border border-zinc-700'
                      : 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed'
                  }`}
                >
                  {isOwned ? 'Franchise Owned' : canAfford ? `Acquire 100% Franchise ($${(team.valuation / 1000000).toFixed(1)}M)` : 'Insufficient Funds'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
