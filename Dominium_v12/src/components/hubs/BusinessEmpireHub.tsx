import React, { useState } from 'react';
import { GameState, Company, Executive } from '../../types';
import { 
  Building2, 
  Plus, 
  Users, 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  Briefcase, 
  Scale, 
  Megaphone, 
  Cpu, 
  Layers, 
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Network
} from 'lucide-react';
import { ExpandedCorporateSection } from '../expansion2/ExpandedCorporateSection';
import { CorporateBoardMeetingView } from '../expansion2/CorporateBoardMeetingView';
import { CorporateBoardMeetingAgenda } from '../../types';
import { CorporateCommandCenterView } from '../expansion2/CorporateCommandCenterView';

interface BusinessEmpireHubProps {
  state: GameState;
  onCreateCompany: (companyData: { name: string; industry: string; initialCapital: number; pricingStrategy: any; supplierType: any }) => void;
  onUpdateCompanyStrategy: (companyId: string, updates: Partial<Company>) => void;
  onHireExecutive: (companyId: string, role: any, candidateName: string, salary: number) => void;
  onFireExecutive: (companyId: string, execId: string) => void;
  onHoldBoardMeeting: (companyId: string, agenda: CorporateBoardMeetingAgenda, proposal: string, vote: 'FOR'|'AGAINST'|'ABSTAIN') => void;
  onStartBoardroom: (companyId: string, agenda: CorporateBoardMeetingAgenda, proposal: string) => void;
  onBoardroomReport: (sessionId: string, role: string, report?: string) => void;
  onBoardroomDebate: (sessionId: string, position: 'FOR'|'AGAINST'|'NEUTRAL', argument: string) => void;
  onBoardroomAmend: (sessionId: string, text: string) => void;
  onBoardroomPressure: (sessionId: string, holderId: string, demand: string, response: 'ADDRESSED'|'IGNORED'|'CONCESSION') => void;
  onBoardroomVote: (sessionId: string, vote: 'FOR'|'AGAINST'|'ABSTAIN') => void;
  onBoardroomAdvance: (sessionId: string) => void;
  onLaunchIPO: (companyId: string) => void;
}

