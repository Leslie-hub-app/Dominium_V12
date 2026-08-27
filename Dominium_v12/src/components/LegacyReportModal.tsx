import React, { useState } from 'react';
import { GameState, LegacyReport } from '../types';
import { 
  Crown, 
  Award, 
  TrendingUp, 
  Building2, 
  Landmark, 
  Users, 
  Heart, 
  HeartHandshake, 
  DollarSign, 
  ShieldCheck, 
  X, 
  Sparkles, 
  FileText, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { generateLegacyReport, calculateNetWorth } from '../engine/simulationEngine';

interface LegacyReportModalProps {
  state: GameState;
  report?: LegacyReport | null;
  onClose: () => void;
  onInitiateSuccession?: () => void;
}

export const LegacyReportModal: React.FC<LegacyReportModalProps> = ({
  state,
  report: customReport,
  onClose,
  onInitiateSuccession
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'business' | 'political' | 'family' | 'decisions'>('overview');
  
  const report: LegacyReport = customReport || state.activeLegacyReport || generateLegacyReport(state);
  const { scores } = report;
  const majorAchievements = report.majorAchievements || [];
  const majorFailures = report.majorFailures || [];
  const landmarkDeals = report.businessLegacy?.landmarkDeals || [];
  const majorDecisions = report.majorDecisions || [];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S+': return 'from-amber-300 via-yellow-400 to-amber-500 text-amber-950 border-amber-300';
      case 'S': return 'from-amber-400 to-yellow-500 text-amber-950 border-amber-400';
      case 'A': return 'from-emerald-400 to-teal-500 text-teal-950 border-emerald-400';
      case 'B': return 'from-cyan-400 to-blue-500 text-cyan-950 border-cyan-400';
      case 'C': return 'from-violet-400 to-purple-500 text-purple-950 border-violet-400';
      default: return 'from-zinc-400 to-zinc-600 text-zinc-950 border-zinc-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#121215] border border-zinc-800/90 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 p-5 sm:p-6 border-b border-zinc-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${getGradeColor(scores.legacyGrade)} font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border`}>
              {scores.legacyGrade}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Generation {report.generation} Sovereign Legacy
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {report.birthYear} — {report.deathYear} (Age {report.ageAtDeath})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-100 font-serif mt-1">
                {report.characterName}
              </h2>
              <div className="text-xs font-semibold text-amber-400/90 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Epitaph: "{scores.legacyTitle}"</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 border border-zinc-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-5 flex items-center gap-2 overflow-x-auto scrollbar-none py-2 text-xs">
          {[
            { key: 'overview', label: 'Legacy Scorecard', icon: <Award className="w-3.5 h-3.5" /> },
            { key: 'financial', label: 'Financial Legacy', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { key: 'business', label: 'Corporate Empire', icon: <Building2 className="w-3.5 h-3.5" /> },
            { key: 'political', label: 'Political Stature', icon: <Landmark className="w-3.5 h-3.5" /> },
            { key: 'family', label: 'Family & Dynasty', icon: <Users className="w-3.5 h-3.5" /> },
            { key: 'decisions', label: 'Major Deeds', icon: <FileText className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-zinc-300">
          {/* TAB 1: OVERVIEW & SCORECARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Life Summary Quote */}
              <div className="bg-zinc-950/80 p-4 sm:p-5 rounded-2xl border border-zinc-800/80 relative">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  Historical Chronicle
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                  "{report.lifeSummary}"
                </p>
              </div>

              {/* Total Score Banner */}
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 p-5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    Composite Multi-Factor Valuation
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-zinc-100 font-mono">
                      {scores.totalLegacyScore}
                    </span>
                    <span className="text-xs font-bold text-zinc-400">/ 1,000 Total Legacy Points</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-md">
                    Calculated holistically across wealth, corporate scale, household harmony, public goodwill, longevity, and statecraft.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Final Net Worth</div>
                    <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                      ${(report.financialLegacy?.finalNetWorth || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right border-l border-zinc-800 pl-3">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Peak Net Worth</div>
                    <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                      ${(report.financialLegacy?.peakNetWorth || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 9-Factor Legacy Score Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Scorecard Dimensions (0 - 100)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Dynasty Wealth', score: scores.wealthScore, color: 'bg-emerald-500', text: 'text-emerald-400' },
                    { label: 'Corporate Scale', score: scores.businessScore, color: 'bg-cyan-500', text: 'text-cyan-400' },
                    { label: 'Family & Heir Line', score: scores.familyScore, color: 'bg-rose-500', text: 'text-rose-400' },
                    { label: 'Health & Longevity', score: scores.healthScore, color: 'bg-teal-500', text: 'text-teal-400' },
                    { label: 'Reputation & Goodwill', score: scores.reputationScore, color: 'bg-amber-500', text: 'text-amber-400' },
                    { label: 'Political Stature', score: scores.politicsScore, color: 'bg-indigo-500', text: 'text-indigo-400' },
                    { label: 'Philanthropy & Patronage', score: scores.philanthropyScore, color: 'bg-fuchsia-500', text: 'text-fuchsia-400' },
                    { label: 'Landmark Feats', score: scores.achievementsScore, color: 'bg-yellow-500', text: 'text-yellow-400' },
                    { label: 'Dynasty Stability', score: scores.stabilityScore, color: 'bg-violet-500', text: 'text-violet-400' },
                  ].map((dim, idx) => (
                    <div key={idx} className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-300">{dim.label}</span>
                        <span className={`font-mono font-bold ${dim.text}`}>{dim.score}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${dim.color} rounded-full transition-all duration-500`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Major Achievements & Failures Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800 space-y-2.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Crown Achievements ({majorAchievements.length})
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    {majorAchievements.length > 0 ? (
                      majorAchievements.slice(0, 5).map((ach, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-zinc-300">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{ach}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-zinc-500 italic">No formal achievements logged.</li>
                    )}
                  </ul>
                </div>

                <div className="bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800 space-y-2.5">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400" /> Notable Crises & Failures ({majorFailures.length})
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    {majorFailures.length > 0 ? (
                      majorFailures.map((fail, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-zinc-300">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{fail}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-emerald-400/80 italic">Unblemished record with zero fatal collapses.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL LEGACY */}
          {activeTab === 'financial' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Financial Legacy Assessment
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {report.financialLegacy.commentary}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Peak Estate Value</div>
                  <div className="text-lg font-black text-amber-300 font-mono mt-1">
                    ${(report.financialLegacy?.peakNetWorth || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Final Net Worth</div>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                    ${(report.financialLegacy?.finalNetWorth || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Cash Passed On</div>
                  <div className="text-lg font-black text-cyan-300 font-mono mt-1">
                    ${(report.financialLegacy?.cashPassedOn || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Philanthropic Giving</div>
                  <div className="text-lg font-black text-fuchsia-300 font-mono mt-1">
                    ${(report.financialLegacy?.lifetimePhilanthropy || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUSINESS LEGACY */}
          {activeTab === 'business' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Corporate Holdings & Enterprise Scale
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {report.businessLegacy.commentary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Companies Founded/Led</div>
                  <div className="text-xl font-black text-zinc-100 font-mono mt-1">
                    {report.businessLegacy.companiesFoundedOrLed} Entities
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Combined Enterprise Value</div>
                  <div className="text-xl font-black text-cyan-300 font-mono mt-1">
                    ${(report.businessLegacy?.totalCompanyValuation || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Workforce Commanded</div>
                  <div className="text-xl font-black text-amber-300 font-mono mt-1">
                    {(report.businessLegacy?.peakEmployees || 0).toLocaleString()} Staff
                  </div>
                </div>
              </div>

              {landmarkDeals.length > 0 && (
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Landmark Corporate Assets
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {landmarkDeals.map((deal, idx) => (
                      <div key={idx} className="px-3 py-2 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200">
                        {deal}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: POLITICAL LEGACY */}
          {activeTab === 'political' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  Statecraft & Public Governance
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {report.politicalLegacy.commentary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Highest Office Held</div>
                  <div className="text-sm font-black text-zinc-100 mt-1">
                    {report.politicalLegacy.highestOfficeHeld}
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Peak Political Capital</div>
                  <div className="text-sm font-black text-indigo-300 font-mono mt-1">
                    {report.politicalLegacy.politicalCapitalAtPeak} pts
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Party Patronage</div>
                  <div className="text-sm font-black text-amber-300 mt-1">
                    {report.politicalLegacy.partyInfluence}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAMILY & DYNASTY */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                  Dynastic Harmony & Bloodline Lineage
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {report.familyLegacy.commentary}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Spouse / Partner</div>
                  <div className="text-sm font-black text-zinc-100 mt-1">
                    {report.familyLegacy.spouseName || 'Unmarried'}
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Children Raised</div>
                  <div className="text-sm font-black text-rose-300 font-mono mt-1">
                    {report.familyLegacy.childrenCount}
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Household Harmony</div>
                  <div className="text-sm font-black text-emerald-400 font-mono mt-1">
                    {report.familyLegacy.householdHarmony}%
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase">Appointed Heir</div>
                  <div className="text-sm font-black text-amber-300 mt-1">
                    {report.familyLegacy.heirAppointedName}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MAJOR DECISIONS */}
          {activeTab === 'decisions' && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Historic Strategic Decisions Recorded
              </span>
              {majorDecisions.length > 0 ? (
                <div className="space-y-2">
                  {majorDecisions.map((dec, i) => (
                    <div key={i} className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                            {dec.category}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">Year {dec.year}</span>
                        </div>
                        <h4 className="font-bold text-sm text-zinc-100 mt-1">{dec.title}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{dec.outcome}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-400 px-2 py-1 bg-zinc-950 rounded border border-zinc-800 shrink-0">
                        {dec.importance}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-950 p-6 rounded-2xl text-center text-xs text-zinc-500 border border-zinc-800">
                  No major historic decisions registered yet in current timeline.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-900/80 p-4 sm:p-5 border-t border-zinc-800 flex items-center justify-between gap-4">
          <div className="text-xs text-zinc-400">
            Dynasty Chronicle • Generation {report.generation}
          </div>

          <div className="flex items-center gap-2">
            {onInitiateSuccession && (
              <button
                onClick={onInitiateSuccession}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-zinc-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Execute Succession</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-all"
            >
              Close Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
