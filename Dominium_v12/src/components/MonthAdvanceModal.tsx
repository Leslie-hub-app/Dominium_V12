import React, { useState } from 'react';
import { GameState, LifeEvent, NewsItem, SimulationDiff, SimulationSnapshot, MetricTransition, PendingDecision } from '../types';
import { 
  FastForward, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign, 
  Building2, 
  Briefcase, 
  User, 
  Heart, 
  Users, 
  Landmark, 
  Globe2, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Layers, 
  BarChart3,
  Calendar,
  Vote
} from 'lucide-react';

interface MonthAdvanceModalProps {
  isOpen: boolean;
  state: GameState;
  events: LifeEvent[];
  news: NewsItem[];
  diff?: SimulationDiff;
  snapshotBefore?: SimulationSnapshot;
  snapshotAfter?: SimulationSnapshot;
  onClose: () => void;
  onOpenDecisionInbox?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type ReportTab = 'all' | 'finance' | 'business' | 'personal' | 'intel';

export const MonthAdvanceModal: React.FC<MonthAdvanceModalProps> = ({
  isOpen,
  state,
  events,
  news,
  diff: propDiff,
  snapshotBefore,
  snapshotAfter,
  onClose,
  onOpenDecisionInbox
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('all');

  if (!isOpen) return null;

  // Consume authoritative SimulationDiff from advanceOneMonth
  const diff = propDiff;

  if (!diff) {
    console.error('MonthAdvanceModal received no SimulationDiff');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in">
        <div className="bg-[#111114] border border-rose-800/80 w-full max-w-md rounded-2xl p-6 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-700/50 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100">Simulation Diff Unavailable</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The authoritative SimulationDiff was not provided by the simulation engine. Please advance a month to generate a valid report.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl font-bold text-xs transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return '$0';
    const sign = val < 0 ? '-' : '';
    const abs = Math.abs(Math.round(val));
    return `${sign}$${abs.toLocaleString()}`;
  };

  const renderDeltaBadge = (transition: MetricTransition | undefined, invertColors = false) => {
    if (!transition) return null;
    const change = transition.change ?? 0;
    const isPositive = change > 0;
    const isNeutral = change === 0;

    let badgeClass = 'text-zinc-400 bg-zinc-800/80 border-zinc-700/60';
    if (!isNeutral) {
      if (invertColors) {
        badgeClass = isPositive 
          ? 'text-rose-400 bg-rose-950/40 border-rose-800/50' 
          : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
      } else {
        badgeClass = isPositive 
          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50' 
          : 'text-rose-400 bg-rose-950/40 border-rose-800/50';
      }
    }

    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
        {isNeutral ? (
          <Minus className="w-3 h-3" />
        ) : isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>{transition.formattedChange || (change > 0 ? `+${change}` : `${change}`)}</span>
        {transition.percentChange !== undefined && transition.percentChange !== 0 && (
          <span className="text-[10px] opacity-80">({transition.percentChange > 0 ? '+' : ''}{transition.percentChange}%)</span>
        )}
      </span>
    );
  };

  const renderTransitionRow = (
    label: string, 
    transition: MetricTransition | undefined, 
    invertColors = false,
    subtitle?: string
  ) => {
    if (!transition) return null;
    const prevText = transition.formattedPrevious || (transition.previous !== undefined && transition.previous !== null ? transition.previous.toLocaleString() : '0');
    const currText = transition.formattedCurrent || (transition.current !== undefined && transition.current !== null ? transition.current.toLocaleString() : '0');

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 gap-2 hover:border-zinc-700/60 transition-colors">
        <div>
          <span className="text-xs font-bold text-zinc-300">{label}</span>
          {subtitle && <p className="text-[10px] text-zinc-400 font-normal">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
          <span className="font-mono text-zinc-400 text-[11px] sm:text-xs">
            {prevText}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span className="font-mono font-bold text-zinc-100 text-[11px] sm:text-xs">
            {currText}
          </span>
          {renderDeltaBadge(transition, invertColors)}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111114] border border-zinc-700/80 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  Simulation Report
                </span>
                <span className="text-xs text-zinc-400 font-medium">Tick #{state.simulationTick}</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-zinc-100 tracking-tight mt-0.5">
                {MONTH_NAMES[state.currentMonth - 1]} {state.currentYear} • Age {state.character.age}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            <div className="bg-zinc-950/70 px-3 py-1.5 rounded-xl border border-zinc-800 text-right">
              <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Net Worth</div>
              <div className="text-xs sm:text-sm font-mono font-black text-amber-300 flex items-center justify-end gap-1.5">
                <span>{diff.netWorthTransition.formattedCurrent}</span>
                {renderDeltaBadge(diff.netWorthTransition)}
              </div>
            </div>

            <div className="bg-zinc-950/70 px-3 py-1.5 rounded-xl border border-zinc-800 text-right">
              <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Liquid Cash</div>
              <div className="text-xs sm:text-sm font-mono font-black text-emerald-400 flex items-center justify-end gap-1.5">
                <span>{diff.cashTransition.formattedCurrent}</span>
                {renderDeltaBadge(diff.cashTransition)}
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950/90 border-b border-zinc-800/80 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-zinc-100 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Report</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'finance'
                ? 'bg-zinc-100 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Finance & Investments</span>
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'business'
                ? 'bg-zinc-100 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Business & World</span>
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'personal'
                ? 'bg-zinc-100 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal & Family</span>
          </button>
          <button
            onClick={() => setActiveTab('intel')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'intel'
                ? 'bg-zinc-100 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Intel, Risks & Outlook</span>
            {diff.unresolvedDecisions.length > 0 && (
              <span className="bg-amber-500 text-zinc-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {diff.unresolvedDecisions.length}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-zinc-200">
          {/* 1. EXECUTIVE SUMMARY (Always visible or in 'all') */}
          <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-4 sm:p-5 relative overflow-hidden shadow-inner">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">Executive Summary</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
              {diff.executiveSummary}
            </p>
          </div>

          {/* 1.5 LIFE PROGRESSION TIER TRANSITION BANNER */}
          {diff.lifeProgressionTransition && (
            <div className={`p-4 rounded-xl border space-y-2 shadow-md ${
              diff.lifeProgressionTransition.isPromotion ? 'bg-gradient-to-r from-amber-950/60 to-zinc-900 border-amber-500/50' :
              diff.lifeProgressionTransition.isRegression ? 'bg-gradient-to-r from-rose-950/60 to-zinc-900 border-rose-500/50' :
              'bg-zinc-900 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">Life Progression Status Shift</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    diff.lifeProgressionTransition.isPromotion ? 'bg-amber-400 text-zinc-950 font-black' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {diff.lifeProgressionTransition.isPromotion ? 'TIER PROMOTION' : 'TIER REGRESSION'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {diff.lifeProgressionTransition.newTierDisplayName}
                </span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1">
                {diff.lifeProgressionTransition.changeReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 1.6 LIFE GAMEPLAY DIFF (Pressures, Responsibilities, Opportunities) */}
          {diff.lifeGameplayDiff && (
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-zinc-200 uppercase tracking-wider">Life Pressures & Strategic Momentum</span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Active Shifts: {diff.lifeGameplayDiff.pressureChanges.length}
                </span>
              </div>

              {diff.lifeGameplayDiff.pressureChanges.filter(p => p.trend === 'Escalating' || p.newIntensity > p.oldIntensity).length > 0 && (
                <div className="space-y-1">
                  {diff.lifeGameplayDiff.pressureChanges.filter(p => p.trend === 'Escalating' || p.newIntensity > p.oldIntensity).map((p, idx) => (
                    <div key={idx} className="text-xs text-rose-400 flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{p.type} Pressure escalated to {p.newIntensity}/100 (+{Math.max(0, p.newIntensity - p.oldIntensity)})</span>
                    </div>
                  ))}
                </div>
              )}

              {diff.lifeGameplayDiff.newOpportunities.length > 0 && (
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{diff.lifeGameplayDiff.newOpportunities.length} new life opportunity available in your Life Hub</span>
                </div>
              )}
            </div>
          )}

          {/* 2. FINANCE SECTION */}
          {(activeTab === 'all' || activeTab === 'finance') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Finance & Balance Sheet</span>
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">Previous → Current → Change</span>
              </div>

              <div className="space-y-2">
                {renderTransitionRow('Cash Balance', diff.cashTransition, false, 'Liquid reserves available for deployment')}
                {renderTransitionRow('Net Worth', diff.netWorthTransition, false, 'Total assets less outstanding debt liabilities')}
                {renderTransitionRow('Monthly Income', diff.incomeTransition, false, 'Salary, dividends, rental streams & returns')}
                {renderTransitionRow('Monthly Expenses', diff.expensesTransition, true, 'Base living costs, debt service & property upkeep')}
                {renderTransitionRow('Total Outstanding Debt', diff.debtTransition, true, 'Active commercial loans & mortgage obligations')}
              </div>
            </div>
          )}

          {/* 3. INVESTMENTS SECTION */}
          {(activeTab === 'all' || activeTab === 'finance') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Investments & Holdings</span>
                </h3>
              </div>

              {/* Stocks Breakdown */}
              <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Public Equities & Stock Portfolio</span>
                  <div className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-2">
                    <span>{diff.investments.stocks.totalValueTransition.formattedCurrent}</span>
                    {renderDeltaBadge(diff.investments.stocks.totalValueTransition)}
                  </div>
                </div>

                {diff.investments.stocks.items.length === 0 ? (
                  <div className="text-[11px] text-zinc-400 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/60">
                    No active public stock holdings.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {diff.investments.stocks.items.map(stk => (
                      <div key={stk.symbol} className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-zinc-200">{stk.symbol} <span className="font-normal text-zinc-400">({stk.name})</span></div>
                          <div className="text-[10px] text-zinc-400 font-mono">{(stk.shares || 0).toLocaleString()} shares @ ${(stk.price || 0).toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-zinc-100">${(stk.totalValue || 0).toLocaleString()}</div>
                          <div className={`text-[10px] font-mono ${(stk.priceChange || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(stk.priceChange || 0) >= 0 ? `+$${(stk.priceChange || 0).toFixed(2)}` : `-$${Math.abs(stk.priceChange || 0).toFixed(2)}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real Estate Breakdown */}
              <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Real Estate & Property Assets</span>
                  <div className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-2">
                    <span>{diff.investments.properties.totalValueTransition.formattedCurrent}</span>
                    {renderDeltaBadge(diff.investments.properties.totalValueTransition)}
                  </div>
                </div>

                {diff.investments.properties.items.length === 0 ? (
                  <div className="text-[11px] text-zinc-400 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/60">
                    No owned real estate properties.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {diff.investments.properties.items.map(prop => (
                      <div key={prop.id} className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-zinc-200">{prop.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">Rent: ${(prop.rent || 0).toLocaleString()}/mo</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-zinc-100">${(prop.value || 0).toLocaleString()}</div>
                          <div className={`text-[10px] font-mono ${(prop.valueChange || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(prop.valueChange || 0) >= 0 ? `+$${(prop.valueChange || 0).toLocaleString()}` : `-$${Math.abs(prop.valueChange || 0).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Investments (Sports & Projects) */}
              <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">Alternative Investments & Megaprojects</span>
                  <div className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-2">
                    <span>{diff.investments.otherInvestments.totalValueTransition.formattedCurrent}</span>
                    {renderDeltaBadge(diff.investments.otherInvestments.totalValueTransition)}
                  </div>
                </div>

                {diff.investments.otherInvestments.items.length === 0 ? (
                  <div className="text-[11px] text-zinc-400 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/60">
                    No sports franchises or active landmark infrastructure commitments.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {diff.investments.otherInvestments.items.map((oth, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-zinc-200">{oth.name}</div>
                          <div className="text-[10px] text-zinc-400">{oth.type}</div>
                        </div>
                        <div className="text-right font-mono font-bold text-zinc-100">
                          ${(oth.value || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. BUSINESS SECTION */}
          {(activeTab === 'all' || activeTab === 'business') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Corporate Empire Performance</span>
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">Previous → Current → Change</span>
              </div>

              <div className="space-y-2">
                {renderTransitionRow('Total Corporate Monthly Revenue', diff.business.revenueTransition, false, 'Aggregate monthly sales across all owned enterprises')}
                {renderTransitionRow('Total Corporate Monthly Net Profit', diff.business.profitTransition, false, 'Operating cash generation after costs and payroll')}
                {renderTransitionRow('Enterprise Equity Valuation', diff.business.valuationTransition, false, 'Market capitalization value of corporate portfolio')}
                {renderTransitionRow('Total Headcount & Employees', diff.business.employeesTransition, false, 'Aggregate full-time personnel across enterprises')}
              </div>

              {/* Major Company Changes */}
              <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-2">
                <span className="text-xs font-bold text-zinc-200">Major Company Operational Developments</span>
                {diff.business.majorCompanyChanges.length === 0 ? (
                  <p className="text-[11px] text-zinc-400">
                    Corporate operations continued on steady course without major restructuring or disruption.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {diff.business.majorCompanyChanges.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* 5. PERSONAL SECTION */}
          {(activeTab === 'all' || activeTab === 'personal') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-400" />
                  <span>Personal Wellness & Career</span>
                </h3>
              </div>

              <div className="space-y-2">
                {renderTransitionRow('Physical Health & Vitality', diff.personal.healthTransition, false, 'Cardiovascular health and physiological resilience')}
                {renderTransitionRow('Stress & Mental Load', diff.personal.stressTransition, true, 'Cognitive exhaustion and workload pressure')}
                {renderTransitionRow('Life Satisfaction & Happiness', diff.personal.happinessTransition, false, 'Personal contentment and emotional well-being')}
              </div>

              {/* Career Summary Card */}
              <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Career & Occupation</div>
                  <div className="text-sm font-bold text-zinc-100 mt-0.5">{diff.personal.career.title}</div>
                  {diff.personal.career.changeText && (
                    <div className="text-xs text-amber-400 mt-0.5">{diff.personal.career.changeText}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Base Salary</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    ${(diff.personal.career?.currentSalary || 0).toLocaleString()}/mo
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. FAMILY SECTION */}
          {(activeTab === 'all' || activeTab === 'personal') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>Family & Dynastic Lineage</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Marital & Children Status */}
                <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-2">
                  <span className="font-bold text-zinc-200">Marital & Dynastic Status</span>
                  <div className="text-zinc-300">
                    <p><span className="text-zinc-400">Marital State:</span> {diff.family.marriage}</p>
                    <p className="mt-1">
                      <span className="text-zinc-400">Children ({diff.family.children.length}):</span>{' '}
                      {diff.family.children.length > 0 ? diff.family.children.join(', ') : 'No direct offspring'}
                    </p>
                  </div>
                </div>

                {/* Relationship Changes */}
                <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-2">
                  <span className="font-bold text-zinc-200">Major Relationship Evolutions</span>
                  {diff.family.majorRelationshipChanges.length === 0 ? (
                    <p className="text-[11px] text-zinc-400">Family and social bonds held constant this cycle.</p>
                  ) : (
                    <ul className="space-y-1 text-zinc-300">
                      {diff.family.majorRelationshipChanges.map((rc, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-pink-400">•</span>
                          <span>{rc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Family Events */}
              {diff.family.familyEvents.length > 0 && (
                <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-3.5 text-xs space-y-1">
                  <span className="font-bold text-zinc-200">Family Milestones This Month</span>
                  {diff.family.familyEvents.map((fe, idx) => (
                    <p key={idx} className="text-zinc-300 text-[11px] leading-relaxed">{fe}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. POLITICS SECTION */}
          {(activeTab === 'all' || activeTab === 'personal') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Vote className="w-4 h-4 text-purple-400" />
                  <span>Politics & Governance</span>
                </h3>
              </div>

              <div className="space-y-2">
                <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-200">Current Office Status</span>
                    <p className="text-[10px] text-zinc-400">{diff.politics.inOffice ? 'Serving Active Term' : 'Private Citizen / Civic Contender'}</p>
                  </div>
                  <span className="font-bold text-purple-300 bg-purple-950/40 px-2.5 py-1 rounded border border-purple-800/40">
                    {diff.politics.office}
                  </span>
                </div>

                {renderTransitionRow('Public Approval Rating', diff.politics.approvalTransition, false, 'Voter & constituent satisfaction')}
                {renderTransitionRow('World Influence & Power Score', diff.politics.influenceTransition, false, 'Geopolitical standing and leverage')}
                {renderTransitionRow('Projected Polling Support', diff.politics.pollingTransition, false, 'Simulated electorate sentiment')}
              </div>
            </div>
          )}

          {/* 8. WORLD SECTION */}
          {(activeTab === 'all' || activeTab === 'business') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  <span>World Macro & Economic Climate ({diff.world.countryName})</span>
                </h3>
                <span className="text-[11px] text-cyan-300 font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                  {diff.world.businessCycle}
                </span>
              </div>

              <div className="space-y-2">
                {renderTransitionRow('GDP Annualized Growth Rate', diff.world.gdpTransition, false, 'National macroeconomic output trajectory')}
                {renderTransitionRow('Headline Inflation Rate', diff.world.inflationTransition, true, 'Consumer price index escalation')}
                {renderTransitionRow('Central Bank Benchmark Rate', diff.world.interestRateTransition, true, 'Base cost of borrowing and capital liquidity')}
              </div>

              <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-3 text-xs flex items-center justify-between">
                <span className="text-zinc-400">Market Environment:</span>
                <span className="font-bold text-zinc-200">{diff.world.economicClimate}</span>
              </div>
            </div>
          )}

          {/* 9. MAJOR EVENTS (Filtered to meaningful events) */}
          {(activeTab === 'all' || activeTab === 'intel') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Meaningful Events This Cycle ({diff.majorEvents.length})</span>
                </h3>
              </div>

              {diff.majorEvents.length === 0 ? (
                <div className="text-xs text-zinc-400 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/70">
                  No disruptive crises or major milestones occurred this cycle. Baseline activities proceeded smoothly.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {diff.majorEvents.map(ev => (
                    <div key={ev.id} className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-100">
                        <span>{ev.title}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold">{ev.category}</span>
                          {ev.severity && (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                              ev.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {ev.severity}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 font-normal leading-relaxed">{ev.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 10. UNRESOLVED DECISIONS */}
          {(activeTab === 'all' || activeTab === 'intel') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Unresolved Strategic Decisions ({diff.unresolvedDecisions.length})</span>
                </h3>
                {diff.unresolvedDecisions.length > 0 && onOpenDecisionInbox && (
                  <button
                    onClick={onOpenDecisionInbox}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
                  >
                    <span>Open Decision Inbox</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {diff.unresolvedDecisions.length === 0 ? (
                <div className="text-xs text-zinc-400 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/70">
                  Decision inbox is clear. No pending items require immediate action.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {diff.unresolvedDecisions.map(dec => (
                    <div key={dec.id} className="bg-zinc-900/90 p-3.5 rounded-xl border border-amber-900/40 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            dec.urgency === 'Critical' ? 'bg-rose-900 text-rose-100' :
                            dec.urgency === 'High' ? 'bg-amber-900 text-amber-100' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {dec.urgency}
                          </span>
                          <span className="font-bold text-zinc-100">{dec.title}</span>
                        </div>
                        {dec.expiresInMonths && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                            Expires in {dec.expiresInMonths} mo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-normal">{dec.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 11. OPPORTUNITIES */}
          {(activeTab === 'all' || activeTab === 'intel') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Newly Created Opportunities ({diff.opportunities.length})</span>
                </h3>
              </div>

              {diff.opportunities.length === 0 ? (
                <div className="text-xs text-zinc-400 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/70">
                  No special new opportunities surfaced this month. Maintain current ventures and review available markets.
                </div>
              ) : (
                <div className="space-y-2">
                  {diff.opportunities.map(op => (
                    <div key={op.id} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-200">
                        <span>{op.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 font-semibold">{op.category}</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">{op.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 12. RISKS */}
          {(activeTab === 'all' || activeTab === 'intel') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Newly Detected Risks ({diff.risks.length})</span>
                </h3>
              </div>

              {diff.risks.length === 0 ? (
                <div className="text-xs text-zinc-400 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/70">
                  No critical balance sheet vulnerabilities or acute personal risks detected.
                </div>
              ) : (
                <div className="space-y-2">
                  {diff.risks.map((risk, idx) => (
                    <div 
                      key={risk.id || idx} 
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        risk.severity === 'Critical' 
                          ? 'bg-rose-950/30 border-rose-800/60 text-rose-200' 
                          : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-zinc-100">{risk.title}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          risk.severity === 'Critical' ? 'bg-rose-900 text-rose-100' : 'bg-amber-900 text-amber-100'
                        }`}>
                          {risk.severity} Risk
                        </span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed font-normal">{risk.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 13. OUTLOOK */}
          {(activeTab === 'all' || activeTab === 'intel') && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Simulation Outlook & Priority Attention Items</span>
                </h3>
              </div>

              <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-4 space-y-2.5">
                <ul className="space-y-2 text-xs text-zinc-200">
                  {diff.outlook.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5 flex-shrink-0">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 font-medium text-center sm:text-left">
            Simulation advances by 1 calendar month upon continuation.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {diff.unresolvedDecisions.length > 0 && onOpenDecisionInbox && (
              <button
                onClick={onOpenDecisionInbox}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>Review Decisions ({diff.unresolvedDecisions.length})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-zinc-100 hover:bg-white active:scale-[0.99] font-black text-xs sm:text-sm text-zinc-950 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Acknowledge & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