export const BusinessEmpireHub: React.FC<BusinessEmpireHubProps> = ({
  state,
  onCreateCompany,
  onUpdateCompanyStrategy,
  onHireExecutive,
  onFireExecutive,
  onHoldBoardMeeting,
  onStartBoardroom,
  onBoardroomReport,
  onBoardroomDebate,
  onBoardroomAmend,
  onBoardroomPressure,
  onBoardroomVote,
  onBoardroomAdvance,
  onLaunchIPO
}) => {
  const companies = state.companies.filter(c => (c.playerOwnershipPercentage || 0) > 0);
  const { finances } = state;
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(companies[0]?.id || null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newCompanyName, setNewCompanyName] = useState<string>('');
  const [newIndustry, setNewIndustry] = useState<string>('Technology & AI');
  const [initialCapital, setInitialCapital] = useState<number>(50000);
  const [selectedExecTab, setSelectedExecTab] = useState<'overview' | 'operations' | 'executives' | 'board' | 'mna' | 'command'>('overview');

  const selectedCompany = companies?.find(c => c.id === selectedCompanyId) || companies?.[0];

  const totalEmpireValuation = companies?.reduce((acc, c) => acc + (((c.valuation || 0) * (c.playerOwnershipPercentage || 0)) / 100), 0) || 0;
  const totalEmpireRevenue = companies?.reduce((acc, c) => acc + (c.monthlyRevenue || 0), 0) || 0;
  const totalEmpireProfit = companies?.reduce((acc, c) => acc + (c.monthlyNetProfit || 0), 0) || 0;
  const totalEmpireEmployees = companies?.reduce((acc, c) => acc + (c.employeesCount || 0), 0) || 0;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName) return;
    onCreateCompany({
      name: newCompanyName,
      industry: newIndustry,
      initialCapital,
      pricingStrategy: 'Competitive',
      supplierType: 'International Low-Cost'
    });
    setNewCompanyName('');
    setIsCreatingNew(false);
  };

  return (
    <div className="space-y-4">
      {/* Empire Dashboard Summary Header */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Corporate Empire Command
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-100 mt-0.5">
              {companies.length} Active Enterprise{companies.length === 1 ? '' : 's'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(true)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-100 border border-zinc-700 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Incorporate New Company</span>
            </button>
          </div>
        </div>

        {/* Aggregate Empire Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Equity Valuation</span>
            <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5">${totalEmpireValuation.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Empire Revenue</span>
            <div className="text-sm sm:text-base font-black text-zinc-200 mt-0.5">${totalEmpireRevenue.toLocaleString()}/mo</div>
          </div>
          <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Net Profit</span>
            <div className={`text-sm sm:text-base font-black mt-0.5 ${totalEmpireProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalEmpireProfit >= 0 ? `+$${totalEmpireProfit.toLocaleString()}` : `-$${Math.abs(totalEmpireProfit).toLocaleString()}`}
            </div>
          </div>
          <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Workforce</span>
            <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">{totalEmpireEmployees.toLocaleString()} staff</div>
          </div>
        </div>
      </div>

      {/* CREATE NEW COMPANY MODAL */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleCreateSubmit} className="bg-zinc-900 border border-zinc-750 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-base text-zinc-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Register Commercial Entity
              </h3>
              <button 
                type="button" 
                onClick={() => setIsCreatingNew(false)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[10px] mb-1">Company Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Quantum Dynamics"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded-xl text-zinc-100 font-medium focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[10px] mb-1">Industry Sector</label>
                <select
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded-xl text-zinc-100 font-medium focus:border-amber-500/60 focus:outline-none"
                >
                  <option value="Technology & AI">Technology & AI</option>
                  <option value="Finance & FinTech">Finance & FinTech</option>
                  <option value="Biopharma & Healthcare">Biopharma & Healthcare</option>
                  <option value="Renewable Energy">Renewable Energy</option>
                  <option value="Manufacturing & Robotics">Manufacturing & Robotics</option>
                  <option value="Consumer Retail & Logistics">Consumer Retail & Logistics</option>
                  <option value="Luxury Hospitality & Resorts">Luxury Hospitality & Resorts</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[10px] mb-1">Initial Founder Capital Allocation</label>
                <input
                  type="number"
                  min="5000"
                  max={finances.cash}
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded-xl text-zinc-100 font-medium focus:border-amber-500/60 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Available Liquid Cash: ${finances.cash.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs border border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={finances.cash < initialCapital || !newCompanyName}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-bold text-xs shadow-md transition-all"
              >
                Incorporate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COMPANY DETAIL & COMMAND CENTRE */}
      {companies.length === 0 ? (
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center text-xs text-zinc-400 space-y-3">
          <Building2 className="w-8 h-8 text-zinc-600 mx-auto" />
          <p>You do not currently own any business corporations. Start a new venture to build your corporate empire.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Company Selector Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {companies.map(comp => (
              <button
                key={comp.id}
                onClick={() => setSelectedCompanyId(comp.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCompany.id === comp.id
                    ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>{comp.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                  comp.monthlyNetProfit >= 0 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}>
                  {comp.monthlyNetProfit >= 0 ? '+$' : '-$'}{Math.abs(Math.round(comp.monthlyNetProfit / 1000))}k/mo
                </span>
              </button>
            ))}
          </div>

          {/* Selected Company Command Centre */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
            {/* Header: Share price, Valuation, Net profit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-black text-zinc-100">{selectedCompany.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700">
                    {selectedCompany.industry}
                  </span>
                  {selectedCompany.isPublic && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      NASDAQ Listed
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Ownership: <b className="text-emerald-400">{selectedCompany.playerOwnershipPercentage}%</b> • Headquarters: {selectedCompany.city}, {selectedCompany.country}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Valuation</span>
                  <div className="text-base sm:text-lg font-black text-amber-400">${(selectedCompany.valuation || 0).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Share Price</span>
                  <div className="text-base sm:text-lg font-black text-zinc-100">${(selectedCompany.sharePrice || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Sub navigation inside Company */}
            <div className="flex items-center gap-1.5 text-xs border-b border-zinc-800 pb-2 overflow-x-auto">
              {[
                { key: 'command', label: 'Command Center' },
                { key: 'overview', label: 'Financials & P&L' },
                { key: 'operations', label: 'Operations & Strategy' },
                { key: 'executives', label: `C-Suite (${selectedCompany.executives?.length || 0})` },
                { key: 'board', label: `Board & Governance (${selectedCompany.boardMembers?.length || 0})` },
                { key: 'mna', label: 'M&A & Executive Talent Pipeline' },
              ].map(sub => (
                <button
                  key={sub.key}
                  onClick={() => setSelectedExecTab(sub.key as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                    selectedExecTab === sub.key
                      ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub-tab 1: Financials & P&L */}
            {selectedExecTab === 'command' && <CorporateCommandCenterView state={state} />}
            {selectedExecTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Gross Revenue</span>
                    <div className="text-sm font-black text-zinc-100 mt-0.5">${(selectedCompany.monthlyRevenue || 0).toLocaleString()}/mo</div>
                  </div>
                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Operating Costs</span>
                    <div className="text-sm font-black text-rose-400 mt-0.5">${(selectedCompany.monthlyExpenses || 0).toLocaleString()}/mo</div>
                  </div>
                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Net Income</span>
                    <div className={`text-sm font-black mt-0.5 ${(selectedCompany.monthlyNetProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${(selectedCompany.monthlyNetProfit || 0).toLocaleString()}/mo
                    </div>
                  </div>
                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Cash Vault</span>
                    <div className="text-sm font-black text-amber-300 mt-0.5">${(selectedCompany.cashReserve || 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* IPO / Dividend Actions */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-zinc-800">
                  {!selectedCompany.isPublic && (
                    <button
                      onClick={() => onLaunchIPO(selectedCompany.id)}
                      disabled={selectedCompany.valuation < 10000000}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black text-xs shadow transition-all"
                    >
                      🚀 Take Public / Initial Public Offering (IPO)
                    </button>
                  )}

                  <div className="flex items-center gap-2 text-xs bg-zinc-950/70 px-3.5 py-2 rounded-xl border border-zinc-800">
                    <span className="text-zinc-400 font-medium">Dividend Payout Ratio:</span>
                    <select
                      value={selectedCompany.dividendPayoutRatio}
                      onChange={(e) => onUpdateCompanyStrategy(selectedCompany.id, { dividendPayoutRatio: Number(e.target.value) })}
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-200 text-xs focus:outline-none"
                    >
                      <option value={0}>0% (Reinvest All Capital)</option>
                      <option value={0.25}>25% Payout</option>
                      <option value={0.50}>50% Payout</option>
                      <option value={0.75}>75% Payout</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Operations & Strategy */}
            {selectedExecTab === 'operations' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                    <span className="font-bold text-zinc-300">Pricing Strategy</span>
                    <select
                      value={selectedCompany.pricingStrategy}
                      onChange={(e) => onUpdateCompanyStrategy(selectedCompany.id, { pricingStrategy: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-200 focus:outline-none"
                    >
                      <option value="Discount">Discount (High Volume)</option>
                      <option value="Competitive">Competitive (Balanced)</option>
                      <option value="Premium Luxury">Premium Luxury (High Margin)</option>
                    </select>
                  </div>

                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                    <span className="font-bold text-zinc-300">Supply Chain Partner</span>
                    <select
                      value={selectedCompany.supplierType}
                      onChange={(e) => {
                        const factor = e.target.value === 'Premium Quality' ? 1.3 : (e.target.value === 'Local' ? 1.1 : 0.85);
                        onUpdateCompanyStrategy(selectedCompany.id, { supplierType: e.target.value as any, supplierCostFactor: factor });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-200 focus:outline-none"
                    >
                      <option value="International Low-Cost">International Low-Cost (Higher Margin)</option>
                      <option value="Local">Domestic Certified (Reliable)</option>
                      <option value="Premium Quality">Premium Quality Tier (+Quality)</option>
                    </select>
                  </div>

                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                    <span className="font-bold text-zinc-300">Monthly Marketing Budget</span>
                    <input
                      type="number"
                      step="1000"
                      value={selectedCompany.marketingBudgetMonthly}
                      onChange={(e) => onUpdateCompanyStrategy(selectedCompany.id, { marketingBudgetMonthly: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Executives (C-Suite) */}
            {selectedExecTab === 'executives' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">C-Suite Executive Management</h5>
                  <button
                    onClick={() => onHireExecutive(selectedCompany.id, 'CFO', 'Alexander Vance', 15000)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-bold text-xs shadow-sm transition-all"
                  >
                    + Appoint Executive
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCompany.executives.map(exec => (
                    <div key={exec.id} className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-zinc-100">{exec.name}</div>
                          <span className="text-[10px] font-bold text-amber-400">{exec.role} ({exec.personality})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Salary:</span>{' '}
                          <b className="text-emerald-400 text-xs">${exec.salaryMonthly.toLocaleString()}/mo</b>
                        </div>
                      </div>

                      {exec.aiOpinion && (
                        <p className="text-[11px] text-zinc-300 bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800 italic leading-relaxed">
                          "{exec.aiOpinion}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-zinc-850">
                        <span className="text-zinc-400">Competence: <b className="text-zinc-200">{exec.competence}%</b></span>
                        <span className="text-zinc-400">Loyalty: <b className="text-emerald-400">{exec.loyalty}%</b></span>
                        <button
                          onClick={() => onFireExecutive(selectedCompany.id, exec.id)}
                          className="text-rose-400 hover:text-rose-300 font-bold transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 4: Live Boardroom */}
            {selectedExecTab === 'board' && (
              <CorporateBoardMeetingView
                state={state}
                company={selectedCompany}
                onStart={onStartBoardroom}
                onReport={onBoardroomReport}
                onDebate={onBoardroomDebate}
                onAmend={onBoardroomAmend}
                onPressure={onBoardroomPressure}
                onVote={onBoardroomVote}
                onAdvance={onBoardroomAdvance}
              />
            )}

            {/* Sub-tab 5: M&A Pipeline & Executive Talent */}
            {selectedExecTab === 'mna' && (
              <ExpandedCorporateSection state={state} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
