import React from 'react';
import { GameState, DynastyProfile } from '../../types';
import { 
  Crown, 
  Sparkles, 
  Building2, 
  Landmark, 
  Coins, 
  ShieldCheck, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  FileText 
} from 'lucide-react';
import { calculateNetWorth } from '../../engine/simulationEngine';

interface DynastyProfileSectionProps {
  state: GameState;
  onOpenLegacyReport: () => void;
  onOpenSuccessionModal: () => void;
}

export const DynastyProfileSection: React.FC<DynastyProfileSectionProps> = ({
  state,
  onOpenLegacyReport,
  onOpenSuccessionModal
}) => {
  const profile = state.dynastyProfile || {
    dynastyName: `${state.character.lastName} Dynasty`,
    motto: 'Perseverance, Legacy, Dominion',
    founderName: `${state.character.firstName} ${state.character.lastName}`,
    currentGeneration: state.dynastyGeneration,
    foundedYear: state.character.birthYear + 18,
    dynastyWealth: calculateNetWorth(state),
    dynastyReputation: state.character.attributes.reputation,
    dynastyStability: 85,
    dynastyCompaniesCount: state.companies.length,
    dynastyPropertiesCount: state.finances.properties.length,
    politicalInfluenceScore: state.character.attributes.worldInfluence,
    majorAchievements: ['Established the Founding Family Line'],
    majorFailures: []
  };

  const netWorth = calculateNetWorth(state);
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const primaryHeir = children.find(c => c.id === state.dynastyHeirId) || children[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dynasty Heraldic Header */}
      <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 p-6 rounded-3xl border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-zinc-950 flex items-center justify-center shadow-xl border border-amber-300 shrink-0">
              <Crown className="w-9 h-9" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Generation {profile.currentGeneration}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">
                  Founded by {profile.founderName} ({profile.foundedYear})
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 font-serif">
                The {profile.dynastyName}
              </h2>
              <p className="text-xs text-amber-400/90 italic mt-0.5 font-medium">
                "{profile.motto || 'Perseverance, Legacy, Dominion'}"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenLegacyReport}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 shadow-md transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Live Legacy Report</span>
            </button>

            <button
              onClick={onOpenSuccessionModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-zinc-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5"
            >
              <Crown className="w-4 h-4" />
              <span>Succession Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Core Dynastic Vitals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-400" /> Dynasty Estate
          </span>
          <div className="text-lg font-black text-emerald-400 font-mono mt-1">
            ${(profile?.dynastyWealth ?? netWorth ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500">Total Family Assets</span>
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" /> Stability Index
          </span>
          <div className="text-lg font-black text-cyan-300 font-mono mt-1">
            {profile.dynastyStability || 85}%
          </div>
          <span className="text-[10px] text-zinc-500">Succession Preparedness</span>
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" /> House Prestige
          </span>
          <div className="text-lg font-black text-amber-300 font-mono mt-1">
            {profile.dynastyReputation || 75}/100
          </div>
          <span className="text-[10px] text-zinc-500">Public Stature</span>
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-indigo-400" /> Enterprises
          </span>
          <div className="text-lg font-black text-indigo-300 font-mono mt-1">
            {state.companies.length} Corporations
          </div>
          <span className="text-[10px] text-zinc-500">Controlled Holdings</span>
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Landmark className="w-3 h-3 text-rose-400" /> Political Sway
          </span>
          <div className="text-lg font-black text-rose-300 font-mono mt-1">
            {profile.politicalInfluenceScore || 50} pts
          </div>
          <span className="text-[10px] text-zinc-500">Civic Clout</span>
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-violet-400" /> Direct Heirs
          </span>
          <div className="text-lg font-black text-violet-300 font-mono mt-1">
            {children.length} Descendants
          </div>
          <span className="text-[10px] text-zinc-500">
            {primaryHeir ? `Heir: ${primaryHeir.name.split(' ')[0]}` : 'Unassigned'}
          </span>
        </div>
      </div>

      {/* Major Achievements & Failures Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crown Achievements */}
        <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Dynastic Achievements ({profile.majorAchievements?.length || 0})
            </span>
            <span className="text-[10px] text-zinc-500">Permanent Record</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {profile.majorAchievements && profile.majorAchievements.length > 0 ? (
              profile.majorAchievements.map((ach, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-2 text-xs">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span className="text-zinc-200 font-medium">{ach}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 italic p-3 text-center">
                Establishing foundational family legacy...
              </div>
            )}
          </div>
        </div>

        {/* Notable Failures & Scars */}
        <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Dynastic Scars & Crises ({profile.majorFailures?.length || 0})
            </span>
            <span className="text-[10px] text-zinc-500">Cautionary Lore</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {profile.majorFailures && profile.majorFailures.length > 0 ? (
              profile.majorFailures.map((fail, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-2 text-xs">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span className="text-zinc-200 font-medium">{fail}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-emerald-400/80 italic p-3 text-center">
                No major dynastic bankruptcies or crises recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
